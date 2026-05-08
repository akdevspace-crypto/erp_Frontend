import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { enquiryService } from '../services/enquiry'
import type { EnquiryFormValues } from '../schema'
import { useToast } from '../../../components/Toast'

export const useEnquiries = () => {
    return useQuery({
        queryKey: ['enquiries'],
        queryFn: enquiryService.getEnquiries,
        retry: false
    })
}

export const useEnquiry = (id: string) => {
    return useQuery({
        queryKey: ['enquiries', id],
        queryFn: () => enquiryService.getEnquiryDetail(id),
        enabled: !!id,
        retry: false
    })
}

export const useAddEnquiry = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: enquiryService.addEnquiry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enquiries'] })
            queryClient.invalidateQueries({ queryKey: ['clients'] })
            toast({ type: 'success', title: 'Success', message: 'Enquiry created successfully' })
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.errors?.[0]?.message ||
                error?.response?.data?.message ||
                error?.message ||
                'Failed to create enquiry'
            console.error('Create enquiry failed:', error?.response?.data || error)
            toast({ type: 'error', title: 'Error', message })
        }
    })
}

export const useUpdateEnquiry = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: EnquiryFormValues }) => enquiryService.updateEnquiry(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enquiries'] })
            toast({ type: 'success', title: 'Success', message: 'Enquiry updated' })
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.errors?.[0]?.message ||
                error?.response?.data?.message ||
                error?.message ||
                'Failed to update enquiry'
            console.error('Update enquiry failed:', error?.response?.data || error)
            toast({ type: 'error', title: 'Error', message })
        }
    })
}

export const useDeleteEnquiry = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: enquiryService.deleteEnquiry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enquiries'] })
            toast({ type: 'success', title: 'Success', message: 'Enquiry deleted' })
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || error?.message || 'Failed to delete';
            toast({ type: 'error', title: 'Error', message });
        }
    })
}

export const useAddFollowUp = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: ({
            id,
            data
        }: {
            id: string
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
        }) => enquiryService.addFollowUp(id, data),
        onSuccess: (result: any) => {
            queryClient.invalidateQueries({ queryKey: ['enquiries'] })
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['allocations'] })
            toast({
                type: 'success',
                title: 'Success',
                message: result?.assignedStaffId
                    ? 'Follow-up assigned to selected staff and notification sent'
                    : 'Follow-up recorded'
            })
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.errors?.[0]?.message ||
                error?.response?.data?.message ||
                error?.message ||
                'Failed to record follow-up'
            console.error('Follow-up failed:', error?.response?.data || error)
            toast({ type: 'error', title: 'Error', message })
        }
    })
}

export const useClients = () => {
    return useQuery({
        queryKey: ['clients'],
        queryFn: enquiryService.getClients,
        retry: false
    })
}
