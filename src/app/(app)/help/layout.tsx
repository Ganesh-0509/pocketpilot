import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center - PocketPilot',
  description: 'Get help and answers to common questions about PocketPilot.',
  openGraph: {
    title: 'Help Center - PocketPilot',
    description: 'Get help and answers to common questions about PocketPilot.',
    type: 'website',
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
