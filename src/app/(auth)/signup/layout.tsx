import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - PocketPilot',
  description: 'Create a new PocketPilot account and start tracking your spending today.',
  openGraph: {
    title: 'Sign Up - PocketPilot',
    description: 'Create a new PocketPilot account and start tracking your spending today.',
    type: 'website',
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
