import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerCareService } from '../services/customer_care'
import { useToast } from '../../../components/Toast'

export const useComplaints = () => {
    return useQuery({
        queryKey: ['complaints'],
        queryFn: customerCareService.getComplaints
    })
}

export const useCreateComplaint = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: customerCareService.createComplaint,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] })
            toast({ type: 'success', title: 'Ticket Created', message: 'Complaint successfully logged' })
        },
        onError: () => {
            toast({ type: 'error', title: 'Error', message: 'Failed to log complaint' })
        }
    })
}
