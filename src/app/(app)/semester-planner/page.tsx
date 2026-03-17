import { cookies } from 'next/headers';
import { parseISO } from 'date-fns';
import { createServerComponentClient } from '@/lib/supabase';
import { SupabaseService } from '@/lib/supabase-service';
import { computeDailySummary } from '@/lib/dailyEngine';
import type { StudentProfile, Expense, SemesterLiability } from '@/lib/dailyEngine';
import type { Transaction } from '@/lib/types';
import { redirect } from 'next/navigation';

import { TopImpactCard } from './_components/top-impact-card';
import { AddLiabilityForm } from './_components/add-liability-form';
import { LiabilityList } from './_components/liability-list';

async function getSemesterPlannerData() {
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
    console.error('Error fetching semester planner data:', error);
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

function convertToSemesterLiabilities(liabilities: any[]): Array<SemesterLiability & { title?: string; category?: string }> {
  return liabilities.map((l) => ({
    id: l.id,
    amount: l.amount,
    dueDate: typeof l.dueDate === 'string' ? parseISO(l.dueDate) : l.dueDate,
    isPaid: l.isPaid || false,
    title: l.title,
    category: l.category,
  }));
}

export default async function SemesterPlannerPage() {
  const { profile, transactions, liabilities } = await getSemesterPlannerData();

  // Convert to types expected by dailyEngine
  const expenses = convertToExpenses(transactions);
  const studentProfile = convertToStudentProfile(profile);
  const semesterLiabilities = convertToSemesterLiabilities(liabilities);

  // Compute daily summary
  const dailySummary = computeDailySummary(studentProfile, semesterLiabilities, expenses);

  // Calculate without liabilities for comparison
  const summaryWithoutLiabilities = computeDailySummary(studentProfile, [], expenses);

  // Sort liabilities by due date for initial display
  const sortedLiabilities = [...semesterLiabilities].sort(
    (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
  );

  return (
    <main className="space-y-6 pb-20 pt-4">
      {/* Top Impact Card */}
      <TopImpactCard
        totalUpcomingLiabilities={dailySummary.upcomingLiabilities}
        dailyLimitWithout={summaryWithoutLiabilities.safeDailyLimit}
        dailyLimitWith={dailySummary.safeDailyLimit}
        impact={dailySummary.upcomingLiabilities}
      />

      {/* Add Liability Form */}
      <AddLiabilityForm />

      {/* Liability List */}
      <LiabilityList initialLiabilities={sortedLiabilities} />
    </main>
  );
}