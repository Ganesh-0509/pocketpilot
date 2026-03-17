/**
 * @fileOverview Zod Validation Schemas
 * 
 * Type-safe form validation for all PocketPilot inputs.
 */

import { z } from 'zod';

// ============================================================================
// ONBOARDING SCHEMA
// ============================================================================

export const onboardingStep1Schema = z.object({
  college_name: z
    .string()
    .min(2, 'College name must be at least 2 characters')
    .max(100, 'College name must be less than 100 characters')
    .trim(),
  living_type: z.enum(['hostel', 'day_scholar'], {
    errorMap: () => ({ message: 'Please select a valid living type' }),
  }),
});

export const onboardingStep2Schema = z.object({
  monthly_income: z
    .number()
    .min(1000, 'Monthly income must be at least ₹1000')
    .max(1000000, 'Monthly income must be less than ₹1,000,000'),
  internship_active: z.boolean(),
  internship_income: z.number().min(0).optional(),
});

export const onboardingStep3Schema = z.object({
  semester_start_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  semester_end_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
}).refine(
  (data) => new Date(data.semester_start_date) < new Date(data.semester_end_date),
  {
    message: 'End date must be after start date',
    path: ['semester_end_date'],
  }
);

export const onboardingStep4Schema = z.object({
  liabilities: z
    .array(
      z.object({
        title: z
          .string()
          .min(2, 'Title must be at least 2 characters')
          .max(100, 'Title must be less than 100 characters')
          .trim(),
        amount: z
          .number()
          .positive('Amount must be a positive number')
          .max(500000, 'Amount must be less than ₹500,000'),
        due_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
        category: z.enum(
          ['fees', 'accommodation', 'travel', 'textbooks', 'other'],
          { errorMap: () => ({ message: 'Invalid category' }) }
        ),
      })
    )
    .max(5, 'Maximum 5 liabilities allowed'),
});

export const completeOnboardingSchema = onboardingStep1Schema.and(onboardingStep2Schema).and(onboardingStep3Schema).and(onboardingStep4Schema);

// ============================================================================
// EXPENSE SCHEMA
// ============================================================================

export const expenseSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(50000, 'Amount must be less than ₹50,000'),
  category: z.enum(
    ['food', 'transport', 'entertainment', 'shopping', 'utilities', 'tuition', 'other'],
    { errorMap: () => ({ message: 'Invalid expense category' }) }
  ),
  note: z
    .string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date')
    .refine(
      (date) => new Date(date) <= new Date(),
      'Cannot log expenses for future dates'
    ),
});

// ============================================================================
// LIABILITY SCHEMA
// ============================================================================

export const liabilitySchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(500000, 'Amount must be less than ₹500,000'),
  due_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date')
    .refine(
      (date) => new Date(date) > new Date(),
      'Due date must be in the future'
    ),
  category: z.enum(
    ['fees', 'accommodation', 'travel', 'textbooks', 'other'],
    { errorMap: () => ({ message: 'Invalid category' }) }
  ).optional(),
});

// ============================================================================
// TYPE EXPORTS (Using z.infer for type safety)
// ============================================================================

export type OnboardingStep1 = z.infer<typeof onboardingStep1Schema>;
export type OnboardingStep2 = z.infer<typeof onboardingStep2Schema>;
export type OnboardingStep3 = z.infer<typeof onboardingStep3Schema>;
export type OnboardingStep4 = z.infer<typeof onboardingStep4Schema>;
export type CompleteOnboarding = z.infer<typeof completeOnboardingSchema>;

export type Expense = z.infer<typeof expenseSchema>;
export type Liability = z.infer<typeof liabilitySchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate form data and return typed result.
 */
export async function validateOnboarding(
  data: unknown,
  step: 1 | 2 | 3 | 4
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const schemas = {
      1: onboardingStep1Schema,
      2: onboardingStep2Schema,
      3: onboardingStep3Schema,
      4: onboardingStep4Schema,
    };

    const validated = await schemas[step].parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors[0]?.message || 'Validation failed';
      return { success: false, error: message };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

/**
 * Validate expense and return typed result.
 */
export async function validateExpense(
  data: unknown
): Promise<{ success: boolean; data?: Expense; error?: string }> {
  try {
    const validated = await expenseSchema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors[0]?.message || 'Validation failed';
      return { success: false, error: message };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

/**
 * Validate liability and return typed result.
 */
export async function validateLiability(
  data: unknown
): Promise<{ success: boolean; data?: Liability; error?: string }> {
  try {
    const validated = await liabilitySchema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors[0]?.message || 'Validation failed';
      return { success: false, error: message };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}
