/**
 * @fileOverview Memoized Daily Summary Computation
 * 
 * Wraps computeDailySummary in useMemo to prevent unnecessary recalculations.
 */

'use client';

import { useMemo } from 'react';
import { StudentProfile, Expense, Liability, DailySummary } from '@/hooks/useQueries';

/**
 * Calculate daily summary with memoization.
 * Only recalculates when expenses, liabilities, or profile actually change.
 */
export function useMemoizedDailySummary(
  expenses: Expense[] | undefined,
  liabilities: Liability[] | undefined,
  profile: StudentProfile | undefined
): DailySummary | null {
  return useMemo(() => {
    if (!expenses || !liabilities || !profile) {
      return null;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate days remaining in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysRemaining = daysInMonth - now.getDate() + 1;

    // Calculate today's spend
    const todayStr = now.toISOString().split('T')[0];
    const todayExpenses = expenses.filter((exp) => exp.date === todayStr);
    const todaySpend = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate spending by day of week (last 14 days)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const recentExpenses = expenses.filter(
      (exp) => new Date(exp.date) >= fourteenDaysAgo
    );

    // Group by day of week
    let weekdaySpend = 0;
    let weekendSpend = 0;
    let weekdayCount = 0;
    let weekendCount = 0;

    recentExpenses.forEach((exp) => {
      const date = new Date(exp.date);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (isWeekend) {
        weekendSpend += exp.amount;
        weekendCount++;
      } else {
        weekdaySpend += exp.amount;
        weekdayCount++;
      }
    });

    const weekdayAverage = weekdayCount > 0 ? weekdaySpend / weekdayCount : 0;
    const weekendAverage = weekendCount > 0 ? weekendSpend / weekendCount : 0;
    const weekendSpikeFactor =
      weekdayAverage > 0 ? weekendAverage / weekdayAverage : null;

    // Calculate upcoming liabilities for this month
    const upcomingInMonth = liabilities.filter((liability) => {
      const dueDate = new Date(liability.due_date);
      return (
        dueDate.getMonth() === currentMonth &&
        dueDate.getFullYear() === currentYear &&
        dueDate >= now
      );
    });

    const upcomingLiabilitiesTotal = upcomingInMonth.reduce(
      (sum, liability) => sum + liability.amount,
      0
    );

    // Calculate remaining budget
    const monthlyBudget = profile.effective_income;
    const totalSpentThisMonth = expenses
      .filter((exp) => {
        const expDate = new Date(exp.date);
        return (
          expDate.getMonth() === currentMonth &&
          expDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, exp) => sum + exp.amount, 0);

    const remainingBudget = monthlyBudget - totalSpentThisMonth;

    // Calculate safe daily limit
    const budgetAfterLiabilities = remainingBudget - upcomingLiabilitiesTotal;
    const safeDailyLimit =
      daysRemaining > 0 ? budgetAfterLiabilities / daysRemaining : 0;

    // Determine survival mode
    const isSurvivalMode = safeDailyLimit < 100;
    const survivalSeverity =
      safeDailyLimit < 100
        ? 'critical'
        : safeDailyLimit < 150
          ? 'warning'
          : 'safe';

    return {
      date: todayStr,
      todaySpend,
      weekdayAverage,
      weekendAverage,
      weekendSpikeFactor,
      daysRemaining,
      remainingBudget,
      safeDailyLimit: Math.max(0, safeDailyLimit),
      isSurvivalMode,
      survivalSeverity: survivalSeverity as 'safe' | 'warning' | 'critical',
    };
  }, [expenses, liabilities, profile]);
}
