import { Activity, Briefcase, Calendar, ClipboardCheck, ClipboardList, Database, DoorOpen, FileText, HeartPulse, IndianRupee, Key, MessageSquare, PhoneCall, Radio, Receipt, Stethoscope, Truck, UserCog, UserPlus, Users } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'

type HubItem = {
    title: string
    description: string
    href: string
    icon: any
    status?: string
}

type HubConfig = {
    title: string
    subtitle: string
    breadcrumbs: Array<{ label: string }>
    items: HubItem[]
}

const hubs: Record<string, HubConfig> = {
    'uec-inhouse-care': {
        title: 'In-House Care Command Center',
        subtitle: 'Resident revenue, vitals, ADL and in-house care workflows in one workspace.',
        breadcrumbs: [{ label: 'UEC' }, { label: 'In-House Care' }],
        items: [
            { title: 'Revenue', description: 'In-house resident revenue and billing records.', href: '/inhouse-care/revenue', icon: IndianRupee },
            { title: 'Vitals', description: 'Resident vitals and health monitoring form.', href: '/inhouse-care/vitals', icon: HeartPulse },
            { title: 'ADL Daily Living', description: 'Activities of daily living monitoring.', href: '/healthcare/adl', icon: ClipboardCheck }
        ]
    },
    'uec-operations': {
        title: 'Elder Operations Command Center',
        subtitle: 'Food, nutrition, laundry, maintenance and waste operations in one workspace.',
        breadcrumbs: [{ label: 'UEC' }, { label: 'Elder Operations' }],
        items: [
            { title: 'Food Preparation', description: 'Kitchen preparation and ration usage workflow.', href: '/operations/food-preparation', icon: Activity },
            { title: 'Nutrition Planning', description: 'Diet planning and nutrition schedule.', href: '/operations/nutrition-planning', icon: Calendar },
            { title: 'Laundry Management', description: 'Laundry allocation and completion tracking.', href: '/operations/laundry-management', icon: ClipboardList },
            { title: 'Maintenance', description: 'Facility repair and service tickets.', href: '/operations/maintenance', icon: Briefcase },
            { title: 'Waste Management', description: 'Waste and rag movement tracking.', href: '/operations/waste-management', icon: ClipboardCheck }
        ]
    },
    'uec-finance': {
        title: 'Elder Finance Command Center',
        subtitle: 'In-house expense, finance follow-up and billing workflow entry point.',
        breadcrumbs: [{ label: 'UEC' }, { label: 'Elder Finance' }],
        items: [
            { title: 'Finance Dashboard', description: 'Elder finance overview and live accounting status.', href: '/finance/elder-dashboard', icon: IndianRupee },
            { title: 'In-House Expense', description: 'Resident and facility expense entry.', href: '/finance/inhouse-expense', icon: Receipt },
            { title: 'Cashbox', description: 'Cashbox and payment movement visibility.', href: '/finance/cashbox', icon: Database }
        ]
    },
    'uec-task-log': {
        title: 'Task Log Command Center',
        subtitle: 'Daily tasks, scheduled work and approval flows in one workspace.',
        breadcrumbs: [{ label: 'UEC' }, { label: 'Task Log' }],
        items: [
            { title: 'Assign Daily Task', description: 'Create and assign daily operational tasks.', href: '/task-log/assign-daily', icon: ClipboardList },
            { title: 'Assign Schedule Task', description: 'Create scheduled tasks for future work.', href: '/task-log/assign-schedule', icon: Calendar },
            { title: 'Daily Task Approval', description: 'Approve completed daily tasks.', href: '/task-log/daily-approval', icon: ClipboardCheck },
            { title: 'Schedule Task Approval', description: 'Approve completed scheduled tasks.', href: '/task-log/schedule-approval', icon: ClipboardCheck }
        ]
    },
    'uhc-healthcare': {
        title: 'Healthcare Command Center',
        subtitle: 'Patient care, vitals, medication, nutrition and medical monitoring workflows.',
        breadcrumbs: [{ label: 'UHC' }, { label: 'Healthcare' }],
        items: [
            { title: 'Critical Patients', description: 'Patients requiring urgent monitoring.', href: '/healthcare/critical-patients', icon: HeartPulse },
            { title: 'Patient Dashboard', description: 'Patient-level care overview.', href: '/healthcare/patient-dashboard', icon: Stethoscope },
            { title: 'Vitals', description: 'Vital sign entry and tracking.', href: '/healthcare/vitals', icon: Activity },
            { title: 'Medical Monitor', description: 'Clinical monitoring dashboard.', href: '/healthcare/medical-monitor', icon: HeartPulse },
            { title: 'Medication Management', description: 'Medicine stock and medication operations.', href: '/healthcare/medication-management', icon: ClipboardList },
            { title: 'Nutrition & Diet', description: 'Patient diet and nutrition control.', href: '/healthcare/nutrition-diet', icon: ClipboardCheck }
        ]
    },
    'uhc-allocation': {
        title: 'Care Allocation Command Center',
        subtitle: 'Clinical, home care, in-house and other allocation workflows.',
        breadcrumbs: [{ label: 'UHC' }, { label: 'Care Allocation' }],
        items: [
            { title: 'Clinical Care', description: 'Clinical care allocation.', href: '/allocation/clinical-care', icon: HeartPulse },
            { title: 'Home Care', description: 'Home care allocation.', href: '/allocation/home-care', icon: Users },
            { title: 'In-House Care', description: 'In-house allocation workflow.', href: '/allocation/inhouse-care', icon: ClipboardCheck },
            { title: 'Others', description: 'Other service allocation.', href: '/allocation/others', icon: Briefcase }
        ]
    },
    'ua-services': {
        title: 'Ambulance Services Command Center',
        subtitle: 'Bookings, dispatch, fleet, staff assignment and trip sheets in one workspace.',
        breadcrumbs: [{ label: 'UA' }, { label: 'Ambulance Services' }],
        items: [
            { title: 'Bookings', description: 'Ambulance booking workflow.', href: '/ambulance/bookings', icon: PhoneCall },
            { title: 'Dispatch', description: 'Dispatch and assignment control.', href: '/ambulance/dispatch', icon: Radio },
            { title: 'Vehicle & Fleet', description: 'Fleet availability and vehicle register.', href: '/ambulance/fleet', icon: Truck },
            { title: 'Staff Assignment', description: 'Driver and staff assignment.', href: '/ambulance/staff-assignment', icon: Users },
            { title: 'Trip Sheets', description: 'Trip sheet records and journey workflow.', href: '/ambulance/trip-sheets', icon: ClipboardList }
        ]
    },
    'ua-support': {
        title: 'Ambulance Support Command Center',
        subtitle: 'Maintenance, billing, emergency logs and field duty support.',
        breadcrumbs: [{ label: 'UA' }, { label: 'Ambulance Support' }],
        items: [
            { title: 'Maintenance', description: 'Vehicle repair and service register.', href: '/ambulance/maintenance', icon: Briefcase },
            { title: 'Billing', description: 'Ambulance billing workflow.', href: '/ambulance/billing', icon: Receipt },
            { title: 'Emergency Call Logs', description: 'Emergency call and response records.', href: '/ambulance/call-logs', icon: PhoneCall },
            { title: 'Field Duty', description: 'Field duty assignment and tracking.', href: '/hr/field-duty', icon: ClipboardCheck }
        ]
    },
    'ueo-enquiry': {
        title: 'Enquiry Desk Command Center',
        subtitle: 'New enquiries, follow-ups, active pipeline, clients and admissions in one workspace.',
        breadcrumbs: [{ label: 'UEO' }, { label: 'Enquiry Desk' }],
        items: [
            { title: 'New Enquiry', description: 'Create a new enquiry with lead qualification.', href: '/crm/new-enquiry', icon: PhoneCall },
            { title: 'Add Existing Patient', description: 'Onboard already admitted patients into admission, allocation, operations and billing.', href: '/crm/existing-patient', icon: UserPlus },
            { title: 'Follow-ups', description: 'Client follow-up accountability and conversion tracking.', href: '/crm/enquiry-follow-up', icon: Calendar },
            { title: 'Active Enquiries', description: 'Live lead pipeline and filtering.', href: '/crm/active-enquiries', icon: Activity },
            { title: 'Clients', description: 'Client list and follow-up records.', href: '/crm/clients', icon: Users },
            { title: 'Admissions', description: 'Admission tracking and handoff control.', href: '/crm/admission-tracking', icon: ClipboardCheck },
            { title: 'Admission Forms', description: 'Admission records and family portal access setup.', href: '/crm/admission-forms', icon: FileText }
        ]
    },
    'ueo-customer': {
        title: 'Customer Relations Command Center',
        subtitle: 'Welcome calls, feedback, complaints and service history in one workspace.',
        breadcrumbs: [{ label: 'UEO' }, { label: 'Customer Relations' }],
        items: [
            { title: 'Welcome Call', description: 'Welcome and onboarding call workflow.', href: '/business/welcome-call', icon: PhoneCall },
            { title: 'Pending Feedbacks', description: 'Feedback follow-up queue.', href: '/customer-care/pending-feedback', icon: MessageSquare },
            { title: 'Complaints', description: 'Customer complaint tracking.', href: '/customer-care/complaints', icon: ClipboardCheck },
            { title: 'Service History', description: 'Client service history view.', href: '/customer-care/service-history', icon: ClipboardList }
        ]
    },
    'ueo-omnichannel': {
        title: 'Omnichannel Command Center',
        subtitle: 'Calls, missed calls and communication follow-up in one workspace.',
        breadcrumbs: [{ label: 'UEO' }, { label: 'Omnichannel' }],
        items: [
            { title: 'Calls', description: 'Call handling and call records.', href: '/omnichannel/calls', icon: PhoneCall },
            { title: 'Missed Calls', description: 'Missed call queue and callback workflow.', href: '/omnichannel/missed-calls', icon: Radio }
        ]
    },
    'ueo-security': {
        title: 'Security Command Center',
        subtitle: 'Gate, visitor, staff, vehicle, entry log, report and OTP security workflows in one workspace.',
        breadcrumbs: [{ label: 'UEO' }, { label: 'Security' }],
        items: [
            { title: 'Security Dashboard', description: 'Security overview and current access-control status.', href: '/security/dashboard', icon: DoorOpen },
            { title: 'Gate Management', description: 'Gate entry handling and access movement control.', href: '/security/gate-management', icon: DoorOpen },
            { title: 'Visitor Management', description: 'Visitor registration, verification and pass workflow.', href: '/security/visitor-management', icon: Users },
            { title: 'Staff Register', description: 'Staff entry, verification and register records.', href: '/security/staff-register', icon: UserCog },
            { title: 'Vehicle Register', description: 'Vehicle entry and movement register.', href: '/security/vehicle-register', icon: Truck },
            { title: 'Entry Logs', description: 'Incoming and outgoing entry log records.', href: '/security/entry-logs', icon: ClipboardList },
            { title: 'Security Reports', description: 'Security reports and operational review.', href: '/security/reports', icon: FileText },
            { title: 'OTP Logs', description: 'OTP verification history and access audit trail.', href: '/security/otp-logs', icon: Key }
        ]
    }
}

export function ModuleCommandCenter() {
    const navigate = useNavigate()
    const { hub = '' } = useParams()
    const config = hubs[hub] || hubs['ueo-enquiry']

    return (
        <div className="flex min-h-full flex-col px-2 pb-6 sm:px-4 2xl:px-6">
            <PageHeader title={config.title} subtitle={config.subtitle} breadcrumbs={config.breadcrumbs} />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {config.items.map(({ title, description, href, icon: Icon, status }) => (
                    <button
                        key={href}
                        type="button"
                        onClick={() => navigate(href)}
                        className="min-h-[150px] rounded-xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-primary-200 hover:shadow-md"
                    >
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                            <Icon className="h-5 w-5" />
                        </span>
                        <h2 className="mt-4 text-lg font-black text-slate-950">{title}</h2>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{description}</p>
                        <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-primary-700">{status || 'Open workflow'}</p>
                    </button>
                ))}
            </section>
        </div>
    )
}
