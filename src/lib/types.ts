export type UserType = 'student';

export type LivingType = 'hostel' | 'day_scholar';

export interface RecurringExpense {
  name: string;
  amount: number;
  category: string;
}

export interface SemesterFee {
  amount: number;
  dueDate: string; // ISO string
}

export const semesterLiabilityCategories = [
  'Semester Fees',
  'Exam Form Fees',
  'Books',
  'Project Expenses',
  'Fest Budgets',
] as const;

export type SemesterLiabilityCategory = typeof semesterLiabilityCategories[number];

export interface SemesterLiability {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // ISO string
  category: SemesterLiabilityCategory;
  createdAt: string; // ISO string
}

export interface WeekendSpendingInsight {
  weekendAverage: number;
  weekdayAverage: number;
  spikeDetected: boolean;
  message: string;
}

export interface StudentAnalytics {
  effectiveMonthlyIncome: number;
  remainingBudget: number;
  adjustedRemainingBudget: number;
  reservedForUpcomingLiabilities: number;
  remainingDays: number;
  currentDailyLimit: number;
  baselineDailyLimit: number;
  survivalMode: boolean;
  minimumDailyThreshold: number;
  upcomingLiabilitiesWithin30Days: SemesterLiability[];
  weekendSpending: WeekendSpendingInsight;
}

export interface UserProfile {
  name?: string;
  userType: UserType;
  collegeName: string;
  livingType: LivingType;
  monthlyIncome: number; // Pocket money/stipend
  internshipIncome?: number;
  recurringExpenses: RecurringExpense[];
  semesterFees?: SemesterFee[];
  fixedExpenses: FixedExpense[]; // Keep for backward compatibility during migration
  dailySpendingLimit: number;
  monthlyNeeds: number;
  monthlyWants: number;
  monthlySavings: number;
  emergencyFund: {
    target: number;
    current: number;
    history: EmergencyFundEntry[];
  };
  gamification?: {
    earnedBadges: string[];
    currentStreak: number;
    longestStreak: number;
    lastStreakDate: string | null;
    lastBadgeCheckDate?: string | null;
  };
  totalDailySavings?: number; // Current balance (optional if we use derived)
  lastTdsResetDate?: string; // ISO string
  reminderTime?: string; // HH:mm format
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  timelineMonths?: number;
  startDate?: string; // Should be an ISO string
}

export interface Contribution {
  amount: number;
  date: string; // ISO string
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  timelineMonths: number;
  startDate?: string;
  contributions: Contribution[];
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO string for simplicity
}

export const expenseCategories = [
  'Food & Dining',
  'Groceries',
  'Transport',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Rent/EMI',
  'Healthcare',
  'Education',
  'Other',
];

// Represents a record of which month a payment was logged for a specific expense.
// e.g., { "expense-id-123": ["2024-01", "2024-02"] }
export type LoggedPayments = Record<string, string[]>;

export interface EmergencyFundEntry {
  id: string;
  amount: number;
  date: string; // ISO string
  type: 'deposit' | 'withdrawal';
  notes?: string;
}