import { createSupabaseBrowserClient } from '@/lib/supabase';
import { AppError, type NewProfile, type Profile, type ProfileUpdates, toAppError } from './types';

export async function getProfile(userId: string): Promise<Profile> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id,college_name,living_type,monthly_pocket_money,internship_income,semester_start_date,semester_end_date,created_at,updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      throw toAppError(error, 'Failed to fetch profile.');
    }

    if (!data) {
      throw new AppError('NOT_FOUND', 'Profile not found.');
    }

    return data as Profile;
  } catch (error) {
    throw toAppError(error, 'Failed to fetch profile.');
  }
}

export async function createProfile(userId: string, data: NewProfile): Promise<Profile> {
  try {
    const supabase = createSupabaseBrowserClient();
    const payload = {
      id: userId,
      college_name: data.college_name,
      living_type: data.living_type,
      monthly_pocket_money: data.monthly_pocket_money,
      internship_income: data.internship_income ?? 0,
      semester_start_date: data.semester_start_date,
      semester_end_date: data.semester_end_date,
    };

    const { data: created, error } = await supabase
      .from('profiles')
      .insert(payload)
      .select('id,college_name,living_type,monthly_pocket_money,internship_income,semester_start_date,semester_end_date,created_at,updated_at')
      .single();

    if (error) {
      throw toAppError(error, 'Failed to create profile.');
    }

    return created as Profile;
  } catch (error) {
    throw toAppError(error, 'Failed to create profile.');
  }
}

export async function updateProfile(userId: string, updates: ProfileUpdates): Promise<Profile> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('id,college_name,living_type,monthly_pocket_money,internship_income,semester_start_date,semester_end_date,created_at,updated_at')
      .single();

    if (error) {
      throw toAppError(error, 'Failed to update profile.');
    }

    return data as Profile;
  } catch (error) {
    throw toAppError(error, 'Failed to update profile.');
  }
}

export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id,college_name,living_type,monthly_pocket_money,semester_start_date,semester_end_date')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw toAppError(error, 'Failed to check onboarding completion.');
    }

    if (!data) {
      return false;
    }

    return Boolean(
      data.college_name &&
        data.living_type &&
        typeof data.monthly_pocket_money === 'number' &&
        data.semester_start_date &&
        data.semester_end_date
    );
  } catch (error) {
    throw toAppError(error, 'Failed to check onboarding completion.');
  }
}
