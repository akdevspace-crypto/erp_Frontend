import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFundingAllocations, createFundingAllocation, getProjects } from '../fundingServices';
import { PageHeader } from '../../../components/PageHeader';
import { DataTable } from '../../../components/DataTable';
import { Modal } from '../../../components/Modal';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { useToast } from '../../../components/Toast';

export function AllocationManagement() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectId, setProjectId] = useState('');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    const { data: allocations = [], isLoading } = useQuery({
        queryKey: ['fundingAllocations'],
        queryFn: getFundingAllocations
    });

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: getProjects
    });

    const createMutation = useMutation({
        mutationFn: createFundingAllocation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fundingAllocations'] });
            toast({ title: 'Success', message: 'Allocation created', type: 'success' });
            setIsModalOpen(false);
            setProjectId('');
            setAmount('');
            setNotes('');
        },
        onError: (err: any) => {
            toast({ title: 'Error', message: err.message, type: 'error' });
        }
    });

    const columns = [
        { key: 'project', header: 'Project', cell: (row: any) => row.project?.name },
        { key: 'amount', header: 'Amount', cell: (row: any) => row.amount },
        { key: 'notes', header: 'Notes', cell: (row: any) => row.notes || '-' },
        { key: 'status', header: 'Status', cell: (row: any) => row.status }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader title="Funding Allocations" subtitle="Manage UNCF Fund Allocations to Projects" />
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
                >
                    + New Allocation
                </button>
            </div>
            
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <DataTable columns={columns} data={allocations} isLoading={isLoading} keyExtractor={(r: any) => r.id} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Allocation">
                <div className="space-y-4">
                    <Select
                        label="Project *"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        options={projects.map((p: any) => ({ value: p.id, label: p.name }))}
                        placeholder="Select Project..."
                    />
                    <Input label="Amount *" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setIsModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                        <button
                            disabled={createMutation.isPending || !projectId || !amount}
                            onClick={() => createMutation.mutate({ projectId, amount: Number(amount) || 0, notes })}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {createMutation.isPending ? 'Allocating...' : 'Create Allocation'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

