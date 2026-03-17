import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fixed Expenses - PocketPilot',
  description: 'Manage your recurring fixed expenses like rent, subscriptions, and other monthly commitments.',
  openGraph: {
    title: 'Fixed Expenses - PocketPilot',
    description: 'Manage your recurring fixed expenses like rent, subscriptions, and other monthly commitments.',
    type: 'website',
  },
};

export default function FixedExpensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
