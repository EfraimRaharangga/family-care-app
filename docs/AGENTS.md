# AGENTS.md — AI Development Guidelines & Project Rules

> **CRITICAL INSTRUCTION FOR AI AGENTS:**
> You MUST read and strictly adhere to every rule in this document before reading, creating, modifying, or deleting any file in this repository. Violating any guardrail or protocol below is strictly prohibited.

---

## 1. Project Identity & Domain Language

### 1.1 Vision & Scale
- **Project Name:** Family Care (FC) Management System — *History Maker* Community.
- **Current Scope:** Single-cell pilot for **FC**, architected from day one to scale seamlessly into a multi-cell system across all *History Maker* cells.
- **Core Philosophy:** Build incrementally by phase (Phase 1: Anonymous Feedback → Phase 2: Transparent Finance & Audit → Phase 3: Event Planner & Archive → Phase 4: Shepherd Radar & CRM). Never over-engineer features that belong to future phases unless explicitly instructed.

### 1.2 Mandatory Domain Terminology
Always use these exact domain terms in database columns, Enums, variables, and code comments—never replace them with generic terms like `Guest`, `Member`, or `Admin`:

* **Journey of Belonging (Membership Tiers):**
  1. `Participant` (**Tier 1**): Newcomers / guests (1–4 initial visits, testing the water). May not have login credentials.
  2. `Part` (**Tier 2**): Core community members committed to regular fellowship and discipleship. Has read-only access to published events and financial reports.
  3. `Vital` (**Tier 3**): Servant leaders holding structural responsibilities.

* **Vital Organs (Servant Leader Roles — Tier 3):**
  1. `Brain & Heart` (**Cell Leader**): Vision, teaching, pastoral oversight, financial approval, and full audit visibility.
  2. `Lungs` (**Sie Event**): Event flow, 90-minute run-sheet management, and service roster scheduling.
  3. `Hands & Feet` (**Sie Hospitality**): Welcoming newcomers, attendance tracking, and pastoral follow-ups.
  4. `Vascular System` (**Treasurer / Bendahara**): Cash flow management, virtual fund allocation, and receipt documentation.
  5. `Nervous System` (**Sie IT**): Data analytics, anonymous feedback processing, and system maintenance.

* **Event Types:**
  - `Meet FC 5` (Monthly mandatory curriculum meeting)
  - `Cerita Nabi-Nabi` (Scripture sharing & member testimonies)
  - `Tend Maker` (Quarterly career/workplace skill workshop)
  - `Regular` (Standard weekly cell gathering)

---

## 2. Coding Standards & Architecture

### 2.1 Backend Standards (Laravel 13)
- **Strict PHP Enums:** Always use native PHP Enums (backed by string values) and Eloquent Enum casting for membership tiers, vital organ roles, event statuses (`draft`, `published`, `completed`), event types, and transaction types. Never hardcode raw magic strings in business logic.
- **Thin Controllers, Fat Actions:** Controllers must only handle HTTP request validation and return Inertia responses. Extract all business logic (e.g., balance recalculations, PIN expiration checks, shepherd radar triggers) into dedicated Action or Service classes (`app/Actions/...`).
- **Soft Multi-Tenancy Isolation:** Every core database table (`users`, `events`, `feedbacks`, `finance_funds`, `transactions`, `pastoral_follow_ups`) MUST include a `cell_id` foreign key, and every Eloquent query must remain scoped to the active `cell_id`.

### 2.2 Frontend Standards (React 19 + Inertia.js v2)
- **Inertia-First Navigation & Forms:** Always use Inertia's `<Link>` component for navigation and `useForm` hook for form submissions. Do not use manual `fetch` or `axios` calls unless handling specialized external endpoints.
- **Component Modularity:** Keep Inertia Page components (`resources/js/Pages/...`) clean and focused on layout/state orchestration. Extract reusable UI blocks into `resources/js/Components/...`.
- **Clean Type Safety & Prop Contracts:** Maintain predictable, well-structured prop interfaces between Laravel controllers and React components.

---

## 3. Design & UI/UX Guidelines

- **Single UI Component Library:** Exclusively use **shadcn/ui** components styled with **Tailwind CSS v4** utility classes. Do NOT create separate custom `.css` stylesheets and do NOT install third-party UI libraries (such as Material UI, Bootstrap, Chakra, or Ant Design).
- **Mobile-First Experience:** Every public and member-facing view—especially the Anonymous Feedback Form and Event Schedule—must be designed mobile-first with large touch targets, clear visual hierarchy, high contrast, and minimal input friction.
- **Consistent Aesthetic:** Keep the interface clean, modern, warm, and uncluttered. Use consistent spacing, card layouts, and semantic badges for statuses (`Draft`, `Published`, `Completed`) and tiers (`Participant`, `Part`, `Vital`).
- **User-Facing Copy Language:** All UI labels, buttons, placeholders, validation messages, and notifications visible to end-users MUST be written in **natural, warm Indonesian** tailored to a youth/young-adult Christian community—avoid rigid, robotic translations. (Code identifiers, comments, and logs remain in English).

---

## 4. Security, Privacy & Storage Guardrails (Non-Negotiable)

1. **Absolute Feedback Anonymity:**
   - The `feedbacks` table MUST NEVER contain a `user_id` column, IP address logging, browser fingerprinting, or session tracking.
   - Never write queries that attempt to correlate feedback submission timestamps with event attendance records.
   - Optional contact fields (`contact_name`, `contact_info`) may only be collected if the user explicitly opts into `needs_pastoral_care`.

2. **Financial Data Integrity:**
   - NEVER perform hard deletes (`forceDelete`) on the `transactions` table. All transaction removals or cancellations MUST use `SoftDeletes`.
   - Every creation, update, or soft-deletion on financial records MUST be logged via **Spatie Laravel Activitylog**, preserving both `old` and `attributes` (new) values permanently.
   - Expense transactions must enforce receipt attachment validation.

3. **Storage & Bandwidth Optimization:**
   - Any image upload feature (financial receipts or event highlight thumbnails) MUST enforce strict file size validation and automatic client-side or server-side compression to stay **under 300KB**.
   - NEVER build multi-photo gallery uploads on the server. Full event photo/video documentation must only be stored as an external **Google Drive URL** (`gdrive_archive_url`).

---

## 5. Automatic Changelog Protocol

Every time you create, modify, or delete **any file**—no matter how small the change—you MUST append a new entry to the **top** of `CHANGELOG.md` in the project root before concluding your response.

### Mandatory Entry Format:
```markdown
## [YYYY-MM-DD HH:MM] - [Phase X: Feature/Module Name]
- **Modified/Created/Deleted Files:**
  - `path/to/file1.php`
  - `path/to/file2.tsx`
- **Summary & Rationale:** [1–2 concise sentences explaining WHAT was changed and WHY it was necessary.]

## 6. AI Execution Protocol
1. **Read-Before-Edit:** Before modifying any file, read this AGENTS.md file, the relevant database migration/schema, and the entire target file to understand existing context and conventions.

2. **Plan-Before-Execute:** If a requested task requires creating or modifying more than 2 files, present a brief bulleted implementation plan first and wait for user confirmation before writing code.

3. **No Unsolicited Dependencies:** Do NOT add new Composer (composer.json) or NPM (package.json) packages without explaining the exact problem it solves and obtaining explicit user approval first.
