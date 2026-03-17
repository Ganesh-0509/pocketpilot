import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - PocketPilot',
  description: 'Your personal financial dashboard. See your daily safe-to-spend limit and track your progress.',
  openGraph: {
    title: 'Dashboard - PocketPilot',
    description: 'Your personal financial dashboard. See your daily safe-to-spend limit and track your progress.',
    type: 'website',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
