import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { canAccessPath, hasPermissionAccess } from '../lib/access'

interface ProtectedRouteProps {
    requiredPermissions?: string[]
}

export function ProtectedRoute({ requiredPermissions }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuthStore()
    const location = useLocation()

    if (!isAuthenticated || !user) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />
    }

    // Basic RBAC check if requiredPermissions are passed at route level
    if (requiredPermissions && requiredPermissions.length > 0) {
        const hasPermission = hasPermissionAccess(user, requiredPermissions)

        if (!hasPermission) {
            return <Navigate to="/dashboard" replace />
        }
    }

    if (!canAccessPath(user, location.pathname)) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}
