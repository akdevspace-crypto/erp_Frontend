import { useEffect, useState } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { Bell, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { connectRealtimeSocket, realtimeSocket } from '../../../lib/realtimeSocket'
import { useAuthStore } from '../../../store/authStore'

export function Notifications() {
    const currentUserId = useAuthStore((state) => state.user?.id)
    const [notifications, setNotifications] = useState([
        { id: '1', title: 'New Leave Request', message: 'Staff E-002 has requested leave for tomorrow.', type: 'alert', time: '10 mins ago', isRead: false },
        { id: '2', title: 'Expense Approved', message: 'Voucher VCH-101 has been approved by admin.', type: 'success', time: '1 hour ago', isRead: false },
        { id: '3', title: 'System Maintenance', message: 'ERP system will be under maintenance tonight at 2 AM.', type: 'info', time: '5 hours ago', isRead: true },
        { id: '4', title: 'Payment Received', message: 'Invoice #5022 paid successfully.', type: 'success', time: '1 day ago', isRead: true },
    ])

    useEffect(() => {
        connectRealtimeSocket()

        const handleNotification = (payload: {
            userId?: string
            message: string
            type?: string
            createdAt?: string
        }) => {
            if (!currentUserId || payload.userId !== currentUserId) return

            setNotifications((prev) => [
                {
                    id: `live-${payload.createdAt || Date.now()}`,
                    title: 'New Enquiry Follow-up',
                    message: payload.message,
                    type: payload.type === 'ENQUIRY_FOLLOW_UP_ASSIGNED' ? 'alert' : 'info',
                    time: 'Just now',
                    isRead: false
                },
                ...prev
            ])
        }

        realtimeSocket.on('notification:new', handleNotification)

        return () => {
            realtimeSocket.off('notification:new', handleNotification)
        }
    }, [currentUserId])

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    }

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
            default: return <Info className="w-5 h-5 text-blue-500" />
        }
    }

    return (
        <div className="flex flex-col h-full space-y-6">
            <PageHeader title="Notification Center" breadcrumbs={[{ label: 'Profile' }, { label: 'Notifications' }]} />

            <div className="flex justify-end gap-3 mb-2">
                <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-50 shadow-sm">
                    Mark All as Read
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 p-0">
                <div className="divide-y divide-gray-100">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`p-4 flex gap-4 transition-colors hover:bg-gray-50 cursor-pointer ${notif.isRead ? 'opacity-70 bg-gray-50' : 'bg-white'}`}
                            onClick={() => markAsRead(notif.id)}
                        >
                            <div className="flex-shrink-0 mt-1">
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm font-semibold ${notif.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'}`}>{notif.title}</h4>
                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{notif.time}</span>
                                </div>
                                <p className="text-sm text-gray-600">{notif.message}</p>
                            </div>
                            {!notif.isRead && (
                                <div className="flex-shrink-0 self-center">
                                    <div className="w-2.5 h-2.5 bg-primary-600 rounded-full"></div>
                                </div>
                            )}
                        </div>
                    ))}
                    {notifications.length === 0 && (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                            <Bell className="w-8 h-8 text-gray-300 mb-3" />
                            <p>No notifications available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
