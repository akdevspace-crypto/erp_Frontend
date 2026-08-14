// @ts-nocheck
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut, CheckCircle, Search, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { api } from '../../../lib/axios';
import { DataTable } from '../../../components/DataTable';
import { ApprovalDialog } from '../../../components/ApprovalDialog';

const DISCHARGE_STATUSES = [
    'ACTIVE',
    'DISCHARGE_REQUESTED',
    'MEDICAL_CLEARED',
    'FINANCE_CLEARED',
    'ASSET_CLEARED',
    'DISCHARGED'
];

export default function Discharge() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
    const [isApprovalOpen, setIsApprovalOpen] = useState(false);

    const { data: admissions, isLoading } = useQuery({
        queryKey: ['admissions'],
        queryFn: async () => {
            const res = await api.get('/operations/admissions');
            return res.data?.data || [];
        }
    });

    const dischargeMutation = useMutation({
        mutationFn: async ({ id, status, remarks }: { id: string; status: string; remarks: string }) => {
            await api.post(`/operations/admissions/${id}/discharge`, { status, remarks });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
            setIsApprovalOpen(false);
            setSelectedAdmission(null);
        }
    });

    const filteredAdmissions = admissions?.filter((a: any) => 
        a.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.status.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const getNextStatus = (currentStatus: string) => {
        const idx = DISCHARGE_STATUSES.indexOf(currentStatus);
        if (idx >= 0 && idx < DISCHARGE_STATUSES.length - 1) {
            return DISCHARGE_STATUSES[idx + 1];
        }
        return null;
    };

    const handleActionClick = (admission: any) => {
        setSelectedAdmission(admission);
        setIsApprovalOpen(true);
    };

    const handleApprove = (comments: string) => {
        if (!selectedAdmission) return;
        const nextStatus = getNextStatus(selectedAdmission.status);
        if (nextStatus) {
            dischargeMutation.mutate({ id: selectedAdmission.id, status: nextStatus, remarks: comments });
        }
    };

    const columns = [
        {
            key: 'patientName',
            header: 'Patient Name',
            render: (row: any) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{row.patient?.name}</div>
                    <div className="text-xs text-gray-500">{row.patient?.phone}</div>
                </div>
            )
        },
        {
            key: 'admittedAt',
            header: 'Admission Date',
            render: (row: any) => new Date(row.admittedAt).toLocaleDateString()
        },
        {
            key: 'location',
            header: 'Location',
            render: (row: any) => `${row.floor || '-'} / ${row.room || '-'} / ${row.bed || '-'}`
        },
        {
            key: 'status',
            header: 'Discharge Status',
            render: (row: any) => (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    {row.status.replace(/_/g, ' ')}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: any) => {
                const nextStatus = getNextStatus(row.status);
                if (!nextStatus) return <span className="text-gray-400 text-sm">Completed</span>;

                return (
                    <button
                        onClick={() => handleActionClick(row)}
                        className="flex items-center gap-1 rounded-md bg-[#0F969C] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0A7075]"
                    >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Move to {nextStatus.replace(/_/g, ' ')}
                    </button>
                );
            }
        }
    ];

    return (
        <div className="flex-1 overflow-auto bg-gray-50/50 p-6 dark:bg-[#0A2429]">
            <PageHeader
                title="Discharge Management"
                description="Manage patient discharge workflow and clearances"
                icon={<LogOut className="h-6 w-6 text-[#0F969C]" />}
            />

            <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#6DA5C0]/20 dark:bg-[#0B2A30]">
                <div className="border-b border-gray-200 p-4 dark:border-[#6DA5C0]/20">
                    <div className="flex items-center justify-between">
                        <div className="relative max-w-md w-full">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by patient name or status..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm focus:border-[#0F969C] focus:outline-none focus:ring-1 focus:ring-[#0F969C] dark:border-[#6DA5C0]/20 dark:bg-[#0A2429] dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <DataTable
                        columns={columns}
                        data={filteredAdmissions}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            <ApprovalDialog
                isOpen={isApprovalOpen}
                onClose={() => setIsApprovalOpen(false)}
                title="Update Discharge Status"
                entityName={selectedAdmission ? `Status to ${getNextStatus(selectedAdmission.status)}` : ''}
                onApprove={handleApprove}
                isProcessing={dischargeMutation.isPending}
            />
        </div>
    );
}

