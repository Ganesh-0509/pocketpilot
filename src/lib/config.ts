/**
 * @fileOverview Environment Configuration
 * 
 * Validates all required environment variables at startup.
 */

// ============================================================================
// REQUIRED ENV VARS
// ============================================================================

const REQUIRED_ENV_VARS = {
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase Anonymous Key',
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase Service Role Key',
  GOOGLE_GENAI_API_KEY: 'Google Generative AI API Key',
} as const;

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate all required environment variables.
 * Throws an error if any are missing.
 */
export function validateEnvironment(): void {
  const missingVars: string[] = [];

  for (const [envVar, description] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[envVar];

    if (!value || value.trim() === '') {
      missingVars.push(`${envVar} (${description})`);
    }
  }

  if (missingVars.length > 0) {
    const message = `Missing required environment variables:\n${missingVars
      .map((v) => `  - ${v}`)
      .join('\n')}\n\nPlease check your .env.local file.`;

    console.error(message);

    // In development, throw error; in production, warn only
    if (process.env.NODE_ENV === 'development') {
      throw new Error(message);
    } else {
      console.warn(
        '[WARNING] Some environment variables are not configured. App may not work correctly.'
      );
    }
  }
}

/**
 * Get an environment variable with fallback.
 */
export function getEnvVar(key: keyof typeof REQUIRED_ENV_VARS): string {
  const value = process.env[key];

  if (!value || value.trim() === '') {
    throw new Error(
      `Environment variable ${key} is required but not set`
    );
  }

  return value;
}

/**
 * Check if running in development mode.
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
}

/**
 * Check if running in production mode.
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Validate at module load time (only in production for CI/CD safety)
if (typeof window === 'undefined' && isProduction()) {
  validateEnvironment();
}

// ============================================================================
// EXPORTS
// ============================================================================

export const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  googleGenAIKey: process.env.GOOGLE_GENAI_API_KEY || '',
  isDevelopment: isDevelopment(),
  isProduction: isProduction(),
} as const;
