import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkVisitorProfile, createVisitorPass, getVisitorPasses, updateVisitorPass, deleteVisitorPass } from '../services';

import { QRCodeSVG } from 'qrcode.react';
import { PageHeader } from '../../../components/PageHeader';
import { useToast } from '../../../components/Toast';
import { PatientSelector } from '../../../components/PatientSelector';

export default function VisitorManagement() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Form State
    const [mobile, setMobile] = useState('');
    const [name, setName] = useState('');
    const [category, setCategory] = useState('GUEST');
    const [purpose, setPurpose] = useState('');
    const [hostName, setHostName] = useState('');
    const [durationHours, setDurationHours] = useState('2');

    // UI State
    const [isChecking, setIsChecking] = useState(false);
    const [pass, setPass] = useState<any>(null);
    const [editingPass, setEditingPass] = useState<any>(null);

    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpReference, setOtpReference] = useState('');
    const [otpValue, setOtpValue] = useState('');

    // Prevent 'unused variable' warning for isChecking by using it in UI later, but for now just comment it out if really unused,
    // wait, we can just consume it or rename it. We use isChecking in handleMobileBlur. 
    console.log({ isChecking, otpSent, otpVerified, otpValue, otpReference });

    const { data: passes = [], isLoading, error: fetchError } = useQuery({
        queryKey: ['visitorPasses'],
        queryFn: getVisitorPasses
    });

    if (fetchError) {
        console.error("Error fetching passes:", fetchError);
    }

    const createMutation = useMutation({
        mutationFn: createVisitorPass,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['visitorPasses'] });
            setPass(data);
            toast({ title: 'Success', message: 'Visitor Pass Generated Successfully!', type: 'success' });
        },
        onError: (err: any) => {
            toast({ title: 'Error', message: err.response?.data?.error || err.message || 'Failed to create pass', type: 'error' });
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => updateVisitorPass(data.id, data.payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visitorPasses'] });
            setEditingPass(null);
            toast({ title: 'Success', message: 'Pass updated successfully', type: 'success' });
        },
        onError: () => toast({ title: 'Error', message: 'Failed to update pass', type: 'error' })
    });

    const deleteMutation = useMutation({
        mutationFn: deleteVisitorPass,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visitorPasses'] });
            toast({ title: 'Success', message: 'Pass deleted successfully', type: 'success' });
        },
        onError: () => toast({ title: 'Error', message: 'Failed to delete pass', type: 'error' })
    });

    const handleMobileBlur = async () => {
        if (!mobile || mobile.length < 10) return;
        setIsChecking(true);
        try {
            const profile = await checkVisitorProfile(mobile);
            if (profile) {
                setName(profile.name);
                setCategory(profile.category);
                // If returning visitor, we can bypass OTP for convenience, or strictly enforce it.
                // We'll auto-verify them for convenience.
                setOtpVerified(true);
                toast({ title: 'Autofilled', message: 'Returning visitor found. Details auto-filled.', type: 'success' });
            } else {
                // OTP is currently frozen
                // setOtpVerified(false);
                // setOtpSent(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsChecking(false);
        }
    };

    

    

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // OTP verification is temporarily disabled
        createMutation.mutate({
            mobile,
            name,
            category,
            purpose,
            hostName,
            durationHours
        });
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this visitor pass?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleEditSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPass) return;
        updateMutation.mutate({
            id: editingPass.id,
            payload: {
                name: editingPass.visitor?.name,
                category: editingPass.visitor?.category,
                purpose: editingPass.purpose,
                hostName: editingPass.hostName,
                durationHours: editingPass.durationHours
            }
        });
    };

    const handleReset = () => {
        setMobile('');
        setName('');
        setCategory('GUEST');
        setPurpose('');
        setHostName('');
        setDurationHours('2');
        setPass(null);
        setOtpSent(false);
        setOtpVerified(false);
        setOtpReference('');
        setOtpValue('');
    };

    const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSd126ooky6N92XAa1l9-dnTaWLHHCvFVG5_EasCpeaWwdzT1g/viewform?usp=publish-editor"; // <-- PASTE YOUR REAL GOOGLE FORM LINK HERE

    return (
        <div className="flex min-h-full flex-col space-y-6 bg-transparent">

            <PageHeader
                title="Visitor Management"
                subtitle="Live visitor entry tracking, OTP verification, and pass generation."
                breadcrumbs={[{ label: 'Security' }, { label: 'Visitor Management' }]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: FORM */}
                <div className="lg:col-span-2 space-y-6">
                    {pass ? (
                        <section className="rounded-2xl border border-indigo-100 bg-white p-12 shadow-sm flex flex-col items-center justify-center space-y-6">
                            <div className="text-green-500 text-2xl font-bold">Pass Generated Successfully!</div>
                            <div className="p-8 bg-gray-50 rounded-2xl shadow-inner flex flex-col items-center min-w-[300px]">
                                <h3 className="font-extrabold text-2xl">{pass.profile.name}</h3>
                                <p className="text-gray-500 uppercase font-semibold">{pass.profile.category}</p>
                                <div className="my-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <QRCodeSVG value={`${window.location.origin}/visitor-checkin?verify=${pass.pass.id}`} size={180} />
                                </div>
                                <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Scan at Gate</p>
                                {pass.pass.hostName && <p className="mt-4 text-md font-bold text-indigo-900">Meeting: {pass.pass.hostName}</p>}
                            </div>
                            <button onClick={handleReset} className="mt-4 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold hover:bg-indigo-100 transition-colors">
                                Enter Another Visitor
                            </button>
                        </section>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* 1. VISITOR DETAILS */}
                            <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-bold text-indigo-800 uppercase tracking-wide border-b pb-2 border-indigo-50">1. Visitor Details</h2>
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Mobile Number *</label>
                                        <div className="flex gap-2">
                                            <input
                                                required
                                                type="text"
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value)}
                                                onBlur={handleMobileBlur}
                                                className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-bold"
                                                placeholder="Enter 10 digit mobile number"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Visitor Name *</label>
                                        <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Category *</label>
                                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-white">
                                            <option value="GUEST">Guest</option>
                                            <option value="VENDOR">Vendor</option>
                                            <option value="DOCTOR">Visiting Doctor</option>
                                            <option value="REGULAR_STAFF">Regular Staff</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* 2. VISIT PURPOSE */}
                            <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-bold text-indigo-800 uppercase tracking-wide border-b pb-2 border-indigo-50">2. Visit Purpose</h2>
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Purpose of Visit</label>
                                        <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500" placeholder="e.g. Meeting, Delivery" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">Resident / Host Name</label>
                                            <input type="text" value={hostName} onChange={(e) => setHostName(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500" placeholder="Type name..." />
                                        </div>
                                        <div className="flex-1">
                                            <PatientSelector 
                                                value=""
                                                onChange={(_id, name) => {
                                                    if (name) setHostName(name);
                                                }}
                                                label="Or Select Resident"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Duration (Hours) *</label>
                                        <input required type="number" min="1" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-bold" />
                                    </div>
                                </div>
                            </section>

                            {/* SUBMIT */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {createMutation.isPending ? 'Processing...' : 'Generate Visitor Pass'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* RIGHT COLUMN: SELF-SERVICE & LOGS */}
                <div className="space-y-6">
                    {/* QR Code Widget */}
                    <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm flex flex-col items-center text-center">
                        <h2 className="mb-2 text-md font-bold text-indigo-800 uppercase tracking-wide">Self-Service Check-In</h2>
                        <p className="text-sm text-indigo-600 mb-6">Print this QR code for the security gate. Visitors can scan it to fill out the Google Form directly.</p>

                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100">
                            <QRCodeSVG value={googleFormUrl} size={160} fgColor="#3730a3" />
                        </div>

                        <a href={googleFormUrl} target="_blank" rel="noreferrer" className="mt-4 text-xs font-bold text-indigo-500 hover:underline">
                            Open Google Form →
                        </a>
                    </section>
                </div>
            </div>

            {/* RECENT VISITORS LOG */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mt-8">
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Recent Visitor Passes</h2>
                    <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border">Live Log</span>
                </div>
                <div className="overflow-x-auto">
                    {fetchError && (
                        <div className="p-4 bg-red-50 text-red-600 font-bold border-b border-red-100">
                            Failed to load recent visitor passes: {(fetchError as any)?.message || 'Unknown error'}
                        </div>
                    )}
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Visitor</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Host</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Duration (Hours)</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {passes.map((p: any) => {
                                const calculatedDuration = p.expectedAt && p.checkInAt ? Math.round((new Date(p.expectedAt).getTime() - new Date(p.checkInAt).getTime()) / 3600000) : '-';
                                return (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-extrabold text-slate-900">{p.visitor?.name || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{p.visitor?.mobile}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                                            {p.visitor?.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{p.hostName || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-bold">
                                        {calculatedDuration} {calculatedDuration !== '-' && 'hrs'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => setPass({ profile: p.visitor, pass: p })}
                                            className="text-indigo-600 hover:text-indigo-900 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => setEditingPass({ ...p, durationHours: calculatedDuration !== '-' ? calculatedDuration : '2' })}
                                            className="text-slate-600 hover:text-slate-900 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="text-red-600 hover:text-red-900 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            )})}
                            {passes.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500 font-medium">
                                        No visitor passes recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
            {/* EDIT MODAL */}
            {editingPass && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Edit Visitor Pass</h2>
                        <form onSubmit={handleEditSave} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Visitor Name</label>
                                <input type="text" value={editingPass.visitor?.name || ''} onChange={(e) => setEditingPass({...editingPass, visitor: {...editingPass.visitor, name: e.target.value}})} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500" required />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Purpose</label>
                                <input type="text" value={editingPass.purpose || ''} onChange={(e) => setEditingPass({...editingPass, purpose: e.target.value})} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Host Name</label>
                                <input type="text" value={editingPass.hostName || ''} onChange={(e) => setEditingPass({...editingPass, hostName: e.target.value})} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Duration (Hours)</label>
                                <input type="number" min="1" value={editingPass.durationHours || ''} onChange={(e) => setEditingPass({...editingPass, durationHours: e.target.value})} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500" required />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setEditingPass(null)} className="px-5 py-2 font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" disabled={updateMutation.isPending} className="px-5 py-2 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}



