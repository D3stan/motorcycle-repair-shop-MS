import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

export default function CreateWorkSession({ auth }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        work_order_id: '',
        hours: '',
        notes: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        // post(route('mechanic.work-sessions.store'));
        alert('This is a placeholder form.');
    }

    return (
        <AppLayout>
            <Head title="Log New Work Session" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Log New Work Session</CardTitle>
                        <CardDescription>Fill out the form to log a new work session.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <Label htmlFor="work_order_id">Work Order</Label>
                                <Input
                                    id="work_order_id"
                                    name="work_order_id"
                                    value={data.work_order_id}
                                    onChange={(e) => setData('work_order_id', e.target.value)}
                                />
                                {errors.work_order_id && <p className="mt-1 text-xs text-red-500">{errors.work_order_id}</p>}
                            </div>

                            <div>
                                <Label htmlFor="hours">Hours Worked</Label>
                                <Input id="hours" name="hours" type="number" value={data.hours} onChange={(e) => setData('hours', e.target.value)} />
                                {errors.hours && <p className="mt-1 text-xs text-red-500">{errors.hours}</p>}
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea id="notes" name="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                                {errors.notes && <p className="mt-1 text-xs text-red-500">{errors.notes}</p>}
                            </div>

                            <Button type="submit" disabled={processing}>
                                Save Session
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
