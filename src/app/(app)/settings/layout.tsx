import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings - PocketPilot',
  description: 'Manage your account settings, preferences, and profile information.',
  openGraph: {
    title: 'Settings - PocketPilot',
    description: 'Manage your account settings, preferences, and profile information.',
    type: 'website',
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
