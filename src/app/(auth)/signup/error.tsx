'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold">Sign Up Failed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn't create your account. Please check your information and try again.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-lg bg-secondary p-4 text-left">
            <p className="text-xs font-mono text-foreground">{error.message}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={reset} className="flex-1">
            Try Again
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            asChild
          >
            <Link href="/login">Sign In Instead</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
