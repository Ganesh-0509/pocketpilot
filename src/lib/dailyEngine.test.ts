import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateDailyLimit,
  computeDailySummary,
  getBurnRateStatus,
  getDaysRemainingInMonth,
  getMonthEndPrediction,
  getMonthSpend,
  getSurvivalMode,
  getUpcomingLiabilities,
  getWeekendSpikeFactor,
  smoothInternshipIncome,
  type Expense,
  type SemesterLiability,
  type StudentProfile,
} from './dailyEngine';

function withMockedNow<T>(iso: string, fn: () => T): T {
  const RealDate = Date;
  const fixedTime = new RealDate(iso).getTime();

  class MockDate extends RealDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(fixedTime);
        return;
      }
      super(...(args as ConstructorParameters<typeof RealDate>));
    }

    static now() {
      return fixedTime;
    }
  }

  (globalThis as any).Date = MockDate;
  try {
    return fn();
  } finally {
    (globalThis as any).Date = RealDate;
  }
}

test('smoothInternshipIncome applies one-third smoothing', () => {
  assert.equal(smoothInternshipIncome(9000, 3000), 10000);
});

test('getDaysRemainingInMonth returns inclusive remaining days', () => {
  const result = withMockedNow('2026-03-17T10:00:00.000Z', () => getDaysRemainingInMonth());
  assert.equal(result, 15);
});

test('getMonthSpend sums current month only', () => {
  const expenses: Expense[] = [
    { amount: 100, loggedAt: new Date('2026-03-01T09:00:00.000Z') },
    { amount: 200, loggedAt: new Date('2026-03-15T09:00:00.000Z') },
    { amount: 300, loggedAt: new Date('2026-02-28T09:00:00.000Z') },
  ];

  const result = withMockedNow('2026-03-17T10:00:00.000Z', () => getMonthSpend(expenses));
  assert.equal(result, 300);
});

test('getUpcomingLiabilities sums unpaid liabilities due within window', () => {
  const liabilities: SemesterLiability[] = [
    { id: 'a', amount: 1500, dueDate: new Date('2026-03-20T00:00:00.000Z'), isPaid: false },
    { id: 'b', amount: 900, dueDate: new Date('2026-04-10T00:00:00.000Z'), isPaid: false },
    { id: 'c', amount: 700, dueDate: new Date('2026-03-25T00:00:00.000Z'), isPaid: true },
  ];

  const result = withMockedNow('2026-03-17T10:00:00.000Z', () => getUpcomingLiabilities(liabilities));
  assert.equal(result, 2400);
});

test('calculateDailyLimit guards against negative and divide-by-zero cases', () => {
  assert.equal(calculateDailyLimit(1500, 10), 150);
  assert.equal(calculateDailyLimit(-100, 10), 0);
  assert.equal(calculateDailyLimit(500, 0), 0);
});

test('getBurnRateStatus classifies safe, warning, and critical correctly', () => {
  assert.equal(getBurnRateStatus(500, 300), 'safe');
  assert.equal(getBurnRateStatus(500, 450), 'warning');
  assert.equal(getBurnRateStatus(500, 510), 'critical');
});

test('getSurvivalMode flags low runway', () => {
  assert.equal(getSurvivalMode(900, 10), true);
  assert.equal(getSurvivalMode(2000, 10), false);
});

test('getMonthEndPrediction returns runout day or null when on track', () => {
  const runout = withMockedNow('2026-03-17T10:00:00.000Z', () => getMonthEndPrediction(1000, 100));
  assert.equal(runout, 27);

  const onTrack = withMockedNow('2026-03-17T10:00:00.000Z', () => getMonthEndPrediction(3000, 50));
  assert.equal(onTrack, null);
});

test('getWeekendSpikeFactor computes ratio over last 14 days', () => {
  const expenses: Expense[] = [
    { amount: 200, loggedAt: new Date('2026-03-07T12:00:00.000Z') },
    { amount: 200, loggedAt: new Date('2026-03-08T12:00:00.000Z') },
    { amount: 200, loggedAt: new Date('2026-03-14T12:00:00.000Z') },
    { amount: 200, loggedAt: new Date('2026-03-15T12:00:00.000Z') },
    { amount: 100, loggedAt: new Date('2026-03-09T12:00:00.000Z') },
    { amount: 100, loggedAt: new Date('2026-03-10T12:00:00.000Z') },
    { amount: 100, loggedAt: new Date('2026-03-11T12:00:00.000Z') },
    { amount: 100, loggedAt: new Date('2026-03-12T12:00:00.000Z') },
  ];

  const result = withMockedNow('2026-03-17T10:00:00.000Z', () => getWeekendSpikeFactor(expenses));
  assert.equal(result, 2);
});

test('getWeekendSpikeFactor returns null with insufficient weekend data', () => {
  const expenses: Expense[] = [
    { amount: 100, loggedAt: new Date('2026-03-14T12:00:00.000Z') },
    { amount: 80, loggedAt: new Date('2026-03-10T12:00:00.000Z') },
  ];

  const result = withMockedNow('2026-03-17T10:00:00.000Z', () => getWeekendSpikeFactor(expenses));
  assert.equal(result, null);
});

test('computeDailySummary orchestrates all calculations', () => {
  const profile: StudentProfile = {
    monthlyPocketMoney: 9000,
    internshipIncome: 3000,
    semesterStartDate: new Date('2026-01-10T00:00:00.000Z'),
    semesterEndDate: new Date('2026-05-20T00:00:00.000Z'),
  };

  const liabilities: SemesterLiability[] = [
    { id: 'l1', amount: 1200, dueDate: new Date('2026-03-20T00:00:00.000Z'), isPaid: false },
    { id: 'l2', amount: 800, dueDate: new Date('2026-04-10T00:00:00.000Z'), isPaid: false },
  ];

  const expenses: Expense[] = [
    { amount: 100, loggedAt: new Date('2026-03-17T08:00:00.000Z') },
    { amount: 200, loggedAt: new Date('2026-03-17T12:00:00.000Z') },
    { amount: 300, loggedAt: new Date('2026-03-10T10:00:00.000Z') },
    { amount: 400, loggedAt: new Date('2026-03-02T10:00:00.000Z') },
    { amount: 900, loggedAt: new Date('2026-02-28T10:00:00.000Z') },
  ];

  const summary = withMockedNow('2026-03-17T10:00:00.000Z', () =>
    computeDailySummary(profile, liabilities, expenses)
  );

  assert.equal(summary.effectiveMonthlyIncome, 10000);
  assert.equal(summary.totalMonthSpend, 1000);
  assert.equal(summary.remainingBudget, 9000);
  assert.equal(summary.upcomingLiabilities, 2000);
  assert.equal(summary.adjustedRemaining, 7000);
  assert.equal(summary.daysRemaining, 15);
  assert.equal(summary.safeDailyLimit, 7000 / 15);
  assert.equal(summary.todaySpend, 300);
  assert.equal(summary.burnRateStatus, 'safe');
  assert.equal(summary.isSurvivalMode, false);
  assert.equal(summary.monthEndPredictionDay, null);
  assert.equal(summary.weekendSpikeFactor, null);
});
