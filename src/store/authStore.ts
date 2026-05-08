import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
    id: string
    name: string
    email: string
    role: string
    permissions: string[]
    unitAccess: string[]
    unitId?: string
    menuPrivilege?: {
        unitAccessMode?: 'all' | 'individual'
        selectedUnitIds?: string[]
        permissions?: Record<string, { view?: boolean; createUpdate?: boolean }>
    } | null
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    activeUnitId: string | null
    login: (user: User, token: string) => void
    setUser: (user: User | null) => void
    logout: () => void
    setActiveUnitId: (unitId: string | null) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            activeUnitId: null,
            login: (user, token) => set({ user, token, isAuthenticated: true, activeUnitId: user.unitId || null }),
            setUser: (user) => set((state) => ({
                user,
                isAuthenticated: Boolean(user && state.token),
                activeUnitId: user
                    ? (state.activeUnitId && (user.unitAccess.includes('*') || user.unitAccess.includes(state.activeUnitId))
                        ? state.activeUnitId
                        : (user.unitId || state.activeUnitId || null))
                    : null
            })),
            logout: () => set({ user: null, token: null, isAuthenticated: false, activeUnitId: null }),
            setActiveUnitId: (unitId) => set({ activeUnitId: unitId }),
        }),
        {
            name: 'erp-auth-storage',
        }
    )
)
