import { Search, Bell, MessageSquare, PhoneCall, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'
import { subMenus } from './Sidebar'
import { ChatModal } from '../components/OmnichannelChatModal'
import { NotificationModal } from '../components/NotificationModal'
import { useUnits } from '../features/master/hooks/useUnit'
import { useAuthStore } from '../store/authStore'
import { canAccessPath, hasAllAccess, hasUnitAccess } from '../lib/access'

export function Navbar({ activeMenu, setActiveMenu }: { activeMenu: string, setActiveMenu: (m: string) => void }) {
    const navigate = useNavigate()
    const [showChatModal, setShowChatModal] = useState(false)
    const [focusConversationId, setFocusConversationId] = useState<string | null>(null)
    const [openCallCenter, setOpenCallCenter] = useState(false)
    const [showNotificationModal, setShowNotificationModal] = useState(false)
    const { data: units = [] } = useUnits()
    const user = useAuthStore((state) => state.user)
    const activeUnitId = useAuthStore((state) => state.activeUnitId)
    const setActiveUnitId = useAuthStore((state) => state.setActiveUnitId)
    const menus = ['Dashboard', 'Enquiry Desk', 'Healthcare', 'Operations', 'Inventory', 'Finance', 'Human Resource', 'Security', 'CMS', 'Task Log', 'Profile']
    const accessibleUnits = hasAllAccess(user) ? units : units.filter((unit) => hasUnitAccess(user, unit.id))
    const visibleMenus = menus.filter((menu) => {
        if (menu === 'Dashboard' || menu === 'Profile') return true

        const menuLinks = subMenus[menu] || []
        return menuLinks.some((link) => canAccessPath(user, link.href))
    })
    const resolvedActiveUnitId = activeUnitId || user?.unitId || ''
    const safeActiveUnitId = accessibleUnits.some((unit) => unit.id === resolvedActiveUnitId)
        ? resolvedActiveUnitId
        : (accessibleUnits[0]?.id || '')

    useEffect(() => {
        if (!accessibleUnits.length) return
        if (accessibleUnits.some((unit) => unit.id === resolvedActiveUnitId)) return

        setActiveUnitId(accessibleUnits[0].id)
    }, [accessibleUnits, resolvedActiveUnitId, setActiveUnitId])

    useEffect(() => {
        if (!visibleMenus.length) return
        if (visibleMenus.includes(activeMenu)) return

        setActiveMenu(visibleMenus[0])
    }, [activeMenu, setActiveMenu, visibleMenus])

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
            <header className="flex items-center justify-between w-full h-[56px] shrink-0 overflow-visible relative">
                <div className="flex items-center gap-3 shrink-0 w-auto min-w-[200px]">
                    <img src="/logo.png" alt="UNI Senth" className="h-12 w-auto object-contain" />
                    <span className="font-black text-[22px] tracking-tight text-gray-900 dark:text-gray-100 hidden md:block">
                        UNI <span className="text-primary-500">Senth</span>
                    </span>
                </div>

                {/* Center: Tabs with proper horizontal scrolling, no wrapping! */}
                <div className="hidden lg:flex items-center bg-white dark:bg-black dark:border-white/10 rounded-full p-1 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100 mx-4 flex-1 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:h-0 pointer-events-auto snap-x relative z-10 w-[200px]">
                    {visibleMenus.map(m => (
                        <button
                            key={m}
                            onClick={() => {
                                setActiveMenu(m)
                                const nextLink = (subMenus[m] || []).find((link) => canAccessPath(user, link.href))
                                if (nextLink) {
                                    navigate(nextLink.href)
                                }
                            }}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-[12px] font-bold transition-all shrink-0 snap-center",
                                activeMenu === m
                                    ? "bg-primary-500 text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-white/5"
                            )}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-3 shrink-0 relative z-20">
                    <div className="hidden md:flex items-center bg-white dark:bg-black rounded-full border border-gray-100 dark:border-white/10 px-3 py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                        <select
                            value={safeActiveUnitId}
                            onChange={(e) => setActiveUnitId(e.target.value)}
                            className="bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
                        >
                            {accessibleUnits.map((unit) => (
                                <option key={unit.id} value={unit.id} className="bg-white dark:bg-black text-gray-900 dark:text-gray-100">
                                    {unit.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center bg-white dark:bg-black dark:border-white/10 rounded-full p-1 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100 gap-1 px-3 py-1">
                        <button onClick={() => {
                            const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true })
                            document.dispatchEvent(event)
                        }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-colors"><Search className="w-[16px] h-[16px]" /></button>
                        <button onClick={() => setShowNotificationModal(true)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 relative transition-colors">
                            <Bell className="w-[16px] h-[16px]" />
                            <span className="absolute top-[6px] right-[6px] w-[5px] h-[5px] bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>
                        <button onClick={() => {
                            setFocusConversationId(null)
                            setOpenCallCenter(true)
                            setShowChatModal(true)
                        }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-colors" title="Call"><PhoneCall className="w-[16px] h-[16px]" /></button>
                        <button onClick={() => {
                            setFocusConversationId(null)
                            setOpenCallCenter(false)
                            setShowChatModal(true)
                        }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-colors"><MessageSquare className="w-[16px] h-[16px]" /></button>
                    </div>

                    <div onClick={() => navigate('/profile/me')} className="flex items-center bg-white dark:bg-black dark:border-white/10 rounded-full p-1.5 pr-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-white/10 gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors active:scale-[0.98]">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-black/20 flex items-center justify-center border border-gray-200 dark:border-white/10 shrink-0 text-gray-500 dark:text-gray-400">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="hidden xl:flex flex-col">
                            <span className="text-[12px] font-bold text-gray-900 dark:text-gray-100 leading-tight">{user?.name || 'User'}</span>
                            <span className="text-[10px] font-medium text-gray-400">{user?.email || 'admin@erp.com'}</span>
                        </div>
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
        </>
    )
}
