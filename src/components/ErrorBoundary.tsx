/**
 * @fileOverview PocketPilot Error Boundary
 * 
 * React error boundary component that catches rendering errors
 * and displays a friendly error UI instead of blank screen.
 */

'use client';

import React, { ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logError } from '@/lib/errors';

// ============================================================================
// TYPES
// ============================================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error with stack trace
    logError(error, `ErrorBoundary caught: ${errorInfo.componentStack}`);

    // Log to console in development for easier debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    // Optional: Reload the page
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <Card className="w-full max-w-md shadow-lg border-red-200 bg-white">
            <div className="p-8 text-center">
              {/* Error Icon */}
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something Went Wrong
              </h1>

              {/* Error Description */}
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Don't worry — your data is safe.
                Try refreshing the page or contact support if the problem persists.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                  <p className="text-xs font-mono text-gray-700 break-words">
                    {this.state.error.message}
                  </p>
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer font-semibold text-gray-700">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </details>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Go to Home
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-teal-200"
                >
                  Refresh Page
                </Button>
              </div>

              {/* Support Link */}
              <p className="text-xs text-gray-500 mt-6">
                Need help?{' '}
                <a
                  href="mailto:support@pocketpilot.app"
                  className="text-teal-600 hover:underline"
                >
                  Contact support
                </a>
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
