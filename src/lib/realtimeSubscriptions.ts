/**
 * @fileOverview Supabase Realtime Subscriptions
 * 
 * Live updates for dashboard via Supabase Realtime.
 */

'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { queryKeys } from '@/hooks/useQueries';

/**
 * Hook to subscribe to realtime expense changes.
 * Automatically invalidates daily summary when new expense detected from another device.
 */
export function useRealtimeExpenses() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    // Get current user ID
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      // Subscribe to INSERT events for current user
      const channel = supabase
        .channel(`expenses:user_id=eq.${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'expenses',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('[Realtime] New expense detected:', payload.new);
            }

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: queryKeys.expenses() });
            queryClient.invalidateQueries({ queryKey: queryKeys.dailySummary() });
            queryClient.invalidateQueries({ queryKey: queryKeys.badges() });
            queryClient.invalidateQueries({ queryKey: queryKeys.streak() });
          }
        )
        .subscribe();

      // Subscribe to liability updates
      const liabilityChannel = supabase
        .channel(`liabilities:user_id=eq.${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*', // All events: INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'semester_liabilities',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('[Realtime] Liability changed:', payload);
            }

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: queryKeys.liabilities() });
            queryClient.invalidateQueries({ queryKey: queryKeys.dailySummary() });
          }
        )
        .subscribe();

      // Cleanup subscriptions on unmount
      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(liabilityChannel);
      };
    });
  }, [queryClient]);
}

/**
 * Manually trigger a realtime sync for testing/development.
 */
export async function triggerRealtimeSync() {
  const queryClient = require('@tanstack/react-query').useQueryClient();
  if (!queryClient) return;

  await queryClient.invalidateQueries({ queryKey: queryKeys.expenses() });
  await queryClient.invalidateQueries({ queryKey: queryKeys.dailySummary() });
}
