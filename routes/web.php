<?php

declare(strict_types=1);

/**
 * Purpose: Primary HTTP Web Routes for FC R&D (Family Care — History Maker).
 * Domain Context: Serves the Phase 0 System Health & Codecademy Design Showcase at
 *                 both `/` and `/design-system`, and wraps authenticated routes with
 *                 `EnsureCellTenantContext` for Soft Multi-Tenancy (`cell_id`).
 * Key Dependencies: `DesignSystemShowcaseController`, `EnsureCellTenantContext`.
 */

use App\Http\Controllers\DesignSystemShowcaseController;
use App\Http\Middleware\EnsureCellTenantContext;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', DesignSystemShowcaseController::class)->name('home');
Route::get('/design-system', DesignSystemShowcaseController::class)->name('design-system');

Route::middleware(['auth', EnsureCellTenantContext::class])->group(function (): void {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
