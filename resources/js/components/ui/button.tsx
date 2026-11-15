/**
 * Purpose: Calm Editorial Neutral Button Primitive (shadcn/ui customized)
 * Domain Context: Subtle 1px slate borders, 6px rounded-md corners, and deep slate / muted indigo actions
 * Key Dependencies: @radix-ui/react-slot, class-variance-authority
 */
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
    {
        variants: {
            variant: {
                default:
                    'border border-[#1E293B] bg-[#1E293B] text-white shadow-2xs hover:bg-[#334155] hover:border-[#334155]',
                indigo:
                    'border border-[#4F46E5] bg-[#4F46E5] text-white shadow-2xs hover:bg-[#4338CA] hover:border-[#4338CA]',
                destructive:
                    'border border-[#E11D48] bg-[#E11D48] text-white shadow-2xs hover:bg-[#BE123C]',
                outline:
                    'border border-[#E2E8F0] bg-white text-[#1E293B] shadow-2xs hover:bg-[#F8FAFC] hover:border-[#CBD5E1]',
                secondary:
                    'border border-[#E2E8F0] bg-[#F1F5F9] text-[#1E293B] hover:bg-[#E2E8F0]/70',
                ghost: 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#1E293B]',
                link: 'text-[#4F46E5] font-medium underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-9 px-4 py-2',
                sm: 'h-8 rounded-md px-3 text-xs',
                lg: 'h-11 rounded-md px-6 text-base',
                icon: 'h-9 w-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    /** Render child element directly via Radix Slot when true */
    asChild?: boolean;
}

/**
 * Primary interactive button adhering to `docs/DESIGN_SYSTEM.md` (Calm Editorial Neutral).
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
