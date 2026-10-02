import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Complaint } from '../types';
import { AlertTriangle, Clock, ShieldAlert, Play, CheckCircle } from 'lucide-react';

export const Escalations: React.FC = () => {
  const [escalations, setEscalations] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/escalations');
      if (res.data.success) {
        setEscalations(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerScan = async () => {
    try {
      setChecking(true);
      const res = await api.post('/escalations/check');
      if (res.data.success) {
        setFeedback(res.data.message);
        fetchEscalations();
      }
    } catch (err: any) {
      setFeedback(err.message || 'Escalation scan failed');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-red-50 border border-red-200 p-6 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-red-700 font-bold text-base">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <span>SLA Violation & Auto-Escalation Engine</span>
          </div>
          <p className="text-xs text-red-800 mt-1 max-w-2xl">
            Complaints that exceed permissible category SLA hours are automatically escalated:
            Level 1 (Officer Alert) &rarr; Level 2 (BDO / Panchayat Head) &rarr; Level 3 (District Magistrate Intervention).
          </p>
        </div>

        <button
          onClick={triggerScan}
          disabled={checking}
          className="flex items-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{checking ? 'Scanning...' : 'Run SLA Scan Now'}</span>
        </button>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs font-semibold">
          {feedback}
        </div>
      )}

      {/* Escalations List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Active Escalated Cases ({escalations.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {escalations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No unresolved complaints have breached SLA thresholds at this time.
            </div>
          ) : (
            escalations.map((item) => (
              <div key={item._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {item.complaintId}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                      {item.escalationLevel}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {item.villageName || 'Shivpur Khas'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-1">{item.description}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block font-medium">Responsible Department</span>
                    <span className="font-semibold text-slate-800">{item.department}</span>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-red-500 block font-medium">SLA Deadline</span>
                    <span className="font-mono font-semibold text-red-700">
                      {item.deadline ? new Date(item.deadline).toLocaleString() : 'Breached'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
