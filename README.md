# Signalist — Stock Market App

A Next.js 14+ App Router application for exploring markets, searching stocks, and receiving AI‑aided email updates. It integrates TradingView embedded widgets for visualizations, Finnhub for market/search data, Inngest for background jobs, and Nodemailer for transactional emails.

Current date: 2025‑12‑04


## ✨ Features
- Dashboard with market overview, heat map, top stories, and quotes (TradingView widgets)
- Global stock search with command palette (Ctrl/Cmd + K)
  - Type a symbol and press Enter to jump to its details page (e.g., `/stocks/MSFT`)
- Stock details page per symbol
  - TradingView Symbol Overview widget (dynamic by route param)
- Daily market news emails powered by Inngest + Nodemailer
  - AI‑assisted summaries via Google Gemini (through Inngest AI helpers)
- Authentication gate for the app’s main area (Better Auth)
- TypeScript, server actions for Finnhub API, and lightweight UI built on shadcn/ui and cmdk

Planned/roadmap (partially scaffolded in codebase constants and docs):
- More widgets on the stock page: full advanced chart, technical analysis, company profile, financials, symbol‑specific news
- Alert creation and processing (custom price alerts via Inngest + Finnhub)
- Related stocks (peers) section


## 🧱 Tech Stack
- Framework: Next.js (App Router, React Server Components)
- Language: TypeScript
- UI: Tailwind CSS + shadcn/ui + cmdk + lucide-react
- Charts/Embeds: TradingView embedded widgets
- Data: Finnhub REST API
- Background jobs: Inngest (Next.js integration)
- Email: Nodemailer (Gmail SMTP by default)
- Auth: Better Auth


## 🗺️ High-level Architecture
- Client UI renders reusable `TradingViewWidget` which injects TradingView widget scripts with JSON configs
- Server actions fetch data from Finnhub (search and news)
- Inngest functions run background jobs:
  - `sign-up-email` — Personalized welcome email using Gemini
  - `daily-news-summary` — Compiles/summarizes news and emails users on a schedule or event
- Nodemailer sends emails using your configured SMTP credentials
- App sections under `(root)` are protected; unauthenticated users are redirected to `/(auth)` routes (e.g., sign-in)


## 📁 Project Structure
```
stock_market_app/
├─ app/
│  ├─ (auth)/
│  ├─ (root)/
│  │  ├─ layout.tsx           # Auth gate + header + container
│  │  ├─ page.tsx             # Dashboard (TradingView overview, heatmap, stories, quotes)
│  │  └─ stocks/
│  │     └─ [symbol]/
│  │        └─ page.tsx       # Stock details (TradingView Symbol Overview widget)
│  └─ api/
│     └─ inngest/route.ts     # Inngest HTTP handler (GET/POST/PUT)
├─ components/
│  ├─ Header.tsx              # Top bar (logo, nav, user menu)
│  ├─ NavItems.tsx            # Navigation + search trigger
│  ├─ SearchCommand.tsx       # Command palette powered search (cmdk)
│  ├─ TradingViewWidget.tsx   # Reusable widget loader (client component)
│  └─ ui/command.tsx          # shadcn/ui wrappers for cmdk primitives
├─ hooks/
│  └─ useTradingViewWidget.ts # Injects TradingView script + mounts widget (client hook)
├─ lib/
│  ├─ actions/finnhub.actions.ts    # Server actions to query Finnhub (search, news)
│  ├─ better-auth/auth.ts           # Better Auth server utilities (referenced in layout)
│  ├─ constants.ts                  # UI constants + TradingView configs/builders
│  ├─ inngest/client.ts             # Inngest client (app id + AI config)
│  ├─ inngest/functions.ts          # Inngest functions (welcome + daily news)
│  ├─ nodemailer/index.ts           # Nodemailer transport + send helpers
│  └─ nodemailer/templates.ts       # Email HTML templates
├─ middleware/                      # Next middleware (e.g., auth)
├─ public/                          # Static assets (logo, icons)
├─ types/                           # Shared TypeScript types
├─ next.config.ts, tsconfig.json    # Build & TS config
└─ package.json                     # Scripts & dependencies
```


## 🔍 Key Modules

### TradingView Integration
- Component: `components/TradingViewWidget.tsx`
  - Client component that calls `useTradingViewWidget(scriptUrl, config, height)`
  - Renders a simple container; TradingView script populates the widget iframe
- Hook: `hooks/useTradingViewWidget.ts`
  - Appends `<script src="https://s3.tradingview.com/external-embedding/embed-widget-*.js">` with the provided JSON config
- Configs: `lib/constants.ts`
  - Ready‑to‑use configs like `MARKET_OVERVIEW_WIDGET_CONFIG`, `HEATMAP_WIDGET_CONFIG`, `TOP_STORIES_WIDGET_CONFIG`, `MARKET_DATA_WIDGET_CONFIG`
  - Symbol-aware builders like `SYMBOL_INFO_WIDGET_CONFIG(symbol)` and others for advanced charting/technicals

Usage example on dashboard (`app/(root)/page.tsx`):
```tsx
const scriptBase = 'https://s3.tradingview.com/external-embedding/embed-widget-';
<TradingViewWidget
  title="Market Overview"
  scriptUrl={`${scriptBase}market-overview.js`}
  config={MARKET_OVERVIEW_WIDGET_CONFIG}
  height={600}
/>
```

Usage on stock details page (`app/(root)/stocks/[symbol]/page.tsx`):
```tsx
<TradingViewWidget
  title={`${symbol} Overview`}
  scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"
  config={{ symbols: [[symbol, `NASDAQ:${symbol}`]], width: '100%', height: 170, colorTheme: 'dark', isTransparent: true }}
  height={170}
/>
```


### Search & Navigation
- `components/SearchCommand.tsx` opens a command dialog (cmdk)
  - Debounced server action search via `lib/actions/finnhub.actions.ts`
  - Press Enter to navigate to `/stocks/{SYMBOL}`; clicking results also navigates
- `components/NavItems.tsx` renders “Search” as a text trigger in the nav


### Finnhub Integration (Server Actions)
- `lib/actions/finnhub.actions.ts`
  - `searchStocks(query?)` returns normalized search results or popular profiles when empty
  - `getNews(symbols?)` fetches per‑symbol company news or general market news as fallback
  - Requires `FINNHUB_API_KEY` (or `NEXT_PUBLIC_FINNHUB_API_KEY`) in env


### Inngest Background Jobs
- `lib/inngest/client.ts` sets up the Inngest client (app id `signalist`, Gemini API key)
- `lib/inngest/functions.ts` contains functions:
  - `sendSignUpEmail` — event‑driven welcome email with Gemini‑generated intro
  - `sendDailyNewsSummary` — scheduled/event‑driven summary emails using `getNews`
- `app/api/inngest/route.ts` registers the functions with Inngest’s Next.js handler


### Email Delivery (Nodemailer)
- `lib/nodemailer/index.ts` defines the Gmail SMTP transport and helpers:
  - `sendWelcomeEmail`
  - `sendNewsSummaryEmail`
- `lib/nodemailer/templates.ts` provides production‑ready HTML templates


### Auth (Better Auth)
- `app/(root)/layout.tsx` fetches the current session and redirects unauthenticated users to sign‑in
- Pages within `(root)` require authentication, ensuring protected access to core features


## 🛠️ Getting Started

1) Prerequisites
- Node.js 18+
- A Finnhub API key
- A Gmail account (or SMTP credentials) for Nodemailer
- Inngest account (optional but recommended for scheduled jobs)
- Google Gemini API key (for AI summaries in Inngest)

2) Install dependencies
```
npm install
```

3) Configure environment variables (create `.env.local`)
```
# Finnhub
FINNHUB_API_KEY=your_server_side_key
NEXT_PUBLIC_FINNHUB_API_KEY=your_public_fallback_key

# Nodemailer (Gmail example)
NODEMAILER_EMAIL=your@gmail.com
NODEMAILER_PASSWORD=your_app_password

# Inngest / AI
GEMINI_API_KEY=your_gemini_key

# Better Auth
# (Adjust according to your Better Auth setup)
BETTER_AUTH_SECRET=...
BETTER_AUTH_PUBLIC_KEY=...
```

4) Run the dev server
```
npm run dev
```
Navigate to http://localhost:3000

5) Sign in
- The `(root)` area enforces authentication. Make sure your sign‑in route under `(auth)` is configured.


## 🚀 Production Build & Deployment
- Build: `npm run build`
- Start: `npm start` (expects `PORT=3000` by default)
- Recommended hosting: Vercel, but any Node host works

Environment & networking notes
- Ensure all env vars are set in your hosting provider
- If using a strict Content Security Policy (CSP), allow TradingView domains:
  - script-src: https://s3.tradingview.com https://www.tradingview.com
  - frame-src: https://s.tradingview.com https://www.tradingview.com


## ⚠️ Rate Limits & Operations
- Finnhub has rate limits; cache or throttle where possible
- TradingView widgets require sufficient container heights, and some configs silently ignore invalid keys
- Email delivery via Gmail requires an App Password when 2FA is enabled


## 🧪 Testing Suggestions
- Unit test server actions that format and filter Finnhub responses
- Smoke test the Inngest endpoints (local Inngest dev server) and email helpers with a test SMTP sink like MailHog


## 🗺️ Roadmap
- Stock details: add advanced chart, technicals, company profile, financials, and symbol news (configs already prepared in `lib/constants.ts`)
- Alerts: custom price alert UI + Inngest cron/WebSocket worker, email on trigger
- Related stocks (peers) fetched from Finnhub and linked for discovery
- Watchlist: user‑scoped lists with alert integration


## 📄 License
Proprietary. All rights reserved. Update this section if you intend to open‑source the project.
