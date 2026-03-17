import { createSupabaseBrowserClient } from '@/lib/supabase';
import { AppError, type Streak, toAppError } from './types';

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function isYesterday(lastDate: string, today: Date): boolean {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return lastDate === toDateOnly(yesterday);
}

export async function getStreak(userId: string): Promise<Streak> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('streaks')
      .select('id,user_id,current_streak,best_streak,last_active_date')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw toAppError(error, 'Failed to fetch streak.');
    }

    if (!data) {
      const { data: created, error: createError } = await supabase
        .from('streaks')
        .insert({
          user_id: userId,
          current_streak: 0,
          best_streak: 0,
          last_active_date: null,
        })
        .select('id,user_id,current_streak,best_streak,last_active_date')
        .single();

      if (createError) {
        throw toAppError(createError, 'Failed to initialize streak.');
      }

      return created as Streak;
    }

    return data as Streak;
  } catch (error) {
    throw toAppError(error, 'Failed to fetch streak.');
  }
}

export async function updateStreak(userId: string, wasUnderDailyLimit: boolean): Promise<Streak> {
  try {
    const current = await getStreak(userId);
    const today = new Date();
    const todayDate = toDateOnly(today);

    if (current.last_active_date === todayDate) {
      return current;
    }

    let nextCurrent = current.current_streak;
    let nextBest = current.best_streak;

    if (wasUnderDailyLimit) {
      if (current.last_active_date && isYesterday(current.last_active_date, today)) {
        nextCurrent = current.current_streak + 1;
      } else {
        nextCurrent = 1;
      }
      nextBest = Math.max(nextBest, nextCurrent);
    } else {
      nextCurrent = 0;
    }

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('streaks')
      .update({
        current_streak: nextCurrent,
        best_streak: nextBest,
        last_active_date: todayDate,
      })
      .eq('user_id', userId)
      .select('id,user_id,current_streak,best_streak,last_active_date')
      .single();

    if (error) {
      throw toAppError(error, 'Failed to update streak.');
    }

    if (!data) {
      throw new AppError('NOT_FOUND', 'Updated streak not found.');
    }

    return data as Streak;
  } catch (error) {
    throw toAppError(error, 'Failed to update streak.');
  }
}
