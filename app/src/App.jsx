import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PatientRegistration from './components/PatientRegistration';
import PatientList from './components/PatientList';
import DoctorManagement from './components/DoctorManagement';
import RoomManagement from './components/RoomManagement';
import InpatientManagement from './components/InpatientManagement';
import OutpatientManagement from './components/OutpatientManagement';
import LabReports from './components/LabReports';
import Billing from './components/Billing';
import FinancialReports from './components/FinancialReports';
import NetworkStatus from './components/NetworkStatus';
import Auth from './components/Auth';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  LayoutDashboard, UserPlus, Users, Stethoscope, DoorOpen,
  Bed, CalendarCheck, FlaskConical, Receipt, Shield,
  HeartPulse, Settings, LogOut
} from 'lucide-react';

const queryClient = new QueryClient();

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/register', icon: UserPlus, label: 'Register Patient' },
  { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
  { to: '/rooms', icon: DoorOpen, label: 'Rooms' },
  { to: '/inpatients', icon: Bed, label: 'Inpatients' },
  { to: '/outpatients', icon: CalendarCheck, label: 'Outpatients' },
  { to: '/lab-reports', icon: FlaskConical, label: 'Lab Reports' },
  { to: '/billing', icon: Receipt, label: 'Billing' },
];

const Layout = ({ children }) => {
  const { profile, signOut } = useAuth();
  const isManagement = profile?.role === 'management';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 text-white">
            <HeartPulse className="w-8 h-8 text-hospital-400" />
            <span className="text-xl font-bold tracking-wide">NexusHMS</span>
          </div>
          {profile && (
            <div className="mt-4 px-2 py-1.5 bg-slate-800/50 rounded flex items-center justify-center gap-2 border border-slate-700/50 text-xs">
              {isManagement ? <Shield className="w-4 h-4 text-purple-400" /> : <Users className="w-4 h-4 text-hospital-400" />}
              <span className="uppercase tracking-wider font-semibold text-slate-400">
                {isManagement ? 'Management' : 'Staff User'}
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main</p>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-hospital-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
              <item.icon className="w-[18px] h-[18px]" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}

          {isManagement && (
            <>
              <p className="px-3 pt-4 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Management</p>
              <NavLink to="/reports"
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-purple-600 text-white' : 'hover:bg-slate-800 hover:text-purple-400'}`}>
                <Shield className="w-[18px] h-[18px]" />
                <span className="font-medium">Financial Reports</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-1">
          <div className="px-3 py-2 text-sm text-slate-500 truncate">{profile?.email}</div>
          <button onClick={signOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-hospital-100/40 via-slate-50 to-slate-50" />

        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <HeartPulse className="w-6 h-6 text-hospital-600" />
            <span className="text-lg font-bold">NexusHMS</span>
          </div>
          <button onClick={signOut} className="text-slate-500 hover:text-rose-600 p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="p-4 md:p-8">{children}</div>
      </main>

      <NetworkStatus />
    </div>
  );
};

const AuthGuard = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-4 border-hospital-200 border-t-hospital-600 animate-spin" />
      </div>
    );
  }

  if (!session) return <Auth />;

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/register" element={<PatientRegistration />} />
          <Route path="/doctors" element={<DoctorManagement />} />
          <Route path="/rooms" element={<RoomManagement />} />
          <Route path="/inpatients" element={<InpatientManagement />} />
          <Route path="/outpatients" element={<OutpatientManagement />} />
          <Route path="/lab-reports" element={<LabReports />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/reports" element={<FinancialReports />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard />
      </AuthProvider>
    </QueryClientProvider>
  );
}
