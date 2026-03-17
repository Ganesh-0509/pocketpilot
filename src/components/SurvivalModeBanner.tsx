'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import { useSurvivalMode } from '@/context/SurvivalModeContext';
import { Button } from '@/components/ui/button';
import AffordabilityCheck from './AffordabilityCheck';

export function SurvivalModeBanner() {
  const { isSurvivalMode, severity, dailyLimit, daysRemaining } = useSurvivalMode();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showAffordabilityCheck, setShowAffordabilityCheck] = useState(false);

  // Initialize dismissed state from sessionStorage
  useEffect(() => {
    const dismissed = sessionStorage.getItem('pocketpilot-survival-banner-dismissed');
    const dismissedDate = sessionStorage.getItem('pocketpilot-survival-banner-dismissed-date');
    
    // Check if dismissed today
    const today = new Date().toDateString();
    if (dismissed === 'true' && dismissedDate === today) {
      setIsDismissed(true);
    } else {
      setIsDismissed(false);
    }
  }, []);

  // Show banner only if in warning or critical state and not dismissed
  if ((!isSurvivalMode && severity === 'safe') || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pocketpilot-survival-banner-dismissed', 'true');
    sessionStorage.setItem('pocketpilot-survival-banner-dismissed-date', new Date().toDateString());
  };

  if (severity === 'critical') {
    return (
      <>
        <div className="sticky top-0 z-40 flex items-start justify-between gap-3 rounded-lg border-l-4 border-red-500 bg-red-50 px-4 py-3 text-red-900">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="font-bold">Survival Mode — only ₹{dailyLimit.toFixed(0)}/day left</p>
              <p className="mt-1 text-sm">Avoid all non-essential spending for the next {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}.</p>
              <button
                onClick={() => setShowAffordabilityCheck(true)}
                className="mt-2 text-sm font-semibold text-red-700 underline hover:text-red-800"
              >
                Check if you can afford something →
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {showAffordabilityCheck && (
          <AffordabilityCheck
            dailyLimit={dailyLimit}
            daysRemaining={daysRemaining}
            onClose={() => setShowAffordabilityCheck(false)}
          />
        )}
      </>
    );
  }

  if (severity === 'warning') {
    return (
      <>
        <div className="sticky top-0 z-40 flex items-start justify-between gap-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-amber-900">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-bold">Budget getting tight — ₹{dailyLimit.toFixed(0)}/day for {daysRemaining} days</p>
              <p className="mt-1 text-sm">Tighten spending to avoid running out this month.</p>
              <button
                onClick={() => setShowAffordabilityCheck(true)}
                className="mt-2 text-sm font-semibold text-amber-700 underline hover:text-amber-800"
              >
                Check if you can afford something →
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-amber-600 hover:text-amber-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {showAffordabilityCheck && (
          <AffordabilityCheck
            dailyLimit={dailyLimit}
            daysRemaining={daysRemaining}
            onClose={() => setShowAffordabilityCheck(false)}
          />
        )}
      </>
    );
  }

  return null;
}

export default SurvivalModeBanner;
