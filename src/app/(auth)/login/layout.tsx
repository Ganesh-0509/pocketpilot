import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - PocketPilot',
  description: 'Sign in to your PocketPilot account to start your financial journey.',
  openGraph: {
    title: 'Login - PocketPilot',
    description: 'Sign in to your PocketPilot account to start your financial journey.',
    type: 'website',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
