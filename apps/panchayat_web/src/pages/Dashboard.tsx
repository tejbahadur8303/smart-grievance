import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Gift,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, compRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/complaints?limit=5')
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (compRes.data.success) setRecentComplaints(compRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <span className="ml-3 text-sm text-slate-600 font-medium">Syncing Gram Panchayat records...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unverified Inbound</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.submitted || 0}</h3>
            <p className="text-xs text-orange-600 mt-1">Requires Sachiv verification</p>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Field Work In Progress</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats?.inProgress || 0}</h3>
            <p className="text-xs text-slate-400 mt-1">Assigned to technicians</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Citizen Closure</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats?.resolved || 0}</h3>
            <p className="text-xs text-slate-400 mt-1">Work finished by worker</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Citizen Reopened</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">{stats?.reopened || 0}</h3>
            <p className="text-xs text-red-500 mt-1">Dissatisfied with work</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Inbound Complaints Action Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Village Complaints</h3>
            <p className="text-xs text-slate-500">Review AI classification and route directly to field workers.</p>
          </div>
          <Link
            to="/complaints"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>View All Grievances</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentComplaints.map((c) => (
            <div key={c._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                    {c.complaintId}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                    {c.priority}
                  </span>
                  <span className="text-xs text-slate-500">{c.category}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-1">{c.description}</p>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  c.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {c.status}
                </span>
                <Link
                  to="/complaints"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
