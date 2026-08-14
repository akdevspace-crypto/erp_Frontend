// @ts-nocheck
import { useState } from 'react'
import { Plus, CheckCircle2, ChevronDown } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { DataTable, type Column } from '../../../components/DataTable'
import { Modal } from '../../../components/Modal'
import { useAdmissions } from '../../enquiry/hooks/useEnquiry'
import { useNursingCareVitals, useSaveNursingCareVital, useVerifyNursingCareVital } from '../hooks/useNursingCare'
import { useAuthStore } from '../../../store/authStore'
import { formatDateTime } from '../../healthcare/utils'

export function Vitals() {
    const { data: admissions = [], isLoading: loadingAdms } = useAdmissions()
    const [selectedPatientId, setSelectedPatientId] = useState<string>('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    
    // Form State
    const [bp, setBp] = useState('')
    const [pulse, setPulse] = useState('')
    const [temp, setTemp] = useState('')
    const [spO2, setSpO2] = useState('')
    const [bloodSugar, setBloodSugar] = useState('')
    const [notes, setNotes] = useState('')
    const [verifyNotes, setVerifyNotes] = useState('')
    const [verifyingVitalId, setVerifyingVitalId] = useState<string | null>(null)

    const user = useAuthStore((state) => state.user)
    const canVerify = user?.role === 'SUPER_ADMIN' || user?.role === 'NURSING_MANAGER' || user?.role === 'MEDICAL_MANAGER'

    const { data: vitals = [], isLoading: loadingVitals } = useNursingCareVitals(selectedPatientId, null, { enabled: Boolean(selectedPatientId) })
    const saveVital = useSaveNursingCareVital()
    const verifyVital = useVerifyNursingCareVital()

    const handleSave = () => {
        if (!selectedPatientId) return
        saveVital.mutate({
            patientId: selectedPatientId,
            bp,
            pulse: pulse ? Number(pulse) : undefined,
            temp: temp ? Number(temp) : undefined,
            spO2: spO2 ? Number(spO2) : undefined,
            bloodSugar,
            notes
        }, {
            onSuccess: () => {
                setIsAddModalOpen(false)
                setBp('')
                setPulse('')
                setTemp('')
                setSpO2('')
                setBloodSugar('')
                setNotes('')
            }
        })
    }

    const handleVerify = () => {
        if (!verifyingVitalId) return
        verifyVital.mutate({
            id: verifyingVitalId,
            notes: verifyNotes
        }, {
            onSuccess: () => {
                setVerifyingVitalId(null)
                setVerifyNotes('')
            }
        })
    }

    const columns: Column<any>[] = [
        {
            header: 'Date & Time',
            key: 'col', cell: (row: any) => formatDateTime(row.createdAt),
            className: 'font-medium'
        },
        { header: 'Temp (�F)', key: 'col', cell: (row: any) => row.temp || '-' },
        { header: 'BP', key: 'col', cell: (row: any) => row.bp || '-' },
        { header: 'Pulse', key: 'col', cell: (row: any) => row.pulse || '-' },
        { header: 'SpO2', key: 'col', cell: (row: any) => row.spO2 ? row.spO2 + '%' : '-' },
        { header: 'Blood Sugar', key: 'col', cell: (row: any) => row.bloodSugar || '-' },
        {
            header: 'Status',
            key: 'col', cell: (row: any) => (
                row.verified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                        Pending Verification
                    </span>
                )
            )
        }
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Patient Vitals"
                subtitle="Record and monitor patient vital signs"
                
                actions={
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        disabled={!selectedPatientId}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                        Record Vitals
                    </button>
                }
            />

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                <div className="max-w-md">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Select Patient
                    </label>
                    <div className="relative mt-1">
                        <select
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm font-medium text-gray-900 outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
                        >
                            <option value="">-- Choose Admitted Patient --</option>
                            {admissions.filter(a => a.patientId).map((a) => (
                                <option key={a.id} value={a.patientId}>
                                    {a.patientName} ({a.refNo})
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            {selectedPatientId && (
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-black">
                    <DataTable
                        data={vitals}
                        columns={columns}
                        keyExtractor={(item) => item.id}
                        isLoading={loadingVitals}
                        actionsTitle="Action"
                        actions={(row: any) => (
                            !row.verified && canVerify ? (
                                <button
                                    onClick={() => setVerifyingVitalId(row.id)}
                                    className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 hover:bg-primary-100"
                                >
                                    Verify
                                </button>
                            ) : null
                        )}
                    />
                </div>
            )}

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Record Vitals"
                confirmLabel="Save Record"
                onConfirm={handleSave}
            >
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <label className="block text-sm font-medium">
                        Temp (�F)
                        <input value={temp} onChange={e => setTemp(e.target.value)} type="number" className="mt-1 w-full rounded-lg border p-2 text-sm dark:bg-black dark:border-white/10" placeholder="98.6" />
                    </label>
                    <label className="block text-sm font-medium">
                        Blood Pressure
                        <input value={bp} onChange={e => setBp(e.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm dark:bg-black dark:border-white/10" placeholder="120/80" />
                    </label>
                    <label className="block text-sm font-medium">
                        Pulse
                        <input value={pulse} onChange={e => setPulse(e.target.value)} type="number" className="mt-1 w-full rounded-lg border p-2 text-sm dark:bg-black dark:border-white/10" placeholder="72" />
                    </label>
                    <label className="block text-sm font-medium">
                        SpO2 (%)
                        <input value={spO2} onChange={e => setSpO2(e.target.value)} type="number" className="mt-1 w-full rounded-lg border p-2 text-sm dark:bg-black dark:border-white/10" placeholder="98" />
                    </label>
                    <label className="block text-sm font-medium">
                        Blood Sugar
                        <input value={bloodSugar} onChange={e => setBloodSugar(e.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm dark:bg-black dark:border-white/10" placeholder="e.g. 110 mg/dL" />
                    </label>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium">
                            Clinical Notes
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm dark:bg-black dark:border-white/10" placeholder="Any additional notes..." />
                        </label>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={Boolean(verifyingVitalId)}
                onClose={() => setVerifyingVitalId(null)}
                title="Verify Vitals"
                confirmLabel="Approve"
                onConfirm={handleVerify}
            >
                <div className="mt-4">
                    <label className="block text-sm font-medium">
                        Verification Notes (Optional)
                        <textarea value={verifyNotes} onChange={e => setVerifyNotes(e.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm dark:bg-black dark:border-white/10" placeholder="Looks good..." />
                    </label>
                </div>
            </Modal>
        </div>
    )
}




