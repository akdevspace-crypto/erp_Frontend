import { api } from '../../../lib/axios'
import type { Complaint } from '../types'
import type { ComplaintFormValues } from '../schema'

export const customerCareService = {
    getComplaints: async (): Promise<Complaint[]> => {
        const res = await api.get('/customer-care/complaints')
        return res.data.data.map((c: any) => ({
            id: c.id,
            ticketNo: c.ticketNo,
            date: new Date(c.createdAt).toISOString().split('T')[0],
            clientName: c.clientName,
            category: c.category,
            priority: c.priority,
            status: c.status,
            description: c.description,
            assignedTo: c.assignedTo || undefined,
            unitId: c.unitId || 'U-001'
        }))
    },
    createComplaint: async (data: ComplaintFormValues): Promise<Complaint> => {
        const res = await api.post('/customer-care/complaints', data)
        const c = res.data.data
        return {
            id: c.id,
            ticketNo: c.ticketNo,
            date: new Date(c.createdAt).toISOString().split('T')[0],
            clientName: c.clientName,
            category: c.category,
            priority: c.priority,
            status: c.status,
            description: c.description,
            assignedTo: c.assignedTo || undefined,
            unitId: c.unitId || 'U-001'
        }
    }
}
