
"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '@/hooks/use-app';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Trash, Wallet, PiggyBank, ShoppingCart, GraduationCap, Home, Briefcase } from 'lucide-react';
import React from 'react';
import { expenseCategories } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn, calculateEffectiveMonthlyIncome, calculateStudentBudget } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

const recurringExpenseSchema = z.object({
  name: z.string().min(1, 'Expense name is required'),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
});

const semesterFeeSchema = z.object({
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
});

const onboardingSchema = z.object({
  collegeName: z.string().min(1, 'College name is required'),
  livingType: z.enum(['hostel', 'day_scholar']),
  monthlyIncome: z.coerce.number().min(0, 'Monthly income cannot be negative'),
  hasInternship: z.boolean().default(false),
  internshipIncome: z.coerce.number().optional(),
  recurringExpenses: z.array(recurringExpenseSchema).optional(),
  hasSemesterFees: z.boolean().default(false),
  semesterFees: z.array(semesterFeeSchema).optional(),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

function SummaryCard({ title, amount, icon, description }: { title: string; amount: number; icon: React.ReactNode; description: string; }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted p-3">
      <div className="flex items-center gap-3">
        {icon}
        <div className="flex flex-col">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      </div>
      <div className="text-sm font-bold">₹{amount.toFixed(2)}</div>
    </div>
  )
}

export default function OnboardingPage() {
  const { updateProfile } = useApp();
  const router = useRouter();
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      collegeName: '',
      livingType: 'hostel',
      monthlyIncome: 0,
      hasInternship: false,
      internshipIncome: 0,
      recurringExpenses: [],
      hasSemesterFees: false,
      semesterFees: [],
    },
  });

  const { fields: expenseFields, append: appendExpense, remove: removeExpense } = useFieldArray({
    control: form.control,
    name: "recurringExpenses",
  });

  const { fields: feeFields, append: appendFee, remove: removeFee } = useFieldArray({
    control: form.control,
    name: "semesterFees",
  });

  const watchedIncome = form.watch('monthlyIncome');
  const watchedRecurringExpenses = form.watch('recurringExpenses');
  const watchedHasInternship = form.watch('hasInternship');
  const watchedInternshipIncome = form.watch('internshipIncome');
  const watchedHasSemesterFees = form.watch('hasSemesterFees');

  const { monthlyNeeds, monthlyWants, monthlySavings, dailySpendingLimit } = React.useMemo(() => {
    const pocketMoney = Number(watchedIncome) || 0;
    const internship = watchedHasInternship ? (Number(watchedInternshipIncome) || 0) : 0;
    const totalIncome = calculateEffectiveMonthlyIncome(pocketMoney, internship);
    const recurringExpenses = watchedRecurringExpenses || [];
    const recurringTotal = recurringExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    return calculateStudentBudget(totalIncome, recurringTotal);
  }, [watchedIncome, watchedRecurringExpenses, watchedHasInternship, watchedInternshipIncome]);


  function onSubmit(data: OnboardingValues) {
    const recurringExpensesData = (data.recurringExpenses || []).map(exp => ({
      name: exp.name,
      amount: exp.amount,
      category: exp.category,
    }));

    const semesterFeesData = data.hasSemesterFees ? (data.semesterFees || []).map(fee => ({
      amount: fee.amount,
      dueDate: fee.dueDate,
    })) : [];

    // Convert recurring expenses to fixedExpenses format for backward compatibility
    const fixedExpensesData = recurringExpensesData.map(exp => ({
      id: `fe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: exp.name,
      amount: exp.amount,
      category: exp.category,
    }));

    const profileData = {
      userType: 'student' as const,
      collegeName: data.collegeName,
      livingType: data.livingType,
      monthlyIncome: data.monthlyIncome,
      internshipIncome: data.hasInternship ? data.internshipIncome : undefined,
      recurringExpenses: recurringExpensesData,
      semesterFees: semesterFeesData.length > 0 ? semesterFeesData : undefined,
      fixedExpenses: fixedExpensesData,
      dailySpendingLimit,
      monthlyNeeds,
      monthlyWants,
      monthlySavings,
      emergencyFund: {
        target: 0,
        current: 0,
        history: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateProfile(profileData as any);
    router.push('/dashboard');
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Welcome to PocketPilot!
          </CardTitle>
          <CardDescription>Let's set up your student financial profile in a few simple steps.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="collegeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>College/University Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., IIT Delhi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="livingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Living Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select living type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hostel">
                              <div className="flex items-center gap-2">
                                <Home className="h-4 w-4" />
                                Hostel
                              </div>
                            </SelectItem>
                            <SelectItem value="day_scholar">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                Day Scholar
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Income */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Monthly Income</h3>
                <FormField
                  control={form.control}
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Pocket Money / Stipend (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 5000" {...field} />
                      </FormControl>
                      <FormDescription>Your regular monthly allowance or stipend</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hasInternship"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          I have internship income
                        </FormLabel>
                        <FormDescription>
                          Toggle if you earn from internships or part-time work
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchedHasInternship && (
                  <FormField
                    control={form.control}
                    name="internshipIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Internship Income (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 3000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Recurring Expenses */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recurring Monthly Expenses</h3>
                <p className="text-sm text-muted-foreground">Add expenses like mess fees, rent, travel, or subscriptions</p>
                <div className="space-y-4">
                  {expenseFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-[2fr,1.5fr,1.5fr,auto] items-end gap-4 p-4 border rounded-lg">
                      <FormField
                        control={form.control}
                        name={`recurringExpenses.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expense Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Mess Fees" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`recurringExpenses.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Amount" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`recurringExpenses.${index}.category`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {expenseCategories.map(cat => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeExpense(index)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendExpense({ name: '', amount: 0, category: 'Other' })}
                >
                  Add Recurring Expense
                </Button>
              </div>

              {/* Semester Fees */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasSemesterFees"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">I have upcoming semester fees</FormLabel>
                        <FormDescription>
                          Add semester fee details to plan your savings
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchedHasSemesterFees && (
                  <div className="space-y-4">
                    {feeFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-1 md:grid-cols-[2fr,2fr,auto] items-end gap-4 p-4 border rounded-lg">
                        <FormField
                          control={form.control}
                          name={`semesterFees.${index}.amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fee Amount (₹)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g., 50000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`semesterFees.${index}.dueDate`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Due Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(new Date(field.value), "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" variant="destructive" size="icon" onClick={() => removeFee(index)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendFee({ amount: 0, dueDate: '' })}
                    >
                      Add Semester Fee
                    </Button>
                  </div>
                )}
              </div>

              {/* Budget Summary */}
              <Card className="bg-secondary/50">
                <CardHeader>
                  <CardTitle className="text-lg">Your Budget Breakdown</CardTitle>
                  <CardDescription>Student-optimized: 60% Needs, 30% Wants, 10% Savings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <SummaryCard 
                    title="Needs" 
                    amount={monthlyNeeds} 
                    icon={<Wallet className="h-5 w-5 text-primary" />} 
                    description="Your recurring expenses" 
                  />
                  <SummaryCard 
                    title="Wants" 
                    amount={monthlyWants} 
                    icon={<ShoppingCart className="h-5 w-5 text-accent" />} 
                    description="For fun & discretionary spending" 
                  />
                  <SummaryCard 
                    title="Savings" 
                    amount={monthlySavings} 
                    icon={<PiggyBank className="h-5 w-5 text-green-500" />} 
                    description="For goals & emergencies" 
                  />
                </CardContent>
                <CardFooter>
                  <div className="w-full flex justify-between items-center p-3 rounded-lg bg-primary/10">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Daily Safe-to-Spend</span>
                      <span className="text-xs text-muted-foreground">Your daily discretionary budget</span>
                    </div>
                    <div className="text-xl font-bold text-primary">₹{dailySpendingLimit.toFixed(2)}</div>
                  </div>
                </CardFooter>
              </Card>

              <Button type="submit" className="w-full" size="lg">Complete Setup</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
