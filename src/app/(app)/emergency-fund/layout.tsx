import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Emergency Fund - PocketPilot',
  description: 'Build and manage your emergency fund. Set a target and track your progress.',
  openGraph: {
    title: 'Emergency Fund - PocketPilot',
    description: 'Build and manage your emergency fund. Set a target and track your progress.',
    type: 'website',
  },
};

export default function EmergencyFundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
