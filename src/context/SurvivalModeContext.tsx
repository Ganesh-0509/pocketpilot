'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getSurvivalMode } from '@/lib/dailyEngine';

export type SurvivalSeverity = 'safe' | 'warning' | 'critical';

interface SurvivalModeContextType {
  isSurvivalMode: boolean;
  severity: SurvivalSeverity;
  dailyLimit: number;
  daysRemaining: number;
  updateSurvivalMode: (dailyLimit: number, daysRemaining: number) => void;
}

const SurvivalModeContext = createContext<SurvivalModeContextType | undefined>(undefined);

export function SurvivalModeProvider({ children }: { children: ReactNode }) {
  const [isSurvivalMode, setIsSurvivalMode] = useState(false);
  const [severity, setSeverity] = useState<SurvivalSeverity>('safe');
  const [dailyLimit, setDailyLimit] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);

  // Initialize from sessionStorage on mount
  useEffect(() => {
    const cached = sessionStorage.getItem('pocketpilot-survival-mode');
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setIsSurvivalMode(data.isSurvivalMode);
        setSeverity(data.severity);
        setDailyLimit(data.dailyLimit);
        setDaysRemaining(data.daysRemaining);
      } catch (e) {
        console.error('Error parsing cached survival mode:', e);
      }
    }
  }, []);

  const updateSurvivalMode = useCallback((newDailyLimit: number, newDaysRemaining: number) => {
    // Determine survival mode status using the dailyEngine function
    const inSurvivalMode = newDailyLimit > 0 && newDailyLimit < 100 && newDaysRemaining > 0;

    // Determine severity
    let newSeverity: SurvivalSeverity = 'safe';
    if (inSurvivalMode) {
      newSeverity = 'critical';
    } else if (newDailyLimit < 150 && newDailyLimit > 0) {
      newSeverity = 'warning';
    }

    setIsSurvivalMode(inSurvivalMode);
    setSeverity(newSeverity);
    setDailyLimit(newDailyLimit);
    setDaysRemaining(newDaysRemaining);

    // Cache in sessionStorage
    sessionStorage.setItem(
      'pocketpilot-survival-mode',
      JSON.stringify({
        isSurvivalMode: inSurvivalMode,
        severity: newSeverity,
        dailyLimit: newDailyLimit,
        daysRemaining: newDaysRemaining,
      })
    );
  }, []);

  return (
    <SurvivalModeContext.Provider
      value={{
        isSurvivalMode,
        severity,
        dailyLimit,
        daysRemaining,
        updateSurvivalMode,
      }}
    >
      {children}
    </SurvivalModeContext.Provider>
  );
}

export function useSurvivalMode() {
  const context = useContext(SurvivalModeContext);
  if (context === undefined) {
    throw new Error('useSurvivalMode must be used within SurvivalModeProvider');
  }
  return context;
}
