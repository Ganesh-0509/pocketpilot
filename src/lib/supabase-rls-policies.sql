/**
 * @fileOverview Supabase RLS Policies
 * 
 * Row-Level Security policies for PocketPilot.
 * Run these SQL statements in Supabase SQL Editor to verify/create policies.
 */

/*
============================================================================
EXPENSES TABLE RLS POLICIES
============================================================================

These policies ensure users can only see and modify their own expenses.
*/

-- Policy: Users can read their own expenses
CREATE POLICY "Users can read own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own expenses
CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own expenses
CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own expenses
CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

/*
============================================================================
SEMESTER_LIABILITIES TABLE RLS POLICIES
============================================================================

These policies ensure users can only see and modify their own liabilities.
*/

-- Policy: Users can read their own liabilities
CREATE POLICY "Users can read own liabilities" ON semester_liabilities
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own liabilities
CREATE POLICY "Users can insert own liabilities" ON semester_liabilities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own liabilities
CREATE POLICY "Users can update own liabilities" ON semester_liabilities
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own liabilities
CREATE POLICY "Users can delete own liabilities" ON semester_liabilities
  FOR DELETE USING (auth.uid() = user_id);

/*
============================================================================
STUDENT_PROFILES TABLE RLS POLICIES
============================================================================

Users can only read/write their own profile.
*/

-- Policy: Users can read own profile
CREATE POLICY "Users can read own profile" ON student_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert own profile
CREATE POLICY "Users can insert own profile" ON student_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update own profile
CREATE POLICY "Users can update own profile" ON student_profiles
  FOR UPDATE USING (auth.uid() = user_id);

/*
============================================================================
USER_BADGES TABLE RLS POLICIES
============================================================================

Users can only read their own badges (badges are service-awarded, not user-editable).
*/

-- Policy: Users can read own badges
CREATE POLICY "Users can read own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert badges (for badge awarding service)
CREATE POLICY "Service role can award badges" ON user_badges
  FOR INSERT WITH CHECK (true);

/*
============================================================================
VERIFICATION QUERIES
============================================================================

Run these queries to verify RLS is working:

1. Test EXPENSES - Should return empty (other user's data blocked):
   SELECT * FROM expenses WHERE user_id != auth.uid();
   -- Should return 0 rows

2. Test LIABILITIES - Should return empty (other user's data blocked):
   SELECT * FROM semester_liabilities WHERE user_id != auth.uid();
   -- Should return 0 rows

3. Test INSERT - User should be able to insert own expense:
   INSERT INTO expenses (user_id, amount, category, date)
   VALUES (auth.uid(), 100, 'food', NOW())
   RETURNING *;
   -- Should succeed

4. Test INSERT with wrong user_id - Should fail:
   INSERT INTO expenses (user_id, amount, category, date)
   VALUES ('different-uuid', 100, 'food', NOW())
   RETURNING *;
   -- Should fail with policy violation error

5. Test UPDATE - User can update own expense:
   UPDATE expenses SET amount = 150 WHERE user_id = auth.uid();
   -- Should succeed

6. Test UPDATE - User cannot update other's expense:
   UPDATE expenses SET amount = 150 
   WHERE user_id != auth.uid();
   -- Should return 0 affected rows

7. Test DELETE - User can delete own expense:
   DELETE FROM expenses WHERE user_id = auth.uid() LIMIT 1;
   -- Should succeed (1 row deleted)

============================================================================
*/

/*
============================================================================
ADDITIONAL SECURITY: CHECK CONSTRAINTS
============================================================================

Add these CHECK constraints to enforce data integrity at DB level:
*/

-- expenses table constraints
ALTER TABLE expenses ADD CONSTRAINT amount_check 
  CHECK (amount > 0 AND amount <= 50000);

ALTER TABLE expenses ADD CONSTRAINT note_length_check 
  CHECK (char_length(note) <= 200);

-- semester_liabilities table constraints
ALTER TABLE semester_liabilities ADD CONSTRAINT liability_amount_check 
  CHECK (amount > 0 AND amount <= 500000);

ALTER TABLE semester_liabilities ADD CONSTRAINT title_length_check 
  CHECK (char_length(title) >= 2 AND char_length(title) <= 100);

-- student_profiles table constraints
ALTER TABLE student_profiles ADD CONSTRAINT income_check 
  CHECK (monthly_income >= 1000 AND monthly_income <= 1000000);

ALTER TABLE student_profiles ADD CONSTRAINT college_check 
  CHECK (char_length(college_name) >= 2 AND char_length(college_name) <= 100);

/*
============================================================================
TESTING PROCEDURE (Step by step in Supabase SQL Editor)
============================================================================

1. Enable RLS on all tables:
   ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
   ALTER TABLE semester_liabilities ENABLE ROW LEVEL SECURITY;
   ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

2. Create test data as logged-in user (in app):
   - Log in as user A
   - Create expense: INSERT INTO expenses (user_id, amount, category, date) 
     VALUES (auth.uid(), 100, 'food', NOW())
   - Create liability: INSERT INTO semester_liabilities (user_id, title, amount, due_date)
     VALUES (auth.uid(), 'Exam Fee', 500, NOW() + interval '7 days')

3. Switch to SQL Editor and run verification queries above.

4. Verify all tests pass:
   ✓ SELECT * FROM expenses WHERE user_id != auth.uid() returns 0 rows
   ✓ User can INSERT own expense
   ✓ User cannot INSERT with different user_id
   ✓ User can UPDATE/DELETE own records

============================================================================
*/
