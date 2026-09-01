// @ts-nocheck
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LogOut, Search, FileText, CheckCircle } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { api } from '../../../lib/axios';
import { DataTable } from '../../../components/DataTable';
import { ClosureDialog } from '../components/ClosureDialog';

export default function Discharge() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
    const [isClosureOpen, setIsClosureOpen] = useState(false);

    const { data: admissions, isLoading } = useQuery({
        queryKey: ['admissions'],
        queryFn: async () => {
            const res = await api.get('/operations/admissions');
            return res.data?.data || [];
        }
    });

    const filteredAdmissions = admissions?.filter((a: any) => {
        const patientName = a.patient?.name?.toLowerCase() ?? '';
        const status = a.status?.toLowerCase() ?? '';
        const search = searchTerm.toLowerCase();

        return patientName.includes(search) || status.includes(search);
    }) || [];

    const { data: historyClosures, isLoading: isLoadingHistory, isError: isHistoryError } = useQuery({
        queryKey: ['closures', 'history'],
        queryFn: async () => {
            const res = await api.get('/closing-agreements?status=EXECUTED');
            return res.data?.data || [];
        }
    });

    const filteredHistory = historyClosures?.filter((c: any) => {
        const patientName = c.admission?.patient?.name?.toLowerCase() ?? '';
        const search = searchTerm.toLowerCase();
        return patientName.includes(search);
    }) || [];

    const handleActionClick = (admission: any) => {
        setSelectedAdmission(admission);
        setIsClosureOpen(true);
    };

    const columns = [
        {
            key: 'patientName',
            header: 'Patient Name',
            cell: (row: any) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{row.patient?.name}</div>
                    <div className="text-xs text-gray-500">{row.patient?.phone}</div>
                </div>
            )
        },
        {
            key: 'admittedAt',
            header: 'Admission Date',
            cell: (row: any) => new Date(row.admittedAt).toLocaleDateString()
        },
        {
            key: 'location',
            header: 'Location',
            cell: (row: any) => `${row.floor || '-'} / ${row.room || '-'} / ${row.bed || '-'}`
        },
        {
            key: 'status',
            header: 'Status',
            cell: (row: any) => (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    {row.status.replace(/_/g, ' ')}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            cell: (row: any) => {
                if (row.status === 'DISCHARGED') {
                    return <span className="text-gray-400 text-sm">Discharged</span>;
                }

                return (
                    <button
                        onClick={() => handleActionClick(row)}
                        className="flex items-center gap-1 rounded-md bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-teal-700"
                    >
                        <FileText className="h-3.5 w-3.5" />
                        Manage Closure
                    </button>
                );
            }
        }
    ];

    const historyColumns = [
        {
            key: 'patientName',
            header: 'Patient Name',
            cell: (row: any) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{row.admission?.patient?.name}</div>
                    <div className="text-xs text-gray-500">{row.admission?.patient?.phone}</div>
                </div>
            )
        },
        {
            key: 'admittedAt',
            header: 'Admission Date',
            cell: (row: any) => new Date(row.admission?.admittedAt).toLocaleDateString()
        },
        {
            key: 'updatedAt',
            header: 'Discharged Date',
            cell: (row: any) => new Date(row.updatedAt).toLocaleDateString()
        },
        {
            key: 'medicalCleared',
            header: 'Medical',
            cell: (row: any) => row.medicalCleared ? <span className="text-green-600 flex items-center text-xs"><CheckCircle className="h-3 w-3 mr-1"/> Cleared</span> : <span className="text-gray-400 text-xs">Pending</span>
        },
        {
            key: 'financeCleared',
            header: 'Finance',
            cell: (row: any) => row.financeCleared ? <span className="text-green-600 flex items-center text-xs"><CheckCircle className="h-3 w-3 mr-1"/> Cleared</span> : <span className="text-gray-400 text-xs">Pending</span>
        },
        {
            key: 'assetCleared',
            header: 'Asset',
            cell: (row: any) => row.assetCleared ? <span className="text-green-600 flex items-center text-xs"><CheckCircle className="h-3 w-3 mr-1"/> Cleared</span> : <span className="text-gray-400 text-xs">Pending</span>
        },
        {
            key: 'status',
            header: 'Status',
            cell: (row: any) => (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <div className="flex-1 overflow-auto bg-gray-50/50 p-6 dark:bg-[#0A2429]">
            <PageHeader
                title="Service Closure"
                description="Manage patient discharge workflows and closing agreements"
                icon={<LogOut className="h-6 w-6 text-teal-600" />}
            />

            <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#6DA5C0]/20 dark:bg-[#0B2A30]">
                <div className="border-b border-gray-200 p-4 dark:border-[#6DA5C0]/20">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800/50">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'pending'
                                        ? 'bg-white text-teal-700 shadow-sm dark:bg-gray-700 dark:text-teal-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                Pending Discharges
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'history'
                                        ? 'bg-white text-teal-700 shadow-sm dark:bg-gray-700 dark:text-teal-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                Discharge History
                            </button>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search patients..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-[#6DA5C0]/20 dark:bg-[#0A2429] dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    {activeTab === 'pending' ? (
                        <DataTable
                            columns={columns}
                            data={filteredAdmissions}
                            isLoading={isLoading}
                            emptyStateMessage="No pending discharges"
                        />
                    ) : (
                        isHistoryError ? (
                            <div className="py-12 text-center text-red-600 dark:text-red-400">
                                <p>Unable to load discharge history.</p>
                            </div>
                        ) : (
                            <DataTable
                                columns={historyColumns}
                                data={filteredHistory}
                                isLoading={isLoadingHistory}
                                emptyStateMessage="No discharge history available"
                            />
                        )
                    )}
                </div>
            </div>

            <ClosureDialog
                isOpen={isClosureOpen}
                onClose={() => setIsClosureOpen(false)}
                admission={selectedAdmission}
            />
        </div>
    );
}
