/**
 * Purpose: Calm Editorial Empty State Component for zero-data tables or filtered views.
 * Domain Context: Uses a soft 1px dashed #CBD5E1 border on a quiet #F8FAFC surface.
 * Key Dependencies: react, @/lib/utils
 */
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface EmptyStateProps {
    /** Monospace category label */
    tag?: string;
    /** Main empty state title */
    title: string;
    /** Explanation of why no data is shown and how to populate it */
    description: string;
    /** Optional action button */
    action?: React.ReactNode;
    className?: string;
}

/**
 * Renders a quiet dashed-border empty state box on a soft slate surface.
 */
export function EmptyState({ tag = 'NO RECORDS FOUND', title, description, action, className }: EmptyStateProps): React.ReactElement {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center',
                className,
            )}
        >
            <span className="mb-2.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 py-0.5 font-mono text-xs font-medium tracking-wider text-[#64748B] uppercase">
                {tag}
            </span>
            <h3 className="font-heading text-lg font-semibold text-[#1E293B]">{title}</h3>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-[#64748B]">{description}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
