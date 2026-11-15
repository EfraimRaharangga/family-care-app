# FC R&D (Family Care — History Maker) System Architecture & ERD

## 1. Architectural Vision & Soft Multi-Tenancy

**FC R&D** is engineered for **Family Care — History Maker** starting with a single cell group (`FC R&D`, ~15–30 members) while embedding **Soft Multi-Tenancy (`cell_id`)** on every core domain table from Day 1. This allows the platform to scale horizontally to dozens of cell groups under *History Maker* without schema rewrites.

### Key Architectural Pillars
1. **cPanel Shared Hosting Native:**
   - **Zero Redis / Zero Supervisor / Zero Node SSR:** Sessions (`sessions`), Cache (`cache`), and Queues (`jobs`) use native MySQL drivers.
   - **Single Cron Entrypoint:** Background jobs and scheduled pastoral radar checks run through a single standard cPanel Cron Job (`* * * * * php /home/cpanel_user/app/artisan schedule:run >> /dev/null 2>&1`).
   - **Pre-Compiled Vite Assets:** Frontend assets (`React 19` + `TypeScript` + `Tailwind CSS v4`) compile locally into `public/build/manifest.json` so the production server requires zero Node.js runtime.
2. **100% Technical Anonymity (`feedbacks`):**
   - Stewarded by the **Nervous System (IT Team)**. The `feedbacks` table deliberately omits `user_id`, `ip_address`, `user_agent`, and browser fingerprint columns. Access is gated solely by a 6-character event PIN (`feedback_pin`).
3. **Immutable Financial Audit Trail (`transactions`):**
   - Stewarded by the **Vascular System (Treasurer)**. The `Transaction` model enforces Laravel `SoftDeletes` (`deleted_at`), blocks `forceDelete` via `TransactionPolicy`, and records every creation, update, or void action into `activity_log` via `spatie/laravel-activitylog`.

---

## 2. Domain Model: Journey of Belonging & The 5 Vital Organs

Every whitelisted member in `users` is assigned a **Journey of Belonging** tier (`App\Enums\UserTier`):
- **`part` (Part — Cell Member):** Members actively participating in weekly fellowship and spiritual growth.
- **`vital` (Vital — Core Servant):** Core servants stewarding one of the **5 Vital Organs** (`App\Enums\VitalOrgan`):
  1. 🧠 **`brain` — Brain (Leader):** Vision, teaching, & pastoral care (`vital:brain`).
  2. 🫁 **`lungs` — Lungs (Event Team):** Managing the rhythm and flow of the event (`90-minute run sheet`, `vital:lungs`).
  3. 🤲 **`hands_and_feet` — Hands & Feet (Hospitality Team):** Welcoming newcomers & reaching out to absent members (`vital:hands_and_feet`).
  4. 🫀 **`vascular_system` — Vascular System (Treasurer):** Managing virtual funds (`Kas Rutin`, `Dana Diakonia & Kado`, `Dana Acara Khusus`) & diaconate support (`vital:vascular_system`).
  5. ⚡ **`nervous_system` — Nervous System (IT Team):** Processing data, analytics, & anonymous feedback channels (`vital:nervous_system`).

---

## 3. Entity-Relationship Diagram (Phases 0–4 Incremental Schema)

```mermaid
erDiagram
    CELLS ||--o{ USERS : "scopes (cell_id)"
    CELLS ||--o{ EVENTS : "scopes (cell_id)"
    CELLS ||--o{ FEEDBACKS : "scopes (cell_id)"
    CELLS ||--o{ EVENT_ROSTERS : "scopes (cell_id)"
    CELLS ||--o{ FINANCE_FUNDS : "scopes (cell_id)"
    CELLS ||--o{ TRANSACTIONS : "scopes (cell_id)"
    CELLS ||--o{ EVENT_ATTENDANCES : "scopes (cell_id)"
    CELLS ||--o{ PASTORAL_FOLLOW_UPS : "scopes (cell_id)"

    EVENTS ||--o{ FEEDBACKS : "receives anonymous (event_id)"
    EVENTS ||--o{ EVENT_ROSTERS : "90m run sheet (event_id)"
    EVENTS ||--o{ EVENT_ATTENDANCES : "tracks check-in (event_id)"
    EVENTS ||--o{ TRANSACTIONS : "links offering/expense (event_id)"

    USERS ||--o{ EVENT_ROSTERS : "serves in (user_id)"
    USERS ||--o{ EVENT_ATTENDANCES : "attends (user_id)"
    USERS ||--o{ TRANSACTIONS : "records (recorded_by)"
    USERS ||--o{ PASTORAL_FOLLOW_UPS : "cared for (member_id)"
    USERS ||--o{ PASTORAL_FOLLOW_UPS : "assigned to (assigned_to)"

    FINANCE_FUNDS ||--o{ TRANSACTIONS : "allocates (finance_fund_id)"

    CELLS {
        bigint id PK
        string name
        string slug UK
        boolean is_active
        json settings
    }

    USERS {
        bigint id PK
        bigint cell_id FK
        string name
        string email UK
        string google_id
        string tier "UserTier (part|vital)"
        string vital_organ "VitalOrgan nullable"
        boolean is_whitelisted
        boolean is_active
    }

    EVENTS {
        bigint id PK
        bigint cell_id FK
        string title
        string type "EventType"
        string status "EventStatus"
        datetime scheduled_at
        smallint duration_minutes "Default 90"
        string feedback_pin UK "6-char PIN"
    }

    FEEDBACKS {
        bigint id PK
        bigint cell_id FK
        bigint event_id FK
        tinyint rating "1-5 (NO user_id / NO IP)"
        tinyint mood_score
        text highlights
        text improvements
        text prayer_or_suggestion
    }

    FINANCE_FUNDS {
        bigint id PK
        bigint cell_id FK
        string name
        string slug
        string type "FundType"
        decimal cached_balance "DECIMAL(15,2)"
    }

    TRANSACTIONS {
        bigint id PK
        bigint cell_id FK
        bigint finance_fund_id FK
        bigint recorded_by FK
        string direction "in|out"
        decimal amount "DECIMAL(15,2)"
        date transaction_date
        timestamp deleted_at "SoftDeletes enforced"
    }
```
