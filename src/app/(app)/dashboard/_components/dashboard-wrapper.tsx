'use client';

import { useState } from 'react';
import { AffordabilityCheck } from '@/components/affordability-check';
import { Button } from '@/components/ui/button';
import { PiggyBank } from 'lucide-react';

interface DashboardWrapperProps {
  children: React.ReactNode;
  remainingBudget: number;
  daysRemaining: number;
}

export function DashboardWrapper({
  children,
  remainingBudget,
  daysRemaining,
}: DashboardWrapperProps) {
  const [isAffordabilityOpen, setIsAffordabilityOpen] = useState(false);

  return (
    <>
      {children}

      {/* Floating Affordability Check Button */}
      <div className="fixed bottom-24 right-6 z-40">
        <Button
          onClick={() => setIsAffordabilityOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
          size="icon"
          title="Can I afford this?"
        >
          <PiggyBank className="h-6 w-6" />
        </Button>
      </div>

      {/* Affordability Check Sheet */}
      <AffordabilityCheck
        isOpen={isAffordabilityOpen}
        onClose={() => setIsAffordabilityOpen(false)}
        remainingBudget={remainingBudget}
        daysRemaining={daysRemaining}
      />
    </>
  );
}
