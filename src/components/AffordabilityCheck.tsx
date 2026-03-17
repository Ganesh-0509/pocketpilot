'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Check, AlertCircle, XCircle } from 'lucide-react';

interface AffordabilityCheckProps {
  dailyLimit: number;
  daysRemaining: number;
  onClose: () => void;
}

type AffordabilityStatus = 'safe' | 'tight' | 'danger' | 'insufficient';

export default function AffordabilityCheck({
  dailyLimit,
  daysRemaining,
  onClose,
}: AffordabilityCheckProps) {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<AffordabilityStatus>('safe');

  useEffect(() => {
    if (!amount || isNaN(parseFloat(amount))) {
      setStatus('safe');
      return;
    }

    const expenseAmount = parseFloat(amount);
    const remainingAfterExpense = dailyLimit * daysRemaining - expenseAmount;
    const newDailyLimit = remainingAfterExpense / daysRemaining;

    if (remainingAfterExpense < 0) {
      setStatus('insufficient');
    } else if (newDailyLimit < 100) {
      setStatus('danger');
    } else if (newDailyLimit < 150) {
      setStatus('tight');
    } else {
      setStatus('safe');
    }
  }, [amount, dailyLimit, daysRemaining]);

  const numAmount = amount ? parseFloat(amount) : 0;
  const remainingAfterExpense = Math.max(0, dailyLimit * daysRemaining - numAmount);
  const newDailyLimit = daysRemaining > 0 ? remainingAfterExpense / daysRemaining : 0;

  const getCardColor = () => {
    switch (status) {
      case 'safe':
        return 'border-green-200 bg-green-50';
      case 'tight':
        return 'border-amber-200 bg-amber-50';
      case 'danger':
        return 'border-red-200 bg-red-50';
      case 'insufficient':
        return 'border-red-400 bg-red-100';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'safe':
        return 'text-green-900';
      case 'tight':
        return 'text-amber-900';
      case 'danger':
        return 'text-red-900';
      case 'insufficient':
        return 'text-red-900';
      default:
        return 'text-gray-900';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'safe':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'tight':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case 'danger':
      case 'insufficient':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getMessage = () => {
    switch (status) {
      case 'safe':
        return `Yes — new daily limit: ₹${newDailyLimit.toFixed(0)} for ${daysRemaining} days`;
      case 'tight':
        return `Tight — new limit drops to ₹${newDailyLimit.toFixed(0)}/day`;
      case 'danger':
        return `No — this triggers Survival Mode`;
      case 'insufficient':
        return `No — you don't have enough left this month`;
      default:
        return '';
    }
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-lg">
        <SheetHeader>
          <SheetTitle>Can You Afford This?</SheetTitle>
          <SheetDescription>
            Enter an amount to see how it affects your daily budget.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Amount Input */}
          <div>
            <Label htmlFor="amount" className="text-base">
              How much will you spend?
            </Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="pl-8 text-lg"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Status Card */}
          {amount && (
            <Card className={`p-4 border-2 transition-all ${getCardColor()}`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon()}</div>
                <div className="flex-1">
                  <p className={`font-semibold ${getTextColor()}`}>
                    {getMessage()}
                  </p>
                  {status === 'safe' && (
                    <p className="mt-1 text-sm text-green-700">
                      You'll still have ₹{remainingAfterExpense.toFixed(0)} for the month.
                    </p>
                  )}
                  {status === 'tight' && (
                    <p className="mt-1 text-sm text-amber-700">
                      Be careful — you'll have ₹{remainingAfterExpense.toFixed(0)} left for {daysRemaining} days.
                    </p>
                  )}
                  {status === 'danger' && (
                    <p className="mt-1 text-sm text-red-700">
                      You'll have ₹{remainingAfterExpense.toFixed(0)} left for {daysRemaining} days, which triggers warning mode.
                    </p>
                  )}
                  {status === 'insufficient' && (
                    <p className="mt-1 text-sm text-red-900">
                      This expense exceeds your current monthly remaining budget.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Current Status Info */}
          <div className="space-y-2 rounded-lg bg-muted p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current daily limit:</span>
              <span className="font-semibold">₹{dailyLimit.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Days remaining:</span>
              <span className="font-semibold">{daysRemaining}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Budget runway:</span>
              <span className="font-semibold">₹{(dailyLimit * daysRemaining).toFixed(0)}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
