/**
 * @fileOverview Security Integration Examples
 * 
 * Code patterns for integrating security layers throughout PocketPilot.
 */

/*
============================================================================
EXAMPLE 1: EXPENSE FORM WITH VALIDATION & SANITIZATION
============================================================================
*/

/*
// In src/app/(app)/expenses/page.tsx

'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';
import { validateExpense, sanitizeExpenseInput } from '@/lib/validation';
import { Expense } from '@/lib/validation';

export function ExpenseForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient(...);

  async function handleSubmit(formData: any) {
    try {
      setIsLoading(true);

      // 1. Sanitize input first
      const sanitized = sanitizeExpenseInput(formData);

      // 2. Validate with Zod schema
      const { success, data, error } = await validateExpense(sanitized);
      if (!success) {
        toast.error(error); // User-friendly message
        return;
      }

      // 3. Insert validated data to Supabase
      // (RLS policy will ensure user_id = auth.uid())
      const { error: dbError } = await supabase
        .from('expenses')
        .insert({
          ...data,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (dbError) throw dbError;

      toast.success('Expense logged successfully');
    } catch (error) {
      toast.error('Failed to log expense');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
*/

/*
============================================================================
EXAMPLE 2: AI COACHING WITH RATE LIMITING
============================================================================
*/

/*
// In src/components/chatbot.tsx or dashboard

import { checkAIRateLimit, recordAICall } from '@/lib/security';
import { generateCoachingInsight } from '@/lib/ai/studentCoach';

async function handleGetInsight(userId: string, context: CoachingContext) {
  try {
    // 1. Check rate limit
    const { allowed, remaining, cachedResponse, resetTime } = 
      await checkAIRateLimit(userId);

    if (!allowed) {
      // User hit rate limit
      if (cachedResponse) {
        toast.info('Showing previous insight (rate limit reached)');
        return cachedResponse;
      }

      const minutes = Math.ceil(resetTime / 60000);
      const seconds = Math.ceil((resetTime % 60000) / 1000);
      const timeStr = minutes > 0 
        ? `${minutes}m ${seconds}s`
        : `${seconds}s`;

      toast.warning(
        `You've used all 10 daily insights. Try again in ${timeStr}.`
      );
      return null;
    }

    // 2. Show remaining count
    toast.info(`${remaining} insights remaining today`);

    // 3. Generate insight
    const insight = await generateCoachingInsight(context);

    // 4. Record the call
    await recordAICall(userId, insight);

    return insight;
  } catch (error) {
    console.error('Error getting insight:', error);
    toast.error('Failed to generate insight');
    return null;
  }
}
*/

/*
============================================================================
EXAMPLE 3: ONBOARDING FORM WITH VALIDATION
============================================================================
*/

/*
// In src/app/onboarding/page.tsx

import { validateOnboarding, sanitizeOnboardingInput } from '@/lib/validation';

async function handleOnboardingStep(step: 1 | 2 | 3 | 4, formData: any) {
  try {
    // 1. Sanitize
    const sanitized = sanitizeOnboardingInput(formData);

    // 2. Validate for specific step
    const { success, data, error } = await validateOnboarding(sanitized, step);
    if (!success) {
      return { success: false, error };
    }

    // 3. Save to Supabase
    const { error: dbError } = await supabase
      .from('student_profiles')
      .update(data)
      .eq('user_id', userId);

    if (dbError) throw dbError;
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to save' };
  }
}
*/

/*
============================================================================
EXAMPLE 4: API ROUTE WITH USER VERIFICATION
============================================================================
*/

/*
// In src/app/api/expenses/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';
import { validateExpense, sanitizeExpenseInput } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify environment
    const { supabaseUrl, supabaseServiceRoleKey } = config;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 2. Get authenticated user
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = 
      await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 3. Parse and validate input
    const body = await req.json();
    const sanitized = sanitizeExpenseInput(body);
    const { success, data, error } = await validateExpense(sanitized);

    if (!success) {
      return NextResponse.json(
        { error: error || 'Validation failed' },
        { status: 400 }
      );
    }

    // 4. Insert with user_id from auth
    const { data: expense, error: dbError } = await supabase
      .from('expenses')
      .insert({
        ...data,
        user_id: user.id,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: 'Failed to create expense' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: expense }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/

/*
============================================================================
EXAMPLE 5: REACT HOOK FORM + ZEPHYR INTEGRATION (Current App Pattern)
============================================================================
*/

/*
// In expense logging component with React Hook Form + Zod

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema } from '@/lib/validation';
import { sanitizeExpenseInput } from '@/lib/security';

export function ExpenseForm() {
  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      category: 'food',
      note: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  async function onSubmit(data: any) {
    try {
      // Sanitize before sending
      const sanitized = sanitizeExpenseInput(data);

      const response = await fetch('/api/expenses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitized),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      const { data: expense } = await response.json();
      toast.success('Expense logged');
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to log');
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('amount', { valueAsNumber: true })} />
      {form.formState.errors.amount && (
        <span>{form.formState.errors.amount.message}</span>
      )}
      {/* Other fields */}
    </form>
  );
}
*/

/*
============================================================================
EXAMPLE 6: ENVIRONMENT VALIDATION AT APP START
============================================================================
*/

/*
// In app/layout.tsx or app/providers.tsx (server component)

import { validateEnvironment } from '@/lib/config';

// Call during build/startup (only runs on server)
if (typeof window === 'undefined') {
  try {
    validateEnvironment();
  } catch (error) {
    console.error(error);
    // In development: app won't start
    // In production: warning logged but app continues
  }
}

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
*/

/*
============================================================================
SUMMARY: SECURITY LAYER INTEGRATION FLOW
============================================================================

1. Form Input
   ↓
2. Client-side Zod Validation (React Hook Form)
   ↓
3. Sanitization (stripHTML, trim, enforce max-length)
   ↓
4. API Route or Direct Supabase Call
   ↓
5. Server-side Re-validation (validateExpense, etc)
   ↓
6. RLS Policy Check (auth.uid() = user_id)
   ↓
7. Database CHECK Constraints (amount, length, etc)
   ↓
8. Stored in Database (secured)

Each layer provides defense-in-depth:
- Client validation: UX feedback, catch honest mistakes
- Sanitization: Prevent XSS, normalize data
- Server validation: Catch tampering (e.g., fetch API bypass)
- RLS: Prevent direct DB access unauthorized queries
- Constraints: Prevent corrupt data even if bugs exist

============================================================================
*/
