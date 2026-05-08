export interface Staff {
    id: string
    empId: string
    name: string
    photoUrl?: string
    role: string
    department: string
    unitId: string
    phone: string
    email: string
    joiningDate: string
    status: 'Active' | 'On Leave' | 'Terminated' | string
    isDeleted?: boolean
    deletedAt?: string
    metadata?: Record<string, any>
    aadhaarDocument?: File | null
    resumeDocument?: File | null
    user?: {
        id: string
        email: string
        isActive: boolean
        role?: {
            id: string
            name: string
        }
    }
}

export interface RolePermission {
    role: string
    modules: {
        [moduleName: string]: {
            create: boolean
            read: boolean
            update: boolean
            delete: boolean
        }
    }
}
