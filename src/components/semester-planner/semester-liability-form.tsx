import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarClock, Plus } from 'lucide-react';
import { semesterLiabilityCategories, type SemesterLiabilityCategory } from '@/lib/types';
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

interface Props {
  onAdd: (values: { title: string; amount: number; dueDate: string; category: SemesterLiabilityCategory }) => Promise<void>;
}

export function SemesterLiabilityForm({ onAdd }: Props) {
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
    await onAdd({
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
  );
}
