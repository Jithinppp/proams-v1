# PROIN - Asset Management System

> Professional inventory tracking for AV equipment. Track, manage, and deploy across your organization.

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

</div>

---

## ✨ Features

- **Multi-role Access Control** - Role-based dashboards for ADMIN, PM, INV, and TECH
- **Real-time Inventory Tracking** - Asset status: AVAILABLE, RESERVED, OUT, MAINTENANCE
- **Project Management** - Create and manage events with equipment scheduling
- **Maintenance Logging** - Track service history and maintenance schedules
- **Catalog Management** - Categories, subcategories, and models hierarchy
- **Storage Locations** - Hierarchical location tracking (Zone/Rack/Bin)
- **Consumables Tracking** - Low stock alerts for supplies
- **Audit Logging** - Complete activity history for compliance

---

## 🏗️ Architecture

### Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth with RLS |
| UI | Tailwind CSS + Headless UI |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Types | TypeScript |

### Project Structure

```
pro-in-v1/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Login page
│   ├── admin/                    # Admin dashboard & routes
│   │   ├── page.tsx              # Dashboard with stats
│   │   └── users/                # User management
│   ├── pm/                       # Project Manager routes
│   │   ├── page.tsx              # Dashboard
│   │   ├── projects/            # Project CRUD
│   │   ├── venues/               # Venue management
│   │   └── reports/             # Report generation
│   ├── inv/                      # Inventory Manager routes
│   │   ├── page.tsx             # Dashboard
│   │   ├── assets/              # Asset management
│   │   ├── consumables/         # Consumables tracking
│   │   ├── locations/           # Storage locations
│   │   └── catalog/            # Category/Subcategory/Models
│   └── tech/                    # Technician routes
│       ├── page.tsx            # Dashboard
│       ├── assignments/        # Work assignments
│       ├── scan/               # QR/Barcode scanner
│       └── maintenance/        # Maintenance queue
├── components/                  # Reusable UI components
│   ├── Input.tsx               # Form input with icons
│   ├── Button.tsx             # Multi-variant buttons
│   ├── Textarea.tsx           # Textarea input
│   ├── Select.tsx             # Dropdown (Headless UI)
│   ├── SearchInput.tsx        # Search with icon
│   ├── Navbar.tsx             # Top navigation bar
│   ├── StatsCard.tsx          # Dashboard statistics
│   └── LogoutButton.tsx       # Sign out component
├── lib/                        # Core utilities
│   ├── supabase/
│   │   ├── server.ts          # Server client (RSC)
│   │   └── client.ts          # Browser client
│   ├── auth.ts                # Role definitions & routing
│   ├── config.ts              # App configuration
│   ├── types.ts               # Database types
│   └── actions.ts             # Server actions
├── middleware.ts              # Auth & RBAC middleware
├── schema.sql                 # Database schema
└── routes.md                  # Route documentation
```

---

## 🔐 Authentication & RBAC

### User Roles

| Role | Dashboard | Access |
|------|-----------|--------|
| `ADMIN` | `/admin` | Full system access, user management |
| `PM` | `/pm` | Projects, venues, reports |
| `INV` | `/inv` | Assets, consumables, catalog, locations |
| `TECH` | `/tech` | Assignments, maintenance, scanning |

### Security

- **Supabase Auth** - Email/password authentication
- **RLS Policies** - Database-level row security
- **Middleware Protection** - Route-based access control
- **Profile Sync** - Auto-creates user profile on signup

### Auth Flow

```
1. User visits / → Login page
2. Enter credentials → Supabase Auth
3. Success → Fetch role from profiles table
4. Redirect to role-specific dashboard
5. Attempt unauthorized route → /forbidden
```

---

## 🎨 Design System

Inspired by [Cal.com](https://cal.com) - Minimal, professional, monochrome.

### Colors

| Role | Color | Usage |
|------|-------|-------|
| Primary | `#242424` | Headings, buttons, text |
| Secondary | `#898989` | Labels, captions |
| Border | `#e4e4e7` | Input borders, cards |
| Focus | `#3b82f6` | Focus ring (blue) |
| Error | `#ef4444` | Error states (red) |

### Typography

- **Labels**: `text-xs font-medium uppercase tracking-wider`
- **Headings**: `text-2xl font-semibold tracking-tight`
- **Body**: `text-sm text-[#242424]`

### Components

- **Input**: 8px radius, shadow ring on focus
- **Button**: Primary (dark), Secondary (white), Ghost
- **Cards**: White background, subtle border
- **Shadows**: Multi-layer Cal.com style

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pro-in-v1

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_NAME=PROIN
NEXT_PUBLIC_APP_TAGLINE=Asset Management System
```

---

## 📊 Database Schema

### Core Tables

- `profiles` - User accounts with roles
- `categories` - Top-level catalog categories
- `subcategories` - Subcategories within categories
- `models` - Product models/SKUs
- `assets` - Individual serialized equipment
- `consumables` - Quantity-based items
- `projects` - Events and bookings
- `project_equipment` - Equipment assigned to projects
- `venues` - Event locations
- `storage_locations` - Physical storage hierarchy
- `maintenance_logs` - Service records
- `activity_log` - Audit trail

### Enums

```sql
asset_status: AVAILABLE, RESERVED, OUT, PENDING_QC, MAINTENANCE, QUARANTINED
item_condition: EXCELLENT, GOOD, FAIR, POOR
project_status: PLANNING, ACTIVE, COMPLETED
user_role: ADMIN, PM, INV, TECH
```

---

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 📝 Route Mapping

| Path | Description | Role |
|------|-------------|------|
| `/` | Login page | Public |
| `/admin` | Admin dashboard | ADMIN |
| `/admin/users` | User management | ADMIN |
| `/pm` | PM dashboard | PM |
| `/pm/projects` | Project list | PM |
| `/pm/venues` | Venue management | PM |
| `/pm/reports` | Generate reports | PM |
| `/inv` | INV dashboard | INV |
| `/inv/assets` | Asset list | INV |
| `/inv/consumables` | Consumables | INV |
| `/inv/locations` | Storage locations | INV |
| `/inv/catalog` | Category management | INV |
| `/tech` | Tech dashboard | TECH |
| `/tech/assignments` | Work assignments | TECH |
| `/tech/scan` | QR scanner | TECH |
| `/tech/maintenance` | Maintenance queue | TECH |
| `/forbidden` | Access denied | - |
| `/*` | 404 not found | - |

---

## 🌐 Multi-Org Deployment

The app supports deploying to different organizations by changing environment variables:

```bash
# Organization 1
NEXT_PUBLIC_APP_NAME=AcmeAV

# Organization 2
NEXT_PUBLIC_APP_NAME=BetaRental
```

---

## 📄 License

MIT License - See LICENSE file for details.

---

Built with ❤️ using Next.js + Supabase