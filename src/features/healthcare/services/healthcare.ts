import { api } from '../../../lib/axios'
import type {
    AdministerMedicationDosePayload,
    AdlRecord,
    CreateAdlPayload,
    CaregiverVitalChart,
    CreateMedicationSchedulePayload,
    CreateNutritionPayload,
    CreatePatientPayload,
    SaveCaregiverVitalChartPayload,
    CreateVitalSignPayload,
    HealthcareNutrition,
    HealthcarePatient,
    MedicationSchedule,
    UpdateAdlStatusPayload,
    VitalSign
} from '../types'

export const healthcareService = {
    getPatients: async (unitId?: string | null, options?: { scope?: 'all' }): Promise<HealthcarePatient[]> => {
        const response = await api.get('/patient', {
            ...(unitId ? { headers: { 'x-unit-id': unitId } } : {}),
            ...(options?.scope === 'all' ? { params: { scope: 'all' } } : {})
        })
        const patients = response.data?.data || []
        return patients.map((patient: any) => {
            const admission = Array.isArray(patient.admissions) ? patient.admissions[0] : null
            let meta: Record<string, string> = {}
            try {
                meta = admission?.enquiry?.rawMessage ? JSON.parse(admission.enquiry.rawMessage) : {}
            } catch {
                meta = {}
            }

            return {
                ...patient,
                patientAge: meta.patientAge || patient.patientAge || '',
                patientGender: meta.patientGender || patient.patientGender || ''
            }
        })
    },

    createPatient: async (payload: CreatePatientPayload): Promise<HealthcarePatient> => {
        const response = await api.post('/patient', payload)
        return response.data?.data
    },

    getVitalSigns: async (unitId?: string | null): Promise<VitalSign[]> => {
        const response = await api.get('/vital-sign', unitId ? { headers: { 'x-unit-id': unitId } } : undefined)
        return response.data?.data || []
    },

    createVitalSign: async (payload: CreateVitalSignPayload): Promise<VitalSign> => {
        const response = await api.post('/vital-sign', payload)
        return response.data?.data
    },

    getCaregiverVitalCharts: async (month?: string, patientId?: string): Promise<CaregiverVitalChart[]> => {
        const response = await api.get('/caregiver-vital-charts', { params: { month, patientId } })
        return response.data?.data || []
    },

    saveCaregiverVitalChart: async (payload: SaveCaregiverVitalChartPayload): Promise<CaregiverVitalChart> => {
        const response = await api.post('/caregiver-vital-charts', payload)
        return response.data?.data
    },

    getNutritionPlans: async (unitId?: string | null): Promise<HealthcareNutrition[]> => {
        const response = await api.get('/nutrition', unitId ? { headers: { 'x-unit-id': unitId } } : undefined)
        return response.data?.data || []
    },

    createNutritionPlan: async (payload: CreateNutritionPayload): Promise<HealthcareNutrition> => {
        const response = await api.post('/nutrition', payload)
        return response.data?.data
    },

    getAdlRecords: async (unitId?: string | null): Promise<AdlRecord[]> => {
        const response = await api.get('/adl-records', unitId ? { headers: { 'x-unit-id': unitId } } : undefined)
        return response.data?.data || []
    },

    createAdlRecord: async (payload: CreateAdlPayload): Promise<AdlRecord> => {
        const response = await api.post('/adl-records', payload)
        return response.data?.data
    },

    updateAdlStatus: async ({ id, status }: UpdateAdlStatusPayload): Promise<AdlRecord> => {
        const response = await api.patch(`/adl-records/${id}/status`, { status })
        return response.data?.data
    },

    getMedicationSchedules: async (unitId?: string | null): Promise<MedicationSchedule[]> => {
        const response = await api.get('/medication-schedules', unitId ? { headers: { 'x-unit-id': unitId } } : undefined)
        return response.data?.data || []
    },

    createMedicationSchedule: async (payload: CreateMedicationSchedulePayload): Promise<MedicationSchedule> => {
        const response = await api.post('/medication-schedules', payload)
        return response.data?.data
    },

    administerMedicationDose: async ({ id, slot, remarks }: AdministerMedicationDosePayload): Promise<MedicationSchedule> => {
        const response = await api.patch(`/medication-schedules/${id}/administer`, { slot, remarks })
        return response.data?.data
    }
}
