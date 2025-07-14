import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Bike, Calendar, ChevronDown, Clock, Settings, Zap } from 'lucide-react';
import { useState } from 'react';

interface BookAppointmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface AppointmentFormData {
    appointment_date: string;
    appointment_time: string;
    type: 'maintenance' | 'dyno_testing';
    notes: string;
    [key: string]: string | number | 'maintenance' | 'dyno_testing';
}

export default function BookAppointmentModal({ open, onOpenChange }: BookAppointmentModalProps) {
    const [selectedType, setSelectedType] = useState<'maintenance' | 'dyno_testing' | ''>('');

    const { data, setData, post, processing, errors, reset } = useForm<AppointmentFormData>({
        appointment_date: '',
        appointment_time: '',
        type: 'maintenance',
        notes: '',
    });

    // Generate available time slots (9:00 AM to 5:00 PM)
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    // Get minimum date (tomorrow)
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateString = minDate.toISOString().split('T')[0];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('appointments.store'), {
            onSuccess: () => {
                reset();
                setSelectedType('');
                onOpenChange(false);
            },
        });
    };

    const handleTypeSelect = (type: 'maintenance' | 'dyno_testing') => {
        setSelectedType(type);
        setData('type', type);
    };

    const handleClose = () => {
        reset();
        setSelectedType('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Book New Appointment</DialogTitle>
                    <DialogDescription>Choose the type of service you need and select your preferred date and time.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Service Type Selection */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Service Type</Label>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Card
                                className={`cursor-pointer p-0 transition-all ${
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
                                className={`cursor-pointer p-0 transition-all ${
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

                    {/* Service Description */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Service Description (Optional)</Label>
                        <textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Describe any specific issues or requests for your appointment..."
                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                            rows={3}
                        />
                        {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
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
                                onChange={(e) => setData('appointment_date', e.target.value)}
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


                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                processing || !selectedType || !data.appointment_date || !data.appointment_time
                            }
                        >
                            {processing ? 'Booking...' : 'Book Appointment'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
