/**
 * @fileOverview PocketPilot Error Handling
 * 
 * Centralized error handling with user-friendly messages and error codes.
 */

// ============================================================================
// ERROR CODES
// ============================================================================

export enum ErrorCode {
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  INSUFFICIENT_BUDGET = 'INSUFFICIENT_BUDGET',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SUPABASE_ERROR = 'SUPABASE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// ============================================================================
// ERROR CLASS
// ============================================================================

export class AppError extends Error {
  code: ErrorCode;
  userMessage: string;

  constructor(
    code: ErrorCode,
    message: string,
    userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage || message;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ============================================================================
// ERROR MESSAGE MAPPING
// ============================================================================

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_REQUIRED]:
    'You need to sign in to access this feature. Please log in first.',
  [ErrorCode.PROFILE_NOT_FOUND]:
    'Student profile not found. Please complete onboarding first.',
  [ErrorCode.INSUFFICIENT_BUDGET]:
    'Insufficient budget. Please adjust the amount or update your budget.',
  [ErrorCode.NETWORK_ERROR]:
    'Network error. Please check your connection and try again.',
  [ErrorCode.VALIDATION_ERROR]:
    'Invalid input. Please check your entries and try again.',
  [ErrorCode.SUPABASE_ERROR]:
    'Database error. Your request could not be processed. Please try again.',
  [ErrorCode.UNKNOWN_ERROR]:
    'Something went wrong. Please try again later or contact support.',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert any error to a user-friendly message.
 * 
 * @param error - Any error type
 * @returns string - User-friendly error message
 */
export function formatUserError(error: unknown): string {
  // AppError with userMessage
  if (error instanceof AppError) {
    return error.userMessage;
  }

  // Supabase errors
  if (error instanceof Error && error.message.includes('CONSTRAINT')) {
    return ERROR_MESSAGES[ErrorCode.SUPABASE_ERROR];
  }

  if (error instanceof Error && error.message.includes('fetch')) {
    return ERROR_MESSAGES[ErrorCode.NETWORK_ERROR];
  }

  // Generic Error
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  // String
  if (typeof error === 'string') {
    return error;
  }

  // Fallback
  return ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];
}

/**
 * Check if error is a network error.
 * 
 * @param error - Any error type
 * @returns boolean
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.code === ErrorCode.NETWORK_ERROR;
  }

  if (error instanceof Error) {
    return error.message.toLowerCase().includes('network') ||
           error.message.toLowerCase().includes('fetch') ||
           error.message.toLowerCase().includes('offline');
  }

  return false;
}

/**
 * Check if error is an auth error.
 * 
 * @param error - Any error type
 * @returns boolean
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.code === ErrorCode.AUTH_REQUIRED;
  }

  if (error instanceof Error) {
    return error.message.toLowerCase().includes('auth') ||
           error.message.toLowerCase().includes('unauthorized') ||
           error.message.toLowerCase().includes('unauthenticated');
  }

  return false;
}

/**
 * Create an AppError from various sources.
 * 
 * @param error - Any error
 * @returns AppError
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Determine error code from error message
    let code = ErrorCode.UNKNOWN_ERROR;

    if (error.message.includes('auth')) {
      code = ErrorCode.AUTH_REQUIRED;
    } else if (error.message.includes('not found')) {
      code = ErrorCode.PROFILE_NOT_FOUND;
    } else if (error.message.includes('budget')) {
      code = ErrorCode.INSUFFICIENT_BUDGET;
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      code = ErrorCode.NETWORK_ERROR;
    } else if (error.message.includes('validation')) {
      code = ErrorCode.VALIDATION_ERROR;
    }

    return new AppError(code, error.message, ERROR_MESSAGES[code]);
  }

  if (typeof error === 'string') {
    return new AppError(ErrorCode.UNKNOWN_ERROR, error, error);
  }

  return new AppError(
    ErrorCode.UNKNOWN_ERROR,
    'Unknown error occurred',
    ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR]
  );
}

/**
 * Log error to console in development, Sentry in production (optional).
 * 
 * @param error - Any error
 * @param context - Additional context
 */
export function logError(error: unknown, context?: string): void {
  const appError = toAppError(error);

  if (process.env.NODE_ENV === 'development') {
    console.error(
      `[${appError.code}] ${context || 'Error'}:`,
      appError.message
    );
  }

  // TODO: Integrate with Sentry for production monitoring
  // Sentry.captureException(appError, { contexts: { custom: { context } } });
}
