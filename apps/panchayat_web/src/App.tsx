import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Complaints } from './pages/Complaints';
import { Welfare } from './pages/Welfare';
import { Ration } from './pages/Ration';
import { Workers } from './pages/Workers';
import { Login } from './pages/Login';

function ProtectedLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  const token = localStorage.getItem('officer_token');
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
            <ProtectedLayout title="Panchayat Desk" subtitle="Gram Panchayat Shivpur Governance Center">
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/complaints"
          element={
            <ProtectedLayout title="Grievance Redressal Desk" subtitle="Verify, detect duplicates, and assign field technicians">
              <Complaints />
            </ProtectedLayout>
          }
        />
        <Route
          path="/workers"
          element={
            <ProtectedLayout title="Field Worker Operations" subtitle="Active work orders and proof-of-work status">
              <Workers />
            </ProtectedLayout>
          }
        />
        <Route
          path="/welfare"
          element={
            <ProtectedLayout title="Welfare Beneficiary Desk" subtitle="Verify eligibility documents and sanction welfare benefits">
              <Welfare />
            </ProtectedLayout>
          }
        />
        <Route
          path="/ration"
          element={
            <ProtectedLayout title="Ration & PDS Oversight" subtitle="Fair price shop quotas and citizen short-ration reports">
              <Ration />
            </ProtectedLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
