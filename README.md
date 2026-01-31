# 💰 Financial Tracker Application

Financial Tracker adalah aplikasi manajemen keuangan yang dibangun dengan **Next.js**, **Go**, dan **PostgreSQL**. Aplikasi ini menyediakan fitur core finance management termasuk tracking transaksi, budgeting, credit card management, dan investment tracking dengan automated money splitting.

## 🏗️ Tech Stack

### Frontend User
- **Framework:** Next.js 14 dengan TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **HTTP Client:** Axios
- **Form Management:** React Hook Form + Zod
- **Charts:** Recharts

### Backend
- **Language:** Go 1.21
- **Framework:** Gin (Web Framework)
- **Database:** PostgreSQL 15
- **Auth:** JWT (golang-jwt/jwt)
- **Password:** bcrypt
- **Migrations:** golang-migrate

### Database
- **Type:** PostgreSQL 15
- **Tables:** 8 core tables (users, accounts, pockets, transactions, budgets, credit_cards, investments, automation_rules)

## 📁 Project Structure

```
/app/
├── backend/                      # Go REST API
│   ├── cmd/
│   │   └── main.go              # Entry point
│   ├── config/
│   │   └── database.go          # Database connection
│   ├── internal/
│   │   ├── handlers/            # HTTP handlers
│   │   ├── models/              # Data models
│   │   ├── repository/          # Database operations
│   │   ├── services/            # Business logic
│   │   └── middleware/          # Auth middleware
│   ├── migrations/              # PostgreSQL migrations
│   │   ├── 000001_create_users_table.up.sql
│   │   ├── 000002_create_accounts_table.up.sql
│   │   └── ...
│   ├── Makefile                 # Build & migration commands
│   ├── go.mod
│   ├── go.sum
│   └── .env                     # Environment variables
│
└── frontend-user/               # Next.js User App
    ├── app/
    │   ├── page.tsx             # Login/Register page
    │   ├── dashboard/
    │   │   └── page.tsx         # Main dashboard
    │   ├── layout.tsx
    │   └── globals.css
    ├── components/
    │   └── ui/                  # shadcn/ui components
    ├── lib/
    │   └── utils.ts
    ├── package.json
    ├── tsconfig.json
    └── .env.local               # Frontend environment variables
```

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+
- PostgreSQL 15+
- golang-migrate

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd /app/backend
```

2. **Install Go dependencies:**
```bash
go mod download
```

3. **Configure environment variables:**
Edit `/app/backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=financial_tracker
DB_SSLMODE=disable

PORT=8001

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

CORS_ORIGINS=http://localhost:3000
```

4. **Run migrations:**
```bash
make migrate-up
```

5. **Start backend server:**
```bash
make run
# atau
go run cmd/main.go
```

Backend akan berjalan di `http://localhost:8001`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd /app/frontend-user
```

2. **Install dependencies:**
```bash
yarn install
```

3. **Configure environment variables:**
Edit `/app/frontend-user/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

4. **Start development server:**
```bash
yarn dev
```

Frontend akan berjalan di `http://localhost:3000`

## 📊 Database Schema

### Core Tables

1. **users** - User authentication & profile
2. **accounts** - Financial accounts (bank, wallet, investment, credit_card)
3. **pockets** - Sub-accounts untuk money splitting
4. **transactions** - Income/expense tracking
5. **budgets** - Budget management
6. **credit_cards** - Credit card management
7. **investments** - Investment portfolio
8. **automation_rules** - Rule engine untuk auto-splitting

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get user profile (Protected)

### Accounts
- `GET /api/accounts` - List semua accounts (Protected)
- `POST /api/accounts` - Create account baru (Protected)
- `GET /api/accounts/:id` - Get account detail (Protected)
- `DELETE /api/accounts/:id` - Delete account (Protected)

### Coming Soon
- Transactions CRUD
- Budgets CRUD
- Credit Cards CRUD
- Investments CRUD
- Automation Rules CRUD
- Dashboard Analytics

## 🛠️ Makefile Commands

```bash
# Run migrations up
make migrate-up

# Run migrations down
make migrate-down

# Create new migration
make migrate-create name=migration_name

# Run application
make run

# Build application
make build

# Install dependencies
make deps
```

## 🎨 Features

### ✅ Phase 1 (Completed)
- ✅ Backend Go REST API setup
- ✅ PostgreSQL database setup
- ✅ Database migrations (8 tables)
- ✅ User authentication (JWT)
- ✅ Accounts CRUD
- ✅ Next.js frontend setup
- ✅ Login/Register UI
- ✅ Dashboard UI
- ✅ Blue minimalist theme

### 🚧 Phase 2 (Next)
- Transactions management dengan auto-split
- Pockets system
- Budget tracking
- Credit card management
- Investment tracking
- Automation rules engine

### 🔮 Phase 3 (Future)
- Admin dashboard (Next.js)
- WhatsApp integration
- AI integration (Cursor Agent, OCR)
- Real-time updates
- Charts & visualizations

## 🧪 Testing

### Backend API Test
```bash
# Health check
curl http://localhost:8001/health

# Register
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'

# Login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Create Account (with token)
curl -X POST http://localhost:8001/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Main Bank",
    "type": "bank",
    "balance": 5000000,
    "currency": "IDR"
  }'
```

## 🐛 Troubleshooting

### Port sudah digunakan
```bash
# Kill process di port 8001
lsof -ti:8001 | xargs kill -9

# Kill process di port 3000
lsof -ti:3000 | xargs kill -9
```

### PostgreSQL tidak berjalan
```bash
service postgresql start
```

### Migration error
```bash
# Reset migrations
make migrate-down
make migrate-up
```

## 📝 Environment Variables

### Backend (.env)
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_USER` - PostgreSQL username
- `DB_PASSWORD` - PostgreSQL password
- `DB_NAME` - Database name
- `DB_SSLMODE` - SSL mode (disable/require)
- `PORT` - Backend server port
- `JWT_SECRET` - JWT secret key
- `CORS_ORIGINS` - Allowed CORS origins

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js Team
- Go Community
- shadcn/ui
- Radix UI
- Gin Framework

---

**Built with ❤️ for better financial management**
