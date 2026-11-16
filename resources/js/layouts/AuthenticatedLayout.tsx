/**
 * Purpose: Primary Authenticated Page Wrapper for FC Servants & Members.
 * Domain Context: Wraps authenticated routes with the Calm Editorial Neutral
 *                 alabaster/slate canvas (`#F8FAFC`), TopBar header (with mobile hamburger menu),
 *                 and desktop SideBar navigation.
 * Key Dependencies: @/components/layout/TopBar, @/components/layout/SideBar
 */
import * as React from 'react';

import { SideBar } from '@/components/layout/SideBar';
import { TopBar } from '@/components/layout/TopBar';

export interface AuthenticatedLayoutProps {
    children: React.ReactNode;
    cellName?: string;
}

/**
 * Editorial layout wrapper for authenticated FC pages.
 */
export default function AuthenticatedLayout({ children, cellName = 'FC' }: AuthenticatedLayoutProps): React.ReactElement {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
            <TopBar cellName={cellName} />
            <div className="flex min-h-[calc(100vh-4rem)]">
                <SideBar />
                <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl">{children}</div>
                </main>
            </div>
        </div>
    );
}
