'use client';

import { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, AlertCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { calculateDailyLimit } from '@/lib/dailyEngine';

interface AffordabilityCheckProps {
  isOpen: boolean;
  onClose: () => void;
  remainingBudget: number;
  daysRemaining: number;
}

type StatusType = 'safe' | 'tight' | 'risky' | 'impossible' | 'empty';

interface StatusConfig {
  color: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function AffordabilityCheck({
  isOpen,
  onClose,
  remainingBudget,
  daysRemaining,
}: AffordabilityCheckProps) {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<StatusType>('empty');

  // Auto-focus input when sheet opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setStatus('empty');
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const input = document.getElementById('affordability-amount-input');
        if (input && input instanceof HTMLInputElement) {
          input.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // Calculate new daily limit as user types
  useEffect(() => {
    if (!amount || isNaN(parseFloat(amount))) {
      setStatus('empty');
      return;
    }

    const enteredAmount = parseFloat(amount);

    // Can't afford if amount exceeds remaining budget
    if (enteredAmount > remainingBudget) {
      setStatus('impossible');
      return;
    }

    // Calculate new daily limit
    const newBudget = remainingBudget - enteredAmount;
    const newDailyLimit = calculateDailyLimit(newBudget, daysRemaining);

    if (newDailyLimit >= 200) {
      setStatus('safe');
    } else if (newDailyLimit >= 100) {
      setStatus('tight');
    } else if (newDailyLimit > 0) {
      setStatus('risky');
    } else {
      setStatus('impossible');
    }
  }, [amount, remainingBudget, daysRemaining]);

  // Status configurations
  const statusConfigs: Record<StatusType, StatusConfig> = {
    empty: {
      color: 'bg-slate-50 border-slate-200',
      icon: <DollarSign className="w-6 h-6 text-slate-400" />,
      title: 'Enter an amount',
      description: 'See if you can afford this expense',
    },
    safe: {
      color: 'bg-green-50 border-green-200',
      icon: <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"><span className="text-white text-sm font-bold">✓</span></div>,
      title: 'Yes—You can afford this',
      description: `Your daily limit stays at ₹${(
        calculateDailyLimit(remainingBudget - parseFloat(amount || '0'), daysRemaining)
      ).toFixed(0)} for ${daysRemaining} days.`,
    },
    tight: {
      color: 'bg-amber-50 border-amber-200',
      icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
      title: 'Tight—Manageable but careful',
      description: `Daily limit drops to ₹${(
        calculateDailyLimit(remainingBudget - parseFloat(amount || '0'), daysRemaining)
      ).toFixed(0)}. Watch your spending closely.`,
    },
    risky: {
      color: 'bg-red-50 border-red-200',
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      title: 'Risky—Triggers Survival Mode',
      description: `This leaves only ₹${(
        calculateDailyLimit(remainingBudget - parseFloat(amount || '0'), daysRemaining)
      ).toFixed(0)}/day. Only proceed if essential.`,
    },
    impossible: {
      color: 'bg-red-100 border-red-300',
      icon: <AlertTriangle className="w-6 h-6 text-red-800" />,
      title: "Can't afford this",
      description:
        amount && parseFloat(amount) > remainingBudget
          ? `This exceeds your remaining budget of ₹${remainingBudget.toFixed(0)}.`
          : 'Not enough budget remaining this month.',
    },
  };

  const config = statusConfigs[status];
  const newDailyLimit =
    amount && !isNaN(parseFloat(amount))
      ? calculateDailyLimit(remainingBudget - parseFloat(amount), daysRemaining)
      : null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Can I afford this?</SheetTitle>
          <SheetDescription>
            Check if an expense fits your monthly budget
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <label htmlFor="affordability-amount-input" className="text-sm font-medium">
              Expense amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-semibold text-slate-600">
                ₹
              </span>
              <Input
                id="affordability-amount-input"
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-lg h-12 focus:ring-2 focus:ring-blue-500"
                min="0"
                step="100"
              />
            </div>
            <p className="text-xs text-slate-500">
              Remaining this month: ₹{remainingBudget.toFixed(0)} • {daysRemaining} days left
            </p>
          </div>

          {/* Status Card */}
          <div
            className={`border rounded-lg p-4 transform transition-all duration-200 ${config.color}`}
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0">{config.icon}</div>
              <div>
                <h3 className="font-semibold text-slate-900">{config.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{config.description}</p>

                {/* Show new daily limit for safe/tight/risky states */}
                {(status === 'safe' || status === 'tight' || status === 'risky') && newDailyLimit !== null && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs font-mono">
                      Current daily limit: ₹{(remainingBudget / daysRemaining).toFixed(0)}
                      <br />
                      New daily limit: ₹{newDailyLimit.toFixed(0)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-2">
            {status === 'safe' && (
              <Button
                onClick={onClose}
                className="flex-1"
                variant="default"
              >
                Proceed
              </Button>
            )}
            {status === 'tight' && (
              <Button
                onClick={onClose}
                className="flex-1"
                variant="outline"
              >
                Proceed Carefully
              </Button>
            )}
            {status === 'risky' && (
              <Button
                onClick={onClose}
                className="flex-1"
                variant="outline"
                disabled
              >
                Can't Proceed
              </Button>
            )}
            {status === 'impossible' && (
              <Button
                onClick={onClose}
                className="flex-1"
                variant="outline"
                disabled
              >
                Can't Afford
              </Button>
            )}
            {status === 'empty' && (
              <Button
                onClick={onClose}
                className="flex-1"
                variant="outline"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
