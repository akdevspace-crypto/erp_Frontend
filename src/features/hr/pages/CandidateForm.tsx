import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader';
import { Save, ArrowLeft, Upload } from 'lucide-react';
import { api } from '../../../lib/axios';

const InputGroup = ({ label, children }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
      {label}
    </label>
    {children}
  </div>
);

export function CandidateForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = id && id !== 'new';
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    initialCallNotes: '',
    serialNo: '',
    addressingAgent: '',
    leadSource: '',
    name: '',
    colloquialName: '',
    age: '',
    gender: 'Male',
    mobileNo: '',
    alternativeMobile: '',
    qualification: '',
    experience: '',
    address: '',
    
    prevLocation: '',
    prevCompany: '',
    prevRoleDuration: '',
    prevSalary: '',
    prevSalaryProof: '',
    prevHRContact: '',
    prevExpCertificate: '',
    prevWorkTiming: '',
    prevRelievingDetails: '',
    
    policeComplaint: 'No',
    policeComplaintDetails: '',
    healthCondition: '',
    
    preferredRole: '',
    preferredTime: '',
    preferredSalary: '',
    dayOrStay: 'Day',
    
    resumeUrl: '',
    socialDocs: '',
    references: '',
    
    onCallNote: '',
    interviewDate: '',
    afterInterviewNote: '',
    characterNote: '',

    jobPlacingDetails: '',
    jobRolesResponsibility: '',
    jobSalary: '',
    jobTimingLeave: '',
    jobComplaintPlan: '',
    regularDailyNotes: ''
  });

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      api.get('/hr/candidates').then(res => {
        const candidate = res.data.data.find((c: any) => c.id === id);
        if (candidate) {
          setFormData({
            ...formData,
            serialNo: candidate.serialNo || '',
            name: candidate.name || '',
            mobileNo: candidate.mobileNo || '',
            preferredRole: candidate.preferredRole || '',
            addressingAgent: candidate.sourceAgent || '',
            ...candidate.details
          });
        }
        setLoading(false);
      });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        serialNo: formData.serialNo,
        name: formData.name,
        mobileNo: formData.mobileNo,
        preferredRole: formData.preferredRole,
        sourceAgent: formData.addressingAgent,
        details: formData
      };

      if (isEditing) {
        await api.patch(`/hr/candidates/${id}`, payload);
      } else {
        await api.post('/hr/candidates', payload);
      }
      navigate('/hr/recruitment');
    } catch (error: any) {
      alert("Failed to save: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border rounded-lg p-3 dark:bg-slate-900 dark:border-slate-700 focus:border-[#0F969C] focus:ring-1 focus:ring-[#0F969C] transition-colors";

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={isEditing ? "Edit Candidate" : "Add New Candidate"}
        breadcrumbs={[
          { label: "HR" },
          { label: "Recruitment Pipeline", href: "/hr/recruitment" },
          { label: isEditing ? "Edit" : "New" }
        ]}
      />
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          
          {/* Action Bar */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => navigate('/hr/recruitment')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-[#0F969C] hover:bg-[#0c7a80] text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <Save className="w-5 h-5" /> {loading ? "Saving..." : "Save Candidate"}
            </button>
          </div>

          <div className="space-y-12">
            
            {/* Quick Notes */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r-xl">
              <label className="block text-sm font-bold text-yellow-800 dark:text-yellow-500 mb-2">
                ⚡ Quick Call Notes (Scratchpad)
              </label>
              <p className="text-xs text-yellow-700/80 dark:text-yellow-600 mb-3">Use this to rapidly type unstructured notes while talking to the candidate on the phone. You can organize it into the fields below later.</p>
              <textarea 
                name="initialCallNotes" 
                value={formData.initialCallNotes} 
                onChange={handleChange} 
                rows={4}
                className="w-full border-none rounded-lg p-4 bg-white dark:bg-slate-900 shadow-inner placeholder-slate-400 focus:ring-2 focus:ring-yellow-400" 
                placeholder="E.g. Wants 40k salary, worked at Apollo, has 2 kids..."
              />
            </div>

            {/* 1. Basic Info */}
            <section className="flex flex-col gap-5">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">1. Basic Details</h2>
              
              <InputGroup label="1. Serial No">
                <input name="serialNo" value={formData.serialNo} onChange={handleChange} className={inputClass} placeholder="Auto-generated if empty" />
              </InputGroup>
              <InputGroup label="2. Addressing Agent Name">
                <input name="addressingAgent" value={formData.addressingAgent} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="3. Lead Generated From">
                <select name="leadSource" value={formData.leadSource} onChange={handleChange} className={inputClass}>
                  <option value="">Select Source...</option>
                  <option>WhatsApp</option>
                  <option>Facebook</option>
                  <option>Reference</option>
                  <option>Walk-in</option>
                  <option>Other</option>
                </select>
              </InputGroup>
              <InputGroup label="4. Official Name">
                <input name="name" value={formData.name} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="5. Colloquial Name (Nickname)">
                <input name="colloquialName" value={formData.colloquialName} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="6. Age & Sex">
                <div className="flex gap-4">
                  <input name="age" value={formData.age} onChange={handleChange} placeholder="Age" className={`w-1/2 ${inputClass}`} />
                  <select name="gender" value={formData.gender} onChange={handleChange} className={`w-1/2 ${inputClass}`}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </InputGroup>
              <InputGroup label="7. Mobile No">
                <input name="mobileNo" value={formData.mobileNo} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="8. Alternative Mobile & Family No">
                <input name="alternativeMobile" value={formData.alternativeMobile} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="9. Qualification & Experience">
                <input name="qualification" value={formData.qualification} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="10. Full Address">
                <textarea name="address" value={formData.address} onChange={handleChange} className={inputClass} rows={3}></textarea>
              </InputGroup>
            </section>

            {/* 2. Employment History */}
            <section className="flex flex-col gap-5">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">2. Previous Employment</h2>
              <InputGroup label="12. Previous Location">
                <input name="prevLocation" value={formData.prevLocation} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="13. Company Details">
                <input name="prevCompany" value={formData.prevCompany} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="14. Duty Role & Duration of Work">
                <input name="prevRoleDuration" value={formData.prevRoleDuration} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="15. Salary">
                <input name="prevSalary" value={formData.prevSalary} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="16. Proof of Salary">
                <input name="prevSalaryProof" value={formData.prevSalaryProof} onChange={handleChange} className={inputClass} placeholder="E.g. Bank Statement, Payslip" />
              </InputGroup>
              <InputGroup label="17. HR Contact / Company Contact">
                <input name="prevHRContact" value={formData.prevHRContact} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="18. Experience Certificate">
                <input name="prevExpCertificate" value={formData.prevExpCertificate} onChange={handleChange} className={inputClass} placeholder="Yes/No or Details" />
              </InputGroup>
              <InputGroup label="19. Work Timing">
                <input name="prevWorkTiming" value={formData.prevWorkTiming} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="20. Relieving Details">
                <textarea name="prevRelievingDetails" value={formData.prevRelievingDetails} onChange={handleChange} className={inputClass} rows={2}></textarea>
              </InputGroup>
            </section>

            {/* 3. Verification & Preferences */}
            <section className="flex flex-col gap-5">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">3. Verification & Preferences</h2>
              <InputGroup label="21. Police Complain (Yes/No) - If yes, what?">
                <div className="flex gap-4">
                  <select name="policeComplaint" value={formData.policeComplaint} onChange={handleChange} className={`w-1/3 ${inputClass}`}>
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                  {formData.policeComplaint === 'Yes' && (
                    <input name="policeComplaintDetails" value={formData.policeComplaintDetails} onChange={handleChange} placeholder="Complaint Details" className={`w-2/3 ${inputClass}`} />
                  )}
                </div>
              </InputGroup>
              <InputGroup label="22. Health Condition & Illness">
                <input name="healthCondition" value={formData.healthCondition} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="23. Preferred Working Role">
                <input name="preferredRole" value={formData.preferredRole} onChange={handleChange} className={inputClass} placeholder="E.g. Maid, Cook, Nurse" />
              </InputGroup>
              <InputGroup label="24. Preferred Working Time">
                <input name="preferredTime" value={formData.preferredTime} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="25. Preferred Working Salary">
                <input name="preferredSalary" value={formData.preferredSalary} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="26. Day or Stay?">
                <select name="dayOrStay" value={formData.dayOrStay} onChange={handleChange} className={inputClass}>
                  <option value="">Select...</option>
                  <option>Day</option>
                  <option>Stay</option>
                </select>
              </InputGroup>
              <InputGroup label="27. Resume Attachment">
                <div className="flex items-center gap-4">
                  <button type="button" className="flex items-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full justify-center">
                    <Upload className="w-5 h-5" /> Upload Document
                  </button>
                  <input type="hidden" name="resumeUrl" value={formData.resumeUrl} />
                </div>
              </InputGroup>
              <InputGroup label="28. Social Documents (Aadhar, Marksheet, Any Doc)">
                <textarea name="socialDocs" value={formData.socialDocs} onChange={handleChange} className={inputClass} rows={2} placeholder="List verified documents here..."></textarea>
              </InputGroup>
              <InputGroup label="29. Minimum 5 Reference Names & Numbers">
                <textarea name="references" value={formData.references} onChange={handleChange} className={inputClass} rows={4} placeholder="1. Name - Number&#10;2. Name - Number..."></textarea>
              </InputGroup>
            </section>

            {/* 4. Interview Process */}
            <section className="flex flex-col gap-5">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">4. Interview & Agent Notes</h2>
              <InputGroup label="30. On Call Note by Interview Agent">
                <textarea name="onCallNote" value={formData.onCallNote} onChange={handleChange} className={inputClass} rows={3}></textarea>
              </InputGroup>
              <InputGroup label="31. Date of Interview Schedule (If physical)">
                <input type="datetime-local" name="interviewDate" value={formData.interviewDate} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="32. After Interview Notes by Agent">
                <textarea name="afterInterviewNote" value={formData.afterInterviewNote} onChange={handleChange} className={inputClass} rows={3}></textarea>
              </InputGroup>
              <InputGroup label="33. Character Notes by Agent">
                <textarea name="characterNote" value={formData.characterNote} onChange={handleChange} className={inputClass} rows={3}></textarea>
              </InputGroup>
            </section>

            {/* 5. Placement Details */}
            <section className="flex flex-col gap-5 bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800/50">
              <h2 className="text-xl font-extrabold text-green-800 dark:text-green-500 pb-2 border-b border-green-200 dark:border-green-800/50">5. Final Placement Details</h2>
              <p className="text-sm text-green-700 dark:text-green-600 mb-2">Fill this section only when the candidate is successfully placed.</p>
              
              <InputGroup label="1. Job Placing Details">
                <input name="jobPlacingDetails" value={formData.jobPlacingDetails} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="2. Job Roles & Responsibilities">
                <input name="jobRolesResponsibility" value={formData.jobRolesResponsibility} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="3. Job Salary">
                <input name="jobSalary" value={formData.jobSalary} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="4. Job Timing & Leave">
                <input name="jobTimingLeave" value={formData.jobTimingLeave} onChange={handleChange} className={inputClass} />
              </InputGroup>
              <InputGroup label="5. Job Complaint / Deficit Plan (by agent)">
                <textarea name="jobComplaintPlan" value={formData.jobComplaintPlan} onChange={handleChange} className={inputClass} rows={2}></textarea>
              </InputGroup>
              <InputGroup label="7. Regular Notes on Daily Basis">
                <textarea name="regularDailyNotes" value={formData.regularDailyNotes} onChange={handleChange} className={inputClass} rows={3}></textarea>
              </InputGroup>
            </section>

          </div>

          {/* Bottom Action Bar */}
          <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-[#0F969C] hover:bg-[#0c7a80] text-white px-10 py-4 rounded-xl font-bold shadow-xl transition-transform hover:scale-105 active:scale-95 text-lg"
            >
              <Save className="w-6 h-6" /> {loading ? "Saving..." : "Save Candidate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
