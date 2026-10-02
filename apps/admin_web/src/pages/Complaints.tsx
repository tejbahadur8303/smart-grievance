import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Complaint } from '../types';
import {
  Search,
  Filter,
  AlertCircle,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  MapPin,
  RefreshCw
} from 'lucide-react';

export const Complaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined
        }
      });
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (complaintId: string) => {
    try {
      const res = await api.get(`/complaints/${complaintId}/timeline`);
      if (res.data.success) {
        setSelectedComplaint(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, keyword, village or citizen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </form>

        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="REOPENED">REOPENED</option>
            <option value="ESCALATED">ESCALATED</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <button
            onClick={fetchComplaints}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Grievance Code</th>
                <th className="py-3 px-4">Title & Category</th>
                <th className="py-3 px-4">Village</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No grievances found matching the current criteria.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800 text-xs">
                      {c.complaintId}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 line-clamp-1">{c.title}</p>
                      <p className="text-xs text-slate-500">{c.category}</p>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {c.villageName || 'Shivpur Khas'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          c.priority === 'CRITICAL'
                            ? 'bg-red-100 text-red-700'
                            : c.priority === 'HIGH'
                            ? 'bg-orange-100 text-orange-700'
                            : c.priority === 'MEDIUM'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          c.status === 'CLOSED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'RESOLVED'
                            ? 'bg-green-100 text-green-700'
                            : c.status === 'ESCALATED'
                            ? 'bg-red-200 text-red-900 font-bold animate-pulse'
                            : c.status === 'REOPENED'
                            ? 'bg-amber-100 text-amber-900 font-bold'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-500">
                      {c.source === 'VOICE' ? '🎙️ Voice' : '⌨️ Text'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openDetail(c.complaintId)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Drawer for Inspection */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs font-bold font-mono px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                  {selectedComplaint.complaint.complaintId}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedComplaint.complaint.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* AI Explanation Box */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-orange-800 font-bold text-xs uppercase mb-1">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>AI Automated Assessment ({Math.round((selectedComplaint.complaint.aiConfidence || 0.9) * 100)}% Confidence)</span>
              </div>
              <p className="text-xs text-orange-950 leading-relaxed">
                {selectedComplaint.complaint.aiReasoning || 'Issue classified based on rural emergency safety hazards and affected population density.'}
              </p>
            </div>

            {/* Complaint Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-semibold text-slate-800">{selectedComplaint.complaint.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Citizen</span>
                <span className="font-semibold text-slate-800">{selectedComplaint.complaint.citizenId?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Assigned Worker</span>
                <span className="font-semibold text-slate-800">{selectedComplaint.complaint.assignedWorkerId?.name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Citizen Verified</span>
                <span className="font-semibold text-slate-800">{selectedComplaint.complaint.isCitizenVerified ? '✅ Yes (Closed)' : '⏳ Pending'}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Description</h4>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed">
                {selectedComplaint.complaint.description}
              </p>
              {selectedComplaint.complaint.transcript && (
                <div className="mt-2 text-xs bg-amber-50 border border-amber-200 p-2 rounded text-amber-900">
                  <strong>Audio Transcript:</strong> "{selectedComplaint.complaint.transcript}"
                </div>
              )}
            </div>

            {/* Audit Trail Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Audit Timeline & Proof of Work</h4>
              <div className="space-y-3">
                {selectedComplaint.updates?.map((u: any, idx: number) => (
                  <div key={idx} className="flex space-x-3 text-xs border-l-2 border-orange-500 pl-3 py-1">
                    <div>
                      <span className="font-bold text-slate-800">{u.changedByName}</span> ({u.changedByRole}): {u.message}
                      {u.notes && <p className="text-slate-500 mt-0.5 italic">"{u.notes}"</p>}
                      <span className="text-[10px] text-slate-400 block mt-1">{new Date(u.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
