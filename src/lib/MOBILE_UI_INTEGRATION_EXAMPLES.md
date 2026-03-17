/**
 * @fileOverview Mobile UI Integration Examples
 * 
 * Production-ready code examples showing how to integrate:
 * - Haptic feedback
 * - Pull-to-refresh
 * - Touch targets
 * - Safe areas
 * - Responsive typography
 */

// ════════════════════════════════════════════════════════════════════════════
// EXAMPLE 1: Quick Log Button with Haptic Feedback
// ════════════════════════════════════════════════════════════════════════════

// src/components/(app)/dashboard/_components/quick-log-button-with-haptics.tsx

/*
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useHaptic } from '@/hooks/use-haptic';
import { createExpense } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function QuickLogButton() {
  const [isLoading, setIsLoading] = useState(false);
  const haptic = useHaptic();
  const { toast } = useToast();

  const handleQuickLog = async () => {
    // Light haptic on button press
    await haptic.light();
    
    setIsLoading(true);
    try {
      // Log a quick expense
      const amount = 50; // Default quick-log amount
      await createExpense({
        amount,
        category: 'other',
        note: 'Quick log',
      });

      // Success haptic when expense is logged
      await haptic.success();
      
      toast({
        title: 'Expense logged!',
        description: `₹${amount} added to today's spending`,
      });
    } catch (error) {
      // Error haptic on failure
      await haptic.error();
      
      toast({
        title: 'Failed to log expense',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleQuickLog}
      disabled={isLoading}
      size="touch"
      className="gap-2"
    >
      <Plus className="h-4 w-4" />
      {isLoading ? 'Logging...' : 'Quick Log'}
    </Button>
  );
}
*/

// ════════════════════════════════════════════════════════════════════════════
// EXAMPLE 2: Dashboard with Pull-to-Refresh
// ════════════════════════════════════════════════════════════════════════════

// src/app/(app)/dashboard/page-with-pull-to-refresh.tsx

/*
'use client';

import { PullToRefreshContainer } from '@/hooks/use-pull-to-refresh';
import { HeroCard } from './_components/hero-card';
import { SecondaryStatsRow } from './_components/secondary-stats-row';
import { UpcomingLiabilitiesSection } from './_components/upcoming-liabilities-section';

export function DashboardWithPullToRefresh() {
  return (
    <PullToRefreshContainer
      invalidateQueries={['expenses', 'profile', 'liabilities', 'dailySummary']}
      className="h-screen"
      refreshIndicatorColor="hsl(210, 90%, 60%)"
    >
      <div className="space-y-6 p-4 safe-pb">
        {/* Hero Card - Daily Safe-to-Spend */}
        <HeroCard />

        {/* Secondary Stats */}
        <SecondaryStatsRow />

        {/* Upcoming Liabilities */}
        <UpcomingLiabilitiesSection />
      </div>
    </PullToRefreshContainer>
  );
}
*/

// ════════════════════════════════════════════════════════════════════════════
// EXAMPLE 3: Responsive Hero Number for Daily Limit
// ════════════════════════════════════════════════════════════════════════════

// src/components/(app)/dashboard/_components/hero-card-responsive.tsx

/*
'use client';

export function HeroCardResponsive({ dailySafeToSpend }: { dailySafeToSpend: number }) {
  return (
    <div className="bg-gradient-to-br from-primary/80 to-primary rounded-2xl p-6 safe-pt">
      <div className="flex flex-col items-center justify-center gap-2">
        {/* Responsive hero number: text-5xl mobile → text-6xl desktop */}
        <div className="responsive-text-hero text-primary-foreground">
          ₹{dailySafeToSpend.toLocaleString('en-IN')}
        </div>

        {/* Responsive subtitle */}
        <div className="responsive-text-caption text-primary-foreground/80">
          Safe to spend today
        </div>
      </div>

      {/* Secondary info with responsive typography */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="responsive-text-body text-primary-foreground/60">
            Spent Today
          </div>
          <div className="responsive-text-title text-primary-foreground">
            ₹1,250
          </div>
        </div>
        <div>
          <div className="responsive-text-body text-primary-foreground/60">
            Days Left
          </div>
          <div className="responsive-text-title text-primary-foreground">
            45
          </div>
        </div>
      </div>
    </div>
  );
}
*/

// ════════════════════════════════════════════════════════════════════════════
// EXAMPLE 4: Form with Haptic Feedback on Success
// ════════════════════════════════════════════════════════════════════════════

// src/components/(app)/expenses/_components/expense-form-with-haptics.tsx

/*
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useHaptic } from '@/hooks/use-haptic';
import { expenseSchema } from '@/lib/validation';
import type { z } from 'zod';

type ExpenseFormData = z.infer<typeof expenseSchema>;

export function ExpenseFormWithHaptics() {
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
  });
  const haptic = useHaptic();
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      // Call API
      const response = await fetch('/api/expenses', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Success haptic sequence
        await haptic.success();
        form.reset();
      } else {
        // Error haptic
        await haptic.error();
      }
    } catch (error) {
      // Error haptic on exception
      await haptic.error();
    }
  };

  const handleInputFocus = async () => {
    // Subtle haptic on input focus
    await haptic.light();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Amount Input */}
      <div>
        <label className="responsive-text-title">Amount (₹)</label>
        <input
          {...form.register('amount')}
          type="number"
          onFocus={handleInputFocus}
          className="w-full min-h-[44px] rounded-md border px-4 py-2"
          placeholder="Enter amount"
        />
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="responsive-text-title">Category</label>
        <select
          {...form.register('category')}
          onFocus={handleInputFocus}
          className="w-full min-h-[44px] rounded-md border px-4 py-2"
        >
          <option>Select category</option>
          <option value="food">Food</option>
          <option value="transport">Transport</option>
          <option value="entertainment">Entertainment</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="responsive-text-title">Notes</label>
        <textarea
          {...form.register('note')}
          onFocus={handleInputFocus}
          className="w-full min-h-[100px] rounded-md border px-4 py-2"
          placeholder="Add notes (optional)"
        />
      </div>

      {/* Submit Button - Touch-optimized */}
      <Button
        type="submit"
        disabled={isSubmitting}
        size="touch"
        className="w-full"
      >
        {isSubmitting ? 'Logging...' : 'Log Expense'}
      </Button>
    </form>
  );
}
*/

// ════════════════════════════════════════════════════════════════════════════
// EXAMPLE 5: Settings Page with Theme Toggle
// ════════════════════════════════════════════════════════════════════════════

// src/app/(app)/settings/page-theme-toggle.tsx

/*
'use client';

import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';

export function SettingsPageThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 safe-pb">
      {/* Page Title with Responsive Typography */}
      <div>
        <h1 className="responsive-text-hero!text-2xl md:text-3xl">Settings</h1>
        <p className="responsive-text-caption text-muted-foreground">
          Customize your PocketPilot experience
        </p>
      </div>

      {/* Theme Selection Section */}
      <div className="space-y-4">
        <h2 className="responsive-text-title">Theme</h2>
        <p className="responsive-text-body text-muted-foreground">
          Choose how PocketPilot looks
        </p>

        <div className="grid grid-cols-3 gap-3">
          {/* Light Mode */}
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size="touch"
            className="flex flex-col gap-2"
            onClick={() => setTheme('light')}
          >
            <Sun className="h-5 w-5" />
            <span className="text-xs">Light</span>
          </Button>

          {/* Dark Mode (Default) */}
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="touch"
            className="flex flex-col gap-2"
            onClick={() => setTheme('dark')}
          >
            <Moon className="h-5 w-5" />
            <span className="text-xs">Dark</span>
          </Button>

          {/* System Setting */}
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            size="touch"
            className="flex flex-col gap-2"
            onClick={() => setTheme('system')}
          >
            <Monitor className="h-5 w-5" />
            <span className="text-xs">System</span>
          </Button>
        </div>
      </div>

      {/* Other Settings */}
      <div className="space-y-3 border-t pt-6">
        <button className="w-full rounded-lg border px-4 py-3 text-left min-h-[44px] hover:bg-secondary">
          <div className="responsive-text-title">Notifications</div>
          <div className="responsive-text-caption text-muted-foreground">
            Manage alerts and reminders
          </div>
        </button>

        <button className="w-full rounded-lg border px-4 py-3 text-left min-h-[44px] hover:bg-secondary">
          <div className="responsive-text-title">Privacy & Security</div>
          <div className="responsive-text-caption text-muted-foreground">
            Protect your financial data
          </div>
        </button>
      </div>
    </div>
  );
}
*/

// ════════════════════════════════════════════════════════════════════════════
// EXAMPLE 6: Safe Area Bottom Navigation
// ════════════════════════════════════════════════════════════════════════════

// src/components/bottom-nav-safe-area.tsx

/*
'use client';

import Link from 'next/link';
import { LayoutGrid, Plus, Settings } from 'lucide-react';

export function BottomNavSafeArea() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-card safe-pb">
      {/* Navigation with proper safe area padding */}
      <div className="flex items-center justify-around gap-4 px-4 py-2 safe-pb:2">
        {/* Dashboard Link */}
        <Link
          href="/dashboard"
          className="touch-target flex-1 text-center hover:text-primary"
        >
          <LayoutGrid className="mx-auto h-6 w-6" />
          <span className="responsive-text-caption block">Dashboard</span>
        </Link>

        {/* Quick Log Button - Center */}
        <Link
          href="/check-in"
          className="touch-target rounded-full bg-primary p-3 text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-6 w-6" />
        </Link>

        {/* Settings Link */}
        <Link
          href="/settings"
          className="touch-target flex-1 text-center hover:text-primary"
        >
          <Settings className="mx-auto h-6 w-6" />
          <span className="responsive-text-caption block">Settings</span>
        </Link>
      </div>
    </nav>
  );
}
*/

// ════════════════════════════════════════════════════════════════════════════
// INTEGRATION CHECKLIST FOR DEVELOPERS
// ════════════════════════════════════════════════════════════════════════════

/*
QUICK START - Apply these changes to existing components:

1. QuickLogButton Component:
   - Import useHaptic from '@/hooks/use-haptic'
   - Add haptic.light() on click
   - Add haptic.success() on success
   - Add haptic.error() on error
   - Update button size to "touch"

2. Dashboard Page:
   - Wrap main content with <PullToRefreshContainer>
   - Set invalidateQueries to ['expenses', 'profile', 'liabilities']
   - Add safe-pb class to content div

3. Expense Form:
   - Update button to size="touch"
   - Add haptic feedback on submit
   - Add onFocus handlers with haptic.light()

4. All Buttons:
   - Icon buttons: Use size="icon" (now 44×44px)
   - Action buttons: Use size="touch" on mobile
   - Secondary buttons: Use size="default" (still has min-h-[44px])

5. Typography:
   - Hero numbers: Use className="responsive-text-hero"
   - Card titles: Use className="responsive-text-title"
   - Body text: Use className="responsive-text-body"
   - Helper text: Use className="responsive-text-caption"

6. Fixed Elements (modals, navs):
   - Add safe-pb or safe-pt class
   - Test on device with notch/home indicator

7. Form Inputs:
   - Add min-h-[44px] class
   - Pad around with 8px minimum
   - Ensure 44px touch target area

8. Settings Page:
   - Add theme toggle using useTheme()
   - Options: light, dark, system
   - Theme persists in localStorage
*/
