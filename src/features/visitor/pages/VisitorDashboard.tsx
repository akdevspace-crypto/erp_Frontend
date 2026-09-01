
import { useQuery } from '@tanstack/react-query';
import { getVisitorAnalytics } from '../services';
import { PageHeader } from '../../../components/PageHeader';
import { Activity, Users, Clock, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function VisitorDashboard() {
    const { data: analytics, isLoading, error } = useQuery({
        queryKey: ['visitorAnalytics'],
        queryFn: getVisitorAnalytics,
        refetchInterval: 30000 // refresh every 30 seconds
    });

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
                    <p className="font-semibold text-slate-500">Loading live analytics...</p>
                </div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="p-6 text-center text-red-500 font-bold bg-red-50 rounded-xl border border-red-100">
                Failed to load visitor analytics data.
            </div>
        );
    }

    return (
        <div className="flex min-h-full flex-col space-y-8 bg-transparent">
            
            <PageHeader
                title="Visitor Analytics Dashboard"
                subtitle="Live overview, statistics, and visitor entry trends for today."
                breadcrumbs={[{ label: 'Security' }, { label: 'Visitor Dashboard' }]}
            />

            {/* KPI STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Visitors Today" 
                    value={analytics.totalVisitorsToday} 
                    icon={Users} 
                    color="text-indigo-600" 
                    bg="bg-indigo-50" 
                />
                <StatCard 
                    title="Approved Passes" 
                    value={analytics.approvedPasses} 
                    icon={CheckCircle} 
                    color="text-green-600" 
                    bg="bg-green-50" 
                />
                <StatCard 
                    title="Pending Passes" 
                    value={analytics.pendingPasses} 
                    icon={Clock} 
                    color="text-amber-600" 
                    bg="bg-amber-50" 
                />
                <StatCard 
                    title="Live Tracking" 
                    value="Active" 
                    icon={Activity} 
                    color="text-rose-600" 
                    bg="bg-rose-50" 
                />
            </div>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Hourly Trend Chart */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-wide">Today's Entry Trend</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Visitor Categories */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-wide">Visitor Breakdown</h3>
                    
                    <div className="space-y-6 mt-8">
                        <CategoryBar label="Guests" count={analytics.guestCount} total={analytics.totalVisitorsToday} color="bg-indigo-500" />
                        <CategoryBar label="Vendors" count={analytics.vendorCount} total={analytics.totalVisitorsToday} color="bg-emerald-500" />
                        <CategoryBar label="Others" count={analytics.otherCount} total={analytics.totalVisitorsToday} color="bg-amber-500" />
                    </div>

                    <div className="mt-12 text-center text-sm font-medium text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        This breakdown categorizes all individuals who generated passes today.
                    </div>
                </div>
            </div>
            
        </div>
    );
}

// Subcomponents

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center transition-all hover:-translate-y-1 hover:shadow-md">
            <div className={`mr-4 flex h-14 w-14 items-center justify-center rounded-xl ${bg} ${color}`}>
                <Icon className="h-7 w-7" />
            </div>
            <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
                <p className="mt-1 text-3xl font-black text-slate-800">{value}</p>
            </div>
        </div>
    );
}

function CategoryBar({ label, count, total, color }: any) {
    const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
    
    return (
        <div>
            <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                <span>{label}</span>
                <span>{count} ({percentage}%)</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
}

