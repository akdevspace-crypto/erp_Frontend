import { Sun, Moon, LayoutDashboard, Users, Calendar, HeartPulse, LogOut, Settings, HelpCircle, Database, Briefcase, FileBox, IndianRupee, Activity, ClipboardList, ClipboardCheck, Headset, Receipt, CreditCard, PenTool, User, Bell, MessageSquare, PhoneCall, FileText, HandHelping, MapPin, Building2, Network, Badge, Bed, TrendingUp, TrendingDown, Wallet, Landmark, UserCog, GraduationCap, Clock, DoorOpen, ListChecks, Pill, Ambulance, Radio, FilePenLine, FolderArchive } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'
import { useAuthStore } from '../store/authStore'
import { canAccessPath } from '../lib/access'

type MenuLink = { name: string, icon: any, href: string }

const roleDashboardOwners: Record<string, string> = {
    '/master/dashboard': 'master data manager',
    '/finance/dashboard': 'finance manager',
    '/hr/manager-dashboard': 'hr manager',
    '/security/dashboard': 'security supervisor',
    '/cms/dashboard': 'cms manager',
    '/admin-files/dashboard': 'admin files manager',
    '/task-user/dashboard': 'profile task user',
    '/uec/elder-care-dashboard': 'elder care admin',
    '/inhouse-care/dashboard': 'in-house care manager',
    '/operations/dashboard': 'elder operations manager',
    '/inventory/elder-dashboard': 'elder inventory manager',
    '/task-log/dashboard': 'task log coordinator',
    '/finance/elder-dashboard': 'elder finance manager',
    '/healthcare/patient-care-dashboard': 'patient care manager',
    '/healthcare/medical-monitor-dashboard': 'medical monitor coordinator',
    '/allocation/dashboard': 'care allocation manager',
    '/inventory/medical-dashboard': 'medical inventory manager',
    '/ambulance/booking-dashboard': 'ambulance booking coordinator',
    '/ambulance/dispatch-dashboard': 'dispatch manager',
    '/ambulance/fleet-dashboard': 'fleet manager',
    '/ambulance/billing-dashboard': 'ambulance billing manager',
    '/ambulance/emergency-dashboard': 'emergency call coordinator',
    '/crm/dashboard': 'enquiry desk manager',
    '/crm/follow-up-dashboard': 'follow-up coordinator',
    '/customer-care/dashboard': 'customer relations manager',
    '/omnichannel/dashboard': 'omnichannel coordinator',
    '/crm/admissions-dashboard': 'admissions coordinator'
}

const withoutRoleDashboards = (links: MenuLink[]) =>
    links.filter((link) => !roleDashboardOwners[link.href])

const getNormalizedRole = (role: unknown) => {
    if (!role) return ''
    if (typeof role === 'string') return role.trim().toLowerCase()
    if (typeof role === 'object' && 'name' in role) {
        const roleName = (role as { name?: unknown }).name
        return typeof roleName === 'string' ? roleName.trim().toLowerCase() : ''
    }
    return ''
}

const getRoleDashboardLink = (role: string) => {
    const entry = Object.entries(roleDashboardOwners).find(([, ownerRole]) => ownerRole === role)
    if (!entry) return null

    const [href] = entry
    return Object.values(subMenus).flat().find((link) => link.href === href) || null
}

const masterMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/master/dashboard' },
    { name: 'City Master', icon: MapPin, href: '/master/city' },
    { name: 'Unit Master', icon: Building2, href: '/master/unit' },
    { name: 'Client Services', icon: HandHelping, href: '/master/client-services' },
    { name: 'Department Master', icon: Network, href: '/master/department' },
    { name: 'Designation Master', icon: Badge, href: '/master/designation' },
    { name: 'Labour Services', icon: Users, href: '/master/labour-services' },
    { name: 'Payment Category', icon: CreditCard, href: '/master/payment-category' },
    { name: 'Vendor Master', icon: Briefcase, href: '/master/vendor' },
    { name: 'Room Management', icon: Bed, href: '/master/room' }
]

const financeMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/finance/dashboard' },
    { name: 'Cashbox', icon: Wallet, href: '/finance/cashbox' },
    { name: 'Income', icon: TrendingUp, href: '/finance/income' },
    { name: 'Expense', icon: TrendingDown, href: '/finance/expense' },
    { name: 'Pending Payments', icon: IndianRupee, href: '/finance/pending-payments' },
    { name: 'Allowance Tracking', icon: Landmark, href: '/finance/allowance-tracking' },
    { name: 'Patient Daily Cost', icon: Receipt, href: '/finance/patient-daily-cost' },
    { name: 'Invoice', icon: Receipt, href: '/finance/invoice' },
    { name: 'Renewals', icon: Calendar, href: '/finance/renewals' }
]

const hrMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/hr/manager-dashboard' },
    { name: 'HR Dashboard', icon: Activity, href: '/hr/dashboard' },
    { name: 'Staff Privileges', icon: UserCog, href: '/hr/staff-privilege' },
    { name: 'Leave Management', icon: FilePenLine, href: '/hr/leave' },
    { name: 'Shift Roster', icon: Clock, href: '/hr/roster' },
    { name: 'Document Tracker', icon: FileBox, href: '/hr/documents' },
    { name: 'Training Compliance', icon: GraduationCap, href: '/hr/training' },
    { name: 'Labour Management', icon: HandHelping, href: '/hr/labour' },
    { name: 'Recruitment', icon: Briefcase, href: '/hr/recruitment' },
    { name: 'Attendance', icon: ListChecks, href: '/hr/attendance' },
    { name: 'Holiday Mapping', icon: Calendar, href: '/hr/holiday' },
    { name: 'Payroll', icon: CreditCard, href: '/hr/payroll' },
    { name: 'HR Reports', icon: FileText, href: '/hr/reports' }
]

const cmsMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/cms/dashboard' },
    { name: 'Blogs', icon: PenTool, href: '/cms/blogs' },
    { name: 'FAQ', icon: HelpCircle, href: '/cms/faq' },
    { name: 'Events', icon: Calendar, href: '/cms/events' }
]

// Preserve CMS route definitions for later, but keep them out of the daily operations menu.
void cmsMenus

const profileMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/task-user/dashboard' },
    { name: 'My Profile', icon: User, href: '/profile/me' },
    { name: 'Daily Task', icon: ClipboardList, href: '/profile/tasks' },
    { name: 'My Attendance', icon: ListChecks, href: '/profile/attendance' },
    { name: 'My Leave', icon: Calendar, href: '/profile/leave' },
    { name: 'Notifications', icon: Bell, href: '/profile/notifications' }
]

const clientPortalMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/client-portal/dashboard' },
    { name: 'My Profile', icon: User, href: '/client-portal/profile' },
    { name: 'My Services', icon: HandHelping, href: '/client-portal/services' },
    { name: 'My Medicines', icon: Pill, href: '/client-portal/medicines' },
    { name: 'My Complaints', icon: MessageSquare, href: '/client-portal/complaints' },
    { name: 'Notifications', icon: Bell, href: '/client-portal/notifications' }
]

const superAdminMenus: MenuLink[] = [
    { name: 'User Management', icon: User, href: '/super-admin/users' }
]

const inHouseCareMenus: MenuLink[] = [
    { name: 'In-House Care', icon: Activity, href: '/module/uec-inhouse-care' }
]

const organizationDashboardMenus: Record<string, MenuLink> = {
    UNCF: { name: 'UNCF Dashboard', icon: LayoutDashboard, href: '/uncf/dashboard' },
    ElderCare: { name: 'Dashboard', icon: LayoutDashboard, href: '/uec/elder-care-dashboard' },
    UEC: { name: 'UEC Dashboard', icon: LayoutDashboard, href: '/uec/dashboard' },
    UHC: { name: 'UHC Dashboard', icon: LayoutDashboard, href: '/uhc/dashboard' },
    UA: { name: 'UA Dashboard', icon: LayoutDashboard, href: '/ua/dashboard' },
    UEO: { name: 'UEO Dashboard', icon: LayoutDashboard, href: '/ueo/dashboard' }
}

const adminFileMenus: MenuLink[] = [
    { name: 'Admin Files', icon: FolderArchive, href: '/admin-files' }
]

const elderOperationsMenus: MenuLink[] = [
    { name: 'Elder Operations', icon: Settings, href: '/module/uec-operations' }
]

const elderInventoryMenus: MenuLink[] = [
    { name: 'Elder Inventory', icon: Database, href: '/inventory' }
]

const taskLogMenus: MenuLink[] = [
    { name: 'Task Log', icon: ClipboardList, href: '/module/uec-task-log' }
]

const healthcareMenus: MenuLink[] = [
    { name: 'Healthcare', icon: HeartPulse, href: '/module/uhc-healthcare' }
]

const allocationMenus: MenuLink[] = [
    { name: 'Care Allocation', icon: Users, href: '/module/uhc-allocation' }
]

const medicalInventoryMenus: MenuLink[] = [
    { name: 'Medical Inventory', icon: Database, href: '/inventory' }
]

const ambulanceServiceMenus: MenuLink[] = [
    { name: 'Ambulance Services', icon: Ambulance, href: '/module/ua-services' }
]

const ambulanceSupportMenus: MenuLink[] = [
    { name: 'Ambulance Support', icon: PhoneCall, href: '/module/ua-support' }
]

const enquiryMenus: MenuLink[] = [
    { name: 'Enquiry Desk', icon: Headset, href: '/module/ueo-enquiry' }
]

const customerCareMenus: MenuLink[] = [
    { name: 'Customer Relations', icon: MessageSquare, href: '/module/ueo-customer' }
]

const omnichannelMenus: MenuLink[] = [
    { name: 'Omnichannel', icon: Radio, href: '/module/ueo-omnichannel' }
]

const securityCommandMenus: MenuLink[] = [
    { name: 'Security', icon: DoorOpen, href: '/module/ueo-security' }
]

export const subMenus: Record<string, MenuLink[]> = {
    'Home': [
        { name: 'Home', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Finance', icon: Wallet, href: '/finance/cashbox' },
        { name: 'Patient Daily Cost', icon: Receipt, href: '/finance/patient-daily-cost' },
        { name: 'Daily Operations', icon: ClipboardCheck, href: '/daily-operations' },
        { name: 'Human Resource', icon: Users, href: '/hr/dashboard' },
        { name: 'Workflow Timeline', icon: Activity, href: '/workflow/timeline' },
        { name: 'Reports', icon: FileText, href: '/reports/dashboard' },
        ...adminFileMenus
    ],
    'UNCF': [
        { name: 'Foundation Command Center', icon: HandHelping, href: '/uncf/dashboard' }
    ],
    'Super Admin': superAdminMenus,
    'Master': masterMenus,
    'Finance': financeMenus,
    'Human Resource': hrMenus,
    'Profile': profileMenus,
    'Client Portal': clientPortalMenus,
    'Admin Files': adminFileMenus,

    'UEC': [
        organizationDashboardMenus.UEC,
        ...withoutRoleDashboards(inHouseCareMenus),
        ...withoutRoleDashboards(elderOperationsMenus),
        ...withoutRoleDashboards(elderInventoryMenus),
        { name: 'Elder Finance', icon: Receipt, href: '/module/uec-finance' },
        ...withoutRoleDashboards(taskLogMenus)
    ],
    'In-House Care': inHouseCareMenus,
    'Elder Operations': elderOperationsMenus,
    'Elder Inventory': elderInventoryMenus,
    'Elder Finance': [{ name: 'Elder Finance', icon: Receipt, href: '/module/uec-finance' }],
    'Task Log': taskLogMenus,

    'UHC': [
        organizationDashboardMenus.UHC,
        ...withoutRoleDashboards(healthcareMenus),
        ...withoutRoleDashboards(allocationMenus),
        ...withoutRoleDashboards(medicalInventoryMenus)
    ],
    'Healthcare': healthcareMenus,
    'Care Allocation': allocationMenus,
    'Medical Inventory': medicalInventoryMenus,

    'UA': [
        organizationDashboardMenus.UA,
        ...withoutRoleDashboards(ambulanceServiceMenus),
        ...withoutRoleDashboards(ambulanceSupportMenus)
    ],
    'Ambulance Services': ambulanceServiceMenus,
    'Ambulance Support': ambulanceSupportMenus,

    'UEO': [
        organizationDashboardMenus.UEO,
        ...withoutRoleDashboards(enquiryMenus),
        ...withoutRoleDashboards(customerCareMenus),
        ...withoutRoleDashboards(omnichannelMenus),
        ...withoutRoleDashboards(securityCommandMenus)
    ],
    'Enquiry Desk': enquiryMenus,
    'Customer Relations': customerCareMenus,
    'Omnichannel': omnichannelMenus,
    'Security': securityCommandMenus
}

export function Sidebar({ activeMenu }: { activeMenu: string }) {
    const location = useLocation()
    const navigate = useNavigate()
    const user = useAuthStore((state) => state.user)
    const logout = useAuthStore((state) => state.logout)
    const normalizedRole = getNormalizedRole(user?.role)
    const isStaffSelfService = Boolean(user?.staffId)
    const isClientPortal = ['family member', 'client', 'client family member'].includes(normalizedRole)
    const canShowLink = (link: MenuLink) => {
        const ownerRole = roleDashboardOwners[link.href]
        if (link.href === '/task-user/dashboard' && user?.staffId) return canAccessPath(user, link.href)
        if (ownerRole && ownerRole !== normalizedRole) return false
        return canAccessPath(user, link.href)
    }

    const homeLinks = subMenus['Home'].filter(canShowLink)
    const uncfLinks = subMenus['UNCF'].filter(canShowLink)
    const fallbackLinks = homeLinks.length > 0 ? homeLinks : uncfLinks
    const currentLinks = (isStaffSelfService ? profileMenus : isClientPortal ? clientPortalMenus : (subMenus[activeMenu] || [])).filter(canShowLink)
    const baseVisibleLinks = currentLinks.length > 0 ? currentLinks : fallbackLinks
    const roleDashboardLink = getRoleDashboardLink(normalizedRole)
    const combinedLinks = roleDashboardLink && !isStaffSelfService && canShowLink(roleDashboardLink) && !baseVisibleLinks.some((link) => link.href === roleDashboardLink.href)
        ? [roleDashboardLink, ...baseVisibleLinks]
        : baseVisibleLinks
    const visibleLinks = Array.from(new Map(combinedLinks.map((link) => [link.href, link])).values())
    const canAccessSettings = canAccessPath(user, '/settings')
    const profileRoute = isClientPortal ? '/client-portal/profile' : '/profile/me'
    const canAccessProfile = canAccessPath(user, profileRoute)

    return (
        <aside className="w-[56px] hover:w-[236px] transition-[width] duration-300 ease-in-out shrink-0 h-full relative z-40 group md:block hidden">
            <div className="w-full h-full flex flex-col items-start gap-4 pointer-events-none">

                {/* Split 1: Theme Toggle Container (RIGID) */}
                <div className="bg-white dark:bg-black dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 rounded-full w-[56px] flex flex-col items-center py-2 shrink-0 pointer-events-auto transition-all">
                    <button
                        onClick={() => document.documentElement.classList.remove('dark')}
                        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-[#1E1E1E] text-white shadow-sm mb-1 transition-all dark:bg-transparent dark:text-gray-500 dark:hover:text-gray-300 dark:shadow-none"
                        title="Light Theme"
                    >
                        <Sun className="w-4 h-4 shrink-0" />
                    </button>
                    <button
                        onClick={() => document.documentElement.classList.add('dark')}
                        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-800 dark:text-gray-200 transition-all dark:bg-primary-500 dark:text-white dark:shadow-sm"
                        title="Dark Theme"
                    >
                        <Moon className="w-4 h-4 shrink-0" />
                    </button>
                </div>

                {/* Split 2: Menu Icons Container (EXPANDS) */}
                <div className="bg-white dark:bg-black dark:border-white/10 shadow-lg sm:shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 rounded-[28px] w-full flex-1 flex flex-col items-center py-3 px-1.5 overflow-y-auto [&::-webkit-scrollbar]:w-0 pointer-events-auto transition-all duration-300">
                    <div className="flex flex-col gap-2 w-full">
                        {visibleLinks.map((link) => {
                            const isActive = location.pathname === link.href || (link.href === '/dashboard' && location.pathname === '/')
                            return (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    title={link.name}
                                    className={cn(
                                        "h-11 w-full rounded-full flex items-center justify-center group-hover:justify-start group-hover:px-4 transition-all shrink-0",
                                        isActive ? "bg-primary-500 text-white shadow-md relative" : "text-gray-400 hover:bg-primary-50 hover:text-primary-500 relative border border-transparent hover:border-primary-100"
                                    )}
                                >
                                    <link.icon className="w-[18px] h-[18px] shrink-0" />
                                    {/* Auto-expand text snippet */}
                                    <span className="opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-[160px] transition-all overflow-hidden whitespace-nowrap text-[13px] font-bold ml-0 group-hover:ml-3">
                                        {link.name}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* Split 3: Bottom Actions Container (RIGID) */}
                <div className="bg-white dark:bg-black dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 rounded-[28px] w-full flex flex-col items-center py-2 px-1.5 shrink-0 pointer-events-auto transition-all gap-1">
                    {canAccessProfile ? (
                        <Link
                            to={profileRoute}
                            className="h-11 w-full rounded-full flex items-center justify-center group-hover:justify-start group-hover:px-4 transition-all shrink-0 text-gray-500 hover:bg-primary-50 hover:text-primary-600 border border-transparent hover:border-primary-100"
                            title="Profile"
                        >
                            <User className="w-[18px] h-[18px] shrink-0" />
                            <span className="opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-[160px] transition-all overflow-hidden whitespace-nowrap text-[13px] font-bold ml-0 group-hover:ml-3">
                                Profile
                            </span>
                        </Link>
                    ) : null}
                    {canAccessSettings ? (
                        <button onClick={() => navigate('/settings')} className="h-11 w-full rounded-full flex items-center justify-center group-hover:justify-start group-hover:px-4 transition-all shrink-0 text-gray-400 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-100" title="Settings">
                            <Settings className="w-[18px] h-[18px] shrink-0" />
                            <span className="opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-[160px] transition-all overflow-hidden whitespace-nowrap text-[13px] font-bold ml-0 group-hover:ml-3">
                                Settings
                            </span>
                        </button>
                    ) : null}
                    <button onClick={() => { logout(); navigate('/auth/login', { replace: true }); }} className="h-11 w-full rounded-full flex items-center justify-center group-hover:justify-start group-hover:px-4 transition-all shrink-0 text-gray-400 hover:bg-red-50 hover:text-red-500" title="Logout">
                        <LogOut className="w-[18px] h-[18px] shrink-0" />
                        <span className="opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-[160px] transition-all overflow-hidden whitespace-nowrap text-[13px] font-bold ml-0 group-hover:ml-3">
                            Logout
                        </span>
                    </button>
                </div>

            </div>
        </aside>
    )
}
