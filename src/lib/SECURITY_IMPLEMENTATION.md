/**
 * @fileOverview Security Implementation Guide
 * 
 * Complete hardening checklist and integration guide for PocketPilot.
 */

/*
============================================================================
SECURITY LAYERS IMPLEMENTED
============================================================================

1. INPUT VALIDATION (lib/validation.ts)
   ✓ Zod schemas for all forms (onboarding, expense, liability)
   ✓ Type-safe validation with z.infer<>
   ✓ Custom error messages for users
   ✓ Async validation helpers with error handling

2. INPUT SANITIZATION (lib/security.ts)
   ✓ Text trimming and whitespace normalization
   ✓ HTML tag stripping (prevent XSS)
   ✓ HTML entity decoding
   ✓ Max length enforcement
   ✓ Special character filtering for titles
   ✓ Separate functions for title vs description

3. RATE LIMITING (lib/security.ts)
   ✓ AI coaching: Max 10 calls/hour per user
   ✓ Sliding window with window_start timestamp
   ✓ Cached response fallback when limit hit
   ✓ Auto-reset on window expiration
   ✓ Graceful failure (fail open on error)

4. ROW-LEVEL SECURITY (supabase-rls-policies.sql)
   ✓ All tables have RLS enabled
   ✓ SELECT policies: auth.uid() = user_id
   ✓ INSERT policies: WITH CHECK (auth.uid() = user_id)
   ✓ UPDATE policies: USING (auth.uid() = user_id)
   ✓ DELETE policies: USING (auth.uid() = user_id)
   ✓ Service role can award badges

5. DATABASE CONSTRAINTS (supabase-rls-policies.sql)
   ✓ CHECK constraints on amount fields (min/max)
   ✓ CHECK constraints on text length fields
   ✓ Prevents invalid data at DB level even if app layer bypassed

6. ENVIRONMENT VALIDATION (lib/config.ts)
   ✓ Validates all required env vars at startup
   ✓ Throws clear error message if missing
   ✓ Development vs Production modes
   ✓ Centralized config export

============================================================================
INTEGRATION CHECKLIST
============================================================================

[ ] 1. ENABLE RLS IN SUPABASE
    Follow instructions in supabase-rls-policies.sql:
    - Run CREATE POLICY statements for each table
    - Run ALTER TABLE ENABLE ROW LEVEL SECURITY for each table
    - Run verification queries to confirm working

[ ] 2. ADD CHECK CONSTRAINTS
    In Supabase SQL Editor:
    - Run all ALTER TABLE ADD CONSTRAINT statements
    - Verify no errors

[ ] 3. CREATE AI RATE LIMIT TABLE
    CREATE TABLE ai_coaching_rate_limit (
      user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      call_count INT DEFAULT 0,
      window_start TIMESTAMP DEFAULT NOW(),
      last_response_cache TEXT,
      last_response_timestamp TIMESTAMP,
      updated_at TIMESTAMP DEFAULT NOW()
    );

[ ] 4. IMPORT VALIDATION IN FORMS
    // In onboarding, expense log, liability forms:
    import { validateExpense, sanitizeExpenseInput } from '@/lib/validation';
    import { sanitizeExpenseInput } from '@/lib/security';
    
    // In form submission:
    const sanitized = sanitizeExpenseInput(formData);
    const { success, data, error } = await validateExpense(sanitized);
    if (!success) {
      toast.error(error); // Show user-friendly message
      return;
    }
    
    // Use validated data
    await supabase.from('expenses').insert(data);

[ ] 5. USE RATE LIMITING IN AI COACHING
    // In student coach flow:
    import { checkAIRateLimit, recordAICall } from '@/lib/security';
    
    const { allowed, remaining, cachedResponse, resetTime } = 
      await checkAIRateLimit(userId);
    
    if (!allowed) {
      if (cachedResponse) {
        // Return cached response
        return { insight: cachedResponse };
      }
      // Show user: "You've reached 10 insights/hour. Try again in X minutes."
      const minutes = Math.ceil(resetTime / 60000);
      toast.error(`Rate limit reached. Try again in ${minutes} min`);
      return null;
    }
    
    // Make AI call
    const response = await generateCoachingInsight(context);
    
    // Record the call
    await recordAICall(userId, response);

[ ] 6. VALIDATE ENV VARS AT STARTUP
    // In app/layout.tsx or root component:
    import { validateEnvironment } from '@/lib/config';
    
    if (typeof window === 'undefined') {
      validateEnvironment(); // Throws on missing vars
    }

[ ] 7. TEST RLS POLICIES
    Follow verification queries in supabase-rls-policies.sql:
    - Open Supabase SQL Editor
    - Run each verification query
    - Confirm expected results
    - Log in as different users and verify data isolation

[ ] 8. API ROUTE PROTECTION
    // In all API routes, include user check:
    import { config } from '@/lib/config';
    
    export async function POST(req: Request) {
      const supabase = createClient(
        config.supabaseUrl,
        config.supabaseServiceRoleKey
      );
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return new Response('Unauthorized', { status: 401 });
      }
      
      // Continue with request for user.id
    }

============================================================================
TESTING PROCEDURES
============================================================================

Test 1: Input Validation
--------
1. Navigate to onboarding form
2. Try entering:
   - College name: "A" (should fail: min 2 chars)
   - Income: 500 (should fail: min 1000)
   - Income: 2000000 (should fail: max 1000000)
3. Verify error messages show

Test 2: HTML Injection Prevention
--------
1. Try to log expense with note: "<script>alert('XSS')</script>"
2. View expense in list - should show: "script>alert('XSS')/script>"
3. Verify no alert triggered

Test 3: Rate Limiting
--------
1. Visit dashboard (triggers generateCoachingInsight)
2. Call AI assistant 10 times rapidly
3. On 11th call, should see: "Rate limit reached. Try again in X min"
4. Verify cached response shown if available

Test 4: RLS Policy Enforcement
--------
In Supabase SQL Editor as User A:
1. SELECT * FROM expenses -> Should show only own expenses
2. SELECT * FROM expenses WHERE user_id != auth.uid() -> Should return 0 rows
3. Try INSERT with different user_id -> Should fail with policy violation

As User B (different account):
1. SELECT * FROM expenses -> Should NOT see User A's expenses
2. DELETE FROM expenses -> Should fail for User A's expenses

Test 5: Environment Variables
--------
1. Remove one required var from .env.local
2. Restart dev server
3. Should see clear error message with missing var name

============================================================================
PRODUCTION CHECKLIST
============================================================================

Before deploying to production:

[ ] RLS enabled on all tables in production Supabase project
[ ] All CHECK constraints added to database schema
[ ] ai_coaching_rate_limit table created
[ ] All environment variables set in production deployment platform
[ ] Rate limiting table has indexes on user_id and window_start
[ ] Database backups configured
[ ] Monitoring set up for RLS policy violations
[ ] Regular security audits scheduled
[ ] Dependency vulnerability scanning (npm audit) automated
[ ] API rate limiting added at edge (Vercel/Infrastructure level)
[ ] CORS headers configured correctly
[ ] HTTPS enforced
[ ] Security headers added (CSP, X-Frame-Options, etc)
[ ] Logging configured for security events
[ ] Incident response plan documented

============================================================================
SECURITY TESTING COMMANDS
============================================================================

# Check for known vulnerabilities
npm audit

# Run TypeScript strict mode
npm run typecheck

# Check for security issues in dependencies
npm audit --fix --force (with caution!)

# View all environment variables being used
grep -r "process.env" src/ --include="*.ts" --include="*.tsx"

============================================================================
ONGOING MAINTENANCE
============================================================================

Weekly:
- Review error logs for suspicious activity
- Check rate limiting metrics
- Monitor for failed authentication attempts

Monthly:
- Review RLS policy effectiveness
- Audit user data access patterns
- Update dependencies for security patches

Quarterly:
- Full security assessment
- Penetration testing (if budget allows)
- Review compliance requirements
- Update security documentation

============================================================================
*/
