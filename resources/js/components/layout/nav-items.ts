/**
 * Purpose: Shared navigation item definitions for desktop SideBar and mobile hamburger menu.
 * Domain Context: Centralizes authenticated navigation routes (Dashboard, Feedback Data, Event List)
 *                 so desktop sidebar links and mobile drawer navigation stay in sync.
 * Key Dependencies: lucide-react
 */
import { BarChart3, CalendarDays, type LucideIcon, MessageSquareText } from 'lucide-react';

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
        label: 'Dashboard',
        href: '/dashboard',
        icon: BarChart3,
        isActive: (url: string) => url.startsWith('/dashboard') || url.startsWith('/feedback-analytics'),
    },
    {
        id: 'feedback-data',
        label: 'Feedback Data',
        href: '/feedback-data',
        icon: MessageSquareText,
        isActive: (url: string) => url.startsWith('/feedback-data'),
    },
    {
        id: 'events',
        label: 'Event List',
        href: '/events',
        icon: CalendarDays,
        isActive: (url: string) => url.startsWith('/events'),
    },
];
