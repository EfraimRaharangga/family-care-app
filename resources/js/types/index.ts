/**
 * Purpose: Global TypeScript Domain Interfaces & Enum Mirrors for FC R&D
 * Domain Context: Strictly mirrors backend PHP 8.3+ Enums (`UserTier`, `VitalOrgan`,
 *                 `FundType`, `EventType`, `EventStatus`) and Eloquent Models (`Cell`, `User`,
 *                 `FinanceFund`, `Event`, `EventRoster`, `Feedback`) with zero `any` usage.
 * Key Dependencies: lucide-react
 */
import { LucideIcon } from 'lucide-react';

// =========================================================================
// DOMAIN ENUM TYPES (MIRRORING APP\ENUMS\*)
// =========================================================================

export type UserTierValue = 'part' | 'vital';

export type VitalOrganValue =
    | 'brain'
    | 'lungs'
    | 'hands_and_feet'
    | 'vascular_system'
    | 'nervous_system';

export type FundTypeValue = 'routine' | 'diaconia' | 'special_event';

export type EventTypeValue = 'cell_gathering' | 'fellowship' | 'outreach' | 'retreat' | 'special';

export type EventStatusValue = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

// =========================================================================
// CORE DOMAIN INTERFACES
// =========================================================================

export interface CellTenant {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    settings: {
        organization?: string;
        meeting_day?: string;
        meeting_time?: string;
        target_duration_minutes?: number;
        currency?: string;
    } | null;
}

export interface User {
    id: number;
    cell_id?: number | null;
    name: string;
    email: string;
    avatar?: string;
    phone?: string | null;
    birth_date?: string | null;
    tier?: UserTierValue;
    vital_organ?: VitalOrganValue | null;
    is_whitelisted?: boolean;
    is_active?: boolean;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface VitalOrganMetadata {
    value: VitalOrganValue;
    label: string;
    team_name: string;
    emoji: string;
    description: string;
    spatie_role: string;
    permissions: string[];
    surface_hex: string;
    accent_hex: string;
    steward_name: string | null;
    steward_email: string | null;
}

export interface FinanceFundSummary {
    id: number;
    name: string;
    slug: string;
    type: FundTypeValue;
    description: string | null;
    cached_balance: number;
    banner_hex: string;
    transactions_count: number;
}

export interface EventRosterItem {
    id: number;
    role_name: string;
    segment_title: string;
    duration_minutes: number;
    sort_order: number;
    servant_name: string | null;
    servant_organ: VitalOrganValue | null;
}

export interface EventSummary {
    id: number;
    title: string;
    type: EventTypeValue;
    type_label: string;
    status: EventStatusValue;
    status_label: string;
    scheduled_at: string;
    duration_minutes: number;
    location: string | null;
    feedback_pin: string;
    rosters: EventRosterItem[];
    feedbacks_count: number;
    average_rating: number | null;
}

export interface SystemHealthMetrics {
    php_version: string;
    laravel_version: string;
    database_driver: string;
    database_connected: boolean;
    database_name: string;
    session_driver: string;
    cache_driver: string;
    queue_driver: string;
    spatie_roles_count: number;
    spatie_permissions_count: number;
    activity_logs_count: number;
    anonymous_feedbacks_count: number;
    total_funds_balance_idr: number;
}

// =========================================================================
// INERTIA SHARED & NAVIGATION INTERFACES
// =========================================================================

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}
