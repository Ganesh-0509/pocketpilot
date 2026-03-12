
"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '@/hooks/use-app';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash, CalendarIcon, ShieldAlert } from 'lucide-react';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { expenseCategories } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const recurringExpenseSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Expense name is required'),
    amount: z.coerce.number().min(0, 'Amount must be positive'),
    category: z.string().min(1, 'Category is required'),
});

const profileSchema = z.object({
    collegeName: z.string().min(1, 'College name is required'),
    monthlyIncome: z.coerce.number().min(0, 'Income cannot be negative'),
    recurringExpenses: z.array(recurringExpenseSchema).optional(),
    reminderTime: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;


export default function SettingsPage() {
    const { profile, updateProfile, deleteAccount } = useApp();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            collegeName: profile?.collegeName || '',
            monthlyIncome: profile?.monthlyIncome || 0,
            recurringExpenses: profile?.recurringExpenses || [],
            reminderTime: profile?.reminderTime || '20:00',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "recurringExpenses",
    });

    React.useEffect(() => {
        if (profile) {
            form.reset({
                collegeName: profile.collegeName || '',
                monthlyIncome: profile.monthlyIncome || 0,
                recurringExpenses: profile.recurringExpenses || [],
                reminderTime: profile.reminderTime || '20:00',
            });
        }
    }, [profile, form]);

    function onSubmit(data: ProfileValues) {
        // Convert recurringExpenses to fixedExpenses for backward compatibility
        const fixedExpenses = (data.recurringExpenses || []).map(exp => ({
            id: exp.id || `fe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: exp.name,
            amount: exp.amount,
            category: exp.category,
        }));

        updateProfile({ 
            ...data, 
            fixedExpenses,
        } as any);
        toast({
            title: "Profile Updated",
            description: "Your settings have been successfully updated.",
        })
        router.push('/dashboard');
    }

    return (
        <div className="space-y-6">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Student Profile Settings</CardTitle>
                    <CardDescription>Update your student profile and recurring expenses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                                    name="monthlyIncome"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Monthly Income (₹)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 5000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reminderTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Daily Reminder Time</FormLabel>
                                            <FormControl>
                                                <Input type="time" {...field} />
                                            </FormControl>
                                            <CardDescription className="text-[10px]">Set a time for your daily check-in reminder.</CardDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div>
                                <Label className="text-lg font-medium">Recurring Monthly Expenses</Label>
                                <p className="text-sm text-muted-foreground mb-4">Update your recurring expenses like mess fees, rent, or subscriptions.</p>
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
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
                                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    onClick={() => append({ id: `new-${Date.now()}`, name: '', amount: 0, category: 'Other' })}
                                >
                                    Add Recurring Expense
                                </Button>
                            </div>

                            <Button type="submit" className="w-full" size="lg">Save Changes</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="w-full max-w-4xl mx-auto border-destructive">
                <CardHeader>
                    <CardTitle className="font-headline text-destructive flex items-center gap-2">
                        <ShieldAlert />
                        Danger Zone
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold">Delete Account</p>
                            <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Delete My Account</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={deleteAccount}>Yes, Delete My Account</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
