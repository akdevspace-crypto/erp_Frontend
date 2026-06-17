import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck, ClipboardList, PhoneCall } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { Modal } from '../../../components/Modal'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useConvertToAdmission, useEnquiries } from '../../enquiry/hooks/useEnquiry'
import type { Enquiry } from '../../enquiry/types'

const extractQualificationValue = (comments: string | undefined, label: string) => {
    const match = String(comments || '').match(new RegExp(`${label}:\\s*([^\\n]+)`, 'i'))
    return match?.[1]?.trim() || ''
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

const getLeadQualification = (enquiry: Enquiry) => {
    const quality = extractQualificationValue(enquiry.comments, 'Lead Quality') || enquiry.automationPriority || 'Cold'
    const intent = extractQualificationValue(enquiry.comments, 'Intent') || 'Not qualified'
    const followUpPriority = extractQualificationValue(enquiry.comments, 'Follow-up Priority') || 'Not set'
    const leadValidity = getLatestFollowUpValue(enquiry, 'Lead Validity') || 'Not filtered'
    const conversionReadiness = getLatestFollowUpValue(enquiry, 'Conversion Readiness') || 'Discussion Stage'
    const urgency = getLatestFollowUpValue(enquiry, 'Urgency') || followUpPriority

    return {
        quality,
        intent,
        followUpPriority,
        leadValidity,
        conversionReadiness,
        urgency,
        isInvalid: [quality, intent, leadValidity, conversionReadiness].some((value) => (
            String(value || '').toLowerCase().includes('fake') ||
            String(value || '').toLowerCase().includes('duplicate') ||
            String(value || '').toLowerCase().includes('not service related') ||
            String(value || '').toLowerCase().includes('not convertible')
        )),
        isReadyToConvert: conversionReadiness === 'Ready To Convert' || conversionReadiness === 'Converted',
        isUrgent: ['Immediate', 'Within 24 hours'].includes(urgency)
    }
}

export function ActiveEnquiries() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { data: enquiries = [], isLoading } = useEnquiries()
    const convertToAdmission = useConvertToAdmission()
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
    const [qualityFilter, setQualityFilter] = useState('')
    const [priorityFilter, setPriorityFilter] = useState('')
    const [actionFilter, setActionFilter] = useState('')
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
    const [patientName, setPatientName] = useState('')

    useEffect(() => {
        setSearchQuery(searchParams.get('search') || '')
    }, [searchParams])

    const activeEnquiries = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        return enquiries
            .filter((enquiry) => !enquiry.admissionId)
            .filter((enquiry) => {
                const qualification = getLeadQualification(enquiry)
                if (qualityFilter === 'Valid' && (qualification.isInvalid || enquiry.status === 'Lost')) return false
                if (qualityFilter === 'Fake / Invalid' && !qualification.isInvalid && enquiry.status !== 'Lost') return false
                if (qualityFilter === 'Genuine' && qualification.leadValidity !== 'Genuine') return false
                if (qualityFilter && !['Valid', 'Fake / Invalid', 'Genuine'].includes(qualityFilter) && qualification.quality !== qualityFilter) return false
                if (priorityFilter && qualification.followUpPriority !== priorityFilter) return false
                if (actionFilter === 'Ready To Convert' && !qualification.isReadyToConvert) return false
                if (actionFilter === 'Urgent' && !qualification.isUrgent) return false
                if (actionFilter === 'Doubtful' && qualification.leadValidity !== 'Doubtful') return false
                if (actionFilter === 'Needs Filtering' && qualification.leadValidity !== 'Not filtered') return false
                if (!query) return true
                return [
                    enquiry.refNo,
                    enquiry.clientName,
                    enquiry.mobile,
                    enquiry.service,
                    enquiry.patientName,
                    qualification.quality,
                    qualification.intent,
                    qualification.followUpPriority,
                    qualification.leadValidity,
                    qualification.conversionReadiness,
                    qualification.urgency
                ].some((value) => String(value || '').toLowerCase().includes(query))
            })
    }, [actionFilter, enquiries, priorityFilter, qualityFilter, searchQuery])

    const convertedSearchMatch = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return null

        return enquiries.find((enquiry) => {
            if (!enquiry.admissionId) return false
            return [
                enquiry.refNo,
                enquiry.clientName,
                enquiry.mobile,
                enquiry.patientName,
                enquiry.admittedPatientName
            ].some((value) => String(value || '').toLowerCase().includes(query))
        }) || null
    }, [enquiries, searchQuery])

    const openAdmissionModal = (enquiry: Enquiry) => {
        if (getLeadQualification(enquiry).isInvalid || enquiry.status === 'Lost') return
        setSelectedEnquiry(enquiry)
        setPatientName(enquiry.patientName || enquiry.clientName)
    }

    const handleConvert = () => {
        if (!selectedEnquiry) return
        convertToAdmission.mutate(
            {
                id: selectedEnquiry.id,
                data: {
                    patientName,
                    status: 'ACTIVE'
                }
            },
            {
                onSuccess: () => {
                    setSelectedEnquiry(null)
                    setPatientName('')
                    navigate(`/crm/admission-tracking?search=${encodeURIComponent(selectedEnquiry.refNo || selectedEnquiry.clientName || '')}`)
                }
            }
        )
    }

    const columns: Column<Enquiry>[] = [
        {
            key: 'refNo',
            header: 'Lead ID',
            sortable: true,
            cell: (enquiry) => (
                <div className="flex flex-col">
                    <span className="font-black text-gray-900 dark:text-gray-100">{enquiry.refNo}</span>
                    <span className="text-xs font-medium text-gray-500">{new Date(enquiry.createdAt).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            key: 'clientName',
            header: 'Client',
            sortable: true,
            cell: (enquiry) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{enquiry.clientName}</span>
                    <span className="text-xs font-semibold text-primary-600">{enquiry.mobile}</span>
                </div>
            )
        },
        {
            key: 'service',
            header: 'Service',
            cell: (enquiry) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{enquiry.service}</span>
                    <span className="text-xs text-gray-500">{enquiry.mode || 'Enquiry'}</span>
                </div>
            )
        },
        {
            key: 'patientName',
            header: 'Patient',
            cell: (enquiry) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{enquiry.patientName || 'Not captured'}</span>
                    <span className="text-xs text-gray-500">{enquiry.patientHealthCondition || 'Health notes pending'}</span>
                </div>
            )
        },
        {
            key: 'automationPriority',
            header: 'Lead Quality',
            cell: (enquiry) => {
                const qualification = getLeadQualification(enquiry)
                return (
                    <div className="flex flex-col">
                        <StatusHighlighter value={qualification.quality} />
                        <span className="mt-1 text-xs font-medium text-gray-500">{qualification.followUpPriority}</span>
                    </div>
                )
            }
        },
        {
            key: 'leadValidity',
            header: 'Lead Filter',
            cell: (enquiry) => {
                const qualification = getLeadQualification(enquiry)
                return (
                    <div className="flex flex-col">
                        <StatusHighlighter value={qualification.leadValidity} />
                        <span className="mt-1 text-xs font-medium text-gray-500">{qualification.urgency}</span>
                    </div>
                )
            }
        },
        {
            key: 'conversionReadiness',
            header: 'Conversion',
            cell: (enquiry) => {
                const qualification = getLeadQualification(enquiry)
                return (
                    <div className="flex flex-col">
                        <StatusHighlighter value={qualification.conversionReadiness} />
                        {qualification.isReadyToConvert && (
                            <span className="mt-1 text-xs font-black text-emerald-600">Action required</span>
                        )}
                    </div>
                )
            }
        },
        {
            key: 'comments',
            header: 'Intent',
            cell: (enquiry) => {
                const qualification = getLeadQualification(enquiry)
                return (
                    <div className="max-w-[220px] text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {qualification.intent}
                    </div>
                )
            }
        },
        {
            key: 'status',
            header: 'Stage',
            cell: (enquiry) => <StatusHighlighter value={enquiry.status} />
        }
    ]

    return (
        <div className="flex h-full flex-col bg-transparent dark:bg-black">
            <PageHeader
                title="Active Enquiries"
                subtitle="Live enquiry pipeline before admission conversion."
                breadcrumbs={[{ label: 'Enquiry Desk' }, { label: 'Active Enquiries' }]}
            />

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search lead, client, mobile, service, qualification, or intent..."
                filters={[
                    {
                        name: 'quality',
                        value: qualityFilter,
                        onChange: (event) => setQualityFilter(event.target.value),
                        options: [
                            { value: '', label: 'All Leads' },
                            { value: 'Valid', label: 'Valid Leads' },
                            { value: 'Genuine', label: 'Genuine Leads' },
                            { value: 'Hot', label: 'Hot Leads' },
                            { value: 'Warm', label: 'Warm Leads' },
                            { value: 'Cold', label: 'Cold Leads' },
                            { value: 'Fake / Invalid', label: 'Fake / Invalid' }
                        ]
                    },
                    {
                        name: 'priority',
                        value: priorityFilter,
                        onChange: (event) => setPriorityFilter(event.target.value),
                        options: [
                            { value: '', label: 'All Follow-ups' },
                            { value: 'Today', label: 'Today' },
                            { value: 'Within 24 hours', label: 'Within 24 hours' },
                            { value: 'This week', label: 'This week' },
                            { value: 'No follow-up needed', label: 'No follow-up needed' }
                        ]
                    },
                    {
                        name: 'action',
                        value: actionFilter,
                        onChange: (event) => setActionFilter(event.target.value),
                        options: [
                            { value: '', label: 'All Actions' },
                            { value: 'Ready To Convert', label: 'Ready To Convert' },
                            { value: 'Urgent', label: 'Urgent Leads' },
                            { value: 'Doubtful', label: 'Doubtful Leads' },
                            { value: 'Needs Filtering', label: 'Needs Filtering' }
                        ]
                    }
                ]}
            />

            {convertedSearchMatch && activeEnquiries.length === 0 && (
                <div className="mb-4 rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-900">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span>
                            {convertedSearchMatch.refNo} is already converted to admission, so it is not shown in Active Enquiries.
                        </span>
                        <button
                            onClick={() => navigate(`/crm/admission-tracking?search=${encodeURIComponent(convertedSearchMatch.refNo)}`)}
                            className="rounded-lg bg-primary-600 px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-primary-700"
                        >
                            Open Admission Tracking
                        </button>
                    </div>
                </div>
            )}

            <DataTable
                data={activeEnquiries}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                emptyStateMessage={convertedSearchMatch ? 'This enquiry has already moved to Admission Tracking.' : 'No active enquiries are waiting for admission.'}
                actionsTitle="Workflow"
                actions={(enquiry) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/crm/enquiry-follow-up')}
                            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-transparent dark:text-gray-200"
                        >
                            <PhoneCall className="mr-1.5 h-3.5 w-3.5" />
                            Follow Up
                        </button>
                        <button
                            onClick={() => openAdmissionModal(enquiry)}
                            disabled={getLeadQualification(enquiry).isInvalid || enquiry.status === 'Lost'}
                            className="inline-flex items-center rounded-lg bg-primary-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-700"
                        >
                            <CalendarCheck className="mr-1.5 h-3.5 w-3.5" />
                            Convert
                        </button>
                    </div>
                )}
            />

            <Modal
                isOpen={Boolean(selectedEnquiry)}
                onClose={() => setSelectedEnquiry(null)}
                title="Convert to Admission"
                type="success"
                confirmLabel={convertToAdmission.isPending ? 'Saving...' : 'Create Admission'}
                onConfirm={handleConvert}
            >
                <div className="mt-3 space-y-4 text-left">
                    <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4 text-sm text-primary-900">
                        <div className="flex items-center gap-2 font-black">
                            <ClipboardList className="h-4 w-4" />
                            {selectedEnquiry?.refNo} - {selectedEnquiry?.clientName}
                        </div>
                        <p className="mt-1 text-xs font-medium">{selectedEnquiry?.service} enquiry will become an active admission.</p>
                    </div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Patient Name
                        <input
                            value={patientName}
                            onChange={(event) => setPatientName(event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-white/10 dark:bg-black dark:text-gray-100"
                            placeholder="Enter patient name"
                        />
                    </label>
                </div>
            </Modal>
        </div>
    )
}
