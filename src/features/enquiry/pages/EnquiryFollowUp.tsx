import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarCheck, Edit2, Trash2, Zap, MessageSquare } from 'lucide-react'
import { connectRealtimeSocket, realtimeSocket } from '../../../lib/realtimeSocket'
import { PageHeader } from '../../../components/PageHeader'
import { ActionBar } from '../../../components/ActionBar'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { Drawer } from '../../../components/Drawer'
import { Modal } from '../../../components/Modal'
import { ChatModal } from '../../../components/OmnichannelChatModal'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import { useEnquiries, useAddEnquiry, useUpdateEnquiry, useDeleteEnquiry, useRenewalFollowUpOutcome } from '../hooks/useEnquiry'
import { enquirySchema, type EnquiryFormValues } from '../schema'
import type { Enquiry } from '../types'
import { useToast } from '../../../components/Toast'
import { ExecutionTracePanel } from '../../automation/components/ExecutionTracePanel'
import { useStaff } from '../../hr/hooks/useHR'
import { EnquiryFollowUpModal } from '../components/EnquiryFollowUpModal'
import { useUnits } from '../../master/hooks/useUnit'
import { useClientServices } from '../../master/services/client-service'
import { useAuthStore } from '../../../store/authStore'
import type { Staff } from '../../hr/types'

const fallbackServices = [
    'Home Care',
    'Clinical Care',
    'In-House Assisted Living',
    'Dementia Care',
    'Skilled Nursing',
    'Post Operative Care',
    'Ambulance Support'
]

const isActiveStaff = (staff: Staff) =>
    !staff.isDeleted &&
    !['terminated', 'resigned'].includes(String(staff.status || '').trim().toLowerCase())

const buildStaffOptions = (staffList: Staff[]) => {
    const activeStaff = staffList
        .filter(isActiveStaff)
        .sort((a, b) => a.name.localeCompare(b.name))

    return activeStaff.map((staff) => ({
        value: staff.id,
        label: `${staff.name} (ID: ${staff.empId || staff.id})`
    }))
}

const extractNoteValue = (notes: string | undefined, label: string) => {
    const match = String(notes || '').match(new RegExp(`${label}:\\s*([^|\\n]+)`, 'i'))
    return match?.[1]?.trim() || ''
}

const getLatestFollowUpValue = (enquiry: Enquiry, label: string) => {
    const followUps = Array.isArray(enquiry.followUps) ? enquiry.followUps : []

    for (const followUp of followUps) {
        const value = extractNoteValue(followUp.notes, label)
        if (value) return value
    }

    return ''
}

const getFollowUpIntelligence = (enquiry: Enquiry) => {
    const leadValidity = getLatestFollowUpValue(enquiry, 'Lead Validity') || 'Not filtered'
    const conversionReadiness = getLatestFollowUpValue(enquiry, 'Conversion Readiness') || 'Discussion Stage'
    const urgency = getLatestFollowUpValue(enquiry, 'Urgency') || 'Normal'

    return {
        leadValidity,
        conversionReadiness,
        urgency,
        isReadyToConvert: conversionReadiness === 'Ready To Convert' || conversionReadiness === 'Converted',
        isUrgent: urgency === 'Immediate' || urgency === 'Within 24 hours',
        isInvalid: ['Fake', 'Duplicate Enquiry', 'Not Service Related', 'Not Convertible'].includes(leadValidity) ||
            conversionReadiness === 'Not Convertible'
    }
}

interface WorkflowEnquiry extends Enquiry {
    currentStatus: string
    automationScore?: number
    automationPriority?: 'HOT' | 'WARM' | 'COLD'
}

export function EnquiryFollowUp() {
    const [searchParams] = useSearchParams()
    const { data: rawEnquiries, isLoading } = useEnquiries()
    const { data: staffList = [] } = useStaff({ scope: 'all' })
    const { data: units = [] } = useUnits()
    const { data: services = [] } = useClientServices()
    const user = useAuthStore((state) => state.user)
    const activeUnitId = useAuthStore((state) => state.activeUnitId)
    const { toast } = useToast()
    const resolvedUnitId = activeUnitId || user?.unitId || ''

    const [liveAutomationUpdates, setLiveAutomationUpdates] = useState<Record<string, Pick<WorkflowEnquiry, 'automationScore' | 'automationPriority'>>>({})
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
    const [unitFilter, setUnitFilter] = useState('')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingEnquiry, setEditingEnquiry] = useState<WorkflowEnquiry | null>(null)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [enquiryToDelete, setEnquiryToDelete] = useState<WorkflowEnquiry | null>(null)
    const [followUpModalOpen, setFollowUpModalOpen] = useState(false)
    const [enquiryToFollowUp, setEnquiryToFollowUp] = useState<WorkflowEnquiry | null>(null)
    const [renewalOutcomeOpen, setRenewalOutcomeOpen] = useState(false)
    const [renewalOutcome, setRenewalOutcome] = useState<'INTERESTED' | 'NOT_INTERESTED' | 'CALL_LATER' | 'CONVERTED_TO_NEW_SERVICE' | 'CLOSED'>('INTERESTED')
    const [renewalOutcomeNotes, setRenewalOutcomeNotes] = useState('')
    const [renewalNextDate, setRenewalNextDate] = useState(new Date().toISOString().split('T')[0])
    const [traceModalOpen, setTraceModalOpen] = useState(false)
    const [activeTraceId, setActiveTraceId] = useState<string | null>(null)
    const [showChatModal, setShowChatModal] = useState(false)

    useEffect(() => {
        connectRealtimeSocket()

        const handleUpdate = (data: { entityId: string, score: number, label: string, priority: string }) => {
            console.log('Real-time update received for:', data.entityId)
            setLiveAutomationUpdates((prev) => ({
                ...prev,
                [data.entityId]: {
                    automationScore: data.score,
                    automationPriority: data.priority as WorkflowEnquiry['automationPriority']
                }
            }))
            toast({
                type: 'info',
                title: 'Automation Update',
                message: `Lead ${data.entityId.slice(0, 8)}... scored ${data.score} (${data.label})`
            })
        }

        realtimeSocket.on('automation:update', handleUpdate)
        return () => {
            realtimeSocket.off('automation:update', handleUpdate)
        }
    }, [toast])

    const localEnquiries = useMemo<WorkflowEnquiry[]>(() => {
        if (!rawEnquiries) return []

        return rawEnquiries.map((enquiry) => {
            const liveUpdate = liveAutomationUpdates[enquiry.id]
            return {
                ...enquiry,
                currentStatus: enquiry.status === 'Converted' ? 'CONVERTED' : 'NEW',
                automationScore: liveUpdate?.automationScore ?? (typeof enquiry.automationScore === 'number' ? enquiry.automationScore : 0),
                automationPriority: liveUpdate?.automationPriority ?? enquiry.automationPriority ?? 'COLD'
            }
        })
    }, [rawEnquiries, liveAutomationUpdates])

    const addEnquiry = useAddEnquiry()
    const updateEnquiry = useUpdateEnquiry()
    const deleteEnquiry = useDeleteEnquiry()
    const recordRenewalOutcome = useRenewalFollowUpOutcome()

    const followUpStaffOptions = useMemo(
        () => buildStaffOptions(staffList),
        [staffList]
    )

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EnquiryFormValues>({
        resolver: zodResolver(enquirySchema),
    })

    const unitOptions = useMemo(() => {
        const apiUnits = units.map(unit => ({ value: unit.id, label: unit.name }))
        if (apiUnits.length > 0) return apiUnits
        if (resolvedUnitId) return [{ value: resolvedUnitId, label: 'Assigned Unit' }]
        return []
    }, [resolvedUnitId, units])

    const serviceOptions = useMemo(() => {
        const apiServices = services
            .map(service => String(service.name || service.code || '').trim())
            .filter(Boolean)
            .map(name => ({ value: name, label: name }))

        if (apiServices.length > 0) return apiServices
        return fallbackServices.map(name => ({ value: name, label: name }))
    }, [services])

    useEffect(() => {
        if (resolvedUnitId) setValue('unitId', resolvedUnitId)
    }, [resolvedUnitId, setValue])

    const filteredData = useMemo(() => {
        return localEnquiries.filter((e) => {
            const matchSearch = e.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.refNo.toLowerCase().includes(searchQuery.toLowerCase())
            const matchUnit = unitFilter ? e.unitId === unitFilter : true
            return matchSearch && matchUnit
        })
    }, [localEnquiries, searchQuery, unitFilter])

    const staffAccountability = useMemo(() => {
        const staffMap = new Map<string, {
            staffName: string
            assigned: number
            pending: number
            readyToConvert: number
            urgent: number
            invalid: number
            lastFollowUp?: string | null
            latestStatus: string
        }>()

        localEnquiries.forEach((enquiry) => {
            const followUps = Array.isArray(enquiry.followUps) ? enquiry.followUps : []
            if (followUps.length === 0 && !enquiry.lastFollowedBy) return

            const staffName = enquiry.lastFollowedBy || 'Unassigned'
            const current = staffMap.get(staffName) || {
                staffName,
                assigned: 0,
                pending: 0,
                readyToConvert: 0,
                urgent: 0,
                invalid: 0,
                lastFollowUp: null,
                latestStatus: 'No updates'
            }
            const intelligence = getFollowUpIntelligence(enquiry)
            const latestFollowUp = followUps[0]
            const latestDate = latestFollowUp?.scheduledAt || enquiry.lastFollowUp || null
            const status = enquiry.lastFollowUpStatus || latestFollowUp?.nextFollowupStatus || latestFollowUp?.outcome || 'Followup Required'

            current.assigned += 1
            if (!['Followup Not Required', 'Converted', 'Lost', 'CLOSED'].includes(String(status))) current.pending += 1
            if (intelligence.isReadyToConvert) current.readyToConvert += 1
            if (intelligence.isUrgent) current.urgent += 1
            if (intelligence.isInvalid) current.invalid += 1
            if (latestDate && (!current.lastFollowUp || new Date(latestDate) > new Date(current.lastFollowUp))) {
                current.lastFollowUp = latestDate
                current.latestStatus = status
            }

            staffMap.set(staffName, current)
        })

        return Array.from(staffMap.values()).sort((a, b) => b.pending - a.pending)
    }, [localEnquiries])

    const accountabilityTotals = useMemo(() => ({
        assigned: staffAccountability.reduce((total, row) => total + row.assigned, 0),
        pending: staffAccountability.reduce((total, row) => total + row.pending, 0),
        readyToConvert: staffAccountability.reduce((total, row) => total + row.readyToConvert, 0),
        urgent: staffAccountability.reduce((total, row) => total + row.urgent, 0)
    }), [staffAccountability])

    const handleAdd = () => {
        setEditingEnquiry(null)
        reset({
            unitId: resolvedUnitId,
            service: '',
            mode: 'Call',
            clientName: '',
            mobile: '',
            email: '',
            comments: '',
            status: 'Open',
            patientName: '',
            patientAge: '',
            patientGender: '',
            patientHealthCondition: '',
            clientAddress: '',
            clientLocation: '',
            remarks: ''
        })
        setIsDrawerOpen(true)
    }

    const handleEdit = (enquiry: WorkflowEnquiry) => {
        setEditingEnquiry(enquiry)
        reset({
            unitId: enquiry.unitId,
            service: enquiry.service,
            mode: enquiry.mode as any,
            clientName: enquiry.clientName,
            mobile: enquiry.mobile,
            email: enquiry.email,
            comments: enquiry.comments,
            status: enquiry.status,
            patientName: enquiry.patientName || '',
            patientAge: enquiry.patientAge || '',
            patientGender: enquiry.patientGender || '',
            patientHealthCondition: enquiry.patientHealthCondition || '',
            clientAddress: enquiry.clientAddress || '',
            clientLocation: enquiry.clientLocation || '',
            remarks: enquiry.remarks || ''
        })
        setIsDrawerOpen(true)
    }

    const onSubmit = (data: EnquiryFormValues) => {
        const payload = {
            ...data,
            unitId: data.unitId || resolvedUnitId
        }

        if (editingEnquiry) {
            updateEnquiry.mutate({ id: editingEnquiry.id, data: payload }, { onSuccess: () => setIsDrawerOpen(false) })
        } else {
            addEnquiry.mutate(payload, { onSuccess: () => setIsDrawerOpen(false) })
        }
    }

    const handleDeleteConfirm = () => {
        if (enquiryToDelete) {
            deleteEnquiry.mutate(enquiryToDelete.id, {
                onSuccess: () => {
                    setDeleteModalOpen(false)
                    setEnquiryToDelete(null)
                }
            })
        }
    }

    const handleFollowUpOpen = (enquiry: WorkflowEnquiry) => {
        setEnquiryToFollowUp(enquiry)
        setFollowUpModalOpen(true)
    }

    const handleRenewalOutcomeOpen = (enquiry: WorkflowEnquiry) => {
        setEnquiryToFollowUp(enquiry)
        setRenewalOutcome('INTERESTED')
        setRenewalOutcomeNotes('')
        setRenewalNextDate(new Date().toISOString().split('T')[0])
        setRenewalOutcomeOpen(true)
    }

    const handleRenewalOutcomeSave = () => {
        if (!enquiryToFollowUp) return

        recordRenewalOutcome.mutate({
            id: enquiryToFollowUp.id,
            data: {
                followUpId: enquiryToFollowUp.lastFollowUpId,
                outcome: renewalOutcome,
                notes: renewalOutcomeNotes,
                nextDate: renewalOutcome === 'CALL_LATER' && renewalNextDate
                    ? new Date(renewalNextDate).toISOString()
                    : undefined,
                service: enquiryToFollowUp.service
            }
        }, {
            onSuccess: () => {
                setRenewalOutcomeOpen(false)
                setEnquiryToFollowUp(null)
            }
        })
    }

    const columns: Column<WorkflowEnquiry>[] = [
        {
            key: 'sno', header: 'S.No', cell: (_, index) => (
                <span className="text-gray-500 dark:text-gray-400 font-medium">{(index || 0) + 1}</span>
            )
        },
        {
            key: 'refNo', header: 'Client Ref. No.', sortable: true, cell: (e) => (
                <div className="flex flex-col text-left">
                    <span className="text-[13px] font-bold text-gray-900 dark:text-gray-100 uppercase">{e.refNo}</span>
                    <span className="mt-0.5 flex items-center text-[11px] font-medium text-[#3f5f6a]">
                        <span className="mr-1">-&gt;</span> Enq
                    </span>
                </div>
            )
        },
        {
            key: 'createdAt', header: 'Created Details', cell: (e) => (
                <div className="flex flex-col text-left">
                    <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200">
                        {new Date(e.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')} <span className="text-[11px] font-normal text-gray-500">{new Date(e.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}</span>
                    </span>
                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                        By: {e.source || 'Website'}
                    </span>
                </div>
            )
        },
        {
            key: 'service', header: 'Service Looking for', sortable: true, cell: (e) => (
                <div className="flex flex-col text-left">
                    <span className="flex items-center gap-1 text-[13px] font-bold text-gray-900 dark:text-gray-100">
                        {e.service} <span className="rounded-full bg-gray-100 px-1 text-[11px] font-medium text-gray-500 dark:bg-white/10">(- {e.serviceCategory || 'In-House Care'})</span>
                    </span>
                    <span className="mt-1 text-[11px] font-medium uppercase text-gray-500">{e.unitId || 'UEC'}, Coimbatore</span>
                </div>
            )
        },
        {
            key: 'clientName', header: 'Client Details', sortable: true, cell: (e) => (
                <div className="flex flex-col text-left">
                    <span className="text-[13px] font-black text-gray-900 dark:text-gray-100">{e.clientName}</span>
                    <span className="mt-1 text-[11px] font-bold tracking-wide text-[#3f5f6a] dark:text-primary-300">{e.mobile}</span>
                </div>
            )
        },
        {
            key: 'mode', header: 'Lead Score & Priority', cell: (e) => (
                <div className="flex flex-col text-left">
                    <span className="w-fit border-b border-gray-100 dark:border-white/10 pb-1 text-[14px] font-bold text-gray-900 dark:text-gray-100">{e.automationScore ?? 0} / 100 PTS</span>
                    <StatusHighlighter value={e.automationPriority || 'COLD'} className="mt-1.5 min-w-0 px-2 py-[3px] text-[10px] font-black" />
                </div>
            )
        },
        {
            key: 'currentStatus', header: 'Followup Status', cell: (e) => (
                <StatusHighlighter value={e.lastFollowUpStatus ? e.lastFollowUpStatus.replace(/_/g, ' ') : 'To be Follow'} />
            )
        },
        {
            key: 'lastFollowUp', header: 'Last Followed By', cell: (e) => (
                <div className="flex w-full items-center justify-center">
                    <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">{e.lastFollowedBy || '--'}</span>
                </div>
            )
        }
    ]

    return (
        <div className="flex min-h-full flex-col bg-transparent dark:bg-black">
            <PageHeader title="Enquiry follow up" breadcrumbs={[{ label: 'Enquiries' }, { label: 'Active Pipeline', href: '/enquiry/follow-up' }]} />

            <ActionBar onAdd={handleAdd} addLabel="New Enquiry" />

            <section className="mb-3 grid gap-2 md:grid-cols-4">
                {[
                    { label: 'Assigned Follow-ups', value: accountabilityTotals.assigned },
                    { label: 'Pending Follow-ups', value: accountabilityTotals.pending },
                    { label: 'Ready To Convert', value: accountabilityTotals.readyToConvert },
                    { label: 'Urgent Leads', value: accountabilityTotals.urgent }
                ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-black">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">{item.label}</p>
                        <p className="mt-1 text-2xl font-black text-gray-900 dark:text-gray-100">{item.value}</p>
                    </div>
                ))}
            </section>

            <section className="mb-3 h-[220px] shrink-0">
                <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-[0.18em] text-gray-500">Staff Follow-up Accountability</h3>
                </div>
                <div className="h-[190px] rounded-xl border border-gray-100 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-black">
                    <div className="h-full overflow-y-auto pr-1">
                        <table className="min-w-full divide-y divide-gray-100 dark:divide-white/10">
                            <thead className="sticky top-0 z-10 bg-white dark:bg-black">
                                <tr>
                                    {['Staff', 'Assigned', 'Pending', 'Ready', 'Urgent', 'Invalid', 'Latest Status'].map((header) => (
                                        <th key={header} className="px-3 py-2 text-left text-[11px] font-black uppercase tracking-[0.16em] text-gray-500">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                                {staffAccountability.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-3 py-8 text-center text-sm font-semibold text-gray-500">
                                            No staff follow-up activity found.
                                        </td>
                                    </tr>
                                ) : staffAccountability.map((row) => (
                                    <tr key={row.staffName} className="hover:bg-[#3f5f6a]/5">
                                        <td className="px-3 py-2">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900 dark:text-gray-100">{row.staffName}</span>
                                                <span className="text-xs font-medium text-gray-500">
                                                    Last: {row.lastFollowUp ? new Date(row.lastFollowUp).toLocaleDateString() : 'No date'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-300">{row.assigned}</td>
                                        <td className="px-3 py-2 text-sm font-bold text-amber-600">{row.pending}</td>
                                        <td className="px-3 py-2 text-sm font-bold text-emerald-600">{row.readyToConvert}</td>
                                        <td className="px-3 py-2 text-sm font-bold text-rose-600">{row.urgent}</td>
                                        <td className="px-3 py-2 text-sm font-bold text-gray-600 dark:text-gray-300">{row.invalid}</td>
                                        <td className="px-3 py-2">
                                            <StatusHighlighter value={row.latestStatus.replace(/_/g, ' ')} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
                searchPlaceholder="Search by name or Ref No..."
                filters={[
                    {
                        name: 'unitId',
                        options: [{ value: '', label: 'All Units' }, { value: 'U-001', label: 'Sunrise Eldercare' }],
                        value: unitFilter,
                        onChange: (e) => setUnitFilter(e.target.value)
                    }
                ]}
            />

            {isLoading ? (
                <div className="h-64 animate-pulse rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-6 shadow-sm" />
            ) : (
                <div className="h-[430px] min-h-[430px]">
                    <DataTable
                        data={filteredData}
                        columns={columns}
                        keyExtractor={(e) => e.id}
                        emptyStateMessage="No enquiries found."
                        actionsTitle="Actions"
                        actions={(e) => (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleFollowUpOpen(e)}
                                className="flex items-center rounded bg-[#3f5f6a] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-[#1f3b4d]"
                            >
                                Followup
                            </button>
                            {e.isRenewalFollowUp && (
                                <button
                                    onClick={() => handleRenewalOutcomeOpen(e)}
                                    className="flex items-center rounded bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-amber-600"
                                >
                                    <CalendarCheck className="mr-1 h-3 w-3" /> Outcome
                                </button>
                            )}
                            <button
                                onClick={() => { setEnquiryToFollowUp(e); setFollowUpModalOpen(false); setShowChatModal(true); }}
                                className="flex items-center rounded bg-emerald-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-emerald-600"
                                title="Chat with Client"
                            >
                                <MessageSquare className="w-3 h-3 mr-1" /> Chat
                            </button>
                            <div className="ml-2 flex items-center gap-1.5">
                                <button onClick={() => { setActiveTraceId(e.id); setTraceModalOpen(true) }} className="flex items-center justify-center rounded bg-indigo-500 p-1.5 text-white shadow-sm hover:bg-indigo-600" title="Intelligence Trace">
                                    <Zap className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => handleEdit(e)} className="rounded bg-[#3f5f6a] p-1.5 text-white shadow-sm hover:bg-primary-600" title="Edit">
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => { setEnquiryToDelete(e); setDeleteModalOpen(true) }} className="rounded border border-gray-300 dark:border-white/10 bg-white dark:bg-transparent px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5" title="Delete">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                        )}
                    />
                </div>
            )}

            <Drawer isOpen={traceModalOpen} onClose={() => setTraceModalOpen(false)} title="Intelligence Explained - Execution Trace" size="md">
                <div className="h-full bg-gray-50 p-2 dark:bg-transparent">
                    {activeTraceId && <ExecutionTracePanel entityId={activeTraceId} />}
                </div>
            </Drawer>

            <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={editingEnquiry ? 'Edit Enquiry' : 'Add - New Client Enquiry'} size="lg">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-transparent">
                    <div>
                        <h3 className="mb-6 font-sans text-xl font-normal tracking-tight text-gray-800 dark:text-gray-100">Client Basic Details</h3>
                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                            <Select label="Unit Name (Branch) *" {...register('unitId')} error={errors.unitId?.message} options={unitOptions} placeholder="-- Select the Unit Name --" disabled={unitOptions.length <= 1} />
                            <Select label="Service Looking for *" {...register('service')} error={errors.service?.message} options={serviceOptions} placeholder="-- Select the Service Looking for --" />

                            <Select label="Enquiry Mode *" {...register('mode')} error={errors.mode?.message} options={[{ value: 'Call', label: 'Call' }, { value: 'Walk-in', label: 'Walk-in' }, { value: 'Website', label: 'Website' }, { value: 'Reference', label: 'Reference' }]} placeholder="-- Select the Enquiry Mode --" />
                            <div className="hidden sm:block"></div>

                            <Input label="Client Name *" placeholder="Enter Client Full Name" {...register('clientName')} error={errors.clientName?.message} />
                            <Input label="Client Mobile No. *" placeholder="Enter Client Mobile No." {...register('mobile')} error={errors.mobile?.message} />

                            <Input label="Client Email" placeholder="Enter Client Email Address" {...register('email')} error={errors.email?.message} />
                            <div className="sm:col-span-1">
                                <label className="mb-1 block text-sm font-semibold text-[#FF0000] dark:text-[#ff4444]">Client Comments</label>
                                <textarea {...register('comments')} placeholder="Enter Client Comments" rows={3} className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>

                            <Select label="Enquiry Status *" {...register('status')} error={errors.status?.message} options={[{ value: 'Open', label: 'Open' }, { value: 'In Progress', label: 'In Progress' }, { value: 'Converted', label: 'Converted' }, { value: 'Lost', label: 'Lost' }]} placeholder="-- Select the Enquiry Status --" />
                            <div className="hidden sm:block"></div>
                        </div>
                    </div>
                    <div>
                        <h3 className="mb-6 border-t pt-6 font-sans text-xl font-normal tracking-tight text-gray-800 dark:text-gray-100">Home Care / In-Patient Details</h3>
                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                            <Input label="Patient Name *" placeholder="Enter InPatient Full Name" {...register('patientName')} error={errors.patientName?.message} />
                            <Select
                                label="Patient Age"
                                {...register('patientAge')}
                                error={errors.patientAge?.message}
                                options={[
                                    { value: '0 to 10', label: '0 to 10' },
                                    { value: '10 to 18', label: '10 to 18' },
                                    { value: '18 to 30', label: '18 to 30' },
                                    { value: '30 to 45', label: '30 to 45' },
                                    { value: '45 to 60', label: '45 to 60' },
                                    { value: '60+', label: '60+' }
                                ]}
                                placeholder="-- Select the Patient Age Group --"
                            />

                            <Select
                                label="Patient Gender"
                                {...register('patientGender')}
                                error={errors.patientGender?.message}
                                options={[
                                    { value: 'Male', label: 'Male' },
                                    { value: 'Female', label: 'Female' },
                                    { value: 'Other', label: 'Other' }
                                ]}
                                placeholder="-- Select the InPatient Gender --"
                            />
                            <Input label="Patient Health Condition" placeholder="Enter InPatient Health Condition" {...register('patientHealthCondition')} error={errors.patientHealthCondition?.message} />
                        </div>
                    </div>
                    <div>
                        <h3 className="mb-6 border-t dark:border-white/10 pt-6 font-sans text-xl font-normal tracking-tight text-gray-800 dark:text-gray-100">Advanced Details</h3>
                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                            <Input label="Client Address" placeholder="Enter Client Full Address" {...register('clientAddress')} error={errors.clientAddress?.message} />
                            <Input label="Client Location (City)" placeholder="Enter Client Location (City Name)" {...register('clientLocation')} error={errors.clientLocation?.message} />

                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Remarks (Narration)</label>
                                <textarea {...register('remarks')} placeholder="Enter Client Remarks" rows={3} className="flex w-full rounded-md border border-gray-300 dark:border-white/10 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-3 pt-6 border-t dark:border-white/10">
                        <button
                            type="button"
                            onClick={() => editingEnquiry ? handleEdit(editingEnquiry) : handleAdd()}
                            className="rounded border border-gray-300 dark:border-white/10 bg-white dark:bg-transparent px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                        >
                            Reset All
                        </button>
                        <button type="submit" disabled={addEnquiry.isPending || updateEnquiry.isPending} className="rounded bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-50">
                            Submit
                        </button>
                    </div>
                </form>
            </Drawer>

            <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Enquiry" type="danger" message="Are you sure you want to delete this enquiry?" onConfirm={handleDeleteConfirm} />

            <Modal
                isOpen={renewalOutcomeOpen}
                onClose={() => { setRenewalOutcomeOpen(false); setEnquiryToFollowUp(null); }}
                title="Renewal Follow-up Outcome"
                type="info"
                onConfirm={handleRenewalOutcomeSave}
                confirmDisabled={recordRenewalOutcome.isPending}
                confirmLabel={recordRenewalOutcome.isPending ? 'Saving...' : 'Save Outcome'}
            >
                <div className="mt-4 space-y-4 text-left">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Outcome</label>
                        <select
                            value={renewalOutcome}
                            onChange={(event) => setRenewalOutcome(event.target.value as typeof renewalOutcome)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800 outline-none focus:border-primary-500"
                        >
                            <option value="INTERESTED">Interested</option>
                            <option value="NOT_INTERESTED">Not Interested</option>
                            <option value="CALL_LATER">Call Later</option>
                            <option value="CONVERTED_TO_NEW_SERVICE">Converted to New Service</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>
                    {renewalOutcome === 'CALL_LATER' && (
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Next Call Date</label>
                            <input
                                type="date"
                                value={renewalNextDate}
                                onChange={(event) => setRenewalNextDate(event.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800 outline-none focus:border-primary-500"
                            />
                        </div>
                    )}
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Notes</label>
                        <textarea
                            value={renewalOutcomeNotes}
                            onChange={(event) => setRenewalOutcomeNotes(event.target.value)}
                            rows={4}
                            placeholder="Add renewal discussion notes..."
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary-500"
                        />
                    </div>
                </div>
            </Modal>

            <EnquiryFollowUpModal
                isOpen={followUpModalOpen}
                onClose={() => { setFollowUpModalOpen(false); setEnquiryToFollowUp(null); }}
                enquiry={enquiryToFollowUp}
                staffOptions={followUpStaffOptions}
            />

            {showChatModal && enquiryToFollowUp && (
                <ChatModal
                    isOpen={showChatModal}
                    onClose={() => { setShowChatModal(false); setEnquiryToFollowUp(null); }}
                    entityType="ENQUIRY"
                    entityId={enquiryToFollowUp.id}
                />
            )}
        </div>
    )
}
