import React, { useState } from 'react';
import { api as axios } from '../../../lib/axios';
import { CheckCircle, Phone, User, Briefcase, Building2, ArrowRight } from 'lucide-react';

export default function VisitorSelfCheckIn() {
    const [mobile, setMobile] = useState('');
    const [name, setName] = useState('');
    const [purpose, setPurpose] = useState('');
    const [hostName, setHostName] = useState('');
    
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            await axios.post('/visitor/webhook/google-sheets', {
                tenantId: 'default-tenant-id',
                mobile,
                name,
                purpose,
                hostName
            });
            setSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit check-in request.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4 font-sans">
                <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] max-w-md w-full text-center space-y-6 border border-white/50">
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75"></div>
                        <div className="relative bg-emerald-500 text-white w-24 h-24 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30">
                            <CheckCircle className="h-12 w-12" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">You're Checked In!</h1>
                        <p className="text-slate-500 mt-3 text-lg leading-relaxed">Thank you. Please wait at the reception area while we notify your host.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>

            <div className="relative bg-white/10 backdrop-blur-2xl p-8 sm:p-10 rounded-[2rem] shadow-2xl max-w-md w-full space-y-8 border border-white/20">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-indigo-500/30 mb-6">
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Welcome</h1>
                    <p className="text-slate-300 mt-2 font-medium">Please enter your details to check in</p>
                </div>
                
                {error && <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl text-sm font-medium backdrop-blur-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                        </div>
                        <input
                            required
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="w-full rounded-2xl bg-white/5 border border-white/10 py-4 pl-12 pr-4 text-white placeholder-slate-400 outline-none focus:bg-white/10 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10 font-medium transition-all text-base"
                            placeholder="Mobile Number"
                        />
                    </div>
                    
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                        </div>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-2xl bg-white/5 border border-white/10 py-4 pl-12 pr-4 text-white placeholder-slate-400 outline-none focus:bg-white/10 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10 font-medium transition-all text-base"
                            placeholder="Full Name"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Briefcase className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                        </div>
                        <input
                            required
                            type="text"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="w-full rounded-2xl bg-white/5 border border-white/10 py-4 pl-12 pr-4 text-white placeholder-slate-400 outline-none focus:bg-white/10 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10 font-medium transition-all text-base"
                            placeholder="Purpose of Visit"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                        </div>
                        <input
                            required
                            type="text"
                            value={hostName}
                            onChange={(e) => setHostName(e.target.value)}
                            className="w-full rounded-2xl bg-white/5 border border-white/10 py-4 pl-12 pr-4 text-white placeholder-slate-400 outline-none focus:bg-white/10 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10 font-medium transition-all text-base"
                            placeholder="Who are you meeting?"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full group rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 py-4 px-6 font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 text-lg mt-6 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : 'Check In'}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
