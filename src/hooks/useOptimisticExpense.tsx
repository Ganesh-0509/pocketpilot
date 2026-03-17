/**
 * @fileOverview Optimistic Update Hook for Expense Logging
 * 
 * Implements optimistic UI updates: update local state immediately,
 * revert with error toast if Supabase fails.
 */

'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatUserError, isNetworkError, toAppError } from '@/lib/errors';
import { queueExpense } from '@/lib/offlineQueue';

// ============================================================================
// TYPES
// ============================================================================

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  note?: string;
  date: string;
  createdAt: string;
  pending?: boolean; // For pending local expenses
}

interface UseOptimisticExpenseOptions {
  onSuccess?: (expense: Expense) => void;
  onError?: (error: unknown) => void;
}

// ============================================================================
// HOOK: useOptimisticExpense
// ============================================================================

export function useOptimisticExpense(options?: UseOptimisticExpenseOptions) {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Log expense with optimistic update.
   * 
   * 1. Add pending expense to local state immediately
   * 2. Call Supabase insert
   * 3. If success: replace pending with real expense
   * 4. If failure: remove pending, show error toast, optionally queue for later
   */
  const logExpense = useCallback(
    async (
      expenseData: Omit<Expense, 'id' | 'createdAt' | 'pending'>
    ): Promise<Expense | null> => {
      try {
        setIsLoading(true);

        // Create optimistic expense with local ID
        const optimisticExpense: Expense = {
          ...expenseData,
          id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          pending: true,
        };

        // 1. Optimistically update local state
        setExpenses((prev) => [optimisticExpense, ...prev]);

        // Show success toast immediately
        toast({
          title: 'Expense logged',
          description: `₹${expenseData.amount} added to ${expenseData.category}`,
          duration: 2000,
        });

        // 2. Call Supabase API
        const response = await fetch('/api/expenses/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: expenseData.amount,
            category: expenseData.category,
            note: expenseData.note,
            date: expenseData.date,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const { data } = await response.json();

        // 3. Success: replace optimistic with real expense ID
        setExpenses((prev) =>
          prev.map((exp) =>
            exp.id === optimisticExpense.id
              ? { ...data, pending: false }
              : exp
          )
        );

        options?.onSuccess?.(data);
        return data;
      } catch (error) {
        // Handle error
        const appError = toAppError(error);
        const userMessage = formatUserError(appError);

        // 4. Failure: remove optimistic, show error toast
        setExpenses((prev) =>
          prev.filter((exp) => !exp.id.startsWith('pending_'))
        );

        // If network error, queue for later sync
        if (isNetworkError(error)) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Optimistic Update] Network error — queueing expense');
          }

          queueExpense({
            userId: expenseData.userId,
            amount: expenseData.amount,
            category: expenseData.category,
            note: expenseData.note,
            date: expenseData.date,
          });

          toast({
            title: 'Queued for sync',
            description: `₹${expenseData.amount} will sync when you're online`,
            variant: 'default',
            duration: 3000,
          });
        } else {
          // Generic error
          toast({
            title: 'Failed to log expense',
            description: userMessage,
            variant: 'destructive',
            duration: 4000,
          });
        }

        options?.onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast, options]
  );

  /**
   * Remove expense from local state (for UI undo).
   */
  const removeExpense = useCallback((expenseId: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== expenseId));
  }, []);

  /**
   * Add expenses to local state (for initial hydration).
   */
  const addExpenses = useCallback((newExpenses: Expense[]) => {
    setExpenses((prev) => [...newExpenses, ...prev]);
  }, []);

  /**
   * Clear local state.
   */
  const clear = useCallback(() => {
    setExpenses([]);
  }, []);

  return {
    expenses,
    isLoading,
    logExpense,
    removeExpense,
    addExpenses,
    clear,
  };
}

// ============================================================================
// COMPONENT: OptimisticExpenseList
// ============================================================================

export interface OptimisticExpenseListProps {
  expenses: Expense[];
  isLoading?: boolean;
  onRemove?: (expenseId: string) => void;
}

export function OptimisticExpenseList({
  expenses,
  isLoading = false,
  onRemove,
}: OptimisticExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No expenses yet. Start logging to track your spending.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className={`flex items-center justify-between p-3 border rounded-lg transition-opacity ${
            expense.pending
              ? 'bg-amber-50 border-amber-200 opacity-75'
              : 'bg-white border-gray-200'
          } ${isLoading ? 'opacity-50' : ''}`}
        >
          {/* Left */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900 line-clamp-1">
                {expense.category}
              </p>
              {expense.pending && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                  Pending
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {new Date(expense.date).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <p className="font-semibold text-red-600">
              −₹{expense.amount.toFixed(2)}
            </p>
            {expense.pending && onRemove && (
              <button
                onClick={() => onRemove(expense.id)}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium"
              >
                Undo
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
