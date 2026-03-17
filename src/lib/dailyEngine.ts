export interface StudentProfile {
  monthlyPocketMoney: number;
  internshipIncome: number;
  semesterStartDate: Date;
  semesterEndDate: Date;
}

export interface SemesterLiability {
  id: string;
  amount: number;
  dueDate: Date;
  isPaid: boolean;
}

export interface Expense {
  amount: number;
  loggedAt: Date;
}

export interface DailySummary {
  effectiveMonthlyIncome: number;
  totalMonthSpend: number;
  remainingBudget: number;
  upcomingLiabilities: number;
  adjustedRemaining: number;
  daysRemaining: number;
  safeDailyLimit: number;
  todaySpend: number;
  burnRateStatus: 'safe' | 'warning' | 'critical';
  isSurvivalMode: boolean;
  monthEndPredictionDay: number | null;
  weekendSpikeFactor: number | null;
}

/**
 * Applies income smoothing for variable internship cash flow.
 */
export function smoothInternshipIncome(pocketMoney: number, internshipIncome: number): number {
  return pocketMoney + internshipIncome / 3;
}

/**
 * Returns the number of days left in the current month, including today.
 */
export function getDaysRemainingInMonth(): number {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, daysInMonth - now.getDate() + 1);
}

/**
 * Sums all expenses logged in the current calendar month.
 */
export function getMonthSpend(expenses: Expense[]): number {
  const now = new Date();
  return expenses.reduce((sum, expense) => {
    const d = expense.loggedAt;
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
      return sum + expense.amount;
    }
    return sum;
  }, 0);
}

/**
 * Sums unpaid liabilities due between now and `withinDays` days ahead (inclusive).
 */
export function getUpcomingLiabilities(liabilities: SemesterLiability[], withinDays = 30): number {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + withinDays);

  return liabilities.reduce((sum, liability) => {
    if (liability.isPaid) {
      return sum;
    }

    const due = liability.dueDate;
    if (due >= now && due <= end) {
      return sum + liability.amount;
    }

    return sum;
  }, 0);
}

/**
 * Calculates the safe daily spend cap from adjusted remaining funds and days left.
 */
export function calculateDailyLimit(adjustedRemaining: number, daysRemaining: number): number {
  if (daysRemaining <= 0) {
    return 0;
  }
  return Math.max(0, adjustedRemaining / daysRemaining);
}

/**
 * Classifies today's burn status against the daily limit.
 */
export function getBurnRateStatus(
  dailyLimit: number,
  todaySpend: number
): 'safe' | 'warning' | 'critical' {
  if (todaySpend <= dailyLimit * 0.8) {
    return 'safe';
  }
  if (todaySpend <= dailyLimit) {
    return 'warning';
  }
  return 'critical';
}

/**
 * Flags survival mode when per-day runway falls below INR 100.
 */
export function getSurvivalMode(adjustedRemaining: number, daysRemaining: number): boolean {
  if (daysRemaining <= 0) {
    return true;
  }
  return adjustedRemaining / daysRemaining < 100;
}

/**
 * Predicts the day-of-month when funds run out; returns null if budget lasts through month-end.
 */
export function getMonthEndPrediction(remainingBudget: number, avgDailySpend: number): number | null {
  const now = new Date();
  const today = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  if (remainingBudget <= 0) {
    return today;
  }

  if (avgDailySpend <= 0) {
    return null;
  }

  const daysUntilRunout = Math.floor(remainingBudget / avgDailySpend);
  const runoutDay = today + daysUntilRunout;

  if (runoutDay > daysInMonth) {
    return null;
  }

  return runoutDay;
}

/**
 * Computes weekend spend spike ratio over the last 14 days.
 * Returns null when weekend coverage is insufficient (< 4 distinct weekend days).
 */
export function getWeekendSpikeFactor(expenses: Expense[]): number | null {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 13);

  const windowed = expenses.filter((expense) => expense.loggedAt >= start && expense.loggedAt <= now);

  const dayBuckets = new Map<string, { total: number; day: number }>();

  windowed.forEach((expense) => {
    const d = expense.loggedAt;
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const current = dayBuckets.get(key);

    if (current) {
      current.total += expense.amount;
    } else {
      dayBuckets.set(key, { total: expense.amount, day: d.getDay() });
    }
  });

  const weekendTotals: number[] = [];
  const weekdayTotals: number[] = [];

  dayBuckets.forEach(({ total, day }) => {
    if (day === 0 || day === 6) {
      weekendTotals.push(total);
    } else {
      weekdayTotals.push(total);
    }
  });

  if (weekendTotals.length < 4 || weekdayTotals.length === 0) {
    return null;
  }

  const weekendAvg = weekendTotals.reduce((s, v) => s + v, 0) / weekendTotals.length;
  const weekdayAvg = weekdayTotals.reduce((s, v) => s + v, 0) / weekdayTotals.length;

  if (weekdayAvg <= 0) {
    return null;
  }

  return weekendAvg / weekdayAvg;
}

/**
 * Computes an end-to-end daily financial summary using student budget guardrails.
 */
export function computeDailySummary(
  profile: StudentProfile,
  liabilities: SemesterLiability[],
  expenses: Expense[]
): DailySummary {
  const effectiveMonthlyIncome = smoothInternshipIncome(
    profile.monthlyPocketMoney,
    profile.internshipIncome
  );

  const totalMonthSpend = getMonthSpend(expenses);
  const remainingBudget = effectiveMonthlyIncome - totalMonthSpend;
  const upcomingLiabilities = getUpcomingLiabilities(liabilities);
  const adjustedRemaining = remainingBudget - upcomingLiabilities;
  const daysRemaining = getDaysRemainingInMonth();
  const safeDailyLimit = calculateDailyLimit(adjustedRemaining, daysRemaining);

  const now = new Date();
  const todaySpend = expenses.reduce((sum, expense) => {
    const d = expense.loggedAt;
    if (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    ) {
      return sum + expense.amount;
    }
    return sum;
  }, 0);

  const burnRateStatus = getBurnRateStatus(safeDailyLimit, todaySpend);
  const isSurvivalMode = getSurvivalMode(adjustedRemaining, daysRemaining);

  const elapsedDays = Math.max(1, now.getDate());
  const avgDailySpend = totalMonthSpend / elapsedDays;
  const monthEndPredictionDay = getMonthEndPrediction(remainingBudget, avgDailySpend);

  const weekendSpikeFactor = getWeekendSpikeFactor(expenses);

  return {
    effectiveMonthlyIncome,
    totalMonthSpend,
    remainingBudget,
    upcomingLiabilities,
    adjustedRemaining,
    daysRemaining,
    safeDailyLimit,
    todaySpend,
    burnRateStatus,
    isSurvivalMode,
    monthEndPredictionDay,
    weekendSpikeFactor,
  };
}
