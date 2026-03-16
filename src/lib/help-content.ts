/**
 * Help & User Guide Content
 * Professional documentation for FinMate features
 */

export interface HelpSection {
  id: string;
  title: string;
  icon?: string;
  content: HelpSubsection[];
}

export interface HelpSubsection {
  heading: string;
  description: string;
  steps?: string[];
  tips?: string[];
}

export const helpSections: HelpSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "🚀",
    content: [
      {
        heading: "Welcome to PocketPilot",
        description: "PocketPilot is your student finance companion. We help you track expenses, manage pocket money, achieve financial goals, and make smarter money decisions during your college years.",
        tips: [
          "Complete your profile in Settings to get personalized budget recommendations",
          "PocketPilot uses a 60/30/10 budget split optimized for student life",
          "All your data is securely stored and synced across devices",
        ],
      },
      {
        heading: "Initial Setup",
        description: "To get the most out of PocketPilot, follow these steps:",
        steps: [
          "Complete onboarding by entering your college name and monthly income",
          "Add your recurring expenses (mess fees, subscriptions, etc.) for accurate budget calculation",
          "Review your daily spending limit calculated using the student budget formula (60/30/10)",
          "Set up your first financial goal to start saving with purpose",
          "Enable the AI Assistant to get personalized financial advice",
        ],
      },
      {
        heading: "Understanding Your Budget",
        description: "PocketPilot uses a student-optimized budget allocation:",
        tips: [
          "Students: 60% Needs, 30% Wants, 10% Savings - optimized for pocket money management",
          "Needs include mess fees, rent, transport, and other recurring expenses",
          "Wants are calculated as daily safe-to-spend amount for discretionary purchases",
        ],
      },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard Overview",
    icon: "📊",
    content: [
      {
        heading: "Your Financial Snapshot",
        description: "The Dashboard provides a comprehensive view of your finances at a glance. All key metrics update in real-time as you log expenses and make financial decisions.",
      },
      {
        heading: "Key Metrics Explained",
        description: "Understanding your dashboard cards:",
        tips: [
          "Monthly Income: Your total monthly earnings before deductions",
          "Overall Spending: Total amount spent across all categories",
          "Total Daily Savings: Cumulative savings from staying under your daily limit",
          "Total Goal Savings: Money you've committed to specific financial goals",
        ],
      },
      {
        heading: "Financial Breakdown",
        description: "The breakdown section shows how your monthly income is allocated:",
        steps: [
          "Needs: Essential expenses like rent, groceries, utilities",
          "Wants: Discretionary spending like entertainment, dining out",
          "Savings: Amount available for goals and emergency fund",
          "Goal Contributions: Portion of savings committed to specific goals",
          "Emergency Fund Availability: Remaining savings for unexpected events",
        ],
      },
      {
        heading: "Charts & Insights",
        description: "Visual representations help you understand spending patterns:",
        tips: [
          "Recent Spending chart shows daily totals (not individual transactions)",
          "Active Goals track your progress toward each financial target",
          "Spending Forecast predicts future expenses based on your patterns",
          "Smart Daily Briefing provides AI-powered insights each day",
        ],
      },
    ],
  },
  {
    id: "daily-checkin",
    title: "Daily Check-In (Add Expense)",
    icon: "✅",
    content: [
      {
        heading: "Logging Your Expenses",
        description: "The Daily Check-In page is where you record your spending. Quick and easy expense tracking helps you stay within your daily limit.",
      },
      {
        heading: "How to Add an Expense",
        description: "Follow these steps to log a transaction:",
        steps: [
          "Navigate to 'Daily Check-in' from the sidebar",
          "Enter the amount you spent (e.g., 250.50)",
          "Select the appropriate category from the dropdown",
          "Add a brief description (optional but recommended)",
          "Choose the payment method (Cash/Card/UPI/Other)",
          "Click 'Log Expense' to save",
        ],
      },
      {
        heading: "Smart Category Selection",
        description: "Categories are ordered based on your role for faster selection:",
        tips: [
          "Students see Education, Transport, Food first",
          "Professionals see Transport, Food, Health first",
          "Housewives see Groceries, Utilities, Health first",
          "Custom categories can be added for unique expenses",
        ],
      },
      {
        heading: "Voice & OCR Features",
        description: "Advanced input methods for faster expense logging:",
        steps: [
          "Voice Input: Click the microphone icon to speak your expense",
          "OCR Upload: Snap a photo of a receipt to auto-extract amount and category",
          "Both features use AI to parse your input accurately",
        ],
        tips: [
          "Voice input works best in quiet environments",
          "OCR works with clear, well-lit receipt photos",
          "Always verify auto-filled amounts before saving",
        ],
      },
      {
        heading: "Daily Limit Tracking",
        description: "Stay on track with real-time feedback:",
        tips: [
          "Green indicator: You're under your daily limit - great job!",
          "Yellow indicator: Approaching your limit - be cautious",
          "Red indicator: Over your daily limit - review your spending",
          "Daily savings accumulate when you stay under budget",
        ],
      },
    ],
  },
  {
    id: "expenses",
    title: "Expenses & Analysis",
    icon: "📈",
    content: [
      {
        heading: "Expense History",
        description: "The Expenses page shows all your logged transactions with powerful filtering and analysis tools.",
      },
      {
        heading: "Viewing Your Expenses",
        description: "Navigate and filter your expense history:",
        steps: [
          "See all transactions sorted by date (newest first)",
          "Filter by category to analyze specific spending areas",
          "Filter by date range to review weekly/monthly patterns",
          "Search by description to find specific transactions",
          "View total spending for filtered results",
        ],
      },
      {
        heading: "Editing Transactions",
        description: "Made a mistake? You can edit or delete any expense:",
        steps: [
          "Click the 'Edit' button on any transaction",
          "Update the amount, category, or description",
          "Save changes to update your records",
          "Delete transactions if they were logged incorrectly",
        ],
        tips: [
          "Changes update your daily limit calculations immediately",
          "Deleted expenses cannot be recovered - be careful!",
        ],
      },
      {
        heading: "Category Breakdown",
        description: "Understand where your money goes:",
        tips: [
          "Pie charts show spending distribution across categories",
          "Bar charts compare category spending month-over-month",
          "Identify your top spending categories at a glance",
          "Use insights to adjust your spending habits",
        ],
      },
      {
        heading: "Spending Trends",
        description: "Analyze your financial patterns over time:",
        tips: [
          "Weekly trends show if you're improving or slipping",
          "Monthly comparisons reveal seasonal spending patterns",
          "AI-powered insights suggest areas for improvement",
          "Export reports for detailed offline analysis",
        ],
      },
    ],
  },
  {
    id: "fixed-expenses",
    title: "Fixed Expenses",
    icon: "💳",
    content: [
      {
        heading: "Managing Recurring Costs",
        description: "Fixed Expenses are regular, predictable costs like rent, subscriptions, and bills. Managing them separately helps with accurate budget planning.",
      },
      {
        heading: "Adding Fixed Expenses",
        description: "Set up your recurring expenses:",
        steps: [
          "Go to 'Fixed Expenses' in the sidebar",
          "Click 'Add Fixed Expense'",
          "Enter expense name (e.g., 'Netflix Subscription')",
          "Enter monthly amount",
          "Select category",
          "Set timeline (optional - for limited-duration expenses)",
          "Choose start date if applicable",
          "Save the expense",
        ],
      },
      {
        heading: "Timeline Feature",
        description: "For expenses that won't last forever:",
        tips: [
          "Set timeline in months for temporary expenses (e.g., '12' for annual subscription)",
          "System calculates end date automatically",
          "Useful for tracking loan payments, limited subscriptions",
          "Leave blank for indefinite expenses like rent",
        ],
      },
      {
        heading: "Payment Tracking",
        description: "Mark expenses as paid each month:",
        steps: [
          "View your fixed expenses list",
          "Click 'Mark as Paid' when you pay a bill",
          "Track payment history to avoid late fees",
          "See which bills are pending vs. paid this month",
        ],
        tips: [
          "Payment status resets at the start of each month",
          "Set reminders outside FinMate for due dates",
        ],
      },
      {
        heading: "Budget Impact",
        description: "Fixed expenses affect your available budget:",
        tips: [
          "Total fixed expenses are deducted from monthly income",
          "Remaining amount determines your daily spending limit",
          "Reducing fixed expenses increases daily budget",
          "Review regularly to identify cancellation opportunities",
        ],
      },
    ],
  },
  {
    id: "goals",
    title: "Goals & Emergency Fund",
    icon: "🎯",
    content: [
      {
        heading: "Setting Financial Goals",
        description: "Goals help you save with purpose. Whether it's a vacation, gadget, or down payment, FinMate tracks your progress.",
      },
      {
        heading: "Creating a Goal",
        description: "Set up a new savings goal:",
        steps: [
          "Navigate to 'Goals' page",
          "Click 'Add Goal' or select a template",
          "Enter goal name (e.g., 'Emergency Fund', 'New Laptop')",
          "Set target amount",
          "Choose monthly contribution you can afford",
          "System calculates timeline automatically",
          "Save and start contributing",
        ],
      },
      {
        heading: "Goal Templates",
        description: "Quick-start goals based on your role:",
        tips: [
          "Students: Laptop Fund, Certification Course, Study Abroad",
          "Professionals: Home Down Payment, Car Fund, Skill Development",
          "Housewives: Home Renovation, Children's Education, Gold Savings",
          "Templates pre-fill recommended amounts - customize as needed",
        ],
      },
      {
        heading: "Contributing to Goals",
        description: "Add money to your goals:",
        steps: [
          "Click 'Contribute' on any goal",
          "Enter contribution amount",
          "Confirm the transaction",
          "Goal progress updates immediately",
        ],
        tips: [
          "Contributions are tracked separately from daily expenses",
          "Monthly contributions are suggested based on your savings budget",
          "You can contribute to multiple goals simultaneously",
        ],
      },
      {
        heading: "Emergency Fund",
        description: "Your financial safety net for unexpected events:",
        steps: [
          "Set a target amount (recommended: 3-6 months of expenses)",
          "Make deposits when you have extra savings",
          "Withdraw only for true emergencies",
          "Track deposit/withdrawal history",
        ],
        tips: [
          "Emergency Fund is separate from other goals",
          "Build this before pursuing discretionary goals",
          "Recommended target: 6 months of fixed expenses minimum",
        ],
      },
      {
        heading: "Goal Management",
        description: "Editing and completing goals:",
        tips: [
          "Edit goals to adjust targets or contributions",
          "Mark goals as complete when target is reached",
          "Withdraw from goals if plans change",
          "Completed goals can be archived or reused",
        ],
      },
    ],
  },
  {
    id: "ai-assistant",
    title: "AI Assistant",
    icon: "🤖",
    content: [
      {
        heading: "Your Personal Finance Advisor",
        description: "The AI Assistant powered by Google Gemini provides intelligent insights, answers questions, and offers personalized financial advice.",
      },
      {
        heading: "Using the Chatbot",
        description: "Access AI assistance anytime:",
        steps: [
          "Click the chat icon (bottom-right corner)",
          "Type your question or request",
          "AI analyzes your financial data for context",
          "Receive personalized, actionable advice",
          "Ask follow-up questions for clarity",
        ],
      },
      {
        heading: "What You Can Ask",
        description: "The AI can help with various queries:",
        tips: [
          "\"How am I doing this month?\" - Get spending summary",
          "\"Where should I cut costs?\" - Expense optimization tips",
          "\"Am I on track for my goals?\" - Goal progress analysis",
          "\"Explain my budget breakdown\" - Budget clarification",
          "\"How can I save more?\" - Savings strategies",
        ],
      },
      {
        heading: "Smart Features",
        description: "AI capabilities:",
        tips: [
          "Student-focused advice tailored for college life",
          "Spending alerts when you exceed category budgets",
          "Proactive suggestions for financial improvement",
          "Daily briefings with actionable insights",
        ],
      },
      {
        heading: "Privacy & Data",
        description: "Your data security matters:",
        tips: [
          "Conversations are not stored long-term",
          "AI accesses only your PocketPilot data (not external accounts)",
          "Recommendations are suggestions, not professional financial advice",
          "Always verify important financial decisions independently",
        ],
      },
      {
        heading: "Best Practices",
        description: "Get the most from AI assistance:",
        tips: [
          "Be specific in your questions for better answers",
          "Provide context (timeframe, amounts) when relevant",
          "Use AI for insights, not as replacement for financial planning",
        ],
      },
    ],
  },
  {
    id: "reports",
    title: "Reports & Export",
    icon: "📄",
    content: [
      {
        heading: "Financial Reports",
        description: "Export your data for offline analysis, tax filing, or record-keeping.",
      },
      {
        heading: "Export Options",
        description: "Available export formats:",
        tips: [
          "CSV Export: Spreadsheet-compatible format for Excel/Sheets",
          "PDF Report: Formatted summary with charts and insights",
          "Both exports include transaction details and summaries",
        ],
      },
      {
        heading: "CSV Export",
        description: "Detailed transaction data:",
        steps: [
          "Click 'Export CSV' in the header",
          "Select date range (optional)",
          "Choose categories to include (optional)",
          "Download generates instantly",
          "Open in Excel/Sheets for analysis",
        ],
        tips: [
          "CSV includes: Date, Amount, Category, Description, Payment Method",
          "Useful for creating custom charts and pivot tables",
          "Can be imported into accounting software",
        ],
      },
      {
        heading: "PDF Reports",
        description: "Professional formatted reports:",
        steps: [
          "Click 'Export PDF' in the header",
          "Report generates with charts and summaries",
          "Includes spending by category, trends, goals progress",
          "Download and save or print as needed",
        ],
        tips: [
          "PDF reports are great for sharing with family",
          "Use for monthly financial reviews",
          "Archive for long-term record-keeping",
        ],
      },
      {
        heading: "Data Insights",
        description: "What reports reveal:",
        tips: [
          "Spending patterns across time periods",
          "Category-wise expense distribution",
          "Budget adherence (actual vs. planned)",
          "Goal achievement progress",
          "Savings trends and growth",
        ],
      },
      {
        heading: "Report Frequency",
        description: "Recommended review schedule:",
        tips: [
          "Weekly: Quick review of daily expenses",
          "Monthly: Comprehensive analysis and adjustments",
          "Quarterly: Goal progress check and realignment",
          "Yearly: Tax preparation and long-term planning",
        ],
      },
    ],
  },
  {
    id: "gamification",
    title: "Badges & Gamification",
    icon: "🏆",
    content: [
      {
        heading: "Earn Rewards for Good Habits",
        description: "FinMate gamifies financial discipline. Earn badges for milestones and build streaks for consistent expense tracking.",
      },
      {
        heading: "Badge System",
        description: "Unlock achievements as you progress:",
        tips: [
          "First Expense: Log your first transaction",
          "Week Warrior: Track expenses for 7 consecutive days",
          "Month Master: Complete 30 days of tracking",
          "Goal Getter: Achieve your first financial goal",
          "Savings Superstar: Save ₹10,000 total",
          "Budget Boss: Stay under budget for 30 days",
          "Investment Initiator: Add your first investment",
          "Emergency Ready: Build 3-month emergency fund",
        ],
      },
      {
        heading: "Streak Tracking",
        description: "Build consistency with daily check-ins:",
        tips: [
          "Current Streak: Days in a row you've logged expenses",
          "Longest Streak: Your personal best record",
          "Streak resets if you miss a day",
          "Even ₹0 spending should be logged to maintain streak",
        ],
      },
      {
        heading: "Viewing Your Badges",
        description: "Track your achievements:",
        steps: [
          "Navigate to 'Badges' page",
          "See earned badges highlighted in color",
          "Locked badges show requirements to unlock",
          "Progress bars indicate how close you are",
        ],
      },
      {
        heading: "Motivation Tips",
        description: "Stay engaged with gamification:",
        tips: [
          "Set a goal to earn one new badge per week",
          "Compete with yourself to beat your longest streak",
          "Share achievements with family for accountability",
          "Focus on badges that improve financial discipline",
        ],
      },
    ],
  },
  {
    id: "settings",
    title: "Settings & Data Safety",
    icon: "⚙️",
    content: [
      {
        heading: "Profile Management",
        description: "Customize your FinMate experience and secure your data.",
      },
      {
        heading: "Updating Your Profile",
        description: "Keep your information current:",
        steps: [
          "Go to Settings page",
          "Update your role if your situation changes",
          "Adjust monthly income (raises, job changes)",
          "Add/remove/edit fixed expenses",
          "Click 'Save Changes' to apply updates",
        ],
        tips: [
          "Budget changes apply immediately when you update income or expenses",
          "Income updates affect daily spending limits",
          "Keep recurring expenses accurate for correct calculations",
        ],
      },
      {
        heading: "Data Privacy",
        description: "Your financial data is secure:",
        tips: [
          "All data encrypted in transit and at rest",
          "Stored securely in Supabase",
          "Only you can access your financial information",
          "We never sell or share your data with third parties",
        ],
      },
      {
        heading: "Account Security",
        description: "Protect your account:",
        tips: [
          "Use a strong, unique password",
          "Enable two-factor authentication (in Firebase settings)",
          "Log out when using shared devices",
          "Review account activity regularly",
        ],
      },
      {
        heading: "Data Backup",
        description: "Your data is automatically backed up:",
        tips: [
          "Real-time sync across all your devices",
          "Data persists even if you log out",
          "Export CSV/PDF regularly for offline backups",
          "No manual backup needed - it's automatic",
        ],
      },
      {
        heading: "Deleting Your Account",
        description: "Account deletion is permanent:",
        steps: [
          "Scroll to 'Danger Zone' in Settings",
          "Click 'Delete My Account'",
          "Confirm deletion (this cannot be undone)",
          "All data is permanently removed from servers",
        ],
        tips: [
          "Export your data before deletion if you want records",
          "Deletion is irreversible - be certain before proceeding",
        ],
      },
    ],
  },
  {
    id: "faqs",
    title: "FAQs & Tips",
    icon: "💡",
    content: [
      {
        heading: "Frequently Asked Questions",
        description: "Quick answers to common questions:",
      },
      {
        heading: "General Questions",
        description: "",
        tips: [
          "Q: Is FinMate free? A: Yes, FinMate is completely free to use.",
          "Q: Do I need to connect my bank? A: No, FinMate is manual entry only for privacy.",
          "Q: Can I use FinMate offline? A: No, internet required for AI and sync features.",
          "Q: Is my data safe? A: Yes, encrypted and stored securely in Supabase.",
          "Q: Can multiple people use one account? A: No, create separate accounts for privacy.",
        ],
      },
      {
        heading: "Budget & Expenses",
        description: "",
        tips: [
          "Q: Why is my daily limit different? A: Based on your role and income after fixed expenses.",
          "Q: Can I change budget percentages? A: Currently fixed by role, custom ratios coming soon.",
          "Q: What if I forget to log expenses? A: Add them anytime - backdating is supported.",
          "Q: How are categories assigned? A: You select category when logging each expense.",
          "Q: Can I create custom categories? A: Currently limited to preset categories.",
        ],
      },
      {
        heading: "Goals & Savings",
        description: "",
        tips: [
          "Q: How many goals can I have? A: Unlimited goals supported.",
          "Q: Can I withdraw from goals? A: Yes, edit goal and reduce current amount.",
          "Q: What happens when I reach a goal? A: Celebrate! Then create a new one.",
          "Q: Is emergency fund a goal? A: Separate feature with dedicated tracking.",
        ],
      },
      {
        heading: "Technical Issues",
        description: "",
        tips: [
          "Q: Data not syncing? A: Check internet connection and refresh page.",
          "Q: AI not responding? A: Ensure you're logged in and have internet access.",
          "Q: Export not working? A: Try a different browser or clear cache.",
          "Q: Forgot password? A: Use the reset password option on the login page.",
        ],
      },
      {
        heading: "Pro Tips for Success",
        description: "Maximize your financial wellness:",
        tips: [
          "Log expenses daily, not weekly - accuracy matters",
          "Review your dashboard every morning with coffee",
          "Set realistic goals - better to achieve small goals than fail big ones",
          "Use AI for second opinions on major purchases",
          "Build emergency fund before discretionary goals",
          "Update fixed expenses whenever subscriptions change",
          "Export monthly reports for year-end review",
          "Involve family in financial planning for accountability",
          "Celebrate small wins - financial discipline is a marathon",
          "Don't stress over occasional budget overshoots - trends matter more",
        ],
      },
      {
        heading: "Getting Help",
        description: "Need more assistance?",
        tips: [
          "Ask the AI Assistant for personalized help",
          "Review this Help guide for feature documentation",
          "Check Settings to verify profile configuration",
          "Export data and review in spreadsheet for deep dives",
        ],
      },
    ],
  },
];

/**
 * Get a specific help section by ID
 */
export function getHelpSection(id: string): HelpSection | undefined {
  return helpSections.find((section) => section.id === id);
}

/**
 * Search help content by query
 */
export function searchHelpContent(query: string): HelpSection[] {
  const lowerQuery = query.toLowerCase();
  return helpSections.filter((section) => {
    // Search in title
    if (section.title.toLowerCase().includes(lowerQuery)) return true;
    
    // Search in content
    return section.content.some((subsection) => {
      if (subsection.heading.toLowerCase().includes(lowerQuery)) return true;
      if (subsection.description.toLowerCase().includes(lowerQuery)) return true;
      if (subsection.steps?.some((step) => step.toLowerCase().includes(lowerQuery))) return true;
      if (subsection.tips?.some((tip) => tip.toLowerCase().includes(lowerQuery))) return true;
      return false;
    });
  });
}
