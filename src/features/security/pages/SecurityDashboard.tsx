import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, ClipboardList, DoorOpen, LogOut, ShieldCheck, Truck, UserCog, Users } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useGateEntries, useCheckoutGateEntry } from '../hooks/useSecurity'
import type { GateEntry } from '../types'

const normalizeStatus = (value?: string) => String(value || '').trim().toLowerCase()
const todayKey = () => new Date().toISOString().slice(0, 10)
const dateKey = (value?: string | null) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toISOString().slice(0, 10)
}

const formatTime = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const entryName = (entry: GateEntry) => {
    if (entry.entryType === 'VEHICLE') return entry.vehicleNo || '-'
    if (entry.entryType === 'STAFF') return entry.staffName || entry.empId || '-'
    return entry.visitorName || '-'
}

const entryTypeLabel = (entry: GateEntry) => {
    if (entry.entryType === 'VEHICLE') return 'Vehicle'
    if (entry.entryType === 'STAFF') return 'Staff'
    return 'Visitor'
}

export function SecurityDashboard() {
    const { data: entries = [], isLoading } = useGateEntries()
    const checkoutEntry = useCheckoutGateEntry()
    const [queueType, setQueueType] = useState('ALL')
    const [viewingEntry, setViewingEntry] = useState<GateEntry | null>(null)

    const today = todayKey()
    const activeEntries = useMemo(() => entries.filter((entry) => normalizeStatus(entry.status) === 'checked in'), [entries])
    const expectedVisitors = useMemo(() => entries.filter((entry) => entry.entryType !== 'VEHICLE' && entry.entryType !== 'STAFF' && normalizeStatus(entry.status) === 'expected'), [entries])
    const todayEntries = useMemo(() => entries.filter((entry) => dateKey(entry.checkInAt || entry.createdAt) === today), [entries, today])
    const todayCheckedOut = useMemo(() => entries.filter((entry) => normalizeStatus(entry.status) === 'checked out' && dateKey(entry.checkOutAt || entry.updatedAt) === today), [entries, today])

    const queueRows = useMemo(() => {
        const rows = activeEntries.filter((entry) => 
            queueType === 'ALL' || 
            (queueType === 'VISITOR' ? (entry.entryType === 'VISITOR' || entry.entryType === 'VISITOR_PASS') : entry.entryType === queueType)
        )
        return rows.slice(0, 8)
    }, [activeEntries, queueType])

    const handleCheckout = (entry: GateEntry) => {
        if (!window.confirm(`Are you sure you want to check out ${entryName(entry)}?`)) return
        checkoutEntry.mutate({ id: entry.id })
    }

    const stats = [
        { label: 'Visitors Inside', value: activeEntries.filter((entry) => entry.entryType !== 'VEHICLE' && entry.entryType !== 'STAFF').length, icon: Users, tone: 'bg-primary-50 text-primary-700', href: '/security/gate-management' },
        { label: 'Staff Inside', value: activeEntries.filter((entry) => entry.entryType === 'STAFF').length, icon: UserCog, tone: 'bg-sky-50 text-sky-700', href: '/security/staff-register' },
        { label: 'Vehicles Inside', value: activeEntries.filter((entry) => entry.entryType === 'VEHICLE').length, icon: Truck, tone: 'bg-indigo-50 text-indigo-700', href: '/security/vehicle-register' },
        { label: 'Expected Visitors', value: expectedVisitors.length, icon: CalendarClock, tone: 'bg-amber-50 text-amber-700', href: '/security/gate-management' },
        { label: 'Today Entries', value: todayEntries.length, icon: DoorOpen, tone: 'bg-slate-50 text-slate-700', href: '/security/entry-logs' },
        { label: 'Today Checked Out', value: todayCheckedOut.length, icon: ShieldCheck, tone: 'bg-emerald-50 text-emerald-700', href: '/security/entry-logs' }
    ]

    const columns: Column<GateEntry>[] = [
        { key: 'entryType', header: 'Type', cell: entryTypeLabel, sortable: true },
        { 
            key: 'visitorName', 
            header: 'Name / Ref', 
            sortable: true, 
            cell: (entry) => (
                <div className="flex items-center gap-3">
                    {entry.photoUrl ? (
                        <img src={entry.photoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-black/5" />
                    ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-black/5">
                            {entryName(entry).charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <span className="block font-extrabold text-slate-900">{entryName(entry)}</span>
                        {(entry.entryType === 'VISITOR' || entry.entryType === 'VISITOR_PASS') && entry.category && entry.category !== 'GUEST' && (
                            <span className="mt-0.5 inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                                {entry.category}
                            </span>
                        )}
                        {entry.entryType === 'STAFF' && entry.designation && (
                            <span className="mt-0.5 inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                                {entry.designation}
                            </span>
                        )}
                    </div>
                </div>
            ) 
        },
        { key: 'mobile', header: 'Mobile', cell: (entry) => entry.mobile || entry.driverMobile || '-' },
        { key: 'purpose', header: 'Purpose', cell: (entry) => entry.purpose || '-' },
        { key: 'visitingPerson', header: 'Visiting', cell: (entry) => entry.visitingPerson || entry.department || '-' },
        { key: 'checkInAt', header: 'Check In', cell: (entry) => formatTime(entry.checkInAt), sortable: true },
        { key: 'status', header: 'Status', cell: (entry) => <StatusHighlighter value={entry.status} /> }
    ]

    const historyColumns: Column<GateEntry>[] = [
        { 
            key: 'visitorName', 
            header: 'Name / Ref', 
            sortable: true, 
            cell: (entry) => (
                <div className="flex items-center gap-3">
                    {entry.photoUrl ? (
                        <img src={entry.photoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-black/5" />
                    ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-black/5">
                            {entryName(entry).charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <span className="block font-extrabold text-slate-900">{entryName(entry)}</span>
                        {(entry.entryType === 'VISITOR' || entry.entryType === 'VISITOR_PASS') && entry.category && entry.category !== 'GUEST' && (
                            <span className="mt-0.5 inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                                {entry.category}
                            </span>
                        )}
                        {entry.entryType === 'STAFF' && entry.designation && (
                            <span className="mt-0.5 inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                                {entry.designation}
                            </span>
                        )}
                    </div>
                </div>
            ) 
        },
        { key: 'mobile', header: 'Mobile', cell: (entry) => entry.mobile || entry.driverMobile || '-' },
        { key: 'purpose', header: 'Purpose', cell: (entry) => entry.purpose || '-' },
        { key: 'visitingPerson', header: 'Visiting', cell: (entry) => entry.visitingPerson || entry.department || '-' },
        { key: 'checkInAt', header: 'Time Inside', cell: (entry) => (
            <div className="flex flex-col">
                <span className="text-xs text-slate-500">In: {formatTime(entry.checkInAt)}</span>
                <span className="text-xs font-bold text-slate-800">Out: {formatTime(entry.checkOutAt)}</span>
            </div>
        ) },
        { key: 'status', header: 'Status', cell: (entry) => <StatusHighlighter value={entry.status} /> }
    ]

    return (
        <div className="flex h-full flex-col space-y-6 bg-transparent">
            <PageHeader
                title="Security Dashboard"
                subtitle="Live gate, visitor, staff, vehicle, and checkout monitoring."
                breadcrumbs={[{ label: 'UNCF' }, { label: 'Security' }, { label: 'Dashboard' }]}
                action={(
                    <div className="flex flex-wrap gap-2">
                        <Link to="/security/gate-management" className="rounded-full bg-primary-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-primary-700">Gate Entry</Link>
                        <Link to="/security/entry-logs" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50">Entry Logs</Link>
                    </div>
                )}
            />

            <div className="grid gap-3 md:grid-cols-3 2xl:grid-cols-6">
                {stats.map((item) => (
                    <Link key={item.label} to={item.href} className={`rounded-2xl border border-slate-100 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${item.tone}`}>
                        <item.icon className="mb-3 h-5 w-5" />
                        <p className="text-2xl font-extrabold">{item.value}</p>
                        <p className="text-xs font-extrabold uppercase tracking-wide">{item.label}</p>
                    </Link>
                ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                {[
                    { label: 'Gate Management', href: '/security/gate-management' },
                    { label: 'Vehicle Register', href: '/security/vehicle-register' },
                    { label: 'Staff Register', href: '/security/staff-register' }
                ].map((item) => (
                    <Link key={item.href} to={item.href} className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-extrabold text-slate-700 shadow-sm hover:bg-primary-50 hover:text-primary-700">
                        <ClipboardList className="mb-3 h-5 w-5 text-primary-600" />
                        {item.label}
                    </Link>
                ))}
            </div>

            <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary-600">Action Queue</p>
                        <h2 className="text-xl font-extrabold text-slate-950">Currently inside</h2>
                        <p className="text-sm font-bold text-slate-500">Open movements that still need checkout.</p>
                    </div>
                    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                        {[
                            ['ALL', 'All'],
                            ['STAFF', 'Staff'],
                            ['VEHICLE', 'Vehicles'],
                            ['VISITOR', 'Visitors']
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setQueueType(value)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-extrabold ${queueType === value ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <DataTable
                    fullHeight={false}
                    data={queueRows}
                    columns={columns}
                    keyExtractor={(entry) => entry.id}
                    isLoading={isLoading}
                    emptyStateMessage="No active gate movements waiting for checkout."
                    actions={(entry) => (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setViewingEntry(entry)} className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-extrabold text-primary-700 hover:bg-primary-100">
                                Open
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCheckout(entry)}
                                disabled={checkoutEntry.isPending}
                                className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-600 hover:bg-rose-100 disabled:opacity-60"
                                title="Check out manually"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                Check Out
                            </button>
                        </div>
                    )}
                />
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="mb-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">History</p>
                    <h2 className="text-xl font-extrabold text-slate-950">Recently Visited</h2>
                    <p className="text-sm font-bold text-slate-500">History of visitors who completed their visit today.</p>
                </div>
                <DataTable
                    fullHeight={false}
                    data={todayCheckedOut.slice(0, 8)}
                    columns={historyColumns}
                    keyExtractor={(entry) => entry.id}
                    isLoading={isLoading}
                    emptyStateMessage="No visitors have checked out today."
                    actions={(entry) => (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setViewingEntry(entry)} className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-extrabold text-primary-700 hover:bg-primary-100">
                                Open
                            </button>
                        </div>
                    )}
                />
            </section>

            {/* VIEW MODAL */}
            {viewingEntry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">
                            {viewingEntry.entryType === 'VEHICLE' ? 'Vehicle Details' : viewingEntry.entryType === 'STAFF' ? 'Staff Details' : 'Visitor Details'}
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-500">Name / Ref:</span>
                                <span className="font-bold text-slate-800">{entryName(viewingEntry)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-500">Mobile:</span>
                                <span className="font-bold text-slate-800">{viewingEntry.mobile || viewingEntry.driverMobile || '-'}</span>
                            </div>
                            {(viewingEntry.entryType === 'VISITOR' || viewingEntry.entryType === 'VISITOR_PASS') && (
                                <div className="flex justify-between">
                                    <span className="font-semibold text-slate-500">Category:</span>
                                    <span className="font-bold text-slate-800">{viewingEntry.category || '-'}</span>
                                </div>
                            )}
                            {viewingEntry.entryType === 'STAFF' && (
                                <div className="flex justify-between">
                                    <span className="font-semibold text-slate-500">Designation / Dept:</span>
                                    <span className="font-bold text-slate-800">{viewingEntry.designation || viewingEntry.department || '-'}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-500">Purpose:</span>
                                <span className="font-bold text-slate-800">{viewingEntry.purpose || '-'}</span>
                            </div>
                            {(viewingEntry.entryType === 'VISITOR' || viewingEntry.entryType === 'VISITOR_PASS') && (
                                <div className="flex justify-between">
                                    <span className="font-semibold text-slate-500">Person / Resident Visiting:</span>
                                    <span className="font-bold text-slate-800">{viewingEntry.visitingPerson || '-'}</span>
                                </div>
                            )}
                            {viewingEntry.entryType === 'VEHICLE' && viewingEntry.driverName && (
                                <div className="flex justify-between">
                                    <span className="font-semibold text-slate-500">Driver Name:</span>
                                    <span className="font-bold text-slate-800">{viewingEntry.driverName}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-500">Check-In Time:</span>
                                <span className="font-bold text-slate-800">{formatTime(viewingEntry.checkInAt)}</span>
                            </div>
                            {viewingEntry.checkOutAt && (
                                <div className="flex justify-between">
                                    <span className="font-semibold text-slate-500">Check-Out Time:</span>
                                    <span className="font-bold text-slate-800">{formatTime(viewingEntry.checkOutAt)}</span>
                                </div>
                            )}
                            {viewingEntry.checkInAt && viewingEntry.checkOutAt && (
                                <div className="flex justify-between">
                                    <span className="font-semibold text-slate-500">Duration:</span>
                                    <span className="font-bold text-slate-800">
                                        {Math.round((new Date(viewingEntry.checkOutAt).getTime() - new Date(viewingEntry.checkInAt).getTime()) / 60000)} mins
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-500">Status:</span>
                                <span className="font-bold text-slate-800">
                                    {viewingEntry.checkOutAt ? 'Checked Out' : normalizeStatus(viewingEntry.status) === 'expected' ? 'Expected' : 'Currently Inside'}
                                </span>
                            </div>
                            {(viewingEntry.entryType === 'VISITOR' || viewingEntry.entryType === 'VISITOR_PASS') && (
                                <div className="flex justify-between">
                                    <span className="font-semibold text-slate-500">Reference:</span>
                                    <span className="font-bold text-slate-800 text-xs">{viewingEntry.id}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end pt-6">
                            <button onClick={() => setViewingEntry(null)} className="px-5 py-2 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
