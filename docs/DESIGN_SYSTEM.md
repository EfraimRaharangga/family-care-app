# FC (Family Care — History Maker) Design System
**Aesthetic Direction:** Calm Editorial Neutral (Low-Glare Slate & Alabaster Surfaces + Muted Indigo Accents)  
**Theme Mode:** Restrained Light Mode (`#F8FAFC` Soft Slate Canvas + `#FFFFFF` Cards + `1px solid #E2E8F0` Borders + `#1E293B` Charcoal Ink)

---

## 1. Visual Philosophy & Ergonomic Principles

The FC UI balances structured catalog clarity with **long-session visual comfort**. Instead of high-saturation rainbow cards or harsh `2px` black borders that cause eye strain, the interface obeys four strict ergonomic rules:

1. **90–8–2 Color Restraint:**
   - **90% Quiet Neutral Surfaces:** Low-glare alabaster/slate canvas (`#F8FAFC`), pure white card surfaces (`#FFFFFF`), and subtle `1px solid #E2E8F0` structural dividers.
   - **8% Soft Secondary Tints:** Quiet slate (`#F1F5F9`) for table headers, card banners, and uniform organ pills.
   - **2% Restrained Accent:** Deep Slate (`#1E293B`) and Muted Indigo (`#4F46E5`) reserved strictly for primary actions, active focus rings, and `Vital` tier indicators.
2. **Soft Diffused Elevation (No Harsh Offset Shadows):**
   - Cards rest with a subtle `1px solid #E2E8F0` border and soft ambient shadow (`0 1px 2px 0 rgba(15, 23, 42, 0.04)`).
   - Interactive cards transition smoothly on hover to `border-[#CBD5E1]` and a gentle diffused lift (`0 4px 12px -2px rgba(15, 23, 42, 0.08)`).
3. **Quiet Card Anatomy (`CardBanner` & `CardFooter`):**
   - **Top Metadata Strip (`CardBanner`):** Always uses a single quiet neutral surface (`#F8FAFC`) with a `1px solid #F1F5F9` bottom border and muted slate (`#64748B`) monospace text. Never use saturated rainbow background fills on card headers.
   - **Primary Content Body:** Comfortable charcoal (`#1E293B`) headings and readable muted slate (`#475569` / `#64748B`) body copy.
   - **Subtle Footer (`CardFooter`):** Separated by a `1px dashed #E2E8F0` divider displaying quiet monospace metadata.
4. **Modern Soft Geometry:**
   - Cards use `8px` (`rounded-lg`) corners; buttons, inputs, and badges use `6px` (`rounded-md`) corners.

---

## 2. Color Tokens

### 2.1 Core Surface & Ink Tokens

| Semantic Token | Slate / Neutral Scale | Hex / Value | Usage |
| :--- | :--- | :--- | :--- |
| `--background` | `slate-50` | `#F8FAFC` | Primary page canvas (low-glare cool alabaster) |
| `--background-subtle` | `slate-100/60` | `#F1F5F9` | Secondary section backgrounds, `CardBanner`, table headers |
| `--card` / `--surface` | `white` | `#FFFFFF` | Cards, modals, data tables, input backgrounds |
| `--foreground` / `--ink` | `slate-800` | `#1E293B` | Primary headings & body text (comfortable charcoal, never harsh `#000000`) |
| `--ink-deep` | `slate-900` | `#0F172A` | High-emphasis numerical metrics |
| `--muted-foreground` | `slate-500` | `#64748B` | Subtitles, descriptions, and card header labels |
| `--border` | `slate-200` | `#E2E8F0` | Standard `1px` card, badge, and input borders |
| `--border-hover` | `slate-300` | `#CBD5E1` | Interactive card and control hover border |

### 2.2 Brand, Action & Semantic Status Tokens

| Semantic Token | Scale Reference | Hex / Value | Usage |
| :--- | :--- | :--- | :--- |
| `--primary` | `slate-800` | `#1E293B` | Primary interactive CTAs & navigation buttons |
| `--primary-hover` | `slate-700` | `#334155` | Hover state for primary buttons |
| `--primary-foreground` | `white` | `#FFFFFF` | Text inside `--primary` buttons |
| `--accent-indigo` | `indigo-600` | `#4F46E5` | Links, focus rings, active indicators, and `Vital` highlights |
| `--accent-indigo-soft` | `indigo-50` | `#EEF2FF` | Soft background tint for `Vital` tier badges & callouts |
| `--secondary` | `slate-100` | `#F1F5F9` | Secondary buttons and quiet pills |
| `--secondary-foreground` | `slate-800` | `#1E293B` | Text inside secondary buttons |
| `--success` | `emerald-700` | `#047857` | Verified balance, online status, positive metrics |
| `--success-surface` | `emerald-50` | `#ECFDF5` | Subtle status badge background |
| `--warning` | `amber-700` | `#B45309` | Pending pastoral follow-ups |
| `--warning-surface` | `amber-50` | `#FFFBEB` | Subtle warning badge background |
| `--danger` / `--destructive` | `rose-600` | `#E11D48` | Destructive actions & error states |
| `--danger-surface` | `rose-50` | `#FFF1F2` | Subtle error badge background |

### 2.3 Domain Semantic Palette (Tiers & 5 Vital Organs)

To prevent visual clutter, all 5 **Vital Organs** share a **uniform calm neutral badge** (`bg-[#F8FAFC]`, `border-[#E2E8F0]`, `text-[#334155]`), relying on their canonical emoji and typography for instant recognition:

| Domain Entity | Badge Background | Border | Text / Accent | Metaphor & Role |
| :--- | :--- | :--- | :--- | :--- |
| **Tier: Part** (`part`) | `#F1F5F9` (`slate-100`) | `#E2E8F0` (`slate-200`) | `#334155` (`slate-700`) | Cell Member growing in the Journey of Belonging |
| **Tier: Vital** (`vital`) | `#EEF2FF` (`indigo-50`) | `#C7D2FE` (`indigo-200`) | `#4338CA` (`indigo-700`) | Core Servant actively building the cell |
| **🧠 Brain** (`brain`) | `#F8FAFC` (`slate-50`) | `#E2E8F0` (`slate-200`) | `#1E293B` (`slate-800`) | **Leader:** Vision, teaching, & pastoral care |
| **🫁 Lungs** (`lungs`) | `#F8FAFC` (`slate-50`) | `#E2E8F0` (`slate-200`) | `#1E293B` (`slate-800`) | **Event Team:** Rhythm & 90-minute run sheet flow |
| **🤲 Hands & Feet** (`hands_and_feet`) | `#F8FAFC` (`slate-50`) | `#E2E8F0` (`slate-200`) | `#1E293B` (`slate-800`) | **Hospitality Team:** Welcoming newcomers & absentee outreach |
| **🫀 Vascular System** (`vascular_system`) | `#F8FAFC` (`slate-50`) | `#E2E8F0` (`slate-200`) | `#1E293B` (`slate-800`) | **Treasurer:** Managing funds & diaconate support |
| **⚡ Nervous System** (`nervous_system`) | `#F8FAFC` (`slate-50`) | `#E2E8F0` (`slate-200`) | `#1E293B` (`slate-800`) | **IT Team:** Data analytics & anonymous feedback channels |

---

## 3. Typography System

* **Heading Font (`--font-heading`):** `'Space Grotesk', 'Plus Jakarta Sans', sans-serif` — Clean geometric structure in `#1E293B`.
* **Body Font (`--font-sans`):** `'Plus Jakarta Sans', 'Inter', system-ui, sans-serif` — High legibility at `14px`–`16px` (`#475569` / `#1E293B`), line-height `1.6`.
* **Monospace Metadata Font (`--font-mono`):** `'JetBrains Mono', ui-monospace, monospace` — Used for quiet category tags, 6-digit PIN codes, IDR financial ledger figures, and 90-minute run-sheet durations.

### Type Scale

| Level | Class / Element | Size | Line Height | Weight | Color |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Title** | `h1` | `1.875rem`–`2.25rem` (`30px`–`36px`) | `1.2` | `700` | `#0F172A` |
| **Section Heading** | `h2` | `1.375rem`–`1.5rem` (`22px`–`24px`) | `1.25` | `600` | `#1E293B` |
| **Card Title** | `h3` | `1.125rem` (`18px`) | `1.35` | `600` | `#1E293B` |
| **Body Default** | `p` | `0.9375rem`–`1rem` (`15px`–`16px`) | `1.6` | `400` | `#475569` |
| **Body Compact** | `.text-sm` | `0.875rem` (`14px`) | `1.5` | `400` | `#64748B` |
| **Mono Metadata** | `.font-mono` | `0.75rem` (`12px`) | `1.25` | `500` | `#64748B` |

---

## 4. Borders, Shadows & Charts

### 4.1 Borders & Radii
- **Card Container:** `1px solid #E2E8F0` (`border border-slate-200`), `rounded-lg` (`8px`).
- **Buttons, Inputs & Badges:** `1px solid #E2E8F0`, `rounded-md` (`6px`).
- **Internal Dividers:**
  - Card header separator: `border-b border-[#F1F5F9]`
  - Card footer separator: `border-t border-dashed border-[#E2E8F0]`

### 4.2 Soft Elevation Utilities
```css
.editorial-card {
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.03);
}

.editorial-card-interactive {
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.03);
  transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
}

.editorial-card-interactive:hover {
  border-color: #CBD5E1;
  box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.07);
  transform: translateY(-1px);
}
```

### 4.3 Cohesive Data Visualization Palette (Recharts)
Charts use a calm, unified Slate & Muted Indigo progression instead of competing primary colors:
- **Series 1 (`--chart-1`):** `#1E293B` (Deep Slate)
- **Series 2 (`--chart-2`):** `#4F46E5` (Muted Indigo)
- **Series 3 (`--chart-3`):** `#64748B` (Cool Slate)
- **Series 4 (`--chart-4`):** `#94A3B8` (Soft Slate)
