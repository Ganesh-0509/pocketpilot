'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QuickLogButton() {
  const handleClick = () => {
    // TODO: Open expense logging modal
    // This will integrate with the modal system
    if (process.env.NODE_ENV === 'development') {
      console.log('Quick log expense clicked');
    }
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="fixed bottom-6 right-6 rounded-full shadow-lg md:bottom-8 md:right-8"
    >
      <Plus className="h-5 w-5" />
      <span className="ml-2">Log Expense</span>
    </Button>
  );
}
