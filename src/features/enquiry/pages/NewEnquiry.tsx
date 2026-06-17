import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import { useAddEnquiry, useAddFollowUp } from '../hooks/useEnquiry'
import { useUnits } from '../../master/hooks/useUnit'
import { useClientServices } from '../../master/services/client-service'
import { enquirySchema, type EnquiryFormValues } from '../schema'
import { useAuthStore } from '../../../store/authStore'
import { useStaff } from '../../hr/hooks/useHR'
import { cn } from '../../../lib/utils'

const fallbackServices = [
    'Home Care',
    'Clinical Care',
    'In-House Assisted Living',
    'Dementia Care',
    'Skilled Nursing',
    'Post Operative Care',
    'Ambulance Support'
]

const defaultValues: EnquiryFormValues = {
    unitId: '',
    service: '',
    mode: 'Call',
    clientName: '',
    mobile: '',
    email: '',
    comments: '',
    status: 'Open',
    leadQuality: 'Warm',
    enquiryIntent: 'Needs pricing discussion',
    followUpPriority: 'Within 24 hours',
    patientName: '',
    patientAge: '',
    patientGender: '',
    patientHealthCondition: '',
    clientAddress: '',
    clientLocation: '',
    remarks: '',
    followupMode: 'Call',
    followupStatus: 'Followup Required',
    leadValidity: 'Genuine',
    conversionReadiness: 'Discussion Stage',
    urgency: 'Normal',
    clientInterest: 'Neutral',
    readyToPayAmount: '',
    paymentMode: '',
    nextFollowupDate: new Date().toISOString().split('T')[0],
    staffId: '',
    attachmentName: '',
    followupComments: ''
}

const steps = [
    { title: 'Enquiry Intake', helper: 'Client, service and source details' },
    { title: 'Lead Qualification', helper: 'Filter intent and priority' },
    { title: 'Patient Details', helper: 'Care context and address' },
    { title: 'Follow-up Assignment', helper: 'Assign owner and next action' }
]

export function NewEnquiry() {
    const [step, setStep] = useState(0)
    const navigate = useNavigate()
    const addEnquiry = useAddEnquiry()
    const addFollowUp = useAddFollowUp()
    const { data: units = [] } = useUnits()
    const { data: services = [] } = useClientServices()
    const { data: staffList = [] } = useStaff({ scope: 'all' })
    const user = useAuthStore((state) => state.user)
    const activeUnitId = useAuthStore((state) => state.activeUnitId)
    const resolvedUnitId = activeUnitId || user?.unitId || ''

    const { register, handleSubmit, reset, setValue, trigger, watch, formState: { errors } } = useForm<EnquiryFormValues>({
        resolver: zodResolver(enquirySchema),
        defaultValues: {
            ...defaultValues,
            unitId: resolvedUnitId
        }
    })

    const leadQuality = watch('leadQuality')
    const enquiryIntent = watch('enquiryIntent')
    const followupStatus = watch('followupStatus')
    const isInvalidLead = leadQuality === 'Fake / Invalid' || enquiryIntent === 'Wrong / fake enquiry'

    const unitOptions = useMemo(() => {
        const apiUnits = units.map(u => ({ value: u.id, label: u.name }))
        if (apiUnits.length > 0) return apiUnits
        if (resolvedUnitId) return [{ value: resolvedUnitId, label: user?.unitAccess?.includes('*') ? 'Current Unit' : 'Assigned Unit' }]
        return []
    }, [resolvedUnitId, units, user?.unitAccess])

    const serviceOptions = useMemo(() => {
        const apiServices = services
            .map(s => String(s.name || s.code || '').trim())
            .filter(Boolean)
            .map(name => ({ value: name, label: name }))

        if (apiServices.length > 0) return apiServices
        return fallbackServices.map(name => ({ value: name, label: name }))
    }, [services])

    const staffOptions = useMemo(() => (
        staffList
            .filter((staff: any) => !staff.isDeleted && String(staff.status || 'Active').toLowerCase() !== 'terminated')
            .map((staff: any) => ({
                value: staff.id,
                label: `${staff.name || staff.empId || 'Staff'}${staff.empId ? ` (${staff.empId})` : ''}`
            }))
    ), [staffList])

    useEffect(() => {
        if (resolvedUnitId) setValue('unitId', resolvedUnitId)
    }, [resolvedUnitId, setValue])

    useEffect(() => {
        if (isInvalidLead) {
            setValue('status', 'Lost')
            setValue('followupStatus', 'Lost')
            setValue('followUpPriority', 'No follow-up needed')
        }
    }, [isInvalidLead, setValue])

    const goNext = async () => {
        const fieldsByStep: Array<Array<keyof EnquiryFormValues>> = [
            ['unitId', 'service', 'mode', 'clientName', 'mobile', 'email', 'status'],
            ['leadQuality', 'enquiryIntent', 'followUpPriority'],
            [],
            []
        ]
        const valid = await trigger(fieldsByStep[step])
        if (valid) setStep((current) => Math.min(current + 1, steps.length - 1))
    }

    const resetWorkflow = () => {
        reset({ ...defaultValues, unitId: resolvedUnitId, nextFollowupDate: new Date().toISOString().split('T')[0] })
        setStep(0)
    }

    const onSubmit = async (data: EnquiryFormValues) => {
        const qualificationNotes = [
            '[Lead Qualification]',
            `Lead Quality: ${data.leadQuality}`,
            `Intent: ${data.enquiryIntent}`,
            `Follow-up Priority: ${data.followUpPriority}`
        ].join('\n')
        const payload = {
            ...data,
            unitId: data.unitId || resolvedUnitId,
            status: isInvalidLead ? 'Lost' : data.status,
            comments: [data.comments, qualificationNotes].filter(Boolean).join('\n\n'),
            remarks: [data.remarks, isInvalidLead ? 'Marked as fake/invalid during enquiry qualification.' : 'Qualified as lead from enquiry form.'].filter(Boolean).join('\n\n')
        }

        const created: any = await addEnquiry.mutateAsync(payload)
        const enquiryId = created?.id
        const shouldCreateFollowUp = enquiryId && !isInvalidLead && (
            data.staffId ||
            data.followupComments?.trim() ||
            data.followupStatus ||
            data.nextFollowupDate
        )

        if (shouldCreateFollowUp) {
            const note = [
                `Mode: ${data.followupMode || 'N/A'}`,
                `Status: ${data.followupStatus || 'N/A'}`,
                `Lead Validity: ${data.leadValidity || 'N/A'}`,
                `Conversion Readiness: ${data.conversionReadiness || 'N/A'}`,
                `Urgency: ${data.urgency || 'Normal'}`,
                `Client Interest: ${data.clientInterest || 'Neutral'}`,
                data.readyToPayAmount ? `Ready Amount: ${data.readyToPayAmount}` : '',
                data.paymentMode ? `Payment Mode: ${data.paymentMode}` : '',
                `Lead Quality: ${data.leadQuality}`,
                `Intent: ${data.enquiryIntent}`,
                `Comments: ${data.followupComments?.trim() || 'Initial follow-up assigned from New Enquiry workflow'}`
            ].filter(Boolean).join(' | ')

            await addFollowUp.mutateAsync({
                id: enquiryId,
                data: {
                    notes: note,
                    staffId: data.staffId || undefined,
                    channel: data.followupMode || undefined,
                    outcome: data.followupStatus || undefined,
                    attachmentName: data.attachmentName || undefined,
                    clientInterest: data.clientInterest || undefined,
                    readyToPayAmount: data.readyToPayAmount ? parseFloat(data.readyToPayAmount) : undefined,
                    paymentMode: data.paymentMode || undefined,
                    nextFollowupStatus: data.followupStatus || undefined,
                    nextDate: data.followupStatus !== 'Followup Not Required' && data.followupStatus !== 'Lost' && data.nextFollowupDate
                        ? new Date(data.nextFollowupDate).toISOString()
                        : new Date().toISOString()
                }
            })
        }

        resetWorkflow()
        navigate('/crm/enquiry-follow-up')
    }

    const isSubmitting = addEnquiry.isPending || addFollowUp.isPending

    return (
        <div className="flex h-full w-full min-w-0 flex-col overflow-hidden pb-1 bg-transparent dark:bg-black">
            <PageHeader title="New Enquiry" breadcrumbs={[{ label: 'Enquiry Desk' }, { label: 'Guided New Enquiry' }]} />

            <div className="flex min-h-0 flex-1 flex-col rounded-[24px] border border-white/50 bg-white/70 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-black sm:p-5 2xl:p-6">
                <div className="mb-5 grid gap-3 md:grid-cols-4">
                    {steps.map((item, index) => (
                        <button
                            key={item.title}
                            type="button"
                            onClick={() => setStep(index)}
                            className={cn(
                                'rounded-xl border p-3 text-left transition',
                                step === index ? 'border-[#3f5f6a] bg-[#3f5f6a] text-white shadow-sm' : index < step ? 'border-emerald-100 bg-emerald-50 text-emerald-800' : 'border-slate-100 bg-white text-slate-600'
                            )}
                        >
                            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em]">
                                {index < step ? <Check className="h-4 w-4" /> : `Step ${index + 1}`}
                            </span>
                            <p className="mt-2 text-sm font-black">{item.title}</p>
                            <p className="mt-1 text-xs font-semibold opacity-80">{item.helper}</p>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-6 overflow-y-auto pb-8 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/10 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
                    {step === 0 && (
                        <WorkflowSection title="Step 1: Enquiry Intake">
                            <Select label="Unit Name (Branch) *" {...register('unitId')} error={errors.unitId?.message} options={unitOptions} placeholder="-- Select Unit --" disabled={unitOptions.length <= 1} />
                            <Select label="Service Looking for *" {...register('service')} error={errors.service?.message} options={serviceOptions} placeholder="-- Select Service --" />
                            <Select label="Enquiry Mode *" {...register('mode')} error={errors.mode?.message} options={[{ value: 'Call', label: 'Call' }, { value: 'Walk-in', label: 'Walk-in' }, { value: 'Website', label: 'Website' }, { value: 'Reference', label: 'Reference' }]} />
                            <Select label="Enquiry Status *" {...register('status')} error={errors.status?.message} options={[{ value: 'Emergency', label: 'Emergency' }, { value: 'Important', label: 'Important' }, { value: 'Just Enquiry', label: 'Just Enquiry' }, { value: 'Open', label: 'Open' }, { value: 'In Progress', label: 'In Progress' }, { value: 'Converted', label: 'Converted' }, { value: 'Lost', label: 'Lost' }]} />
                            <Input label="Client Name *" placeholder="Enter Client Full Name" {...register('clientName')} error={errors.clientName?.message} />
                            <Input label="Client Mobile No. *" placeholder="Enter Client Mobile No." {...register('mobile')} error={errors.mobile?.message} />
                            <Input label="Client Email" placeholder="Enter Client Email Address" {...register('email')} error={errors.email?.message} />
                            <TextArea label="Client Comments" placeholder="Enter enquiry comments" register={register('comments')} />
                        </WorkflowSection>
                    )}

                    {step === 1 && (
                        <WorkflowSection title="Step 2: Lead Qualification">
                            <Select label="Lead Quality *" {...register('leadQuality')} error={errors.leadQuality?.message} options={[{ value: 'Hot', label: 'Hot - ready to convert' }, { value: 'Warm', label: 'Warm - follow-up needed' }, { value: 'Cold', label: 'Cold - low urgency' }, { value: 'Fake / Invalid', label: 'Fake / Invalid' }]} />
                            <Select label="Conversion Intent *" {...register('enquiryIntent')} error={errors.enquiryIntent?.message} options={[{ value: 'Ready to start service', label: 'Ready to start service' }, { value: 'Needs pricing discussion', label: 'Needs pricing discussion' }, { value: 'Needs family discussion', label: 'Needs family discussion' }, { value: 'Just checking', label: 'Just checking' }, { value: 'Wrong / fake enquiry', label: 'Wrong / fake enquiry' }]} />
                            <Select label="Follow-up Priority *" {...register('followUpPriority')} error={errors.followUpPriority?.message} options={[{ value: 'Today', label: 'Today' }, { value: 'Within 24 hours', label: 'Within 24 hours' }, { value: 'This week', label: 'This week' }, { value: 'No follow-up needed', label: 'No follow-up needed' }]} />
                            {isInvalidLead && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800 md:col-span-3">This enquiry is marked invalid. It will be saved as Lost and no initial follow-up will be assigned.</div>}
                        </WorkflowSection>
                    )}

                    {step === 2 && (
                        <WorkflowSection title="Step 3: Patient / Service Details">
                            <Input label="Patient Name" placeholder="Enter patient name" {...register('patientName')} error={errors.patientName?.message} />
                            <Select label="Patient Age" {...register('patientAge')} error={errors.patientAge?.message} options={[{ value: '0 to 10', label: '0 to 10' }, { value: '10 to 18', label: '10 to 18' }, { value: '18 to 30', label: '18 to 30' }, { value: '30 to 45', label: '30 to 45' }, { value: '45 to 60', label: '45 to 60' }, { value: '60+', label: '60+' }]} placeholder="-- Select Age --" />
                            <Select label="Patient Gender" {...register('patientGender')} error={errors.patientGender?.message} options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} placeholder="-- Select Gender --" />
                            <Input label="Patient Health Condition" placeholder="Enter health condition" {...register('patientHealthCondition')} error={errors.patientHealthCondition?.message} />
                            <Input label="Client Address" placeholder="Enter client full address" {...register('clientAddress')} error={errors.clientAddress?.message} />
                            <Input label="Client Location (City)" placeholder="Enter client city" {...register('clientLocation')} error={errors.clientLocation?.message} />
                            <div className="md:col-span-3"><TextArea label="Remarks (Narration)" placeholder="Enter narration" register={register('remarks')} /></div>
                        </WorkflowSection>
                    )}

                    {step === 3 && (
                        <WorkflowSection title="Step 4: Initial Follow-up Assignment">
                            <Select label="Follow-up Mode" {...register('followupMode')} options={[{ value: 'Call', label: 'Call' }, { value: 'WhatsApp', label: 'WhatsApp' }, { value: 'Email', label: 'Email' }, { value: 'Walk-in', label: 'Walk-in' }]} disabled={isInvalidLead} />
                            <Select label="Staff Follow-up" {...register('staffId')} options={[{ value: '', label: staffOptions.length ? '-- Select Staff --' : '-- No staff available --' }, ...staffOptions]} disabled={isInvalidLead || staffOptions.length === 0} />
                            <Select label="Outcome / Status" {...register('followupStatus')} options={[{ value: 'Followup Required', label: 'Followup Required' }, { value: 'Followup Not Required', label: 'Followup Not Required' }, { value: 'Converted', label: 'Converted' }, { value: 'Lost', label: 'Lost' }]} disabled={isInvalidLead} />
                            <Input label="Next Follow-up Date" type="date" {...register('nextFollowupDate')} disabled={isInvalidLead || followupStatus === 'Followup Not Required' || followupStatus === 'Lost'} />
                            <Select label="Lead Validity" {...register('leadValidity')} options={[{ value: 'Genuine', label: 'Genuine' }, { value: 'Duplicate', label: 'Duplicate' }, { value: 'Fake / Invalid', label: 'Fake / Invalid' }]} disabled={isInvalidLead} />
                            <Select label="Conversion Readiness" {...register('conversionReadiness')} options={[{ value: 'Ready to Convert', label: 'Ready to Convert' }, { value: 'Needs Pricing Discussion', label: 'Needs Pricing Discussion' }, { value: 'Discussion Stage', label: 'Discussion Stage' }, { value: 'Not Ready', label: 'Not Ready' }]} disabled={isInvalidLead} />
                            <Select label="Client Interest" {...register('clientInterest')} options={[{ value: 'High', label: 'High' }, { value: 'Neutral', label: 'Neutral' }, { value: 'Low', label: 'Low' }, { value: 'Not Interested', label: 'Not Interested' }]} disabled={isInvalidLead} />
                            <Select label="Urgency" {...register('urgency')} options={[{ value: 'Urgent', label: 'Urgent' }, { value: 'Normal', label: 'Normal' }, { value: 'Low', label: 'Low' }]} disabled={isInvalidLead} />
                            <Input label="Ready to Pay Amount" type="number" placeholder="Amount discussed" {...register('readyToPayAmount')} disabled={isInvalidLead} />
                            <Select label="Payment Mode" {...register('paymentMode')} options={[{ value: '', label: '-- Not discussed --' }, { value: 'Cash', label: 'Cash' }, { value: 'UPI', label: 'UPI' }, { value: 'Bank Transfer', label: 'Bank Transfer' }, { value: 'Card', label: 'Card' }]} disabled={isInvalidLead} />
                            <Input label="Attachment / Proof Name" placeholder="Quote, bill, call note..." {...register('attachmentName')} disabled={isInvalidLead} />
                            <div className="md:col-span-3"><TextArea label="Follow-up Comments" placeholder="Enter first discussion / commitment notes" register={register('followupComments')} disabled={isInvalidLead} /></div>
                        </WorkflowSection>
                    )}

                    <div className="flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                        <button type="button" onClick={resetWorkflow} className="rounded border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
                            Reset All
                        </button>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="inline-flex items-center justify-center gap-2 rounded border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm disabled:opacity-50">
                                <ChevronLeft className="h-4 w-4" /> Back
                            </button>
                            {step < steps.length - 1 ? (
                                <button type="button" onClick={goNext} className="inline-flex items-center justify-center gap-2 rounded bg-[#3f5f6a] px-6 py-2.5 text-sm font-bold text-white shadow-sm">
                                    Next <ChevronRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded bg-gradient-to-r from-[#3f5f6a] to-[#1f3b4d] px-6 py-2.5 text-[13.5px] font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(63,95,106,0.22)] disabled:opacity-50">
                                    <Save className="h-4 w-4" />
                                    {isSubmitting ? 'Saving Workflow...' : 'Save Enquiry Workflow'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

function WorkflowSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h3 className="mb-5 border-b pb-3 text-lg font-semibold text-gray-900 dark:border-white/10 dark:text-gray-100 sm:text-xl">{title}</h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 2xl:gap-6">{children}</div>
        </section>
    )
}

function TextArea({ label, placeholder, register, disabled }: { label: string; placeholder: string; register: any; disabled?: boolean }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
            <textarea
                {...register}
                disabled={disabled}
                rows={3}
                placeholder={placeholder}
                className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-400 dark:border-white/10 dark:text-gray-100"
            />
        </div>
    )
}
