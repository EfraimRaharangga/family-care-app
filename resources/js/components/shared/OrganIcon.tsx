/**
 * Purpose: Renders the biological organ badge/icon for the 5 Vital Organs of FC.
 * Domain Context: Styles all 5 `OrganIcon` badges uniformly in a clean neutral pill
 *                 (`bg-[#F8FAFC] border-[#E2E8F0] text-[#334155]`) differentiated by
 *                 their emoji and role title to prevent rainbow visual fatigue.
 * Key Dependencies: @/types, @/lib/utils
 */
import * as React from 'react';

import { cn } from '@/lib/utils';
import type { VitalOrganValue } from '@/types';

interface OrganPresentation {
    emoji: string;
    label: string;
    team: string;
}

const ORGAN_MAP: Record<VitalOrganValue, OrganPresentation> = {
    brain: {
        emoji: '🧠',
        label: 'Brain',
        team: 'Leader',
    },
    lungs: {
        emoji: '🫁',
        label: 'Lungs',
        team: 'Event Team',
    },
    hands_and_feet: {
        emoji: '🤲',
        label: 'Hands & Feet',
        team: 'Hospitality Team',
    },
    vascular_system: {
        emoji: '🫀',
        label: 'Vascular System',
        team: 'Treasurer',
    },
    nervous_system: {
        emoji: '⚡',
        label: 'Nervous System',
        team: 'IT Team',
    },
};

export interface OrganIconProps {
    /** Vital organ identifier */
    organ: VitalOrganValue;
    /** Whether to include the functional team subtitle */
    showTeam?: boolean;
    /** Optional CSS classes */
    className?: string;
}

/**
 * Renders a uniform, low-glare neutral organ pill with emoji and role label.
 */
export function OrganIcon({ organ, showTeam = true, className }: OrganIconProps): React.ReactElement {
    const meta = ORGAN_MAP[organ];

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 font-mono text-xs font-medium text-[#334155]',
                className,
            )}
        >
            <span aria-hidden="true">{meta.emoji}</span>
            <span className="font-semibold text-[#1E293B]">{meta.label}</span>
            {showTeam && <span className="text-[#64748B]">({meta.team})</span>}
        </span>
    );
}
