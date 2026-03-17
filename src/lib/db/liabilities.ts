import { createSupabaseBrowserClient } from '@/lib/supabase';
import { type NewLiability, type SemesterLiability, toAppError } from './types';

function toIsoDate(daysFromNow: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

export async function getLiabilities(userId: string): Promise<SemesterLiability[]> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('semester_liabilities')
      .select('id,user_id,title,amount,due_date,is_paid,category,created_at')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) {
      throw toAppError(error, 'Failed to fetch liabilities.');
    }

    return (data ?? []) as SemesterLiability[];
  } catch (error) {
    throw toAppError(error, 'Failed to fetch liabilities.');
  }
}

export async function getUpcomingLiabilities(userId: string, withinDays: number): Promise<SemesterLiability[]> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('semester_liabilities')
      .select('id,user_id,title,amount,due_date,is_paid,category,created_at')
      .eq('user_id', userId)
      .eq('is_paid', false)
      .gte('due_date', toIsoDate(0))
      .lte('due_date', toIsoDate(withinDays))
      .order('due_date', { ascending: true });

    if (error) {
      throw toAppError(error, 'Failed to fetch upcoming liabilities.');
    }

    return (data ?? []) as SemesterLiability[];
  } catch (error) {
    throw toAppError(error, 'Failed to fetch upcoming liabilities.');
  }
}

export async function addLiability(userId: string, data: NewLiability): Promise<SemesterLiability> {
  try {
    const supabase = createSupabaseBrowserClient();
    const payload = {
      user_id: userId,
      title: data.title,
      amount: data.amount,
      due_date: data.due_date,
      category: data.category ?? 'other',
    };

    const { data: created, error } = await supabase
      .from('semester_liabilities')
      .insert(payload)
      .select('id,user_id,title,amount,due_date,is_paid,category,created_at')
      .single();

    if (error) {
      throw toAppError(error, 'Failed to add liability.');
    }

    return created as SemesterLiability;
  } catch (error) {
    throw toAppError(error, 'Failed to add liability.');
  }
}

export async function markPaid(liabilityId: string): Promise<void> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from('semester_liabilities')
      .update({ is_paid: true })
      .eq('id', liabilityId);

    if (error) {
      throw toAppError(error, 'Failed to mark liability as paid.');
    }
  } catch (error) {
    throw toAppError(error, 'Failed to mark liability as paid.');
  }
}

export async function deleteLiability(liabilityId: string): Promise<void> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('semester_liabilities').delete().eq('id', liabilityId);

    if (error) {
      throw toAppError(error, 'Failed to delete liability.');
    }
  } catch (error) {
    throw toAppError(error, 'Failed to delete liability.');
  }
}
