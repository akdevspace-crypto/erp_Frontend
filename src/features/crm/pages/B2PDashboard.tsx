import { PageHeader } from '../../../components/PageHeader';
import { DataTable } from '../../../components/DataTable';
import { Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/axios';

export function B2PDashboard() {
    const { data: response, isLoading } = useQuery({
        queryKey: ['b2p-partners'],
        queryFn: async () => {
            const res = await api.get('/crm/partners');
            return res.data;
        }
    });

    const partners = response?.data || [];

    const columns = [
        { key: 'name', header: 'Partner Name', cell: (row: any) => row.name },
        { key: 'type', header: 'Type', cell: (row: any) => row.type },
        { key: 'contact', header: 'Contact', cell: (row: any) => row.contact || '-' },
        { key: 'email', header: 'Email', cell: (row: any) => row.email || '-' },
        { 
            key: 'referrals', 
            header: 'Total Referrals', 
            cell: (row: any) => (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {row._count?.referrals || 0}
                </span>
            ) 
        }
    ];

    return (
        <div className="flex h-full flex-col">
            <PageHeader 
                title="B2P Referrals" 
                subtitle="Track and manage business partners and patient referrals."
                icon={Users}
            />
            <div className="flex-1 overflow-hidden p-6">
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <DataTable
                        columns={columns}
                        data={partners}
                        isLoading={isLoading}
                        keyExtractor={(item: any) => item.id}
                    />
                </div>
            </div>
        </div>
    );
}
