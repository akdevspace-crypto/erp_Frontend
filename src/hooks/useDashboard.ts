import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'

export const useDashboardKPIs = () => {
    return useQuery({
        queryKey: ['dashboard-kpis'],
        queryFn: dashboardService.getKPIs,
        refetchInterval: 60000 // Refresh every minute
    })
}

export const useRecentActivities = () => {
    return useQuery({
        queryKey: ['recent-activities'],
        queryFn: dashboardService.getRecentActivities
    })
}
