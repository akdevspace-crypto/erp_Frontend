import { useQuery } from '@tanstack/react-query';
import { getVisitorAnalytics } from '../services';
import { PageHeader } from '../../../components/PageHeader';
import { Activity, Users, Clock, CheckCircle, ArrowRight, UserPlus, ShieldCheck, DoorOpen, History } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function VisitorDashboard() {
    const navigate = useNavigate();
    const { data: analytics, isLoading, error } = useQuery({
        queryKey: ['visitorAnalytics'],
        queryFn: getVisitorAnalytics,
        refetchInterval: 30000 // refresh every 30 seconds
    });

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600"></div>
                    <p className="font-semibold text-slate-500">Loading command center...</p>
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

    const activeVisitors = (analytics.recentVisitors || []).filter((p: any) => p.checkInAt && !p.checkOutAt);

    return (
        <div className="flex min-h-full flex-col space-y-6 bg-slate-50/50 pb-12">
            
            <PageHeader
                title="Visitor Command Center"
                subtitle="Reception overview, visitor flow, and today's activity."
                breadcrumbs={[{ label: 'Front Desk' }, { label: 'Command Center' }]}
                action={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/visitor-module')}
                            className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
                        >
                            <History className="h-4 w-4" />
                            Visitor History
                        </button>
                        <button
                            onClick={() => navigate('/visitor-module')}
                            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-all"
                        >
                            <UserPlus className="h-4 w-4" />
                            Register Visitor
                        </button>
                    </div>
                }
            />

            {/* TOP BAR: RECEPTION STATUS & QUICK ACTIONS & PENDING */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Reception Status */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-0.5">Reception Status</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-sm font-bold text-slate-800">ACTIVE</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-xs font-semibold text-slate-400 text-right">
                        Visitor desk is<br />operational
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-center">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h3>
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/visitor-module')} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-1.5 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                            <DoorOpen className="w-4 h-4" /> Inside
                        </button>
                        <button onClick={() => navigate('/visitor-module')} className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-100 py-1.5 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                            <UserPlus className="w-4 h-4" /> Register
                        </button>
                    </div>
                </div>

                {/* Pending Passes */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Passes</h3>
                        {analytics.pendingPasses > 0 ? (
                            <span className="text-amber-600 font-bold text-sm flex items-center gap-1.5">
                                <Clock className="w-4 h-4" /> Action required
                            </span>
                        ) : (
                            <span className="text-slate-400 font-bold text-sm flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4" /> All clear
                            </span>
                        )}
                    </div>
                    <div className={`text-3xl font-black ${analytics.pendingPasses > 0 ? 'text-amber-500' : 'text-slate-300'}`}>
                        {analytics.pendingPasses > 9 ? analytics.pendingPasses : `0${analytics.pendingPasses}`}
                    </div>
                </div>
            </div>

            {/* PRIMARY KPI ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Today's Visitors" 
                    value={analytics.totalVisitorsToday} 
                    subtitle="Registered passes"
                    color="text-teal-700" 
                    bg="bg-teal-50" 
                    border="border-teal-100"
                />
                <StatCard 
                    title="Currently Inside" 
                    value={analytics.currentlyInside} 
                    subtitle="Live on premises"
                    color="text-emerald-700" 
                    bg="bg-emerald-50" 
                    border="border-emerald-100"
                    liveIndicator
                />
                <StatCard 
                    title="Completed Today" 
                    value={analytics.completedToday} 
                    subtitle="Exited visitors"
                    color="text-slate-700" 
                    bg="bg-slate-100" 
                    border="border-slate-200"
                />
            </div>

            {/* MAIN OPERATIONAL ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visitor Flow */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Visitor Flow Today</h3>
                    <div className="h-[260px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <RechartsTooltip 
                                    cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" activeDot={{ r: 6, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Visitor Types */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Visitor Types</h3>
                    
                    <div className="space-y-6 flex-1 flex flex-col justify-center">
                        <CategoryBar label="Guests" count={analytics.guestCount} total={analytics.totalVisitorsToday} color="bg-teal-500" />
                        <CategoryBar label="Vendors" count={analytics.vendorCount} total={analytics.totalVisitorsToday} color="bg-sky-500" />
                        <CategoryBar label="Others" count={analytics.otherCount} total={analytics.totalVisitorsToday} color="bg-slate-400" />
                    </div>

                    <div className="mt-8 text-center text-xs font-semibold text-slate-400">
                        Categorization of all passes created today.
                    </div>
                </div>
            </div>

            {/* LISTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Currently Inside */}
                <div className="rounded-2xl border border-slate-200 bg-white p-0 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/30">
                        <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Currently Inside
                        </h3>
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md">
                            {analytics.currentlyInside > 9 ? analytics.currentlyInside : `0${analytics.currentlyInside}`}
                        </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto max-h-[320px]">
                        {activeVisitors.length > 0 ? (
                            <ul className="divide-y divide-slate-100">
                                {activeVisitors.map((pass: any) => (
                                    <li key={pass.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-slate-800 flex items-center gap-2">
                                                {pass.visitor?.name || 'Unknown'}
                                            </div>
                                            <div className="text-xs font-semibold text-slate-500 mt-0.5">
                                                {pass.visitor?.category || 'Visitor'} • Visiting: {pass.hostName || '-'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-emerald-600 mb-1">
                                                In: {pass.checkInAt ? new Date(pass.checkInAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                            </div>
                                            <button onClick={() => navigate('/visitor-module')} className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors">
                                                View
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex h-full items-center justify-center p-8 text-center text-sm font-medium text-slate-400">
                                No visitors inside right now.
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-2xl border border-slate-200 bg-white p-0 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recent Activity</h3>
                        <button onClick={() => navigate('/visitor-module')} className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors">
                            View All <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto max-h-[320px]">
                        {analytics.recentVisitors && analytics.recentVisitors.length > 0 ? (
                            <ul className="divide-y divide-slate-100">
                                {analytics.recentVisitors.map((pass: any) => (
                                    <li key={`activity-${pass.id}`} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                                        <div className="mt-1">
                                            {pass.checkOutAt ? (
                                                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                            ) : pass.checkInAt ? (
                                                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-700">
                                                <span className="font-bold text-slate-900">{pass.visitor?.name || 'Unknown'}</span>
                                                {' '}
                                                {pass.checkOutAt ? 'checked out' : pass.checkInAt ? 'checked in' : 'registered'}
                                            </div>
                                            <div className="text-xs font-semibold text-slate-400 mt-1">
                                                {pass.visitor?.category || 'Visitor'}
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold text-slate-400 whitespace-nowrap">
                                            {pass.checkOutAt 
                                                ? new Date(pass.checkOutAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                                : pass.checkInAt 
                                                    ? new Date(pass.checkInAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                                    : new Date(pass.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                            }
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex h-full items-center justify-center p-8 text-center text-sm font-medium text-slate-400">
                                No visitor activity yet today.
                            </div>
                        )}
                    </div>
                </div>

            </div>
            
        </div>
    );
}

// Subcomponents

function StatCard({ title, value, subtitle, color, bg, border, liveIndicator }: any) {
    const formattedValue = typeof value === 'number' && value < 10 && value > 0 ? `0${value}` : value;
    
    return (
        <div className={`rounded-2xl border ${border} bg-white p-6 shadow-sm flex flex-col justify-between relative overflow-hidden`}>
            {/* Background Accent */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${bg} opacity-50`}></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    {liveIndicator && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
                </div>
                <div className="flex items-end gap-3">
                    <span className={`text-4xl font-black ${color}`}>{formattedValue}</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-400">{subtitle}</p>
            </div>
        </div>
    );
}

function CategoryBar({ label, count, total, color }: any) {
    const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
    
    return (
        <div>
            <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                <span className="uppercase tracking-wider">{label}</span>
                <span>{count} <span className="text-slate-400">({percentage}%)</span></span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
}
