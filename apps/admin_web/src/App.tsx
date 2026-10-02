import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Complaints } from './pages/Complaints';
import { Escalations } from './pages/Escalations';
import { WelfareSchemes } from './pages/WelfareSchemes';
import { RationTransparency } from './pages/RationTransparency';
import { AuditLogs } from './pages/AuditLogs';
import { Login } from './pages/Login';

function ProtectedLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedLayout title="Executive Overview" subtitle="Real-time multi-village grievance metrics & analytics">
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/complaints"
          element={
            <ProtectedLayout title="Grievance Central" subtitle="Audit timeline, AI confidence scoring, and citizen verification">
              <Complaints />
            </ProtectedLayout>
          }
        />
        <Route
          path="/escalations"
          element={
            <ProtectedLayout title="SLA Auto-Escalation Engine" subtitle="Multi-level alerts and overdue turnaround tracking">
              <Escalations />
            </ProtectedLayout>
          }
        />
        <Route
          path="/welfare"
          element={
            <ProtectedLayout title="Village Welfare Schemes" subtitle="Eligibility configuration and beneficiary application registry">
              <WelfareSchemes />
            </ProtectedLayout>
          }
        />
        <Route
          path="/ration"
          element={
            <ProtectedLayout title="PDS / Ration Transparency" subtitle="Fair price shop quotas, distribution logs, and citizen flags">
              <RationTransparency />
            </ProtectedLayout>
          }
        />
        <Route
          path="/audit"
          element={
            <ProtectedLayout title="Compliance & Audit Trail" subtitle="System activity logs and administrative verification records">
              <AuditLogs />
            </ProtectedLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
