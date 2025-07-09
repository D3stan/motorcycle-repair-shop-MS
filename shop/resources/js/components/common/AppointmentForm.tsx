import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Clock, Settings, Zap, ChevronDown, Bike } from 'lucide-react';

interface Motorcycle {
    id: number;
    label: string;
}

interface AppointmentFormData {
    motorcycle_id?: string;
    appointment_date: string;
    appointment_time: string;
    type: 'maintenance' | 'dyno_testing';
    notes: string;
}

interface AppointmentFormProps {
    data: AppointmentFormData;
    onDataChange: (field: keyof AppointmentFormData, value: string) => void;
    errors: Partial<Record<keyof AppointmentFormData, string>>;
    motorcycles?: Motorcycle[];
    showMotorcycleSelect?: boolean;
    disabled?: boolean;
    processing?: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    submitLabel?: string;
    showCancelButton?: boolean;
}

// Common time slots (9:00 AM to 5:00 PM)
const TIME_SLOTS = [
    '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
];

// Service type options
const SERVICE_TYPES = [
    {
        id: 'maintenance' as const,
        label: 'Maintenance Service',
        icon: Settings,
        description: 'Regular maintenance and repairs'
    },
    {
        id: 'dyno_testing' as const,
        label: 'Dyno Testing',
        icon: Zap,
        description: 'Performance testing and tuning'
    }
];

export default function AppointmentForm({
    data,
    onDataChange,
    errors,
    motorcycles = [],
    showMotorcycleSelect = true,
    disabled = false,
    processing = false,
    onSubmit,
    onCancel,
    submitLabel = 'Book Appointment',
    showCancelButton = true
}: AppointmentFormProps) {
    // Get minimum date (tomorrow)
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateString = minDate.toISOString().split('T')[0];

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Service Type Selection */}
            <div className="space-y-3">
                <Label className="text-base font-medium">Service Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SERVICE_TYPES.map((serviceType) => {
                        const Icon = serviceType.icon;
                        return (
                            <Card 
                                key={serviceType.id}
                                className={`cursor-pointer transition-all p-0 ${
                                    data.type === serviceType.id
                                        ? 'border-primary bg-primary/5' 
                                        : 'hover:border-primary/50'
                                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => !disabled && onDataChange('type', serviceType.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-5 w-5" />
                                        <span className="font-medium">{serviceType.label}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
                {errors.type && (
                    <p className="text-sm text-red-600">{errors.type}</p>
                )}
            </div>

            {/* Motorcycle Selection */}
            {showMotorcycleSelect && (
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Bike className="h-4 w-4" />
                        Motorcycle
                    </Label>
                    {motorcycles.length > 0 ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-between"
                                    type="button"
                                    disabled={disabled}
                                >
                                    {data.motorcycle_id 
                                        ? motorcycles.find(m => m.id.toString() === data.motorcycle_id)?.label || 'Select your motorcycle'
                                        : 'Select your motorcycle'
                                    }
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                                {motorcycles.map((motorcycle) => (
                                    <DropdownMenuItem 
                                        key={motorcycle.id}
                                        onClick={() => onDataChange('motorcycle_id', motorcycle.id.toString())}
                                        className="cursor-pointer"
                                    >
                                        {motorcycle.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground mb-2">
                                No motorcycles registered
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Please add a motorcycle to your garage first
                            </p>
                        </div>
                    )}
                    {errors.motorcycle_id && (
                        <p className="text-sm text-red-600">{errors.motorcycle_id}</p>
                    )}
                </div>
            )}

            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="appointment_date" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date
                    </Label>
                    <Input
                        id="appointment_date"
                        type="date"
                        min={minDateString}
                        value={data.appointment_date}
                        onChange={(e) => onDataChange('appointment_date', e.target.value)}
                        disabled={disabled}
                        className="w-full"
                    />
                    {errors.appointment_date && (
                        <p className="text-sm text-red-600">{errors.appointment_date}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Time
                    </Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="outline" 
                                className="w-full justify-between"
                                type="button"
                                disabled={disabled}
                            >
                                {data.appointment_time || 'Select time'}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                            {TIME_SLOTS.map((time) => (
                                <DropdownMenuItem 
                                    key={time}
                                    onClick={() => onDataChange('appointment_time', time)}
                                    className="cursor-pointer"
                                >
                                    {time}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {errors.appointment_time && (
                        <p className="text-sm text-red-600">{errors.appointment_time}</p>
                    )}
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                    id="notes"
                    placeholder="Any specific requirements or notes about your appointment..."
                    value={data.notes}
                    onChange={(e) => onDataChange('notes', e.target.value)}
                    disabled={disabled}
                    rows={3}
                />
                {errors.notes && (
                    <p className="text-sm text-red-600">{errors.notes}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
                {showCancelButton && (
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onCancel}
                        disabled={processing}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                )}
                <Button 
                    type="submit" 
                    disabled={processing || disabled}
                    className="flex-1"
                >
                    {processing ? 'Processing...' : submitLabel}
                </Button>
            </div>
        </form>
    );
} 