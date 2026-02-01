# Financial Tracker - Product Requirements Document

## Original Problem Statement
Build a "Financial Tracker" application based on Financial_Tracker_FSD_BRD.pdf with:
- **Tech Stack**: Next.js frontend, Go backend, PostgreSQL database
- **Core Features**: User Authentication (JWT), Accounts, Pockets (as sub-accounts), Transactions, Budgets, Credit Cards, Gold tracking
- **UI/UX**: Modern "Gen Z" friendly design with glassmorphism, blue-to-green gradient background, dark/light theme toggle
- **Security**: Protected routes with JWT expiration handling

## Architecture
```
/app/
├── backend/                      # Go REST API (Gin framework)
│   ├── cmd/main.go               # Main entrypoint, Gin router
│   ├── internal/
│   │   ├── handlers/             # API handlers
│   │   ├── models/               # Data models
│   │   └── repository/           # Database access
│   ├── migrations/               # PostgreSQL migrations (9 total)
│   └── .env
├── frontend-user/                # Next.js User App
│   ├── app/                      # Pages: dashboard, accounts, transactions, budgets, credit-cards, gold
│   ├── components/               # Reusable components
│   └── lib/                      # Hooks, providers
└── README.md
```

## Database Schema (After Migration 009)
- **users**: id, name, email, password
- **accounts**: id, user_id, name, type (bank/wallet/cash/paylater), balance, currency, **parent_account_id** (for pockets)
- **transactions**: id, user_id, account_id, type, amount, category
- **budgets**: id, user_id, category, amount, **budget_month**, **budget_year** (simplified from date range)
- **credit_cards**: id, user_id, card_name, limit, balance, billing_date, due_date
- **gold_assets**: id, user_id, name, gold_type (antam/ubs/galeri24/pegadaian/other), weight_gram, purchase_price_per_gram, purchase_date, storage_location, notes
- **gold_prices**: id, price_date, price_per_gram, source (for daily gold price tracking)

## What's Been Implemented

### 2026-02-01 - Flow Restructuring (Session 2)
- ✅ **Merged Pockets into Accounts** - Pockets now as sub-accounts with `parent_account_id`
- ✅ **Removed credit_card from account types** - Credit Cards kept as separate entity
- ✅ **Simplified Budgets** - Changed from date range to month-year picker with Copy feature
- ✅ **Replaced Investments with Gold** - Track gold assets with daily price updates
- ✅ **Updated Navigation** - Removed Pockets & Investments, added Gold menu
- ✅ **Database Migration 009** - Restructured schema for all changes
- ✅ **Testing**: 100% backend (18/18), 100% frontend verified

### 2026-02-01 - Library Security Update (Session 1)
- ✅ Updated Next.js to **14.2.35** (secure version)
- ✅ Updated all frontend dependencies
- ✅ Fixed environment issues (Go, PostgreSQL)

### Previous - Full Stack Build
- ✅ Complete Go REST API with JWT auth
- ✅ PostgreSQL database with migrations
- ✅ All CRUD endpoints
- ✅ Protected routes, dark/light theme
- ✅ Gen Z UI aesthetic

## Current Features
| Feature | Status | Notes |
|---------|--------|-------|
| Accounts | ✅ | With sub-accounts (pockets), no initial balance |
| Budgets | ✅ | Month-year picker, copy from previous |
| Gold | ✅ | Daily price tracking, profit/loss calc |
| Credit Cards | ✅ | Separate from accounts |
| Transactions | ✅ | Full CRUD |
| Authentication | ✅ | JWT-based |
| Dark/Light Theme | ✅ | Site-wide |

## API Endpoints
- `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- `/api/accounts` - CRUD with sub-accounts
- `/api/transactions`, `/api/transactions/summary`
- `/api/budgets`, `/api/budgets/copy` (NEW)
- `/api/credit-cards`
- `/api/gold/assets`, `/api/gold/summary`, `/api/gold/price` (NEW)

## Prioritized Backlog

### P1 - High Priority
- [ ] **Admin Frontend** - Build `/app/frontend-admin` for administrators
- [ ] **Gold Price API Integration** - Auto-fetch daily gold prices from external API

### P2 - Medium Priority  
- [ ] **Automation Rules UI** - Frontend for automation rules
- [ ] **API Client Refactoring** - Centralize frontend API calls

### P3 - Future
- [ ] **WhatsApp Business API** - Requires user credentials

## Test Credentials
```bash
Email: test@example.com
Password: password123
```

## Known Minor Issues
- Backend returns `null` instead of `[]` for empty arrays (frontend handles correctly)
