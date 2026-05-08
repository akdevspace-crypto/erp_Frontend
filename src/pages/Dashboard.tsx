import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts'
import { TrendingUp, ChevronDown, HeartPulse, Search, PhoneCall, MessageSquare, CheckCircle, Package, IndianRupee } from 'lucide-react'
import { cn } from '../lib/utils'
import { CommandPalette } from '../components/CommandPalette'
import { FilterModal } from '../components/FilterModal'
import { useAuthStore } from '../store/authStore'
import { useDashboardKPIs, useRecentActivities } from '../hooks/useDashboard'

export function Dashboard() {
    const navigate = useNavigate()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])
    const { data: kpis } = useDashboardKPIs()
    const { data: recentActivities } = useRecentActivities()
    const [timeframe, setTimeframe] = useState('This Year')
    const [showFilterModal, setShowFilterModal] = useState(false)
    const userName = useAuthStore((state) => state.user?.name?.trim() || 'User')
    // Dynamic Greeting Logic
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

    const progressDataThisYear = [
        { name: 'Jan', value: 10 }, { name: 'Feb', value: 25 }, { name: 'Mar', value: 25 },
        { name: 'Apr', value: 45 }, { name: 'May', value: 48 }, { name: 'Jun', value: 65 }, { name: 'Jul', value: 100 },
        { name: 'Aug', value: 85 }, { name: 'Sep', value: 120 }, { name: 'Oct', value: 140 },
        { name: 'Nov', value: 130 }, { name: 'Dec', value: 160 }
    ]

    const progressDataThisWeek = [
        { name: 'Mon', value: 12 }, { name: 'Tue', value: 18 }, { name: 'Wed', value: 15 },
        { name: 'Thu', value: 30 }, { name: 'Fri', value: 22 }, { name: 'Sat', value: 45 }, { name: 'Sun', value: 50 },
    ]

    const progressDataLastMonth = [
        { name: 'Week 1', value: 40 }, { name: 'Week 2', value: 65 }, { name: 'Week 3', value: 55 }, { name: 'Week 4', value: 90 },
    ]

    const getActiveProgressData = () => {
        if (timeframe === 'This Week') return progressDataThisWeek
        if (timeframe === 'Last Month') return progressDataLastMonth
        return progressDataThisYear
    }

    const weeklySplitData = [
        { name: 'Home Care', value: 45, color: 'var(--color-accent)' },
        { name: 'Clinical', value: 25, color: 'var(--color-primary-500)' },
        { name: 'In-House', value: 20, color: 'var(--color-success)' },
        { name: 'Other', value: 10, color: '#4b5563' }
    ]

    const smartDashboards = [
        { label: 'Active Enquiries', value: kpis?.activeEnquiries || 0, href: '/crm/active-enquiries', icon: MessageSquare, tone: 'text-primary-500 bg-primary-500/10 border-primary-500/20' },
        { label: 'Critical Patients', value: kpis?.criticalPatients || 0, href: '/healthcare/critical-patients', icon: HeartPulse, tone: 'text-red-500 bg-red-50 border-red-100 dark:bg-red-500/10 dark:border-red-500/20' },
        { label: 'Low Stock Alerts', value: kpis?.lowStockAlerts || 0, href: '/inventory/low-stock-alerts', icon: Package, tone: 'text-orange-500 bg-orange-50 border-orange-100 dark:bg-orange-500/10 dark:border-orange-500/20' },
        { label: 'Pending Payments', value: kpis?.pendingPayments || 0, href: '/finance/pending-payments', icon: IndianRupee, tone: 'text-emerald-500 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' }
    ]

    const complaintData = [
        { month: 'Jan', registered: 45, solved: 30 },
        { month: 'Feb', registered: 52, solved: 40 },
        { month: 'Mar', registered: 38, solved: 35 },
        { month: 'Apr', registered: 65, solved: 50 },
        { month: 'May', registered: 48, solved: 40 },
        { month: 'Jun', registered: 55, solved: 45 },
        { month: 'Jul', registered: 60, solved: 55 },
        { month: 'Aug', registered: 70, solved: 62 },
        { month: 'Sep', registered: 68, solved: 60 },
        { month: 'Oct', registered: 80, solved: 75 },
        { month: 'Nov', registered: 95, solved: 85 },
        { month: 'Dec', registered: 110, solved: 100 },
    ]

    return (
        <div className="flex flex-col gap-4 w-full max-w-[1500px] h-full min-w-0 overflow-hidden pb-2 dark:bg-black">
            {/* Header */}
            <div className="shrink-0 pl-8">
                <h1 className="text-[26px] text-gray-900 dark:text-gray-100 tracking-tight leading-none">{greeting}, <span className="font-bold">{userName}</span></h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 shrink-0 min-w-0">
                {smartDashboards.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => navigate(item.href)}
                        className="bg-white dark:bg-black dark:border-white/10 rounded-[20px] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-50 hover:-translate-y-[2px] transition-transform text-left flex items-center gap-3 min-w-0"
                    >
                        <span className={cn("w-10 h-10 rounded-full border flex items-center justify-center shrink-0", item.tone)}>
                            <item.icon className="w-5 h-5" />
                        </span>
                        <span className="min-w-0 flex flex-col">
                            <span className="text-[20px] font-black leading-none text-gray-900 dark:text-gray-100">{item.value}</span>
                            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 truncate mt-1">{item.label}</span>
                        </span>
                    </button>
                ))}
            </div>

            {/* Top Grid - Strictly clamped vertically to 280px to guarantee single page fit */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-auto xl:h-[280px] shrink-0 min-w-0">

                {/* 1. Activity Overview Card */}
                <div className="xl:col-span-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-[24px] p-5 flex flex-col shadow-lg border border-white/20 hover:-translate-y-[2px] transition-transform duration-300 ease-out group relative overflow-hidden h-full min-w-0">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[40px] pointer-events-none"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-success/20 rounded-full blur-[30px] pointer-events-none"></div>

                    <div className="flex justify-between items-start mb-4 relative z-10 shrink-0">
                        <div>
                            <span className="font-black text-[17px] text-white tracking-tight block leading-tight mb-0.5 drop-shadow-sm">Activity Overview</span>
                            <span className="text-white/80 text-[11px] font-medium block">Your enquiry and conversion trends.</span>
                        </div>
                        <div className="flex gap-2">
                            <div
                                onClick={() => setTimeframe(t => t === 'This Week' ? 'Last Month' : t === 'Last Month' ? 'This Year' : 'This Week')}
                                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-white/20 transition-all active:scale-95 select-none"
                            >
                                <span className="text-[11px] font-bold text-white">{timeframe}</span>
                                <ChevronDown className="w-3 h-3 text-white/80" />
                            </div>
                            <button onClick={() => navigate('/enquiry/new')} className="inline-flex items-center px-3 py-1.5 shadow-sm text-[11px] font-bold rounded-lg text-white bg-gradient-to-r from-[#00b3a7] to-[#01867c] hover:-translate-y-[1px] hover:shadow-[0_4px_8px_rgba(0,179,167,0.2)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00b3a7] transition-all active:scale-95 border border-transparent cursor-pointer">
                                <span className="whitespace-nowrap">+ Add Enquiry</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-w-0 relative z-10 min-h-[140px] h-[140px]">
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={120} debounce={50}>
                                <AreaChart data={getActiveProgressData()} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValueWhite" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.6} />
                                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600 }}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', color: '#1f2937' }}
                                        itemStyle={{ color: 'var(--color-primary-500)', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorValueWhite)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* 2. KPI Squares */}
                <div className="xl:col-span-4 grid grid-cols-2 gap-4 h-full min-w-0">
                    {/* Orange Square */}
                    <div
                        onClick={() => navigate('/enquiry/follow-up')}
                        className="bg-gradient-to-br from-accent to-accent/80 rounded-[24px] p-4 text-white flex flex-col justify-between shadow-[0_8px_24px_rgba(255,183,51,0.3)] hover:-translate-y-[2px] transition-transform cursor-pointer"
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-[15px] font-bold text-white/90 leading-tight">Pending<br />Follow-ups</span>
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0"><PhoneCall className="w-5 h-5" /></div>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                            <span className="text-[32px] font-bold leading-none">{kpis?.pendingFollowups || 0}</span>
                            <span className="text-[10px] font-bold text-white/90 bg-white/10 w-fit px-2 py-0.5 rounded border border-white/10 mb-0.5">Live Tracking</span>
                        </div>
                    </div>

                    {/* White Squares */}
                    <div
                        onClick={() => navigate('/customer-care/pending-feedback')}
                        className="bg-white dark:bg-black dark:border-white/10 rounded-[24px] p-4 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-50 hover:-translate-y-[2px] transition-transform group cursor-pointer"
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-[15px] font-bold text-gray-700 dark:text-gray-300 leading-tight">Pending<br />Feedback</span>
                            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 text-gray-500 group-hover:text-accent transition-colors shrink-0"><MessageSquare className="w-5 h-5" /></div>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                            <span className="text-[32px] font-bold text-gray-900 dark:text-gray-100 leading-none">{kpis?.pendingApprovals || 0}</span>
                            <span className="text-[10px] font-bold text-primary-500 bg-primary-500/10 border border-primary-500/20 w-fit px-2 py-0.5 rounded mb-0.5">Approval Queue</span>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate('/accounts/income')}
                        className="bg-white dark:bg-black dark:border-white/10 rounded-[24px] p-4 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-50 hover:-translate-y-[2px] transition-transform group cursor-pointer"
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-[15px] font-bold text-gray-700 dark:text-gray-300 leading-tight">Total<br />Income</span>
                            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 text-gray-500 group-hover:text-accent transition-colors shrink-0"><TrendingUp className="w-5 h-5" /></div>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                            <span className="text-[28px] font-bold text-gray-900 dark:text-gray-100 leading-none tracking-tight">₹{(kpis?.revenue || 0).toLocaleString('en-IN')}</span>
                            <span className="text-[10px] font-bold text-primary-500 bg-primary-500/10 border border-primary-500/20 w-fit px-2 py-0.5 rounded mb-0.5">Sync Real-time</span>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate('/task-log/assign-schedule')}
                        className="bg-white dark:bg-black dark:border-white/10 rounded-[24px] p-4 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-50 hover:-translate-y-[2px] transition-transform group cursor-pointer"
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-[15px] font-bold text-gray-700 dark:text-gray-300 leading-tight">Schedule<br />Tasks</span>
                            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 text-gray-500 group-hover:text-primary-500 transition-colors shrink-0"><CheckCircle className="w-5 h-5" /></div>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                            <span className="text-[32px] font-bold text-gray-900 dark:text-gray-100 leading-none">12</span>
                            <span className="text-[10px] font-bold text-primary-500 bg-primary-500/10 border border-primary-500/20 w-fit px-2 py-0.5 rounded mb-0.5">↑ 3% Weekly</span>
                        </div>
                    </div>
                </div>

                {/* 3. Weekly Split */}
                <div className="xl:col-span-4 bg-white dark:bg-black dark:border-white/10 rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col hover:-translate-y-[2px] transition-transform min-w-0">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-gray-900 dark:text-gray-100">Weekly Split</span>
                        </div>
                    </div>

                    <div className="flex-1 w-full bg-gray-50 dark:bg-white/5 rounded-[24px] flex flex-row items-center justify-between px-6 relative py-3 min-h-[180px]">
                        <div className="w-[160px] h-[160px] relative pointer-events-none flex-shrink-0">
                            {isMounted && (
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={120} debounce={50}>
                                    <PieChart>
                                        <Pie data={weeklySplitData} innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                                            {weeklySplitData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[26px] font-black text-primary-500 leading-none">42</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-col gap-2.5 ml-4">
                            {weeklySplitData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-[10px]">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="font-bold text-gray-800 dark:text-gray-200 tracking-tight leading-none">{item.name} <span className="text-gray-400 font-medium ml-0.5">({item.value}%)</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid - Flex-1 perfectly consumes all remaining screen real-estate */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 flex-1 min-h-0 min-w-0">

                {/* Left Stack (~ 1/3) */}
                <div className="col-span-4 flex flex-col gap-5 h-full min-w-0">

                    {/* Complaints Detail Card (Chart) */}
                    <div className="bg-white dark:bg-black dark:border-white/10 rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col h-full hover:-translate-y-[2px] transition-transform overflow-hidden">
                        <div className="flex justify-between items-start mb-2 shrink-0">
                            <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-gray-900 dark:text-gray-100 mb-1">Total Complaint Registered</span>
                                <button onClick={() => navigate('/customer-care/complaints')} className="w-fit text-[10px] font-bold text-[#00b3a7] hover:text-white bg-[#00b3a7]/10 hover:bg-[#00b3a7] border border-[#00b3a7]/20 px-2 py-0.5 rounded-[6px] transition-all shadow-sm active:scale-95 cursor-pointer">+ Add Complaint</button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent"></div><span className="text-[10px] font-bold text-gray-600">Registered</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary-500"></div><span className="text-[10px] font-bold text-gray-600">Solved</span></div>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-w-0 min-h-0 relative mt-2">
                            {isMounted && (
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={120} debounce={50}>
                                    <BarChart data={complaintData} margin={{ top: 6, right: 6, left: 0, bottom: 8 }} barSize={12}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={6} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#fff', color: '#000', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="solved" fill="var(--color-primary-500)" stackId="a" radius={[0, 0, 4, 4]} />
                                        <Bar dataKey="registered" fill="var(--color-accent)" stackId="a" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>


                </div>

                {/* Pending Actions (~ 2/3) */}
                <div className="col-span-8 bg-white dark:bg-black dark:border-white/10 rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col hover:-translate-y-[2px] transition-transform h-full overflow-hidden min-w-0">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <div className="flex flex-col">
                            <span className="text-[15px] font-bold text-gray-900 dark:text-gray-100">Recent Activities</span>
                            <span className="text-[11px] font-medium text-gray-400 mt-0.5">Tracking recent processes</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative group">
                                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 group-focus-within:text-accent transition-colors" />
                                <input type="text" placeholder="Search" className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-[10px] text-[11px] focus:outline-none focus:ring-1 focus:ring-accent/30 bg-gray-50 dark:bg-white/5 w-[160px] hover:bg-gray-50 dark:bg-white/5/50 transition-colors" />
                            </div>
                            <button onClick={() => setShowFilterModal(true)} className="px-3 border border-gray-200 rounded-[10px] text-[11px] font-medium flex items-center gap-1.5 hover:bg-gray-50 dark:bg-white/5 transition-colors">Filter <ChevronDown className="w-3 h-3" /></button>
                        </div>
                    </div>

                    <div className="overflow-x-auto overflow-y-auto flex-1 h-full min-h-0 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="text-[10px] text-gray-400 font-medium border-b border-gray-100">
                                    <th className="pb-3 px-2 w-8 text-center"><input type="checkbox" className="rounded text-accent accent-accent" /></th>
                                    <th className="pb-3 px-2">Task ID</th>
                                    <th className="pb-3 px-2">Activity</th>
                                    <th className="pb-3 px-2">Value</th>
                                    <th className="pb-3 px-2">Status</th>
                                    <th className="pb-3 px-2 text-right">Date</th>
                                    <th className="pb-3 px-2 w-6"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(recentActivities || []).map((row: any, i: number) => (
                                    <tr
                                        key={i}
                                        onClick={() => navigate('/task-log/daily-approval')}
                                        className={cn("text-[12px] font-bold text-gray-900 dark:text-gray-100 border-b border-gray-50/50 dark:border-white/5 hover:bg-gray-50 dark:bg-white/5 dark:hover:bg-white/5 transition-colors cursor-pointer group", row.selected ? "bg-gray-50 dark:bg-white/5/80 dark:bg-white/10" : "")}
                                    >
                                        <td className="py-2.5 px-2 text-center"><input type="checkbox" defaultChecked={row.selected} className="rounded accent-[#1E1E1E] w-3.5 h-3.5 cursor-pointer" /></td>
                                        <td className="py-2.5 px-2 text-gray-500 font-medium">{row.refNo}</td>
                                        <td className="py-2.5 px-2 flex items-center gap-2">
                                            <div className={cn("w-6 h-6 rounded-[8px] flex items-center justify-center text-[10px]", i % 2 === 0 ? "bg-primary-500/10 text-primary-500" : "bg-accent/10 text-accent")}>
                                                <HeartPulse className="w-3.5 h-3.5" />
                                            </div>
                                            {row.service?.name || row.description || 'New Activity'}
                                        </td>
                                        <td className="py-2.5 px-2 text-gray-800 dark:text-gray-200">Enquiry</td>
                                        <td className="py-2.5 px-2">
                                            <span className="flex items-center gap-1.5">
                                                <span className={cn("w-1.5 h-1.5 rounded-full block", row.status === 'CLOSED' ? "bg-primary-500" : row.status === 'NEW' ? "bg-accent" : "bg-accent/70")}></span>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-2 text-gray-400 font-medium text-right text-[11px]">{new Date(row.createdAt).toLocaleDateString()}</td>
                                        <td className="py-2.5 px-2 text-center text-gray-300 font-bold tracking-widest group-hover:text-gray-500">...</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Global Command Palette */}
            <CommandPalette />

            <FilterModal isOpen={showFilterModal} onClose={() => setShowFilterModal(false)} />
        </div>
    )
}
