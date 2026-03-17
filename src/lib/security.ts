/**
 * @fileOverview Security Utilities
 * 
 * Text sanitization, HTML stripping, and rate limiting helpers.
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// TEXT SANITIZATION
// ============================================================================

/**
 * Sanitize text input by trimming and stripping HTML tags.
 */
export function sanitizeText(input: string, maxLength: number = 500): string {
  // Trim whitespace
  let sanitized = input.trim();

  // Strip HTML tags (remove anything between < and >)
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  sanitized = decodeHTMLEntities(sanitized);

  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
  }

  return sanitized;
}

/**
 * Sanitize title field (stricter than description).
 */
export function sanitizeTitle(input: string, maxLength: number = 100): string {
  let sanitized = input.trim();

  // Strip HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove special characters (allow only alphanumeric, spaces, hyphens, commas, periods)
  sanitized = sanitized.replace(/[^\w\s\-.,]/g, '');

  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
  }

  return sanitized;
}

/**
 * Sanitize description field.
 */
export function sanitizeDescription(input: string, maxLength: number = 200): string {
  return sanitizeText(input, maxLength);
}

/**
 * Decode HTML entities.
 */
function decodeHTMLEntities(text: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };

  return text.replace(/&[a-z]+;/g, (match) => map[match] || match);
}

// ============================================================================
// RATE LIMITING FOR AI CALLS
// ============================================================================

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_CALLS = 10;
const RATE_LIMIT_TABLE = 'ai_coaching_rate_limit';

interface RateLimitRecord {
  user_id: string;
  call_count: number;
  window_start: string;
  last_response_cache: string | null;
  last_response_timestamp: string | null;
}

/**
 * Check if user has exceeded rate limit for AI coaching.
 * If limit exceeded, returns the cached last response if available.
 */
export async function checkAIRateLimit(
  userId: string
): Promise<{
  allowed: boolean;
  remaining: number;
  cachedResponse?: string;
  resetTime?: number; // milliseconds until reset
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

    // Get or create rate limit record
    const { data: record, error: fetchError } = await supabase
      .from(RATE_LIMIT_TABLE)
      .select('user_id,call_count,window_start,last_response_cache,last_response_timestamp')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = not found
      throw fetchError;
    }

    // If no record or window expired, create new record
    if (!record) {
      await supabase.from(RATE_LIMIT_TABLE).insert({
        user_id: userId,
        call_count: 0,
        window_start: now.toISOString(),
      });

      return { allowed: true, remaining: RATE_LIMIT_MAX_CALLS };
    }

    const recordWindowStart = new Date(record.window_start);

    // If window expired, reset counter
    if (recordWindowStart < windowStart) {
      await supabase
        .from(RATE_LIMIT_TABLE)
        .update({
          call_count: 0,
          window_start: now.toISOString(),
        })
        .eq('user_id', userId);

      return { allowed: true, remaining: RATE_LIMIT_MAX_CALLS };
    }

    // Check if limit exceeded
    const remaining = RATE_LIMIT_MAX_CALLS - record.call_count;

    if (record.call_count >= RATE_LIMIT_MAX_CALLS) {
      const resetTime = recordWindowStart.getTime() + RATE_LIMIT_WINDOW_MS;
      const msUntilReset = Math.max(0, resetTime - now.getTime());

      return {
        allowed: false,
        remaining: 0,
        resetTime: msUntilReset,
        cachedResponse: record.last_response_cache || undefined,
      };
    }

    return { allowed: true, remaining };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the call (fail open)
    return { allowed: true, remaining: RATE_LIMIT_MAX_CALLS };
  }
}

/**
 * Record an AI coaching call.
 */
export async function recordAICall(userId: string, response: string): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    const now = new Date();

    // Get current record
    const { data: record } = await supabase
      .from(RATE_LIMIT_TABLE)
      .select('user_id,call_count,window_start,last_response_cache,last_response_timestamp')
      .eq('user_id', userId)
      .single();

    if (!record) {
      // Create new record
      await supabase.from(RATE_LIMIT_TABLE).insert({
        user_id: userId,
        call_count: 1,
        window_start: now.toISOString(),
        last_response_cache: response,
        last_response_timestamp: now.toISOString(),
      });
    } else {
      // Increment counter and update cache
      await supabase
        .from(RATE_LIMIT_TABLE)
        .update({
          call_count: record.call_count + 1,
          last_response_cache: response,
          last_response_timestamp: now.toISOString(),
        })
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error('Error recording AI call:', error);
    // Silent fail - don't break the user experience
  }
}

// ============================================================================
// INPUT SANITIZATION FOR FORMS
// ============================================================================

/**
 * Sanitize all expense form fields.
 */
export function sanitizeExpenseInput(data: any) {
  return {
    ...data,
    note: data.note ? sanitizeDescription(data.note, 200) : undefined,
  };
}

/**
 * Sanitize all liability form fields.
 */
export function sanitizeLiabilityInput(data: any) {
  return {
    ...data,
    title: sanitizeTitle(data.title, 100),
  };
}

/**
 * Sanitize onboarding form fields.
 */
export function sanitizeOnboardingInput(data: any) {
  return {
    ...data,
    college_name: sanitizeTitle(data.college_name, 100),
  };
}
