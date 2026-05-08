import { api } from '../../../lib/axios'


export const accountsService = {
    getCashbox: async (): Promise<any[]> => {
        const res = await api.get('/accounts/cashbox')
        return res.data.data.map((t: any) => ({
            id: t.id,
            date: t.date ? new Date(t.date).toISOString().split('T')[0] : new Date(t.createdAt).toISOString().split('T')[0],
            receiptNo: t.refNo,
            clientName: t.clientName || t.notes || 'Unknown',
            category: t.category || t.notes || 'General',
            amount: t.amount,
            mode: t.paymentMode || 'Cash',
            status: t.status,
            type: t.type,
            notes: t.notes,
            recordedBy: 'Admin',
            currentStatus: t.status
        }))
    },

    addIncome: async (data: any): Promise<any> => {
        const res = await api.post('/accounts/income', data)
        return res.data.data
    },

    addExpense: async (data: any): Promise<any> => {
        const res = await api.post('/accounts/expense', data)
        return res.data.data
    },

    approveTransaction: async (id: string, status: 'APPROVED' | 'REJECTED', comments?: string): Promise<any> => {
        const res = await api.put(`/accounts/${id}/approve`, { status, comments })
        const t = res.data.data
        return {
            id: t.id,
            date: t.date ? new Date(t.date).toISOString().split('T')[0] : new Date(t.createdAt).toISOString().split('T')[0],
            receiptNo: t.refNo,
            clientName: t.clientName || t.notes,
            category: t.category || t.notes,
            amount: t.amount,
            mode: t.paymentMode || 'Cash',
            status: t.status,
            type: t.type,
            notes: t.notes,
            recordedBy: 'Admin',
            currentStatus: t.status
        }
    },

    updateTransaction: async (id: string, data: any): Promise<any> => {
        const res = await api.put(`/accounts/${id}`, data)
        return res.data.data
    },

    deleteTransaction: async (id: string): Promise<any> => {
        const res = await api.delete(`/accounts/${id}`)
        return res.data.data
    }
}
