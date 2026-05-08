import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Sidebar, subMenus } from "./Sidebar"
import { Navbar } from "./Navbar"
import { api } from "../lib/axios"
import { useAuthStore } from "../store/authStore"
import { connectRealtimeSocket, realtimeSocket } from "../lib/realtimeSocket"
import { useToast } from "../components/Toast"
import { CallNotificationCenter } from "../components/CallNotificationCenter"

export default function DashboardLayout() {
    const [activeMenu, setActiveMenu] = useState("Dashboard")
    const location = useLocation()
    const token = useAuthStore((state) => state.token)
    const user = useAuthStore((state) => state.user)
    const activeUnitId = useAuthStore((state) => state.activeUnitId)
    const setUser = useAuthStore((state) => state.setUser)
    const { toast } = useToast()

    useEffect(() => {
        const path = location.pathname

        // Find which menu category contains this path
        const foundMenu = Object.entries(subMenus).find(([_, items]) =>
            items.some(item =>
                path.startsWith(item.href) ||
                (item.href === '/dashboard' && path === '/')
            )
        )

        if (foundMenu && foundMenu[0] !== activeMenu) {
            setActiveMenu(foundMenu[0])
        }
    }, [location.pathname, activeMenu])

    useEffect(() => {
        if (!token || !user) return

        let ignore = false
        let intervalId: number | undefined

        const syncSessionUser = async () => {
            try {
                const response = await api.get('/profile/me')
                const sessionUser = response.data?.data?.sessionUser

                if (!ignore && sessionUser) {
                    setUser({
                        id: sessionUser.id,
                        name: sessionUser.name,
                        email: sessionUser.email,
                        role: sessionUser.role?.name || user.role,
                        permissions: Array.isArray(sessionUser.permissions) ? sessionUser.permissions : [],
                        unitAccess: Array.isArray(sessionUser.unitAccess) ? sessionUser.unitAccess : [sessionUser.unitId].filter(Boolean),
                        unitId: sessionUser.unitId,
                        menuPrivilege: sessionUser.menuPrivilege || null
                    })
                }
            } catch (error) {
                console.error('Failed to refresh session user', error)
            }
        }

        syncSessionUser()
        intervalId = window.setInterval(syncSessionUser, 15000)

        return () => {
            ignore = true
            if (intervalId) {
                window.clearInterval(intervalId)
            }
        }
    }, [setUser, token, user?.id])

    useEffect(() => {
        if (!token || !user?.id) return

        connectRealtimeSocket()

        const handleNotification = (payload: {
            userId?: string
            message: string
            type?: string
        }) => {
            if (payload.userId !== user.id) return

            toast({
                type: payload.type === 'ENQUIRY_FOLLOW_UP_ASSIGNED' ? 'info' : 'info',
                title: 'New Notification',
                message: payload.message
            })
        }

        realtimeSocket.on('notification:new', handleNotification)

        return () => {
            realtimeSocket.off('notification:new', handleNotification)
        }
    }, [activeUnitId, token, toast, user?.id])

    return (
        <div className="h-screen w-screen bg-[#f4f6f8] dark:bg-black font-sans text-gray-900 dark:text-gray-100 overflow-hidden relative flex flex-col p-4">
            {/* Top Navbar spans full width initially to house the logo, pills, and right icons */}
            <Navbar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

            <div className="flex flex-1 min-h-0 overflow-hidden mt-[24px] gap-[24px]">
                {/* Slim Floating Sidebar */}
                <Sidebar activeMenu={activeMenu} />

                {/* Main Dashboard Area */}
                <main className="flex-1 min-w-0 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-0 rounded-[32px]">
                    <Outlet />
                </main>
            </div>

            <CallNotificationCenter />
        </div>
    )
}
