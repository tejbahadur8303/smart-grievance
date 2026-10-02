import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Gift, Plus, CheckCircle, Clock, FileText, ChevronRight } from 'lucide-react';

export const WelfareSchemes: React.FC = () => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newScheme, setNewScheme] = useState({
    code: '',
    name: '',
    hindiName: '',
    department: '',
    description: '',
    benefits: '',
    eligibilityCriteria: '',
    requiredDocuments: '',
    financialAssistanceAmount: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schemesRes, appsRes] = await Promise.all([
        api.get('/welfare/schemes?all=true'),
        api.get('/welfare/applications')
      ]);
      if (schemesRes.data.success) setSchemes(schemesRes.data.data);
      if (appsRes.data.success) setApplications(appsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newScheme,
        eligibilityCriteria: newScheme.eligibilityCriteria.split(',').map((s) => s.trim()),
        requiredDocuments: newScheme.requiredDocuments.split(',').map((s) => s.trim())
      };
      const res = await api.post('/welfare/schemes', payload);
      if (res.data.success) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Village Welfare & Subsidy Schemes</h3>
          <p className="text-xs text-slate-500 mt-1">
            Configure rural public schemes, eligibility requirements, and monitor citizen applications.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-all shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add Welfare Scheme</span>
        </button>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {schemes.map((s) => (
          <div key={s._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                {s.code}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active Scheme
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-base">{s.name}</h4>
            {s.hindiName && <p className="text-xs text-slate-500 font-medium">{s.hindiName}</p>}
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{s.description}</p>
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-700 space-y-1">
              <p><strong>Benefit:</strong> {s.benefits}</p>
              {s.financialAssistanceAmount > 0 && (
                <p><strong>Direct Subsidy:</strong> ₹{s.financialAssistanceAmount.toLocaleString('en-IN')}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Citizen Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Citizen Applications Queue ({applications.length})
          </h4>
        </div>
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
              <th className="py-3 px-4">Application ID</th>
              <th className="py-3 px-4">Applicant</th>
              <th className="py-3 px-4">Scheme</th>
              <th className="py-3 px-4">Village</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {applications.map((app) => (
              <tr key={app._id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-semibold text-slate-800">{app.applicationId}</td>
                <td className="py-3 px-4 font-medium text-slate-900">{app.applicantName} ({app.applicantPhone})</td>
                <td className="py-3 px-4 text-slate-700">{app.schemeName}</td>
                <td className="py-3 px-4 text-slate-600">{app.villageName || 'Shivpur Khas'}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded font-semibold ${
                    app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500 italic">{app.officerRemarks || 'Under physical verification'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add New Rural Welfare Scheme</h3>
            <form onSubmit={handleCreateScheme} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Scheme Code (e.g. PM-KISAN-2026)</label>
                <input
                  type="text"
                  required
                  value={newScheme.code}
                  onChange={(e) => setNewScheme({ ...newScheme, code: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Scheme Name (English)</label>
                <input
                  type="text"
                  required
                  value={newScheme.name}
                  onChange={(e) => setNewScheme({ ...newScheme, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Responsible Department</label>
                <input
                  type="text"
                  required
                  value={newScheme.department}
                  onChange={(e) => setNewScheme({ ...newScheme, department: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Benefits Description</label>
                <input
                  type="text"
                  required
                  value={newScheme.benefits}
                  onChange={(e) => setNewScheme({ ...newScheme, benefits: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Eligibility Criteria (comma-separated)</label>
                <textarea
                  required
                  rows={2}
                  value={newScheme.eligibilityCriteria}
                  onChange={(e) => setNewScheme({ ...newScheme, eligibilityCriteria: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded font-bold hover:bg-orange-700"
                >
                  Publish Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
