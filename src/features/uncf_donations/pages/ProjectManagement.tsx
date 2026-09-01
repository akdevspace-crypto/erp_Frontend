import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, createProject } from '../fundingServices';
import { PageHeader } from '../../../components/PageHeader';
import { DataTable } from '../../../components/DataTable';
import { Modal } from '../../../components/Modal';
import { Input } from '../../../components/Input';
import { useToast } from '../../../components/Toast';

export function ProjectManagement() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [totalBudget, setTotalBudget] = useState('');

    const { data: projects = [], isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: getProjects
    });

    const createMutation = useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast({ title: 'Success', message: 'Project created', type: 'success' });
            setIsModalOpen(false);
            setName('');
            setTotalBudget('');
        },
        onError: (err: any) => {
            toast({ title: 'Error', message: err.message, type: 'error' });
        }
    });

    const columns = [
        { key: 'name', header: 'Project Name', cell: (row: any) => row.name },
        { key: 'status', header: 'Status', cell: (row: any) => row.status },
        { key: 'totalBudget', header: 'Total Budget', cell: (row: any) => row.totalBudget }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader title="Project Management" subtitle="Manage UNCF Foundation Projects" />
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
                >
                    + New Project
                </button>
            </div>
            
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <DataTable columns={columns} data={projects} isLoading={isLoading} keyExtractor={(r: any) => r.id} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
                <div className="space-y-4">
                    <Input label="Project Name *" value={name} onChange={(e) => setName(e.target.value)} />
                    <Input label="Total Budget *" type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} />
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setIsModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                        <button
                            disabled={createMutation.isPending || !name}
                            onClick={() => createMutation.mutate({ name, totalBudget: Number(totalBudget) || 0, status: 'PLANNED' })}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {createMutation.isPending ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

