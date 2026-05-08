import { api } from '../../../lib/axios'
import type { Task } from '../types'
import type { TaskFormValues } from '../schema'

export const taskService = {
    getTasks: async (): Promise<Task[]> => {
        const res = await api.get('/tasks')
        return res.data.data.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description || '',
            createdAt: t.createdAt,
            assigneeId: t.assigneeId ?? t.assignedTo,
            assignedStaffId: t.assignedStaffId || t.assignee?.staff?.id,
            assignedTo: t.assignee?.staff
                ? `${t.assignee.staff.firstName} ${t.assignee.staff.lastName || ''}`.trim()
                : (t.assigneeId ?? t.assignedTo),
            approvalAuthorityId: (t.approvalAuthorityId ?? t.assignedBy) || undefined,
            assignedBy: t.approvalAuthority?.staff
                ? `${t.approvalAuthority.staff.firstName} ${t.approvalAuthority.staff.lastName || ''}`.trim()
                : ((t.approvalAuthorityId ?? t.assignedBy) || 'System'),
            type: t.type || 'DAILY',
            dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
            status: t.status,
            priority: t.priority
        }))
    },
    createTask: async (data: TaskFormValues): Promise<Task> => {
        const res = await api.post('/tasks', data)
        const t = res.data.data
        return {
            id: t.id,
            title: t.title,
            description: t.description || '',
            createdAt: t.createdAt,
            assigneeId: t.assigneeId ?? t.assignedTo,
            assignedStaffId: t.assignedStaffId || t.assignee?.staff?.id,
            assignedTo: t.assignee?.staff
                ? `${t.assignee.staff.firstName} ${t.assignee.staff.lastName || ''}`.trim()
                : (t.assigneeId ?? t.assignedTo),
            approvalAuthorityId: (t.approvalAuthorityId ?? t.assignedBy) || undefined,
            assignedBy: t.approvalAuthority?.staff
                ? `${t.approvalAuthority.staff.firstName} ${t.approvalAuthority.staff.lastName || ''}`.trim()
                : ((t.approvalAuthorityId ?? t.assignedBy) || 'System'),
            type: t.type || 'DAILY',
            dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
            status: t.status,
            priority: t.priority
        }
    },
    updateTaskStatus: async (id: string, status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED'): Promise<Task> => {
        const res = await api.patch(`/tasks/${id}/status`, { status })
        const t = res.data.data
        return {
            id: t.id,
            title: t.title,
            description: t.description || '',
            createdAt: t.createdAt,
            assigneeId: t.assigneeId ?? t.assignedTo,
            assignedStaffId: t.assignedStaffId || t.assignee?.staff?.id,
            assignedTo: t.assignee?.staff
                ? `${t.assignee.staff.firstName} ${t.assignee.staff.lastName || ''}`.trim()
                : (t.assigneeId ?? t.assignedTo),
            approvalAuthorityId: (t.approvalAuthorityId ?? t.assignedBy) || undefined,
            assignedBy: t.approvalAuthority?.staff
                ? `${t.approvalAuthority.staff.firstName} ${t.approvalAuthority.staff.lastName || ''}`.trim()
                : ((t.approvalAuthorityId ?? t.assignedBy) || 'System'),
            type: t.type || 'DAILY',
            dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
            status: t.status,
            priority: t.priority
        }
    }
}
