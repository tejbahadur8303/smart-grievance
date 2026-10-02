import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Gift, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export const Welfare: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/welfare/applications');
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleReview = async (decision: 'APPROVED' | 'REJECTED' | 'DOCUMENTS_REQUESTED') => {
    if (!selectedApp) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/welfare/applications/${selectedApp.applicationId}/review`, {
        decision,
        remarks: decisionRemarks || `Reviewed and ${decision.toLowerCase()} by Panchayat Sachiv.`
      });
      if (res.data.success) {
        setMsg(`Application ${decision} successfully.`);
        setSelectedApp(null);
        setDecisionRemarks('');
        fetchApplications();
      }
    } catch (err: any) {
      setMsg(err.message || 'Review failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Welfare & Pension Beneficiary Desk</h3>
        <p className="text-xs text-slate-500 mt-1">
          Verify rural applicant eligibility, examine income & land certificates, and authorize direct benefit eligibility.
        </p>
      </div>

      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-semibold">
          {msg}
        </div>
      )}

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
              <th className="py-3 px-4">Application Code</th>
              <th className="py-3 px-4">Applicant</th>
              <th className="py-3 px-4">Scheme</th>
              <th className="py-3 px-4">Village</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {applications.map((app) => (
              <tr key={app._id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-800">{app.applicationId}</td>
                <td className="py-3 px-4 font-medium text-slate-900">{app.applicantName} ({app.applicantPhone})</td>
                <td className="py-3 px-4 text-slate-700 font-semibold">{app.schemeName}</td>
                <td className="py-3 px-4 text-slate-500">{app.villageName || 'Shivpur Khas'}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full font-semibold ${
                    app.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : app.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setDecisionRemarks('');
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition-all shadow"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono font-bold text-slate-500">{selectedApp.applicationId}</span>
                <h4 className="font-bold text-slate-900 text-sm">{selectedApp.schemeName}</h4>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg space-y-1">
              <p><strong>Applicant Name:</strong> {selectedApp.applicantName}</p>
              <p><strong>Mobile Number:</strong> {selectedApp.applicantPhone}</p>
              <p><strong>Social Category:</strong> {selectedApp.category}</p>
              {selectedApp.annualIncome && <p><strong>Reported Income:</strong> ₹{selectedApp.annualIncome}/yr</p>}
            </div>

            <div>
              <label className="font-bold block mb-1">Sachiv Verification Remarks</label>
              <textarea
                rows={3}
                placeholder="Enter verification notes, e.g. Khatauni land records verified or physical site verified..."
                value={decisionRemarks}
                onChange={(e) => setDecisionRemarks(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => handleReview('REJECTED')}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold"
              >
                Reject
              </button>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleReview('DOCUMENTS_REQUESTED')}
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold"
                >
                  Request Docs
                </button>
                <button
                  type="button"
                  onClick={() => handleReview('APPROVED')}
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold shadow"
                >
                  Approve Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
