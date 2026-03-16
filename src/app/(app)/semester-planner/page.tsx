"use client";

import { format } from 'date-fns';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, CalendarClock, Landmark, Plus, Trash2 } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { semesterLiabilityCategories } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const plannerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.coerce.number().min(1, 'Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  category: z.enum(semesterLiabilityCategories),
});

type PlannerValues = z.infer<typeof plannerSchema>;

export default function SemesterPlannerPage() {
  const { semesterLiabilities, addSemesterLiability, deleteSemesterLiability, studentAnalytics } = useApp();
  const form = useForm<PlannerValues>({
    resolver: zodResolver(plannerSchema),
    defaultValues: {
      title: '',
      amount: 0,
      dueDate: '',
      category: 'Semester Fees',
    },
  });

  async function onSubmit(values: PlannerValues) {
    await addSemesterLiability({
      ...values,
      dueDate: new Date(values.dueDate).toISOString(),
    });

    form.reset({
      title: '',
      amount: 0,
      dueDate: '',
      category: 'Semester Fees',
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Semester Planner
            </CardTitle>
            <CardDescription>Add academic expenses that should reduce your daily spending room before they hit.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Semester 4 tuition" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {semesterLiabilityCategories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Semester Cost
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Reserve Snapshot
            </CardTitle>
            <CardDescription>How the planner is affecting your current month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reserved in next 30 days</p>
              <p className="mt-1 text-3xl font-bold">₹{(studentAnalytics?.reservedForUpcomingLiabilities || 0).toFixed(0)}</p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current daily limit</p>
              <p className="mt-1 text-3xl font-bold">₹{(studentAnalytics?.currentDailyLimit || 0).toFixed(0)}</p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
              {studentAnalytics?.survivalMode
                ? 'Survival Mode is active because the adjusted daily limit is below the minimum threshold.'
                : 'Your planner reserve has been folded into the daily safe-to-spend number.'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Planned Academic Costs
          </CardTitle>
          <CardDescription>Stored under your user record as semester liabilities.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {semesterLiabilities.length > 0 ? semesterLiabilities.map((liability) => (
            <div key={liability.id} className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{liability.title}</p>
                <p className="text-sm text-muted-foreground">{liability.category} • Due {format(new Date(liability.dueDate), 'MMM d, yyyy')}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Amount</p>
                  <p className="text-lg font-bold">₹{liability.amount.toFixed(0)}</p>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => deleteSemesterLiability(liability.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No semester costs added yet. Start with tuition, books, exam fees, projects, or fest budgets.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}