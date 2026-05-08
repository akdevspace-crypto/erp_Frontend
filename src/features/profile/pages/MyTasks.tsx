import { useMemo } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { Play, CheckSquare } from 'lucide-react'
import type { Task } from '../../task_log/types'
import { useTasks, useUpdateTaskStatus } from '../../task_log/hooks/useTasks'
import { useAutomationTasks, useUpdateAutomationTaskStatus } from '../../automation/hooks/useAutomation'
import { useAuthStore } from '../../../store/authStore'
import { Phone, AlertCircle } from 'lucide-react'

export function MyTasks() {
    const currentUserId = useAuthStore((state) => state.user?.id)
    const { data: allTasks = [], isLoading: tasksLoading } = useTasks()
    const { data: realAutomationTasks = [] } = useAutomationTasks()

    // For testing/demo purposes, add mock data if none exists
    const automationTasks = useMemo(() => {
        if (realAutomationTasks.length > 0) return realAutomationTasks;
        return [
            {
                id: 'mock-1',
                entityId: 'leads-123',
                module: 'enquiry',
                taskType: 'IMMEDIATE_CALL',
                description: '🚨 HOT Lead: Smith (Enquiry #123) requires an immediate call!',
                status: 'PENDING',
                priority: 10,
                createdAt: new Date().toISOString()
            }
        ];
    }, [realAutomationTasks]);
    const updateTaskStatus = useUpdateTaskStatus()
    const updateAutoStatus = useUpdateAutomationTaskStatus()

    const startTask = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        updateTaskStatus.mutate({ id, status: 'IN_PROGRESS' })
    }

    const completeTask = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        updateTaskStatus.mutate({ id, status: 'COMPLETED' })
    }

    const handleCall = (taskId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        // In a real system, this would trigger a VoIP call
        alert("Initiating call system...")
        updateAutoStatus.mutate({ id: taskId, status: 'IN_PROGRESS' })
    }

    const completeAutoTask = (taskId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        updateAutoStatus.mutate({ id: taskId, status: 'COMPLETED' })
    }

    const data = useMemo(
        () => allTasks.filter((task) => Boolean(currentUserId) && task.assigneeId === currentUserId),
        [allTasks, currentUserId]
    )

    const getPriorityClasses = (priority?: string) => {
        if (priority === 'HIGH' || priority === 'High') return 'text-red-700 bg-red-100'
        if (priority === 'MEDIUM' || priority === 'Medium') return 'text-yellow-700 bg-yellow-100'
        return 'text-blue-700 bg-blue-100'
    }

    const columns: Column<Task>[] = [
        { key: 'title', header: 'Task Title', sortable: true },
        { key: 'assignedBy', header: 'Assigned By' },
        { key: 'dueDate', header: 'Due Date', sortable: true },
        {
            key: 'priority', header: 'Priority', cell: (t) => (
                <span className={`px-2 py-1 text-xs font-semibold ${getPriorityClasses(t.priority)}`}>
                    {t.priority}
                </span>
            )
        },
        { key: 'status', header: 'Status', cell: (t) => <StatusHighlighter value={t.status} /> }
    ]

    return (
        <div className="flex flex-col h-full space-y-6">
            <PageHeader title="My Daily Tasks" breadcrumbs={[{ label: 'Profile' }, { label: 'My Tasks' }]} />

            {/* Compact Immediate Automation Actions */}
            {automationTasks.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-orange-900/10 border-l-4 border-orange-500 p-3 rounded-r-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-600 animate-pulse" />
                            <h2 className="text-sm font-black text-orange-800 dark:text-orange-300 uppercase tracking-widest">Escalated Leads (Call Now)</h2>
                        </div>
                        <span className="text-[10px] bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded-full font-bold">
                            {automationTasks.length} PENDING
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {automationTasks.map((task) => (
                            <div key={task.id} className="flex-1 min-w-[300px] bg-white dark:bg-gray-800 p-3 rounded-md border border-orange-200 dark:border-orange-800 flex justify-between items-center group transition-all hover:shadow-md">
                                <div className="flex items-center gap-3">
                                    <div className="bg-orange-100 dark:bg-orange-900/50 p-2 rounded-full">
                                        <Phone className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100">{task.description.split(':')[0]}</h4>
                                        <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-1">{task.description.split(':')[1] || task.description}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    {task.status === 'PENDING' ? (
                                        <button
                                            onClick={(e) => handleCall(task.id, e)}
                                            className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] px-3 py-1.5 rounded font-black uppercase transition-all active:scale-95 shadow-sm flex items-center gap-1"
                                        >
                                            <Phone className="h-3 w-3" />
                                            Call
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => completeAutoTask(task.id, e)}
                                            className="bg-green-600 hover:bg-green-700 text-white text-[10px] px-3 py-1.5 rounded font-black uppercase transition-all shadow-sm"
                                        >
                                            Done
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <DataTable
                data={data.filter(t => !['COMPLETED', 'APPROVED', 'Completed', 'Verified'].includes(t.status))}
                columns={columns}
                keyExtractor={(t) => t.id}
                isLoading={tasksLoading}
                emptyStateMessage="You have no pending tasks."
                actions={(t) => (
                    <>
                        {(t.status === 'ASSIGNED' || t.status === 'Pending') && (
                            <button onClick={(e) => startTask(t.id, e)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Start Task: Updates status to In Progress">
                                <Play className="h-4 w-4" />
                            </button>
                        )}
                        {(t.status === 'IN_PROGRESS' || t.status === 'In Progress') && (
                            <button onClick={(e) => completeTask(t.id, e)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Complete Task: Updates status and requests verification">
                                <CheckSquare className="h-4 w-4" />
                            </button>
                        )}
                    </>
                )}
            />

            <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Recently Completed</h3>
                <DataTable
                    data={data.filter(t => ['COMPLETED', 'APPROVED', 'Completed', 'Verified'].includes(t.status))}
                    columns={columns}
                    keyExtractor={(t) => t.id}
                    isLoading={tasksLoading}
                    emptyStateMessage="No recently completed tasks."
                />
            </div>
        </div>
    )
}
