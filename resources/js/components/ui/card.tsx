/**
 * Purpose: Calm Editorial Neutral Card Primitives (shadcn/ui customized)
 * Domain Context: Pure white cards with subtle 1px #E2E8F0 borders, 8px rounded-lg corners,
 *                 quiet neutral #F8FAFC top metadata strips, and soft diffused elevation
 * Key Dependencies: react, @/lib/utils
 */
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Enables subtle diffused hover elevation */
    interactive?: boolean;
}

/**
 * Base Card container with 1px solid #E2E8F0 border, rounded-lg corners, and soft ambient shadow.
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, interactive = false, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'overflow-hidden rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] shadow-[0_1px_2px_0_rgba(15,23,42,0.03)]',
            interactive && 'editorial-card-interactive',
            className,
        )}
        {...props}
    />
));
Card.displayName = 'Card';

/**
 * Quiet neutral top metadata strip (`#F8FAFC` with `#64748B` text) — zero rainbow fills.
 */
const CardBanner = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex items-center justify-between border-b border-[#F1F5F9] bg-[#F8FAFC] px-5 py-2 font-mono text-[11px] font-medium tracking-wider text-[#64748B] uppercase',
            className,
        )}
        {...props}
    />
));
CardBanner.displayName = 'CardBanner';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-5', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('font-heading text-lg font-semibold leading-snug tracking-tight text-[#1E293B]', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm leading-relaxed text-[#64748B]', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex items-center justify-between border-t border-dashed border-[#E2E8F0] bg-[#F8FAFC]/40 px-5 py-3 font-mono text-xs text-[#64748B]',
            className,
        )}
        {...props}
    />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardBanner, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
