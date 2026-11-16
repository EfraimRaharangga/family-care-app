/**
 * Purpose: Reusable Card / Table View Mode Toggle for data listing pages.
 * Domain Context: Follows Calm Editorial Neutral tokens (`1px solid #E2E8F0`, Muted Indigo active state)
 *                 and is shared between the Feedback Data and Event List pages.
 * Key Dependencies: lucide-react, @/lib/utils
 */
import { LayoutGrid, Table2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export type ViewMode = 'cards' | 'table';

export interface ViewModeToggleProps {
    value: ViewMode;
    onChange: (mode: ViewMode) => void;
    className?: string;
}

/**
 * Compact segmented control switching between `Kartu` (cards) and `Tabel` (table) layouts.
 */
export function ViewModeToggle({ value, onChange, className }: ViewModeToggleProps): React.ReactElement {
    return (
        <div
            role="group"
            aria-label="Mode Tampilan Data"
            className={cn(
                'inline-flex items-center rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-0.5',
                className,
            )}
        >
            <button
                type="button"
                onClick={() => onChange('cards')}
                aria-pressed={value === 'cards'}
                className={cn(
                    'inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-mono text-[11px] font-medium transition-colors',
                    value === 'cards'
                        ? 'bg-white text-[#4338CA] shadow-xs ring-1 ring-[#C7D2FE]'
                        : 'text-[#64748B] hover:text-[#1E293B]',
                )}
            >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Kartu</span>
            </button>
            <button
                type="button"
                onClick={() => onChange('table')}
                aria-pressed={value === 'table'}
                className={cn(
                    'inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-mono text-[11px] font-medium transition-colors',
                    value === 'table'
                        ? 'bg-white text-[#4338CA] shadow-xs ring-1 ring-[#C7D2FE]'
                        : 'text-[#64748B] hover:text-[#1E293B]',
                )}
            >
                <Table2 className="h-3.5 w-3.5" />
                <span>Tabel</span>
            </button>
        </div>
    );
}
