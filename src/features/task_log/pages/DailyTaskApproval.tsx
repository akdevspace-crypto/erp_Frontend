import { useState, useMemo } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { DataTable, type Column } from '../../../components/DataTable'
import { FilterSection } from '../../../components/FilterSection'
import { useTasks } from '../hooks/useTasks'
import { useStaff } from '../../hr/hooks/useHR'
import { Drawer } from '../../../components/Drawer'

export function DailyTaskApproval() {
    const { data: allTasks = [], isLoading: isLoadingTasks } = useTasks()
    const { data: staffList = [], isLoading: isLoadingStaff } = useStaff()

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

    const dailyTasks = useMemo(() => allTasks.filter(t => (t as any).type === 'DAILY'), [allTasks])
    const scheduledCompletedCount = useMemo(
        () => allTasks.filter(t => t.type === 'SCHEDULED' && t.status === 'COMPLETED').length,
        [allTasks]
    )

    const approvalPendingCount = dailyTasks.filter(t => t.status === 'COMPLETED').length
    const rejectedCount = dailyTasks.filter(t => t.status === 'REJECTED').length

    const groupedStaffTasks = useMemo(() => {
        const groups: Record<string, { staffId: string, staffName: string, date: string, tasks: any[], status: string }> = {}

        dailyTasks.forEach(task => {
            if (task.status === 'APPROVED') return

            const staff = staffList.find(s =>
                s.id === task.assignedStaffId ||
                s.user?.id === task.assigneeId
            )
            const staffName = staff?.name || task.assignedTo

            const dateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'
            const groupStaffId = staff?.empId || task.assignedTo
            const key = `${groupStaffId}-${dateStr}`

            let status = 'Assigned'
            if (task.status === 'COMPLETED') status = 'Approval Pending'
            else if (task.status === 'IN_PROGRESS') status = 'In Progress'
            else if (task.status === 'REJECTED') status = 'Rejected'

            if (!groups[key]) {
                groups[key] = {
                    staffId: groupStaffId,
                    staffName,
                    date: dateStr,
                    tasks: [],
                    status
                }
            }
            groups[key].tasks.push(task)
            if (groups[key].status !== 'Approval Pending' && status === 'Approval Pending') {
                groups[key].status = status
            } else if (groups[key].status === 'Assigned' && status === 'In Progress') {
                groups[key].status = status
            }
        })

        return Object.values(groups)
    }, [dailyTasks, staffList])

    const filteredGroups = groupedStaffTasks.filter(g =>
        g.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.staffId.toLowerCase().includes(searchQuery.toLowerCase())
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
            key: 'taskDate',
            header: 'Task Date',
            cell: (row) => <span className="text-sm font-medium text-gray-800">{row.date}</span>
        },
        {
            key: 'totalTask',
            header: 'Total Task',
            cell: (row) => <span className="text-sm font-bold text-gray-900">{row.tasks.length}</span>
        },
        {
            key: 'approvalStatus',
            header: 'Approval Status',
            cell: (row) => (
                <span className={`px-2 py-1 text-xs font-bold rounded shadow-sm uppercase ${
                    row.status === 'Approval Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : row.status === 'In Progress'
                            ? 'bg-gray-100 text-gray-700'
                            : row.status === 'Rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                }`}>
                    {row.status}
                </span>
            )
        },
        {
            key: 'action',
            header: 'Action',
            cell: (row) => (
                <button
                    onClick={() => setSelectedGroupId(`${row.staffId}-${row.date}`)}
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
                title="Daily Task Approval"
                breadcrumbs={[
                    { label: 'Home' },
                    { label: 'Daily Task Approval' }
                ]}
            />

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-4 overflow-hidden">
                {/* Summary Banner */}
                <div className="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200 py-6">
                    <div className="flex justify-center items-center">
                        <span className="text-xl font-medium text-blue-600">Approval Pending - {approvalPendingCount.toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex justify-center items-center">
                        <span className="text-xl font-medium text-red-500">Rejected - {rejectedCount.toString().padStart(2, '0')}</span>
                    </div>
                </div>

                <div className="p-4">
                    <FilterSection
                        searchQuery={searchQuery}
                        onSearchChange={(e) => setSearchQuery(e.target.value)}
                        searchPlaceholder="Search..."
                    />

                    {isLoadingTasks || isLoadingStaff ? (
                        <div className="animate-pulse bg-white border border-gray-200 shadow-sm rounded-lg h-64 p-6 mt-4">
                            <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <DataTable
                                data={filteredGroups}
                                columns={columns}
                                keyExtractor={(g) => `${g.staffId}-${g.date}`}
                                emptyStateMessage={
                                    dailyTasks.length === 0 && scheduledCompletedCount > 0
                                        ? `No daily tasks found. ${scheduledCompletedCount} completed scheduled task(s) are available in Scheduled Task Approval.`
                                        : 'No daily task data available in table'
                                }
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Standard Detail Drawer */}
            <Drawer
                isOpen={!!selectedGroupId}
                onClose={() => setSelectedGroupId(null)}
                title="Review Tasks"
            >
                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-6">Staff member's tasks placeholder logic for approval execution.</p>
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <button
                            onClick={() => setSelectedGroupId(null)}
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
