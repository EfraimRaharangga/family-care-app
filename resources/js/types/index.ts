/**
 * Purpose: Global TypeScript Domain Interfaces & Enum Mirrors for FC.
 * Domain Context: Strictly mirrors backend PHP 8.3+ Enums (`UserTier`, `VitalOrgan`,
 *                 `FundType`, `EventType`, `EventStatus`, `FeedbackCategory`) and Eloquent
 *                 Models (`Cell`, `User`, `FinanceFund`, `Event`, `EventRoster`, `Feedback`)
 *                 with zero `any` usage.
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

export type EventTypeValue = 'meet_fc_5' | 'cerita_nabi_nabi' | 'tend_maker' | 'regular';

export type EventStatusValue = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type FeedbackCategoryValue = 'materi' | 'hospitality' | 'acara_games' | 'lainnya';

export interface EventTypeOption {
    value: EventTypeValue;
    label: string;
}

export interface FeedbackCategoryOption {
    value: FeedbackCategoryValue;
    label: string;
    description: string;
}

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

// =========================================================================
// PHASE 1: ANONYMOUS FEEDBACK & NERVOUS SYSTEM ANALYTICS INTERFACES
// =========================================================================

export interface VerifiedGuestEvent {
    id: number;
    cell_name: string;
    title: string;
    type: EventTypeValue;
    type_label: string;
    scheduled_at: string;
    event_date_formatted: string;
    feedback_pin: string;
    pin_expires_at: string | null;
}

export interface ActivePinSession {
    id: number;
    title: string;
    type: EventTypeValue;
    type_label: string;
    event_date_formatted: string;
    feedback_pin: string;
    pin_expires_at: string | null;
    pin_expires_formatted: string | null;
    pin_expires_human: string | null;
    is_pin_active: boolean;
    feedback_url: string;
}

export interface FeedbackDashboardKpis {
    total_feedbacks: number;
    average_rating: number;
    unreviewed_count: number;
    pastoral_care_count: number;
    unreviewed_pastoral_count: number;
}

export interface FeedbackTrendPoint {
    event_id: number;
    short_label: string;
    title: string;
    type_label: string;
    event_date: string;
    average_rating: number;
    feedbacks_count: number;
}

export interface FeedbackEventOption {
    id: number;
    title: string;
    type: EventTypeValue;
    type_label: string;
    scheduled_at: string;
    event_date_formatted: string;
    feedback_pin: string;
    pin_expires_at: string | null;
    is_pin_active: boolean;
    feedbacks_count: number;
    average_rating: number | null;
}

export interface FeedbackItem {
    id: number;
    event_id: number;
    event_title: string;
    event_type_label: string;
    event_date: string;
    rating: number;
    category: FeedbackCategoryValue;
    category_label: string;
    message: string;
    needs_pastoral_care: boolean;
    contact_name: string | null;
    contact_info: string | null;
    is_reviewed: boolean;
    created_at_human: string;
    created_at_formatted: string;
}

export interface FeedbackDashboardFilters {
    event_id: string;
    category: string;
    review_status: string;
    pastoral_only: boolean;
    search: string;
}

export interface OverviewDashboardKpis {
    total_events: number;
    active_pin_events: number;
    total_members: number;
    vital_members: number;
    part_members: number;
    total_feedbacks: number;
    average_rating: number;
    unreviewed_count: number;
    pastoral_care_count: number;
    total_funds_balance: number;
}

export interface CategoryBreakdownPoint {
    category: FeedbackCategoryValue;
    label: string;
    count: number;
    avg_rating: number;
}

export interface OverviewDashboardFilters {
    event_type: string;
    period: string;
}

export interface EventListItem {
    id: number;
    title: string;
    type: EventTypeValue;
    type_label: string;
    status: EventStatusValue;
    status_label: string;
    scheduled_at: string;
    event_date_formatted: string;
    duration_minutes: number;
    location: string | null;
    feedback_pin: string;
    pin_expires_formatted: string | null;
    is_pin_active: boolean;
    feedbacks_count: number;
    average_rating: number | null;
    feedback_url: string;
}

export interface EventListFilters {
    type: string;
    pin_status: string;
    search: string;
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
