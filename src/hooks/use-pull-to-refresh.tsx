'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PullToRefreshOptions {
  onRefresh?: () => Promise<void> | void;
  threshold?: number; // pixels to pull before triggering refresh
  disabled?: boolean;
  invalidateQueries?: string[]; // query key prefixes to invalidate
}

/**
 * Hook to implement pull-to-refresh functionality on mobile
 * Works with React Query to refresh data
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false,
  invalidateQueries = [],
}: PullToRefreshOptions = {}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    if (isRefreshing || disabled) return;

    setIsRefreshing(true);
    try {
      // Run custom refresh callback if provided
      if (onRefresh) {
        await onRefresh();
      }

      // Invalidate specified React Query queries
      if (invalidateQueries.length > 0) {
        await Promise.all(
          invalidateQueries.map((queryKey) =>
            queryClient.invalidateQueries({
              queryKey: [queryKey],
              exact: false,
            })
          )
        );
      } else {
        // If no specific queries provided, invalidate all
        await queryClient.invalidateQueries();
      }
    } catch (error) {
      console.error('Pull-to-refresh error:', error);
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [isRefreshing, disabled, onRefresh, invalidateQueries, queryClient]);

  useEffect(() => {
    if (disabled || !containerRef.current) return;

    const container = containerRef.current;
    const scrollParent = container.parentElement;
    if (!scrollParent) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start tracking if at top of scroll container
      if (scrollParent.scrollTop === 0) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Only track if we started at top and haven't scrolled
      if (
        scrollParent.scrollTop === 0 &&
        touchStartY.current > 0 &&
        !isRefreshing
      ) {
        const currentY = e.touches[0].clientY;
        const delta = Math.max(0, currentY - touchStartY.current);
        setPullDistance(delta);

        // Prevent default scroll if we're pulling
        if (delta > 0) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance >= threshold) {
        handleRefresh();
      } else {
        setPullDistance(0);
      }
      touchStartY.current = 0;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, threshold, isRefreshing, disabled, handleRefresh]);

  return {
    containerRef,
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(1, pullDistance / threshold),
    refresh: handleRefresh,
  };
}

/**
 * Component wrapper for pull-to-refresh functionality
 */
export interface PullToRefreshContainerProps
  extends PullToRefreshOptions {
  children: React.ReactNode;
  className?: string;
  refreshIndicatorColor?: string;
  pullDistance?: number;
}

export function PullToRefreshContainer({
  children,
  className = '',
  refreshIndicatorColor = 'hsl(210, 90%, 60%)',
  pullDistance = 0,
  ...options
}: PullToRefreshContainerProps) {
  const { containerRef, isRefreshing, pullProgress } =
    usePullToRefresh(options);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-y-auto ${className}`}
      style={{
        transform: `translateY(${Math.min(pullDistance, 100)}px)`,
        transition: isRefreshing ? 'none' : 'transform 0.3s ease-out',
      } as React.CSSProperties}
    >
      {/* Pull-to-refresh indicator */}
      {pullProgress > 0 && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4"
          style={{
            height: `${Math.max(40, pullProgress * 80)}px`,
            background: 'transparent',
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: `${Math.max(20, pullProgress * 40)}px`,
              height: `${Math.max(20, pullProgress * 40)}px`,
              border: `2px solid ${refreshIndicatorColor}`,
              borderTopColor: 'transparent',
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              opacity: pullProgress,
            }}
          />
        </div>
      )}

      {/* Main content */}
      {children}

      {/* Loading indicator when refreshing */}
      {isRefreshing && (
        <div className="flex items-center justify-center py-4">
          <div
            className="rounded-full border-2 border-transparent"
            style={{
              width: '24px',
              height: '24px',
              borderTopColor: refreshIndicatorColor,
              borderRightColor: refreshIndicatorColor,
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
