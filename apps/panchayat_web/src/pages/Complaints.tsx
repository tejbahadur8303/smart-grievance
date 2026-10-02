import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  UserPlus,
  Sparkles,
  MapPin,
  Clock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export const Complaints: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Worker assignment form
  const [assignWorkerId, setAssignWorkerId] = useState('');
  const [assignInstructions, setAssignInstructions] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, workRes] = await Promise.all([
        api.get('/complaints', {
          params: {
            search: search || undefined,
            status: statusFilter || undefined
          }
        }),
        api.get('/auth/workers')
      ]);

      if (compRes.data.success) setComplaints(compRes.data.data);
      if (workRes.data.success && Array.isArray(workRes.data.data)) {
        setWorkers(workRes.data.data);
        if (workRes.data.data.length > 0) {
          setAssignWorkerId((prev) => prev || workRes.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch complaints or workers:', err);
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = async (complaint: any, preserveFeedback = false) => {
    try {
      const res = await api.get(`/complaints/${complaint.complaintId}/timeline`);
      if (res.data.success) {
        setSelectedComplaint(res.data.data);
        if (!preserveFeedback) {
          setActionFeedback(null);
        }
        if (workers.length > 0) {
          setAssignWorkerId((prev) => prev || workers[0]._id);
        }
      }
    } catch (err: any) {
      console.error('Failed to open drawer:', err);
      if (!preserveFeedback) {
        setActionFeedback({
          type: 'error',
          message: err.response?.data?.message || err.message || 'Failed to load complaint details'
        });
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleVerify = async (decision: 'VERIFIED' | 'REJECTED' | 'REQUESTED_INFORMATION') => {
    if (!selectedComplaint) return;
    try {
      setActionLoading(true);
      setActionFeedback(null);
      const res = await api.post(`/complaints/${selectedComplaint.complaint.complaintId}/verify`, {
        decision,
        notes: `Panchayat Sachiv verified on ground. Decision: ${decision}`
      });
      if (res.data.success) {
        setActionFeedback({
          type: 'success',
          message: `Grievance status successfully marked as ${decision}!`
        });
        await openDrawer(selectedComplaint.complaint, true);
        fetchData();
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Action failed'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    // Fallback to first worker if state wasn't populated
    const targetWorkerId = assignWorkerId || (workers.length > 0 ? workers[0]._id : '');
    if (!targetWorkerId) {
      setActionFeedback({
        type: 'error',
        message: 'No field worker selected. Please register a field worker or choose one from the list.'
      });
      return;
    }

    try {
      setActionLoading(true);
      setActionFeedback(null);

      // Safe ISO date parsing
      let parsedDeadline: string | undefined = undefined;
      if (assignDeadline) {
        const d = new Date(assignDeadline);
        if (!isNaN(d.getTime())) {
          parsedDeadline = d.toISOString();
        }
      }

      const res = await api.post(`/complaints/${selectedComplaint.complaint.complaintId}/assign`, {
        workerId: targetWorkerId,
        instructions: assignInstructions.trim() || 'Visit site and fix grievance with proof photos.',
        deadline: parsedDeadline
      });

      if (res.data.success) {
        const targetWorker = workers.find((w) => w._id === targetWorkerId);
        const workerName = targetWorker ? targetWorker.name : 'Field Technician';
        setActionFeedback({
          type: 'success',
          message: `Field technician (${workerName}) dispatched successfully! Status updated to ASSIGNED.`
        });
        setAssignInstructions('');
        setAssignDeadline('');
        await openDrawer(selectedComplaint.complaint, true);
        fetchData();
      }
    } catch (err: any) {
      console.error('Assign worker error:', err);
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Worker assignment failed. Please check server logs.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search village grievances..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Complaints</option>
            <option value="SUBMITTED">SUBMITTED (Pending Review)</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="REOPENED">REOPENED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <button
            onClick={fetchData}
            className="p-2 border rounded-lg hover:bg-slate-50 text-slate-600"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {complaints.map((c) => (
          <div
            key={c._id}
            onClick={() => openDrawer(c)}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                  {c.complaintId}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    c.priority === 'CRITICAL'
                      ? 'bg-red-100 text-red-800'
                      : c.priority === 'HIGH'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {c.priority}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{c.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{c.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{c.villageName || 'Shivpur Khas'}</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                  c.status === 'SUBMITTED'
                    ? 'bg-amber-100 text-amber-900'
                    : c.status === 'CLOSED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Verification & Worker Assignment Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
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

            {actionFeedback && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold flex items-center space-x-2 border transition-all ${
                  actionFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-red-50 border-red-300 text-red-800'
                }`}
              >
                {actionFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span>{actionFeedback.message}</span>
              </div>
            )}

            {/* Currently Dispatched Worker Banner */}
            {selectedComplaint.complaint.assignedWorkerId && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow">
                    {selectedComplaint.complaint.assignedWorkerId.name?.charAt(0) || 'W'}
                  </div>
                  <div>
                    <p className="font-bold text-blue-950">
                      Dispatched Technician: {selectedComplaint.complaint.assignedWorkerId.name} ({selectedComplaint.complaint.assignedWorkerId.phone})
                    </p>
                    <p className="text-blue-700 text-[11px]">
                      Current Grievance Status: <strong className="uppercase">{selectedComplaint.complaint.status}</strong>
                    </p>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                  Active Assignment
                </span>
              </div>
            )}

            {/* AI Reasoning Preview */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase mb-1">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI Departmental Suggestion ({Math.round((selectedComplaint.complaint.aiConfidence || 0.9) * 100)}% Confidence)</span>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed">
                Suggested Category: <strong>{selectedComplaint.complaint.category}</strong> | Department: <strong>{selectedComplaint.complaint.department}</strong>
              </p>
              <p className="text-xs text-slate-600 mt-1 italic">
                AI Reasoning: {selectedComplaint.complaint.aiReasoning || 'Identified based on safety keywords.'}
              </p>
            </div>

            {/* Possible Duplicates Warning */}
            {selectedComplaint.complaint.possibleDuplicates?.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Possible Duplicate Grievance Detected</span>
                </div>
                <p>
                  Similar complaint <strong>{selectedComplaint.complaint.possibleDuplicates[0].complaintId}</strong> ("{selectedComplaint.complaint.possibleDuplicates[0].title}") was logged nearby.
                </p>
              </div>
            )}

            {/* Officer Actions: 1-Click Verification */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wide text-slate-700">Panchayat Officer Actions</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleVerify('VERIFIED')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Grievance</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleVerify('REQUESTED_INFORMATION')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center space-x-1.5"
                >
                  <Clock className="w-4 h-4" />
                  <span>Request More Information</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleVerify('REJECTED')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center space-x-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Out of Scope</span>
                </button>
              </div>
            </div>

            {/* Field Worker Assignment Form */}
            <form onSubmit={handleAssignWorker} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold uppercase tracking-wide text-slate-700 flex items-center space-x-1.5">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>Assign Field Technician</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700">Select Field Worker</label>
                  <select
                    value={assignWorkerId || (workers[0]?._id ?? '')}
                    onChange={(e) => setAssignWorkerId(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={workers.length === 0 || actionLoading}
                  >
                    {workers.length === 0 ? (
                      <option value="">No field workers registered</option>
                    ) : (
                      workers.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.name} ({w.phone}) - {w.assignedTasksCount || 0} active tasks
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700">Completion Deadline</label>
                  <input
                    type="datetime-local"
                    value={assignDeadline}
                    onChange={(e) => setAssignDeadline(e.target.value)}
                    disabled={actionLoading}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">Special Instructions for Worker</label>
                <input
                  type="text"
                  placeholder="e.g. Inspect pipeline joint near school and upload before/after photos"
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  disabled={actionLoading}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Inline Form Feedback Banner */}
              {actionFeedback && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 border transition-all ${
                    actionFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-red-50 border-red-300 text-red-800'
                  }`}
                >
                  {actionFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{actionFeedback.message}</span>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={actionLoading || workers.length === 0}
                  className={`px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow transition-all flex items-center space-x-2 ${
                    actionLoading || workers.length === 0 ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Dispatching Work Order...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Dispatch Work Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Work Orders List if present */}
            {selectedComplaint.tasks && selectedComplaint.tasks.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wide text-slate-700">
                  Dispatched Work Orders ({selectedComplaint.tasks.length})
                </h4>
                <div className="space-y-2">
                  {selectedComplaint.tasks.map((t: any) => (
                    <div key={t._id} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-800">{t.taskId}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">{t.instructions}</p>
                      </div>
                      {t.deadline && (
                        <span className="text-[11px] text-slate-400">
                          Due: {new Date(t.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
