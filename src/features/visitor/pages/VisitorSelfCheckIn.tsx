import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api as axios } from '../../../lib/axios';
import { CheckCircle, Phone, User, Briefcase, Building2, ArrowRight, ShieldCheck, XCircle } from 'lucide-react';

export default function VisitorSelfCheckIn() {
    const [searchParams] = useSearchParams();
    const verifyId = searchParams.get('verify');

    const [mobile, setMobile] = useState('');
    const [name, setName] = useState('');
    const [purpose, setPurpose] = useState('');
    const [hostName, setHostName] = useState('');
    
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [verifyData, setVerifyData] = useState<any>(null);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifyError, setVerifyError] = useState('');

    useEffect(() => {
        if (verifyId) {
            setVerifyLoading(true);
            axios.get(`/visitor/verify/${verifyId}`)
                .then(res => setVerifyData(res.data.data))
                .catch(err => setVerifyError(err.response?.data?.error || 'Invalid or expired pass'))
                .finally(() => setVerifyLoading(false));
        }
    }, [verifyId]);

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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
                <div className="bg-white p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] max-w-md w-full text-center space-y-6 border border-slate-100">
                    <div className="flex justify-center mb-2">
                        <img src="/logo.png" alt="UNI Senth" className="h-14 w-auto object-contain" />
                    </div>
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

    if (verifyId) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
                <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] max-w-md w-full space-y-6 border border-slate-100">
                    <div className="flex justify-center mb-2">
                        <img src="/logo.png" alt="UNI Senth" className="h-14 w-auto object-contain" />
                    </div>

                    {verifyLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B3B4B] mx-auto"></div>
                            <p className="mt-4 font-medium text-slate-500">Verifying Pass...</p>
                        </div>
                    ) : verifyError ? (
                        <div className="text-center py-8">
                            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Invalid Pass</h2>
                            <p className="text-red-500/80">{verifyError}</p>
                        </div>
                    ) : verifyData ? (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 mb-4 shadow-inner">
                                    <ShieldCheck className="h-10 w-10 text-emerald-500" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pass Verified</h2>
                                <span className={`inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${verifyData.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                    Status: {verifyData.status}
                                </span>
                            </div>
                            
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Visitor Name</p>
                                    <p className="text-slate-800 font-bold text-xl">{verifyData.visitor?.name}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Mobile</p>
                                    <p className="text-slate-700 font-medium">{verifyData.visitor?.mobile}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Category</p>
                                        <p className="text-[#0B3B4B] font-bold">{verifyData.visitor?.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Host</p>
                                        <p className="text-slate-700 font-medium">{verifyData.hostName || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Purpose</p>
                                    <p className="text-slate-600 text-sm leading-relaxed bg-white p-3 rounded-xl border border-slate-200">{verifyData.purpose || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] max-w-md w-full space-y-8 border border-slate-100">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <img src="/logo.png" alt="UNI Senth" className="h-16 w-auto object-contain drop-shadow-sm" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">Welcome</h1>
                    <p className="text-slate-500 mt-2 font-medium">Please enter your details to check in</p>
                </div>
                
                {error && <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-[#0B3B4B] transition-colors" />
                        </div>
                        <input
                            required
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="w-full rounded-2xl bg-slate-50 border border-slate-200 py-4 pl-12 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#0B3B4B]/50 focus:ring-4 focus:ring-[#0B3B4B]/10 font-medium transition-all text-base"
                            placeholder="Mobile Number"
                        />
                    </div>
                    
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400 group-focus-within:text-[#0B3B4B] transition-colors" />
                        </div>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-2xl bg-slate-50 border border-slate-200 py-4 pl-12 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#0B3B4B]/50 focus:ring-4 focus:ring-[#0B3B4B]/10 font-medium transition-all text-base"
                            placeholder="Full Name"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Briefcase className="h-5 w-5 text-slate-400 group-focus-within:text-[#0B3B4B] transition-colors" />
                        </div>
                        <input
                            required
                            type="text"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="w-full rounded-2xl bg-slate-50 border border-slate-200 py-4 pl-12 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#0B3B4B]/50 focus:ring-4 focus:ring-[#0B3B4B]/10 font-medium transition-all text-base"
                            placeholder="Purpose of Visit"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400 group-focus-within:text-[#0B3B4B] transition-colors" />
                        </div>
                        <input
                            required
                            type="text"
                            value={hostName}
                            onChange={(e) => setHostName(e.target.value)}
                            className="w-full rounded-2xl bg-slate-50 border border-slate-200 py-4 pl-12 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#0B3B4B]/50 focus:ring-4 focus:ring-[#0B3B4B]/10 font-medium transition-all text-base"
                            placeholder="Who are you meeting?"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full group rounded-2xl bg-[#0B3B4B] py-4 px-6 font-bold text-white shadow-lg shadow-[#0B3B4B]/20 hover:shadow-[#0B3B4B]/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 text-lg mt-6 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : 'Check In'}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>
            </div>
        </div>
    );
}

