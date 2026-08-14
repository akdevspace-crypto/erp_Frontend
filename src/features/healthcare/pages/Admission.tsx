import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { api } from '../../../lib/axios';
import { PatientSelector } from '../../../components/PatientSelector';
import { MasterDataSelector } from '../../../components/MasterDataSelector';
import { Select } from '../../../components/Select';
;

export default function Admission() {
    const [formData, setFormData] = useState({
        patientId: '',
        admissionPriority: '',
        healthCondition: '',
        clinicalStatus: '',
        unitId: '',
        floor: '',
        room: '',
        bed: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
        setSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.patientId) {
            setError('Please select a patient to admit');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            await api.post('/operations/admissions', formData);
            
            setSuccess(true);
            setFormData({
                patientId: '', admissionPriority: '', healthCondition: '', clinicalStatus: '',
                unitId: '', floor: '', room: '', bed: ''
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to complete admission');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-auto bg-gray-50/50 p-6 dark:bg-[#0A2429]">
            <PageHeader
                title="Patient Admission"
                subtitle="Process admission and allocate beds for residents"
            />

            <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-4xl space-y-6">
                {error && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}
                
                {success && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm font-medium flex-1">Admission completed successfully!</p>
                        <button onClick={() => setSuccess(false)} className="text-emerald-500 hover:text-emerald-700 font-bold">X</button>
                    </div>
                )}

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#6DA5C0]/20 dark:bg-[#0B2A30]">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-[#8FB7C8]">
                        Patient Selection
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <PatientSelector
                                value={formData.patientId}
                                onChange={(id) => handleChange('patientId', id)}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#6DA5C0]/20 dark:bg-[#0B2A30]">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-[#8FB7C8]">
                        Clinical Status
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        <Select
                            label="Admission Priority"
                            value={formData.admissionPriority}
                            onChange={(e) => handleChange('admissionPriority', e.target.value)}
                            options={[
                                { value: 'High', label: 'High Priority' },
                                { value: 'Normal', label: 'Normal Priority' },
                                { value: 'Low', label: 'Low Priority' }
                            ]}
                            placeholder="Select priority"
                        />
                        <Select
                            label="Health Condition"
                            value={formData.healthCondition}
                            onChange={(e) => handleChange('healthCondition', e.target.value)}
                            options={[
                                { value: 'Stable', label: 'Stable' },
                                { value: 'Critical', label: 'Critical' },
                                { value: 'Observation', label: 'Under Observation' }
                            ]}
                            placeholder="Select condition"
                        />
                        <div className="md:col-span-2">
                            <Select
                                label="Clinical Status"
                                value={formData.clinicalStatus}
                                onChange={(e) => handleChange('clinicalStatus', e.target.value)}
                                options={[
                                    { value: 'Active', label: 'Active Care' },
                                    { value: 'Palliative', label: 'Palliative' },
                                    { value: 'Rehabilitation', label: 'Rehabilitation' }
                                ]}
                                placeholder="Select status"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#6DA5C0]/20 dark:bg-[#0B2A30]">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-[#8FB7C8]">
                        Bed Allocation
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        <MasterDataSelector type="units" value={formData.unitId} onChange={(id) => handleChange('unitId', id)} />
                        <MasterDataSelector type="floors" parentId={formData.unitId} value={formData.floor} onChange={(id) => handleChange('floor', id)} />
                        <MasterDataSelector type="rooms" parentId={formData.floor} value={formData.room} onChange={(id) => handleChange('room', id)} />
                        <MasterDataSelector type="beds" parentId={formData.room} value={formData.bed} onChange={(id) => handleChange('bed', id)} />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-xl bg-[#0F969C] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#0A7075] hover:shadow focus:outline-none focus:ring-2 focus:ring-[#0F969C]/50 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Complete Admission'}
                    </button>
                </div>
            </form>
        </div>
    );
}

