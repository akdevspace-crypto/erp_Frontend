// @ts-nocheck
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, CheckCircle, AlertCircle, FileText, Download } from 'lucide-react';
import { api } from '../../../lib/axios';
import html2pdf from 'html2pdf.js';

export function ClosureDialog({ admission, isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: closureData, isLoading, isError, error: queryError } = useQuery({
        queryKey: ['closure', admission?.id],
        queryFn: async () => {
            const res = await api.post(`/closing-agreements/admission/${admission.id}`);
            return res.data?.data;
        },
        enabled: isOpen && !!admission,
    });

    const clearanceMutation = useMutation({
        mutationFn: async ({ id, type, notes }) => {
            await api.patch(`/closing-agreements/${id}/clearance`, { type, notes });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['closure', admission?.id] });
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Unable to complete clearance. Please try again.');
        }
    });

    const executeMutation = useMutation({
        mutationFn: async ({ id, closingRemarks }) => {
            await api.post(`/closing-agreements/${id}/execute`, { closingRemarks });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['closure', admission?.id] });
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
            onClose();
        }
    });

    if (!isOpen) return null;

    const handleClearance = (type) => {
        if (!closureData) return;
        setError(null);
        
        if (type === 'FINANCE' && closureData.outstandingBalance > 0) {
            setError(`Finance clearance cannot be completed. Outstanding balance: Rs. ${closureData.outstandingBalance.toFixed(2)}`);
            return;
        }

        clearanceMutation.mutate({ id: closureData.id, type, notes: 'Cleared via UI' });
    };

    const handleExecute = async () => {
        if (!closureData || closureData.status !== 'READY') return;
        
        setIsGenerating(true);
        try {
            // Generate PDF
            const element = document.getElementById('closure-pdf-content');
            const pdfBlob = await html2pdf().from(element).outputPdf('blob');
            
            // We upload via FileStorage if needed here.
            // For now just executing the backend transaction
            await executeMutation.mutateAsync({ id: closureData.id, closingRemarks: 'Closure executed and PDF generated.' });
            
            // Optionally auto-download the PDF
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Closure_Agreement_${admission.patient?.name}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0A2429]">
                <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Service Closing Agreement</h3>
                        <p className="mt-1 text-sm text-gray-500">Patient: {admission?.patient?.name}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="py-8 text-center">Loading closure details...</div>
                ) : isError || !closureData ? (
                    <div className="py-12 text-center text-red-600 dark:text-red-400">
                        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Unable to load Service Closing Agreement</h4>
                        <p className="mt-2 text-sm">
                            {queryError?.response?.data?.message || queryError?.message || 'Unable to load service closing agreement.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                            {/* Medical */}
                            <div className="rounded-xl border p-4 dark:border-gray-800">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Medical</h4>
                                <div className="mt-2 text-sm text-gray-500">
                                    {closureData?.medicalCleared ? (
                                        <span className="flex items-center text-green-600"><CheckCircle className="mr-1 h-4 w-4" /> Cleared</span>
                                    ) : (
                                        <button onClick={() => handleClearance('MEDICAL')} className="rounded bg-blue-50 px-2 py-1 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">Clear Medical</button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Finance */}
                            <div className="rounded-xl border p-4 dark:border-gray-800">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Finance</h4>
                                <div className="mt-1 text-xs text-gray-500">
                                    Balance: Rs {closureData?.outstandingBalance?.toFixed(2) || '0.00'}
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                    {closureData?.financeCleared ? (
                                        <span className="flex items-center text-green-600"><CheckCircle className="mr-1 h-4 w-4" /> Cleared</span>
                                    ) : (
                                        <button onClick={() => handleClearance('FINANCE')} className="rounded bg-blue-50 px-2 py-1 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">Clear Finance</button>
                                    )}
                                </div>
                            </div>

                            {/* Asset */}
                            <div className="rounded-xl border p-4 dark:border-gray-800">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Asset / Inventory</h4>
                                <div className="mt-2 text-sm text-gray-500">
                                    {closureData?.assetCleared ? (
                                        <span className="flex items-center text-green-600"><CheckCircle className="mr-1 h-4 w-4" /> Cleared</span>
                                    ) : (
                                        <button onClick={() => handleClearance('ASSET')} className="rounded bg-blue-50 px-2 py-1 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">Clear Asset</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                                Cancel
                            </button>
                            <button
                                onClick={handleExecute}
                                disabled={closureData?.status !== 'READY' || isGenerating || executeMutation.isPending}
                                className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                            >
                                <Download className="h-4 w-4" />
                                {isGenerating ? 'Executing...' : 'Execute & Generate PDF'}
                            </button>
                        </div>

                        {/* Hidden PDF Content */}
                        <div className="hidden">
                            <div id="closure-pdf-content" className="p-8 text-black bg-white">
                                <h1 className="text-2xl font-bold mb-4">Service Closing Agreement</h1>
                                <p className="mb-2"><strong>Patient Name:</strong> {admission?.patient?.name}</p>
                                <p className="mb-2"><strong>Date of Admission:</strong> {new Date(admission?.admittedAt).toLocaleDateString()}</p>
                                <p className="mb-2"><strong>Date of Discharge:</strong> {new Date().toLocaleDateString()}</p>
                                <div className="mt-8 border-t pt-4">
                                    <h3 className="font-bold text-lg mb-2">Clearances</h3>
                                    <ul>
                                        <li>Medical: {closureData?.medicalCleared ? 'Cleared' : 'Pending'}</li>
                                        <li>Finance: {closureData?.financeCleared ? 'Cleared' : 'Pending'}</li>
                                        <li>Asset: {closureData?.assetCleared ? 'Cleared' : 'Pending'}</li>
                                    </ul>
                                </div>
                                <div className="mt-12 flex justify-between">
                                    <div className="text-center"><div className="border-b border-black w-32 mb-2"></div><p>Authorized Signature</p></div>
                                    <div className="text-center"><div className="border-b border-black w-32 mb-2"></div><p>Client Signature</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
