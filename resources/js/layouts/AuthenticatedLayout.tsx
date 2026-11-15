/**
 * Purpose: Primary Authenticated Page Wrapper for FC R&D Servants & Members.
 * Domain Context: Wraps authenticated routes with the Calm Editorial Neutral
 *                 alabaster/slate canvas (`#F8FAFC`) and TopBar navigation.
 * Key Dependencies: @/components/layout/TopBar
 */
import * as React from 'react';

import { TopBar } from '@/components/layout/TopBar';

export interface AuthenticatedLayoutProps {
    children: React.ReactNode;
    cellName?: string;
}

/**
 * Editorial layout wrapper for authenticated FC R&D pages.
 */
export default function AuthenticatedLayout({ children, cellName = 'FC R&D' }: AuthenticatedLayoutProps): React.ReactElement {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
            <TopBar cellName={cellName} />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
    );
}
