import { createSupabaseBrowserClient } from '@/lib/supabase';
import { type Badge, toAppError } from './types';

export async function getUserBadges(userId: string): Promise<Badge[]> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('badges')
      .select('id,user_id,badge_key,earned_at')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      throw toAppError(error, 'Failed to fetch badges.');
    }

    return (data ?? []) as Badge[];
  } catch (error) {
    throw toAppError(error, 'Failed to fetch badges.');
  }
}

export async function awardBadge(userId: string, badgeKey: string): Promise<void> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from('badges')
      .upsert(
        { user_id: userId, badge_key: badgeKey },
        { onConflict: 'user_id,badge_key', ignoreDuplicates: true }
      );

    if (error) {
      throw toAppError(error, 'Failed to award badge.');
    }
  } catch (error) {
    throw toAppError(error, 'Failed to award badge.');
  }
}

export async function hasBadge(userId: string, badgeKey: string): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_key', badgeKey)
      .maybeSingle();

    if (error) {
      throw toAppError(error, 'Failed to check badge.');
    }

    return Boolean(data?.id);
  } catch (error) {
    throw toAppError(error, 'Failed to check badge.');
  }
}
