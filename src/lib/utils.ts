import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API_BASE_URL = 'https://kart-i-quo-fujv.onrender.com';

export function getApiUrl(path: string): string {
  if (path.startsWith('/')) {
    path = path.substring(1);
  }

  // In browser, if we are on http/https, use relative paths to avoid CORS/Fetch errors
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      return `/${path}`;
    }
  }

  return `${API_BASE_URL}/${path}`;
}

/**
 * Student budget allocation: 60% Needs, 30% Wants, 10% Savings
 * Optimized for pocket money management with recurring expenses
 */
export function getStudentBudgetSplit(): { needsPercent: number; wantsPercent: number; savingsPercent: number } {
  return { needsPercent: 0.60, wantsPercent: 0.30, savingsPercent: 0.10 };
}

/**
 * Calculate student budget allocation
 * Takes into account recurring expenses and dynamically adjusts Wants/Savings if Needs exceed threshold
 */
export function calculateStudentBudget(
  income: number,
  recurringExpensesTotal: number
): { monthlyNeeds: number; monthlyWants: number; monthlySavings: number; dailySpendingLimit: number } {
  if (income <= 0) {
    return { monthlyNeeds: 0, monthlyWants: 0, monthlySavings: 0, dailySpendingLimit: 0 };
  }

  const { needsPercent, wantsPercent, savingsPercent } = getStudentBudgetSplit();
  const needs = recurringExpensesTotal;
  const needsThreshold = income * needsPercent;

  let wants = 0;
  let savings = 0;

  if (needs <= needsThreshold) {
    // Recurring expenses are within threshold — use student split (60/30/10)
    const wantsTarget = income * wantsPercent;
    const savingsTarget = income * savingsPercent;

    // Put any remainder into Wants (discretionary)
    const remainder = income - (needs + wantsTarget + savingsTarget);
    wants = wantsTarget + (remainder > 0 ? remainder : 0);
    savings = savingsTarget;
  } else {
    // Recurring expenses exceed threshold — allocate remaining disposable income
    const disposable = Math.max(income - needs, 0);
    if (disposable > 0) {
      // Split remaining disposable based on student wants/savings ratio (30/10 = 75/25)
      const totalFlexPercent = wantsPercent + savingsPercent;
      const wantsRatio = wantsPercent / totalFlexPercent;
      const savingsRatio = savingsPercent / totalFlexPercent;

      wants = disposable * wantsRatio;
      savings = disposable * savingsRatio;
    }
  }

  const dailySpendingLimit = wants > 0 ? wants / 30 : 0;

  return {
    monthlyNeeds: Math.round(needs * 100) / 100,
    monthlyWants: Math.round(wants * 100) / 100,
    monthlySavings: Math.round(savings * 100) / 100,
    dailySpendingLimit: Math.round(dailySpendingLimit * 100) / 100
  };
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateEffectiveMonthlyIncome(monthlyIncome: number, internshipIncome = 0): number {
  return roundCurrency(monthlyIncome + internshipIncome / 3);
}
