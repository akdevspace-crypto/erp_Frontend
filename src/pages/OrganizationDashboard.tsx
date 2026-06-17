import { Activity, AlertCircle, ClipboardCheck, IndianRupee, Mail, Megaphone, MessageSquare, RefreshCw, Target, TrendingUp, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { SkeletonLoader } from '../components/SkeletonLoader'
import { useOrganizationDashboard } from '../hooks/useOrganizationDashboard'
import type { OrganizationDashboardData, OrganizationKPI } from '../services/organizationDashboardService'

const orgFallbacks = {
    uncf: { code: 'UNCF', title: 'UNCF Dashboard', subtitle: 'Foundation-wide administration, finance, HR, security, CMS, and profile monitoring.' },
    uec: { code: 'UEC', title: 'UEC Dashboard', subtitle: 'Elder care overview and operations monitoring.' },
    uhc: { code: 'UHC', title: 'UHC Dashboard', subtitle: 'Healthcare overview and patient monitoring.' },
    ua: { code: 'UA', title: 'UA Dashboard', subtitle: 'Ambulance operations and service monitoring.' },
    ueo: { code: 'UEO', title: 'UEO Dashboard', subtitle: 'Enquiry office and customer relations monitoring.' }
}

const fallbackDashboards: Record<string, OrganizationDashboardData> = {
    UNCF: {
        ...orgFallbacks.uncf,
        accent: '#3f5f6a',
        kpis: [
            { label: 'Active Enquiries', value: 0, tone: 'teal' },
            { label: 'Critical Patients', value: 0, tone: 'rose' },
            { label: 'Low Stock Alerts', value: 0, tone: 'amber' },
            { label: 'Pending Payments', value: 0, tone: 'green' },
            { label: 'Total Income', value: 0, format: 'currency', tone: 'teal' },
            { label: 'Schedule Tasks', value: 0, tone: 'blue' },
            { label: 'Complaints', value: 0, tone: 'violet' },
            { label: 'Recent Activities', value: 0, tone: 'orange' }
        ],
        trend: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map((name) => ({ name, enquiries: 0, income: 0, tasks: 0 })),
        taskStatus: [{ name: 'No Tasks', value: 1 }],
        activities: []
    },
    UEC: {
        ...orgFallbacks.uec,
        accent: '#3f5f6a',
        kpis: [
            { label: 'Active Residents', value: 0, tone: 'teal' },
            { label: 'In-House Care', value: 0, tone: 'blue' },
            { label: 'Daily Tasks', value: 0, tone: 'green' },
            { label: 'Pending Tasks', value: 0, tone: 'amber' },
            { label: 'Revenue', value: 0, format: 'currency', tone: 'teal' },
            { label: 'Laundry Open', value: 0, tone: 'violet' },
            { label: 'Maintenance Open', value: 0, tone: 'rose' },
            { label: 'Low Stock', value: 0, tone: 'amber' }
        ],
        trend: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map((name) => ({ name, residents: 0, tasks: 0, revenue: 0 })),
        taskStatus: [{ name: 'No Tasks', value: 1 }],
        activities: []
    },
    UHC: {
        ...orgFallbacks.uhc,
        accent: '#1f3b4d',
        kpis: [
            { label: 'Patients', value: 0, tone: 'blue' },
            { label: 'Active Admissions', value: 0, tone: 'green' },
            { label: 'Critical Vitals', value: 0, tone: 'rose' },
            { label: 'Medical Assignments', value: 0, tone: 'teal' },
            { label: 'Medications', value: 0, tone: 'violet' },
            { label: 'Nutrition Plans', value: 0, tone: 'amber' },
            { label: 'Clinical Care', value: 0, tone: 'blue' },
            { label: 'Pending Approvals', value: 0, tone: 'amber' }
        ],
        trend: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map((name) => ({ name, patients: 0, vitals: 0, assignments: 0 })),
        taskStatus: [{ name: 'No Tasks', value: 1 }],
        activities: []
    },
    UA: {
        ...orgFallbacks.ua,
        accent: '#F97316',
        kpis: [
            { label: 'Bookings', value: 0, tone: 'orange' },
            { label: 'Dispatch Active', value: 0, tone: 'blue' },
            { label: 'Field Duty', value: 0, tone: 'teal' },
            { label: 'Emergency Calls', value: 0, tone: 'rose' },
            { label: 'Missed Calls', value: 0, tone: 'amber' },
            { label: 'Billing', value: 0, format: 'currency', tone: 'green' },
            { label: 'Maintenance', value: 0, tone: 'violet' },
            { label: 'Active Staff', value: 0, tone: 'blue' }
        ],
        trend: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map((name) => ({ name, calls: 0, bookings: 0, billing: 0 })),
        taskStatus: [{ name: 'No Tasks', value: 1 }],
        activities: []
    },
    UEO: {
        ...orgFallbacks.ueo,
        accent: '#3f5f6a',
        kpis: [
            { label: 'Active Enquiries', value: 0, tone: 'teal' },
            { label: 'New Leads', value: 0, tone: 'blue' },
            { label: 'Follow-ups', value: 0, tone: 'amber' },
            { label: 'Admissions', value: 0, tone: 'green' },
            { label: 'Complaints', value: 0, tone: 'rose' },
            { label: 'Feedbacks', value: 0, tone: 'violet' },
            { label: 'Conversations', value: 0, tone: 'blue' },
            { label: 'Missed Calls', value: 0, tone: 'amber' }
        ],
        trend: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map((name) => ({ name, enquiries: 0, followups: 0, complaints: 0 })),
        taskStatus: [{ name: 'No Tasks', value: 1 }],
        activities: []
    }
}

const mergeDashboardData = (fallback: OrganizationDashboardData, data?: OrganizationDashboardData) => ({
    ...fallback,
    ...data,
    kpis: data?.kpis?.length ? data.kpis : fallback.kpis,
    trend: data?.trend?.length ? data.trend : fallback.trend,
    taskStatus: data?.taskStatus?.length ? data.taskStatus : fallback.taskStatus,
    activities: data?.activities || fallback.activities
})

const toneStyles: Record<string, { bg: string; text: string; icon: string }> = {
    teal: { bg: 'bg-primary-50', text: 'text-primary-700', icon: 'bg-primary-500' },
    blue: { bg: 'bg-sky-50', text: 'text-sky-700', icon: 'bg-sky-500' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'bg-amber-500' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', icon: 'bg-rose-500' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-700', icon: 'bg-violet-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'bg-orange-500' }
}

const formatValue = (kpi: OrganizationKPI) => {
    if (kpi.format === 'currency') {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(kpi.value || 0)
    }

    return new Intl.NumberFormat('en-IN').format(kpi.value || 0)
}

const uncfProjects = [
    { name: 'Elder Food Support', status: 'Live', target: 500000, collected: 318000, allocated: 220000, enquiries: 42 },
    { name: 'Medical Aid Drive', status: 'Fundraising', target: 750000, collected: 410000, allocated: 180000, enquiries: 31 },
    { name: 'Community Care Camp', status: 'Planning', target: 300000, collected: 86000, allocated: 42000, enquiries: 18 },
    { name: 'Emergency Relief Fund', status: 'Live', target: 1000000, collected: 685000, allocated: 510000, enquiries: 57 }
]

const uncfCampaigns = [
    { channel: 'WhatsApp', project: 'Emergency Relief Fund', leads: 126, status: 'Pitching Live', spend: 12000 },
    { channel: 'Email', project: 'Medical Aid Drive', leads: 74, status: 'Follow-up', spend: 4500 },
    { channel: 'Instagram / Meta', project: 'Elder Food Support', leads: 212, status: 'Ads Running', spend: 28500 }
]

const currency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

function UncfFoundationCommandCenter() {
    const [activeTab, setActiveTab] = useState<'Dashboard' | 'Projects' | 'Funding' | 'Outreach' | 'People' | 'Reports' | 'Admin'>('Dashboard')
    const totalTarget = uncfProjects.reduce((sum, project) => sum + project.target, 0)
    const totalCollected = uncfProjects.reduce((sum, project) => sum + project.collected, 0)
    const totalAllocated = uncfProjects.reduce((sum, project) => sum + project.allocated, 0)
    const totalEnquiries = uncfProjects.reduce((sum, project) => sum + project.enquiries, 0)
    const totalCampaignSpend = uncfCampaigns.reduce((sum, campaign) => sum + campaign.spend, 0)
    const pendingNeed = totalTarget - totalCollected

    const metrics = [
        { label: 'Live Projects', value: uncfProjects.filter((project) => project.status === 'Live').length, icon: Target, tone: 'text-primary-700 bg-primary-50' },
        { label: 'Project Enquiries', value: totalEnquiries, icon: MessageSquare, tone: 'text-sky-700 bg-sky-50' },
        { label: 'Funds Collected', value: currency(totalCollected), icon: Wallet, tone: 'text-emerald-700 bg-emerald-50' },
        { label: 'Funds Allocated', value: currency(totalAllocated), icon: IndianRupee, tone: 'text-amber-700 bg-amber-50' },
        { label: 'Pending Need', value: currency(pendingNeed), icon: AlertCircle, tone: 'text-rose-700 bg-rose-50' },
        { label: 'Campaign Spend', value: currency(totalCampaignSpend), icon: Megaphone, tone: 'text-violet-700 bg-violet-50' }
    ]

    return (
        <div className="flex min-h-full flex-col px-2 pb-6 sm:px-4 2xl:px-6">
            <PageHeader
                title="UNCF Foundation Command Center"
                subtitle="NGO project, enquiry, funding, campaign, allocation, and expenditure control in one workspace."
                breadcrumbs={[{ label: 'UNCF' }, { label: 'Foundation' }]}
            />

            <section className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                {metrics.map(({ label, value, icon: Icon, tone }) => (
                    <div key={label} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
                            <Icon className="h-5 w-5" />
                        </span>
                        <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
                    </div>
                ))}
            </section>

            <div className="mb-4 flex flex-wrap gap-2">
                {(['Dashboard', 'Projects', 'Funding', 'Outreach', 'People', 'Reports', 'Admin'] as const).map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-xl px-4 py-2 text-sm font-black ${activeTab === tab ? 'bg-[#3f5f6a] text-white' : 'bg-white text-slate-700 shadow-sm'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'Dashboard' && (
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <FoundationPanel title="Project Pipeline" rows={uncfProjects.map((project) => ({
                        title: project.name,
                        detail: `${project.status} | ${currency(project.collected)} collected of ${currency(project.target)}`,
                        status: `${project.enquiries} enquiries`
                    }))} />
                    <FoundationPanel title="Live Campaign Pitching" rows={uncfCampaigns.map((campaign) => ({
                        title: `${campaign.channel} - ${campaign.project}`,
                        detail: `${campaign.leads} leads | Spend ${currency(campaign.spend)}`,
                        status: campaign.status
                    }))} />
                </div>
            )}

            {activeTab === 'Projects' && <ProjectTable />}
            {activeTab === 'Funding' && (
                <div className="grid gap-4 xl:grid-cols-3">
                    <FoundationPanel title="Fundings" rows={[
                        { title: 'Crowdfunding', detail: `${currency(286000)} collected from live campaign sources`, status: 'Track by project' },
                        { title: 'Corporate / CSR', detail: `${currency(320000)} collected from partner discussions`, status: 'Follow-up needed' },
                        { title: 'Direct Donations', detail: `${currency(893000)} collected across projects`, status: 'Allocation pending' }
                    ]} />
                    <FoundationPanel title="Fund Allocation" rows={[
                        { title: 'Allocated to Projects', detail: `${currency(totalAllocated)} issued to active projects`, status: 'Utilization proof needed' },
                        { title: 'Pending Allocation', detail: `${currency(totalCollected - totalAllocated)} waiting for project-wise allocation`, status: 'Admin review' },
                        { title: 'Remaining Need', detail: `${currency(pendingNeed)} still needed against targets`, status: 'Campaign focus' }
                    ]} />
                    <FoundationPanel title="Expenses" rows={[
                        { title: 'Project Expenses', detail: `${currency(totalAllocated)} spent or reserved for project execution`, status: 'Live tracking needed' },
                        { title: 'Meta Ads', detail: `${currency(28500)} spent for lead generation`, status: 'Needs ad report sync' },
                        { title: 'Crowdfunding Charges', detail: 'Platform fees and payment gateway costs', status: 'Backend required' }
                    ]} />
                </div>
            )}
            {activeTab === 'Outreach' && (
                <div className="space-y-4">
                    <CampaignTable />
                    <div className="grid gap-4 xl:grid-cols-2">
                        <FoundationPanel title="Outreach" rows={[
                            { title: 'Field Outreach', detail: 'Community visits, beneficiary identification, field follow-ups', status: 'Needs activity log' },
                            { title: 'Partner Outreach', detail: 'Hospitals, CSR partners, local bodies, sponsor groups', status: 'CRM linked later' },
                            { title: 'Social Outreach', detail: 'WhatsApp, email, Instagram and Meta campaign contacts', status: 'Campaign linked' }
                        ]} />
                        <FoundationPanel title="Events & Media" rows={[
                            { title: 'Events', detail: 'Camps, awareness programs, donor meets, project launches', status: 'Add event register later' },
                            { title: 'Media', detail: 'Project photos, posters, videos, proof material and social updates', status: 'Media proof library later' },
                            { title: 'Campaign Proof', detail: 'Receipts, beneficiary proof, fund usage proof, field media', status: 'Needed for trust' }
                        ]} />
                    </div>
                </div>
            )}
            {activeTab === 'People' && (
                <div className="grid gap-4 xl:grid-cols-3">
                    <FoundationPanel title="Enquiries" rows={[
                        { title: 'Donor Enquiries', detail: 'Donation intent, CSR partnership, recurring sponsor follow-ups', status: 'Needs CRM connection' },
                        { title: 'Volunteer Enquiries', detail: 'Camp volunteers, field helpers, social media supporters', status: 'Needs CRM connection' },
                        { title: 'Beneficiary Enquiries', detail: 'People requesting aid or project support', status: 'Needs CRM connection' }
                    ]} />
                    <FoundationPanel title="Donors" rows={[
                        { title: 'Individual Donors', detail: 'One-time and recurring individual contributors', status: 'Donor CRM needed' },
                        { title: 'CSR / Corporate', detail: 'Company funding, sponsorship and project proposals', status: 'Pipeline needed' },
                        { title: 'Major Donors', detail: 'High-value donor follow-up and relationship history', status: 'Accountability needed' }
                    ]} />
                    <FoundationPanel title="Volunteers" rows={[
                        { title: 'Volunteer Registry', detail: 'Volunteer profile, skill, availability and participation', status: 'Not HR payroll' },
                        { title: 'Event Volunteers', detail: 'Camp-wise and project-wise volunteer assignment', status: 'Event linked later' },
                        { title: 'Field Support', detail: 'People supporting outreach, distribution and media proof', status: 'Activity log needed' }
                    ]} />
                </div>
            )}
            {activeTab === 'Reports' && <FoundationPanel title="Reports" rows={[
                { title: 'Project Report', detail: 'Project target, collected, allocated, spent, balance and current status', status: 'Management view' },
                { title: 'Donor Report', detail: 'Donor-wise contribution, campaign source and follow-up status', status: 'Backend needed' },
                { title: 'Funding Utilization', detail: 'Proof-backed fund usage for trust, audit and donor confidence', status: 'Critical' }
            ]} />}
            {activeTab === 'Admin' && <FoundationPanel title="Admin" rows={[
                { title: 'Project Categories', detail: 'Cause types, project status, campaign source and funding source setup', status: 'Configuration' },
                { title: 'Approval Rules', detail: 'Fund allocation, expense approval and campaign spend controls', status: 'Later backend' },
                { title: 'Access Control', detail: 'Who can create projects, approve expenses, view donors and export reports', status: 'Role based' }
            ]} />}
        </div>
    )
}

function FoundationPanel({ title, rows }: { title: string; rows: Array<{ title: string; detail: string; status: string }> }) {
    return (
        <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">{title}</h2>
            <div className="mt-3 space-y-3">
                {rows.map((row) => (
                    <div key={`${row.title}-${row.status}`} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <p className="font-black text-slate-950">{row.title}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-600">{row.detail}</p>
                        <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-primary-700">{row.status}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

function ProjectTable() {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                        <th className="px-4 py-3">Project</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Target</th>
                        <th className="px-4 py-3">Collected</th>
                        <th className="px-4 py-3">Allocated</th>
                        <th className="px-4 py-3">Enquiries</th>
                    </tr>
                </thead>
                <tbody>
                    {uncfProjects.map((project) => (
                        <tr key={project.name} className="border-t border-slate-100">
                            <td className="px-4 py-4 font-black text-slate-950">{project.name}</td>
                            <td className="px-4 py-4 font-semibold text-primary-700">{project.status}</td>
                            <td className="px-4 py-4">{currency(project.target)}</td>
                            <td className="px-4 py-4">{currency(project.collected)}</td>
                            <td className="px-4 py-4">{currency(project.allocated)}</td>
                            <td className="px-4 py-4">{project.enquiries}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    )
}

function CampaignTable() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {uncfCampaigns.map((campaign) => {
                const Icon = campaign.channel === 'Email' ? Mail : campaign.channel === 'WhatsApp' ? MessageSquare : Megaphone
                return (
                    <section key={campaign.channel} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <Icon className="h-5 w-5 text-primary-700" />
                        <h2 className="mt-3 text-lg font-black text-slate-950">{campaign.channel}</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-600">{campaign.project}</p>
                        <p className="mt-3 text-2xl font-black text-slate-950">{campaign.leads}</p>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Leads generated</p>
                        <p className="mt-3 text-sm font-bold text-amber-700">{campaign.status}</p>
                    </section>
                )
            })}
        </div>
    )
}

function KpiCard({ kpi, index }: { kpi: OrganizationKPI; index: number }) {
    const Icon = kpi.format === 'currency' ? IndianRupee : index % 3 === 0 ? Activity : index % 3 === 1 ? ClipboardCheck : TrendingUp
    const tone = toneStyles[kpi.tone] || toneStyles.teal

    return (
        <div className="min-h-[120px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-black">
            <div className="flex items-start justify-between gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone.bg}`}>
                    <Icon className={`h-5 w-5 ${tone.text}`} />
                </div>
                <span className={`h-2.5 w-2.5 rounded-full ${tone.icon}`} />
            </div>
            <p className="mt-4 text-2xl font-black leading-none text-gray-950 dark:text-gray-100">{formatValue(kpi)}</p>
            <p className="mt-2 text-sm font-bold text-gray-500 dark:text-gray-400">{kpi.label}</p>
        </div>
    )
}

export function OrganizationDashboard() {
    const params = useParams()
    const routeOrg = (params.org || 'uncf').toLowerCase() as keyof typeof orgFallbacks
    if (routeOrg === 'uncf') return <UncfFoundationCommandCenter />

    return <OrganizationAnalyticsDashboard routeOrg={routeOrg} />
}

const findKpi = (dashboard: OrganizationDashboardData, label: string) =>
    dashboard.kpis.find((kpi) => kpi.label.toLowerCase() === label.toLowerCase())?.value || 0

const getOrgFocus = (dashboard: OrganizationDashboardData) => {
    const code = dashboard.code

    if (code === 'UEC') {
        return [
            { title: 'Care Operations', detail: `${findKpi(dashboard, 'Active Residents')} residents, ${findKpi(dashboard, 'Daily Tasks')} daily tasks`, status: findKpi(dashboard, 'Pending Tasks') > 0 ? 'Pending attention' : 'Stable', tone: 'text-primary-700 bg-primary-50' },
            { title: 'Facility Readiness', detail: `${findKpi(dashboard, 'Laundry Open')} laundry and ${findKpi(dashboard, 'Maintenance Open')} maintenance items open`, status: 'Housekeeping view', tone: 'text-amber-700 bg-amber-50' },
            { title: 'Stock Watch', detail: `${findKpi(dashboard, 'Low Stock')} low-stock items need review`, status: findKpi(dashboard, 'Low Stock') > 0 ? 'Reorder required' : 'No alert', tone: 'text-rose-700 bg-rose-50' }
        ]
    }

    if (code === 'UHC') {
        return [
            { title: 'Patient Safety', detail: `${findKpi(dashboard, 'Critical Vitals')} critical vitals from ${findKpi(dashboard, 'Patients')} patients`, status: findKpi(dashboard, 'Critical Vitals') > 0 ? 'Clinical review' : 'No critical alert', tone: 'text-rose-700 bg-rose-50' },
            { title: 'Care Workload', detail: `${findKpi(dashboard, 'Medical Assignments')} assignments and ${findKpi(dashboard, 'Medications')} medications`, status: 'Nursing queue', tone: 'text-sky-700 bg-sky-50' },
            { title: 'Approvals', detail: `${findKpi(dashboard, 'Pending Approvals')} approvals waiting`, status: findKpi(dashboard, 'Pending Approvals') > 0 ? 'Admin action' : 'Clear', tone: 'text-amber-700 bg-amber-50' }
        ]
    }

    if (code === 'UA') {
        return [
            { title: 'Dispatch Control', detail: `${findKpi(dashboard, 'Bookings')} bookings and ${findKpi(dashboard, 'Dispatch Active')} active dispatches`, status: 'Live operations', tone: 'text-orange-700 bg-orange-50' },
            { title: 'Emergency Queue', detail: `${findKpi(dashboard, 'Emergency Calls')} inbound calls, ${findKpi(dashboard, 'Missed Calls')} missed`, status: findKpi(dashboard, 'Missed Calls') > 0 ? 'Call back needed' : 'Queue clear', tone: 'text-rose-700 bg-rose-50' },
            { title: 'Fleet Support', detail: `${findKpi(dashboard, 'Maintenance')} maintenance items and ${findKpi(dashboard, 'Active Staff')} available staff`, status: 'Resource check', tone: 'text-sky-700 bg-sky-50' }
        ]
    }

    return [
        { title: 'Lead Intake', detail: `${findKpi(dashboard, 'New Leads')} new leads, ${findKpi(dashboard, 'Active Enquiries')} active enquiries`, status: 'CRM queue', tone: 'text-primary-700 bg-primary-50' },
        { title: 'Follow-up Discipline', detail: `${findKpi(dashboard, 'Follow-ups')} follow-ups and ${findKpi(dashboard, 'Admissions')} admissions`, status: findKpi(dashboard, 'Follow-ups') > 0 ? 'Staff action' : 'No pending follow-up', tone: 'text-amber-700 bg-amber-50' },
        { title: 'Customer Signals', detail: `${findKpi(dashboard, 'Complaints')} complaints, ${findKpi(dashboard, 'Missed Calls')} missed calls`, status: findKpi(dashboard, 'Complaints') > 0 || findKpi(dashboard, 'Missed Calls') > 0 ? 'Resolve today' : 'Stable', tone: 'text-rose-700 bg-rose-50' }
    ]
}

const getMonthSummary = (dashboard: OrganizationDashboardData) => {
    const current = dashboard.trend[dashboard.trend.length - 1]
    if (!current) return []

    return Object.entries(current)
        .filter(([key]) => key !== 'name')
        .slice(0, 3)
        .map(([key, value]) => ({ label: key, value }))
}

function FocusPanel({ title, detail, status, tone }: { title: string; detail: string; status: string; tone: string }) {
    return (
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
            <div className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${tone}`}>{status}</div>
            <h3 className="mt-4 text-lg font-black text-gray-950 dark:text-gray-100">{title}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">{detail}</p>
        </div>
    )
}

function TaskStatusPanel({ tasks }: { tasks: Array<{ name: string; value: number }> }) {
    const total = tasks.reduce((sum, task) => sum + task.value, 0)
    return (
        <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-black text-gray-950 dark:text-gray-100">Workload Status</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Live task split from current records</p>
                </div>
                <ClipboardCheck className="h-5 w-5 text-primary-500" />
            </div>
            <div className="mt-4 space-y-3">
                {tasks.map((task) => {
                    const width = total > 0 ? Math.max(6, Math.round((task.value / total) * 100)) : 0
                    return (
                        <div key={task.name}>
                            <div className="mb-1 flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-300">
                                <span>{task.name}</span>
                                <span>{task.value}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                                <div className="h-full rounded-full bg-primary-500" style={{ width: `${width}%` }} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

function MonthSnapshot({ items }: { items: Array<{ label: string; value: string | number }> }) {
    return (
        <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-black text-gray-950 dark:text-gray-100">Current Month Snapshot</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Compact trend readout without heavy charts</p>
                </div>
                <TrendingUp className="h-5 w-5 text-primary-500" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {items.map((item) => (
                    <div key={item.label} className="rounded-lg bg-gray-50 p-3 dark:bg-white/5">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500">{item.label}</p>
                        <p className="mt-2 text-2xl font-black text-gray-950 dark:text-gray-100">{typeof item.value === 'number' ? new Intl.NumberFormat('en-IN').format(item.value) : item.value}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

function OrganizationAnalyticsDashboard({ routeOrg }: { routeOrg: keyof typeof orgFallbacks }) {
    const fallback = orgFallbacks[routeOrg] || orgFallbacks.uncf
    const { data, isLoading, isError, refetch, isFetching } = useOrganizationDashboard(fallback.code)
    const dashboard = mergeDashboardData(fallbackDashboards[fallback.code], data)
    const focusItems = getOrgFocus(dashboard)
    const monthSummary = getMonthSummary(dashboard)

    if (isLoading) return <SkeletonLoader />

    return (
        <div className="w-full min-w-0 space-y-4 px-2 pb-6 sm:px-4 2xl:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <PageHeader
                    title={dashboard.title}
                    subtitle={dashboard.subtitle}
                    breadcrumbs={[{ label: dashboard.code }, { label: 'Dashboard' }]}
                />
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 shadow-sm transition hover:border-primary-300 hover:text-primary-600 sm:w-auto dark:border-white/10 dark:bg-black dark:text-gray-100"
                >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {isError && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    <AlertCircle className="h-4 w-4" />
                    Live organization analytics could not be loaded. Showing an empty dashboard shell.
                </div>
            )}

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
                {dashboard.kpis.map((kpi, index) => <KpiCard key={kpi.label} kpi={kpi} index={index} />)}
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                {focusItems.map((item) => <FocusPanel key={item.title} {...item} />)}
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(360px,0.42fr)_minmax(0,0.58fr)]">
                <div className="space-y-4">
                    <TaskStatusPanel tasks={dashboard.taskStatus} />
                    {monthSummary.length > 0 && <MonthSnapshot items={monthSummary} />}
                </div>

                <div className="min-h-[300px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                    <h2 className="text-lg font-black text-gray-950 dark:text-gray-100">Recent Activity</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Latest workflow updates from the database</p>
                    <div className="mt-4 space-y-3">
                        {dashboard.activities.length > 0 ? dashboard.activities.map((activity) => (
                            <div key={activity.id} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
                                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: dashboard.accent }} />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-black text-gray-900 dark:text-gray-100">{activity.title}</p>
                                    <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm font-bold text-gray-400 dark:border-white/10">
                                No recent activity found
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
