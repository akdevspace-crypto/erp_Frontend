import type { User } from '../store/authStore'

const OPEN_PATH_PREFIXES = ['/dashboard', '/settings', '/profile']

const pathPermissionMap: Array<{ prefix: string; permissions: string[] }> = [
    { prefix: '/hr/staff-privilege', permissions: ['Staff Privilege'] },
    { prefix: '/master/city', permissions: ['City Master'] },
    { prefix: '/master/unit', permissions: ['Unit Master'] },
    { prefix: '/master/client-services', permissions: ['Client Services'] },
    { prefix: '/master/department', permissions: ['Department', 'Department Master'] },
    { prefix: '/master/designation', permissions: ['Designation Master'] },
    { prefix: '/master/labour-services', permissions: ['Labour Services'] },
    { prefix: '/master/payment-category', permissions: ['Payment Category'] },
    { prefix: '/master/vendor', permissions: ['Vendor Master'] },
    { prefix: '/master/room', permissions: ['Room Mgt', 'Room Management'] },
    { prefix: '/enquiry/follow-up', permissions: ['Enquiry Follow-up'] },
    { prefix: '/enquiry/new', permissions: ['New Enquiry', 'New Enquiry Form'] },
    { prefix: '/enquiry/clients', permissions: ['All Client Details'] },
    { prefix: '/crm/active-enquiries', permissions: ['Active Enquiries', 'Enquiry Follow-up'] },
    { prefix: '/crm/enquiry-follow-up', permissions: ['Enquiry Follow-up'] },
    { prefix: '/crm/new-enquiry', permissions: ['New Enquiry', 'New Enquiry Form'] },
    { prefix: '/crm/clients', permissions: ['All Client Details'] },
    { prefix: '/crm/admission-tracking', permissions: ['Admission Tracking', 'All Client Details'] },
    { prefix: '/allocation/home-care', permissions: ['Home Care'] },
    { prefix: '/allocation/clinical-care', permissions: ['Clinical Care'] },
    { prefix: '/allocation/inhouse-care', permissions: ['In-House Care'] },
    { prefix: '/allocation/others', permissions: ['Others'] },
    { prefix: '/business/welcome-call', permissions: ['Welcome Call'] },
    { prefix: '/customer-care/pending-feedback', permissions: ['Pending Feedbacks', 'Pending Feedback'] },
    { prefix: '/customer-care/complaints', permissions: ['Customer Complaints'] },
    { prefix: '/customer-care/service-history', permissions: ['Service History'] },
    { prefix: '/inhouse-care/revenue', permissions: ['Revenue Form'] },
    { prefix: '/inhouse-care/vitals', permissions: ['Vital Form'] },
    { prefix: '/healthcare/critical-patients', permissions: ['Critical Patients', 'Vital Form'] },
    { prefix: '/healthcare/patient-dashboard', permissions: ['Patient Dashboard', 'Vital Form'] },
    { prefix: '/healthcare/vitals', permissions: ['Vital Form'] },
    { prefix: '/healthcare/medication-management', permissions: ['Medication Management', 'Vital Form'] },
    { prefix: '/healthcare/nutrition-diet', permissions: ['Nutrition & Diet', 'Vital Form'] },
    { prefix: '/healthcare/adl', permissions: ['ADL', 'Vital Form'] },
    { prefix: '/operations/food-preparation', permissions: ['Food Preparation'] },
    { prefix: '/operations/nutrition-planning', permissions: ['Nutrition Planning'] },
    { prefix: '/operations/laundry-management', permissions: ['Laundry Management'] },
    { prefix: '/operations/maintenance', permissions: ['Maintenance'] },
    { prefix: '/operations/waste-management', permissions: ['Waste Management', 'Waste (Rag) Management'] },
    { prefix: '/inventory/low-stock-alerts', permissions: ['Low Stock Alerts', 'Stock'] },
    { prefix: '/inventory/products', permissions: ['Products', 'Inventory Products', 'Stock'] },
    { prefix: '/inventory/stock', permissions: ['Stock'] },
    { prefix: '/inventory/purchase-orders', permissions: ['Purchase Orders'] },
    { prefix: '/inventory/vendors', permissions: ['Vendor Master'] },
    { prefix: '/accounts/cashbox', permissions: ['Cashbox'] },
    { prefix: '/accounts/pending', permissions: ['Cashbox Pending'] },
    { prefix: '/accounts/income', permissions: ['Income'] },
    { prefix: '/accounts/expense', permissions: ['Expense'] },
    { prefix: '/accounts/inhouse-expense', permissions: ['In-house Expense', 'In-House Expense'] },
    { prefix: '/finance/pending-payments', permissions: ['Pending Payments', 'Cashbox Pending'] },
    { prefix: '/finance/cashbox', permissions: ['Cashbox'] },
    { prefix: '/finance/income', permissions: ['Income'] },
    { prefix: '/finance/expense', permissions: ['Expense'] },
    { prefix: '/finance/inhouse-expense', permissions: ['In-house Expense', 'In-House Expense'] },
    { prefix: '/finance/invoice', permissions: ['Invoice'] },
    { prefix: '/finance/renewals', permissions: ['Renewals'] },
    { prefix: '/hr/staff', permissions: ['Staff Management'] },
    { prefix: '/hr/labour', permissions: ['Labour Mgt'] },
    { prefix: '/hr/recruitment', permissions: ['Recruitment', 'Job Enquiry'] },
    { prefix: '/hr/attendance', permissions: ['Attendance'] },
    { prefix: '/hr/payroll', permissions: ['Payroll'] },
    { prefix: '/security/gate-management', permissions: ['Gate Management', 'Security'] },
    { prefix: '/security/visitor-management', permissions: ['Visitor Management', 'Security'] },
    { prefix: '/security/entry-logs', permissions: ['Entry Logs', 'Security'] },
    { prefix: '/security/otp-logs', permissions: ['OTP Logs', 'Security'] },
    { prefix: '/omnichannel/conversations', permissions: ['Conversations', 'Omnichannel'] },
    { prefix: '/omnichannel/email', permissions: ['Email', 'Omnichannel'] },
    { prefix: '/omnichannel/whatsapp', permissions: ['WhatsApp', 'Omnichannel'] },
    { prefix: '/omnichannel/sms', permissions: ['SMS', 'Omnichannel'] },
    { prefix: '/omnichannel/missed-calls', permissions: ['Missed Calls', 'Calls', 'Omnichannel'] },
    { prefix: '/omnichannel/calls', permissions: ['Calls', 'Omnichannel'] },
    { prefix: '/automation/dashboard', permissions: ['Automation Hub', 'Automation'] },
    { prefix: '/automation/intelligence', permissions: ['Predictive Sales', 'Automation'] },
    { prefix: '/automation/rules', permissions: ['Rule Builder', 'Automation'] },
    { prefix: '/cms/blogs', permissions: ['Blogs', 'CMS'] },
    { prefix: '/cms/faq', permissions: ['FAQ', 'CMS'] },
    { prefix: '/cms/events', permissions: ['Events', 'CMS'] },
    { prefix: '/task-log/assign-daily', permissions: ['Assign Daily Task', 'Task Log'] },
    { prefix: '/task-log/assign-schedule', permissions: ['Assign Schedule Task', 'Task Log'] },
    { prefix: '/task-log/daily-approval', permissions: ['Daily Task Approval', 'Task Log'] },
    { prefix: '/task-log/schedule-approval', permissions: ['Schedule Task Approval', 'Task Log'] }
]

const normalizePath = (pathname: string) => pathname === '/' ? '/dashboard' : pathname.replace(/\/+$/, '') || '/dashboard'

export const hasAllAccess = (user: User | null | undefined) => Boolean(user?.permissions?.includes('ALL_ACCESS'))

export const hasPermissionAccess = (user: User | null | undefined, permissions: string[]) => {
    if (!user) return false
    if (hasAllAccess(user)) return true
    return permissions.some((permission) => user.permissions.includes(permission))
}

export const canAccessPath = (user: User | null | undefined, pathname: string) => {
    if (!user) return false

    const normalizedPath = normalizePath(pathname)

    if (OPEN_PATH_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix))) {
        return true
    }

    const matchedRule = pathPermissionMap.find((rule) => normalizedPath.startsWith(rule.prefix))
    if (!matchedRule) return hasAllAccess(user)

    return hasPermissionAccess(user, matchedRule.permissions)
}

export const hasUnitAccess = (user: User | null | undefined, unitId: string) => {
    if (!user) return false
    if (hasAllAccess(user)) return true
    return user.unitAccess.includes('*') || user.unitAccess.includes(unitId)
}
