import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, HeartPulse, Save } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useInHouseAllocations } from '../../allocation/hooks/useAllocation'
import { useCaregiverVitalCharts, useHealthcarePatients, useSaveCaregiverVitalChart, useVitalSigns } from '../../healthcare/hooks/useHealthcare'
import type { CaregiverVitalEntry, HealthcarePatient, VitalSign } from '../../healthcare/types'
import { formatDateTime, getVitalRisk, latestVitalForPatient } from '../../healthcare/utils'

type VitalRow = {
    patient: HealthcarePatient
    latestVital?: VitalSign
    risk: ReturnType<typeof getVitalRisk>
}

const monthKey = () => new Date().toISOString().slice(0, 7)
const days = Array.from({ length: 31 }, (_, index) => index + 1)

const emptyEntries = (): CaregiverVitalEntry[] => days.map((day) => ({
    day,
    tempMor: '',
    tempEve: '',
    bpMor: '',
    bpEve: '',
    pulseMor: '',
    pulseEve: '',
    spo2Mor: '',
    spo2Eve: '',
    rrMor: '',
    rrEve: '',
    glucoseBf: '',
    glucoseAf: '',
    weight: '',
    intakeBf: '',
    intakeLunch: '',
    intakeDinner: '',
    urine: '',
    stool: '',
    sign: '',
    remarks: ''
}))

const chartFields: Array<{ key: keyof CaregiverVitalEntry, label: string, width: string }> = [
    { key: 'tempMor', label: 'Temp M', width: 'w-20' },
    { key: 'tempEve', label: 'Temp E', width: 'w-20' },
    { key: 'bpMor', label: 'BP M', width: 'w-24' },
    { key: 'bpEve', label: 'BP E', width: 'w-24' },
    { key: 'pulseMor', label: 'PR M', width: 'w-20' },
    { key: 'pulseEve', label: 'PR E', width: 'w-20' },
    { key: 'spo2Mor', label: 'SpO2 M', width: 'w-20' },
    { key: 'spo2Eve', label: 'SpO2 E', width: 'w-20' },
    { key: 'rrMor', label: 'RR M', width: 'w-20' },
    { key: 'rrEve', label: 'RR E', width: 'w-20' },
    { key: 'glucoseBf', label: 'Glucose BF', width: 'w-24' },
    { key: 'glucoseAf', label: 'Glucose AF', width: 'w-24' },
    { key: 'weight', label: 'W/kg', width: 'w-20' },
    { key: 'intakeBf', label: 'BF', width: 'w-20' },
    { key: 'intakeLunch', label: 'Lunch', width: 'w-20' },
    { key: 'intakeDinner', label: 'Dinner', width: 'w-20' },
    { key: 'urine', label: 'Urine', width: 'w-20' },
    { key: 'stool', label: 'Stool', width: 'w-20' },
    { key: 'sign', label: 'Sign', width: 'w-28' }
]

const patientAge = (patient?: HealthcarePatient) => patient?.patientAge || patient?.admissions?.[0]?.enquiry?.patientAge || ''
const patientSex = (patient?: HealthcarePatient) => patient?.patientGender || patient?.admissions?.[0]?.enquiry?.patientGender || ''

export function Vitals() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [selectedPatientId, setSelectedPatientId] = useState('')
    const [patientSearch, setPatientSearch] = useState('')
    const [patientMenuOpen, setPatientMenuOpen] = useState(false)
    const [chartMonth, setChartMonth] = useState(monthKey())
    const [age, setAge] = useState('')
    const [sex, setSex] = useState('')
    const [entries, setEntries] = useState<CaregiverVitalEntry[]>(() => emptyEntries())
    const [signatures, setSignatures] = useState({ doctor: '', nurse: '', attender: '', manager: '' })

    const { data: healthcarePatients = [], isLoading: patientsLoading } = useHealthcarePatients()
    const { data: inHouseAllocations = [], isLoading: allocationsLoading } = useInHouseAllocations()
    const { data: vitals = [], isLoading: vitalsLoading } = useVitalSigns()
    const { data: charts = [] } = useCaregiverVitalCharts(chartMonth, selectedPatientId || undefined)
    const saveChart = useSaveCaregiverVitalChart()

    const patients = useMemo<HealthcarePatient[]>(() => {
        const byId = new Map<string, HealthcarePatient>()

        healthcarePatients.forEach((patient) => byId.set(patient.id, patient))

        inHouseAllocations.forEach((allocation: any) => {
            const patientId = allocation.patientId
            const patientName = allocation.patient && allocation.patient !== '-' ? allocation.patient : allocation.clientName
            if (!patientId || !patientName || byId.has(patientId)) return

            byId.set(patientId, {
                id: patientId,
                name: patientName,
                patientAge: allocation.patientAge || '',
                patientGender: allocation.patientGender || '',
                tenantId: '',
                unitId: allocation.unitId || '',
                admissions: [{
                    id: allocation.id,
                    status: allocation.status,
                    service: allocation.service,
                    admittedAt: allocation.startDate || null
                }],
                createdAt: allocation.startDate || new Date().toISOString(),
                updatedAt: allocation.startDate || new Date().toISOString()
            })
        })

        return Array.from(byId.values()).sort((first, second) => first.name.localeCompare(second.name))
    }, [healthcarePatients, inHouseAllocations])

    const selectedPatient = patients.find((patient) => patient.id === selectedPatientId)
    const selectedChart = charts[0]
    const filteredPatientOptions = useMemo(() => {
        const query = patientSearch.trim().toLowerCase()
        if (!query || selectedPatient?.name === patientSearch) return patients

        return patients.filter((patient) => [
            patient.name,
            patient.id,
            patient.admissions?.[0]?.service || ''
        ].some((value) => String(value || '').toLowerCase().includes(query)))
    }, [patientSearch, patients, selectedPatient?.name])

    useEffect(() => {
        if (!patients.length) {
            setSelectedPatientId('')
            setPatientSearch('')
            return
        }

        if (!selectedPatientId || !patients.some((patient) => patient.id === selectedPatientId)) {
            setSelectedPatientId(patients[0].id)
        }
    }, [patients, selectedPatientId])

    useEffect(() => {
        if (selectedPatient) setPatientSearch(selectedPatient.name)
    }, [selectedPatient?.id, selectedPatient?.name])

    useEffect(() => {
        if (selectedChart) {
            const existingByDay = new Map((selectedChart.entries || []).map((entry) => [entry.day, entry]))
            setEntries(emptyEntries().map((entry) => ({ ...entry, ...(existingByDay.get(entry.day) || {}) })))
            setAge(selectedChart.age || '')
            setSex(selectedChart.sex || '')
            setSignatures({
                doctor: selectedChart.signatures?.doctor || '',
                nurse: selectedChart.signatures?.nurse || '',
                attender: selectedChart.signatures?.attender || '',
                manager: selectedChart.signatures?.manager || ''
            })
        } else {
            setEntries(emptyEntries())
            setAge(patientAge(selectedPatient))
            setSex(patientSex(selectedPatient))
            setSignatures({ doctor: '', nurse: '', attender: '', manager: '' })
        }
    }, [selectedChart?.id, selectedPatientId, chartMonth, selectedPatient?.id])

    const rows: VitalRow[] = useMemo(() => patients.map((patient) => {
        const latestVital = latestVitalForPatient(patient.id, vitals)
        return {
            patient,
            latestVital,
            risk: getVitalRisk(latestVital)
        }
    }), [patients, vitals])

    const visibleRows = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        return rows.filter((row) => {
            const matchesSearch = !query || [
                row.patient.name,
                row.latestVital?.bp,
                row.latestVital?.pulse,
                row.latestVital?.temp,
                row.latestVital?.spO2,
                row.latestVital?.notes,
                row.risk.label
            ].some((value) => String(value || '').toLowerCase().includes(query))
            const matchesStatus = !statusFilter || row.risk.level === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [rows, searchQuery, statusFilter])

    const criticalCount = rows.filter((row) => row.risk.level === 'critical').length
    const missingCount = rows.filter((row) => row.risk.level === 'missing').length
    const stableCount = rows.filter((row) => row.risk.level === 'stable').length

    const updateEntry = (day: number, key: keyof CaregiverVitalEntry, value: string) => {
        setEntries((prev) => prev.map((entry) => entry.day === day ? { ...entry, [key]: value } : entry))
    }

    const handleSaveChart = async () => {
        if (!selectedPatient) return
        await saveChart.mutateAsync({
            patientId: selectedPatient.id,
            patientName: selectedPatient.name,
            age,
            sex,
            month: chartMonth,
            entries,
            signatures,
            status: 'DRAFT'
        })
    }

    const handleSelectPatient = (patient: HealthcarePatient) => {
        setSelectedPatientId(patient.id)
        setPatientSearch(patient.name)
        setAge(patientAge(patient))
        setSex(patientSex(patient))
        setPatientMenuOpen(false)
    }

    const columns: Column<VitalRow>[] = [
        { key: 'sno', header: 'S.No', cell: (_row, index) => index + 1 },
        {
            key: 'patient',
            header: 'Patient',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                        <HeartPulse className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="font-black text-slate-950">{row.patient.name}</p>
                        <p className="text-xs font-semibold text-slate-500">Registered patient</p>
                    </div>
                </div>
            )
        },
        {
            key: 'latestVitals',
            header: 'Latest Vitals',
            cell: (row) => row.latestVital
                ? `${row.latestVital.bp || '-'} | P ${row.latestVital.pulse || '-'} | T ${row.latestVital.temp || '-'} | SpO2 ${row.latestVital.spO2 || '-'}`
                : 'No vitals recorded'
        },
        { key: 'risk', header: 'Care Status', cell: (row) => <StatusHighlighter value={row.risk.label} /> },
        { key: 'notes', header: 'Notes', cell: (row) => row.latestVital?.notes || '-' },
        { key: 'updated', header: 'Last Recorded', cell: (row) => row.latestVital ? formatDateTime(row.latestVital.createdAt) : '-' }
    ]

    return (
        <div className="flex h-full flex-col">
            <PageHeader
                title="In-House Vitals"
                subtitle="Monthly caregiver vital chart with live patient vital status."
                breadcrumbs={[{ label: 'In-House Care' }, { label: 'Vitals' }]}
            />

            <div className="mb-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4 text-primary-700 shadow-sm">
                    <p className="text-2xl font-black">{patients.length}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Patients</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700 shadow-sm">
                    <p className="text-2xl font-black">{stableCount}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Stable</p>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-rose-700 shadow-sm">
                    <p className="text-2xl font-black">{criticalCount}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Critical</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-amber-700 shadow-sm">
                    <p className="text-2xl font-black">{missingCount}</p>
                    <p className="text-xs font-black uppercase tracking-wide">No Vitals</p>
                </div>
            </div>

            <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="text-base font-black text-slate-950">Care Giver's Vital Sign Chart</h2>
                        <p className="text-sm font-semibold text-slate-500">Stored month-wise in the same structure as the paper register.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleSaveChart}
                        disabled={!selectedPatient || saveChart.isPending}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {saveChart.isPending ? 'Saving...' : 'Save Chart'}
                    </button>
                </div>

                <div className="mb-4 grid gap-3 md:grid-cols-5">
                    <label className="block">
                        <span className="mb-1 block text-xs font-black uppercase text-slate-500">Inmate</span>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setPatientMenuOpen((open) => !open)}
                                className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left text-sm font-semibold text-slate-900"
                            >
                                <span className="truncate">{selectedPatient?.name || 'Select patient'}</span>
                                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                            </button>
                            {patientMenuOpen ? (
                                <div className="absolute left-0 right-0 top-11 z-50 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                                    <input
                                        value={patientSearch}
                                        onChange={(event) => setPatientSearch(event.target.value)}
                                        onFocus={() => setPatientMenuOpen(true)}
                                        placeholder="Search patient"
                                        className="mb-2 h-9 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-primary-300"
                                        autoFocus
                                    />
                                    <div className="max-h-60 overflow-y-auto">
                                        {filteredPatientOptions.length ? filteredPatientOptions.map((patient) => (
                                            <button
                                                key={patient.id}
                                                type="button"
                                                onClick={() => handleSelectPatient(patient)}
                                                className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                                                    patient.id === selectedPatientId ? 'bg-primary-50 font-bold text-primary-700' : 'font-semibold text-slate-700'
                                                }`}
                                            >
                                                <span className="block truncate">{patient.name}</span>
                                                <span className="block truncate text-xs font-medium text-slate-400">
                                                    {patient.admissions?.[0]?.service || 'In-house patient'} · {patient.id}
                                                </span>
                                            </button>
                                        )) : (
                                            <div className="px-3 py-3 text-sm font-semibold text-slate-500">No patients found</div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-black uppercase text-slate-500">Month</span>
                        <input type="month" value={chartMonth} onChange={(event) => setChartMonth(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold" />
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-black uppercase text-slate-500">Age</span>
                        <input value={age} onChange={(event) => setAge(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold" />
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-black uppercase text-slate-500">Sex</span>
                        <input value={sex} onChange={(event) => setSex(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold" />
                    </label>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs font-black uppercase text-slate-500">Patient ID</p>
                    <p className="truncate text-sm font-bold text-slate-900">{selectedPatient?.id || '-'}</p>
                </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-[1780px] border-collapse text-xs">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="w-12 border border-slate-200 px-2 py-2 text-left">Date</th>
                                {chartFields.map((field) => (
                                    <th key={field.key} className={`${field.width} border border-slate-200 px-2 py-2 text-left`}>{field.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => (
                                <tr key={entry.day}>
                                    <td className="border border-slate-200 px-2 py-1 font-black text-slate-700">{entry.day}</td>
                                    {chartFields.map((field) => (
                                        <td key={field.key} className="border border-slate-200 p-1">
                                            <input
                                                value={String(entry[field.key] || '')}
                                                onChange={(event) => updateEntry(entry.day, field.key, event.target.value)}
                                                className="h-8 w-full rounded border border-transparent bg-transparent px-1 text-xs outline-none focus:border-primary-300 focus:bg-white"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-4">
                    {(['doctor', 'nurse', 'attender', 'manager'] as const).map((key) => (
                        <label key={key} className="block">
                            <span className="mb-1 block text-xs font-black uppercase text-slate-500">{key}</span>
                            <input
                                value={signatures[key]}
                                onChange={(event) => setSignatures((prev) => ({ ...prev, [key]: event.target.value }))}
                                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold"
                            />
                        </label>
                    ))}
                </div>
            </section>

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search patient, vitals, notes..."
                filters={[
                    {
                        name: 'statusFilter',
                        value: statusFilter,
                        onChange: (event) => setStatusFilter(event.target.value),
                        options: [
                            { value: '', label: 'All Status' },
                            { value: 'stable', label: 'Stable' },
                            { value: 'critical', label: 'Critical' },
                            { value: 'missing', label: 'No Vitals' }
                        ]
                    }
                ]}
            />

            <DataTable
                data={visibleRows}
                columns={columns}
                keyExtractor={(row) => row.patient.id}
                isLoading={patientsLoading || allocationsLoading || vitalsLoading}
                emptyStateMessage="No live patients found. Add or admit a patient first."
            />
        </div>
    )
}
