'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Plus, CalendarIcon, ChevronDown, Loader2 } from 'lucide-react';
import { semesterLiabilityCategories } from '@/lib/types';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.coerce.number().min(1, 'Amount must be at least ₹1'),
  dueDate: z.date({ invalid_type_error: 'Due date is required' }),
  category: z.enum(semesterLiabilityCategories),
});

type FormValues = z.infer<typeof formSchema>;

export function AddLiabilityForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      amount: 0,
      dueDate: undefined,
      category: 'Semester Fees',
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);

      // Add liability via API endpoint (will be created)
      const response = await fetch('/api/semester-liabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          amount: values.amount,
          dueDate: values.dueDate.toISOString(),
          category: values.category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add liability');
      }

      toast({
        title: 'Added!',
        description: `${values.title} added to your planner.`,
      });

      // Reset and close
      form.reset();
      setSelectedDate(undefined);
      setIsOpen(false);

      // Force page reload to sync data
      window.location.reload();
    } catch (error) {
      console.error('Error adding liability:', error);
      toast({
        title: 'Error',
        description: 'Failed to add liability. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-teal-600" />
              Add Academic Cost
            </CardTitle>
            <CardDescription>
              Plan for upcoming semester expenses, exams, books, or projects.
            </CardDescription>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-muted-foreground transition-transform hover:text-foreground"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Semester 4 tuition"
                {...form.register('title')}
                className={form.formState.errors.title ? 'border-red-500' : ''}
              />
              {form.formState.errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* Amount and Due Date */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000"
                  step="0.01"
                  min="1"
                  {...form.register('amount')}
                  className={form.formState.errors.amount ? 'border-red-500' : ''}
                />
                {form.formState.errors.amount && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate
                        ? format(selectedDate, 'MMM d, yyyy')
                        : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        form.setValue('dueDate', date || new Date());
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.dueDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.dueDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.watch('category')}
                onValueChange={(value) =>
                  form.setValue('category', value as any)
                }
              >
                <SelectTrigger className={form.formState.errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {semesterLiabilityCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Planner
                </>
              )}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
