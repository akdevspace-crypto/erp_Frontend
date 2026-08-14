import { PageHeader } from '../../../components/PageHeader';
import { DataTable } from '../../../components/DataTable';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/axios';

export function VisitorReports() {
    const { data: response, isLoading } = useQuery({
        queryKey: ['visitor-reports'],
        queryFn: async () => {
            const res = await api.get('/visitor-reporting');
            return res.data;
        }
    });

    const visits = response?.data || [];

    const columns = [
        { key: 'date', header: 'Check-In', cell: (row: any) => new Date(row.checkIn).toLocaleString('en-GB') },
        { key: 'visitor', header: 'Visitor Name', cell: (row: any) => row.visitorName },
        { key: 'contact', header: 'Contact', cell: (row: any) => row.contact || '-' },
        { key: 'patient', header: 'Visiting', cell: (row: any) => row.patient ? `${row.patient.firstName} ${row.patient.lastName}` : 'General Visit' },
        { key: 'purpose', header: 'Purpose', cell: (row: any) => row.purpose || '-' },
        { key: 'checkout', header: 'Check-Out', cell: (row: any) => row.checkOut ? new Date(row.checkOut).toLocaleString('en-GB') : 'Active' },
    ];

    return (
        <div className="flex h-full flex-col">
            <PageHeader 
                title="Visitor Reports" 
                subtitle="Track and report on facility visits and traffic patterns."
                
            />
            <div className="flex-1 overflow-hidden p-6">
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <DataTable
                        columns={columns}
                        data={visits}
                        isLoading={isLoading}
                        keyExtractor={(item: any) => item.id}
                    />
                </div>
            </div>
        </div>
    );
}



