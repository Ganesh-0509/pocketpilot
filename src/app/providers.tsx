/**
 * @fileOverview Providers Wrapper
 * 
 * Client component that wraps all provider components.
 */

'use client';

import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AppProvider } from '@/context/app-context';
import { SurvivalModeProvider } from '@/context/SurvivalModeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/hooks/use-theme';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <SurvivalModeProvider>
              {children}
            </SurvivalModeProvider>
          </AppProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
