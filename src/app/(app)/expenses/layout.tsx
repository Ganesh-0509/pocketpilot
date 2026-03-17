import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expenses - PocketPilot',
  description: 'View and manage all your logged expenses. Track spending by category and time period.',
  openGraph: {
    title: 'Expenses - PocketPilot',
    description: 'View and manage all your logged expenses. Track spending by category and time period.',
    type: 'website',
  },
};

export default function ExpensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
