import { useRef, useState } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { ActionBar } from '../../../components/ActionBar'
import { Drawer } from '../../../components/Drawer'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import { Edit2, Eye } from 'lucide-react'
import { useComplaints, useCreateComplaint } from '../hooks/useCustomerCare'
import { useToast } from '../../../components/Toast'

export function Complaints() {
    const { data: dbComplaints = [], isLoading } = useComplaints()
    const createComplaint = useCreateComplaint()
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedAttachmentName, setSelectedAttachmentName] = useState('')
    const attachmentInputRef = useRef<HTMLInputElement | null>(null)

    // Standard Drawer layout management
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [drawerMode, setDrawerMode] = useState<'raise' | 'update' | 'view'>('raise')
    const [selectedComplaint, setSelectedComplaint] = useState<any>(null)

    const resetAttachment = () => {
        setSelectedAttachmentName('')
        if (attachmentInputRef.current) {
            attachmentInputRef.current.value = ''
        }
    }

    const handleRaise = () => {
        setSelectedComplaint(null)
        setDrawerMode('raise')
        resetAttachment()
        setIsDrawerOpen(true)
    }

    const handleUpdate = (row: any) => {
        setSelectedComplaint(row)
        setDrawerMode('update')
        resetAttachment()
        setIsDrawerOpen(true)
    }

    const handleView = (row: any) => {
        setSelectedComplaint(row)
        setDrawerMode('view')
        resetAttachment()
        setIsDrawerOpen(true)
    }

    const columns: Column<any>[] = [
        { key: 'sno', header: 'S.No', cell: (_, index) => <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">{index + 1}</span> },
        { key: 'clientRef', header: 'Client Ref. No.', cell: (row) => <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{row.ref || row.ticketNo || row.id.split('-')[0]}</span> },
        {
            key: 'serviceDetails', header: 'Service Details', cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">{row.service || row.category || 'General Form'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">ACARE, Coimbatore</span>
                </div>
            )
        },
        {
            key: 'clientDetails', header: 'Client Details', cell: (row) => (
                <div className="flex flex-col items-center justify-center">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{row.clientName || 'Walk-in'}</span>
                    {row.phone && <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">{row.phone}</span>}
                </div>
            )
        },
        { key: 'complaintDate', header: 'Complaint Date', cell: (row) => <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{row.date || new Date().toISOString().split('T')[0]}</span> },
        { key: 'staffAllocation', header: 'Staff Allocation', cell: (row) => <span className="text-sm text-gray-700 dark:text-gray-300">{row.staff}</span> },
        { key: 'complaintStatus', header: 'Complaint Status', cell: (row) => <StatusHighlighter value={row.status} /> },
        {
            key: 'action', header: '', cell: (row) => {
                if (row.status === 'Issue Rectified' || row.status === 'Contract Terminated') {
                    return (
                        <button onClick={() => handleView(row)} className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-white/5 rounded" title="View Details">
                            <Eye className="h-4 w-4" />
                        </button>
                    )
                }
                return (
                    <button onClick={() => handleUpdate(row)} className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-white/5 rounded" title="Update Complaint">
                        <Edit2 className="h-4 w-4" />
                    </button>
                )
            }
        }
    ]

    // Form submission wrapper
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)

        if (drawerMode === 'raise') {
            createComplaint.mutate({
                clientName: (fd.get('reference') as string) || 'Walk-in Client',
                category: 'General Complaint',
                priority: 'MEDIUM',
                status: 'New Complaint',
                description: fd.get('description') as string,
                unitId: fd.get('unitId') as string
            } as any, {
                onSuccess: () => {
                    resetAttachment()
                    setIsDrawerOpen(false)
                }
            })
        } else {
            toast({ type: 'success', title: 'Updated', message: 'Complaint has been updated successfully' })
            resetAttachment()
            setIsDrawerOpen(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-transparent dark:bg-black">
            <PageHeader
                title="Customer Complaints"
                breadcrumbs={[
                    { label: 'Home' },
                    { label: 'Customer Complaints' }
                ]}
            />

            <ActionBar
                onAdd={handleRaise}
                addLabel="Raise New Complaint"
            />

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
                searchPlaceholder="Search complaints..."
            />

            {isLoading ? (
                <div className="animate-pulse bg-white dark:bg-black border border-gray-200 dark:border-white/10 shadow-sm rounded-lg h-64 p-6" />
            ) : (
                <DataTable
                    data={dbComplaints.length > 0 ? dbComplaints : []}
                    columns={columns}
                    keyExtractor={(item: any) => item.id}
                    emptyStateMessage="No complaints available in table"
                />
            )}

            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => {
                    resetAttachment()
                    setIsDrawerOpen(false)
                }}
                title={
                    drawerMode === 'raise'
                        ? 'Raise Customer Complaint'
                        : drawerMode === 'view'
                            ? 'View Customer Complaint Details'
                            : 'Update Customer Complaint'
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4 pb-16">
                    <Select
                        label="Unit Name"
                        name="unitId"
                        options={[{ value: '11111111-1111-1111-1111-111111111111', label: 'Universal Edler Care - Coimbatore' }, { value: '22222222-2222-2222-2222-222222222222', label: 'Anbu Sri Sai Home Health Care - Coimbatore' }]}
                        defaultValue={drawerMode === 'raise' ? '11111111-1111-1111-1111-111111111111' : '22222222-2222-2222-2222-222222222222'}
                        disabled={drawerMode === 'view'}
                    />

                    {drawerMode === 'raise' ? (
                        <Input
                            label="Client Name / Ref. No."
                            name="reference"
                            placeholder="Search Ref No. or Name or Mobile No."
                        />
                    ) : (
                        <Input
                            label="Client Name / Ref. No."
                            defaultValue={`${selectedComplaint?.ref || ''} - ${selectedComplaint?.clientName || ''} - ${selectedComplaint?.phone || ''}`}
                            readOnly
                            disabled
                        />
                    )}

                    <Input
                        label="Complaint Date *"
                        name="date"
                        type="date"
                        defaultValue={drawerMode === 'raise' ? '' : '2025-03-18'}
                        disabled={drawerMode === 'view'}
                    />

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Complaint (Comments) *</label>
                        <textarea
                            name="description"
                            className="w-full border border-gray-300 dark:border-white/10 rounded-md shadow-sm p-3 focus:ring-primary-500 focus:border-primary-500 min-h-[100px] text-sm bg-transparent text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-white/5 disabled:text-gray-500"
                            placeholder="Enter Feedback"
                            defaultValue={drawerMode === 'raise' ? '' : selectedComplaint?.description || 'CUSTOMER WHAT REFUND'}
                            disabled={drawerMode === 'view'}
                        />
                    </div>

                    {drawerMode === 'view' || drawerMode === 'update' ? (
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Document Attached</label>
                            <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all block py-2 font-medium">
                                {selectedComplaint?.ref || 'DOC'}_complaint_26032025171028.jpeg
                            </a>
                        </div>
                    ) : null}

                    {drawerMode !== 'view' && (
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Complaint Attachment *</label>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">(Audio files or Documents)</span>
                            <div className="flex border border-gray-300 dark:border-white/10 rounded-md overflow-hidden shadow-sm text-sm">
                                <input
                                    type="text"
                                    readOnly
                                    value={selectedAttachmentName}
                                    placeholder="Choose file"
                                    className="flex-1 p-2 bg-transparent text-gray-900 dark:text-gray-100"
                                />
                                <input
                                    ref={attachmentInputRef}
                                    type="file"
                                    name="attachment"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.txt,.mp3,.wav,.m4a,.aac,.ogg"
                                    onChange={(e) => setSelectedAttachmentName(e.target.files?.[0]?.name || '')}
                                />
                                <button
                                    type="button"
                                    onClick={() => attachmentInputRef.current?.click()}
                                    className="px-4 py-2 bg-gray-100 dark:bg-white/10 border-l border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"
                                >
                                    Browse
                                </button>
                            </div>
                        </div>
                    )}

                    <Select
                        label="Request Staff Allocation *"
                        options={[
                            { value: 'none', label: '-- Select the Status --' },
                            { value: 'no', label: 'Not Required' },
                            { value: 'yes', label: 'Yes (Staff Allocation is Required)' }
                        ]}
                        defaultValue={drawerMode === 'raise' ? 'none' : 'yes'}
                        disabled={drawerMode === 'view'}
                    />

                    {drawerMode !== 'raise' && (
                        <Select
                            label="Complaint Status *"
                            options={[
                                { value: 'Issue Rectified', label: 'Issue Rectified' },
                                { value: 'Contract Terminated', label: 'Contract Terminated' },
                                { value: 'Need Followup', label: 'Need Followup' },
                                { value: 'New Complaint', label: 'New Complaint' }
                            ]}
                            defaultValue={selectedComplaint?.status || "Contract Terminated"}
                            disabled={drawerMode === 'view'}
                        />
                    )}

                    {drawerMode !== 'view' && (
                        <div className="pt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-white/10 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    resetAttachment()
                                    setIsDrawerOpen(false)
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-white/10 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-white/5 font-medium shadow-sm transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium shadow-sm transition-colors text-sm"
                            >
                                {drawerMode === 'raise' ? 'Raise Complaint' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </Drawer>
        </div>
    )
}
