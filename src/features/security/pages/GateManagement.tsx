import { useMemo, useState, type FormEvent } from 'react'
import { CalendarClock, Eye, KeyRound, LogIn, LogOut, Plus, RefreshCw, ShieldCheck } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { Input } from '../../../components/Input'
import { Modal } from '../../../components/Modal'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useCheckInExpectedVisitor, useCheckoutGateEntry, useCreateExpectedVisitor, useCreateGateEntry, useGateEntries, useRequestOTP, useVerifyOTP } from '../hooks/useSecurity'
import { VisitorPassModal } from '../components/VisitorPassModal'
import type { GateEntry } from '../types'

const initialForm = {
    visitorName: '',
    mobile: '',
    purpose: '',
    visitingPerson: '',
    department: '',
    vehicleNo: '',
    remarks: '',
    expectedAt: ''
}

const formatTime = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const normalizeStatus = (value?: string) => String(value || '').trim().toLowerCase()
const visitorCheckoutOtpPurpose = 'Visitor checkout verification'

const getCheckoutOtp = (entry: GateEntry) => entry.otpVerification?.[visitorCheckoutOtpPurpose]
const isCheckoutOtpVerified = (entry: GateEntry) => getCheckoutOtp(entry)?.status === 'VERIFIED'

export function GateManagement() {
    const { data: entries = [], isLoading, refetch, isFetching } = useGateEntries()
    const createEntry = useCreateGateEntry()
    const createExpectedVisitor = useCreateExpectedVisitor()
    const checkInExpectedVisitor = useCheckInExpectedVisitor()
    const checkoutEntry = useCheckoutGateEntry()
    const requestOTP = useRequestOTP()
    const verifyOTP = useVerifyOTP()
    const [searchQuery, setSearchQuery] = useState('')
    const [formData, setFormData] = useState(initialForm)
    const [selectedEntry, setSelectedEntry] = useState<GateEntry | null>(null)
    const [verifyEntry, setVerifyEntry] = useState<GateEntry | null>(null)
    const [checkoutOtp, setCheckoutOtp] = useState('')
    const [entryMode, setEntryMode] = useState<'checkIn' | 'expected'>('checkIn')

    const visitorEntries = useMemo(() => entries.filter((entry) => entry.entryType !== 'VEHICLE' && entry.entryType !== 'STAFF'), [entries])
    const activeEntries = useMemo(() => visitorEntries.filter((entry) => normalizeStatus(entry.status) === 'checked in'), [visitorEntries])
    const expectedEntries = useMemo(() => visitorEntries.filter((entry) => normalizeStatus(entry.status) === 'expected'), [visitorEntries])
    const filteredEntries = useMemo(() => {
        const query = searchQuery.toLowerCase()
        return activeEntries.filter((entry) =>
            String(entry.visitorName || '').toLowerCase().includes(query) ||
            String(entry.mobile || '').toLowerCase().includes(query) ||
            String(entry.purpose || '').toLowerCase().includes(query) ||
            String(entry.visitingPerson || '').toLowerCase().includes(query)
        )
    }, [activeEntries, searchQuery])

    const handleChange = (key: keyof typeof initialForm, value: string) => {
        setFormData((current) => ({ ...current, [key]: value }))
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        try {
            if (entryMode === 'expected') {
                await createExpectedVisitor.mutateAsync(formData)
            } else {
                await createEntry.mutateAsync(formData)
            }
            setFormData(initialForm)
        } catch {
            // Toast is handled by the mutation hook.
        }
    }

    const handleCheckout = (entry: GateEntry) => {
        if (!isCheckoutOtpVerified(entry)) return
        const remarks = window.prompt(`Checkout remarks for ${entry.visitorName || 'visitor'}`, '')
        checkoutEntry.mutate({ id: entry.id, remarks: remarks || undefined })
    }

    const handleRequestCheckoutOtp = async (entry: GateEntry) => {
        try {
            await requestOTP.mutateAsync({
                mobile: entry.mobile,
                purpose: visitorCheckoutOtpPurpose,
                referenceId: entry.id
            })
            await refetch()
        } catch {
            // Toast is handled by the mutation hook.
        }
    }

    const handleVerifyCheckoutOtp = async () => {
        const otpLog = verifyEntry ? getCheckoutOtp(verifyEntry) : null
        if (!otpLog) return

        try {
            await verifyOTP.mutateAsync({ id: otpLog.id, otp: checkoutOtp })
            setCheckoutOtp('')
            setVerifyEntry(null)
            await refetch()
        } catch {
            // Keep modal open so the operator can retry.
        }
    }

    const handleExpectedCheckIn = async (entry: GateEntry) => {
        const remarks = window.prompt(`Arrival remarks for ${entry.visitorName || 'visitor'}`, '')
        try {
            await checkInExpectedVisitor.mutateAsync({ id: entry.id, remarks: remarks || undefined })
            setSearchQuery('')
        } catch {
            // Toast is handled by the mutation hook.
        }
    }

    const columns: Column<GateEntry>[] = [
        { key: 'visitorName', header: 'Visitor', sortable: true, cell: (entry) => <span className="font-black text-slate-900">{entry.visitorName || '-'}</span> },
        { key: 'mobile', header: 'Mobile' },
        { key: 'purpose', header: 'Purpose' },
        { key: 'visitingPerson', header: 'Visiting', cell: (entry) => entry.visitingPerson || entry.department || '-' },
        { key: 'vehicleNo', header: 'Vehicle', cell: (entry) => entry.vehicleNo || '-' },
        { key: 'checkInAt', header: 'Check In', cell: (entry) => formatTime(entry.checkInAt), sortable: true },
        {
            key: 'checkoutOtp',
            header: 'Checkout OTP',
            cell: (entry) => {
                const otpLog = getCheckoutOtp(entry)
                return otpLog ? <StatusHighlighter value={otpLog.status} /> : <span className="text-xs font-bold text-slate-400">Not Sent</span>
            }
        },
        { key: 'status', header: 'Status', cell: (entry) => <StatusHighlighter value={entry.status} /> }
    ]

    return (
        <div className="flex h-full flex-col space-y-6 bg-transparent">
            <PageHeader
                title="Gate Management"
                subtitle="Live visitor check-in and checkout register for the selected unit."
                breadcrumbs={[{ label: 'Security' }, { label: 'Gate Management' }]}
            />

            <div className="grid gap-3 md:grid-cols-3">
                {[
                    { label: 'Currently Inside', value: activeEntries.length, tone: 'bg-primary-50 text-primary-700' },
                    { label: 'Expected Visitors', value: expectedEntries.length, tone: 'bg-amber-50 text-amber-700' },
                    { label: 'Total Entries', value: visitorEntries.length, tone: 'bg-slate-50 text-slate-700' },
                    { label: 'Checked Out', value: visitorEntries.filter((entry) => normalizeStatus(entry.status) === 'checked out').length, tone: 'bg-emerald-50 text-emerald-700' }
                ].map((item) => (
                    <div key={item.label} className={`rounded-2xl border border-slate-100 px-4 py-3 ${item.tone}`}>
                        <p className="text-2xl font-black">{item.value}</p>
                        <p className="text-xs font-black uppercase tracking-wide">{item.label}</p>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary-600" />
                        <h2 className="text-lg font-black text-slate-950">New Visitor Entry</h2>
                    </div>
                    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                        <button
                            type="button"
                            onClick={() => setEntryMode('checkIn')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-black ${entryMode === 'checkIn' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600'}`}
                        >
                            Check In Now
                        </button>
                        <button
                            type="button"
                            onClick={() => setEntryMode('expected')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-black ${entryMode === 'expected' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600'}`}
                        >
                            Expected Visitor
                        </button>
                    </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    <Input label="Visitor Name" value={formData.visitorName} onChange={(event) => handleChange('visitorName', event.target.value)} required />
                    <Input label="Mobile" value={formData.mobile} onChange={(event) => handleChange('mobile', event.target.value)} required />
                    <Input label="Purpose" value={formData.purpose} onChange={(event) => handleChange('purpose', event.target.value)} required />
                    <Input label="Visiting Person" value={formData.visitingPerson} onChange={(event) => handleChange('visitingPerson', event.target.value)} />
                    <Input label="Department" value={formData.department} onChange={(event) => handleChange('department', event.target.value)} />
                    <Input label="Vehicle No." value={formData.vehicleNo} onChange={(event) => handleChange('vehicleNo', event.target.value)} />
                    {entryMode === 'expected' && (
                        <Input label="Expected Time" type="datetime-local" value={formData.expectedAt} onChange={(event) => handleChange('expectedAt', event.target.value)} />
                    )}
                    <div className="md:col-span-2">
                        <Input label="Remarks" value={formData.remarks} onChange={(event) => handleChange('remarks', event.target.value)} />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={createEntry.isPending || createExpectedVisitor.isPending}
                            className="h-11 w-full rounded-xl bg-primary-600 px-4 text-sm font-black text-white shadow-sm hover:bg-primary-700 disabled:opacity-60"
                        >
                            {createEntry.isPending || createExpectedVisitor.isPending ? 'Saving...' : entryMode === 'expected' ? 'Save Expected Visitor' : 'Check In Visitor'}
                        </button>
                    </div>
                </div>
            </form>

            <div className="rounded-3xl border border-amber-100 bg-amber-50/60 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <CalendarClock className="h-5 w-5 text-amber-600" />
                        <h2 className="text-lg font-black text-slate-950">Expected Visitors</h2>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-amber-700">{expectedEntries.length} Pending</span>
                </div>
                {expectedEntries.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-amber-200 bg-white/70 px-4 py-6 text-center text-sm font-bold text-slate-500">
                        No expected visitors waiting for arrival.
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {expectedEntries.map((entry) => (
                            <div key={entry.id} className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-base font-black text-slate-950">{entry.visitorName}</p>
                                        <p className="text-sm font-bold text-slate-500">{entry.purpose}</p>
                                    </div>
                                    <StatusHighlighter value={entry.status} />
                                </div>
                                <div className="mt-3 space-y-1 text-xs font-bold text-slate-500">
                                    <p>Mobile: <span className="text-slate-800">{entry.mobile}</span></p>
                                    <p>Visiting: <span className="text-slate-800">{entry.visitingPerson || entry.department || '-'}</span></p>
                                    <p>Expected: <span className="text-slate-800">{formatTime(entry.expectedAt)}</span></p>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedEntry(entry)}
                                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-200"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        View
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleExpectedCheckIn(entry)}
                                        disabled={checkInExpectedVisitor.isPending}
                                        className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-black text-white hover:bg-primary-700 disabled:opacity-60"
                                    >
                                        <LogIn className="h-3.5 w-3.5" />
                                        Arrived
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-black text-slate-950">Active Visitors</h2>
                        <p className="text-sm font-bold text-slate-500">Visitors currently inside and waiting for checkout.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:bg-slate-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                <FilterSection searchQuery={searchQuery} onSearchChange={(event) => setSearchQuery(event.target.value)} searchPlaceholder="Search active visitors..." />

                <div className="min-h-[320px]">
                    <DataTable
                        data={filteredEntries}
                        columns={columns}
                        keyExtractor={(entry) => entry.id}
                        isLoading={isLoading}
                        emptyStateMessage={activeEntries.length > 0 ? 'No active visitors match the current search.' : 'No active visitors are currently checked in.'}
                        actions={(entry) => (
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedEntry(entry)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-black text-primary-700 hover:bg-primary-100"
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    Pass
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRequestCheckoutOtp(entry)}
                                    disabled={requestOTP.isPending || isCheckoutOtpVerified(entry)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                                    title={isCheckoutOtpVerified(entry) ? 'Checkout OTP already verified' : 'Send checkout OTP'}
                                >
                                    <KeyRound className="h-3.5 w-3.5" />
                                    OTP
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCheckoutOtp('')
                                        setVerifyEntry(entry)
                                    }}
                                    disabled={!getCheckoutOtp(entry) || isCheckoutOtpVerified(entry)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                                    title="Verify checkout OTP"
                                >
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Verify
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleCheckout(entry)}
                                    disabled={checkoutEntry.isPending || !isCheckoutOtpVerified(entry)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-600 hover:bg-rose-100 disabled:opacity-60"
                                    title={isCheckoutOtpVerified(entry) ? 'Check out visitor' : 'Verify checkout OTP before checkout'}
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    Check Out
                                </button>
                            </div>
                        )}
                    />
                </div>
            </section>

            <VisitorPassModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
            <Modal
                isOpen={Boolean(verifyEntry)}
                onClose={() => {
                    setCheckoutOtp('')
                    setVerifyEntry(null)
                }}
                title="Verify Checkout OTP"
                message={verifyEntry ? `${verifyEntry.visitorName || 'Visitor'} checkout verification` : undefined}
                type="success"
                confirmLabel={verifyOTP.isPending ? 'Verifying...' : 'Verify OTP'}
                confirmDisabled={verifyOTP.isPending || !/^\d{6}$/.test(checkoutOtp)}
                onConfirm={handleVerifyCheckoutOtp}
            >
                <div className="mt-5 text-left">
                    <Input
                        label="Six-Digit OTP"
                        value={checkoutOtp}
                        onChange={(event) => setCheckoutOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="000000"
                    />
                </div>
            </Modal>
        </div>
    )
}
