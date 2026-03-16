import { supabase } from './supabase';
import type { UserProfile, Goal, Transaction, FixedExpense, SemesterLiability } from './types';

// Helper to convert snake_case to camelCase
function toCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  
  const camelObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      camelObj[camelKey] = toCamel(obj[key]);
    }
  }
  return camelObj;
}

// Helper to convert camelCase to snake_case
function toSnake(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnake);
  
  const snakeObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      snakeObj[snakeKey] = obj[key] === null ? null : toSnake(obj[key]);
    }
  }
  return snakeObj;
}

export class SupabaseService {
  /**
   * Profile Methods
   */
  static async saveProfile(userId: string, profile: UserProfile): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...toSnake(profile) });
      
    if (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  static async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error getting profile:', error);
      throw error;
    }

    return toCamel(data) as UserProfile;
  }

  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(toSnake(updates))
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Goals Methods
   */
  static async saveGoal(userId: string, goal: Goal): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .upsert({ user_id: userId, ...toSnake(goal) });

    if (error) {
      console.error('Error saving goal:', error);
      throw error;
    }
  }

  static async getGoals(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting goals:', error);
      throw error;
    }

    return (data || []).map(d => {
      const c = toCamel(d);
      delete c.userId; // Remove DB specific field
      return c as Goal;
    });
  }

  static async deleteGoal(userId: string, goalId: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  /**
   * Transactions Methods
   */
  static async saveTransaction(userId: string, transaction: Transaction): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .upsert({ user_id: userId, ...toSnake(transaction) });

    if (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  static async getTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }

    return (data || []).map(d => {
      const c = toCamel(d);
      delete c.userId;
      return c as Transaction;
    });
  }

  static async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  /**
   * Semester Liability Methods
   */
  static async saveSemesterLiability(userId: string, liability: SemesterLiability): Promise<void> {
    const { error } = await supabase
      .from('semester_liabilities')
      .upsert({ user_id: userId, ...toSnake(liability) });

    if (error) {
      console.error('Error saving semester liability:', error);
      throw error;
    }
  }

  static async getSemesterLiabilities(userId: string): Promise<SemesterLiability[]> {
    const { data, error } = await supabase
      .from('semester_liabilities')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error getting semester liabilities:', error);
      throw error;
    }

    return (data || []).map(d => {
      const c = toCamel(d);
      delete c.userId;
      return c as SemesterLiability;
    });
  }

  static async deleteSemesterLiability(userId: string, liabilityId: string): Promise<void> {
    const { error } = await supabase
      .from('semester_liabilities')
      .delete()
      .eq('id', liabilityId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting semester liability:', error);
      throw error;
    }
  }

  /**
   * Fixed Expenses Methods (Ignored in Supabase for now, stored in profile JSON)
   * We will store these in the profiles JSON if needed, but if there's a need to support old schema:
   */
  static async saveFixedExpense(userId: string, expense: FixedExpense): Promise<void> {
    // Legacy support: We can just ignore or save to a table if created. 
    // In our SQL, we didn't create a fixed_expenses table directly (just JSON inside profile).
    // Let's just log a warning.
    console.warn('saveFixedExpense called but we use profile.fixedExpenses in Supabase.');
  }

  static async getFixedExpenses(userId: string): Promise<FixedExpense[]> {
    return [];
  }

  static async deleteFixedExpense(userId: string, expenseId: string): Promise<void> {
  }

  /**
   * Logged Payments Methods
   */
  static async saveLoggedPayments(userId: string, payments: any): Promise<void> {
    // Payments object mapping e.g: { "expenseId-YYYY-MM": true }
    // Clean and insert into tabular format
    const inserts: any[] = [];
    for (const key of Object.keys(payments)) {
       // Assuming split by "-"
       const parts = key.split('-');
       if(parts.length >= 3) {
         // This is a rough heuristic depending on how you formed keys.
         const month = parts.slice(-2).join('-'); // YYYY-MM
         const expenseId = parts.slice(0, -2).join('-');
         inserts.push({
           user_id: userId,
           expense_id: expenseId,
           month: month,
         });
       }
    }
    
    if (inserts.length > 0) {
      const { error } = await supabase
        .from('logged_payments')
        .upsert(inserts, { onConflict: 'user_id,expense_id,month' });
        
      if (error) console.error('Error saving logged payments:', error);
    }
  }

  static async getLoggedPayments(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('logged_payments')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting payments:', error);
      return {};
    }

    const dict: any = {};
    (data || []).forEach(row => {
      dict[`${row.expense_id}-${row.month}`] = true;
    });
    return dict;
  }

  /**
   * Delete User Data
   */
  static async deleteUserData(userId: string): Promise<void> {
    // Due to ON DELETE CASCADE on auth.users, just deleting the user from auth
    // will delete all their data in Supabase automatically.
    // If not, we could delete from profile and cascade.
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) console.error('Error deleting user data:', error);
  }
}
