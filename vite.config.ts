/**
 * Purpose: Vite 6 Production & Local Bundler Configuration
 * Domain Context: Compiles React 19 + TypeScript + Tailwind CSS v4 directly into `public/build`
 *                 for zero-Node cPanel Shared Hosting deployment (no SSR server dependency).
 * Key Dependencies: laravel-vite-plugin, @vitejs/plugin-react, @tailwindcss/vite
 */
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    build: {
        outDir: 'public/build',
        emptyOutDir: true,
        manifest: 'manifest.json',
        chunkSizeWarningLimit: 1000,
    },
    esbuild: {
        jsx: 'automatic',
    },
});
