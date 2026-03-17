CREATE TYPE living_type AS ENUM ('hostel', 'day_scholar');
CREATE TYPE input_method AS ENUM ('manual', 'voice', 'ocr');
CREATE TYPE liability_category AS ENUM ('fees', 'exam', 'textbook', 'project', 'fest', 'other');
CREATE TYPE burn_status AS ENUM ('safe', 'warning', 'critical');

CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  college_name TEXT NOT NULL,
  living_type living_type NOT NULL,
  monthly_pocket_money NUMERIC(10,2) NOT NULL,
  internship_income NUMERIC(10,2) DEFAULT 0,
  semester_start_date DATE NOT NULL,
  semester_end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  input_method input_method DEFAULT 'manual'
);

CREATE TABLE semester_liabilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  category liability_category DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  last_active_date DATE
);

CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_key)
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE semester_liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users own their expenses" ON expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their liabilities" ON semester_liabilities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their streak" ON streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their badges" ON badges FOR ALL USING (auth.uid() = user_id);
