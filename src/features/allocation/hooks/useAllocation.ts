import { useQuery } from '@tanstack/react-query'
import { allocationService } from '../services/allocation'

export const useHomeCareAllocations = () => {
    return useQuery({
        queryKey: ['allocations', 'home-care'],
        queryFn: allocationService.getHomeCareAllocations
    })
}

export const useOthersAllocations = () => {
    return useQuery({
        queryKey: ['allocations', 'others'],
        queryFn: allocationService.getOthersAllocations
    })
}
