
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import {
  Trash2,
  Home,
  GraduationCap,
  Briefcase,
  Loader2,
  CheckCircle,
  Plus,
  CalendarIcon,
} from "lucide-react";
import { format, differenceInDays, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createProfile } from "@/lib/db/profile";
import { addLiability } from "@/lib/db/liabilities";
import { useAuth } from "@/context/AuthContext";
import { EXPENSE_CATEGORY_VALUES } from "@/lib/types";

// Zod schemas for each step
const step1Schema = z.object({
  collegeName: z.string().min(1, "College name is required"),
  livingType: z.enum(["hostel", "day_scholar"]),
});

const step2Schema = z.object({
  monthlyIncome: z.coerce
    .number()
    .min(1000, "Monthly income must be at least ₹1,000"),
  hasInternship: z.boolean().default(false),
  internshipIncome: z.coerce.number().optional(),
});

const step3Schema = z.object({
  semesterStartDate: z.string().min(1, "Start date is required"),
  semesterEndDate: z.string().min(1, "End date is required"),
});

const step4ItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
  category: z.string().min(1, "Category is required"),
});

const step4Schema = z.object({
  liabilities: z.array(step4ItemSchema).optional(),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;
type Step3Values = z.infer<typeof step3Schema>;
type Step4Values = z.infer<typeof step4Schema>;

interface OnboardingData {
  step1: Step1Values;
  step2: Step2Values;
  step3: Step3Values;
  step4: Step4Values;
}

interface NewLiability {
  title: string;
  amount: number;
  dueDate: string;
  category: string;
  isNew: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newLiabilities, setNewLiabilities] = useState<NewLiability[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    title: "",
    amount: "",
    dueDate: "",
    category: EXPENSE_CATEGORY_VALUES[0] || "Other",
  });

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    step1: { collegeName: "", livingType: "hostel" },
    step2: { monthlyIncome: 0, hasInternship: false, internshipIncome: 0 },
    step3: { semesterStartDate: "", semesterEndDate: "" },
    step4: { liabilities: [] },
  });

  // Form for current step
  const form = useForm<any>({
    mode: "onChange",
  });

  const handleStep1Next = async (data: Step1Values) => {
    setOnboardingData((prev) => ({ ...prev, step1: data }));
    setCurrentStep(2);
  };

  const handleStep2Next = async (data: Step2Values) => {
    setOnboardingData((prev) => ({ ...prev, step2: data }));
    setCurrentStep(3);
  };

  const handleStep3Next = async (data: Step3Values) => {
    // Validate dates
    const startDate = parse(data.semesterStartDate, "yyyy-MM-dd", new Date());
    const endDate = parse(data.semesterEndDate, "yyyy-MM-dd", new Date());

    if (startDate >= endDate) {
      toast({
        variant: "destructive",
        title: "Invalid Dates",
        description: "End date must be after start date.",
      });
      return;
    }

    if (startDate < new Date()) {
      toast({
        variant: "destructive",
        title: "Invalid Start Date",
        description: "Semester cannot start in the past.",
      });
      return;
    }

    setOnboardingData((prev) => ({ ...prev, step3: data }));
    setCurrentStep(4);
  };

  const handleAddLiability = () => {
    if (!newItemForm.title || !newItemForm.amount || !newItemForm.dueDate) {
      toast({
        variant: "destructive",
        title: "Incomplete Entry",
        description: "Please fill all fields.",
      });
      return;
    }

    if (newLiabilities.length >= 5) {
      toast({
        variant: "destructive",
        title: "Limit Reached",
        description: "Maximum 5 upcoming costs allowed.",
      });
      return;
    }

    setNewLiabilities((prev) => [
      ...prev,
      {
        ...newItemForm,
        amount: parseFloat(newItemForm.amount),
        isNew: true,
      },
    ]);

    setNewItemForm({
      title: "",
      amount: "",
      dueDate: "",
      category: EXPENSE_CATEGORY_VALUES[0] || "Other",
    });
    setShowAddForm(false);
  };

  const handleRemoveLiability = (index: number) => {
    setNewLiabilities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStep4Submit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Auth Error",
        description: "User not authenticated.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const data = onboardingData;

      // Parse dates
      const startDate = parse(
        data.step3.semesterStartDate,
        "yyyy-MM-dd",
        new Date()
      );
      const endDate = parse(
        data.step3.semesterEndDate,
        "yyyy-MM-dd",
        new Date()
      );

      // Create profile
      await createProfile(user.id, {
        college_name: data.step1.collegeName,
        living_type: data.step1.livingType,
        monthly_pocket_money: data.step2.monthlyIncome,
        internship_income: data.step2.hasInternship
          ? data.step2.internshipIncome || 0
          : 0,
        semester_start_date: format(startDate, "yyyy-MM-dd"),
        semester_end_date: format(endDate, "yyyy-MM-dd"),
      });

      // Create liabilities
      for (const liability of newLiabilities) {
        await addLiability(user.id, {
          title: liability.title,
          amount: liability.amount,
          due_date: liability.dueDate,
          category: liability.category as any,
        });
      }

      // Show success animation
      setShowSuccess(true);

      // Redirect after a brief delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description:
          error.message ||
          "There was an error saving your profile. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const daysInSemester =
    onboardingData.step3.semesterStartDate && onboardingData.step3.semesterEndDate
      ? differenceInDays(
          parse(onboardingData.step3.semesterEndDate, "yyyy-MM-dd", new Date()),
          parse(onboardingData.step3.semesterStartDate, "yyyy-MM-dd", new Date())
        )
      : 0;

  const effectiveIncome = onboardingData.step2.hasInternship
    ? onboardingData.step2.monthlyIncome +
      (onboardingData.step2.internshipIncome || 0) / 3
    : onboardingData.step2.monthlyIncome;

  const totalLiabilities = newLiabilities.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex justify-center mb-4 animate-bounce">
              <CheckCircle className="h-16 w-16 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">All Set!</h2>
            <p className="text-muted-foreground">
              Your profile is ready. Taking you to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 py-8">
      <Card className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Step {currentStep} of 4
            </h3>
            <span className="text-sm font-medium text-teal-600">
              {Math.round((currentStep / 4) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        <CardHeader>
          <CardTitle className="text-2xl">
            {currentStep === 1 && "College Information"}
            {currentStep === 2 && "Monthly Income"}
            {currentStep === 3 && "Semester Duration"}
            {currentStep === 4 && "Upcoming Expenses"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 &&
              "Tell us about your college and living situation"}
            {currentStep === 2 && "Let's set up your monthly income"}
            {currentStep === 3 && "When does your semester start and end?"}
            {currentStep === 4 &&
              "Add known upcoming expenses so we can protect your budget"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                currentStep === 1
                  ? handleStep1Next
                  : currentStep === 2
                    ? handleStep2Next
                    : currentStep === 3
                      ? handleStep3Next
                      : handleStep4Submit
              )}
              className="space-y-6"
            >
              {/* STEP 1: College Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* College Name */}
                  <FormField
                    control={form.control}
                    name="collegeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>College/University Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., IIT Delhi"
                            {...field}
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Living Type - Toggle Cards */}
                  <FormField
                    control={form.control}
                    name="livingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Where do you live?</FormLabel>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Hostel Card */}
                          <div
                            onClick={() => field.onChange("hostel")}
                            className={cn(
                              "p-4 rounded-lg border-2 cursor-pointer transition-all",
                              field.value === "hostel"
                                ? "border-teal-600 bg-teal-50"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Home className="h-8 w-8 text-teal-600" />
                              <span className="font-semibold">Hostel</span>
                              <span className="text-xs text-muted-foreground text-center">
                                Living on campus
                              </span>
                            </div>
                          </div>

                          {/* Day Scholar Card */}
                          <div
                            onClick={() => field.onChange("day_scholar")}
                            className={cn(
                              "p-4 rounded-lg border-2 cursor-pointer transition-all",
                              field.value === "day_scholar"
                                ? "border-teal-600 bg-teal-50"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <GraduationCap className="h-8 w-8 text-teal-600" />
                              <span className="font-semibold">Day Scholar</span>
                              <span className="text-xs text-muted-foreground text-center">
                                Commuting daily
                              </span>
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* STEP 2: Money Setup */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Monthly Pocket Money */}
                  <FormField
                    control={form.control}
                    name="monthlyIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Pocket Money</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground">
                              ₹
                            </span>
                            <Input
                              type="number"
                              placeholder="5000"
                              {...field}
                              className="pl-6"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Your regular monthly allowance
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Internship Toggle */}
                  <FormField
                    control={form.control}
                    name="hasInternship"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5 flex-1">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            I have internship income
                          </FormLabel>
                          <FormDescription>
                            Earn from internships or part-time work
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

                  {/* Internship Income */}
                  {form.watch("hasInternship") && (
                    <FormField
                      control={form.control}
                      name="internshipIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Internship Income</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-muted-foreground">
                                ₹
                              </span>
                              <Input
                                type="number"
                                placeholder="3000"
                                {...field}
                                className="pl-6"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Internship income is automatically smoothed across 3
                            months
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Preview */}
                  <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <p className="text-sm font-semibold text-teal-900">
                      Your effective monthly income
                    </p>
                    <p className="text-2xl font-bold text-teal-600 mt-1">
                      ₹{Math.round(effectiveIncome).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: Semester Dates */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Semester Start Date */}
                  <FormField
                    control={form.control}
                    name="semesterStartDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Semester Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? format(
                                      parse(
                                        field.value,
                                        "yyyy-MM-dd",
                                        new Date()
                                      ),
                                      "PPP"
                                    )
                                  : "Pick a date"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={
                                field.value
                                  ? parse(field.value, "yyyy-MM-dd", new Date())
                                  : undefined
                              }
                              onSelect={(date) => {
                                if (date) {
                                  field.onChange(format(date, "yyyy-MM-dd"));
                                }
                              }}
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Semester End Date */}
                  <FormField
                    control={form.control}
                    name="semesterEndDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Semester End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? format(
                                      parse(
                                        field.value,
                                        "yyyy-MM-dd",
                                        new Date()
                                      ),
                                      "PPP"
                                    )
                                  : "Pick a date"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={
                                field.value
                                  ? parse(field.value, "yyyy-MM-dd", new Date())
                                  : undefined
                              }
                              onSelect={(date) => {
                                if (date) {
                                  field.onChange(format(date, "yyyy-MM-dd"));
                                }
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Days in Semester */}
                  {daysInSemester > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900">
                        Duration
                      </p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {daysInSemester} days
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Upcoming Costs */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Liabilities List */}
                  {newLiabilities.length > 0 && (
                    <div className="space-y-3">
                      {newLiabilities.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Due {format(parse(item.dueDate, "yyyy-MM-dd", new Date()), "MMM d, yyyy")}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-teal-600">
                              ₹{item.amount.toLocaleString("en-IN")}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveLiability(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Liability Form */}
                  {showAddForm && (
                    <div className="p-4 rounded-lg border border-teal-200 bg-teal-50 space-y-3">
                      <Input
                        placeholder="e.g., Semester Fees"
                        value={newItemForm.title}
                        onChange={(e) =>
                          setNewItemForm({ ...newItemForm, title: e.target.value })
                        }
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-muted-foreground">
                          ₹
                        </span>
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={newItemForm.amount}
                          onChange={(e) =>
                            setNewItemForm({
                              ...newItemForm,
                              amount: e.target.value,
                            })
                          }
                          className="pl-6"
                        />
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start pl-3">
                            {newItemForm.dueDate
                              ? format(
                                  parse(newItemForm.dueDate, "yyyy-MM-dd", new Date()),
                                  "PPP"
                                )
                              : "Pick due date"}
                            <CalendarIcon className="ml-auto h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              newItemForm.dueDate
                                ? parse(
                                    newItemForm.dueDate,
                                    "yyyy-MM-dd",
                                    new Date()
                                  )
                                : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                setNewItemForm({
                                  ...newItemForm,
                                  dueDate: format(date, "yyyy-MM-dd"),
                                });
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <Select
                        value={newItemForm.category}
                        onValueChange={(value) =>
                          setNewItemForm({ ...newItemForm, category: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORY_VALUES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleAddLiability}
                          className="flex-1 bg-teal-600 hover:bg-teal-700"
                        >
                          Add
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowAddForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Add Button or Total */}
                  {!showAddForm && (
                    <>
                      {newLiabilities.length < 5 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowAddForm(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Upcoming Expense
                        </Button>
                      )}

                      {totalLiabilities > 0 && (
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-sm font-semibold text-amber-900">
                            Total upcoming costs
                          </p>
                          <p className="text-2xl font-bold text-amber-600 mt-1">
                            ₹{totalLiabilities.toLocaleString("en-IN")}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="flex-1"
                >
                  Back
                </Button>

                {currentStep === 4 ? (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Complete Setup"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!form.formState.isValid}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    Next
                  </Button>
                )}

                {currentStep === 4 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleStep4Submit()}
                    disabled={isSubmitting}
                  >
                    Skip
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
