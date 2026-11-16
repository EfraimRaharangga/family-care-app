/**
 * Purpose: Theme Appearance Hook (Locked to Codecademy Editorial Light Mode)
 * Domain Context: FC Design System mandates high-contrast warm cream (#FFF0E5) and deep navy (#10162F) surfaces
 * Key Dependencies: react
 */
import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

/**
 * Applies the strict Codecademy Gamut Light Mode by removing any dark class on root.
 */
const applyLightTheme = (): void => {
    // Intentionally lock to light mode per docs/DESIGN_SYSTEM.md to prevent dark-mode drift
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
};

/**
 * Initializes the application theme on page load.
 */
export function initializeTheme(): void {
    applyLightTheme();
}

/**
 * React hook returning current appearance state and updater (locked to 'light' for Phase 0).
 */
export function useAppearance(): { appearance: Appearance; updateAppearance: (mode: Appearance) => void } {
    const [appearance, setAppearance] = useState<Appearance>('light');

    const updateAppearance = (_mode: Appearance): void => {
        setAppearance('light');
        localStorage.setItem('appearance', 'light');
        applyLightTheme();
    };

    useEffect(() => {
        applyLightTheme();
    }, []);

    return { appearance, updateAppearance };
}
