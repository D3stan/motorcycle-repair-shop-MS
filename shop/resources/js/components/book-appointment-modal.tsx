import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Clock, Settings, Zap, ChevronDown, Bike } from 'lucide-react';

interface Motorcycle {
    id: number;
    label: string;
}

interface BookAppointmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    motorcycles: Motorcycle[];
}

interface AppointmentFormData {
    NumTelaio: string;
    DataAppuntamento: string;
    Ora: string;
    Tipo: 'maintenance' | 'dyno_testing';
    Note: string;
    [key: string]: any;
}

export default function BookAppointmentModal({ open, onOpenChange, motorcycles }: BookAppointmentModalProps) {
    const [selectedType, setSelectedType] = useState<'maintenance' | 'dyno_testing' | ''>('');

    const { data, setData, post, processing, errors, reset } = useForm<AppointmentFormData>({
        NumTelaio: '',
        DataAppuntamento: '',
        Ora: '',
        Tipo: 'maintenance',
        Note: '',
    });

    // Generate available time slots (9:00 AM to 5:00 PM)
    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00', 
        '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

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
        setData('Tipo', type);
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
                    <DialogDescription>
                        Choose the type of service you need and select your preferred date and time.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Service Type Selection */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Service Type</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card 
                                className={`cursor-pointer transition-all p-0 ${
                                    selectedType === 'maintenance' 
                                        ? 'border-primary bg-primary/5' 
                                        : 'hover:border-primary/50'
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
                                className={`cursor-pointer transition-all p-0 ${
                                    selectedType === 'dyno_testing' 
                                        ? 'border-primary bg-primary/5' 
                                        : 'hover:border-primary/50'
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
                        {errors.Tipo && (
                            <p className="text-sm text-red-600">{errors.Tipo}</p>
                        )}
                    </div>

                    {/* Motorcycle Selection */}
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
                                    >
                                        {data.NumTelaio 
                                            ? motorcycles.find(m => m.id.toString() === data.NumTelaio)?.label || 'Select your motorcycle'
                                            : 'Select your motorcycle'
                                        }
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                                    {motorcycles.map((motorcycle) => (
                                        <DropdownMenuItem 
                                            key={motorcycle.id}
                                            onClick={() => setData('NumTelaio', motorcycle.id.toString())}
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
                        {errors.NumTelaio && (
                            <p className="text-sm text-red-600">{errors.NumTelaio}</p>
                        )}
                    </div>

                    {/* Date and Time Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="DataAppuntamento" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Date
                            </Label>
                            <Input
                                id="DataAppuntamento"
                                type="date"
                                min={minDateString}
                                value={data.DataAppuntamento}
                                onChange={(e) => setData('DataAppuntamento', e.target.value)}
                                className="w-full"
                            />
                            {errors.DataAppuntamento && (
                                <p className="text-sm text-red-600">{errors.DataAppuntamento}</p>
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
                                    >
                                        {data.Ora || 'Select time'}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                                    {timeSlots.map((time) => (
                                        <DropdownMenuItem 
                                            key={time}
                                            onClick={() => setData('Ora', time)}
                                            className="cursor-pointer"
                                        >
                                            {time}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {errors.Ora && (
                                <p className="text-sm text-red-600">{errors.Ora}</p>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="Note">Additional Notes (Optional)</Label>
                        <textarea
                            id="Note"
                            placeholder="Describe any specific issues, requirements, or preferences..."
                            value={data.Note}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('Note', e.target.value)}
                            rows={3}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {errors.Note && (
                            <p className="text-sm text-red-600">{errors.Note}</p>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing || motorcycles.length === 0 || !selectedType || !data.NumTelaio || !data.DataAppuntamento || !data.Ora}
                            className={motorcycles.length === 0 ? 'cursor-not-allowed' : ''}
                        >
                            {processing ? 'Booking...' : motorcycles.length === 0 ? 'Add Motorcycle First' : 'Book Appointment'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 