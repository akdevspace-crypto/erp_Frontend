import { api } from '../../../lib/axios'
import type { HomeCareAllocation } from '../types'

export const allocationService = {
    getHomeCareAllocations: async (): Promise<HomeCareAllocation[]> => {
        const res = await api.get('/allocation/home-care')
        return res.data.data.map((a: any) => ({
            id: a.id,
            service: 'Home Care',
            clientName: a.enquiry?.client?.name || 'Unknown Client',
            status: a.status === 'ALLOCATED' ? 'Allocated' : a.status === 'PENDING' ? 'Pending' : 'Completed',
            contract: 'Monthly',
            staffName: a.staffId ? 'Assigned Staff' : undefined, // Placeholder for staff name resolution
        }))
    },

    getClinicalAllocations: async (): Promise<any[]> => {
        const res = await api.get('/allocation/clinical')
        return res.data.data
    },

    getInHouseAllocations: async (): Promise<any[]> => {
        const res = await api.get('/allocation/in-house')
        return res.data.data
    },
    getOthersAllocations: async (): Promise<any[]> => {
        const res = await api.get('/allocation/others')
        return res.data.data.map((a: any) => ({
            id: a.id,
            service: a.enquiry?.service?.name || 'Others',
            clientName: a.enquiry?.client?.name || 'Unknown Client',
            ref: a.enquiry?.refNo || '-',
            status: a.status === 'ALLOCATED' ? 'Allocated' : a.status === 'PENDING' ? 'Pending' : 'Completed',
            staffName: a.staff
                ? `${a.staff.firstName} ${a.staff.lastName || ''}`.trim()
                : 'Assigned Staff',
        }))
    },

    createAllocation: async (data: any) => {
        const res = await api.post('/allocation', data)
        return res.data.data
    },

    updateAllocation: async ({ id, ...data }: { id: string, [key: string]: any }) => {
        const res = await api.patch(`/allocation/${id}`, data)
        return res.data.data
    }
}
