/**
 * Purpose: Calm Editorial Neutral Top Navigation Bar for FC R&D.
 * Domain Context: Displays the active cell tenant (`FC R&D`), History Maker logo,
 *                 mobile hamburger menu trigger (`< md`), and authentication logout/login control
 *                 with an intentionally empty middle space.
 * Key Dependencies: @inertiajs/react, @/components/ui/button, @/components/ui/sheet
 */
import { Link, usePage } from '@inertiajs/react';
import { LogOut, Menu } from 'lucide-react';
import * as React from 'react';

import { CompactUserProfile, SidebarNavLinks } from '@/components/layout/SideBar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { SharedData } from '@/types';

export interface TopBarProps {
    /** Active cell tenant name */
    cellName?: string;
}

/**
 * Quiet editorial header bar with 1px solid #E2E8F0 bottom border and mobile hamburger drawer.
 */
export function TopBar({ cellName = 'FC' }: TopBarProps): React.ReactElement {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-xs">
            <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Mobile Hamburger Menu + Brand & Active Cell Tenant Pill */}
                <div className="flex items-center gap-3">
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                className="h-9 w-9 text-[#334155] md:hidden"
                                aria-label="Buka menu navigasi"
                            >
                                <Menu className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex w-72 flex-col justify-between bg-white p-0">
                            <div>
                                <SheetHeader className="border-b border-[#E2E8F0] px-4 py-4 text-left">
                                    <SheetTitle className="flex items-center gap-2.5">
                                        <img
                                            src="/img/logoHM.png"
                                            alt="History Maker Logo"
                                            className="h-8 w-8 rounded-md border border-[#E2E8F0] bg-white object-contain p-0.5"
                                        />
                                        <span className="font-heading text-sm font-bold tracking-tight text-[#0F172A]">
                                            FAMILY CARE MGT
                                        </span>
                                    </SheetTitle>
                                </SheetHeader>
                                <SidebarNavLinks onNavigate={() => setMobileMenuOpen(false)} className="p-3 pt-4" />
                            </div>
                            <CompactUserProfile user={user} />
                        </SheetContent>
                    </Sheet>

                    <Link href="/dashboard" className="group flex items-center gap-3">
                        <img
                            src="/img/logoHM.png"
                            alt="History Maker Logo"
                            className="h-9 w-9 rounded-md bg-white object-contain p-0.5 transition-opacity group-hover:opacity-90"
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-heading text-base font-bold tracking-tight text-[#0F172A]">
                                    FAMILY CARE MGT
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Auth / Logout Controls (middle space intentionally left empty) */}
                <div className="flex items-center gap-2.5">
                    {user ? (
                        <Link href={route('logout')} method="post" as="button">
                            <Button variant="outline" size="sm" type="button">
                                <LogOut className="h-3.5 w-3.5 text-[#64748B]" />
                                <span>Keluar</span>
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button variant="default" size="sm">
                                <span>Login Pengurus</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
