# FCFamily Care (History Maker)
**Community Management, Anonymous Feedback, 90-Minute Run Sheet & Financial Stewardship Platform**

Built with **Laravel** (PHP 8.3+), **React 19**, **Inertia.js v2**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**—styled after **Codecademy’s Gamut Design System** ([`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)) and engineered for **cPanel Shared Hosting + MySQL** ([`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)).

---

## 1. Project Vision: Journey of Belonging & The 5 Vital Organs

**FC** models a healthy cell community not as a passive audience led by one overburdened leader, but as a living organism where every member moves along the **Journey of Belonging** (`App\Enums\UserTier`):

1. **`Part` (Cell Member):** Members experiencing authentic family care, participating in weekly 90-minute gatherings, and contributing honest anonymous feedback.
2. **`Vital` (Core Servant):** Members actively stewarding one of the **5 Vital Organs** (`App\Enums\VitalOrgan`), mapped directly to Spatie RBAC roles & permissions:
   - 🧠 **Brain (`vital:brain` — Leader):** Vision, teaching, & pastoral care.
   - 🫁 **Lungs (`vital:lungs` — Event Team):** Managing the rhythm and flow of the event to keep everything on schedule (`90-minute run sheet`).
   - 🤲 **Hands & Feet (`vital:hands_and_feet` — Hospitality Team):** Welcoming newcomers and reaching out to those who are absent (`ShepherdRadarService`).
   - 🫀 **Vascular System (`vital:vascular_system` — Treasurer):** Managing virtual funds (*Kas Rutin*, *Dana Diakonia & Kado*, *Dana Acara Khusus*) and allocating gifts/diaconate support with `SoftDeletes` and Spatie `LogsActivity`.
   - ⚡ **Nervous System (`vital:nervous_system` — IT Team):** Processing data, analytics, & 100% anonymous PIN feedback channels (zero `user_id` or IP columns stored).

---

## 2. Local Development Setup

### Prerequisites
- **PHP:** 8.3+ (with `pdo_mysql`, `mbstring`, `openssl`, `xml`, `ctype`, `json`)
- **Composer:** 2.x
- **Node.js & npm:** Node 20+ / 24+
- **MySQL / MariaDB:** 8.0+ (running on `127.0.0.1:3306` with database `fc_rnd`)

### Installation Steps
```bash
# 1. Install PHP & JavaScript dependencies
composer install
npm install

# 2. Configure environment variables
cp .env.example .env
php artisan key:generate

# 3. Run complete incremental migrations (Phases 0–4) & seed FC initial data
php artisan migrate:fresh --seed

# 4. Run TypeScript verification, Vite production build, and Pest PHP tests
npm run types
npm run build
./vendor/bin/pest

# 5. Start local development server
composer run dev
```

### Seeded Whitelisted Accounts (`password` for local dev fallback)
| Organ / Tier | Name | Email | Spatie Roles |
| :--- | :--- | :--- | :--- |
| 🧠 **Brain (Leader)** | Efraim Pratama | `brain@fcrnd.local` | `vital`, `vital:brain` |
| 🫁 **Lungs (Event Team)** | Nadine Kusuma | `lungs@fcrnd.local` | `vital`, `vital:lungs` |
| 🤲 **Hands & Feet (Hospitality)** | Joshua Wijaya | `hospitality@fcrnd.local` | `vital`, `vital:hands_and_feet` |
| 🫀 **Vascular System (Treasurer)** | Clara Halim | `treasurer@fcrnd.local` | `vital`, `vital:vascular_system` |
| ⚡ **Nervous System (IT Team)** | Kevin Santoso | `it@fcrnd.local` | `vital`, `vital:nervous_system` |
| **Part (Member)** | Daniel Setiawan | `daniel.part@fcrnd.local` | `part` |

---

## 3. Environment Variables Checklist (`.env.example`)

Ensure the following keys are configured in `.env` for local development and cPanel production:

```ini
APP_NAME="FCFamily Care"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_TIMEZONE=Asia/Jakarta
APP_URL=https://fcrnd.your-domain.com

# MySQL Database Connection
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cpaneluser_fcrnd
DB_USERNAME=cpaneluser_dbuser
DB_PASSWORD=your_strong_mysql_password

# cPanel Shared Hosting Drivers (100% MySQL-backed; NO Redis required)
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# Google OAuth 2.0 Whitelist Credentials (Laravel Socialite)
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"
```

---

## 4. Step-by-Step cPanel Shared Hosting Deployment Guide

Because budget cPanel shared hosting does not provide root access, Redis, Supervisor, or a persistent Node.js SSR daemon, follow this exact workflow:

### Step 1: Compile Vite Assets Locally
Always compile production frontend bundles on your local machine or CI pipeline before uploading:
```bash
npm run types
npm run build
```
This outputs pre-compiled, versioned assets and `manifest.json` directly into `public/build/`.

### Step 2: Upload Application & Configure Document Root
1. Upload the project files (including `vendor/` or run `composer install --no-dev --optimize-autoloader` via cPanel Terminal, plus the compiled `public/build/` directory) to `/home/<cpanel_user>/fc-rnd-app`.
2. In cPanel **Domains** (or symlink `public_html`), point your domain/subdomain Document Root to:
   `/home/<cpanel_user>/fc-rnd-app/public`

### Step 3: Select PHP 8.3+ & Configure MySQL
1. In cPanel **MultiPHP Manager** / **Select PHP Version**, set the domain to **PHP 8.3** or **PHP 8.4** and enable `pdo_mysql`, `mbstring`, `intl`, `bcmath`, and `gd`.
2. In cPanel **MySQL Databases**, create the database and user, assign `ALL PRIVILEGES`, and update `.env`.
3. Run database migrations & initial seeder + cache optimizations:
   ```bash
   php artisan migrate --force
   php artisan db:seed --force
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

### Step 4: Configure the Single cPanel Cron Job
In cPanel **Cron Jobs**, add a single **Once Per Minute (`* * * * *`)** cron entry to drive scheduled tasks and database queue processing without Supervisor:
```cron
* * * * * /usr/local/bin/php /home/<cpanel_user>/fc-rnd-app/artisan schedule:run >> /dev/null 2>&1
```

---

## 5. Documentation Index
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — Reverse-engineered Codecademy Gamut design tokens & component rules.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Soft Multi-Tenancy overview, RBAC matrix, and full ERD.
- [`docs/CHANGELOG_AI.md`](docs/CHANGELOG_AI.md) — Chronological AI execution and verification log.
