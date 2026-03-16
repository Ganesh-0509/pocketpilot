import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
  subDays,
} from 'date-fns';
import type { SemesterLiability, StudentAnalytics, Transaction, UserProfile, WeekendSpendingInsight } from '@/lib/types';
import { roundCurrency, calculateEffectiveMonthlyIncome } from '@/lib/utils';

export const MINIMUM_DAILY_THRESHOLD = 150;

function isWithinWindow(dateIso: string, start: Date, end: Date): boolean {
  const date = parseISO(dateIso);
  return !isBefore(date, start) && !isAfter(date, end);
}

export function getUpcomingLiabilitiesWithinDays(
  liabilities: SemesterLiability[],
  days: number,
  referenceDate = new Date()
): SemesterLiability[] {
  const start = startOfDay(referenceDate);
  const end = endOfDay(addDays(start, days));

  return liabilities
    .filter((liability) => isWithinWindow(liability.dueDate, start, end))
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate));
}

export function calculateWeekendSpendingInsight(
  transactions: Transaction[],
  referenceDate = new Date()
): WeekendSpendingInsight {
  const start = startOfDay(subDays(referenceDate, 29));
  const dayTotals = new Map<string, number>();

  transactions.forEach((transaction) => {
    const date = parseISO(transaction.date);
    if (isBefore(date, start) || isAfter(date, referenceDate)) {
      return;
    }

    const key = startOfDay(date).toISOString();
    dayTotals.set(key, (dayTotals.get(key) || 0) + transaction.amount);
  });

  let weekendTotal = 0;
  let weekendDays = 0;
  let weekdayTotal = 0;
  let weekdayDays = 0;

  for (let offset = 0; offset < 30; offset += 1) {
    const date = startOfDay(addDays(start, offset));
    const day = date.getDay();
    const amount = dayTotals.get(date.toISOString()) || 0;

    if (day === 5 || day === 6 || day === 0) {
      weekendTotal += amount;
      weekendDays += 1;
    } else {
      weekdayTotal += amount;
      weekdayDays += 1;
    }
  }

  const weekendAverage = weekendDays > 0 ? weekendTotal / weekendDays : 0;
  const weekdayAverage = weekdayDays > 0 ? weekdayTotal / weekdayDays : 0;
  const spikeDetected = weekdayAverage === 0
    ? weekendAverage > 0
    : weekendAverage > weekdayAverage * 1.7;

  return {
    weekendAverage: roundCurrency(weekendAverage),
    weekdayAverage: roundCurrency(weekdayAverage),
    spikeDetected,
    message: spikeDetected
      ? 'Weekend spending spike detected.'
      : 'Weekend spending is staying in line with the rest of the week.',
  };
}

export function calculateStudentAnalytics(
  profile: UserProfile,
  transactions: Transaction[],
  semesterLiabilities: SemesterLiability[],
  referenceDate = new Date()
): StudentAnalytics {
  const effectiveMonthlyIncome = calculateEffectiveMonthlyIncome(
    profile.monthlyIncome || 0,
    profile.internshipIncome || 0
  );
  const monthStart = startOfMonth(referenceDate);
  const monthSpending = transactions
    .filter((transaction) => {
      const date = parseISO(transaction.date);
      return !isBefore(date, monthStart) && date.getMonth() === referenceDate.getMonth() && date.getFullYear() === referenceDate.getFullYear();
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const remainingBudget = roundCurrency(profile.monthlyWants - monthSpending);
  const upcomingLiabilitiesWithin30Days = getUpcomingLiabilitiesWithinDays(semesterLiabilities, 30, referenceDate);
  const reservedForUpcomingLiabilities = roundCurrency(
    upcomingLiabilitiesWithin30Days.reduce((sum, liability) => sum + liability.amount, 0)
  );
  const adjustedRemainingBudget = roundCurrency(remainingBudget - reservedForUpcomingLiabilities);
  const remainingDays = Math.max(1, differenceInCalendarDays(endOfMonth(referenceDate), startOfDay(referenceDate)) + 1);
  const rawDailyLimit = adjustedRemainingBudget / remainingDays;
  const weekendSpending = calculateWeekendSpendingInsight(transactions, referenceDate);

  return {
    effectiveMonthlyIncome,
    remainingBudget,
    adjustedRemainingBudget,
    reservedForUpcomingLiabilities,
    remainingDays,
    currentDailyLimit: roundCurrency(Math.max(0, rawDailyLimit)),
    baselineDailyLimit: profile.dailySpendingLimit,
    survivalMode: rawDailyLimit < MINIMUM_DAILY_THRESHOLD,
    minimumDailyThreshold: MINIMUM_DAILY_THRESHOLD,
    upcomingLiabilitiesWithin30Days,
    weekendSpending,
  };
}