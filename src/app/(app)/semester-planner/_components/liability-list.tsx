'use client';

import { useState, useMemo } from 'react';
import { format, isToday, isThisWeek, isThisMonth, isBefore, startOfToday } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, AlertCircle, Calendar } from 'lucide-react';
import type { SemesterLiability } from '@/lib/dailyEngine';

interface ExtendedLiability extends SemesterLiability {
  title?: string;
  category?: string;
}

interface LiabilityListProps {
  initialLiabilities: ExtendedLiability[];
}

type LiabilityStatus = 'overdue' | 'this-week' | 'this-month' | 'future';

interface GroupedLiabilities {
  overdue: ExtendedLiability[];
  thisWeek: ExtendedLiability[];
  thisMonth: ExtendedLiability[];
  future: ExtendedLiability[];
}

export function LiabilityList({ initialLiabilities }: LiabilityListProps) {
  const [liabilities, setLiabilities] = useState<ExtendedLiability[]>(initialLiabilities);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Group liabilities by status
  const grouped = useMemo((): GroupedLiabilities => {
    const unpaid = liabilities.filter((l) => !l.isPaid);
    const paid = liabilities.filter((l) => l.isPaid);

    const today = startOfToday();

    const overdue = unpaid.filter((l) => isBefore(l.dueDate, today));
    const thisWeek = unpaid.filter(
      (l) =>
        !isBefore(l.dueDate, today) && isThisWeek(l.dueDate) && !isToday(l.dueDate)
    );
    const thisMonth = unpaid.filter(
      (l) =>
        !isThisWeek(l.dueDate) &&
        !isBefore(l.dueDate, today) &&
        isThisMonth(l.dueDate)
    );
    const future = unpaid.filter((l) => !isThisMonth(l.dueDate));

    return { overdue, thisWeek, thisMonth, future };
  }, [liabilities]);

  const getBadgeColor = (status: LiabilityStatus) => {
    switch (status) {
      case 'overdue':
        return 'destructive';
      case 'this-week':
        return 'secondary';
      case 'this-month':
        return 'outline';
      case 'future':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getBadgeLabel = (status: LiabilityStatus) => {
    switch (status) {
      case 'overdue':
        return 'Overdue';
      case 'this-week':
        return 'This Week';
      case 'this-month':
        return 'This Month';
      case 'future':
        return 'Future';
      default:
        return '';
    }
  };

  const handleMarkAsPaid = async (liability: ExtendedLiability) => {
    try {
      // Optimistic update
      setLiabilities((prev) =>
        prev.map((l) =>
          l.id === liability.id ? { ...l, isPaid: true } : l
        )
      );

      // Background sync
      const response = await fetch('/api/semester-liabilities/update-paid', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liabilityId: liability.id,
          isPaid: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update liability');
      }

      toast({
        title: 'Marked as paid',
        description: `${liability.title} is now marked as completed.`,
      });
    } catch (error) {
      // Revert optimistic update
      setLiabilities((prev) =>
        prev.map((l) =>
          l.id === liability.id ? { ...l, isPaid: false } : l
        )
      );
      toast({
        title: 'Error',
        description: 'Failed to update liability.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (liability: ExtendedLiability) => {
    if (!confirm(`Delete "${liability.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(liability.id);

      // Optimistic update
      setLiabilities((prev) => prev.filter((l) => l.id !== liability.id));

      // Background sync
      const response = await fetch('/api/semester-liabilities/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liabilityId: liability.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete liability');
      }

      toast({
        title: 'Deleted',
        description: `${liability.title} has been removed.`,
      });
    } catch (error) {
      // Revert optimistic update
      setLiabilities((prev) => [...prev, liability]);
      toast({
        title: 'Error',
        description: 'Failed to delete liability.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (liabilities.length === 0) {
    return (
      <Card className="border-dashed shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="font-semibold text-muted-foreground">No upcoming costs yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add semester fees, books, exams, or projects to your planner to see
            them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Your Planned Costs</CardTitle>
        <CardDescription>
          {liabilities.length} cost{liabilities.length !== 1 ? 's' : ''} total
          {liabilities.filter((l) => l.isPaid).length > 0 &&
            ` • ${liabilities.filter((l) => l.isPaid).length} completed`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overdue */}
        {grouped.overdue.length > 0 && (
          <LiabilityGroup
            status="overdue"
            liabilities={grouped.overdue}
            onMarkAsPaid={handleMarkAsPaid}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}

        {/* This Week */}
        {grouped.thisWeek.length > 0 && (
          <LiabilityGroup
            status="this-week"
            liabilities={grouped.thisWeek}
            onMarkAsPaid={handleMarkAsPaid}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}

        {/* This Month */}
        {grouped.thisMonth.length > 0 && (
          <LiabilityGroup
            status="this-month"
            liabilities={grouped.thisMonth}
            onMarkAsPaid={handleMarkAsPaid}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}

        {/* Future */}
        {grouped.future.length > 0 && (
          <LiabilityGroup
            status="future"
            liabilities={grouped.future}
            onMarkAsPaid={handleMarkAsPaid}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </CardContent>
    </Card>
  );
}

interface LiabilityGroupProps {
  status: LiabilityStatus;
  liabilities: ExtendedLiability[];
  onMarkAsPaid: (liability: ExtendedLiability) => void;
  onDelete: (liability: ExtendedLiability) => void;
  deletingId: string | null;
}

function LiabilityGroup({
  status,
  liabilities,
  onMarkAsPaid,
  onDelete,
  deletingId,
}: LiabilityGroupProps) {
  const badgeColor = status === 'overdue' ? 'destructive' : status === 'this-week' ? 'secondary' : 'outline';
  const badgeLabel =
    status === 'overdue'
      ? 'Overdue'
      : status === 'this-week'
        ? 'This Week'
        : status === 'this-month'
          ? 'This Month'
          : 'Future';

  return (
    <div className="space-y-3">
      <Badge variant={badgeColor} className="ml-0">
        {status === 'overdue' && <AlertCircle className="mr-1 h-3 w-3" />}
        {badgeLabel}
      </Badge>

      {liabilities.map((liability) => (
        <div
          key={liability.id}
          className="flex items-start gap-3 rounded-lg border p-4 transition-opacity"
        >
          <Checkbox
            checked={liability.isPaid}
            onCheckedChange={() => onMarkAsPaid(liability)}
            className="mt-1"
          />

          <div className="flex-1 min-w-0">
            <p
              className={`font-medium ${
                liability.isPaid ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {liability.title}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {liability.category && (
                <span className="rounded bg-muted px-2 py-1">{liability.category}</span>
              )}
              <span>•</span>
              <span>Due {format(liability.dueDate, 'MMM d, yyyy')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="font-bold">₹{liability.amount.toFixed(0)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(liability)}
              disabled={deletingId === liability.id}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
