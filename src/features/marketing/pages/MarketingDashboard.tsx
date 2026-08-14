// @ts-nocheck
import { PageHeader } from '../../../components/PageHeader';
import { DataTable } from '../../../components/DataTable';
import { Megaphone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/axios';

export function MarketingDashboard() {
    const { data: response, isLoading } = useQuery({
        queryKey: ['marketing-campaigns'],
        queryFn: async () => {
            const res = await api.get('/marketing/campaigns');
            return res.data;
        }
    });

    const campaigns = response?.data || [];

    const columns = [
        { key: 'title', header: 'Campaign Title', cell: (row: any) => row.title },
        { key: 'type', header: 'Type', cell: (row: any) => row.type },
        { 
            key: 'status', 
            header: 'Status', 
            cell: (row: any) => (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    row.status === 'ACTIVE' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/10'
                }`}>
                    {row.status}
                </span>
            ) 
        },
        { key: 'budget', header: 'Budget', cell: (row: any) => `$${row.budget.toLocaleString()}` },
        { key: 'leads', header: 'Leads Generated', cell: (row: any) => row.leadsGen }
    ];

    return (
        <div className="flex h-full flex-col">
            <PageHeader 
                title="Marketing Campaigns" 
                subtitle="Monitor marketing campaigns and lead generation metrics."
                
            />
            <div className="flex-1 overflow-hidden p-6">
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <DataTable
                        columns={columns}
                        data={campaigns}
                        isLoading={isLoading}
                        keyExtractor={(item: any) => item.id}
                    />
                </div>
            </div>
        </div>
    );
}

