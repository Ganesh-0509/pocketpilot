import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Goals - PocketPilot',
  description: 'Set and track your financial goals. Plan savings targets and monitor your progress.',
  openGraph: {
    title: 'Goals - PocketPilot',
    description: 'Set and track your financial goals. Plan savings targets and monitor your progress.',
    type: 'website',
  },
};

export default function GoalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
