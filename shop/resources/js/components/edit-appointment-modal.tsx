import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Calendar, ChevronDown, Clock, Settings, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Appointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    type: string;
    type_display: string;
    status: string;
    description: string;
    notes: string;
}

interface EditAppointmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: Appointment | null;
}

interface AppointmentFormData {
    appointment_date: string;
    appointment_time: string;
    type: 'maintenance' | 'dyno_testing';
    notes: string;
    [key: string]: string | number | 'maintenance' | 'dyno_testing';
}

export default function EditAppointmentModal({ open, onOpenChange, appointment }: EditAppointmentModalProps) {
    const [selectedType, setSelectedType] = useState<'maintenance' | 'dyno_testing' | ''>('');

    const { data, setData, put, processing, errors } = useForm<AppointmentFormData>({
        appointment_date: '',
        appointment_time: '',
        type: 'maintenance',
        notes: '',
    });

    // Generate available time slots (9:00 AM to 5:00 PM)
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    // Get minimum date (today)
    const minDate = new Date();
    const minDateString = minDate.toISOString().split('T')[0];

    // Populate form with appointment data when appointment changes
    useEffect(() => {
        if (appointment) {
            setData({
                appointment_date: appointment.appointment_date,
                appointment_time: appointment.appointment_time || '09:00',
                type: appointment.type as 'maintenance' | 'dyno_testing',
                notes: appointment.description || appointment.notes || '',
            });
            setSelectedType(appointment.type as 'maintenance' | 'dyno_testing');
        }
    }, [appointment, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!appointment) return;

        put(route('appointments.update', appointment.id), {
            onSuccess: () => {
                onOpenChange(false);
            },
            onError: (errors) => {
                console.error('Update failed:', errors);
            },
        });
    };

    const handleTypeSelect = (type: 'maintenance' | 'dyno_testing') => {
        setSelectedType(type);
        setData('type', type);
    };

    const handleClose = () => {
        if (appointment) {
            // Reset to original appointment data
            setData({
                appointment_date: appointment.appointment_date,
                appointment_time: appointment.appointment_time || '09:00',
                type: appointment.type as 'maintenance' | 'dyno_testing',
                notes: appointment.description || appointment.notes || '',
            });
            setSelectedType(appointment.type as 'maintenance' | 'dyno_testing');
        }
        onOpenChange(false);
    };

    if (!appointment) {
        console.error('No appointment data available');
        return null;
    };

    // Check if appointment can be edited (not accepted)
    const canEdit = appointment.status !== 'accepted';

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Appointment</DialogTitle>
                    <DialogDescription>
                        Modify your appointment details. Note: Accepted appointments cannot be edited.
                    </DialogDescription>
                </DialogHeader>

                {!canEdit ? (
                    <div className="space-y-4">
                        <div className="bg-muted rounded-lg p-4">
                            <p className="text-muted-foreground text-sm">
                                This appointment cannot be edited because it has been {appointment.status}.
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleClose} variant="outline">
                                Close
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* General Error Display */}
                        {errors.appointment && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-600">{errors.appointment}</p>
                            </div>
                        )}

                        {/* Service Type Selection */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">Service Type</Label>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Card
                                    className={`cursor-pointer transition-all ${
                                        selectedType === 'maintenance' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                                    }`}
                                    onClick={() => handleTypeSelect('maintenance')}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Settings className="h-5 w-5" />
                                            <span className="font-medium">Maintenance Service</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card
                                    className={`cursor-pointer transition-all ${
                                        selectedType === 'dyno_testing' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                                    }`}
                                    onClick={() => handleTypeSelect('dyno_testing')}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-5 w-5" />
                                            <span className="font-medium">Dyno Testing</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
                        </div>

                        {/* Date and Time Selection */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('appointment_date', e.target.value)}
                                    className="w-full"
                                />
                                {errors.appointment_date && <p className="text-sm text-red-600">{errors.appointment_date}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Time
                                </Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between" type="button">
                                            {data.appointment_time || 'Select time'}
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                                        {timeSlots.map((time) => (
                                            <DropdownMenuItem key={time} onClick={() => setData('appointment_time', time)} className="cursor-pointer">
                                                {time}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                {errors.appointment_time && <p className="text-sm text-red-600">{errors.appointment_time}</p>}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes (Optional)</Label>
                            <textarea
                                id="notes"
                                placeholder="Describe any specific issues, requirements, or preferences..."
                                value={data.notes}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)}
                                rows={3}
                                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing || !selectedType || !data.appointment_date || !data.appointment_time}>
                                {processing ? 'Updating...' : 'Update Appointment'}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
