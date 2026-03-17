import { createSupabaseBrowserClient } from '@/lib/supabase';
import { AppError, type Expense, type NewExpense, toAppError } from './types';

function startOfTodayIso(): string {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

function endOfTodayIso(): string {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}

function startOfMonthIso(year: number, month: number): string {
  if (month < 1 || month > 12) {
    throw new AppError('VALIDATION_ERROR', 'Month must be between 1 and 12.');
  }

  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)).toISOString();
}

function endOfMonthIso(year: number, month: number): string {
  if (month < 1 || month > 12) {
    throw new AppError('VALIDATION_ERROR', 'Month must be between 1 and 12.');
  }

  return new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString();
}

function lastNDaysStartIso(days: number): string {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start.toISOString();
}

export async function logExpense(userId: string, expense: NewExpense): Promise<Expense> {
  try {
    const supabase = createSupabaseBrowserClient();

    const payload = {
      user_id: userId,
      amount: expense.amount,
      category: expense.category,
      description: expense.description ?? null,
      input_method: expense.input_method ?? 'manual',
    };

    const { data, error } = await supabase
      .from('expenses')
      .insert(payload)
      .select('id,user_id,amount,category,description,logged_at,input_method')
      .single();

    if (error) {
      throw toAppError(error, 'Failed to log expense.');
    }

    return data as Expense;
  } catch (error) {
    throw toAppError(error, 'Failed to log expense.');
  }
}

export async function getTodayExpenses(userId: string): Promise<Expense[]> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('expenses')
      .select('id,user_id,amount,category,description,logged_at,input_method')
      .eq('user_id', userId)
      .gte('logged_at', startOfTodayIso())
      .lte('logged_at', endOfTodayIso())
      .order('logged_at', { ascending: false });

    if (error) {
      throw toAppError(error, 'Failed to fetch today expenses.');
    }

    return (data ?? []) as Expense[];
  } catch (error) {
    throw toAppError(error, 'Failed to fetch today expenses.');
  }
}

export async function getMonthExpenses(userId: string, year: number, month: number): Promise<Expense[]> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('expenses')
      .select('id,user_id,amount,category,description,logged_at,input_method')
      .eq('user_id', userId)
      .gte('logged_at', startOfMonthIso(year, month))
      .lte('logged_at', endOfMonthIso(year, month))
      .order('logged_at', { ascending: false });

    if (error) {
      throw toAppError(error, 'Failed to fetch month expenses.');
    }

    return (data ?? []) as Expense[];
  } catch (error) {
    throw toAppError(error, 'Failed to fetch month expenses.');
  }
}

export async function getLast14DaysExpenses(userId: string): Promise<Expense[]> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('expenses')
      .select('id,user_id,amount,category,description,logged_at,input_method')
      .eq('user_id', userId)
      .gte('logged_at', lastNDaysStartIso(14))
      .lte('logged_at', endOfTodayIso())
      .order('logged_at', { ascending: false });

    if (error) {
      throw toAppError(error, 'Failed to fetch last 14 days expenses.');
    }

    return (data ?? []) as Expense[];
  } catch (error) {
    throw toAppError(error, 'Failed to fetch last 14 days expenses.');
  }
}

export async function deleteExpense(expenseId: string): Promise<void> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);

    if (error) {
      throw toAppError(error, 'Failed to delete expense.');
    }
  } catch (error) {
    throw toAppError(error, 'Failed to delete expense.');
  }
}
