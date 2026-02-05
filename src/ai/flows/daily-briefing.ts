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
    recentTransactions: z.array(z.object({
        amount: z.number(),
        category: z.string(),
        date: z.string(),
        dayOfWeek: z.string(),
    })).describe('Last 30 days of transactions with day information'),
    runOutDate: z.string().optional().describe("Pre-calculated date when budget will run out if overspending"),
});
export type DailyBriefingInput = z.infer<typeof DailyBriefingInputSchema>;

const DailyBriefingOutputSchema = z.object({
    spendableToday: z.number().describe('Amount user can still spend today'),
    avoidCategory: z.string().optional().describe('Category to avoid based on overspending patterns'),
    warningMessage: z.string().optional().describe('Emergency alert if user is on track to overspend'),
    behaviorNudge: z.string().optional().describe('Pattern-based reminder for typical spending on this day'),
    mainMessage: z.string().describe('The main one-liner decision message'),
    reasoning: z.string().describe('A short explanation of WHY this suggestion was made, citing specific spending patterns and numbers from the user data'),
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
            Role: You are a hyper-concise, proactive financial assistant (Finmate).
            Goal: Give the user ONE clear number to focus on today and ONE behavior to watch.

            Data:
            - Monthly Income: ₹{{income}}
            - Daily Limit: ₹{{dailySpendingLimit}}
            - Already Spent Today: ₹{{todaysSpending}}
            - Days Left in Month: {{daysLeftInMonth}}
            - Remaining Monthly Budget: ₹{{remainingMonthlyBudget}}
            - Recent Transactions: {{json recentTransactions}}
            {{#if runOutDate}}
            - Budget Run Out Date: {{runOutDate}}
            {{/if}}

            ## Your Task:

            1. **Calculate spendableToday**: dailySpendingLimit - todaysSpending (but never negative)

            2. **Find avoidCategory**: Look at the transactions. Which category has the highest total spending? That's the category to suggest avoiding. If no clear pattern, leave empty.

            3. **Generate warningMessage**: check provided runOutDate. If it exists, use it: "At this rate, you'll run out by {{runOutDate}}". Else, calculate based on average spending speed. Leave empty if on track.

4. **Create behaviorNudge**: Look at transactions from the same dayOfWeek. Calculate average spending for this day. Format: "You usually spend ₹X on [top category] on {{{dayOfWeek}}}s". Leave empty if less than 3 transactions on this day.

5. **Compose mainMessage**: A single, clean one-liner showing ONLY the remaining budget. Format: "You can spend ₹[spendableToday] today." Do NOT include what to avoid in this message - keep it simple.

6. **Write reasoning**: Explain WHY you made this suggestion in 2-3 sentences. Cite specific numbers from their spending history. If avoidCategory exists, include advice to avoid that category here. Example: "You've spent ₹2,400 on Food this week, which is 40% above your usual. Consider skipping Food today - your Sunday Food spending averages ₹350."

Be concise, friendly, and actionable. All amounts in Indian Rupees (₹).`,
});

const dailyBriefingFlow = ai.defineFlow(
    {
        name: 'dailyBriefingFlow',
        inputSchema: DailyBriefingInputSchema,
        outputSchema: DailyBriefingOutputSchema,
    },
    async (input) => {
        try {
            // Calculate spendable amount locally for accuracy
            const spendableToday = Math.max(0, input.dailySpendingLimit - input.todaysSpending);

            const { output } = await prompt(input);
            if (!output) {
                return {
                    spendableToday,
                    mainMessage: `You can spend ₹${spendableToday.toFixed(0)} today.`,
                    reasoning: 'Based on your daily spending limit.',
                };
            }

            return {
                ...output,
                spendableToday, // Override with accurate local calculation
            };
        } catch (error) {
            console.error('Error in dailyBriefingFlow:', error);
            const spendableToday = Math.max(0, input.dailySpendingLimit - input.todaysSpending);
            return {
                spendableToday,
                mainMessage: `You can spend ₹${spendableToday.toFixed(0)} today.`,
                reasoning: 'Based on your daily spending limit.',
            };
        }
    }
);