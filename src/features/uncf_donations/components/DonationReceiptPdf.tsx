import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDonation, markDonationSent } from '../services';
import { X, Send, Printer, Loader2, CheckCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';

const GITA_QUOTES = [
    '"A gift is pure when it is given from the heart to the right person at the right time and at the right place, and when we expect nothing in return." - Bhagavad Gita 17.20',
    '"You have the right to work, but never to the fruit of work. You should never engage in action for the sake of reward, nor should you long for inaction." - Bhagavad Gita 2.47',
    '"He who has let go of hatred, who treats all beings with kindness and compassion... is very dear to me." - Bhagavad Gita 12.13',
    '"Strive constantly to serve the welfare of the world; by devotion to selfless work one attains the supreme goal of life." - Bhagavad Gita 3.19',
    '"Through selfless service, you will always be fruitful and find the fulfillment of your desires." - Bhagavad Gita 3.10'
];

export const DonationReceiptPdf = ({ donationId, onClose }: { donationId: string, onClose: () => void }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const { data: donation, isLoading } = useQuery({
        queryKey: ['uncf-donation', donationId],
        queryFn: () => getDonation(donationId)
    });

    const queryClient = useQueryClient();
    const markSentMutation = useMutation({
        mutationFn: () => markDonationSent(donationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['uncf-donations'] });
            queryClient.invalidateQueries({ queryKey: ['uncf-donation', donationId] });
            onClose();
        }
    });

    const printRef = useRef<HTMLDivElement>(null);
    
    const handleDownload = (mode: 'FULL' | 'DONOR' = 'FULL') => {
        if (!printRef.current || !donation) return;
        setIsDownloading(true);
        
        setTimeout(() => {
            try {
                // Use a hidden iframe instead of a popup to prevent popup blockers from breaking the flow
                const iframe = document.createElement('iframe');
                iframe.style.position = 'fixed';
                iframe.style.right = '0';
                iframe.style.bottom = '0';
                iframe.style.width = '0';
                iframe.style.height = '0';
                iframe.style.border = '0';
                document.body.appendChild(iframe);

                const iframeDoc = iframe.contentWindow?.document;
                if (!iframeDoc) {
                    throw new Error("Could not access iframe document");
                }

                let styles = '';
                document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
                    styles += node.outerHTML;
                });

                const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8" />
                        <title>Receipt_${donation.receiptNo || 'UNCF'}${mode === 'DONOR' ? '_Donor_Copy' : ''}</title>
                        ${styles}
                        <style>
                            ${mode === 'DONOR' ? '.office-copy { display: none !important; } .dotted-border { display: none !important; }' : ''}
                            @media print {
                                body { margin: 0; padding: 20px; }
                                @page { margin: 0.5cm; }
                            }
                        </style>
                    </head>
                    <body class="bg-white">
                        <div style="font-family: Arial, sans-serif;">
                            ${printRef.current?.outerHTML || ''}
                        </div>
                    </body>
                    </html>
                `;

                iframeDoc.open();
                iframeDoc.write(html);
                iframeDoc.close();

                // Small delay to ensure images/styles load inside the iframe
                setTimeout(() => {
                    try {
                        iframe.contentWindow?.focus();
                        iframe.contentWindow?.print();
                    } catch (e) {
                        console.error("Print dialog error:", e);
                    } finally {
                        setTimeout(() => {
                            if (document.body.contains(iframe)) {
                                document.body.removeChild(iframe);
                            }
                            setIsDownloading(false);
                        }, 500);
                    }
                }, 500);

            } catch (err) {
                console.error("Print generation failed:", err);
                setIsDownloading(false);
            }
        }, 100);
    };

    const normalizeWhatsAppNumber = (value?: string | null) => {
        const digits = String(value || '').replace(/\D/g, '');
        if (digits.length === 10) return `91${digits}`;
        if (digits.length === 12 && digits.startsWith('91')) return digits;
        if (digits.length > 10 && digits.length <= 15) return digits;
        return '';
    };

    const openWhatsApp = () => {
        if (!donation) return;
        
        const mobile = normalizeWhatsAppNumber(donation.donor?.mobile);
        const occasionText = donation.occasionName ? ` for ${donation.occasionName}` : '';
        const amountNum = Number(donation.amount || 0);
        const message = [
            `Dear ${donation.donor?.name || 'Donor'},`,
            '',
            `We have successfully received your generous donation of ₹ ${amountNum.toLocaleString('en-IN')}${occasionText}.`,
            '',
            `Attached is your official receipt (No: ${donation.receiptNo}).`,
            '',
            'Thank you for your valuable contribution!',
            '',
            'Warm Regards,',
            'Universal Nature Care & Cure Foundation'
        ].join('\n');

        const encoded = encodeURIComponent(message);
        const url = mobile ? `https://wa.me/${mobile}?text=${encoded}` : `https://web.whatsapp.com/send?text=${encoded}`;
        
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading || !donation) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                <div className="rounded-2xl bg-white p-6">Loading Receipt...</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
                
                {/* Modal Panel */}
                <div className="relative z-10 w-full max-w-[1050px] flex-col rounded-xl bg-slate-100 shadow-2xl">
                    <div className="flex shrink-0 items-center justify-between rounded-t-xl bg-slate-800 p-4 text-white">
                        <h3 className="font-semibold text-lg">Print Donation Receipt</h3>
                        <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/20 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 sm:p-8">
                        {/* Print Container */}
                        <div ref={printRef} className="mx-auto w-full max-w-[950px] bg-white text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
                            <style>{`
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                            @page { margin: 10mm; }
                        }
                        .fieldset-border { border: 2px solid #166534; border-radius: 8px; position: relative; padding: 12px; margin-top: 18px; }
                        .fieldset-legend { background-color: #166534; color: white; padding: 3px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; border-radius: 4px; position: absolute; top: -12px; left: 16px; }
                        .val-line { border-bottom: 1px solid #555; display: inline-block; min-height: 18px; font-weight: 600; padding: 0 4px; color: #111; }
                        .checkbox-label { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; font-size: 11px; color: #111; }
                        input[type="checkbox"] { width: 13px; height: 13px; accent-color: #166534; margin-top: -1px; }
                    `}</style>
                    
                    <div className="p-8">
                        {/* OFFICE COPY STARTS HERE */}
                        <div className="office-copy pb-8">
                            {/* TOP HEADER */}
                            <div className="border-[3px] border-[#166534] rounded-xl p-4 flex items-center justify-between mb-4">
                                <div className="flex gap-6 w-full">
                                    <img src="/logo-new.png" alt="UNCF Logo" className="h-[90px] shrink-0" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    <div className="flex flex-col flex-1 justify-center">
                                        <h1 className="text-[19px] font-extrabold uppercase text-[#166534] tracking-wide mb-2">Universal Nature Care & Cure Foundation (H.Q)</h1>
                                        <div className="flex justify-between items-center w-full pr-4">
                                            <div className="text-left">
                                                <p className="text-[13px] font-bold text-black mb-1">UNCF Trust - Serving Since 2015 &nbsp;|&nbsp; Reg. No : 8/44/2015</p>
                                                <p className="text-[13px] font-semibold text-black">12/12 Saraswathi Nagar, Kovaipudur, Coimbatore - 641042</p>
                                            </div>
                                            <div className="border-l-[3px] border-slate-300 pl-6 flex flex-col justify-center gap-3">
                                                <div className="flex items-center whitespace-nowrap">
                                                    <span className="font-bold text-[13px] w-20 text-black">Receipt No</span>
                                                    <span className="font-bold text-[13px] mx-2 text-black">:</span>
                                                    <span className="val-line w-32 font-bold text-[13px] text-center border-black">{donation.receiptNo}</span>
                                                </div>
                                                <div className="flex items-center whitespace-nowrap">
                                                    <span className="font-bold text-[13px] w-20 text-black">Date</span>
                                                    <span className="font-bold text-[13px] mx-2 text-black">:</span>
                                                    <span className="val-line w-32 font-bold text-[13px] text-center border-black">{format(new Date(donation.date), 'dd/MM/yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ROW 1: PLANNING, PURPOSE, OCCASION */}
                            <div className="flex gap-4">
                                <div className="fieldset-border flex-[1.6]">
                                    <div className="fieldset-legend">PLANNING TO DONATE</div>
                                    <div className="flex justify-between items-center h-full px-2">
                                        <label className="checkbox-label whitespace-nowrap"><input type="checkbox" checked={donation.recurringPlan === 'MONTHLY'} readOnly /> Monthly</label>
                                        <label className="checkbox-label whitespace-nowrap"><input type="checkbox" checked={donation.recurringPlan === 'QUARTERLY'} readOnly /> Quarterly</label>
                                        <label className="checkbox-label whitespace-nowrap"><input type="checkbox" checked={donation.recurringPlan === 'HALF_YEARLY'} readOnly /> Half Yearly</label>
                                        <label className="checkbox-label whitespace-nowrap"><input type="checkbox" checked={donation.recurringPlan === 'YEARLY'} readOnly /> Yearly</label>
                                    </div>
                                </div>
                                <div className="fieldset-border flex-[1.4]">
                                    <div className="fieldset-legend">PURPOSE OF DONATION</div>
                                    <div className="flex flex-col justify-center h-full px-2 gap-1.5 w-full">
                                        <div className="flex items-end w-full">
                                            <span className="font-bold text-[10px] w-20 text-left">Occasion</span>
                                            <span className="font-bold mx-1">:</span>
                                            <span className="val-line flex-1 text-center text-[11px] border-black pb-0.5">{donation.purpose || ''}</span>
                                        </div>
                                        <div className="flex items-end w-full">
                                            <span className="font-bold text-[10px] w-20 text-left">Sponsored For</span>
                                            <span className="font-bold mx-1">:</span>
                                            <span className="val-line flex-1 text-center text-[11px] border-black pb-0.5">{donation.category ? `${donation.category} Sponsorship` : ''}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="fieldset-border flex-[1.4]">
                                    <div className="fieldset-legend">OCCASION DETAILS</div>
                                    <div className="flex flex-col justify-center h-full px-2 gap-1.5 w-full">
                                        <div className="flex items-end w-full">
                                            <span className="font-bold text-[10px] w-24 text-left">Person Honoured</span>
                                            <span className="font-bold mx-1">:</span>
                                            <span className="val-line flex-1 text-center text-[11px] border-black pb-0.5">{donation.occasionName || ''}</span>
                                        </div>
                                        <div className="flex items-end w-full">
                                            <span className="font-bold text-[10px] w-24 text-left">Relationship</span>
                                            <span className="font-bold mx-1">:</span>
                                            <span className="val-line flex-1 text-center text-[11px] border-black pb-0.5">{donation.occasionRelation || ''}</span>
                                        </div>
                                        <div className="flex items-end w-full">
                                            <span className="font-bold text-[10px] w-24 text-left">Occasion Date</span>
                                            <span className="font-bold mx-1">:</span>
                                            <span className="val-line flex-1 text-center text-[11px] border-black pb-0.5">{donation.occasionDate ? format(new Date(donation.occasionDate), 'dd/MM/yyyy') : ''}</span>
                                        </div>
                                        <div className="flex items-end w-full">
                                            <span className="font-bold text-[10px] w-24 text-left">Prayer Date</span>
                                            <span className="font-bold mx-1">:</span>
                                            <span className="val-line flex-1 text-center text-[11px] border-black pb-0.5">{donation.preferredPrayerDate ? format(new Date(donation.preferredPrayerDate), 'dd/MM/yyyy') : ''}</span>
                                        </div>
                                    </div>
                                </div>
                                {donation.honouredPersonImage && (
                                    <div className="fieldset-border w-24 flex items-center justify-center p-1 shrink-0 ml-2">
                                        <div className="fieldset-legend">PHOTO</div>
                                        <img src={donation.honouredPersonImage} alt="Honoured" className="max-w-full max-h-[70px] object-contain rounded" />
                                    </div>
                                )}
                            </div>

                            {/* SPONSORSHIP CATEGORY */}
                            <div className="fieldset-border">
                                <div className="fieldset-legend">SPONSORSHIP CATEGORY</div>
                                <div className="flex justify-between items-center px-4 py-3">
                                    <label className="checkbox-label text-[12px]"><input type="checkbox" checked={donation.category === 'Food'} readOnly /> Meal Sponsorship</label>
                                    <label className="checkbox-label text-[12px]"><input type="checkbox" checked={donation.category === 'Medicines'} readOnly /> Medicines</label>
                                    <label className="checkbox-label text-[12px]"><input type="checkbox" checked={donation.category === 'Medical Camp'} readOnly /> Medical Camp</label>
                                    <label className="checkbox-label text-[12px]"><input type="checkbox" checked={donation.category === 'Essential Needs'} readOnly /> Essential Needs</label>
                                    <label className="checkbox-label text-[12px]"><input type="checkbox" checked={!!donation.category && !['Food', 'Medicines', 'Medical Camp', 'Essential Needs'].includes(donation.category)} readOnly /> Other</label>
                                </div>
                            </div>

                            {/* ROW 2: DONOR DETAILS */}
                            <div className="fieldset-border">
                                <div className="fieldset-legend">DONOR DETAILS</div>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-4 py-2 mt-1">
                                    <div className="flex items-end">
                                        <span className="font-bold text-[13px] w-[160px]">Donor Name</span>
                                        <span className="font-bold mr-2">:</span>
                                        <span className="val-line flex-1 text-[13px] border-black font-semibold pl-2">{donation.donor?.name || ''}</span>
                                    </div>
                                    <div className="flex items-end">
                                        <span className="font-bold text-[13px] w-[60px]">Mobile</span>
                                        <span className="font-bold mx-1">:</span>
                                        <span className="val-line w-28 text-[13px] border-black font-semibold pl-2">{donation.donor?.mobile || ''}</span>
                                        <span className="font-bold text-[13px] ml-4 w-[75px]">WhatsApp</span>
                                        <span className="font-bold mx-1">:</span>
                                        <span className="val-line flex-1 text-[13px] border-black font-semibold pl-2">{donation.donor?.whatsappNumber || ''}</span>
                                    </div>
                                    <div className="flex items-end">
                                        <span className="font-bold text-[13px] w-[160px]">Father / Husband Name</span>
                                        <span className="font-bold mr-2">:</span>
                                        <span className="val-line flex-1 text-[13px] border-black font-semibold pl-2">{donation.donor?.fatherOrHusbandName || ''}</span>
                                    </div>
                                    <div className="flex items-end">
                                        <span className="font-bold text-[13px] w-[60px]">PAN</span>
                                        <span className="font-bold mx-1">:</span>
                                        <span className="val-line flex-1 text-[13px] border-black font-semibold pl-2">{donation.donor?.panNumber || ''}</span>
                                    </div>
                                    <div className="flex items-end">
                                        <span className="font-bold text-[13px] w-[160px]">Donor Address</span>
                                        <span className="font-bold mr-2">:</span>
                                        <span className="val-line flex-1 text-[13px] border-black font-semibold pl-2">{donation.donor?.residentialAddress || ''}</span>
                                    </div>
                                    <div className="hidden sm:block"></div>
                                    <div className="flex items-end">
                                        <span className="font-bold text-[13px] w-[160px]">Donor Mail ID</span>
                                        <span className="font-bold mr-2">:</span>
                                        <span className="val-line flex-1 text-[13px] border-black font-semibold pl-2">{donation.donor?.email || ''}</span>
                                    </div>
                                    <div className="flex items-end">
                                        <span className="font-bold text-[13px] w-[60px]">DOB</span>
                                        <span className="font-bold mx-1">:</span>
                                        <span className="val-line flex-1 text-[13px] border-black font-semibold pl-2">{donation.donor?.dob ? format(new Date(donation.donor.dob), 'dd/MM/yyyy') : ''}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ROW 3: MODE, AMOUNT, WORDS */}
                            <div className="flex gap-4">
                                <div className="fieldset-border flex-[1.2]">
                                    <div className="fieldset-legend">MODE OF DONATION</div>
                                    <div className="flex flex-col justify-center h-full gap-4 px-2 py-2">
                                        <div className="flex justify-between items-center pr-4">
                                            <label className="checkbox-label"><input type="checkbox" checked={donation.paymentMode === 'CASH'} readOnly /> Cash</label>
                                            <label className="checkbox-label"><input type="checkbox" checked={donation.paymentMode === 'UPI'} readOnly /> UPI</label>
                                            <label className="checkbox-label"><input type="checkbox" checked={donation.paymentMode === 'NET_BANKING'} readOnly /> Net Banking</label>
                                        </div>
                                        <div className="flex justify-start gap-12 items-center pr-4">
                                            <label className="checkbox-label"><input type="checkbox" checked={donation.paymentMode === 'CHEQUE'} readOnly /> Cheque</label>
                                            <label className="checkbox-label"><input type="checkbox" checked={donation.paymentMode === 'MATERIALS'} readOnly /> MATERIALS</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="fieldset-border flex-1">
                                    <div className="fieldset-legend">DONATION AMOUNT</div>
                                    <div className="flex items-center justify-center gap-4 h-full px-6 py-2 mt-1">
                                        <span className="text-2xl font-bold text-[#166534]">₹</span>
                                        <span className="val-line flex-1 text-center text-xl font-bold border-black">{donation.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                                <div className="fieldset-border flex-[1.2]">
                                    <div className="fieldset-legend">RUPEES IN WORDS</div>
                                    <div className="flex items-end h-full pb-2 px-4 mt-2">
                                        <span className="val-line flex-1 capitalize text-[14px] font-bold text-center border-black">{donation.amountInWords || ''}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ROW 4: REFERENCE OF FRIENDS & FAMILY */}
                            <div className="border-[3px] border-[#166534] rounded-lg mt-6 overflow-hidden">
                                <div className="bg-[#eaf4ea] text-center py-2 text-xs font-bold text-[#166534] uppercase tracking-wider border-b-[3px] border-[#166534]">
                                    REFERENCE OF FRIENDS & FAMILY
                                </div>
                                <table className="w-full text-xs text-center border-collapse">
                                    <thead>
                                        <tr className="border-b-[3px] border-[#166534] text-[#166534] bg-white">
                                            <th className="py-2 border-r-[3px] border-[#166534] w-12 font-bold">#</th>
                                            <th className="py-2 border-r-[3px] border-[#166534] font-bold">Name for Donation</th>
                                            <th className="py-2 w-64 font-bold">Mobile No</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {[0, 1, 2, 3, 4].map((i) => {
                                            const ref = donation.references?.[i];
                                            return (
                                                <tr key={i} className="border-b-[3px] border-[#166534] last:border-0">
                                                    <td className="py-2 border-r-[3px] border-[#166534] font-bold text-[#166534]">{i + 1}.</td>
                                                    <td className="py-2 border-r-[3px] border-[#166534] font-semibold text-[13px]">{ref?.name || ''}</td>
                                                    <td className="py-2 font-semibold text-[13px]">{ref?.mobile ? `+91 ${ref.mobile}` : ''}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* ROW 5: TAX & CORPORATE */}
                            <div className="border-[3px] border-[#166534] rounded-lg mt-4 flex bg-[#eaf4ea] divide-x-[3px] divide-[#166534]">
                                <div className="flex-1 py-2 px-12 flex items-center justify-between text-[13px]">
                                    <span className="font-bold text-[#166534]">80G Tax Receipt Required:</span>
                                    <div className="flex gap-12">
                                        <label className="checkbox-label"><input type="checkbox" checked={donation.taxDeduction} readOnly /> Yes</label>
                                        <label className="checkbox-label"><input type="checkbox" checked={!donation.taxDeduction} readOnly /> No</label>
                                    </div>
                                </div>
                                <div className="flex-1 py-2 px-12 flex items-center justify-between text-[13px]">
                                    <span className="font-bold text-[#166534]">Corporate Donation:</span>
                                    <div className="flex gap-12">
                                        <label className="checkbox-label"><input type="checkbox" checked={donation.donor?.isCorporate} readOnly /> Yes</label>
                                        <label className="checkbox-label"><input type="checkbox" checked={!donation.donor?.isCorporate} readOnly /> No</label>
                                    </div>
                                </div>
                            </div>

                            {/* SIGNATURES */}
                            <div className="flex justify-between items-end mt-16 mb-4 px-12 text-[13px] font-bold text-black">
                                <div className="text-center">
                                    <span className="block mb-10">Received by:</span>
                                    <div className="border-b-[2px] border-dotted border-slate-400 w-40"></div>
                                </div>
                                <div className="text-center relative">
                                    <div className="absolute -left-[70px] top-0 bottom-0 border-l-[2px] border-dotted border-slate-300"></div>
                                    <span className="block mb-10">Verified by:</span>
                                    <div className="border-b-[2px] border-dotted border-slate-400 w-40"></div>
                                    <div className="absolute -right-[70px] top-0 bottom-0 border-r-[2px] border-dotted border-slate-300"></div>
                                </div>
                                <div className="text-center">
                                    <span className="block mb-10">Authorized Sign:</span>
                                    <div className="border-b-[2px] border-dotted border-slate-400 w-40"></div>
                                </div>
                            </div>
                        </div> {/* END OFFICE COPY */}

                        {/* DETACHABLE SLIP */}
                        <div className="relative mt-8 mb-6 flex items-center">
                            <span className="text-2xl -ml-2 -rotate-90 bg-white pr-2 text-black">✂</span>
                            <div className="flex-1 border-b-[2px] border-dashed border-black"></div>
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#166534] text-white px-8 py-1.5 rounded-full text-[11px] font-bold tracking-wider">
                                DONOR COPY
                            </div>
                        </div>

                        {/* DONOR COPY */}
                        <div className="donor-copy border-[3px] border-[#166534] rounded-xl pt-4 pb-2 relative">
                            {/* TOP HEADER (DONOR COPY) */}
                            <div className="flex items-center justify-between px-4 mb-6">
                                <div className="flex gap-4 w-full">
                                    <img src="/logo-new.png" alt="UNCF Logo" className="h-[70px] shrink-0" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    <div className="flex flex-col flex-1 justify-center">
                                        <h1 className="text-[15.5px] font-extrabold uppercase text-[#166534] tracking-wide mb-2">Universal Nature Care & Cure Foundation (H.Q)</h1>
                                        <div className="flex justify-between items-center w-full pr-2">
                                            <div className="text-left">
                                                <p className="text-[11px] font-bold text-black mb-1">UNCF Trust - Serving Since 2015 &nbsp;|&nbsp; Reg. No : 8/44/2015</p>
                                                <p className="text-[11px] font-semibold text-black">12/12 Saraswathi Nagar, Kovaipudur, Coimbatore - 641042</p>
                                            </div>
                                            <div className="border-l-[2px] border-slate-300 pl-4 flex flex-col justify-center gap-3">
                                                <div className="flex items-center whitespace-nowrap">
                                                    <span className="font-bold text-[11px] w-16 text-black">Receipt No</span>
                                                    <span className="font-bold text-[11px] mx-1 text-black">:</span>
                                                    <span className="val-line w-28 font-bold text-[11px] text-center border-black">{donation.receiptNo}</span>
                                                </div>
                                                <div className="flex items-center whitespace-nowrap">
                                                    <span className="font-bold text-[11px] w-16 text-black">Date</span>
                                                    <span className="font-bold text-[11px] mx-1 text-black">:</span>
                                                    <span className="val-line w-28 font-bold text-[11px] text-center border-black">{format(new Date(donation.date), 'dd/MM/yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 space-y-5">
                                <div className="flex items-end gap-3 text-[15px]">
                                    <span className="font-bold whitespace-nowrap text-black">Received with thanks from M/s</span>
                                    <span className="val-line flex-1 font-bold text-[15px] border-black px-2">{donation.donor?.name || ''}</span>
                                </div>

                                <div className="flex items-end gap-3 text-[15px]">
                                    <span className="font-bold whitespace-nowrap text-black">the sum of Rupees / Materials</span>
                                    <span className="val-line flex-1 font-bold text-[15px] border-black px-2">
                                        {donation.paymentMode === 'MATERIALS' ? donation.materialDetails : donation.amountInWords || ''}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center mt-6 px-2">
                                    <div className="border-[3px] border-[#166534] rounded-lg px-6 py-2.5 bg-white text-[#166534] font-bold text-[22px] flex items-center gap-4">
                                        <span>₹</span>
                                        <span className="border-b-[2px] border-[#166534] min-w-[120px] text-center px-2 pb-0.5">
                                            {donation.paymentMode === "MATERIALS" ? "MATERIALS" : donation.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="text-center font-bold italic text-slate-800 max-w-md px-4 leading-relaxed text-[13.5px]">
                                        {GITA_QUOTES[parseInt((donation.receiptNo || '').replace(new RegExp('\\D', 'g'), '') || '0') % GITA_QUOTES.length] || GITA_QUOTES[0]}
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mt-16 text-[12px] font-bold text-black px-8">
                                    <div className="text-center w-36 border-t-[2px] border-black pt-1.5">Receiver Sign</div>
                                    <div className="text-center w-36 border-t-[2px] border-black pt-1.5">Donor Sign</div>
                                    <div className="text-center w-36 border-t-[2px] border-black pt-1.5">UNCF Billed By Sign</div>
                                </div>
                            </div>
                            {donation.specialPrayerMessage && (
                                <div className="mt-4 px-6 text-center italic text-[13px] font-bold text-slate-700">
                                    "{donation.specialPrayerMessage}"
                                </div>
                            )}

                            <div className="flex items-center justify-center gap-3 mt-6 bg-[#f4faf4] py-3 text-[#166534]">
                                <span className="text-lg">🤝</span>
                                <span className="font-extrabold tracking-wide text-[12px]">DONATED AMOUNT IS NON-REFUNDABLE.</span>
                            </div>

                            {/* FOOTER INFO */}
                            <div className="flex justify-between items-start text-[10.5px] font-bold mt-2 pt-3 px-6 border-t-[2px] border-dashed border-[#166534]/30 pb-2">
                                <div className="text-center">
                                    <div className="text-[#166534] uppercase mb-0.5">Visit Timings</div>
                                    <div className="text-black">Monday to Saturday</div>
                                    <div className="text-black">10:00 AM – 4:30 PM</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[#166534] uppercase mb-0.5">Our Location</div>
                                    <a href="https://g.co/kgs/fs1Qc88" target="_blank" rel="noreferrer" className="text-blue-700 underline block">https://g.co/kgs/fs1Qc88</a>
                                </div>
                                <div className="text-center">
                                    <div className="text-[#166534] uppercase mb-0.5">Website</div>
                                    <a href="http://www.uncftrust.org" target="_blank" rel="noreferrer" className="text-blue-700 underline block">www.uncftrust.org</a>
                                </div>
                            </div>
                        </div>
                    </div>
                        </div>
                    </div>
                    
                    {/* Modal Actions (Moved to Bottom) */}
                    <div className="flex shrink-0 items-center justify-end rounded-b-xl bg-slate-200 p-4 gap-3 border-t border-slate-300">
                        <button 
                            type="button" 
                            onClick={() => markSentMutation.mutate()} 
                            disabled={markSentMutation.isPending || donation.isReceiptSent}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-400 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {markSentMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            {donation.isReceiptSent ? 'Sent' : (markSentMutation.isPending ? 'Marking...' : 'Mark Sent')}
                        </button>
                        <button type="button" onClick={openWhatsApp} className="flex items-center gap-1.5 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-bold text-white hover:bg-[#128C7E] transition-colors">
                            <Send size={16} /> Send to Donor
                        </button>
                        <button type="button" onClick={() => handleDownload('DONOR')} disabled={isDownloading} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
                            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />} 
                            Save Donor Copy
                        </button>
                        <button type="button" onClick={() => handleDownload('FULL')} disabled={isDownloading} className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-900 transition-colors disabled:opacity-50">
                            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />} 
                            Print Full Bill
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
