/**
 * @fileOverview Supabase Schema Setup
 * 
 * SQL commands to set up tables, constraints, and RLS for production.
 * Run in Supabase SQL Editor in this order.
 */

/*
============================================================================
1. CREATE RATE LIMITING TABLE
============================================================================
*/

CREATE TABLE IF NOT EXISTS ai_coaching_rate_limit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  call_count INT DEFAULT 0 NOT NULL,
  window_start TIMESTAMP DEFAULT NOW() NOT NULL,
  last_response_cache TEXT,
  last_response_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index for fast lookups
CREATE INDEX idx_ai_rate_limit_user_id ON ai_coaching_rate_limit(user_id);
CREATE INDEX idx_ai_rate_limit_window ON ai_coaching_rate_limit(window_start);

-- Enable RLS
ALTER TABLE ai_coaching_rate_limit ENABLE ROW LEVEL SECURITY;

-- Service role can read/write (for rate limit checks)
CREATE POLICY "Service can manage rate limits" ON ai_coaching_rate_limit
  FOR ALL USING (true);

/*
============================================================================
2. ADD DATABASE CONSTRAINTS FOR DATA INTEGRITY
============================================================================
*/

-- Expenses table constraints
ALTER TABLE expenses 
ADD CONSTRAINT amount_positive CHECK (amount > 0),
ADD CONSTRAINT amount_max_check CHECK (amount <= 50000),
ADD CONSTRAINT note_length_check CHECK (COALESCE(char_length(note), 0) <= 200),
ADD CONSTRAINT category_valid CHECK (category IN (
  'food', 'transport', 'entertainment', 'shopping', 'utilities', 'tuition', 'other'
));

-- Semester liabilities constraints
ALTER TABLE semester_liabilities
ADD CONSTRAINT liability_amount_positive CHECK (amount > 0),
ADD CONSTRAINT liability_amount_max CHECK (amount <= 500000),
ADD CONSTRAINT title_min_length CHECK (char_length(title) >= 2),
ADD CONSTRAINT title_max_length CHECK (char_length(title) <= 100),
ADD CONSTRAINT category_valid CHECK (category IN (
  'fees', 'accommodation', 'travel', 'textbooks', 'other'
)),
ADD CONSTRAINT due_date_future CHECK (due_date > NOW());

-- Student profiles constraints
ALTER TABLE student_profiles
ADD CONSTRAINT income_min CHECK (monthly_income >= 1000),
ADD CONSTRAINT income_max CHECK (monthly_income <= 1000000),
ADD CONSTRAINT college_name_min_length CHECK (char_length(college_name) >= 2),
ADD CONSTRAINT college_name_max_length CHECK (char_length(college_name) <= 100),
ADD CONSTRAINT living_type_valid CHECK (living_type IN ('hostel', 'day_scholar'));

/*
============================================================================
3. ENABLE RLS ON ALL TABLES (If not already enabled)
============================================================================
*/

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE semester_liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

/*
============================================================================
4. CREATE RLS POLICIES - EXPENSES TABLE
============================================================================
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;

-- Create policies
CREATE POLICY "Users can read own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

/*
============================================================================
5. CREATE RLS POLICIES - SEMESTER_LIABILITIES TABLE
============================================================================
*/

DROP POLICY IF EXISTS "Users can read own liabilities" ON semester_liabilities;
DROP POLICY IF EXISTS "Users can insert own liabilities" ON semester_liabilities;
DROP POLICY IF EXISTS "Users can update own liabilities" ON semester_liabilities;
DROP POLICY IF EXISTS "Users can delete own liabilities" ON semester_liabilities;

CREATE POLICY "Users can read own liabilities" ON semester_liabilities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own liabilities" ON semester_liabilities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own liabilities" ON semester_liabilities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own liabilities" ON semester_liabilities
  FOR DELETE USING (auth.uid() = user_id);

/*
============================================================================
6. CREATE RLS POLICIES - STUDENT_PROFILES TABLE
============================================================================
*/

DROP POLICY IF EXISTS "Users can read own profile" ON student_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON student_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON student_profiles;

CREATE POLICY "Users can read own profile" ON student_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON student_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON student_profiles
  FOR UPDATE USING (auth.uid() = user_id);

/*
============================================================================
7. CREATE RLS POLICIES - USER_BADGES TABLE
============================================================================
*/

DROP POLICY IF EXISTS "Users can read own badges" ON user_badges;
DROP POLICY IF EXISTS "System can award badges" ON user_badges;

CREATE POLICY "Users can read own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- Allow service role to insert badges
CREATE POLICY "System can award badges" ON user_badges
  FOR INSERT WITH CHECK (true);

/*
============================================================================
8. CREATE AUDIT LOGGING TABLE (Optional, for security monitoring)
============================================================================
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- RLS: Users can only read their own audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can write audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

/*
============================================================================
9. VERIFICATION QUERIES (Run these to confirm everything works)
============================================================================
*/

-- Check all tables have RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Check all policies are created
SELECT schemaname, tablename, policyname, polcmd, polroles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check constraints are in place
SELECT table_name, constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_name;

-- Verify rate limit table exists
SELECT * FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'ai_coaching_rate_limit';

/*
============================================================================
10. TEST QUERIES (Run after setup to confirm RLS works)
============================================================================
*/

-- As authenticated user A:
-- Should return only own expenses
SELECT user_id, amount, category FROM expenses LIMIT 10;

-- Should return empty (can't see other users' data)
SELECT * FROM expenses WHERE user_id != auth.uid();

-- Should succeed
INSERT INTO expenses (user_id, amount, category, date)
VALUES (auth.uid(), 100, 'food', NOW());

-- Should fail (policy violation)
INSERT INTO expenses (user_id, amount, category, date)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 100, 'food', NOW());

-- Should succeed
UPDATE expenses SET amount = 150 WHERE user_id = auth.uid() LIMIT 1;

-- Should not update (policy prevents it)
UPDATE expenses SET amount = 150 WHERE user_id != auth.uid();

-- Should succeed
DELETE FROM expenses WHERE user_id = auth.uid() LIMIT 1;

/*
============================================================================
11. BACKUPS & DISASTER RECOVERY
============================================================================

Set up automated backups in Supabase:
1. Go to Project Settings > Backups
2. Enable automatic backups (daily or weekly)
3. Set backup retention (minimum 30 days)
4. Test restore process monthly

Backup critical queries:
*/

-- Export all user data (for compliance/GDPR)
SELECT 
  u.id,
  u.email,
  sp.college_name,
  COUNT(e.id) as expense_count,
  SUM(e.amount) as total_spent
FROM auth.users u
LEFT JOIN student_profiles sp ON u.id = sp.user_id
LEFT JOIN expenses e ON u.id = e.user_id
GROUP BY u.id, u.email, sp.college_name;

/*
============================================================================
12. MONITORING & MAINTENANCE
============================================================================

Run monthly:
- SELECT COUNT(*) FROM expenses LIMIT 1; (verify data integrity)
- SELECT COUNT(*) FROM ai_coaching_rate_limit; (check rate limit table)
- SELECT * FROM pg_stat_user_tables; (check table sizes)

Run quarterly:
- VACUUM ANALYZE; (optimize indexes)
- Check for unused indexes: SELECT * FROM pg_stat_user_indexes;

============================================================================
*/
