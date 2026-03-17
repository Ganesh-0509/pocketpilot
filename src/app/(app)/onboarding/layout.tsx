import type { Metadata } from 'next';
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import { hasCompletedOnboarding } from "@/lib/db/profile";

export const metadata: Metadata = {
  title: 'Onboarding - PocketPilot',
  description: 'Complete your profile setup and configure your budget settings to get started with PocketPilot.',
  openGraph: {
    title: 'Onboarding - PocketPilot',
    description: 'Complete your profile setup and configure your budget settings to get started with PocketPilot.',
    type: 'website',
  },
};

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient(cookies());

  // Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Not authenticated, let middleware handle the redirect
    return null;
  }

  // Check if user has already completed onboarding
  try {
    const hasOnboarded = await hasCompletedOnboarding(session.user.id);
    if (hasOnboarded) {
      // User already completed onboarding, redirect to dashboard
      redirect("/dashboard");
    }
  } catch (error) {
    // If there's an error checking onboarding status, 
    // allow them to proceed (they may be in the middle of it)
    console.error("Error checking onboarding status:", error);
  }

  return <>{children}</>;
}
