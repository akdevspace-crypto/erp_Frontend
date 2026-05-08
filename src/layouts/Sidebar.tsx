import { Sun, Moon, LayoutDashboard, Users, Calendar, HeartPulse, LogOut, Settings, HelpCircle, Database, Briefcase, FileBox, IndianRupee, Activity, Shield, ClipboardList, CheckSquare, Headset, Receipt, CreditCard, PenTool, User, Bell, Zap, Package, ShoppingCart, Key, Trash } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'
import { useAuthStore } from '../store/authStore'
import { canAccessPath } from '../lib/access'

export const subMenus: Record<string, { name: string, icon: any, href: string }[]> = {
    'Dashboard': [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Active Enquiries', icon: Activity, href: '/crm/active-enquiries' },
        { name: 'Critical Patients', icon: HeartPulse, href: '/healthcare/critical-patients' },
        { name: 'Low Stock Alerts', icon: Bell, href: '/inventory/low-stock-alerts' },
        { name: 'Pending Payments', icon: IndianRupee, href: '/finance/pending-payments' }
    ],
    'Enquiry Desk': [
        { name: 'Enquiry Follow-up', icon: Calendar, href: '/crm/enquiry-follow-up' },
        { name: 'New Enquiry', icon: Headset, href: '/crm/new-enquiry' },
        { name: 'All Clients', icon: Users, href: '/crm/clients' },
        { name: 'Admission Tracking', icon: ClipboardList, href: '/crm/admission-tracking' }
    ],
    'Healthcare': [
        { name: 'Patient Dashboard', icon: HeartPulse, href: '/healthcare/patient-dashboard' },
        { name: 'Vital Form', icon: Activity, href: '/healthcare/vitals' },
        { name: 'Medication Management', icon: FileBox, href: '/healthcare/medication-management' },
        { name: 'Nutrition & Diet', icon: ClipboardList, href: '/healthcare/nutrition-diet' },
        { name: 'ADL (Daily Living)', icon: CheckSquare, href: '/healthcare/adl' }
    ],
    'Operations': [
        { name: 'Food Preparation', icon: Briefcase, href: '/operations/food-preparation' },
        { name: 'Nutrition Planning', icon: Calendar, href: '/operations/nutrition-planning' },
        { name: 'Laundry Management', icon: CheckSquare, href: '/operations/laundry-management' },
        { name: 'Maintenance', icon: Settings, href: '/operations/maintenance' },
        { name: 'Waste (Rag) Management', icon: Trash, href: '/operations/waste-management' }
    ],
    'Inventory': [
        { name: 'Ration (Dry/Fresh)', icon: Package, href: '/inventory/products/ration' },
        { name: 'Stationary', icon: Package, href: '/inventory/products/stationary' },
        { name: 'Electrical & Plumbing', icon: Package, href: '/inventory/products/electrical-plumbing' },
        { name: 'Assets', icon: Database, href: '/inventory/products/assets' },
        { name: 'Stock', icon: Database, href: '/inventory/stock' },
        { name: 'Purchase Orders', icon: ShoppingCart, href: '/inventory/purchase-orders' },
        { name: 'Vendors', icon: Briefcase, href: '/inventory/vendors' }
    ],
    'Finance': [
        { name: 'Cashbox', icon: FileBox, href: '/finance/cashbox' },
        { name: 'Income', icon: IndianRupee, href: '/finance/income' },
        { name: 'Expense', icon: IndianRupee, href: '/finance/expense' },
        { name: 'In-House Expense', icon: Receipt, href: '/finance/inhouse-expense' },
        { name: 'Invoice', icon: FileBox, href: '/finance/invoice' },
        { name: 'Renewals', icon: Calendar, href: '/finance/renewals' }
    ],
    'Human Resource': [
        { name: 'Staff Management', icon: Users, href: '/hr/staff' },
        { name: 'Staff Privileges', icon: Shield, href: '/hr/staff-privilege' },
        { name: 'Labour Management', icon: Users, href: '/hr/labour' },
        { name: 'Recruitment', icon: Briefcase, href: '/hr/recruitment' },
        { name: 'Attendance', icon: Calendar, href: '/hr/attendance' },
        { name: 'Payroll', icon: CreditCard, href: '/hr/payroll' }
    ],
    'Security': [
        { name: 'Gate Management', icon: Shield, href: '/security/gate-management' },
        { name: 'Visitor Management', icon: Users, href: '/security/visitor-management' },
        { name: 'Entry Logs', icon: ClipboardList, href: '/security/entry-logs' },
        { name: 'OTP Logs', icon: Key, href: '/security/otp-logs' }
    ],
    /* removed Intelligence */




    'CMS': [
        { name: 'Blogs', icon: PenTool, href: '/cms/blogs' },
        { name: 'FAQ', icon: HelpCircle, href: '/cms/faq' },
        { name: 'Events', icon: Calendar, href: '/cms/events' }
    ],
    'Task Log': [
        { name: 'Assign Daily Task', icon: ClipboardList, href: '/task-log/assign-daily' },
        { name: 'Assign Schedule Task', icon: Calendar, href: '/task-log/assign-schedule' },
        { name: 'Daily Task Approval', icon: CheckSquare, href: '/task-log/daily-approval' },
        { name: 'Schedule Task Approval', icon: CheckSquare, href: '/task-log/schedule-approval' }
    ],
    'Profile': [
        { name: 'My Profile', icon: User, href: '/profile/me' },
        { name: 'Daily Task', icon: ClipboardList, href: '/profile/tasks' },
        { name: 'Notifications', icon: Bell, href: '/profile/notifications' }
    ]
}

export function Sidebar({ activeMenu }: { activeMenu: string }) {
    const location = useLocation()
    const navigate = useNavigate()
    const user = useAuthStore((state) => state.user)

    // Default to Dashboard if invalid
    const currentLinks = (subMenus[activeMenu] || subMenus['Dashboard']).filter((link) => canAccessPath(user, link.href))
    const visibleLinks = currentLinks.length > 0 ? currentLinks : subMenus['Dashboard']

    return (
        <aside className="w-[56px] hover:w-[200px] transition-[width] duration-300 ease-in-out shrink-0 h-full relative z-40 group">
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
                                    key={link.name}
                                    to={link.href}
                                    title={link.name}
                                    className={cn(
                                        "h-11 w-full rounded-full flex items-center justify-center group-hover:justify-start group-hover:px-4 transition-all shrink-0",
                                        isActive ? "bg-primary-500 text-white shadow-md relative" : "text-gray-400 hover:bg-primary-50 hover:text-primary-500 relative border border-transparent hover:border-primary-100"
                                    )}
                                >
                                    <link.icon className="w-[18px] h-[18px] shrink-0" />
                                    {/* Auto-expand text snippet */}
                                    <span className="opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-[120px] transition-all overflow-hidden whitespace-nowrap text-[13px] font-bold ml-0 group-hover:ml-3">
                                        {link.name}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* Split 3: Bottom Actions Container (RIGID) */}
                <div className="bg-white dark:bg-black dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 rounded-full w-[56px] flex flex-col items-center py-2 shrink-0 pointer-events-auto transition-all gap-1">
                    <button onClick={() => navigate('/settings')} className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-100 transition-all" title="Settings">
                        <Settings className="w-[18px] h-[18px] shrink-0" />
                    </button>
                    <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all" title="Logout">
                        <LogOut className="w-[18px] h-[18px] shrink-0" />
                    </button>
                </div>

            </div>
        </aside>
    )
}
