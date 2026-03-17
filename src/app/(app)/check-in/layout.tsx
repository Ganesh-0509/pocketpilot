import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daily Check-In - PocketPilot',
  description: 'Log your daily expenses and track your spending against your daily budget.',
  openGraph: {
    title: 'Daily Check-In - PocketPilot',
    description: 'Log your daily expenses and track your spending against your daily budget.',
    type: 'website',
  },
};

export default function CheckInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
