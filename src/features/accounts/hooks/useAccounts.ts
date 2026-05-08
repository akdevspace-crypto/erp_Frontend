import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountsService } from '../services/accounts'
import { useToast } from '../../../components/Toast'

export const useCashbox = () => {
    return useQuery({
        queryKey: ['cashbox'],
        queryFn: accountsService.getCashbox
    })
}

export const useAddIncome = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: accountsService.addIncome,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cashbox'] })
            toast({ type: 'success', title: 'Success', message: 'Income recorded efficiently' })
        },
        onError: (err: any) => {
            toast({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Failed to record income' })
        }
    })
}

export const useAddExpense = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: accountsService.addExpense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cashbox'] })
            toast({ type: 'success', title: 'Success', message: 'Expense recorded efficiently' })
        },
        onError: (err: any) => {
            toast({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Failed to record expense' })
        }
    })
}

export const useApproveTransaction = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: ({ id, status, comments }: { id: string, status: 'APPROVED' | 'REJECTED', comments?: string }) =>
            accountsService.approveTransaction(id, status, comments),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['cashbox'] })
            toast({ type: 'success', title: 'Workflow Updated', message: `Transaction set to ${variables.status}` })
        },
        onError: () => {
            toast({ type: 'error', title: 'Error', message: 'Failed to action workflow constraint' })
        }
    })
}

export const useUpdateTransaction = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => accountsService.updateTransaction(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cashbox'] })
            toast({ type: 'success', title: 'Success', message: 'Transaction updated successfully' })
        },
        onError: (err: any) => {
            toast({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Failed to update transaction' })
        }
    })
}

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: (id: string) => accountsService.deleteTransaction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cashbox'] })
            toast({ type: 'success', title: 'Deleted', message: 'Transaction removed successfully' })
        },
        onError: (err: any) => {
            toast({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Failed to delete transaction' })
        }
    })
}
