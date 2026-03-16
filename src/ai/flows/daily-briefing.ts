'use server';

/**
 * @fileOverview AI-powered Smart Daily Briefing
 * Provides one-line daily spending guidance with behavioral context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DailyBriefingInputSchema = z.object({
    income: z.number().describe("User's monthly income"),
    dailySpendingLimit: z.number().describe("User's calculated daily spending limit"),
    todaysSpending: z.number().describe("Amount already spent today"),
    dayOfWeek: z.string().describe("Current day of the week (e.g., 'Sunday')"),
    daysLeftInMonth: z.number().describe("Days remaining in the current month"),
    remainingMonthlyBudget: z.number().describe("Remaining budget for the month"),
    todaysTransactions: z.array(z.object({
        amount: z.number(),
        category: z.string(),
        description: z.string(),
    })).describe("List of transactions made today"),
    recentTransactions: z.array(z.object({
        amount: z.number(),
        category: z.string(),
        date: z.string(),
        dayOfWeek: z.string(),
    })).describe('Last 30 days of transactions with day information'),
    runOutDate: z.string().optional().describe("Pre-calculated date when budget will run out if overspending"),
    essentialExpensesLogged: z.number().describe("Total essential expenses logged this month"),
    discretionaryExpensesLogged: z.number().describe("Total discretionary expenses logged this month"),
    savingsGoal: z.number().describe("Monthly savings goal"),
    reservedForUpcomingSemesterCosts: z.number().default(0).describe('Money reserved for semester liabilities due in the next 30 days'),
    survivalMode: z.boolean().default(false).describe('Whether survival mode is active because the daily limit is critically low'),
    weekendSpendingSpike: z.boolean().default(false).describe('Whether weekend spending is significantly higher than weekday spending'),
});
export type DailyBriefingInput = z.infer<typeof DailyBriefingInputSchema>;

const DailyBriefingOutputSchema = z.object({
    spendableToday: z.number().describe('Amount user can still spend today'),
    avoidCategory: z.string().optional().describe('Category to avoid based on overspending patterns'),
    warningMessage: z.string().optional().describe('Emergency alert if user is on track to overspend'),
    behaviorNudge: z.string().optional().describe('Pattern-based reminder for typical spending on this day'),
    mainMessage: z.string().describe('The main one-liner decision message'),
    reasoning: z.string().describe('A detailed explanation of the daily status. If they spent today, break down WHERE it went and how much is left. If they haven\'t spent, explain the goal for today based on history.'),
});
export type DailyBriefingOutput = z.infer<typeof DailyBriefingOutputSchema>;

export async function getDailyBriefing(input: DailyBriefingInput): Promise<DailyBriefingOutput> {
    return dailyBriefingFlow(input);
}

const prompt = ai.definePrompt({
    name: 'dailyBriefingPrompt',
    input: { schema: DailyBriefingInputSchema },
    output: { schema: DailyBriefingOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `
            Role: You are PocketPilot, a precise financial status analyser for students.
            Goal: Provide a deeply accurate "Daily Status" based ONLY on real logs and the safe spending limit formula.

            User Context:
            - Monthly Income: ₹{{income}}
            - Monthly Savings Goal: ₹{{savingsGoal}}
            - Reserved for Upcoming Semester Costs: ₹{{reservedForUpcomingSemesterCosts}}
            - Essential Expenses Logged (this month): ₹{{essentialExpensesLogged}}
            - Discretionary Expenses Logged (this month): ₹{{discretionaryExpensesLogged}}
            - Today's Transactions: {{json todaysTransactions}}
            - Days Remaining (current month): {{daysLeftInMonth}}
            - History: {{json recentTransactions}}
            - Survival Mode: {{survivalMode}}
            - Weekend Spending Spike: {{weekendSpendingSpike}}

            ## Strict Rules:
            1. Use ONLY real data. No assumptions.
            2. Daily Limit = ₹{{dailySpendingLimit}} after accounting for reserved semester costs.
            3. Remaining for Today = Daily Limit - Today's Spending.
            4. If Survival Mode is true, the tone must be strict and defensive.
            5. If Weekend Spending Spike is true, explicitly mention that risk.

            ## Task:
            1. **Summarize Today**: State specifically what was spent today and in which categories.
            2. **Compare with Limit**: Inform the user how today's spending (₹{{todaysSpending}}) compares to their current Daily Limit (₹{{dailySpendingLimit}}).
            3. **Behavioral Insight**: Briefly mention if today's {{dayOfWeek}} spending is higher or lower than their typical {{dayOfWeek}} history.
            4. **Explain Status**: In the reasoning, focus on why they are under or over their current daily limit today.
            5. **Semester Reserve**: When reservedForUpcomingSemesterCosts > 0, acknowledge that some budget is held back for academic costs.

            ## Output Format:
            - mainMessage: Concise status of today vs the current Daily Limit.
            - reasoning: 2-3 sentences explaining today's impact relative to the current daily limit. Use numbers clearly.
            - behaviorNudge: Pattern-based insight for {{dayOfWeek}}.
            - warningMessage: Use this when Survival Mode is true or when today's spending already exceeds the limit.

            All amounts in Indian Rupees (₹). Round ALL currency values to 2 decimal places. No motivational talk.`,
});

const dailyBriefingFlow = ai.defineFlow(
    {
        name: 'dailyBriefingFlow',
        inputSchema: DailyBriefingInputSchema,
        outputSchema: DailyBriefingOutputSchema,
    },
    async (input) => {
        const calculateRemainingForToday = (inp: typeof input) => {
            // Simply use the fixed limit minus what they already spent today
            return Math.max(-999999, inp.dailySpendingLimit - inp.todaysSpending);
        };

        try {
            const spendableToday = calculateRemainingForToday(input);

            const { output } = await prompt(input);
            if (!output) {
                return {
                    spendableToday,
                    mainMessage: spendableToday > 0
                        ? `You have ₹${spendableToday.toFixed(0)} left for today.`
                        : `You've reached your limit for today.`,
                    reasoning: `Based on your current daily limit of ₹${input.dailySpendingLimit} after semester reserves.`,
                    warningMessage: input.survivalMode
                        ? 'Survival Mode activated. Reduce non-essential spending to finish the month.'
                        : undefined,
                };
            }

            return {
                ...output,
                spendableToday,
            };
        } catch (error) {
            console.error('Error in dailyBriefingFlow:', error);
            const spendableToday = calculateRemainingForToday(input);
            return {
                spendableToday,
                mainMessage: spendableToday > 0
                    ? `You have ₹${spendableToday.toFixed(0)} left for today.`
                    : `You've reached your limit for today.`,
                reasoning: `Based on your current daily limit of ₹${input.dailySpendingLimit} after semester reserves.`,
                warningMessage: input.survivalMode
                    ? 'Survival Mode activated. Reduce non-essential spending to finish the month.'
                    : undefined,
            };
        }
    }
);