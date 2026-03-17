import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Badges - PocketPilot',
  description: 'Unlock and collect badges as you reach financial milestones. Track your achievements.',
  openGraph: {
    title: 'Badges - PocketPilot',
    description: 'Unlock and collect badges as you reach financial milestones. Track your achievements.',
    type: 'website',
  },
};

export default function BadgesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
