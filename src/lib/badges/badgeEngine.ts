/**
 * @fileOverview PocketPilot Badge Engine
 * 
 * Award system for student financial achievements. Badges are earned through
 * consecutive streaks, spending control, planning, and survival mode achievements.
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Badge {
  key: string;
  title: string;
  description: string;
  category: 'streak' | 'spending' | 'planning' | 'survival';
  icon: string;
}

export interface StudentStats {
  userId: string;
  currentStreak: number;
  totalExpensesLogged: number;
  lastExpenseDate: Date | null;
  lastDayUnderLimit: Date | null;
  
  // Spending data (last 7 days)
  last7DaysTransactions: Array<{
    amount: number;
    date: Date;
    category?: string;
  }>;
  
  // Current day spending
  todaySpend: number;
  dailyLimit: number;
  
  // Survival mode history
  survivalModeEntered: boolean;
  survivalModeEnteredDate: Date | null;
  daysInSurvivalMode: number;
  exitedSurvivalMode: boolean;
  survivalModeExitDate: Date | null;
  
  // Liabilities
  upcomingLiabilities: Array<{
    id: string;
    title: string;
    amount: number;
    dueDate: Date;
  }>;
  remainingBudget: number;
  
  // Weekend spending (last 2 weeks)
  weekendSpending: number[];
  weekdaySpending: number[];
}

export interface BadgeAwardResult {
  badges: Badge[];
  isNewBadges: boolean;
}

// ============================================================================
// BADGE DEFINITIONS
// ============================================================================

const BADGE_CATALOG: Badge[] = [
  // STREAK BADGES
  {
    key: 'streak_3',
    title: '3-Day Run',
    description: '3 consecutive days under daily limit',
    category: 'streak',
    icon: 'flame',
  },
  {
    key: 'streak_7',
    title: 'Week Warrior',
    description: '7 consecutive days under daily limit',
    category: 'streak',
    icon: 'star',
  },
  {
    key: 'streak_14',
    title: 'Two Weeks Clean',
    description: '14 consecutive days under daily limit',
    category: 'streak',
    icon: 'sparkles',
  },
  {
    key: 'streak_30',
    title: 'Month Master',
    description: '30 consecutive days under daily limit',
    category: 'streak',
    icon: 'crown',
  },

  // SPENDING CONTROL BADGES
  {
    key: 'first_log',
    title: 'First Step',
    description: 'Logged your first expense',
    category: 'spending',
    icon: 'pen-tool',
  },
  {
    key: 'under_limit_day',
    title: 'Daily Win',
    description: 'Finished a day under daily limit',
    category: 'spending',
    icon: 'check-circle',
  },
  {
    key: 'zero_impulse_week',
    title: 'Zero Impulse Week',
    description: 'No single transaction above ₹500 for 7 days',
    category: 'spending',
    icon: 'alert-circle',
  },
  {
    key: 'canteen_champion',
    title: 'Canteen Champion',
    description: 'Food spending under ₹150/day for 7 consecutive days',
    category: 'spending',
    icon: 'utensils',
  },
  {
    key: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Weekend spending within 1.2× weekday average for 2 weekends',
    category: 'spending',
    icon: 'target',
  },

  // PLANNING BADGES
  {
    key: 'planner_pro',
    title: 'Semester Planner',
    description: 'Added 3+ liabilities before due dates',
    category: 'planning',
    icon: 'clipboard',
  },
  {
    key: 'fees_ready',
    title: 'Fees Ready',
    description: 'Had full fees amount in remaining budget 7 days before due',
    category: 'planning',
    icon: 'wallet',
  },

  // SURVIVAL BADGES
  {
    key: 'survival_mode_entered',
    title: 'In the Trenches',
    description: 'Entered survival mode (< ₹100/day)',
    category: 'survival',
    icon: 'alert-triangle',
  },
  {
    key: 'survival_escape',
    title: 'Back from the Brink',
    description: 'Exited survival mode and stayed under limit 3 days after',
    category: 'survival',
    icon: 'rocket',
  },
  {
    key: 'semester_survivor',
    title: 'Semester Survivor',
    description: 'Completed month without going negative',
    category: 'survival',
    icon: 'award',
  },
];

// ============================================================================
// SUPABASE SETUP
// ============================================================================

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// ============================================================================
// BADGE CHECK LOGIC
// ============================================================================

/**
 * Check if user already has badge awarded.
 */
async function hasBadgeAwarded(userId: string, badgeKey: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_key', badgeKey)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found
    console.error(`Error checking badge ${badgeKey}:`, error);
  }

  return !!data;
}

/**
 * Award badge to user in Supabase.
 */
async function awardBadge(userId: string, badgeKey: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('user_badges').insert({
    user_id: userId,
    badge_key: badgeKey,
    awarded_at: new Date().toISOString(),
  });

  if (error) {
    console.error(`Error awarding badge ${badgeKey}:`, error);
  }
}

// ============================================================================
// CONDITION CHECK FUNCTIONS
// ============================================================================

interface ConditionCheckResult {
  earned: boolean;
  badges: string[];
}

/**
 * Check streak badges: 3, 7, 14, 30 consecutive days under limit.
 */
function checkStreakBadges(stats: StudentStats): ConditionCheckResult {
  const badges: string[] = [];

  if (stats.currentStreak >= 3) {
    badges.push('streak_3');
  }
  if (stats.currentStreak >= 7) {
    badges.push('streak_7');
  }
  if (stats.currentStreak >= 14) {
    badges.push('streak_14');
  }
  if (stats.currentStreak >= 30) {
    badges.push('streak_30');
  }

  return { earned: badges.length > 0, badges };
}

/**
 * Check spending control badges:
 * - first_log: first expense ever
 * - under_limit_day: finished day under limit
 * - zero_impulse_week: no transaction > ₹500 for 7 days
 * - canteen_champion: food < ₹150/day for 7 days
 * - weekend_warrior: weekend within 1.2× weekday for 2 weekends
 */
function checkSpendingBadges(stats: StudentStats): ConditionCheckResult {
  const badges: string[] = [];

  // First log
  if (stats.totalExpensesLogged === 1) {
    badges.push('first_log');
  }

  // Under limit day (today)
  if (stats.todaySpend < stats.dailyLimit && stats.todaySpend > 0) {
    badges.push('under_limit_day');
  }

  // Zero impulse week (no transaction > ₹500 in last 7 days)
  const last7Days = stats.last7DaysTransactions;
  const hasLargeTransaction = last7Days.some((txn) => txn.amount > 500);
  if (!hasLargeTransaction && last7Days.length > 0) {
    badges.push('zero_impulse_week');
  }

  // Canteen champion (food category < ₹150/day for 7 days)
  const foodTransactions = last7Days.filter((txn) => txn.category === 'food');
  if (foodTransactions.length >= 7) {
    const dailyFoodAvg = foodTransactions.reduce((sum, txn) => sum + txn.amount, 0) / 7;
    if (dailyFoodAvg < 150) {
      badges.push('canteen_champion');
    }
  }

  // Weekend warrior (weekend avg within 1.2× weekday avg for last 2 weekends)
  if (stats.weekendSpending.length >= 2 && stats.weekdaySpending.length > 0) {
    const weekendAvg =
      stats.weekendSpending.reduce((a, b) => a + b, 0) / stats.weekendSpending.length;
    const weekdayAvg =
      stats.weekdaySpending.reduce((a, b) => a + b, 0) / stats.weekdaySpending.length;
    if (weekendAvg <= weekdayAvg * 1.2) {
      badges.push('weekend_warrior');
    }
  }

  return { earned: badges.length > 0, badges };
}

/**
 * Check planning badges:
 * - planner_pro: 3+ liabilities added before due date
 * - fees_ready: had full fees amount 7 days before due
 */
function checkPlanningBadges(stats: StudentStats): ConditionCheckResult {
  const badges: string[] = [];

  // Planner pro (3+ liabilities)
  if (stats.upcomingLiabilities.length >= 3) {
    badges.push('planner_pro');
  }

  // Fees ready (full amount available 7 days before any liability)
  for (const liability of stats.upcomingLiabilities) {
    const daysUntilDue = Math.ceil(
      (liability.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDue === 7 && stats.remainingBudget >= liability.amount) {
      badges.push('fees_ready');
      break;
    }
  }

  return { earned: badges.length > 0, badges };
}

/**
 * Check survival badges:
 * - survival_mode_entered: first time entering survival (< ₹100/day)
 * - survival_escape: exited survival, stayed under limit 3 days after
 * - semester_survivor: completed month without going negative
 */
function checkSurvivalBadges(stats: StudentStats): ConditionCheckResult {
  const badges: string[] = [];

  // Survival mode entered
  if (stats.survivalModeEntered && stats.survivalModeEnteredDate) {
    badges.push('survival_mode_entered');
  }

  // Survival escape (exited + 3 days under limit)
  if (stats.exitedSurvivalMode && stats.daysInSurvivalMode > 0) {
    // Check if current streak is at least 3 after exit
    if (stats.currentStreak >= 3 && stats.lastDayUnderLimit) {
      const daysSinceExit = Math.floor(
        (new Date().getTime() - (stats.survivalModeExitDate?.getTime() || 0)) / (1000 * 60 * 60 * 24)
      );
      // Award within 7 days of exit
      if (daysSinceExit <= 7) {
        badges.push('survival_escape');
      }
    }
  }

  // Semester survivor: no negative balance (remainingBudget >= 0)
  if (stats.remainingBudget >= 0) {
    badges.push('semester_survivor');
  }

  return { earned: badges.length > 0, badges };
}

// ============================================================================
// MAIN EXPORT FUNCTIONS
// ============================================================================

/**
 * Check all badge conditions and award newly earned badges.
 * 
 * @param userId - Student user ID
 * @param stats - Current student financial stats
 * @returns Promise<BadgeAwardResult> - Newly awarded badges
 */
export async function checkAndAwardBadges(
  userId: string,
  stats: StudentStats
): Promise<BadgeAwardResult> {
  try {
    // Collect all earned badges
    const allEarned = new Set<string>();

    const streakCheck = checkStreakBadges(stats);
    streakCheck.badges.forEach((badge) => allEarned.add(badge));

    const spendingCheck = checkSpendingBadges(stats);
    spendingCheck.badges.forEach((badge) => allEarned.add(badge));

    const planningCheck = checkPlanningBadges(stats);
    planningCheck.badges.forEach((badge) => allEarned.add(badge));

    const survivalCheck = checkSurvivalBadges(stats);
    survivalCheck.badges.forEach((badge) => allEarned.add(badge));

    // Filter newly earned badges (not already awarded)
    const newBadges: string[] = [];
    for (const badgeKey of allEarned) {
      const alreadyAwarded = await hasBadgeAwarded(userId, badgeKey);
      if (!alreadyAwarded) {
        newBadges.push(badgeKey);
        await awardBadge(userId, badgeKey);
      }
    }

    // Map badge keys to full badge objects
    const awardedBadges = newBadges
      .map((key) => BADGE_CATALOG.find((badge) => badge.key === key))
      .filter((badge): badge is Badge => badge !== undefined);

    return {
      badges: awardedBadges,
      isNewBadges: awardedBadges.length > 0,
    };
  } catch (error) {
    console.error('Error checking and awarding badges:', error);
    return { badges: [], isNewBadges: false };
  }
}

/**
 * Get badge definition by key.
 * 
 * @param key - Badge key
 * @returns Badge | undefined
 */
export function getBadgeDefinition(key: string): Badge | undefined {
  return BADGE_CATALOG.find((badge) => badge.key === key);
}

/**
 * Get all badge definitions.
 * 
 * @returns Badge[]
 */
export function getAllBadges(): Badge[] {
  return [...BADGE_CATALOG];
}

/**
 * Get badges by category.
 * 
 * @param category - Badge category
 * @returns Badge[]
 */
export function getBadgesByCategory(
  category: 'streak' | 'spending' | 'planning' | 'survival'
): Badge[] {
  return BADGE_CATALOG.filter((badge) => badge.category === category);
}
