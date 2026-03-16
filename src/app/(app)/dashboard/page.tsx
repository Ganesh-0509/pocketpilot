"use client";

import React from 'react';
import Link from 'next/link';
import { format, isLastDayOfMonth } from 'date-fns';
import { AlertTriangle, CalendarClock, Flame, PiggyBank, ShieldAlert, Target, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SmartDailyBriefing } from '@/components/ui/smart-daily-briefing';
import { TdsAllocationDialog } from '@/components/total-daily-savings';
import { useApp } from '@/hooks/use-app';

function StatCard({ title, value, description, icon }: { title: string; value: string; description: string; icon: React.ReactNode }) {
  return (
    <Card className="border-muted shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const {
    profile,
    goals,
    getTodaysSpending,
    getCumulativeDailySavings,
    getCurrentStreak,
    studentAnalytics,
  } = useApp();

  if (!profile) {
    return null;
  }

  const todaysSpending = getTodaysSpending();
  const currentDailyLimit = studentAnalytics?.currentDailyLimit ?? profile.dailySpendingLimit;
  const safeToSpend = Math.max(0, currentDailyLimit - todaysSpending);
  const reservedAmount = studentAnalytics?.reservedForUpcomingLiabilities ?? 0;
  const adjustedBudget = studentAnalytics?.adjustedRemainingBudget ?? profile.monthlyWants;
  const cumulativeSavings = getCumulativeDailySavings();
  const todaysSavings = currentDailyLimit - todaysSpending;
  const emergencyFund = profile.emergencyFund;
  const emergencyFundProgress = emergencyFund.target > 0 ? (emergencyFund.current / emergencyFund.target) * 100 : 0;
  const totalGoalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const nextLiability = studentAnalytics?.upcomingLiabilitiesWithin30Days[0];
  const weekendInsight = studentAnalytics?.weekendSpending;
  const survivalMode = studentAnalytics?.survivalMode ?? false;

  return (
    <div className="space-y-8">
      {survivalMode && (
        <Card className="border-destructive/30 bg-destructive/10 shadow-sm">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Survival Mode activated.</p>
              <p className="text-sm text-destructive/90">Reduce non-essential spending to finish the month.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={survivalMode ? 'border-destructive/30 bg-gradient-to-br from-destructive/10 via-background to-background' : 'border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent'}>
        <CardContent className="pt-8">
          <div className="space-y-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Today's Safe-to-Spend</p>
            <div className={survivalMode ? 'text-6xl font-bold text-destructive md:text-7xl' : 'text-6xl font-bold text-primary md:text-7xl'}>
              ₹{safeToSpend.toFixed(0)}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Limit: ₹{currentDailyLimit.toFixed(0)}</span>
              <span>•</span>
              <span>Spent: ₹{todaysSpending.toFixed(0)}</span>
              <span>•</span>
              <span>{studentAnalytics?.remainingDays || 1} days left</span>
            </div>
            <p className="text-sm text-muted-foreground">₹{reservedAmount.toFixed(0)} reserved for upcoming semester costs.</p>
            {todaysSpending > currentDailyLimit && (
              <div className="mx-auto mt-3 max-w-xl rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                <p className="text-sm font-medium text-destructive">You've exceeded today's limit by ₹{(todaysSpending - currentDailyLimit).toFixed(0)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SmartDailyBriefing />

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Budget Left This Month"
          value={`₹${Math.max(0, adjustedBudget).toFixed(0)}`}
          description="After current spending and near-term semester reserves"
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Current Streak"
          value={`${getCurrentStreak()} days`}
          description="Days finished within your base daily plan"
          icon={<Flame className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Goal Savings"
          value={`₹${totalGoalSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          description="Amount already parked toward active goals"
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarClock className="h-5 w-5 text-primary" />
              Upcoming Semester Costs
            </CardTitle>
            <CardDescription>Academic liabilities due in the next 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-3xl font-bold">₹{reservedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
              <p className="text-sm text-muted-foreground">Reserved from your month so you do not accidentally spend it away.</p>
            </div>
            {nextLiability ? (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next due</p>
                <p className="mt-1 font-semibold">{nextLiability.title}</p>
                <p className="text-sm text-muted-foreground">{nextLiability.category} • {format(new Date(nextLiability.dueDate), 'MMM d')}</p>
                <p className="mt-2 text-lg font-bold">₹{nextLiability.amount.toFixed(0)}</p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No academic costs due in the next 30 days.
              </div>
            )}
            <Button asChild className="w-full" variant="outline">
              <Link href="/semester-planner">Open Semester Planner</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className={weekendInsight?.spikeDetected ? 'border-amber-500/30 bg-amber-500/5 shadow-sm' : 'shadow-sm'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className={weekendInsight?.spikeDetected ? 'h-5 w-5 text-amber-600' : 'h-5 w-5 text-primary'} />
              Weekend Spending Insight
            </CardTitle>
            <CardDescription>Based on your last 30 days of transaction timestamps.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className={weekendInsight?.spikeDetected ? 'font-semibold text-amber-700' : 'font-semibold'}>
                {weekendInsight?.message || 'No weekend signal yet.'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Weekend average: ₹{weekendInsight?.weekendAverage.toFixed(0) || '0'} • Weekday average: ₹{weekendInsight?.weekdayAverage.toFixed(0) || '0'}
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
              {weekendInsight?.spikeDetected
                ? 'Friday to Sunday spending is materially outpacing Monday to Thursday. Keep discretionary plans tighter this weekend.'
                : 'Your weekend spending is not materially outrunning weekday behavior right now.'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col overflow-hidden border-primary/20 bg-primary/5 shadow-sm">
          <div className="h-1 w-full bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold">Total Daily Savings</CardTitle>
              <CardDescription className="text-xs">Buffered from unspent daily room</CardDescription>
            </div>
            <PiggyBank className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between pt-0">
            <div className="py-4">
              <div className="text-4xl font-bold tracking-tight">₹{cumulativeSavings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className={`mt-2 text-xs font-medium ${todaysSavings >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {todaysSavings >= 0 ? `₹${todaysSavings.toFixed(2)} left today` : `₹${Math.abs(todaysSavings).toFixed(2)} over today's plan`}
              </p>
            </div>

            <TdsAllocationDialog>
              <Button size="sm" variant="default" className="h-9 w-full text-xs shadow-sm" disabled={cumulativeSavings <= 0 && !isLastDayOfMonth(new Date())}>
                <Target className="mr-2 h-3.5 w-3.5" />
                Allocate to Goals/EF
              </Button>
            </TdsAllocationDialog>
          </CardContent>
        </Card>

        <Link href="/emergency-fund" className="block h-full">
          <Card className="flex h-full flex-col overflow-hidden border-muted shadow-sm transition-colors hover:border-primary/50">
            <div className="h-1 w-full bg-orange-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold">Emergency Fund</CardTitle>
                <CardDescription className="text-xs">Your financial safety net</CardDescription>
              </div>
              <ShieldAlert className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between pt-0">
              <div className="py-4">
                <div className="text-4xl font-bold tracking-tight">
                  ₹{emergencyFund.current.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                {emergencyFund.target > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span>Goal: ₹{emergencyFund.target.toLocaleString('en-IN')}</span>
                      <span>{Math.round(emergencyFundProgress)}%</span>
                    </div>
                    <Progress value={emergencyFundProgress} className="h-1.5" />
                  </div>
                )}
              </div>
              <Button className="mt-auto h-9 w-full text-xs" variant="secondary">Manage Emergency Fund</Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Financial Breakdown</CardTitle>
            <CardDescription>Base student budget split before liability adjustments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <span className="text-sm text-muted-foreground">Needs</span>
              <span className="font-bold">₹{profile.monthlyNeeds.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <span className="text-sm text-muted-foreground">Wants Pool</span>
              <span className="font-bold">₹{profile.monthlyWants.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <span className="text-sm text-muted-foreground">Savings Target</span>
              <span className="font-bold">₹{profile.monthlySavings.toFixed(0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Active Goals</CardTitle>
            <CardDescription>Track your savings progress.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.length > 0 ? goals.map((goal) => (
              <div key={goal.id}>
                <div className="mb-1.5 flex justify-between align-baseline">
                  <span className="text-sm font-semibold">{goal.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    ₹{goal.currentAmount.toLocaleString('en-IN')} / ₹{goal.targetAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-2" />
              </div>
            )) : (
              <div className="rounded-lg border-2 border-dashed py-10 text-center text-muted-foreground">
                <p className="text-sm">No active goals yet</p>
                <Button variant="link" asChild className="mt-1 text-xs">
                  <Link href="/goals">Set one now</Link>
                </Button>
              </div>
            )}
            {goals.length > 0 && (
              <Button className="mt-4 h-9 w-full text-xs" asChild variant="outline">
                <Link href="/goals">Manage Goals</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
