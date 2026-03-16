-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  user_type TEXT DEFAULT 'student',
  name TEXT,
  college_name TEXT,
  living_type TEXT DEFAULT 'hostel',
  monthly_income NUMERIC DEFAULT 0,
  internship_income NUMERIC DEFAULT 0,
  recurring_expenses JSONB DEFAULT '[]'::jsonb,
  semester_fees JSONB DEFAULT '[]'::jsonb,
  fixed_expenses JSONB DEFAULT '[]'::jsonb,
  daily_spending_limit NUMERIC DEFAULT 0,
  monthly_needs NUMERIC DEFAULT 0,
  monthly_wants NUMERIC DEFAULT 0,
  monthly_savings NUMERIC DEFAULT 0,
  emergency_fund JSONB DEFAULT '{"target": 0, "current": 0, "history": []}'::jsonb,
  gamification JSONB DEFAULT '{}'::jsonb,
  total_daily_savings NUMERIC DEFAULT 0,
  last_tds_reset_date TIMESTAMP WITH TIME ZONE,
  reminder_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Transactions Table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT DEFAULT 'expense'
);

-- 3. Goals Table
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  timeline_months INTEGER,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  monthly_contribution NUMERIC,
  contributions JSONB DEFAULT '[]'::jsonb
);

-- 4. Semester Liabilities Table
CREATE TABLE semester_liabilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Logged Payments Table
CREATE TABLE logged_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_id TEXT NOT NULL,
  month TEXT NOT NULL, -- e.g., "YYYY-MM"
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, expense_id, month)
);

-- Turn on Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE semester_liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE logged_payments ENABLE ROW LEVEL SECURITY;

-- Create Policies so users can only view/edit their own data
CREATE POLICY "Users can manage their own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can view their own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own semester liabilities" ON semester_liabilities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own payments" ON logged_payments FOR ALL USING (auth.uid() = user_id);