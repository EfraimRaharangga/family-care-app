/**
 * Purpose: Calm Editorial Neutral Badge Primitive (shadcn/ui customized)
 * Domain Context: Low-glare monospace metadata pills with 1px subtle borders and rounded-md corners
 * Key Dependencies: class-variance-authority, react
 */
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 font-mono text-xs font-medium tracking-wide transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-[#1E293B] bg-[#1E293B] text-white',
                secondary: 'border-[#E2E8F0] bg-[#F1F5F9] text-[#334155]',
                indigo: 'border-[#C7D2FE] bg-[#EEF2FF] text-[#4338CA]',
                success: 'border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]',
                info: 'border-[#E2E8F0] bg-[#F8FAFC] text-[#334155]',
                warning: 'border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]',
                destructive: 'border-[#FECDD3] bg-[#FFF1F2] text-[#BE123C]',
                outline: 'border-[#E2E8F0] bg-white text-[#475569]',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

/**
 * Renders a soft, 1px bordered monospace badge.
 */
function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
