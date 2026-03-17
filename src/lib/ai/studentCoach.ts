/**
 * @fileOverview PocketPilot Student Coach AI Flow
 * 
 * Generates contextual coaching insights for Indian college students
 * using priority-based prompt selection and response caching.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import crypto from 'crypto';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CoachingContext {
  remainingBudget: number;
  daysRemaining: number;
  safeDailyLimit: number;
  todaySpend: number;
  isSurvivalMode: boolean;
  weekendSpikeFactor: number | null;
  upcomingLiabilitiesTotal: number;
  nearestLiabilityDays: number | null;
  livingType: 'hostel' | 'day_scholar';
  currentStreak: number;
}

export interface CachedResponse {
  response: string;
  timestamp: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const responseCache = new Map<string, CachedResponse>();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a hash of the coaching context for caching.
 * Uses numeric precision to ensure consistent hashing.
 */
function hashContext(context: CoachingContext): string {
  const contextString = JSON.stringify({
    remainingBudget: Math.round(context.remainingBudget),
    daysRemaining: context.daysRemaining,
    safeDailyLimit: Math.round(context.safeDailyLimit),
    todaySpend: Math.round(context.todaySpend),
    isSurvivalMode: context.isSurvivalMode,
    weekendSpikeFactor: context.weekendSpikeFactor ? Math.round(context.weekendSpikeFactor * 10) : null,
    upcomingLiabilitiesTotal: Math.round(context.upcomingLiabilitiesTotal),
    nearestLiabilityDays: context.nearestLiabilityDays,
    livingType: context.livingType,
    currentStreak: context.currentStreak,
  });

  return crypto.createHash('md5').update(contextString).digest('hex');
}

/**
 * Get cached response if available and not expired.
 */
function getCachedResponse(contextHash: string): string | null {
  const cached = responseCache.get(contextHash);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION_MS) {
    responseCache.delete(contextHash);
    return null;
  }

  return cached.response;
}

/**
 * Store response in cache.
 */
function setCachedResponse(contextHash: string, response: string): void {
  responseCache.set(contextHash, {
    response,
    timestamp: Date.now(),
  });
}

/**
 * Determine priority and return appropriate prompt template.
 * Priority order:
 * 1. Survival Mode (critical)
 * 2. Upcoming Fee (within 7 days)
 * 3. Weekend Spike (spending pattern)
 * 4. General (default)
 */
function selectPromptTemplate(context: CoachingContext): string {
  // PRIORITY 1: Survival Mode
  if (context.isSurvivalMode) {
    return `You are PocketPilot, a financial coach for Indian college students. Student is in Survival Mode with only ₹${Math.round(context.safeDailyLimit)}/day for ${context.daysRemaining} days. Living type: ${context.livingType}. Give ONE specific cost-cutting tip for Indian college students. Mention free campus resources or canteen options. Under 60 words. No markdown. Encouraging tone.`;
  }

  // PRIORITY 2: Upcoming Fee (within 7 days)
  if (
    context.nearestLiabilityDays !== null &&
    context.nearestLiabilityDays <= 7 &&
    context.upcomingLiabilitiesTotal > 0
  ) {
    return `You are PocketPilot. Student has ₹${Math.round(context.upcomingLiabilitiesTotal)} due in ${context.nearestLiabilityDays} day${context.nearestLiabilityDays !== 1 ? 's' : ''}. Current daily limit: ₹${Math.round(context.safeDailyLimit)}. Give ONE specific tip on how to manage spending this week to protect that money. Under 60 words. No markdown.`;
  }

  // PRIORITY 3: Weekend Spike
  if (context.weekendSpikeFactor !== null && context.weekendSpikeFactor > 1.5) {
    return `You are PocketPilot. Student spends ${context.weekendSpikeFactor.toFixed(1)}× more on weekends than weekdays. Don't shame them. Suggest ONE fun alternative that costs less.${context.currentStreak > 0 ? ` Mention their streak of ${context.currentStreak} days.` : ''} Under 60 words. No markdown.`;
  }

  // PRIORITY 4: General (default)
  return `You are PocketPilot. Student has ₹${Math.round(context.remainingBudget)} left this month, ${context.daysRemaining} days remaining, ₹${Math.round(context.safeDailyLimit)}/day limit. Today spent: ₹${Math.round(context.todaySpend)}. Streak: ${context.currentStreak} days. Give ONE encouraging insight or tip. Under 60 words. No markdown.`;
}

// ============================================================================
// GENKIT SCHEMA & FLOW DEFINITION
// ============================================================================

const CoachingContextSchema = z.object({
  remainingBudget: z.number().describe('Remaining budget for the month'),
  daysRemaining: z.number().describe('Days remaining in the month'),
  safeDailyLimit: z.number().describe('Current daily safe-to-spend limit'),
  todaySpend: z.number().describe('Amount spent today'),
  isSurvivalMode: z.boolean().describe('Whether user is in Survival Mode'),
  weekendSpikeFactor: z.number().nullable().describe('Ratio of weekend to weekday spending'),
  upcomingLiabilitiesTotal: z.number().describe('Total upcoming liabilities'),
  nearestLiabilityDays: z.number().nullable().describe('Days until nearest liability'),
  livingType: z.enum(['hostel', 'day_scholar']).describe('Living type'),
  currentStreak: z.number().describe('Current spending streak'),
});

const CoachingInsightOutputSchema = z.object({
  insight: z.string().describe('Coaching insight for the student'),
});

/**
 * Define the coaching insight prompt.
 * Uses priority-based template selection and caching.
 */
const coachingPrompt = ai.definePrompt({
  name: 'studentCoachingInsight',
  input: { schema: CoachingContextSchema },
  output: { schema: CoachingInsightOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: (context: CoachingContext) => {
    const promptTemplate = selectPromptTemplate(context);
    return [{ text: promptTemplate }];
  },
});

/**
 * Define the flow that calls the prompt.
 */
const coachingFlow = ai.defineFlow(
  {
    name: 'studentCoachingFlow',
    inputSchema: CoachingContextSchema,
    outputSchema: CoachingInsightOutputSchema,
  },
  async (context: CoachingContext) => {
    try {
      // Check cache first
      const contextHash = hashContext(context);
      const cachedResponse = getCachedResponse(contextHash);
      
      if (cachedResponse) {
        return { insight: cachedResponse };
      }

      // Call the prompt
      const { output } = await coachingPrompt(context);
      
      if (!output?.insight) {
        throw new Error('AI model returned no insight.');
      }

      // Cache the response
      setCachedResponse(contextHash, output.insight);

      return output;
    } catch (error) {
      console.error('Error in studentCoachingFlow:', error);
      
      // Fallback response
      const fallbackInsights = [
        'Track your spending daily to stay on top of your budget.',
        'Set spending limits for different categories to control your expenses.',
        'Plan your meals to avoid impulsive food purchases.',
        'Use free campus resources like the library and sports facilities.',
        'Consider public transport to reduce travel costs.',
      ];

      const randomInsight = fallbackInsights[Math.floor(Math.random() * fallbackInsights.length)];
      return { insight: randomInsight };
    }
  }
);

// ============================================================================
// MAIN EXPORT
// ============================================================================

/**
 * Generate a personalized coaching insight for the student.
 * 
 * @param context - The student's financial context
 * @returns Promise<string> - The coaching insight
 */
export async function generateCoachingInsight(context: CoachingContext): Promise<string> {
  const result = await coachingFlow(context);
  return result.insight;
}

/**
 * Clear the response cache (useful for testing or manual reset).
 */
export function clearCoachingCache(): void {
  responseCache.clear();
}

/**
 * Get cache stats (useful for debugging).
 */
export function getCoachingCacheStats(): { size: number; entries: string[] } {
  return {
    size: responseCache.size,
    entries: Array.from(responseCache.keys()),
  };
}
