/**
 * Purpose: Reusable form fields for creating a new FC Event Session with a 24h 4-digit PIN.
 * Domain Context: Shared between the Quick Event modal on Dashboard and the Event Creation Card on Event List.
 * Key Dependencies: @/components/input-error, @/components/ui/input, @/components/ui/label, @/types
 */
import * as React from 'react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EventTypeOption, EventTypeValue } from '@/types';

export type QuickEventFormData = {
    title: string;
    type: EventTypeValue;
    event_date: string;
    location: string;
};

export interface QuickEventFormFieldsProps {
    data: QuickEventFormData;
    errors: Partial<Record<keyof QuickEventFormData, string>>;
    eventTypes: EventTypeOption[];
    onChange: <K extends keyof QuickEventFormData>(field: K, value: QuickEventFormData[K]) => void;
    idPrefix?: string;
}

/**
 * Renders the title, event type, date, and optional location inputs for quick event creation.
 */
export function QuickEventFormFields({
    data,
    errors,
    eventTypes,
    onChange,
    idPrefix = 'quick',
}: QuickEventFormFieldsProps): React.ReactElement {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor={`${idPrefix}-title`}>Judul Acara</Label>
                <Input
                    id={`${idPrefix}-title`}
                    type="text"
                    required
                    value={data.title}
                    onChange={(e) => onChange('title', e.target.value)}
                    placeholder="Contoh: FC Gathering #16: Heart of Stewardship"
                />
                <InputError message={errors.title} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor={`${idPrefix}-type`}>Jenis Acara</Label>
                    <select
                        id={`${idPrefix}-type`}
                        value={data.type}
                        onChange={(e) => onChange('type', e.target.value as EventTypeValue)}
                        className="flex h-9 w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-1 text-sm text-[#1E293B] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 focus:outline-none"
                    >
                        {eventTypes.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.type} />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor={`${idPrefix}-date`}>Tanggal Acara</Label>
                    <Input
                        id={`${idPrefix}-date`}
                        type="date"
                        required
                        value={data.event_date}
                        onChange={(e) => onChange('event_date', e.target.value)}
                    />
                    <InputError message={errors.event_date} />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor={`${idPrefix}-location`}>Lokasi (Opsional)</Label>
                <Input
                    id={`${idPrefix}-location`}
                    type="text"
                    value={data.location}
                    onChange={(e) => onChange('location', e.target.value)}
                    placeholder="Basecamp History Maker"
                />
                <InputError message={errors.location} />
            </div>
        </div>
    );
}
