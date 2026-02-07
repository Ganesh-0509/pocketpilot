
"use client";

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import ExportReport from '@/components/export-report';
import { PdfExport } from '@/components/pdf-export';
import { useApp } from '@/hooks/use-app';

const pageTitles: { [key: string]: string } = {
  '/dashboard': 'Dashboard Overview',
  '/check-in': 'Daily Expense Check-in',
  '/goals': 'Financial Goals',
  '/expenses': 'Expense Analysis',
  '/fixed-expenses': 'Fixed Expenses Analysis',
  '/emergency-fund': 'Emergency Fund',
  '/onboarding': 'Welcome to FinMate',
  '/settings': 'Profile Settings',
  '/help': 'Help & User Guide',
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { profile, user } = useApp();

  // Always show the page title (e.g., "Dashboard Overview") in the header.
  // This prevents showing a duplicate greeting in the header when the page
  // content already displays a personalized greeting.
  const firstName = profile?.name ? profile.name.split(' ')[0] : (user?.displayName ? user.displayName.split(' ')[0] : 'User');

  return (
    <header className="sticky top-0 z-10 flex min-h-16 flex-col justify-center border-b bg-background px-4 md:px-6 safe-pt">
      <div className="flex h-16 items-center gap-4 w-full">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Hello, <span className="text-primary">{firstName}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 mr-3">
          <ExportReport />
          <PdfExport />
        </div>
      </div>
    </header>
  );
}
