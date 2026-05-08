import { api } from '../../../lib/axios'
import type { Enquiry, Client } from '../types'
import type { EnquiryFormValues } from '../schema'

const mapBackendStatusToUi = (status: string, isConverted?: boolean): Enquiry['status'] => {
    if (status === 'IN_PROGRESS' || status === 'FOLLOW_UP') return 'In Progress'
    if (status === 'CLOSED') return isConverted ? 'Converted' : 'Lost'
    return 'Open'
}

export const enquiryService = {
    getEnquiries: async (): Promise<Enquiry[]> => {
        const response = await api.get('/enquiry')
        return response.data.data.map((e: any) => ({
            id: e.id,
            refNo: e.refNo,
            createdAt: e.createdAt,
            unitId: e.unitId,
            serviceId: e.serviceId || e.service?.id || '',
            service: e.service?.name || 'Standard',
            serviceCategory: e.service?.category || '',
            mode: e.mode || 'Digital',
            source: e.source || 'Website',
            clientName: e.client?.name || 'Unknown',
            mobile: e.client?.mobile || 'N/A',
            email: e.client?.email || 'N/A',
            comments: e.description || '',
            status: mapBackendStatusToUi(e.status, e.isConverted),
            patientName: e.patientName || '',
            patientAge: e.patientAge || '',
            patientGender: e.patientGender || '',
            patientHealthCondition: e.patientHealthCondition || '',
            clientAddress: e.clientAddress || e.client?.address || '',
            clientLocation: e.clientLocation || '',
            remarks: e.remarks || '',
            lastFollowUp: e.followUps?.[0]?.scheduledAt || null,
            lastFollowedBy: e.allocation?.staff
                ? `${e.allocation.staff.firstName} ${e.allocation.staff.lastName || ''}`.trim()
                : (e.followUps?.[0]?.user?.firstName || 'Agent'),
            automationScore: typeof e.automationScore === 'number' ? e.automationScore : 0,
            automationPriority: e.automationPriority || 'COLD'
        }))
    },

    getEnquiryDetail: async (id: string): Promise<Enquiry> => {
        const response = await api.get(`/enquiry/${id}`)
        const e = response.data.data
        return {
            id: e.id,
            refNo: e.refNo,
            createdAt: e.createdAt,
            unitId: e.unitId,
            serviceId: e.serviceId || e.service?.id || '',
            service: e.service?.name || 'Standard',
            serviceCategory: e.service?.category || '',
            mode: e.mode || 'Digital',
            source: e.source || 'Website',
            clientName: e.client?.name || 'Unknown',
            mobile: e.client?.mobile || 'N/A',
            email: e.client?.email || 'N/A',
            comments: e.description || '',
            status: mapBackendStatusToUi(e.status, e.isConverted),
            patientName: e.patientName || '',
            patientAge: e.patientAge || '',
            patientGender: e.patientGender || '',
            patientHealthCondition: e.patientHealthCondition || '',
            clientAddress: e.clientAddress || e.client?.address || '',
            clientLocation: e.clientLocation || '',
            remarks: e.remarks || '',
            lastFollowUp: e.followUps?.[0]?.scheduledAt || null,
            lastFollowedBy: e.allocation?.staff
                ? `${e.allocation.staff.firstName} ${e.allocation.staff.lastName || ''}`.trim()
                : (e.followUps?.[0]?.user?.firstName || 'Agent'),
            automationScore: typeof e.automationScore === 'number' ? e.automationScore : 0,
            automationPriority: e.automationPriority || 'COLD'
        }
    },

    addEnquiry: async (data: EnquiryFormValues): Promise<Enquiry> => {
        const response = await api.post('/enquiry', data)
        return response.data.data
    },

    updateEnquiry: async (id: string, data: EnquiryFormValues): Promise<Enquiry> => {
        const response = await api.put(`/enquiry/${id}`, data)
        return response.data.data
    },

    deleteEnquiry: async (id: string): Promise<void> => {
        await api.delete(`/enquiry/${id}`)
    },

    addFollowUp: async (
        id: string,
        data: {
            notes: string
            nextDate: string
            staffId?: string
            channel?: string
            outcome?: string
            attachmentName?: string
            clientInterest?: string
            readyToPayAmount?: number
            paymentMode?: string
            nextFollowupStatus?: string
        }
    ): Promise<Enquiry> => {
        const response = await api.post(`/enquiry/${id}/follow-up`, data)
        return response.data.data
    },

    getClients: async (): Promise<Client[]> => {
        try {
            const response = await api.get('/clients')
            return response.data.data
        } catch (error) {
            // Fallback for when endpoints are still under construction
            console.warn('Clients endpoint pending.')
            return []
        }
    }
}
