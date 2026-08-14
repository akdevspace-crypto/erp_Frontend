import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDonations } from '../services';
import { Plus, Search, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { DonationReceiptPdf } from '../components/DonationReceiptPdf';

export const DonationList = () => {
    const [search, setSearch] = useState('');
    const [selectedDonationId, setSelectedDonationId] = useState<string | null>(null);

    const { data: donations, isLoading } = useQuery({
        queryKey: ['uncf-donations'],
        queryFn: getDonations
    });

    const filtered = (donations || []).filter(d => 
        d.donor?.name?.toLowerCase().includes(search.toLowerCase()) || 
        d.receiptNo?.toLowerCase().includes(search.toLowerCase()) ||
        d.donor?.mobile?.includes(search)
    );

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">UNCF Donations</h1>
                    <p className="text-sm text-slate-500">Manage donation receipts and CRM leads</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search donors..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 w-64 rounded-xl border border-slate-200 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                    </div>
                    <a
                        href="/uncf/donations/new"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                    >
                        <Plus size={18} />
                        New Receipt
                    </a>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Receipt No</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Donor Name</th>
                                <th className="px-6 py-4 font-semibold">Mobile</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                <th className="px-6 py-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No donations found</td>
                                </tr>
                            ) : (
                                filtered.map(donation => (
                                    <tr key={donation.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-700">{donation.receiptNo}</td>
                                        <td className="px-6 py-4 text-slate-600">{format(new Date(donation.date), 'dd MMM yyyy')}</td>
                                        <td className="px-6 py-4 text-slate-800">{donation.donor?.name || 'Anonymous'}</td>
                                        <td className="px-6 py-4 text-slate-600">{donation.donor?.mobile || '-'}</td>
                                        <td className="px-6 py-4 text-slate-600">{donation.category || '-'}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-slate-800">
                                            ₹{donation.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedDonationId(donation.id)}
                                                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                            >
                                                <FileText size={14} />
                                                View Receipt
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedDonationId && (
                <DonationReceiptPdf 
                    donationId={selectedDonationId} 
                    onClose={() => setSelectedDonationId(null)} 
                />
            )}
        </div>
    );
};

