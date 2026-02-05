'use server';

/**
 * @fileOverview AI-powered investment advisor that provides personalized investment recommendations
 * and tax-saving strategies based on user profile and financial situation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InvestmentAdvisorInputSchema = z.object({
  role: z.enum(['Student', 'Professional', 'Housewife']).describe('User role'),
  income: z.number().describe('Monthly income'),
  savings: z.number().describe('Available savings'),
  currentInvestments: z.array(z.object({
    type: z.string(),
    amount: z.number(),
  })).describe('Current investments'),
  riskTolerance: z.enum(['Low', 'Medium', 'High']).describe('Risk tolerance'),
  investmentTimeline: z.number().describe('Investment timeline in years'),
  taxSavingGoal: z.number().describe('Annual tax-saving goal in rupees'),
});

export type InvestmentAdvisorInput = z.infer<typeof InvestmentAdvisorInputSchema>;

const InvestmentAdvisorOutputSchema = z.object({
  recommendations: z.array(z.object({
    title: z.string(),
    type: z.string(),
    description: z.string(),
    expectedReturn: z.number(),
    riskLevel: z.string(),
    minInvestment: z.number(),
    reason: z.string(),
  })),
  taxSavingStrategies: z.array(z.object({
    section: z.string(),
    description: z.string(),
    potentialSavings: z.number(),
  })),
  overallAdvice: z.string(),
});

export type InvestmentAdvisorOutput = z.infer<typeof InvestmentAdvisorOutputSchema>;

export async function investmentAdvisor(
  input: InvestmentAdvisorInput
): Promise<InvestmentAdvisorOutput> {
  return investmentAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'investmentAdvisorPrompt',
  input: { schema: InvestmentAdvisorInputSchema },
  output: { schema: InvestmentAdvisorOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an expert financial advisor specializing in Indian investments and tax optimization. Based on the user's profile, provide personalized investment recommendations.

## User Profile
- **Role:** {{{role}}}
- **Monthly Income:** ₹{{{income}}}
- **Available Savings:** ₹{{{savings}}}
- **Risk Tolerance:** {{{riskTolerance}}}
- **Investment Timeline:** {{{investmentTimeline}}} years
- **Tax-Saving Goal:** ₹{{{taxSavingGoal}}} per annum

## Current Investments
{{#each currentInvestments}}
- {{type}}: ₹{{amount}}
{{/each}}

## Your Task
1. **Analyze** the user's financial situation
2. **Recommend** 3-5 suitable investments tailored to their profile and role
3. **Suggest** tax-saving strategies using sections like 80C, 80D, 80E, 80G, NPS
4. **Explain** each recommendation with expected returns and risk levels
5. **Provide** overall wealth-building advice specific to {{{role}}} professionals

## Investment Classes to Consider
- Mutual Funds (SIPs): Balanced, Equity, Debt, Index Funds, ELSS
- Stocks: Blue-chip, mid-cap, small-cap based on risk tolerance
- Tax-Saving Instruments: ELSS, Fixed Deposits, NPS, PPF, Bonds
- Crypto: Only if risk tolerance is HIGH
- Gold: Safe haven investment
- Real Estate: Long-term wealth building
- Corporate Bonds: Stable income for professionals

## Tax-Saving Sections (India - Professional Focus)
- 80C: Up to ₹1.5 lakh (Life insurance, ELSS, FD, PPF, NSC, Bonds)
- 80D: Health insurance premium up to ₹25,000 (₹50,000 for self + family)
- 80E: Education loan interest
- 80G: Charitable donations
- NPS: Additional ₹50,000 deduction under 80CCD(1B) for professionals
- HRA: House Rent Allowance exemption if applicable

## Professional-Specific Advice
- Focus on long-term wealth creation given higher income potential
- Balance aggressive growth (equities) with stable income (bonds/fixed deposits)
- Prioritize tax efficiency for higher income brackets
- Consider NPS for retirement planning with flexible withdrawal options
- Build real estate portfolio for long-term appreciation

Generate a comprehensive investment and tax strategy response tailored for {{{role}}} professionals.`,
});

const investmentAdvisorFlow = ai.defineFlow(
  {
    name: 'investmentAdvisorFlow',
    inputSchema: InvestmentAdvisorInputSchema,
    outputSchema: InvestmentAdvisorOutputSchema,
  },
  async (input: InvestmentAdvisorInput) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error('AI model returned no output.');
      }
      return output;
    } catch (error) {
      console.error('Error in investmentAdvisorFlow:', error);
      return {
        recommendations: [],
        taxSavingStrategies: [],
        overallAdvice: 'Unable to generate recommendations at this time. Please try again later.',
      };
    }
  }
);