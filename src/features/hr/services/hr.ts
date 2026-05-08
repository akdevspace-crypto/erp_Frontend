import { api } from '../../../lib/axios'
import type { Staff } from '../types'
import type { StaffFormValues } from '../schema'

const mapStaff = (s: any): Staff => ({
    id: s.id,
    empId: s.empId,
    name: `${s.firstName} ${s.lastName || ''}`.trim(),
    photoUrl: s.photoUrl || undefined,
    role: s.designation || 'Unassigned',
    department: s.department || 'General',
    unitId: s.unitId,
    phone: s.phone || '',
    email: s.email || '',
    joiningDate: s.joiningDate ? new Date(s.joiningDate).toISOString().split('T')[0] : new Date(s.createdAt).toISOString().split('T')[0],
    status: s.status,
    isDeleted: Boolean(s.isDeleted),
    deletedAt: s.deletedAt || undefined,
    metadata: s.metadata || undefined,
    user: s.user
})

const appendIfPresent = (formData: FormData, key: string, value: unknown) => {
    if (value === undefined || value === null || value === '') return
    formData.append(key, value instanceof Blob ? value : String(value))
}

const toStaffFormData = (data: StaffFormValues) => {
    const formData = new FormData()
    const [firstName, ...lastNames] = data.name.split(' ')

    appendIfPresent(formData, 'empId', data.empId)
    appendIfPresent(formData, 'photoUrl', data.photoUrl)
    appendIfPresent(formData, 'firstName', firstName)
    appendIfPresent(formData, 'lastName', lastNames.join(' '))
    appendIfPresent(formData, 'designation', data.role)
    appendIfPresent(formData, 'department', data.department)
    appendIfPresent(formData, 'email', data.email)
    appendIfPresent(formData, 'phone', data.phone)
    appendIfPresent(formData, 'unitId', data.unitId)
    appendIfPresent(formData, 'status', data.status)
    appendIfPresent(formData, 'joiningDate', data.joiningDate ? new Date(data.joiningDate).toISOString() : '')
    appendIfPresent(formData, 'createLogin', data.createLogin ? 'true' : '')
    appendIfPresent(formData, 'loginEmail', data.loginEmail)
    appendIfPresent(formData, 'loginPassword', data.loginPassword)
    appendIfPresent(formData, 'loginRoleId', data.loginRoleId)
    appendIfPresent(formData, 'roleId', data.loginRoleId || data.roleId)

    formData.append('metadata', JSON.stringify(data.metadata || {}))

    if (data.aadhaarDocument instanceof File) {
        formData.append('aadhaarDocument', data.aadhaarDocument)
    }

    if (data.resumeDocument instanceof File) {
        formData.append('resumeDocument', data.resumeDocument)
    }

    return formData
}

export const hrService = {
    getStaff: async (): Promise<Staff[]> => {
        const res = await api.get('/hr/staff')
        return res.data.data.map(mapStaff)
    },

    getStaffList: async (options?: { includeFormer?: boolean }): Promise<Staff[]> => {
        const res = await api.get('/hr/staff', {
            params: options?.includeFormer ? { includeFormer: true } : undefined
        })
        return res.data.data.map(mapStaff)
    },

    getAttendanceLogs: async (options?: { date?: string }): Promise<Array<{
        id: string
        date: string
        empId: string
        name: string
        checkIn: string
        checkOut: string
        status: string
    }>> => {
        const res = await api.get('/hr/attendance', {
            params: options?.date ? { date: options.date } : undefined
        })
        return res.data.data || []
    },

    addStaff: async (data: StaffFormValues): Promise<Staff> => {
        const res = await api.post('/hr/staff', toStaffFormData(data))
        return mapStaff(res.data.data)
    },

    getRoles: async (): Promise<Array<{ id: string; name: string }>> => {
        const res = await api.get('/hr/roles')
        return res.data.data || []
    },

    createStaffLogin: async (staffId: string, data: { email: string; password: string; roleId: string }): Promise<Staff> => {
        const res = await api.post(`/staff/${staffId}/create-login`, data)
        return mapStaff(res.data.data)
    },

    updateStaff: async (staffId: string, data: StaffFormValues): Promise<Staff> => {
        const res = await api.put(`/hr/staff/${staffId}`, toStaffFormData(data))
        return mapStaff(res.data.data)
    },

    updateStaffPrivilege: async (staffId: string, data: { loginEnabled: boolean; roleId: string; email?: string; password?: string; forceLogout?: boolean }) => {
        const res = await api.patch(`/hr/staff/${staffId}/privilege`, data)
        return res.data.data
    },

    updateStaffMenuPrivilege: async (staffId: string, data: {
        unitAccessMode: 'all' | 'individual'
        selectedUnitIds: string[]
        permissions: Record<string, { view: boolean; createUpdate: boolean }>
    }) => {
        const res = await api.patch(`/hr/staff/${staffId}/menu-privilege`, data)
        return res.data.data
    },

    deleteStaff: async (staffId: string): Promise<void> => {
        await api.delete(`/hr/staff/${staffId}`)
    },

    getJobApplications: async (): Promise<any[]> => {
        const res = await api.get('/hr/job-applications')
        return res.data.data
    },
    createJobApplication: async (data: any): Promise<any> => {
        const res = await api.post('/hr/job-applications', data)
        return res.data.data
    },
    updateJobApplication: async (id: string, data: any): Promise<any> => {
        const res = await api.put(`/hr/job-applications/${id}`, data)
        return res.data.data
    },
    deleteJobApplication: async (id: string): Promise<void> => {
        await api.delete(`/hr/job-applications/${id}`)
    }
}
