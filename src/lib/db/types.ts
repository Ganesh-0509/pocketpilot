export type UUID = string;

export type LivingType = 'hostel' | 'day_scholar';
export type InputMethod = 'manual' | 'voice' | 'ocr';
export type LiabilityCategory = 'fees' | 'exam' | 'textbook' | 'project' | 'fest' | 'other';
export type BurnStatus = 'safe' | 'warning' | 'critical';

export interface Profile {
  id: UUID;
  college_name: string;
  living_type: LivingType;
  monthly_pocket_money: number;
  internship_income: number;
  semester_start_date: string;
  semester_end_date: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: UUID;
  user_id: UUID;
  amount: number;
  category: string;
  description: string | null;
  logged_at: string;
  input_method: InputMethod;
}

export interface SemesterLiability {
  id: UUID;
  user_id: UUID;
  title: string;
  amount: number;
  due_date: string;
  is_paid: boolean;
  category: LiabilityCategory;
  created_at: string;
}

export interface Streak {
  id: UUID;
  user_id: UUID;
  current_streak: number;
  best_streak: number;
  last_active_date: string | null;
}

export interface Badge {
  id: UUID;
  user_id: UUID;
  badge_key: string;
  earned_at: string;
}

export type NewExpense = {
  amount: number;
  category: string;
  description?: string;
  input_method?: InputMethod;
};

export type NewProfile = {
  college_name: string;
  living_type: LivingType;
  monthly_pocket_money: number;
  internship_income?: number;
  semester_start_date: string;
  semester_end_date: string;
};

export type ProfileUpdates = Partial<Omit<Profile, 'id' | 'created_at'>>;

export type NewLiability = {
  title: string;
  amount: number;
  due_date: string;
  category?: LiabilityCategory;
};

export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'DB_ERROR'
  | 'CONFLICT'
  | 'UNKNOWN';

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly cause?: unknown;

  constructor(code: AppErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
  }
}

export function toAppError(error: unknown, fallbackMessage: string): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error && typeof error === 'object') {
    const maybeCode = (error as { code?: string }).code;
    if (maybeCode === '23505') {
      return new AppError('CONFLICT', fallbackMessage, error);
    }
    if (maybeCode === 'PGRST116') {
      return new AppError('NOT_FOUND', fallbackMessage, error);
    }
  }

  return new AppError('DB_ERROR', fallbackMessage, error);
}
