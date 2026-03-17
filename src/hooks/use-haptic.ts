'use client';

import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

// Type checking for Capacitor availability
type CapacitorWindow = Window & {
  cordova?: any;
  capacitorIsNative?: boolean;
};

/**
 * Hook to trigger haptic feedback on mobile devices
 * Falls back gracefully on web/desktop where Haptics plugin is not available
 */
export function useHaptic() {
  const triggerHaptic = useCallback(async (type: HapticType) => {
    try {
      const win = window as CapacitorWindow;
      
      // Check if running in native Capacitor context
      const isNative = win.cordova || win.capacitorIsNative;
      
      if (!isNative) {
        // Fallback for web - use vibration API if available
        if (navigator.vibrate) {
          switch (type) {
            case 'light':
              navigator.vibrate(10);
              break;
            case 'medium':
              navigator.vibrate(30);
              break;
            case 'heavy':
              navigator.vibrate([30, 10, 30]);
              break;
            case 'success':
              navigator.vibrate([20, 10, 20]);
              break;
            case 'warning':
              navigator.vibrate([40, 20, 40]);
              break;
            case 'error':
              navigator.vibrate([50, 30, 50]);
              break;
          }
        }
        return;
      }

      // Use Capacitor Haptics on mobile (lazy import to avoid module resolution issues)
      try {
        // @ts-ignore - Capacitor package may not be installed in web environments
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        
        switch (type) {
          case 'light':
            await Haptics.impact({ style: ImpactStyle.Light });
            break;
          case 'medium':
            await Haptics.impact({ style: ImpactStyle.Medium });
            break;
          case 'heavy':
            await Haptics.impact({ style: ImpactStyle.Heavy });
            break;
          case 'success':
            await Haptics.notification({ type: 2 }); // Success
            break;
          case 'warning':
            await Haptics.notification({ type: 1 }); // Warning
            break;
          case 'error':
            await Haptics.notification({ type: 0 }); // Error
            break;
        }
      } catch (importError) {
        // Capacitor package not available in this environment
        if (process.env.NODE_ENV === 'development') {
          console.debug('Capacitor Haptics not available:', importError);
        }
      }
    } catch (error) {
      // Silently fail if Haptics is not available
      // This is expected on web browsers
      if (process.env.NODE_ENV === 'development') {
        console.debug('Haptic feedback not available:', error);
      }
    }
  }, []);

  return {
    /**
     * Light haptic - single small vibration
     * Use for: subtle interactions, selection changes
     */
    light: () => triggerHaptic('light'),

    /**
     * Medium haptic - moderate vibration
     * Use for: button presses, tab switches
     */
    medium: () => triggerHaptic('medium'),

    /**
     * Heavy haptic - strong vibration
     * Use for: significant actions, alerts
     */
    heavy: () => triggerHaptic('heavy'),

    /**
     * Success haptic - positive notification pattern
     * Use for: expense logged successfully, badge earned
     */
    success: () => triggerHaptic('success'),

    /**
     * Warning haptic - alert notification pattern
     * Use for: low balance warning, upcoming deadline
     */
    warning: () => triggerHaptic('warning'),

    /**
     * Error haptic - error notification pattern
     * Use for: validation error, failed transaction
     */
    error: () => triggerHaptic('error'),

    /**
     * Generic trigger for custom types
     */
    trigger: triggerHaptic,
  };
}
