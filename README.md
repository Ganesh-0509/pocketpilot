# PocketPilot

PocketPilot is a student-only AI financial survival app built to answer one question every day:

How much can I safely spend today without going broke tomorrow?

Core formula used across the app:

Daily Safe-to-Spend = (Remaining Budget - Upcoming 30-day Liabilities) / Days Remaining

## What PocketPilot Does

- Calculates a real-time daily safe-to-spend number
- Tracks student expenses with mobile-first check-ins
- Reserves upcoming semester liabilities before discretionary spending
- Generates AI-driven daily briefings and spending recommendations
- Supports goals, emergency fund tracking, and gamified streaks/badges
- Exports reports for personal review

## Tech Stack

- **Frontend**: Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: Google Genkit
- **Charts**: Recharts
- **Mobile**: Capacitor Android
- **Validation**: Zod + React Hook Form

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- Google Cloud API credentials (for Genkit AI)
- Android SDK (if building for Android)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/pocketpilot.git
   cd pocketpilot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   GOOGLE_GENAI_API_KEY=your-google-genai-key
   ```

4. **Set up Supabase database:**
   - Go to your Supabase project dashboard
   - Run the SQL setup from the Supabase SQL Editor
   - Enable Row Level Security (RLS) on all tables
   - Create the necessary auth schema

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run typecheck

# Production build
npm run build

# Start production server
npm run start

# ESLint linting
npm run lint
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (secret, server-only) |
| `GOOGLE_GENAI_API_KEY` | Yes | Google Genkit API key for AI features |
| `NEXT_PUBLIC_APP_URL` | No | App URL for redirects (default: http://localhost:3000) |
| `NODE_ENV` | No | Environment (development/production) |

### Getting Credentials

**Supabase:**
1. Create a free account at https://supabase.com
2. Create a new project
3. Go to Settings > API to find your URL and keys
4. Copy the `NEXT_PUBLIC_SUPABASE_ANON_KEY` (safe for client)
5. Copy the `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

**Google Genkit:**
1. Enable Google AI at https://ai.google.dev/
2. Create an API key
3. Set it as `GOOGLE_GENAI_API_KEY`

## Building for Android with Capacitor

### Prerequisites
- Android SDK (API level 21+)
- Java Development Kit (JDK) 11+
- Android Studio (recommended)

### Build Steps

1. **Prepare web build:**
   ```bash
   npm run build
   ```

2. **Sync Capacitor:**
   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

4. **In Android Studio:**
   - Select a device or create an emulator
   - Click "Run" (or press Shift + F10)

5. **Configure signing for Play Store:**
   - Create a signing key: `keytool -genkey -v -keystore release.jks ...`
   - Update build.gradle with signing config
   - Build release APK

### Capacitor Configuration

Key settings in `capacitor.config.ts`:
- App ID: `com.pocketpilot.app`
- Status Bar: Dark mode, navy background
- Plugins: StatusBar, PullToRefresh, Haptics, Keyboard, SafeArea

## Project Structure

```
/src
  /app
    /api              # API routes
    /(auth)           # Authentication pages
    /(app)            # Protected app pages
  /components         # React components
  /context            # Context providers
  /hooks              # Custom React hooks
  /lib                # Utilities and services
  /types              # TypeScript types
```

## Production Quality Features

✅ **TypeScript strict mode** - Full type safety
✅ **Zod validation** - Runtime type validation on all forms
✅ **React Query** - Server state management with caching
✅ **Loading states** - UI skeletons on every page
✅ **Error boundaries** - Graceful error handling
✅ **Database RLS** - Row-level security for multi-tenant safety
✅ **Rate limiting** - AI coaching call limits
✅ **Input sanitization** - XSS/injection prevention
✅ **Mobile optimized** - Capacitor + safe areas + 44×44px touch targets
✅ **Dark mode** - Navy theme + light mode option

## Performance Optimizations

- Code splitting with dynamic imports
- Image optimization with Next.js Image
- Server-side rendering for SEO
- Database query optimization (no SELECT *)
- Memoized calculations
- Debounced API calls

## Security

- Supabase authentication with RLS
- OAuth support (Google, GitHub)
- Environment variable validation
- Input sanitization and validation
- HTTPS enforcement in production
- Service role key kept server-side only

## API Health Check

Monitor app health:
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-17T10:30:00Z",
  "supabase": "connected",
  "version": "1.0.0",
  "environment": "development"
}
```

## Troubleshooting

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Supabase connection errors
- Check `.env.local` has correct credentials
- Verify Supabase project is active
- Check network connectivity
- Test: `curl $NEXT_PUBLIC_SUPABASE_URL`

### Android build failed
- Update Android SDK: `sdkmanager --update`
- Clean build: `./gradlew clean`
- Check Java version: `java -version` (should be 11+)

### TypeScript errors
```bash
npm run typecheck
```

## Contributing

Contributions are welcome! Please:
1. Create a feature branch
2. Make your changes
3. Run tests and type checking
4. Submit a pull request

## License

MIT License - see LICENSE.md for details

## Support

- 📧 Email: support@pocketpilot.app
- 🐛 Bug reports: GitHub Issues
- 💬 Discussions: GitHub Discussions
- 📖 Documentation: /docs folder
