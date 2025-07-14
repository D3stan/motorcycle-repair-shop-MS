import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, Calendar, Clock, Settings, Zap } from 'lucide-react';

interface Appointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    type: string;
    status: string;
    notes: string;
}

interface CancelAppointmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: Appointment | null;
}

export default function CancelAppointmentModal({ open, onOpenChange, appointment }: CancelAppointmentModalProps) {
    const { delete: deleteAppointment, processing } = useForm();

    const handleCancel = () => {
        if (!appointment) return;

        deleteAppointment(route('appointments.destroy', appointment.id), {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    const handleClose = () => {
        onOpenChange(false);
    };

    if (!appointment) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cancel Appointment</DialogTitle>
                        <DialogDescription>Loading appointment data...</DialogDescription>
                    </DialogHeader>
                    <div className="p-4">
                        <p>No appointment data available.</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Check if appointment can be cancelled (not completed)
    const canCancel = appointment.status !== 'completed';

    // Format the appointment type for display
    const formatType = (type: string) => {
        return type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Format time for display
    const formatTime = (timeString: string) => {
        const time = timeString.substring(0, 5); // Extract HH:MM
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${period}`;
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-destructive h-5 w-5" />
                        Cancel Appointment
                    </DialogTitle>
                    <DialogDescription>Are you sure you want to cancel this appointment? This action cannot be undone.</DialogDescription>
                </DialogHeader>

                {!canCancel ? (
                    <div className="space-y-4">
                        <div className="bg-muted rounded-lg p-4">
                            <p className="text-muted-foreground text-sm">
                                This appointment cannot be cancelled because it has already been completed.
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleClose} variant="outline">
                                Close
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Appointment Details */}
                        <div className="space-y-4">
                            <div className="space-y-3 rounded-lg border p-4">
                                <div className="flex items-center gap-2">
                                    {appointment.type === 'maintenance' ? (
                                        <Settings className="text-muted-foreground h-4 w-4" />
                                    ) : (
                                        <Zap className="text-muted-foreground h-4 w-4" />
                                    )}
                                    <span className="font-medium">{formatType(appointment.type)}</span>
                                </div>

                                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(appointment.appointment_date)}</span>
                                </div>

                                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatTime(appointment.appointment_time)}</span>
                                </div>

                                {appointment.notes && (
                                    <div className="border-t pt-2">
                                        <p className="text-sm">
                                            <span className="font-medium">Notes:</span> {appointment.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Warning Message */}
                        <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-3">
                            <p className="text-destructive text-sm">
                                <strong>Warning:</strong> Cancelling this appointment will remove it from your schedule. If you need to reschedule,
                                you'll need to book a new appointment.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                                Keep Appointment
                            </Button>
                            <Button type="button" variant="destructive" onClick={handleCancel} disabled={processing}>
                                {processing ? 'Cancelling...' : 'Cancel Appointment'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
