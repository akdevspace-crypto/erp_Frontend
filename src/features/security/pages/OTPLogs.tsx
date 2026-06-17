import { useMemo, useState } from 'react'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { DataTable, type Column } from '../../../components/DataTable'
import { FilterSection } from '../../../components/FilterSection'
import { Input } from '../../../components/Input'
import { Modal } from '../../../components/Modal'
import { useOTPLogs, useRequestOTP, useVerifyOTP } from '../hooks/useSecurity'
import type { OTPLog } from '../types'

export function OTPLogs() {
    const { data: logs = [], isLoading } = useOTPLogs()
    const requestOTP = useRequestOTP()
    const verifyOTP = useVerifyOTP()
    const [searchQuery, setSearchQuery] = useState('')
    const [requestOpen, setRequestOpen] = useState(false)
    const [verifyLog, setVerifyLog] = useState<OTPLog | null>(null)
    const [requestForm, setRequestForm] = useState({ mobile: '', purpose: '', referenceId: '' })
    const [otp, setOtp] = useState('')

    const filteredLogs = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return logs

        return logs.filter((log) => [
            log.mobile,
            log.purpose,
            log.referenceId,
            log.status,
            log.deliveryStatus,
            log.requestedBy
        ].some((value) => String(value || '').toLowerCase().includes(query)))
    }, [logs, searchQuery])

    const submitRequest = async () => {
        try {
            await requestOTP.mutateAsync(requestForm)
            setRequestForm({ mobile: '', purpose: '', referenceId: '' })
            setRequestOpen(false)
        } catch {
            // The mutation toast already presents the API error.
        }
    }

    const submitVerification = async () => {
        if (!verifyLog) return
        try {
            await verifyOTP.mutateAsync({ id: verifyLog.id, otp })
            setOtp('')
            setVerifyLog(null)
        } catch {
            // Keep the modal open so the operator can retry.
        }
    }

    const columns: Column<OTPLog>[] = [
        { key: 'mobile', header: 'Mobile' },
        { key: 'purpose', header: 'Purpose' },
        { key: 'referenceId', header: 'Reference', cell: (entry) => entry.referenceId || '-' },
        { key: 'status', header: 'Status' },
        { key: 'deliveryStatus', header: 'Delivery' },
        { key: 'attempts', header: 'Attempts' },
        { key: 'requestedBy', header: 'Requested By', cell: (entry) => entry.requestedBy || '-' },
        {
            key: 'createdAt',
            header: 'Created At',
            sortable: true,
            cell: (entry) => new Date(entry.createdAt).toLocaleString()
        }
    ]

    return (
        <div className="flex h-full flex-col space-y-6 bg-transparent">
            <PageHeader
                title="OTP Logs"
                subtitle="Issue and verify time-limited security OTPs with a complete attempt and delivery trail."
                breadcrumbs={[{ label: 'Security' }, { label: 'OTP Logs' }]}
                action={(
                    <button
                        type="button"
                        onClick={() => setRequestOpen(true)}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white hover:bg-primary-700"
                    >
                        <KeyRound className="h-4 w-4" />
                        Send OTP
                    </button>
                )}
            />

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search mobile, purpose, reference, status, or requester..."
            />

            <DataTable
                data={filteredLogs}
                columns={columns}
                keyExtractor={(entry) => entry.id}
                isLoading={isLoading}
                actionsTitle="Verify"
                actions={(entry) => entry.status === 'PENDING' ? (
                    <button
                        type="button"
                        title="Verify OTP"
                        onClick={() => {
                            setOtp('')
                            setVerifyLog(entry)
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    >
                        <ShieldCheck className="h-4 w-4" />
                    </button>
                ) : null}
                emptyStateMessage="No OTP verification records found."
            />

            <Modal
                isOpen={requestOpen}
                onClose={() => setRequestOpen(false)}
                title="Send Security OTP"
                type="info"
                confirmLabel={requestOTP.isPending ? 'Sending...' : 'Send OTP'}
                confirmDisabled={requestOTP.isPending || !requestForm.mobile.trim() || !requestForm.purpose.trim()}
                onConfirm={submitRequest}
            >
                <div className="mt-5 space-y-4 text-left">
                    <Input
                        label="Mobile Number"
                        value={requestForm.mobile}
                        onChange={(event) => setRequestForm((current) => ({ ...current, mobile: event.target.value }))}
                        placeholder="+919876543210"
                    />
                    <Input
                        label="Purpose"
                        value={requestForm.purpose}
                        onChange={(event) => setRequestForm((current) => ({ ...current, purpose: event.target.value }))}
                        placeholder="Visitor checkout verification"
                    />
                    <Input
                        label="Reference ID"
                        value={requestForm.referenceId}
                        onChange={(event) => setRequestForm((current) => ({ ...current, referenceId: event.target.value }))}
                        placeholder="Optional gate entry or visitor reference"
                    />
                </div>
            </Modal>

            <Modal
                isOpen={Boolean(verifyLog)}
                onClose={() => {
                    setOtp('')
                    setVerifyLog(null)
                }}
                title="Verify Security OTP"
                message={verifyLog ? `${verifyLog.purpose} for ${verifyLog.mobile}` : undefined}
                type="success"
                confirmLabel={verifyOTP.isPending ? 'Verifying...' : 'Verify OTP'}
                confirmDisabled={verifyOTP.isPending || !/^\d{6}$/.test(otp)}
                onConfirm={submitVerification}
            >
                <div className="mt-5 text-left">
                    <Input
                        label="Six-Digit OTP"
                        value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="000000"
                    />
                </div>
            </Modal>
        </div>
    )
}
