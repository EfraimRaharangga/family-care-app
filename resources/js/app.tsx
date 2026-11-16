/**
 * Purpose: Primary Inertia.js v2 + React 19 Client Entrypoint
 * Domain Context: FC (Family Care — History Maker) Web Application
 * Key Dependencies: @inertiajs/react, laravel-vite-plugin, ziggy-js
 */
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'FC — Family Care';

createInertiaApp({
    title: (title) => (title ? `${title} — ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        // Use Muted Indigo (#4F46E5) for top route transition bar
        color: '#4F46E5',
    },
});

// Enforce Calm Editorial Light Mode on boot
initializeTheme();
