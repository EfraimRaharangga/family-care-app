/**
 * Purpose: Renders a Calm Editorial Neutral "Journey of Belonging" Tier Badge (`Part` vs. `Vital`).
 * Domain Context: Uses a single soft Muted Indigo tint (`bg-[#EEF2FF] text-[#4338CA]`) for `Vital`
 *                 and quiet Slate (`bg-[#F1F5F9] text-[#334155]`) for `Part`.
 * Key Dependencies: @/types, @/lib/utils
 */
import * as React from 'react';

import { cn } from '@/lib/utils';
import type { UserTierValue } from '@/types';

export interface TierBadgeProps {
    /** Membership tier ('part' | 'vital') */
    tier: UserTierValue;
    /** Optional additional CSS classes */
    className?: string;
}

/**
 * Displays a calm, 1px bordered monospace badge for `Part` or `Vital`.
 */
export function TierBadge({ tier, className }: TierBadgeProps): React.ReactElement {
    const isVital = tier === 'vital';

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 font-mono text-xs font-medium tracking-wide uppercase',
                isVital
                    ? 'border-[#C7D2FE] bg-[#EEF2FF] text-[#4338CA]'
                    : 'border-[#E2E8F0] bg-[#F1F5F9] text-[#334155]',
                className,
            )}
        >
            <span className={cn('inline-block h-1.5 w-1.5 rounded-full', isVital ? 'bg-[#4F46E5]' : 'bg-[#64748B]')} />
            {isVital ? 'VITAL · CORE SERVANT' : 'PART · MEMBER'}
        </span>
    );
}
