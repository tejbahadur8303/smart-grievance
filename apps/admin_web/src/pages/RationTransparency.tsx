import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ShoppingBag, AlertCircle, Phone, MapPin, CheckCircle } from 'lucide-react';

export const RationTransparency: React.FC = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [grievances, setGrievances] = useState<any[]>([]);
  const [selectedShop, setSelectedShop] = useState<any | null>(null);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shopsRes, grievRes] = await Promise.all([
        api.get('/ration/shops'),
        api.get('/ration/grievances')
      ]);
      if (shopsRes.data.success) {
        setShops(shopsRes.data.data);
        if (shopsRes.data.data.length > 0) {
          loadShopAllocations(shopsRes.data.data[0]);
        }
      }
      if (grievRes.data.success) setGrievances(grievRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadShopAllocations = async (shop: any) => {
    setSelectedShop(shop);
    try {
      const res = await api.get(`/ration/shops/${shop._id}/allocations`);
      if (res.data.success) {
        setAllocations(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Public Distribution System (PDS) Transparency</h3>
        <p className="text-xs text-slate-500 mt-1">
          Monitor Fair Price Shops, monthly grain quotas (Wheat, Rice, Sugar), and investigate citizen discrepancies.
        </p>
      </div>

      {/* Grid: Shops & Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shops Directory */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Fair Price Ration Shops ({shops.length})
          </h4>
          <div className="space-y-3">
            {shops.map((shop) => (
              <div
                key={shop._id}
                onClick={() => loadShopAllocations(shop)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedShop?._id === shop._id
                    ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-700">{shop.shopCode}</span>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <h5 className="font-bold text-slate-900 text-sm mt-1">{shop.dealerName}</h5>
                <div className="text-xs text-slate-500 mt-2 space-y-1">
                  <p className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{shop.villageName}, {shop.panchayatName}</span>
                  </p>
                  <p className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{shop.contactPhone}</span>
                  </p>
                  <p className="text-[11px] font-medium text-slate-600">
                    Cardholders: {shop.activeCardHolders} families
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Allocations Quota Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              Monthly Grain Allocation & Distribution: {selectedShop?.dealerName}
            </h4>
            <p className="text-xs text-slate-500">Shop Code: {selectedShop?.shopCode} | Hours: {selectedShop?.openingHours}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {allocations.map((alloc) => {
              const pct = Math.round((alloc.distributedQuantityKg / alloc.allocatedQuantityKg) * 100);
              return (
                <div key={alloc._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">{alloc.commodity}</span>
                    <span className="text-xs font-semibold text-orange-700">{pct}% Given</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                    <span>Allocated: {alloc.allocatedQuantityKg} kg</span>
                    <span>Distributed: {alloc.distributedQuantityKg} kg</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Government Price: ₹{alloc.unitPriceRs}/kg</p>
                </div>
              );
            })}
          </div>

          {/* Citizen Flagged Grievances */}
          <div className="pt-4 border-t border-slate-100">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
              Citizen Irregularity Reports & Discrepancies ({grievances.length})
            </h5>
            <div className="space-y-3">
              {grievances.length === 0 ? (
                <p className="text-xs text-slate-400">No discrepancies reported for this PDS jurisdiction.</p>
              ) : (
                grievances.map((g) => (
                  <div key={g._id} className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-900 uppercase">{g.grievanceType.replace('_', ' ')}</span>
                      <span className="font-mono text-slate-600">{g.shopCode}</span>
                    </div>
                    <p className="text-red-950">{g.description}</p>
                    <p className="text-[10px] text-red-700">Reported by: {g.citizenName} ({g.citizenPhone})</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
