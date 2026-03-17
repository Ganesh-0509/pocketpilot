# PocketPilot

**Know exactly how much you can spend today without going broke tomorrow.**

<br/>

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=for-the-badge&logo=tailwindcss)

![Google Gemini](https://img.shields.io/badge/Google-Gemini%201.5-4285f4?style=for-the-badge&logo=google)
![Capacitor](https://img.shields.io/badge/Capacitor-Android-3880ff?style=for-the-badge&logo=capacitor)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)

<br/>

## The Problem

Most finance apps for students are reactive — they show spending history and charts but never answer the real question: **"How much can I safely spend TODAY?"** College students (aged 18–23, budget ₹5,000–₹25,000/month) regularly run out of money mid-month due to no daily guidance, unplanned semester fees, and weekend overspending — all while using apps that only tell them what already happened.

## The Solution

PocketPilot introduces the **Daily Safe-to-Spend Number** — a real-time financial limit that updates instantly after every expense. It's based on a simple formula:

```
Daily Limit = (Monthly Budget - Upcoming 30-day Liabilities) / Days Remaining
```

Where **Monthly Budget** accounts for:
- Pocket money
- Internship income smoothed over 3 months (avoids lump-sum overspending)
- Minus: Already spent this month

This single number updates in real-time after every expense logged, giving students the clarity they need to make spending decisions confidently.

## Features

| Feature | Description |
|---------|-------------|
| 🎯 **Daily Safe-to-Spend** | One number that tells you exactly what you can spend today |
| 📅 **Semester Planner** | Add fees, exam costs, project expenses. They auto-deduct from your daily limit before they're due |
| 🚨 **Survival Mode** | Auto-triggers when budget is critically low. AI shifts to strict cost-cutting guidance |
| 💡 **"Can I Afford This?"** | Enter any amount and instantly see the impact on your remaining budget |
| 🤖 **AI Financial Coach** | Powered by Gemini 1.5 Flash. 4 coaching modes: survival, upcoming fees, weekend spike, general |
| 📊 **Weekend Spike Detection** | Compares last 14 days of weekday vs weekend spending. Alerts when ratio exceeds 1.5× |
| 🎮 **Gamification** | 15 student-specific badges, daily streaks, milestone rewards |
| 🎤 **Quick Expense Logging** | Manual entry, voice input, and OCR receipt scanning |
| 💰 **Internship Income Smoothing** | Irregular stipend smoothed over 3 months automatically |
| 📱 **Android App** | Native Android via Capacitor with haptic feedback, pull-to-refresh, offline queue |
| 🔒 **Privacy First** | No bank scraping. No SMS reading. User-controlled data only. |

## How It Works

1. **Onboard** — Enter your college, living type (hostel/day scholar), pocket money, semester dates, and any known upcoming costs

2. **Engine calculates** — Daily limit computed instantly from your budget, liabilities, and days remaining

3. **Log expenses** — Via manual input, voice, or OCR scan. AI auto-categorises

4. **Get coached** — AI detects patterns (weekend spikes, upcoming fees, low budget) and gives specific actionable nudges

5. **Earn rewards** — Stay under your daily limit to build streaks and earn student-specific badges

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui |
| **Database** | Supabase (PostgreSQL), Row Level Security, Edge Functions |
| **Auth** | Supabase Auth with middleware-level route protection |
| **AI** | Google Genkit, Gemini 1.5 Flash, 4 student coaching modes |
| **Charts** | Recharts |
| **Mobile** | Capacitor Android, Haptics, Pull-to-refresh |
| **Validation** | Zod schemas, centralized in lib/validation.ts |
| **State** | TanStack React Query, optimistic updates |

## Architecture

PocketPilot uses a **hybrid architecture** that separates financial math from AI. The deterministic engine (`lib/dailyEngine.ts`) handles all money calculations — daily limits, survival mode triggers, burn rate, predictions — using pure TypeScript with zero external dependencies. AI (Genkit/Gemini) is used only for coaching, insights, and behavioral nudges. This ensures financial accuracy is never dependent on AI output, while keeping the user experience intelligent and personalized.

```
┌─────────────────────────────────────────────┐
│    Student App (Next.js + Capacitor)        │
├─────────────────────────────────────────────┤
│  Deterministic Financial Engine              │
│  Daily limit · Survival mode · Predictions   │
├─────────────────────────────────────────────┤
│  AI Coaching Layer (Genkit / Gemini)         │
│  Insights · Nudges · Spike alerts            │
├─────────────────────────────────────────────┤
│  Supabase — PostgreSQL + RLS + Auth          │
└─────────────────────────────────────────────┘
```

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Login, signup pages
│   ├── (app)/                    # Protected app pages
│   │   ├── dashboard/            # Main dashboard with daily number
│   │   ├── semester-planner/     # Upcoming academic costs
│   │   ├── expenses/             # Expense history and analysis
│   │   ├── badges/               # Gamification and achievements
│   │   └── settings/             # User preferences
│   └── api/                      # API routes
├── components/                   # Reusable UI components
│   ├── affordability-check.tsx   # "Can I afford this?" bottom sheet
│   ├── survival-mode-banner.tsx  # Critical budget warning
│   └── burn-rate-chart.tsx       # 7-day spending chart
├── lib/
│   ├── dailyEngine.ts            # Core financial calculations (pure TS)
│   ├── validation.ts             # Centralized Zod schemas
│   ├── config.ts                 # Environment variable validation
│   ├── errors.ts                 # AppError class and handlers
│   ├── offlineQueue.ts           # Offline expense queue
│   ├── db/                       # Supabase data access layer
│   │   ├── expenses.ts
│   │   ├── profile.ts
│   │   ├── liabilities.ts
│   │   ├── streaks.ts
│   │   └── badges.ts
│   └── ai/
│       └── studentCoach.ts       # Genkit AI coaching flows
├── hooks/                        # Custom React hooks
├── context/                      # App-wide state (auth, survival mode)
└── middleware.ts                 # Route protection
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (free tier available)
- Google AI Studio API key

### Step 1 — Clone the repository

```bash
git clone https://github.com/yourusername/pocketpilot.git
cd pocketpilot
```

### Step 2 — Install dependencies

```bash
npm install
# or
pnpm install
```

### Step 3 — Set up environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
GOOGLE_GENAI_API_KEY=your-google-genai-api-key-here
```

**Where to get these:**
- **Supabase URL & Keys**: [Supabase Dashboard](https://app.supabase.com) → Project Settings → API
- **Google Genai API Key**: [Google AI Studio](https://aistudio.google.com/app/apikey)

### Step 4 — Set up Supabase

Run the database schema:

```bash
psql -h your-db-url -U postgres -d postgres -f supabase_schema.sql
```

Or use the Supabase Dashboard → SQL Editor and paste the contents of `supabase_schema.sql`.

### Step 5 — Run development server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 6 — For Android development

```bash
npx cap sync android
```

Then open the project in Android Studio:

```bash
open android
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL from Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key for client-side auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only, never expose) |
| `GOOGLE_GENAI_API_KEY` | Yes | Google AI Studio API key for Gemini 1.5 Flash coaching |

**⚠️ Important:** Never commit `.env.local` to version control. See `.env.example` for the template.

## Key Design Decisions

### Why Supabase over Firebase?

PostgreSQL's relational structure is a better fit for financial data than Firestore's document model. Row Level Security provides database-level access control, not just application-level. Complex queries (liability aggregation, spending analysis) are significantly simpler in SQL.

### Why separate the AI from financial math?

Financial calculations must be deterministic and auditable. A student's daily limit cannot vary based on AI model version, prompt changes, or API availability. The engine always runs first; AI only adds explanation and coaching on top.

### Why no bank linking or SMS reading?

Indian students are rightly cautious about giving apps access to banking data. Intentional expense logging creates better financial awareness than passive tracking. The app works entirely on user-entered data with no third-party financial integrations.

## Roadmap

### ✅ Completed

- [x] Daily safe-to-spend engine
- [x] Semester liability planner
- [x] Survival mode system
- [x] AI coaching (4 modes)
- [x] Gamification (15 badges + streaks)
- [x] Voice input and OCR logging
- [x] Offline expense queue
- [x] Android app (Capacitor)
- [x] Affordability checker

### 📋 Planned

- [ ] UPI SMS auto-parsing (opt-in)
- [ ] Anonymous campus spending benchmarks
- [ ] Roommate expense splitting
- [ ] iOS app
- [ ] College partnership white-label version

## Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For major features, please open an issue first to discuss the approach.

Ideas for contributions:
- New student-specific badge ideas
- UI/UX improvements for the dashboard
- Bug fixes and performance optimizations
- Translations for other languages

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

<br/>

---

<div align="center">

**Built for students, by a student. Because financial stress during college is optional.**

</div>
