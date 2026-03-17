# 🚀 PocketPilot

> **The ultimate AI-powered financial survival app exclusively designed for students.**

PocketPilot answers the most critical question every student asks: **"How much can I safely spend today without going broke tomorrow?"**

By factoring in pocket money, living situations (hostel vs. day scholar), and upcoming college liabilities, PocketPilot dynamically calculates a real-time Daily Safe-to-Spend limit, helping students build lasting financial discipline without the guilt.

---

## ✨ Core Features

### 🏦 Dynamic "Safe-to-Spend" Engine
Instead of rigid monthly budgets, PocketPilot calculates a daily limit based on what's left *after* reserving funds for upcoming semester liabilities. If you overspend today, tomorrow's limit gracefully adjusts.

### 🚨 Smart Survival Mode
When your daily budget drops below a critical threshold (e.g., ₹100/day), PocketPilot automatically enters **Survival Mode**. The app shifts to a high-alert UI, providing rigorous cost-cutting advice to get you to the end of the month.

### 🤖 AI Financial Coach (Powered by Google Genkit)
A context-aware AI coach that understands your current financial state. It generates hyper-personalized, ultra-short insights (under 60 words). Whether it notices a weekend spending spike, praises a 14-day savings streak, or offers survival tips, the AI adapts to your situation.

### 🏆 Gamification & Streaks
Building good habits should be fun. Earn unique badges and achievements for:
- Maintaining multi-day streaks below your daily limit (*Week Warrior*, *Month Master*).
- Advanced planning (*Semester Planner*, *Fees Ready*).
- Successfully escaping Survival Mode.

### 📅 Semester Liabilities Planner
College life is full of surprise expenses. Log upcoming exams, textbooks, or trips in advance. PocketPilot automatically deducts these from your available budget so the money is always there when the due date arrives.

### 📴 Offline-First Reliability
Internet down on campus? No problem. Log an expense completely offline. PocketPilot queues the transaction locally and automatically syncs it securely to Supabase the moment your connection is restored.

### 📱 Premium Mobile Experience
PocketPilot is deployed directly to mobile via **Capacitor**, offering a deep native feel. Features include haptic touch feedback, fluid animations, dark-mode native aesthetics, and safe-area notch handling.

---

## 🛡️ Why PocketPilot? (Our Values)

- **Student-Centric Context:** We ask if you're a hostel resident or day scholar because we know your expense patterns depend on it.
- **Positive Reinforcement:** We don't just restrict you; we reward you via gamified badges and encouraging AI insights.
- **Privacy First:** Row Level Security (RLS) guarantees your financial data is strictly yours.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Next.js API Routes + Server Actions
- **Database / Auth**: Supabase (PostgreSQL + Auth + RLS Policies)
- **AI Integration**: Google Genkit (gemini-1.5-flash)
- **Mobile**: Capacitor (targeting Android & iOS)
- **Validation**: Zod + React Hook Form

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Supabase account (free tier works)
- Google Cloud API credentials (for Genkit AI)

### 1. Local Setup Check
```bash
git clone https://github.com/your-username/pocketpilot.git
cd pocketpilot
npm install
```

### 2. Environment Variables
Copy the example file and fill in your keys:
```bash
cp .env.example .env.local
```
Add your credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_GENAI_API_KEY=your-google-genai-key
```

### 3. Database Initialization
Run the provided `supabase_schema.sql` file in your Supabase project's SQL editor to generate the necessary tables (`profiles`, `expenses`, `semester_liabilities`, `badges`) and their respective RLS constraints.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) heavily optimized for mobile viewing.

---

## 📱 Building for Android (Capacitor)

PocketPilot handles native features smoothly. To build the mobile APK:

1. **Build the web assets:**
   ```bash
   npm run build
   ```
2. **Sync the project to Capacitor:**
   ```bash
   npx cap sync android
   ```
3. **Open in Android Studio to compile:**
   ```bash
   npx cap open android
   ```
   *Note: Ensure you have Android SDK (API 21+) and JDK 11+ installed.*

---

## 🔒 Security & Performance highlights

- **Zero "any" Types**: Fully typed codebase guaranteeing payload accuracy.
- **Zod Schema Boundaries**: All client side and server side boundaries are tightly guarded against malformed inputs to prevent Injection/XSS.
- **Optimistic UI Updates**: Expense logging and check-offs appear instantly and revert cleanly on network failure.
- **Client Caching**: Tanstack React Query manages fetching optimization to prevent unnecessary Supabase calls.

---

## 🤝 Contributing

We welcome community contributions! Please adhere to the following:
1. Fork the project & create a feature branch.
2. Maintain strict TypeScript definitions (no implicit `any`).
3. Validate forms with existing Zod contexts.
4. Pass linting and type-checking via `npm run typecheck` before submitting your PR.

---

## 📄 License & Support

PocketPilot is released under the **MIT License**.

- 📧 Email: support@pocketpilot.app
- 🐛 Issues: View [GitHub Issues](https://github.com/your-username/pocketpilot/issues)
