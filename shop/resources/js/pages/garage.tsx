import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Garage',
        href: '/garage',
    },
];

interface Motorcycle {
    id: number;
    motorcycle_model_id: number;
    brand: string;
    model: string;
    year: number;
    plate: string;
    vin: string;
    color?: string;
    engine_size?: number;
    notes?: string;
}

interface MotorcycleModel {
    id: number;
    brand: string;
    name: string;
    engine_size: number;
    display_name: string;
}

interface GarageProps {
    motorcycles: Motorcycle[];
    motorcycleModels: MotorcycleModel[];
    pendingServicesCount: number;
    lastServiceDate: string;
}

export default function Garage({ motorcycles, motorcycleModels, pendingServicesCount, lastServiceDate }: GarageProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMotorcycle, setEditingMotorcycle] = useState<Motorcycle | null>(null);

    // Form for adding new motorcycle
    const addForm = useForm({
        motorcycle_model_id: '',
        license_plate: '',
        registration_year: new Date().getFullYear(),
        vin: '',
        notes: '',
    });

    // Form for editing motorcycle
    const editForm = useForm({
        motorcycle_model_id: '',
        license_plate: '',
        registration_year: new Date().getFullYear(),
        vin: '',
        notes: '',
    });

    const handleAddMotorcycle = () => {
        setIsAddModalOpen(true);
    };

    const handleEditMotorcycle = (motorcycleId: number) => {
        const motorcycle = motorcycles.find(m => m.id === motorcycleId);
        if (motorcycle) {
            setEditingMotorcycle(motorcycle);
            editForm.setData({
                motorcycle_model_id: motorcycle.motorcycle_model_id.toString(),
                license_plate: motorcycle.plate,
                registration_year: motorcycle.year,
                vin: motorcycle.vin,
                notes: motorcycle.notes || '',
            });
            setIsEditModalOpen(true);
        }
    };

    const handleRemoveMotorcycle = (motorcycleId: number) => {
        if (confirm('Are you sure you want to remove this motorcycle? This action cannot be undone.')) {
            const motorcycle = motorcycles.find(m => m.id === motorcycleId);
            if (motorcycle) {
                useForm().delete(route('garage.destroy', motorcycle.id));
            }
        }
    };

    const handleViewHistory = (motorcycleId: number) => {
        router.visit(`/garage/${motorcycleId}/history`);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('garage.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                addForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMotorcycle) {
            editForm.put(route('garage.update', editingMotorcycle.id), {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setEditingMotorcycle(null);
                    editForm.reset();
                },
            });
        }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1980 + 2 }, (_, i) => currentYear - i + 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Garage" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">My Garage</h1>
                        <p className="text-muted-foreground">Manage your motorcycles and view their service history</p>
                    </div>
                    <Button onClick={handleAddMotorcycle}>
                        Add New Motorcycle
                    </Button>
                </div>

                {/* Add Motorcycle Modal */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Motorcycle</DialogTitle>
                            <DialogDescription>
                                Add a new motorcycle to your garage. All fields are required.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="add-model">Motorcycle Model</Label>
                                <Select
                                    value={addForm.data.motorcycle_model_id}
                                    onValueChange={(value) => addForm.setData('motorcycle_model_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a motorcycle model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {motorcycleModels.map((model) => (
                                            <SelectItem key={model.id} value={model.id.toString()}>
                                                {model.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {addForm.errors.motorcycle_model_id && (
                                    <p className="text-sm text-red-600">{addForm.errors.motorcycle_model_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="add-plate">License Plate</Label>
                                <Input
                                    id="add-plate"
                                    value={addForm.data.license_plate}
                                    onChange={(e) => addForm.setData('license_plate', e.target.value)}
                                    placeholder="Enter license plate"
                                />
                                {addForm.errors.license_plate && (
                                    <p className="text-sm text-red-600">{addForm.errors.license_plate}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="add-year">Registration Year</Label>
                                <Select
                                    value={addForm.data.registration_year.toString()}
                                    onValueChange={(value) => addForm.setData('registration_year', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {addForm.errors.registration_year && (
                                    <p className="text-sm text-red-600">{addForm.errors.registration_year}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="add-vin">VIN</Label>
                                <Input
                                    id="add-vin"
                                    value={addForm.data.vin}
                                    onChange={(e) => addForm.setData('vin', e.target.value)}
                                    placeholder="Enter VIN (Vehicle Identification Number)"
                                    maxLength={17}
                                />
                                {addForm.errors.vin && (
                                    <p className="text-sm text-red-600">{addForm.errors.vin}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="add-notes">Notes (Optional)</Label>
                                <Input
                                    id="add-notes"
                                    value={addForm.data.notes}
                                    onChange={(e) => addForm.setData('notes', e.target.value)}
                                    placeholder="Additional notes about your motorcycle"
                                />
                                {addForm.errors.notes && (
                                    <p className="text-sm text-red-600">{addForm.errors.notes}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={addForm.processing}>
                                    {addForm.processing ? 'Adding...' : 'Add Motorcycle'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Motorcycle Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Motorcycle</DialogTitle>
                            <DialogDescription>
                                Update your motorcycle information. All fields are required.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-model">Motorcycle Model</Label>
                                <Select
                                    value={editForm.data.motorcycle_model_id}
                                    onValueChange={(value) => editForm.setData('motorcycle_model_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a motorcycle model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {motorcycleModels.map((model) => (
                                            <SelectItem key={model.id} value={model.id.toString()}>
                                                {model.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editForm.errors.motorcycle_model_id && (
                                    <p className="text-sm text-red-600">{editForm.errors.motorcycle_model_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-plate">License Plate</Label>
                                <Input
                                    id="edit-plate"
                                    value={editForm.data.license_plate}
                                    onChange={(e) => editForm.setData('license_plate', e.target.value)}
                                    placeholder="Enter license plate"
                                />
                                {editForm.errors.license_plate && (
                                    <p className="text-sm text-red-600">{editForm.errors.license_plate}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-year">Registration Year</Label>
                                <Select
                                    value={editForm.data.registration_year.toString()}
                                    onValueChange={(value) => editForm.setData('registration_year', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editForm.errors.registration_year && (
                                    <p className="text-sm text-red-600">{editForm.errors.registration_year}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-vin">VIN</Label>
                                <Input
                                    id="edit-vin"
                                    value={editForm.data.vin}
                                    onChange={(e) => editForm.setData('vin', e.target.value)}
                                    placeholder="Enter VIN (Vehicle Identification Number)"
                                    maxLength={17}
                                />
                                {editForm.errors.vin && (
                                    <p className="text-sm text-red-600">{editForm.errors.vin}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-notes">Notes (Optional)</Label>
                                <Input
                                    id="edit-notes"
                                    value={editForm.data.notes}
                                    onChange={(e) => editForm.setData('notes', e.target.value)}
                                    placeholder="Additional notes about your motorcycle"
                                />
                                {editForm.errors.notes && (
                                    <p className="text-sm text-red-600">{editForm.errors.notes}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    {editForm.processing ? 'Updating...' : 'Update Motorcycle'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Motorcycles Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {motorcycles.map((motorcycle) => (
                        <Card key={motorcycle.id} className="relative">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{motorcycle.brand} {motorcycle.model}</span>
                                    <span className="text-sm font-normal text-muted-foreground">{motorcycle.year}</span>
                                </CardTitle>
                                <CardDescription>
                                    Plate: {motorcycle.plate}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm">
                                    <p><strong>VIN:</strong> {motorcycle.vin}</p>
                                    {motorcycle.color && <p><strong>Color:</strong> {motorcycle.color}</p>}
                                    {motorcycle.engine_size && <p><strong>Engine:</strong> {motorcycle.engine_size}cc</p>}
                                    {motorcycle.notes && <p><strong>Notes:</strong> {motorcycle.notes}</p>}
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleViewHistory(motorcycle.id)}
                                        className="w-full"
                                    >
                                        View Service History
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleEditMotorcycle(motorcycle.id)}
                                            className="flex-1"
                                        >
                                            Edit
                                        </Button>
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => handleRemoveMotorcycle(motorcycle.id)}
                                            className="flex-1"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {motorcycles.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <h3 className="text-lg font-semibold mb-2">No motorcycles in your garage</h3>
                            <p className="text-muted-foreground mb-4 text-center">
                                Add your first motorcycle to start managing your service history and appointments.
                            </p>
                            <Button onClick={handleAddMotorcycle}>
                                Add Your First Motorcycle
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Motorcycles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{motorcycles.length}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Pending Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingServicesCount}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Last Service</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{lastServiceDate}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 