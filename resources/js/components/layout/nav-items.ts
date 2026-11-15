/**
 * Purpose: Shared navigation item definitions for desktop SideBar and mobile hamburger menu.
 * Domain Context: Centralizes Phase 1 Nervous System routes so desktop sidebar links and
 *                 mobile drawer navigation stay in sync without duplication.
 * Key Dependencies: lucide-react
 */
import { BarChart3, type LucideIcon, MessageSquareHeart } from 'lucide-react';

export interface LayoutNavItem {
    id: string;
    label: string;
    href: string;
    icon: LucideIcon;
    isActive: (url: string) => boolean;
}

export const LAYOUT_NAV_ITEMS: LayoutNavItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard & Analitik',
        href: '/dashboard',
        icon: BarChart3,
        isActive: (url: string) => url.startsWith('/dashboard') || url.startsWith('/feedback-analytics'),
    },
    {
        id: 'feedback',
        label: 'Portal Feedback Anggota (/feedback)',
        href: '/feedback',
        icon: MessageSquareHeart,
        isActive: (url: string) => url === '/feedback' || url.startsWith('/feedback?') || url.startsWith('/feedback/'),
    },
];
