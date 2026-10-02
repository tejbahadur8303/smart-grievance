import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { OverviewStats } from '../types';
import {
  FileText,
  AlertOctagon,
  Clock,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [villageData, setVillageData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewRes, catRes, vilRes, trendRes, aiRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/complaints-by-category'),
        api.get('/analytics/complaints-by-village'),
        api.get('/analytics/trends'),
        api.get('/analytics/ai-summary')
      ]);

      if (overviewRes.data.success) setStats(overviewRes.data.data);
      if (catRes.data.success) setCategoryData(catRes.data.data);
      if (vilRes.data.success) setVillageData(vilRes.data.data);
      if (trendRes.data.success) setTrendData(trendRes.data.data);
      if (aiRes.data.success) setAiSummary(aiRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
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
        <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
        <span className="ml-3 text-sm text-slate-600 font-medium">Loading administrative intelligence...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Grievances</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.total || 0}</h3>
            <p className="text-xs text-slate-400 mt-1">{stats?.submitted || 0} newly submitted</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue SLA Violations</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">{stats?.overdueCount || 0}</h3>
            <p className="text-xs text-red-500 mt-1">{stats?.escalated || 0} auto-escalated</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolution Rate</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats?.resolutionRate || 0}%</h3>
            <p className="text-xs text-slate-400 mt-1">Avg turnaround: {stats?.avgResolutionHours || 0} hrs</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ration Discrepancies</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats?.rationDiscrepancies || 0}</h3>
            <p className="text-xs text-slate-400 mt-1">{stats?.welfareTotal || 0} welfare applicants</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AI Executive Briefing */}
      {aiSummary && (
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-white p-6 rounded-xl border border-orange-200 shadow-sm">
          <div className="flex items-center space-x-2 text-orange-700 font-semibold mb-2">
            <Sparkles className="w-5 h-5 text-orange-600" />
            <span className="text-sm uppercase tracking-wide">AI-Generated Weekly Administrative Briefing</span>
          </div>
          <p className="text-slate-800 text-sm leading-relaxed">{aiSummary.summaryText}</p>
          <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-orange-200 text-xs">
            <span className="font-semibold text-slate-600">Top Bottleneck: <strong className="text-orange-700">{aiSummary.keyMetrics.topIssueCategory}</strong></span>
            <span className="font-semibold text-slate-600">Reopened by Citizens: <strong className="text-red-600">{aiSummary.keyMetrics.reopenedCases}</strong></span>
            <span className="font-semibold text-slate-600">Average Turnaround: <strong className="text-emerald-700">{aiSummary.keyMetrics.avgResolutionHours}</strong></span>
          </div>
        </div>
      )}

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Complaints by Category */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Grievance Distribution by Category</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#e66518" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints by Village */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Complaints by Village Jurisdiction</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={villageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="village" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0b3b60" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
