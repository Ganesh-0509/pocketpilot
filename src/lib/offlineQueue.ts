/**
 * @fileOverview PocketPilot Offline Queue
 * 
 * Manages offline expense logs and syncs them to Supabase when network restores.
 * Uses localStorage for persistence across sessions.
 */

import { createClient } from '@supabase/supabase-js';
import { logError } from '@/lib/errors';

// ============================================================================
// TYPES
// ============================================================================

export interface QueuedExpense {
  id: string; // Local ID for tracking
  userId: string;
  amount: number;
  category: string;
  note?: string;
  date: string; // ISO string
  queuedAt: string; // ISO string when queued
  attempts: number;
}

export interface OfflineQueueState {
  isOnline: boolean;
  queue: QueuedExpense[];
  isSyncing: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'pocketpilot_offline_queue';
const MAX_RETRY_ATTEMPTS = 5;
const SYNC_INTERVAL_MS = 30 * 1000; // 30 seconds

// ============================================================================
// OFFLINE QUEUE MANAGER
// ============================================================================

class OfflineQueueManager {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(state: OfflineQueueState) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen for online/offline events
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());

      // Periodic sync attempt
      this.startPeriodicSync();
    }
  }

  /**
   * Get current queue state.
   */
  getState(): OfflineQueueState {
    const queue = this.getQueue();
    return {
      isOnline: this.isOnline,
      queue,
      isSyncing: this.isSyncing,
    };
  }

  /**
   * Subscribe to queue state changes.
   */
  subscribe(listener: (state: OfflineQueueState) => void): () => void {
    this.listeners.add(listener);
    // Call immediately with current state
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change.
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  /**
   * Get queue from localStorage.
   */
  private getQueue(): QueuedExpense[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logError(error, 'Failed to parse offline queue from localStorage');
      return [];
    }
  }

  /**
   * Save queue to localStorage.
   */
  private saveQueue(queue: QueuedExpense[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      this.notifyListeners();
    } catch (error) {
      logError(error, 'Failed to save offline queue to localStorage');
    }
  }

  /**
   * Add expense to queue when network fails.
   */
  addToQueue(expense: Omit<QueuedExpense, 'id' | 'queuedAt' | 'attempts'>): QueuedExpense {
    const queuedExpense: QueuedExpense = {
      ...expense,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      queuedAt: new Date().toISOString(),
      attempts: 0,
    };

    const queue = this.getQueue();
    queue.push(queuedExpense);
    this.saveQueue(queue);

    console.log(`[Offline Queue] Added expense: ${queuedExpense.id}`);
    return queuedExpense;
  }

  /**
   * Handle coming online.
   */
  private handleOnline = async (): Promise<void> => {
    console.log('[Offline Queue] Network restored — attempting sync...');
    this.isOnline = true;
    this.notifyListeners();
    await this.flushQueue();
  };

  /**
   * Handle going offline.
   */
  private handleOffline = (): void => {
    console.log('[Offline Queue] Network lost — queuing expenses');
    this.isOnline = false;
    this.notifyListeners();
  };

  /**
   * Flush queue: sync all queued expenses to Supabase.
   */
  async flushQueue(): Promise<void> {
    if (!this.isOnline || this.isSyncing) {
      console.log('[Offline Queue] Skipping flush: offline or already syncing');
      return;
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      const queue = this.getQueue();
      if (queue.length === 0) {
        console.log('[Offline Queue] Queue is empty');
        this.isSyncing = false;
        return;
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      );

      // Process each queued expense
      const successfulIds: string[] = [];
      const failedExpenses: QueuedExpense[] = [];

      for (const expense of queue) {
        try {
          const { error } = await supabase.from('expenses').insert({
            user_id: expense.userId,
            amount: expense.amount,
            category: expense.category,
            note: expense.note || null,
            date: expense.date,
            synced_at: new Date().toISOString(),
          });

          if (error) {
            throw error;
          }

          successfulIds.push(expense.id);
          console.log(`[Offline Queue] Synced expense: ${expense.id}`);
        } catch (error) {
          logError(error, `Failed to sync expense: ${expense.id}`);

          // Check if we should retry
          if (expense.attempts < MAX_RETRY_ATTEMPTS) {
            failedExpenses.push({
              ...expense,
              attempts: expense.attempts + 1,
            });
          } else {
            console.warn(`[Offline Queue] Max retries exceeded for: ${expense.id}`);
            successfulIds.push(expense.id); // Remove from queue despite failure
          }
        }
      }

      // Update queue with failed expenses only
      const newQueue = failedExpenses;
      this.saveQueue(newQueue);

      console.log(
        `[Offline Queue] Sync complete: ${successfulIds.length} synced, ${newQueue.length} still pending`
      );
    } catch (error) {
      logError(error, 'Failed to flush offline queue');
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Start periodic sync attempts.
   */
  private startPeriodicSync(): void {
    if (this.syncInterval) clearInterval(this.syncInterval);

    this.syncInterval = setInterval(async () => {
      if (this.isOnline && !this.isSyncing) {
        await this.flushQueue();
      }
    }, SYNC_INTERVAL_MS);
  }

  /**
   * Clear queue (for testing or manual reset).
   */
  clearQueue(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      this.notifyListeners();
      console.log('[Offline Queue] Queue cleared');
    }
  }

  /**
   * Cleanup on unmount.
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    this.listeners.clear();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let instance: OfflineQueueManager | null = null;

export function getOfflineQueueManager(): OfflineQueueManager {
  if (!instance) {
    instance = new OfflineQueueManager();
  }
  return instance;
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Add an expense to the offline queue.
 * Call this when an expense log fails due to network error.
 */
export function queueExpense(
  expense: Omit<QueuedExpense, 'id' | 'queuedAt' | 'attempts'>
): QueuedExpense {
  return getOfflineQueueManager().addToQueue(expense);
}

/**
 * Attempt to sync all queued expenses to Supabase.
 * Called automatically when network restores.
 */
export async function syncOfflineQueue(): Promise<void> {
  return getOfflineQueueManager().flushQueue();
}

/**
 * Get current offline queue state.
 */
export function getOfflineQueueState(): OfflineQueueState {
  return getOfflineQueueManager().getState();
}

/**
 * Subscribe to offline queue state changes.
 * Returns unsubscribe function.
 */
export function subscribeToOfflineQueue(
  listener: (state: OfflineQueueState) => void
): () => void {
  return getOfflineQueueManager().subscribe(listener);
}

/**
 * Clear offline queue (testing/reset only).
 */
export function clearOfflineQueue(): void {
  getOfflineQueueManager().clearQueue();
}
