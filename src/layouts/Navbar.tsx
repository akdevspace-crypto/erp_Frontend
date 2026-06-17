import { Search, ChevronDown, Menu, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'
import { subMenus } from './Sidebar'
import { ChatModal } from '../components/OmnichannelChatModal'
import { NotificationModal } from '../components/NotificationModal'
import { useUnits } from '../features/master/hooks/useUnit'
import { useAuthStore } from '../store/authStore'
import { canAccessPath, canAccessUncfDashboard, getDefaultRouteForUser, hasAllAccess, hasUnitAccess } from '../lib/access'

export function Navbar({ activeMenu, setActiveMenu }: { activeMenu: string, setActiveMenu: (m: string) => void }) {
    const navigate = useNavigate()
    const [showChatModal, setShowChatModal] = useState(false)
    const [focusConversationId, setFocusConversationId] = useState<string | null>(null)
    const [openCallCenter, setOpenCallCenter] = useState(false)
    const [showNotificationModal, setShowNotificationModal] = useState(false)
    const [openMenuGroup, setOpenMenuGroup] = useState<string | null>(null)
    const [showUserManagementMenu, setShowUserManagementMenu] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { data: units = [] } = useUnits()
    const user = useAuthStore((state) => state.user)
    const activeUnitId = useAuthStore((state) => state.activeUnitId)
    const setActiveUnitId = useAuthStore((state) => state.setActiveUnitId)
    const isStaffSelfService = Boolean(user?.staffId)
    const normalizedRole = typeof user?.role === 'string'
        ? user.role.trim().toLowerCase()
        : String(user?.role?.name || '').trim().toLowerCase()
    const isClientPortal = ['family member', 'client', 'client family member'].includes(normalizedRole)
    const roleScopedMenuGroups: Record<string, Array<{ name: string, items: string[] }>> = {
        'uncf admin': [{ name: 'UNCF', items: ['UNCF'] }],
        'master data manager': [{ name: 'Master', items: ['Master'] }],
        'finance manager': [{ name: 'Finance', items: ['Finance'] }],
        'hr manager': [{ name: 'Human Resource', items: ['Human Resource'] }],
        'security supervisor': [{ name: 'Security', items: ['Security'] }],
        'admin files manager': [{ name: 'Admin Files', items: ['Admin Files'] }],
        'profile task user': [{ name: 'Profile', items: ['Profile'] }],
        'elder care admin': [{ name: 'UEC', items: ['UEC'] }],
        'in-house care manager': [{ name: 'UEC', items: ['UEC'] }],
        'elder operations manager': [{ name: 'UEC', items: ['UEC'] }],
        'elder inventory manager': [{ name: 'UEC', items: ['UEC'] }],
        'task log coordinator': [{ name: 'UEC', items: ['UEC'] }],
        'elder finance manager': [{ name: 'UEC', items: ['UEC'] }],
        'uhc admin': [{ name: 'UHC', items: ['UHC'] }],
        'patient care manager': [{ name: 'UHC', items: ['UHC'] }],
        'medical monitor coordinator': [{ name: 'UHC', items: ['UHC'] }],
        'care allocation manager': [{ name: 'UHC', items: ['UHC'] }],
        'medical inventory manager': [{ name: 'UHC', items: ['UHC'] }],
        'ua admin': [{ name: 'UA', items: ['UA'] }],
        'ambulance booking coordinator': [{ name: 'UA', items: ['UA'] }],
        'dispatch manager': [{ name: 'UA', items: ['UA'] }],
        'fleet manager': [{ name: 'UA', items: ['UA'] }],
        'ambulance billing manager': [{ name: 'UA', items: ['UA'] }],
        'emergency call coordinator': [{ name: 'UA', items: ['UA'] }],
        'ueo admin': [{ name: 'UEO', items: ['UEO'] }],
        'enquiry desk manager': [{ name: 'UEO', items: ['UEO'] }],
        'follow-up coordinator': [{ name: 'UEO', items: ['UEO'] }],
        'admissions coordinator': [{ name: 'UEO', items: ['UEO'] }],
        'customer relations manager': [{ name: 'UEO', items: ['UEO'] }],
        'omnichannel coordinator': [{ name: 'UEO', items: ['UEO'] }]
    }
    const menuGroups = useMemo(() => (
        isStaffSelfService ? [
            { name: 'Home', items: ['Home'] },
            { name: 'Profile', items: ['Profile'] }
        ] : isClientPortal ? [
            { name: 'Client Portal', items: ['Client Portal'] }
        ] : roleScopedMenuGroups[normalizedRole] || [
            { name: 'Home', items: ['Home'] },
            { name: 'UNCF', items: ['UNCF'] },
            { name: 'UEC', items: ['UEC'] },
            { name: 'UHC', items: ['UHC'] },
            { name: 'UA', items: ['UA'] },
            { name: 'UEO', items: ['UEO'] }
        ]
    ), [isClientPortal, isStaffSelfService, normalizedRole])
    const accessibleUnits = useMemo(
        () => hasAllAccess(user) ? units : units.filter((unit) => hasUnitAccess(user, unit.id)),
        [units, user]
    )
    const canAccessMenu = useCallback((menu: string) => {
        if (menu === 'UNCF' && !canAccessUncfDashboard(user)) return false

        const menuLinks = subMenus[menu] || []
        return menuLinks.some((link) => canAccessPath(user, link.href))
    }, [user])
    const visibleMenuGroups = useMemo(() => (
        menuGroups
            .map((group) => ({
                ...group,
                items: group.items.filter((item) => canAccessMenu(item))
            }))
            .filter((group) => group.items.length > 0)
    ), [canAccessMenu, menuGroups])
    const canAccessSuperAdmin = !isStaffSelfService && canAccessMenu('Super Admin')
    const canAccessAdminFiles = !isStaffSelfService && canAccessMenu('Admin Files')
    const canAccessClientPortal = !isStaffSelfService && !isClientPortal && canAccessMenu('Client Portal')
    const visibleMenus = useMemo(() => [
        ...visibleMenuGroups.flatMap((group) => group.items),
        ...(canAccessSuperAdmin ? ['Super Admin'] : []),
        ...(canAccessClientPortal ? ['Client Portal'] : [])
    ], [canAccessClientPortal, canAccessSuperAdmin, visibleMenuGroups])
    const validActiveMenus = useMemo(() => [
        ...visibleMenus,
        ...(canAccessAdminFiles ? ['Admin Files'] : []),
        ...(canAccessMenu('Home') ? ['Home'] : [])
    ], [canAccessAdminFiles, canAccessMenu, visibleMenus])
    const menuUnitCodes: Record<string, string> = {
        UNCF: 'UNCF',
        Master: 'UNCF',
        Finance: 'UNCF',
        'Human Resource': 'UNCF',
        Security: 'UNCF',
        Profile: 'UNCF',
        UEC: 'UEC',
        'In-House Care': 'UEC',
        'Elder Operations': 'UEC',
        'Elder Inventory': 'UEC',
        'Elder Finance': 'UEC',
        'Task Log': 'UEC',
        UHC: 'UHC',
        Healthcare: 'UHC',
        'Care Allocation': 'UHC',
        'Medical Inventory': 'UHC',
        UA: 'UA',
        'Ambulance Services': 'UA',
        'Ambulance Support': 'UA',
        UEO: 'UEO',
        'Enquiry Desk': 'UEO',
        'Customer Relations': 'UEO',
        Omnichannel: 'UEO',
    }
    const resolveUnitForMenu = (menu: string) => {
        const unitCode = menuUnitCodes[menu]
        if (!unitCode) return null

        return accessibleUnits.find((unit) => {
            const code = String(unit.unitId || '').trim().toUpperCase()
            const shortName = String(unit.shortName || '').trim().toUpperCase()
            const name = String(unit.name || '').trim().toUpperCase()
            return code === unitCode || shortName === unitCode || name.includes(unitCode)
        }) || null
    }
    const activateMenu = (menu: string) => {
        setOpenMenuGroup(null)
        setActiveMenu(menu)

        if (menu === 'Client Portal' && !isClientPortal) {
            navigate('/client-portal/access')
            return
        }

        const menuUnit = resolveUnitForMenu(menu)
        if (menuUnit && menuUnit.id !== activeUnitId) {
            setActiveUnitId(menuUnit.id)
        }

        if (menu === 'UHC' || menu === 'UA' || menu === 'UEO') {
            const defaultRoute = getDefaultRouteForUser(user)
            if (
                defaultRoute.startsWith('/uhc') ||
                defaultRoute.startsWith('/healthcare') ||
                defaultRoute.startsWith('/allocation') ||
                defaultRoute.startsWith('/inventory') ||
                defaultRoute.startsWith('/ua') ||
                defaultRoute.startsWith('/ambulance') ||
                defaultRoute.startsWith('/hr/field-duty') ||
                defaultRoute.startsWith('/ueo') ||
                defaultRoute.startsWith('/crm') ||
                defaultRoute.startsWith('/business') ||
                defaultRoute.startsWith('/customer-care') ||
                defaultRoute.startsWith('/omnichannel')
            ) {
                navigate(defaultRoute)
                return
            }
        }

        const nextLink = (subMenus[menu] || []).find((link) => canAccessPath(user, link.href))
        if (nextLink) {
            navigate(nextLink.href)
        }
    }
    const getGroupActive = (items: string[]) => items.includes(activeMenu)
    const getGroupTarget = (items: string[]) => {
        if (items.includes(activeMenu)) return activeMenu
        return items[0]
    }
    const getDropdownItems = (group: { name: string, items: string[] }) =>
        group.items.filter((item) => item !== group.name)
    const resolvedActiveUnitId = activeUnitId || user?.unitId || ''
    const safeActiveUnitId = accessibleUnits.some((unit) => unit.id === resolvedActiveUnitId)
        ? resolvedActiveUnitId
        : (accessibleUnits[0]?.id || '')
    const userManagementLinks = [
        { name: 'User Management', href: '/super-admin/users' },
        { name: 'Staff Management', href: '/hr/staff' },
        { name: 'Client Management', href: '/crm/clients' }
    ].filter((link) => canAccessPath(user, link.href))

    useEffect(() => {
        if (!accessibleUnits.length) return
        if (accessibleUnits.some((unit) => unit.id === resolvedActiveUnitId)) return

        const nextUnitId = accessibleUnits[0]?.id
        if (!nextUnitId || activeUnitId === nextUnitId) return

        setActiveUnitId(nextUnitId)
    }, [accessibleUnits, activeUnitId, resolvedActiveUnitId, setActiveUnitId])

    useEffect(() => {
        if (!visibleMenus.length) return
        if (validActiveMenus.includes(activeMenu)) return

        const fallbackMenu = visibleMenus[0]
        if (!fallbackMenu || fallbackMenu === activeMenu) return

        setActiveMenu(fallbackMenu)
    }, [activeMenu, setActiveMenu, validActiveMenus, visibleMenus])

    useEffect(() => {
        const handleOpenChat = (event: Event) => {
            const customEvent = event as CustomEvent<{ conversationId?: string | null }>
            setFocusConversationId(customEvent.detail?.conversationId || null)
            setOpenCallCenter(false)
            setShowChatModal(true)
        }

        window.addEventListener('omnichannel:open-chat', handleOpenChat)

        return () => {
            window.removeEventListener('omnichannel:open-chat', handleOpenChat)
        }
    }, [])

    return (
        <>
            <header className="flex items-center justify-between w-full h-[56px] shrink-0 overflow-visible relative gap-2">
                <div className="flex items-center gap-2 md:gap-3 shrink-0 w-auto min-w-0 lg:min-w-[180px] 2xl:min-w-[220px]">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    <img src="/logo.png" alt="UNI Senth" className="h-8 md:h-12 w-auto object-contain" />
                    <span className="font-black text-lg md:text-[22px] tracking-tight text-gray-900 dark:text-gray-100 hidden md:block">
                        UNI <span className="text-primary-500">Senth</span>
                    </span>
                </div>

                {/* Center: Five grouped menu tabs with hover dropdowns */}
                <div className="hidden lg:flex flex-none w-fit max-w-[min(56vw,860px)] items-center justify-center gap-1 bg-white dark:bg-black dark:border-white/10 rounded-full p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100 ml-auto mr-2 xl:mr-4 overflow-visible whitespace-nowrap pointer-events-auto relative z-30">
                    {visibleMenuGroups.map((group) => (
                        <div
                            key={group.name}
                            className="relative"
                            onMouseEnter={() => setOpenMenuGroup(group.name)}
                            onMouseLeave={() => setOpenMenuGroup(null)}
                        >
                            <button
                                onClick={() => activateMenu(getGroupTarget(group.items))}
                                className={cn(
                                    "px-3 xl:px-5 py-2 rounded-full text-[12px] font-bold transition-all shrink-0 flex items-center gap-2",
                                    getGroupActive(group.items)
                                        ? "bg-primary-500 text-white shadow-sm"
                                        : "text-gray-500 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-white/5"
                                )}
                            >
                                <span>{group.name}</span>
                                {group.items.length > 1 ? <ChevronDown className="w-3.5 h-3.5" /> : null}
                            </button>

                            {getDropdownItems(group).length > 0 && openMenuGroup === group.name ? (
                                <div className="absolute left-1/2 top-[calc(100%-1px)] z-50 flex min-w-[190px] -translate-x-1/2 flex-col gap-1 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-black p-2 shadow-xl transition-all">
                                    {getDropdownItems(group).map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => activateMenu(item)}
                                            className={cn(
                                                "w-full rounded-xl px-3 py-2 text-left text-[12px] font-bold transition-colors",
                                                activeMenu === item
                                                    ? "bg-primary-500 text-white"
                                                    : "text-gray-600 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-500 dark:hover:bg-white/5"
                                            )}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>

                {/* Right: User tools */}
                <div className="flex items-center gap-2 xl:gap-3 shrink-0 relative z-20">
                    {userManagementLinks.length > 0 && !isStaffSelfService && !isClientPortal ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserManagementMenu((value) => !value)}
                                className="flex h-10 items-center gap-2 rounded-full border border-gray-100 bg-white px-4 text-[12px] font-black text-gray-700 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors hover:bg-primary-50 hover:text-primary-600 dark:border-white/10 dark:bg-black dark:text-gray-200 dark:hover:bg-white/5"
                            >
                                User Management
                                <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                            {showUserManagementMenu ? (
                                <div className="absolute right-0 top-[46px] z-50 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-black">
                                    {userManagementLinks.map((link) => (
                                        <button
                                            key={link.href}
                                            onClick={() => {
                                                setShowUserManagementMenu(false)
                                                navigate(link.href)
                                            }}
                                            className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600 dark:text-gray-200 dark:hover:bg-white/5"
                                        >
                                            {link.name}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="flex items-center bg-white dark:bg-black dark:border-white/10 rounded-full p-1 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100 gap-1 px-2 xl:px-3 py-1 xl:mr-2">
                        <button onClick={() => {
                            const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true })
                            document.dispatchEvent(event)
                        }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-colors"><Search className="w-[16px] h-[16px]" /></button>
                    </div>
                </div>
            </header>
            {showChatModal ? (
                <ChatModal
                    isOpen={showChatModal}
                    onClose={() => {
                        setShowChatModal(false)
                        setFocusConversationId(null)
                        setOpenCallCenter(false)
                    }}
                    focusConversationId={focusConversationId}
                    openCallCenter={openCallCenter}
                />
            ) : null}
            <NotificationModal isOpen={showNotificationModal} onClose={() => setShowNotificationModal(false)} />

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-black shadow-xl">
                        <div className="flex flex-col h-full">
                            {/* Mobile Menu Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
                                <div className="flex items-center gap-3">
                                    <img src="/logo.png" alt="UNI Senth" className="h-8 w-auto object-contain" />
                                    <span className="font-black text-lg text-gray-900 dark:text-gray-100">
                                        UNI <span className="text-primary-500">Senth</span>
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Mobile Menu Content */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-2">
                                    {visibleMenuGroups.map((group) => (
                                        <div key={group.name} className="space-y-1">
                                            <button
                                                onClick={() => activateMenu(getGroupTarget(group.items))}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-xl font-bold transition-colors",
                                                    getGroupActive(group.items)
                                                        ? "bg-primary-500 text-white"
                                                        : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-500 dark:hover:bg-white/5"
                                                )}
                                            >
                                                {group.name}
                                            </button>
                                            {getDropdownItems(group).length > 0 && (
                                                <div className="ml-4 space-y-1">
                                                    {getDropdownItems(group).map((item) => (
                                                        <button
                                                            key={item}
                                                            onClick={() => activateMenu(item)}
                                                            className={cn(
                                                                "w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                                                activeMenu === item
                                                                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                                                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/5"
                                                            )}
                                                        >
                                                            {item}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {(canAccessSuperAdmin || canAccessClientPortal) && (
                                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
                                        <div className="space-y-2">
                                            {canAccessSuperAdmin ? (
                                                <button
                                                    onClick={() => activateMenu('Super Admin')}
                                                    className={cn(
                                                        "w-full text-left px-4 py-3 rounded-xl font-bold transition-colors",
                                                        activeMenu === 'Super Admin'
                                                            ? "bg-primary-500 text-white"
                                                            : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-500 dark:hover:bg-white/5"
                                                    )}
                                                >
                                                    User Management
                                                </button>
                                            ) : null}
                                            {canAccessClientPortal ? (
                                                <button
                                                    onClick={() => activateMenu('Client Portal')}
                                                    className={cn(
                                                        "w-full text-left px-4 py-3 rounded-xl font-bold transition-colors",
                                                        activeMenu === 'Client Portal'
                                                            ? "bg-primary-500 text-white"
                                                            : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-500 dark:hover:bg-white/5"
                                                    )}
                                                >
                                                    Client Portal
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                )}

                                {/* Mobile Unit Selector */}
                                {canAccessAdminFiles && (
                                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Unit</label>
                                            <select
                                                value={safeActiveUnitId}
                                                onChange={(e) => setActiveUnitId(e.target.value)}
                                                className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg text-sm"
                                            >
                                                {accessibleUnits.map((unit) => (
                                                    <option key={unit.id} value={unit.id}>
                                                        {unit.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
