import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { PageProps, PaginatedResponse, WorkSession } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface WorkSessionsPageProps extends PageProps {
    workSessions: PaginatedResponse<WorkSession>;
}

export default function WorkSessions({ workSessions }: WorkSessionsPageProps) {
    return (
        <AppLayout>
            <Head title="My Work Sessions" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">My Work Sessions</h1>
                        <p className="text-muted-foreground">Track and manage your work sessions and logged hours</p>
                    </div>
                    <Button asChild>
                        <Link href={route('mechanic.work-sessions.create')}>Log New Session</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Work Sessions</CardTitle>
                        <CardDescription>A log of your work sessions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flow-root">
                            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                    <table className="divide-border min-w-full divide-y">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="text-foreground py-3.5 pr-3 pl-4 text-left text-sm font-semibold sm:pl-0">
                                                    Date
                                                </th>
                                                <th scope="col" className="text-foreground px-3 py-3.5 text-left text-sm font-semibold">
                                                    Motorcycle
                                                </th>
                                                <th scope="col" className="text-foreground px-3 py-3.5 text-left text-sm font-semibold">
                                                    Hours Worked
                                                </th>
                                                <th scope="col" className="text-foreground px-3 py-3.5 text-left text-sm font-semibold">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-border divide-y">
                                            {workSessions.data.map((session) => (
                                                <tr key={session.CodiceSessione}>
                                                    <td className="text-foreground py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap sm:pl-0">
                                                        {new Date(session.Data).toLocaleDateString()}
                                                    </td>
                                                    <td className="text-muted-foreground px-3 py-4 text-sm whitespace-nowrap">
                                                        {session.motorcycle.motorcycle_model.Marca} {session.motorcycle.motorcycle_model.Nome}
                                                    </td>
                                                    <td className="text-muted-foreground px-3 py-4 text-sm whitespace-nowrap">
                                                        {session.OreImpiegate}
                                                    </td>
                                                    <td className="text-muted-foreground px-3 py-4 text-sm whitespace-nowrap">{session.Stato}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
