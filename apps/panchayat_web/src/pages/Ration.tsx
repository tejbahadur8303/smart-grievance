import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ShoppingBag, AlertTriangle, Phone, CheckCircle2 } from 'lucide-react';

export const Ration: React.FC = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shopsRes, grievRes] = await Promise.all([
        api.get('/ration/shops'),
        api.get('/ration/grievances')
      ]);
      if (shopsRes.data.success) setShops(shopsRes.data.data);
      if (grievRes.data.success) setGrievances(grievRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Gram Panchayat Ration & PDS Supervision</h3>
        <p className="text-xs text-slate-500 mt-1">
          Inspect Kotedar operations, monthly quota dispatches, and citizen short-ration reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shops Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Panchayat Fair Price Shops</h4>
          {shops.map((s) => (
            <div key={s._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-slate-800">{s.shopCode}</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold text-[10px]">Open</span>
              </div>
              <h5 className="font-bold text-slate-900 text-sm">{s.dealerName}</h5>
              <p className="text-slate-600">Location: {s.villageName} | Contact: {s.contactPhone}</p>
              <p className="text-slate-500 font-medium">Active Cardholders: {s.activeCardHolders} households</p>
            </div>
          ))}
        </div>

        {/* Citizen Irregularity Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Citizen Discrepancy Reports ({grievances.length})</span>
          </h4>
          <div className="space-y-3">
            {grievances.length === 0 ? (
              <p className="text-xs text-slate-400">No citizen complaints flagged against PDS dealers.</p>
            ) : (
              grievances.map((g) => (
                <div key={g._id} className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between font-bold text-red-900">
                    <span>{g.grievanceType.replace('_', ' ')}</span>
                    <span className="font-mono text-slate-600">{g.shopCode}</span>
                  </div>
                  <p className="text-red-950">{g.description}</p>
                  <p className="text-[10px] text-red-700">Citizen: {g.citizenName} ({g.citizenPhone})</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
