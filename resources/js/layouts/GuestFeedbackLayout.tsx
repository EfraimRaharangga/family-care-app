/**
 * Purpose: Zero-Auth Layout Wrapper for 100% Anonymous PIN Feedback Submissions.
 * Domain Context: Stewarded by the Nervous System (IT Team). Ensures guests submitting
 *                 event feedback see a calm, high-trust anonymity guarantee bar.
 * Key Dependencies: react
 */
import { Lock } from 'lucide-react';
import * as React from 'react';

export interface GuestFeedbackLayoutProps {
    children: React.ReactNode;
}

/**
 * Minimal, low-glare layout for anonymous event feedback pages.
 */
export default function GuestFeedbackLayout({ children }: GuestFeedbackLayoutProps): React.ReactElement {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
            <div className="border-b border-[#E2E8F0] bg-white px-4 py-2.5 text-center font-mono text-xs font-medium text-[#475569]">
                <span className="inline-flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-[#4F46E5]" />
                    <span>100% TECHNICAL ANONYMITY GUARANTEED · ZERO USER_ID OR IP ADDRESS LOGGED</span>
                </span>
            </div>
            <main className="mx-auto max-w-2xl px-4 py-10">{children}</main>
        </div>
    );
}
