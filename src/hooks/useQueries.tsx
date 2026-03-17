/**
 * @fileOverview React Query Custom Hooks
 * 
 * Data fetching hooks with proper cache invalidation and query key management.
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface StudentProfile {
  id: string;
  user_id: string;
  college_name: string;
  living_type: 'hostel' | 'day_scholar';
  monthly_income: number;
  internship_active: boolean;
  effective_income: number;
  semester_start_date: string;
  semester_end_date: string;
  created_at: string;
  updated_at: string;
}

export interface DailySummary {
  date: string;
  todaySpend: number;
  weekdayAverage: number;
  weekendAverage: number;
  weekendSpikeFactor: number | null;
  daysRemaining: number;
  remainingBudget: number;
  safeDailyLimit: number;
  isSurvivalMode: boolean;
  survivalSeverity: 'safe' | 'warning' | 'critical';
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  note?: string;
  date: string;
  created_at: string;
}

export interface Liability {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  created_at: string;
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastUpdated: string;
}

export interface BadgeEarned {
  badge_key: string;
  title: string;
  description: string;
  category: 'streak' | 'spending' | 'planning' | 'survival';
  awarded_at: string;
}

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

export const queryKeys = {
  profile: () => ['profile'],
  dailySummary: () => ['daily-summary'],
  expenses: () => ['expenses'],
  expensesByDate: (date: string) => ['expenses', 'by-date', date],
  liabilities: () => ['liabilities'],
  streak: () => ['streak'],
  badges: () => ['badges'],
} as const;

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, key);
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Fetch student profile.
 */
export function useProfile(userId?: string) {
  return useQuery({
    queryKey: queryKeys.profile(),
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user && !userId) {
        throw new Error('User not authenticated');
      }

      const targetUserId = userId || user?.id;

      const { data, error } = await supabase
        .from('student_profiles')
        .select('id,user_id,college_name,living_type,monthly_income,internship_active,effective_income,semester_start_date,semester_end_date,created_at,updated_at')
        .eq('user_id', targetUserId)
        .single();

      if (error) throw error;
      return data as StudentProfile;
    },
    enabled: !!userId || true, // Always enabled if userId provided
  });
}

/**
 * Fetch daily summary with survival mode & spend calculations.
 */
export function useDailySummary() {
  return useQuery({
    queryKey: queryKeys.dailySummary(),
    queryFn: async () => {
      const supabase = getSupabaseClient();

      // Call edge function or API route for computations
      const response = await fetch('/api/daily-summary', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch daily summary: ${response.statusText}`);
      }

      const { data } = await response.json();
      return data as DailySummary;
    },
  });
}

/**
 * Fetch all expenses for current user.
 */
export function useExpenses(limit: number = 100) {
  return useQuery({
    queryKey: queryKeys.expenses(),
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('expenses')
        .select('id,user_id,amount,category,description,logged_at,input_method')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map((expense: any) => ({
        id: expense.id,
        user_id: expense.user_id,
        amount: expense.amount,
        category: expense.category,
        note: expense.description,
        date: expense.logged_at,
        created_at: expense.logged_at,
      })) as Expense[];
    },
  });
}

/**
 * Fetch liabilities for current user.
 */
export function useLiabilities() {
  return useQuery({
    queryKey: queryKeys.liabilities(),
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('semester_liabilities')
        .select('id,user_id,title,amount,due_date,is_paid,category,created_at')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return (data || []).map(liability => ({
        ...liability,
        status: liability.is_paid ? 'paid' : new Date(liability.due_date) < new Date() ? 'overdue' : 'pending',
      })) as Liability[];
    },
  });
}

/**
 * Fetch current streak data.
 */
export function useStreak() {
  return useQuery({
    queryKey: queryKeys.streak(),
    queryFn: async () => {
      const response = await fetch('/api/streak', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch streak: ${response.statusText}`);
      }

      const { data } = await response.json();
      return data as StreakData;
    },
  });
}

/**
 * Fetch earned badges for current user.
 */
export function useBadges() {
  return useQuery({
    queryKey: queryKeys.badges(),
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_badges')
        .select(
          `
          badge_key,
          awarded_at,
          badge_catalog (title, description, category)
        `
        )
        .eq('user_id', user.id)
        .order('awarded_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((badge: any) => ({
        badge_key: badge.badge_key,
        title: badge.badge_catalog?.title || '',
        description: badge.badge_catalog?.description || '',
        category: badge.badge_catalog?.category || 'streak',
        awarded_at: badge.awarded_at,
      })) as BadgeEarned[];
    },
  });
}

// ============================================================================
// QUERY INVALIDATION HELPERS
// ============================================================================

/**
 * Invalidate multiple queries at once.
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return {
    // After expense logged
    invalidateExpenseQueries: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.expenses() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dailySummary() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.badges() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.streak() }),
      ]);
    },

    // After liability added/updated
    invalidateLiabilityQueries: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.liabilities() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dailySummary() }),
      ]);
    },

    // After liability marked paid
    invalidateLiabilityPaidQueries: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.liabilities() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dailySummary() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.badges() }),
      ]);
    },

    // Full refresh
    invalidateAllQueries: async () => {
      await queryClient.invalidateQueries();
    },
  };
}
