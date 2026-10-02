import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Users, Phone, MapPin, CheckCircle, Clock } from 'lucide-react';

export const Workers: React.FC = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/workers');
      if (res.data.success) {
        setWorkers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Panchayat Field Force & Technicians</h3>
        <p className="text-xs text-slate-500 mt-1">
          Registered field workers responsible for electrical repairs, pipeline fixes, and civic sanitation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workers.map((w) => (
          <div key={w._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                {w.name?.charAt(0) || 'W'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{w.name}</h4>
                <p className="text-xs text-slate-500 flex items-center">
                  <Phone className="w-3 h-3 mr-1 text-slate-400" />
                  <span>{w.phone}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Active Work Orders:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                {w.assignedTasksCount || 0} tasks
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
