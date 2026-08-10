import re

with open('d:/ERP/frontend/src/features/uncf_donations/components/DonationReceiptPdf.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Move buttons to bottom and fix top header
start_buttons = r'<div className="flex shrink-0 items-center justify-between rounded-t-xl bg-slate-800 p-4 text-white">.*?</div>\n\n                    <div className="p-4 sm:p-8">'
new_top_header = """<div className="flex shrink-0 items-center justify-between rounded-t-xl bg-slate-800 p-4 text-white">
                        <h3 className="font-semibold text-lg">Print Donation Receipt</h3>
                        <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/20 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 sm:p-8">"""
content = re.sub(start_buttons, new_top_header, content, flags=re.DOTALL)

# 2. Fix Office Copy Header Layout
start_office_header = r'<div className="flex items-center gap-4">.*?</div>\n                                </div>'
new_office_header = """<div className="flex gap-6 w-full">
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
                                </div>"""
# Replace the first occurrence (Office Copy)
content = re.sub(start_office_header, new_office_header, content, count=1, flags=re.DOTALL)

# 3. Fix Donor Copy Header Layout
start_donor_header = r'<div className="flex items-center gap-4">.*?</div>\n                                </div>'
new_donor_header = """<div className="flex gap-4 w-full">
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
                                </div>"""
# Replace the second occurrence (Donor Copy)
content = re.sub(start_donor_header, new_donor_header, content, count=1, flags=re.DOTALL)

# 4. Fix Donor Copy Mode of Donation & Gita Quote
start_donor_middle = r'<div className="flex justify-between items-center mt-6 pr-8">.*?<div className="text-center w-36 border-t-\[2px\] border-black pt-1\.5">Receiver Sign</div>'
new_donor_middle = """<div className="flex justify-between items-center mt-6 px-2">
                                    <div className="border-[3px] border-[#166534] rounded-lg px-6 py-2.5 bg-white text-[#166534] font-bold text-[22px] flex items-center gap-4">
                                        <span>₹</span>
                                        <span className="border-b-[2px] border-[#166534] min-w-[120px] text-center px-2 pb-0.5">
                                            {donation.paymentMode === "MATERIALS" ? "MATERIALS" : donation.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="text-center font-bold italic text-slate-800 max-w-sm px-4 leading-relaxed text-[12px]">
                                        {GITA_QUOTES[parseInt((donation.receiptNo || '').replace(new RegExp('\\\\D', 'g'), '') || '0') % GITA_QUOTES.length] || GITA_QUOTES[0]}
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mt-16 text-[12px] font-bold text-black px-8">
                                    <div className="text-center w-36 border-t-[2px] border-black pt-1.5">Receiver Sign</div>"""
content = re.sub(start_donor_middle, new_donor_middle, content, flags=re.DOTALL)

# 5. Insert Modal Buttons at the bottom
start_bottom = r'                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>'
new_bottom = """                    </div>
                    
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
    </div>
</div>"""
content = re.sub(start_bottom, new_bottom, content, flags=re.DOTALL)

with open('d:/ERP/frontend/src/features/uncf_donations/components/DonationReceiptPdf.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
