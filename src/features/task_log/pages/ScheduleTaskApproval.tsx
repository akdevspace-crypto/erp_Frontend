import { useState, useMemo } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { DataTable, type Column } from '../../../components/DataTable'
import { FilterSection } from '../../../components/FilterSection'
import { useTasks } from '../hooks/useTasks'
import { useStaff } from '../../hr/hooks/useHR'
import { Drawer } from '../../../components/Drawer'

export function ScheduleTaskApproval() {
    const { data: allTasks = [], isLoading: isLoadingTasks } = useTasks()
    const { data: staffList = [], isLoading: isLoadingStaff } = useStaff()

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

    const getCompletedStatusLabel = (status: string) => {
        if (status === 'APPROVED' || status === 'COMPLETED') return 'Completed'
        if (status === 'IN_PROGRESS') return 'In Progress'
        return 'Pending'
    }

    const getApprovalStatusLabel = (status: string) => {
        if (status === 'APPROVED') return 'Approved'
        if (status === 'COMPLETED') return 'Approval Pending'
        if (status === 'REJECTED') return 'Rejected'
        if (status === 'IN_PROGRESS') return 'In Progress'
        return 'Assigned'
    }

    // Filter to only scheduled tasks
    const scheduledTasks = useMemo(() => allTasks.filter(t => (t as any).type === 'SCHEDULED'), [allTasks])

    const approvalPendingCount = scheduledTasks.filter(t => t.status === 'COMPLETED').length
    const approvedCount = scheduledTasks.filter(t => t.status === 'APPROVED').length
    const rejectedCount = scheduledTasks.filter(t => t.status === 'REJECTED').length

    const tableData = useMemo(() => {
        return scheduledTasks.map(task => {
            const staff = staffList.find(s =>
                s.id === task.assignedStaffId ||
                s.user?.id === task.assigneeId
            )
            return {
                ...task,
                staffName: staff?.name || task.assignedTo,
                staffId: staff?.empId || task.assignedTo,
                dateStr: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date',
            }
        })
    }, [scheduledTasks, staffList])

    const filteredTasks = tableData.filter(t =>
        t.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.staffId.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const columns: Column<any>[] = [
        {
            key: 'sno',
            header: 'S.No',
            cell: (_, index) => <span className="text-gray-500 font-medium text-sm">{index + 1}</span>
        },
        {
            key: 'staffDetails',
            header: 'Staff Details',
            cell: (row) => (
                <div className="flex flex-col text-sm">
                    <span className="font-bold text-gray-900 dark:text-white">{row.staffName}</span>
                    <span className="text-xs text-primary-600">ID: {row.staffId}</span>
                </div>
            )
        },
        {
            key: 'taskDetails',
            header: 'Task Details',
            cell: (row) => <span className="text-sm font-medium text-gray-800">{row.title}</span>
        },
        {
            key: 'taskDueDate',
            header: 'Task Due Date',
            cell: (row) => <span className="text-sm text-gray-600">{row.dateStr}</span>
        },
        {
            key: 'taskCompletedStatus',
            header: 'Task Completed Status',
            cell: (row) => (
                <span className={`text-sm font-bold ${
                    getCompletedStatusLabel(row.status) === 'Completed'
                        ? 'text-green-600'
                        : getCompletedStatusLabel(row.status) === 'In Progress'
                            ? 'text-amber-600'
                            : 'text-gray-500'
                }`}>
                    {getCompletedStatusLabel(row.status)}
                </span>
            )
        },
        {
            key: 'approvalStatus',
            header: 'Approval Status',
            cell: (row) => (
                <span className={`px-2 py-1 text-xs font-bold rounded shadow-sm uppercase
                    ${row.status === 'APPROVED' ? 'bg-green-100 text-green-700' : ''}
                    ${row.status === 'COMPLETED' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${row.status === 'REJECTED' ? 'bg-red-100 text-red-700' : ''}
                    ${row.status === 'ASSIGNED' || row.status === 'IN_PROGRESS' ? 'bg-gray-100 text-gray-700' : ''}
               `}>
                    {getApprovalStatusLabel(row.status)}
                </span>
            )
        },
        {
            key: 'action',
            header: 'Action',
            cell: (row) => (
                <button
                    onClick={() => setSelectedTaskId(row.id)}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-sm transition-colors"
                >
                    View Details
                </button>
            )
        }
    ]

    return (
        <div className="flex flex-col h-full bg-gray-50/50 dark:bg-gray-900">
            <PageHeader
                title="Scheduled Task Approval"
                breadcrumbs={[
                    { label: 'Home' },
                    { label: 'Scheduled Task Approval' }
                ]}
            />

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-4 overflow-hidden">
                {/* 3-Metric Summary Banner */}
                <div className="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200 py-6">
                    <div className="flex justify-center items-center">
                        <span className="text-xl font-medium text-[#007bff]">Approval Pending - {approvalPendingCount.toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex justify-center items-center">
                        <span className="text-xl font-medium text-[#28a745]">Approved - {approvedCount.toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex justify-center items-center">
                        <span className="text-xl font-medium text-[#dc3545]">Rejected - {rejectedCount.toString().padStart(2, '0')}</span>
                    </div>
                </div>

                <div className="p-4">
                    <FilterSection
                        searchQuery={searchQuery}
                        onSearchChange={(e) => setSearchQuery(e.target.value)}
                        searchPlaceholder="Search task by title or staff..."
                    />

                    {isLoadingTasks || isLoadingStaff ? (
                        <div className="animate-pulse bg-white border border-gray-200 shadow-sm rounded-lg h-64 p-6 mt-4">
                            <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <DataTable
                                data={filteredTasks}
                                columns={columns}
                                keyExtractor={(t) => t.id}
                                emptyStateMessage="No data available in table"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Standard Detail Drawer */}
            <Drawer
                isOpen={!!selectedTaskId}
                onClose={() => setSelectedTaskId(null)}
                title="Review Scheduled Task"
            >
                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-6">Task details and workflow actions (Approve/Reject) placeholder.</p>
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <button
                            onClick={() => setSelectedTaskId(null)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Drawer>
        </div>
    )
}
