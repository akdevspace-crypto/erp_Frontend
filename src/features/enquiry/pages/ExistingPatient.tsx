import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CalendarPlus, ClipboardList, FileText, HeartPulse, IndianRupee, UserPlus } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import { useCreateExistingPatient } from '../hooks/useEnquiry'
import type { ExistingPatientValues } from '../services/enquiry'

const today = new Date().toISOString().split('T')[0]

const initialForm: ExistingPatientValues = {
    clientName: '',
    patientName: '',
    mobile: '',
    email: '',
    address: '',
    careType: 'HOME_CARE',
    admissionDate: today,
    serviceName: '',
    serviceAmount: undefined,
    roomNo: '',
    healthCondition: '',
    currentMedicines: '',
    routineNotes: '',
    openingBalance: undefined
}

const careTypeOptions = [
    { value: 'HOME_CARE', label: 'Home Care' },
    { value: 'CLINICAL', label: 'Clinical Care' },
    { value: 'IN_HOUSE', label: 'In-House Care' },
    { value: 'OTHERS', label: 'Other Care' }
]

const quickLinks = (created: any) => [
    {
        label: 'Daily Operations',
        helper: 'Start routine monitoring',
        href: '/daily-operations',
        icon: ClipboardList
    },
    {
        label: 'Patient Ledger',
        helper: 'Add daily expenses',
        href: `/finance/patient-daily-cost?search=${encodeURIComponent(created?.allocation?.refNo || created?.patient?.name || '')}`,
        icon: IndianRupee
    },
    {
        label: 'Admission Forms',
        helper: 'Create family access',
        href: `/crm/admission-forms?search=${encodeURIComponent(created?.enquiry?.refNo || created?.patient?.name || '')}`,
        icon: FileText
    },
    {
        label: 'Workflow Timeline',
        helper: 'View linked status',
        href: `/workflow/timeline?search=${encodeURIComponent(created?.enquiry?.refNo || created?.allocation?.refNo || '')}`,
        icon: HeartPulse
    }
]

export function ExistingPatient() {
    const createExistingPatient = useCreateExistingPatient()
    const [form, setForm] = useState<ExistingPatientValues>(initialForm)
    const [created, setCreated] = useState<any>(null)

    const amountPreview = useMemo(() => {
        const serviceAmount = Number(form.serviceAmount || 0)
        const openingBalance = Number(form.openingBalance || 0)
        return serviceAmount + openingBalance
    }, [form.openingBalance, form.serviceAmount])

    const updateField = (field: keyof ExistingPatientValues, value: string) => {
        const numberFields = ['serviceAmount', 'openingBalance']
        setForm((current) => ({
            ...current,
            [field]: numberFields.includes(field) ? (value === '' ? undefined : Number(value)) : value
        }))
    }

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const result = await createExistingPatient.mutateAsync(form)
        setCreated(result)
    }

    const canSubmit = form.clientName.trim() && form.patientName.trim() && form.mobile.trim().length >= 10

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add Existing Patient"
                subtitle="Onboard patients who were already admitted before ERP enquiry tracking started."
                breadcrumbs={[{ label: 'Enquiry Desk' }, { label: 'Existing Patient' }]}
            />

            {created ? (
                <div className="rounded-[8px] border border-[#c0c7a0] bg-[#f2f5ea] p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7b8f5d]">Existing Patient Added</p>
                            <h2 className="mt-2 text-2xl font-black text-[#1f3b4d]">{created.patient?.name}</h2>
                            <p className="mt-1 text-sm font-semibold text-slate-600">
                                {created.enquiry?.refNo} &gt; {created.allocation?.refNo} &gt; {created.admission?.status}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setForm(initialForm)
                                setCreated(null)
                            }}
                            className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#1f3b4d] px-4 text-sm font-black text-white"
                        >
                            <UserPlus size={16} />
                            Add Another
                        </button>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-4">
                        {quickLinks(created).map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className="rounded-[8px] border border-[#d9dec5] bg-white p-4 text-sm shadow-sm transition hover:border-[#7b8f5d]"
                                >
                                    <Icon className="mb-3 text-[#1f3b4d]" size={20} />
                                    <p className="font-black text-slate-950">{item.label}</p>
                                    <p className="mt-1 text-xs font-semibold text-slate-500">{item.helper}</p>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            ) : null}

            <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Family / Client Name *"
                            value={form.clientName}
                            onChange={(event) => updateField('clientName', event.target.value)}
                            placeholder="Family member or billing contact"
                        />
                        <Input
                            label="Patient Name *"
                            value={form.patientName}
                            onChange={(event) => updateField('patientName', event.target.value)}
                            placeholder="Patient/resident name"
                        />
                        <Input
                            label="Mobile *"
                            value={form.mobile}
                            onChange={(event) => updateField('mobile', event.target.value)}
                            placeholder="Family contact number"
                        />
                        <Input
                            label="Email"
                            value={form.email || ''}
                            onChange={(event) => updateField('email', event.target.value)}
                            placeholder="Family login or invoice email"
                        />
                        <Select
                            label="Care Type"
                            value={form.careType}
                            onChange={(event) => updateField('careType', event.target.value)}
                            options={careTypeOptions}
                        />
                        <Input
                            label="Admission / Start Date"
                            type="date"
                            value={form.admissionDate || today}
                            onChange={(event) => updateField('admissionDate', event.target.value)}
                        />
                        <Input
                            label="Service Name"
                            value={form.serviceName || ''}
                            onChange={(event) => updateField('serviceName', event.target.value)}
                            placeholder="Home Care, Clinical, In-House..."
                        />
                        <Input
                            label="Monthly / Service Amount"
                            type="number"
                            value={form.serviceAmount ?? ''}
                            onChange={(event) => updateField('serviceAmount', event.target.value)}
                            placeholder="Optional"
                        />
                        <Input
                            label="Room / Bed / Area"
                            value={form.roomNo || ''}
                            onChange={(event) => updateField('roomNo', event.target.value)}
                            placeholder="Only if applicable"
                        />
                        <Input
                            label="Opening Balance"
                            type="number"
                            value={form.openingBalance ?? ''}
                            onChange={(event) => updateField('openingBalance', event.target.value)}
                            placeholder="Optional previous due"
                        />
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                            <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Health Condition</span>
                            <textarea
                                value={form.healthCondition || ''}
                                onChange={(event) => updateField('healthCondition', event.target.value)}
                                className="min-h-[112px] w-full rounded-[8px] border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-[#1f3b4d]"
                                placeholder="Known health condition, vitals concern, special care notes..."
                            />
                        </label>
                        <label className="space-y-2">
                            <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Current Medicines</span>
                            <textarea
                                value={form.currentMedicines || ''}
                                onChange={(event) => updateField('currentMedicines', event.target.value)}
                                className="min-h-[112px] w-full rounded-[8px] border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-[#1f3b4d]"
                                placeholder="Existing medicines, timing, dose..."
                            />
                        </label>
                    </div>

                    <label className="mt-4 block space-y-2">
                        <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Routine Notes</span>
                        <textarea
                            value={form.routineNotes || ''}
                            onChange={(event) => updateField('routineNotes', event.target.value)}
                            className="min-h-[96px] w-full rounded-[8px] border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-[#1f3b4d]"
                            placeholder="Food, care routine, family instructions, doctor follow-up..."
                        />
                    </label>
                </div>

                <aside className="h-fit rounded-[8px] border border-[#c0c7a0] bg-[#f2f5ea] p-5 shadow-sm">
                    <CalendarPlus className="text-[#1f3b4d]" size={24} />
                    <h3 className="mt-3 text-lg font-black text-slate-950">Recommended Flow</h3>
                    <div className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
                        <p>1. Add existing patient here.</p>
                        <p>2. ERP creates admission and allocation records.</p>
                        <p>3. Use Daily Operations for routine care.</p>
                        <p>4. Use Patient Ledger for daily expenses and month-end invoices.</p>
                        <p>5. Create family login from Admission Forms when needed.</p>
                    </div>
                    <div className="mt-5 rounded-[8px] border border-[#c0c7a0] bg-white p-4">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Opening Value</p>
                        <p className="mt-2 text-2xl font-black text-[#1f3b4d]">Rs {amountPreview.toFixed(2)}</p>
                    </div>
                    <button
                        type="submit"
                        disabled={!canSubmit || createExistingPatient.isPending}
                        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[#1f3b4d] px-4 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        <UserPlus size={17} />
                        {createExistingPatient.isPending ? 'Creating...' : 'Create Admission + Allocation'}
                    </button>
                </aside>
            </form>
        </div>
    )
}
