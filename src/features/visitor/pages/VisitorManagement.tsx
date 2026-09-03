import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkVisitorProfile, createVisitorPass, getVisitorPasses, updateVisitorPass, checkoutVisitorPass } from '../services';

import { QRCodeSVG } from 'qrcode.react';
import { PageHeader } from '../../../components/PageHeader';
import { useToast } from '../../../components/Toast';
import { PatientSelector } from '../../../components/PatientSelector';
import { VisitorPassCard } from '../components/VisitorPassCard';
import { VisitorMaterialEntry } from '../components/VisitorMaterialEntry';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

const CATEGORY_PURPOSES: Record<string, string[]> = {
    RESIDENT_FAMILY_RELATIVE: ['Family Visit', 'Care Discussion', 'Personal Matter', 'Document / Item Handover', 'Other'],
    RESIDENT_CAREGIVER_ATTENDANT: ['Resident Care', 'Personal Assistance', 'Daily Care Support', 'Accompaniment', 'Other'],
    OLD_AGE_CARE_ADMISSION_ENQUIRY: ['New Admission Enquiry', 'Facility Visit', 'Pricing / Service Enquiry', 'Documentation Enquiry', 'Counselling / Discussion', 'Other'],
    HEALTHCARE_PROFESSIONAL: ['Patient Consultation', 'Clinical Review', 'Medical Visit', 'Treatment / Procedure', 'Professional Meeting', 'Other'],
    MEDICAL_PHARMA_REPRESENTATIVE: ['Product Discussion', 'Medicine / Product Presentation', 'Doctor / Clinical Meeting', 'Sample / Information Submission', 'Other'],
    VENDOR_SUPPLIER: ['Material Delivery', 'Vendor Meeting', 'Service Discussion', 'Product Discussion', 'Payment / Documentation', 'Other'],
    CONTRACTOR_TEMPORARY_WORKER: ['Maintenance', 'Repair', 'Installation', 'Inspection', 'Construction / Project Work', 'Other'],
    OUTSOURCED_AGENCY_WORKER: ['Assigned Work', 'Service Delivery', 'Routine Duty', 'Replacement / Temporary Duty', 'Other'],
    DAILY_REGULAR_WORKER: ['Routine Work', 'Maintenance', 'Cleaning', 'Gardening', 'Support Service', 'Other'],
    STUDENT_INTERN_TRAINEE: ['Internship', 'Training', 'Academic Visit', 'Research', 'Observation', 'Other'],
    VOLUNTEER_NGO_COMMUNITY: ['Volunteering', 'Community Service', 'Resident Support', 'Donation / Community Activity', 'Awareness / Outreach', 'Other'],
    DELIVERY_COURIER: ['Parcel Delivery', 'Document Delivery', 'Medicine Delivery', 'Material Delivery', 'Food Delivery', 'Other'],
    TRANSPORT_DRIVER: ['Resident Transport', 'Patient Transport', 'Pickup / Drop-off', 'Material Transport', 'Official Transport', 'Other'],
    GOVERNMENT_OFFICIAL_INSPECTOR: ['Inspection', 'Official Visit', 'Verification', 'Government Service', 'Compliance Check', 'Other'],
    AUDITOR_CONSULTANT: ['Audit', 'Consultation', 'Assessment', 'Professional Meeting', 'Review', 'Other'],
    EVENT_INSTITUTIONAL_GUEST: ['Event', 'Institutional Visit', 'Meeting', 'Partnership Discussion', 'Official Function', 'Other'],
    OTHER: ['General Visit', 'Personal Matter', 'Other']
};

export default function VisitorManagement() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Form State
    const [mobile, setMobile] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [whatsappSameAsMobile, setWhatsappSameAsMobile] = useState(true);
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [category, setCategory] = useState('OTHER');
    const [purpose, setPurpose] = useState('');
    const [customPurpose, setCustomPurpose] = useState('');
    const [hostName, setHostName] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [residentialAddress, setResidentialAddress] = useState('');
    const [pincode, setPincode] = useState('');

    const [hasMaterials, setHasMaterials] = useState(false);
    const [materialDetails, setMaterialDetails] = useState<string | null>(null);
    const [isMaterialsValid, setIsMaterialsValid] = useState(false);

    // UI State
    const [isChecking, setIsChecking] = useState(false);
    const [pass, setPass] = useState<any>(null);
    const [editingPass, setEditingPass] = useState<any>(null);
    const [viewingPass, setViewingPass] = useState<any>(null);

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


    const checkoutMutation = useMutation({
        mutationFn: checkoutVisitorPass,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visitorPasses'] });
            toast({ title: 'Success', message: 'Visitor checked out successfully', type: 'success' });
        },
        onError: (err: any) => toast({ title: 'Error', message: err?.response?.data?.error || 'Failed to check out visitor', type: 'error' })
    });

    const handleCheckout = (id: string) => {
        if (confirm("Are you sure you want to check out this visitor?")) {
            checkoutMutation.mutate(id);
        }
    };

    const handleMobileBlur = async () => {
        if (!mobile || mobile.length < 10) return;
        setIsChecking(true);
        try {
            const profile = await checkVisitorProfile(mobile);
            if (profile) {
                setName(profile.name);
                setCategory(profile.category);
                if (profile.whatsapp) {
                    setWhatsapp(profile.whatsapp);
                    setWhatsappSameAsMobile(profile.whatsapp === mobile);
                }
                if (profile.dob) {
                    setDob(profile.dob);
                }
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
        
        if (hasMaterials && !isMaterialsValid) {
            return; // Prevent submission, VisitorMaterialEntry will show validation messages
        }

        let calcDurationHours = '2'; // Default
        
        const finalPurpose = purpose === 'Other' ? customPurpose : purpose;

        // OTP verification is temporarily disabled
        createMutation.mutate({
            mobile,
            whatsapp: whatsappSameAsMobile ? mobile : whatsapp,
            dob: dob || undefined,
            name,
            category,
            purpose: finalPurpose,
            hostName,
            durationHours: calcDurationHours,
            bloodGroup,
            residentialAddress,
            pincode,
            ...(hasMaterials && materialDetails ? { materialDetails } : {})
        });
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
        setWhatsapp('');
        setWhatsappSameAsMobile(true);
        setDob('');
        setName('');
        setCategory('OTHER');
        setPurpose('');
        setCustomPurpose('');
        setHostName('');
        setBloodGroup('');
        setResidentialAddress('');
        setPincode('');
        setPass(null);
        setOtpSent(false);
        setOtpVerified(false);
        setOtpReference('');
        setOtpValue('');
        setHasMaterials(false);
        setMaterialDetails(null);
        setIsMaterialsValid(false);
    };

    const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSd126ooky6N92XAa1l9-dnTaWLHHCvFVG5_EasCpeaWwdzT1g/viewform?usp=publish-editor"; // <-- PASTE YOUR REAL GOOGLE FORM LINK HERE
    const navigate = useNavigate();

    return (
        <div className="flex min-h-full flex-col space-y-6 bg-transparent">

            <PageHeader
                title="Visitor Management"
                subtitle="Live visitor entry tracking, OTP verification, and pass generation."
                breadcrumbs={[{ label: 'Front Desk' }, { label: 'Visitor Management' }]}
                action={
                    <button
                        onClick={() => navigate('/visitor-module/dashboard')}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        View Dashboard
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: FORM */}
                <div className="lg:col-span-2 space-y-6">
                    {pass ? (
                        <VisitorPassCard pass={pass} onReset={handleReset} />
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

                                    <div className="md:col-span-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-sm font-semibold text-slate-700">WhatsApp Number</label>
                                            <label className="flex items-center text-sm text-slate-600 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="mr-2 rounded text-indigo-600 focus:ring-indigo-500" 
                                                    checked={whatsappSameAsMobile}
                                                    onChange={(e) => setWhatsappSameAsMobile(e.target.checked)}
                                                />
                                                Same as Mobile Number
                                            </label>
                                        </div>
                                        {!whatsappSameAsMobile && (
                                            <input
                                                type="text"
                                                value={whatsapp}
                                                onChange={(e) => setWhatsapp(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-bold"
                                                placeholder="e.g. +91 9876543210"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Visitor Name *</label>
                                        <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Date of Birth</label>
                                        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-white" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Category *</label>
                                        <select value={category} onChange={(e) => {
                                            setCategory(e.target.value);
                                            setPurpose('');
                                            setCustomPurpose('');
                                        }} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-white">
                                            <option value="RESIDENT_FAMILY_RELATIVE">Resident Family / Relative</option>
                                            <option value="RESIDENT_CAREGIVER_ATTENDANT">Resident Caregiver / Attendant</option>
                                            <option value="OLD_AGE_CARE_ADMISSION_ENQUIRY">Old Age Care / Admission Enquiry</option>
                                            <option value="HEALTHCARE_PROFESSIONAL">Healthcare Professional</option>
                                            <option value="MEDICAL_PHARMA_REPRESENTATIVE">Medical / Pharma Representative</option>
                                            <option value="VENDOR_SUPPLIER">Vendor / Supplier</option>
                                            <option value="CONTRACTOR_TEMPORARY_WORKER">Contractor / Temporary Worker</option>
                                            <option value="OUTSOURCED_AGENCY_WORKER">Outsourced / Agency Worker</option>
                                            <option value="DAILY_REGULAR_WORKER">Daily / Regular Worker</option>
                                            <option value="STUDENT_INTERN_TRAINEE">Student / Intern / Trainee</option>
                                            <option value="VOLUNTEER_NGO_COMMUNITY">Volunteer / NGO / Community</option>
                                            <option value="DELIVERY_COURIER">Delivery / Courier</option>
                                            <option value="TRANSPORT_DRIVER">Transport / Driver</option>
                                            <option value="GOVERNMENT_OFFICIAL_INSPECTOR">Government / Official / Inspector</option>
                                            <option value="AUDITOR_CONSULTANT">Auditor / Consultant</option>
                                            <option value="EVENT_INSTITUTIONAL_GUEST">Event / Institutional Guest</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Blood Group</label>
                                        <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-white">
                                            <option value="">Select Blood Group</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Residential Address</label>
                                        <textarea value={residentialAddress} onChange={(e) => setResidentialAddress(e.target.value)} rows={2} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500" placeholder="Enter complete address"></textarea>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Pincode</label>
                                        <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500" placeholder="e.g. 110001" />
                                    </div>
                                </div>
                            </section>

                            {/* 2. VISIT PURPOSE */}
                            <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-bold text-indigo-800 uppercase tracking-wide border-b pb-2 border-indigo-50">2. Visit Purpose</h2>
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Purpose of Visit</label>
                                        <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-white">
                                            <option value="">Select Purpose</option>
                                            {(CATEGORY_PURPOSES[category] || CATEGORY_PURPOSES['OTHER']).map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                        {purpose === 'Other' && (
                                            <input type="text" value={customPurpose} onChange={(e) => setCustomPurpose(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500" placeholder="Please specify..." />
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">Elder / Resident Name</label>
                                            <input type="text" value={hostName} onChange={(e) => setHostName(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500" placeholder="Type name..." />
                                        </div>
                                        <div className="flex-1">
                                            <PatientSelector 
                                                value=""
                                                onChange={(_id, name) => {
                                                    if (name) setHostName(name);
                                                }}
                                                label="Or Select Elder / Resident"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">In Time</label>
                                        <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 font-semibold cursor-not-allowed">
                                            Automatic (Server Time)
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 3. MATERIALS */}
                            <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-bold text-indigo-800 uppercase tracking-wide border-b pb-2 border-indigo-50">3. Materials & Items</h2>
                                <div className="mb-4">
                                    <label className="mb-3 block text-sm font-semibold text-slate-700">Are you carrying any items/materials?</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="hasMaterials" 
                                                checked={!hasMaterials} 
                                                onChange={() => setHasMaterials(false)}
                                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm font-bold text-slate-700">No</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="hasMaterials" 
                                                checked={hasMaterials} 
                                                onChange={() => setHasMaterials(true)}
                                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm font-bold text-slate-700">Yes</span>
                                        </label>
                                    </div>
                                </div>

                                {hasMaterials && (
                                    <div className="mt-4 border-t border-slate-100 pt-4">
                                        <VisitorMaterialEntry 
                                            onChange={setMaterialDetails}
                                            onValidityChange={setIsMaterialsValid}
                                        />
                                        {hasMaterials && !isMaterialsValid && (
                                            <p className="mt-2 text-sm font-semibold text-rose-500">Please provide valid material details before submitting.</p>
                                        )}
                                    </div>
                                )}
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

            {/* CURRENTLY INSIDE */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mt-8">
                <div className="p-5 border-b border-slate-100 bg-indigo-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-indigo-900 uppercase tracking-wide">Currently Inside</h2>
                    <span className="text-xs font-semibold text-indigo-700 bg-white px-3 py-1 rounded-full border border-indigo-200">Active</span>
                </div>
                <div className="overflow-x-auto">
                    {fetchError && (
                        <div className="p-4 bg-red-50 text-red-600 font-bold border-b border-red-100">
                            Failed to load visitor passes: {(fetchError as any)?.message || 'Unknown error'}
                        </div>
                    )}
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Visitor</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Elder / Resident</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">In Time</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {passes.filter((p: any) => p.checkInAt && !p.checkOutAt).map((p: any) => {
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
                                        {new Date(p.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleCheckout(p.id)}
                                            className="text-amber-600 hover:text-amber-900 font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 transition-colors"
                                        >
                                            Check Out
                                        </button>
                                        <button
                                            onClick={() => setViewingPass(p)}
                                            className="text-indigo-600 hover:text-indigo-900 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            )})}
                            {passes.filter((p: any) => p.checkInAt && !p.checkOutAt).length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500 font-medium">
                                        No active visitors inside.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* RECENTLY VISITED */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mt-8">
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Recently Visited</h2>
                    <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">History</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Visitor</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Elder / Resident</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Time Inside</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {passes.filter((p: any) => p.checkOutAt).map((p: any) => {
                                const checkInTime = p.checkInAt ? new Date(p.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
                                const checkOutTime = new Date(p.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                return (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors opacity-75">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-bold text-slate-700">{p.visitor?.name || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">{p.visitor?.mobile}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                            {p.visitor?.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.hostName || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-semibold">
                                        {checkInTime} - {checkOutTime}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => setViewingPass(p)}
                                            className="text-indigo-600 hover:text-indigo-900 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            )})}
                            {passes.filter((p: any) => p.checkOutAt).length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500 font-medium">
                                        No recent visits found.
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
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Elder / Resident Name</label>
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

            {/* VIEW MODAL */}
            {viewingPass && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Visitor Details</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-500">Name:</span>
                                <span className="font-bold text-slate-800">{viewingPass.visitor?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-500">Mobile:</span>
                                <span className="font-bold text-slate-800">{viewingPass.visitor?.mobile || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-500">Category:</span>
                                <span className="font-bold text-slate-800">{viewingPass.visitor?.category || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-500">Purpose:</span>
                                <span className="font-bold text-slate-800">{viewingPass.purpose || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-500">Host / Resident:</span>
                                <span className="font-bold text-slate-800">{viewingPass.hostName || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-500">Check-In Time:</span>
                                <span className="font-bold text-slate-800">{viewingPass.checkInAt ? new Date(viewingPass.checkInAt).toLocaleString() : '-'}</span>
                            </div>
                            {viewingPass.checkOutAt && (
                                <div className="flex justify-between">
                                    <span className="font-semibold text-slate-500">Check-Out Time:</span>
                                    <span className="font-bold text-slate-800">{new Date(viewingPass.checkOutAt).toLocaleString()}</span>
                                </div>
                            )}
                            {viewingPass.checkInAt && viewingPass.checkOutAt && (
                                <div className="flex justify-between">
                                    <span className="font-semibold text-slate-500">Duration:</span>
                                    <span className="font-bold text-slate-800">
                                        {Math.round((new Date(viewingPass.checkOutAt).getTime() - new Date(viewingPass.checkInAt).getTime()) / 60000)} mins
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-500">Status:</span>
                                <span className="font-bold text-slate-800">
                                    {viewingPass.checkOutAt ? 'Checked Out' : 'Currently Inside'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-500">Pass ID:</span>
                                <span className="font-bold text-slate-800 text-xs">{viewingPass.id}</span>
                            </div>

                            {/* APPROVED BY SECTION */}
                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Approved By</h3>
                                {viewingPass.approvedByUser ? (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-slate-500">Name:</span>
                                            <span className="font-bold text-slate-800">
                                                {viewingPass.approvedByUser.firstName} {viewingPass.approvedByUser.lastName || ''}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-slate-500">Employee ID:</span>
                                            <span className="font-bold text-slate-800">{viewingPass.approvedByUser.staff?.empId || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-slate-500">Designation:</span>
                                            <span className="font-bold text-slate-800">{viewingPass.approvedByUser.staff?.designation || '-'}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm font-bold text-slate-400">
                                        Not available
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end pt-6">
                            <button onClick={() => setViewingPass(null)} className="px-5 py-2 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



