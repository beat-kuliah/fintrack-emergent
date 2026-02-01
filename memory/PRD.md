# Financial Tracker - Product Requirements Document

## Original Problem Statement
Build a "Financial Tracker" application based on Financial_Tracker_FSD_BRD.pdf with:
- **Tech Stack**: Next.js frontend, Go backend, PostgreSQL database
- **Core Features**: User Authentication (JWT), Accounts, Pockets, Transactions, Budgets, Credit Cards, Investment tracking
- **Advanced Features**: Automated money splitting, Rule-based automation engine, WhatsApp Business API integration
- **UI/UX**: Modern "Gen Z" friendly design with glassmorphism, blue-to-green gradient background, dark/light theme toggle
- **Security**: Protected routes with JWT expiration handling

## Architecture
```
/app/
├── backend/                      # Go REST API (Gin framework)
│   ├── cmd/main.go               # Main entrypoint, Gin router
│   ├── internal/                 # Business logic modules
│   ├── migrations/               # PostgreSQL schema migrations
│   └── .env                      # Secrets and config
├── frontend-user/                # Next.js User App
│   ├── app/                      # Next.js App Router pages
│   ├── components/               # Reusable React components
│   ├── lib/                      # Helpers, hooks (useAuth), providers
│   └── package.json
└── README.md
```

## Database Schema
- **users**: id, name, email, password
- **accounts**: id, user_id, name, type, balance
- **pockets**: id, account_id, name, balance
- **transactions**: id, user_id, account_id, type, amount, category
- **budgets**: id, user_id, category, amount, start_date, end_date
- **credit_cards**: id, user_id, name, limit, balance, due_date
- **investments**: id, user_id, name, type, amount, current_value
- **automation_rules**: id, user_id, name, trigger, conditions, actions

## What's Been Implemented

### 2026-02-01 - Library Security Update
- ✅ Updated Next.js to **14.2.35** (patched, secure version avoiding CVEs in 15.x/16.x)
- ✅ Updated all dependencies to latest secure versions while staying on React 18.x
- ✅ Reinstalled Go 1.22.5 (ARM64) after environment issue
- ✅ Reinstalled PostgreSQL 15 and ran all migrations
- ✅ Verified full application functionality post-update

### Previous Session - Full Stack Build
- ✅ Complete Go (Gin) REST API with JWT authentication
- ✅ All CRUD endpoints for users, accounts, pockets, transactions, budgets, credit cards, investments
- ✅ PostgreSQL database with golang-migrate schema versioning
- ✅ Next.js frontend with all pages: Dashboard, Login, Accounts, Pockets, Transactions, Budgets, Credit Cards, Investments
- ✅ Protected routes using custom useAuth hook
- ✅ JWT expiration handling with auto-redirect to login
- ✅ Functional dark/light theme toggle
- ✅ Gen Z UI aesthetic with blue-green gradient and glassmorphism
- ✅ Conditional Pockets balance input (only editable for credit_card/paylater types)

## Current Library Versions (frontend-user)
| Package | Version | Notes |
|---------|---------|-------|
| next | 14.2.35 | Patched, secure |
| react | 18.3.1 | Stable |
| react-dom | 18.3.1 | Stable |
| tailwindcss | 3.4.19 | Latest 3.x |
| typescript | 5.9.3 | Latest |
| lucide-react | 0.563.0 | Latest |

## API Endpoints
- `/api/auth/register` - User registration
- `/api/auth/login` - User login (returns JWT)
- `/api/accounts` - CRUD accounts (Protected)
- `/api/transactions` - CRUD transactions (Protected)
- `/api/pockets` - CRUD pockets (Protected)
- `/api/budgets` - CRUD budgets (Protected)
- `/api/credit-cards` - CRUD credit cards (Protected)
- `/api/investments` - CRUD investments (Protected)

## Prioritized Backlog

### P1 - High Priority
- [ ] **Admin Frontend** - Build separate Next.js app for administrators (`/app/frontend-admin`)
- [ ] **Automation Rules UI** - Frontend page for users to create/manage automation rules

### P2 - Medium Priority
- [ ] **API Client Refactoring** - Centralize frontend API calls into `/lib/api.ts`

### P3 - Future/Backlog
- [ ] **WhatsApp Business API Integration** - Requires user credentials

## Test Credentials
Register via API or UI:
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","password":"password123"}'
```

## Known Environment Issues
- Go binary may need reinstallation (ARM64 architecture)
- PostgreSQL service may need restart
- Port 3000 conflicts: use `fuser -k 3000/tcp` before frontend restart
