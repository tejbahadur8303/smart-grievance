import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ShieldCheck, Search, RefreshCw } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/audit-logs');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">System Audit Trail & Compliance</h3>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of state changes, worker actions, officer verifications, and security events.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Resource ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{log.actorName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-orange-700">{log.action}</td>
                  <td className="py-3 px-4 text-slate-600">{log.resource}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{log.resourceId || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
