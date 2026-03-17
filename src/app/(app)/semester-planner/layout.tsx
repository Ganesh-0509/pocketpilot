import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Semester Planner - PocketPilot',
  description: 'Plan your semester expenses and track important deadlines for fees and liabilities.',
  openGraph: {
    title: 'Semester Planner - PocketPilot',
    description: 'Plan your semester expenses and track important deadlines for fees and liabilities.',
    type: 'website',
  },
};

export default function SemesterPlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
