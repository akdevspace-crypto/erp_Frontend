export interface Enquiry {
    id: string
    refNo: string
    createdAt: string
    unitId: string
    serviceId?: string
    service: string
    mode: string
    clientName: string
    mobile: string
    email?: string
    comments?: string
    status: 'Open' | 'In Progress' | 'Converted' | 'Lost'
    patientName?: string
    patientAge?: string
    patientGender?: string
    patientHealthCondition?: string
    clientAddress?: string
    clientLocation?: string
    remarks?: string
    lastFollowUp?: string
    serviceCategory?: string
    source?: string
    lastFollowedBy?: string
    automationScore?: number
    automationPriority?: 'HOT' | 'WARM' | 'COLD'
}

export interface Client {
    id: string
    name: string
    unitId: string
    status: 'active' | 'inactive'
    enquiriesCount: number
}
