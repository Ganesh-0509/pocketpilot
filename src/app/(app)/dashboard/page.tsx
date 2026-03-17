import { cookies } from 'next/headers';
import { format, parseISO, subDays, startOfDay } from 'date-fns';
import { createServerComponentClient } from '@/lib/supabase';
import { SupabaseService } from '@/lib/supabase-service';
import { computeDailySummary } from '@/lib/dailyEngine';
import type { StudentProfile, Expense, SemesterLiability } from '@/lib/dailyEngine';
import type { Transaction } from '@/lib/types';
import { redirect } from 'next/navigation';

import { SurvivalModeBanner } from './_components/survival-mode-banner';
import { HeroCard } from './_components/hero-card';
import { SecondaryStatsRow } from './_components/secondary-stats-row';
import { WeekendSpikeAlert } from './_components/weekend-spike-alert';
import { UpcomingLiabilitiesSection } from './_components/upcoming-liabilities-section';
import { BurnRateChart } from './_components/burn-rate-chart';
import { QuickLogButton } from './_components/quick-log-button';

async function getDashboardData() {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient(cookieStore);

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  try {
    // Fetch profile, transactions, and liabilities in parallel
    const [profile, transactions, liabilities] = await Promise.all([
      SupabaseService.getProfile(user.id),
      SupabaseService.getTransactions(user.id),
      SupabaseService.getSemesterLiabilities(user.id),
    ]);

    if (!profile) {
      redirect('/onboarding');
    }

    return { profile, transactions, liabilities, userId: user.id };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

function convertToExpenses(transactions: Transaction[]): Expense[] {
  return transactions.map((t) => ({
    amount: t.amount,
    loggedAt: typeof t.date === 'string' ? parseISO(t.date) : t.date,
  }));
}

function convertToStudentProfile(profile: any): StudentProfile {
  const semStart = profile.semesterStartDate
    ? typeof profile.semesterStartDate === 'string'
      ? parseISO(profile.semesterStartDate)
      : profile.semesterStartDate
    : new Date();

  const semEnd = profile.semesterEndDate
    ? typeof profile.semesterEndDate === 'string'
      ? parseISO(profile.semesterEndDate)
      : profile.semesterEndDate
    : new Date();

  return {
    monthlyPocketMoney: profile.monthlyIncome || 0,
    internshipIncome: profile.internshipIncome || 0,
    semesterStartDate: semStart,
    semesterEndDate: semEnd,
  };
}

function convertToSemesterLiabilities(liabilities: any[]): Array<SemesterLiability & { title?: string }> {
  return liabilities.map((l) => ({
    id: l.id,
    amount: l.amount,
    dueDate: typeof l.dueDate === 'string' ? parseISO(l.dueDate) : l.dueDate,
    isPaid: l.isPaid || false,
    title: l.title,
  }));
}

function getLast7DaysExpenses(expenses: Expense[]): Array<{
  date: string;
  amount: number;
}> {
  const now = new Date();
  const last7 = [];

  for (let i = 6; i >= 0; i--) {
    const date = subDays(startOfDay(now), i);
    const dateStr = format(date, 'MMM d');
    const dailyTotal = expenses.reduce((sum, e) => {
      const expenseDate = e.loggedAt;
      if (
        startOfDay(expenseDate).getTime() === startOfDay(date).getTime()
      ) {
        return sum + e.amount;
      }
      return sum;
    }, 0);

    last7.push({ date: dateStr, amount: dailyTotal });
  }

  return last7;
}

function getUpcoming14DaysLiabilities(liabilities: SemesterLiability[]): SemesterLiability[] {
  const now = new Date();
  const in14Days = new Date(now);
  in14Days.setDate(in14Days.getDate() + 14);

  return liabilities.filter((l) => {
    const dueDate = l.dueDate;
    return !l.isPaid && dueDate >= now && dueDate <= in14Days;
  });
}

export default async function DashboardPage() {
  const { profile, transactions, liabilities } = await getDashboardData();

  // Convert to types expected by dailyEngine
  const expenses = convertToExpenses(transactions);
  const studentProfile = convertToStudentProfile(profile);
  const semesterLiabilities = convertToSemesterLiabilities(liabilities);

  // Compute daily summary
  const dailySummary = computeDailySummary(studentProfile, semesterLiabilities, expenses);

  // Prepare chart data
  const chartData = getLast7DaysExpenses(expenses);

  // Get upcoming liabilities (within 14 days)
  const upcomingLiabilities = getUpcoming14DaysLiabilities(semesterLiabilities);

  return (
    <main className="space-y-6 pb-32 pt-4">
      {/* Survival Mode Banner */}
      {dailySummary.isSurvivalMode && (
        <SurvivalModeBanner
          dailyLimit={dailySummary.safeDailyLimit}
          daysRemaining={dailySummary.daysRemaining}
        />
      )}

      {/* Hero Card */}
      <HeroCard
        safeDailyLimit={dailySummary.safeDailyLimit}
        todaySpend={dailySummary.todaySpend}
        burnRateStatus={dailySummary.burnRateStatus}
      />

      {/* Secondary Stats Row */}
      <SecondaryStatsRow
        remainingBudget={dailySummary.adjustedRemaining}
        daysRemaining={dailySummary.daysRemaining}
        monthEndPredictionDay={dailySummary.monthEndPredictionDay}
      />

      {/* Weekend Spike Alert */}
      {dailySummary.weekendSpikeFactor && dailySummary.weekendSpikeFactor > 1.5 && (
        <WeekendSpikeAlert spikeFactor={dailySummary.weekendSpikeFactor} />
      )}

      {/* Upcoming Liabilities Section */}
      {upcomingLiabilities.length > 0 && (
        <UpcomingLiabilitiesSection
          liabilities={upcomingLiabilities as any}
          dailyLimit={dailySummary.safeDailyLimit}
        />
      )}

      {/* Burn Rate Chart */}
      <BurnRateChart data={chartData} dailyLimit={dailySummary.safeDailyLimit} />

      {/* Quick Log Button */}
      <QuickLogButton />
    </main>
  );
}
