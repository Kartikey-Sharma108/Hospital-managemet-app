import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Bed, Users, FileText, Activity, Stethoscope, Receipt, CalendarCheck, DoorOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { profile } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      if (!navigator.onLine) return { availableRooms: 0, admitted: 0, reports: 0, doctors: 0, patients: 0, bills: 0, outpatientVisits: 0 };
      const [rooms, inpatients, reports, doctors, patients, bills, outpatients] = await Promise.all([
        supabase.from('rooms').select('room_no', { count: 'exact' }).eq('status', 'Available'),
        supabase.from('inpatients').select('id', { count: 'exact' }).is('date_of_discharge', null),
        supabase.from('lab_reports').select('lab_no', { count: 'exact' }),
        supabase.from('doctors').select('id', { count: 'exact' }),
        supabase.from('patients').select('id', { count: 'exact' }),
        supabase.from('bills').select('bill_no', { count: 'exact' }),
        supabase.from('outpatients').select('id', { count: 'exact' }),
      ]);
      return {
        availableRooms: rooms.count || 0, admitted: inpatients.count || 0,
        reports: reports.count || 0, doctors: doctors.count || 0,
        patients: patients.count || 0, bills: bills.count || 0,
        outpatientVisits: outpatients.count || 0,
      };
    },
    initialData: { availableRooms: 0, admitted: 0, reports: 0, doctors: 0, patients: 0, bills: 0, outpatientVisits: 0 },
    refetchInterval: 15000,
  });

  const { data: recentInpatients = [] } = useQuery({
    queryKey: ['recent-inpatients'],
    queryFn: async () => {
      if (!navigator.onLine) return [];
      const { data, error } = await supabase.from('inpatients')
        .select('id, date_of_admission, room_no, patients(first_name, last_name, diseases)')
        .is('date_of_discharge', null)
        .order('date_of_admission', { ascending: false }).limit(5);
      if (error) throw error;
      return data;
    },
    initialData: [],
  });

  const { data: recentLabs = [] } = useQuery({
    queryKey: ['recent-labs'],
    queryFn: async () => {
      if (!navigator.onLine) return [];
      const { data, error } = await supabase.from('lab_reports')
        .select('lab_no, date, amount, category_a, patients(first_name, last_name)')
        .order('date', { ascending: false }).limit(5);
      if (error) throw error;
      return data;
    },
    initialData: [],
  });

  const cards = [
    { label: 'Total Patients', value: stats.patients, icon: Users, color: 'bg-hospital-100 text-hospital-600', link: '/patients' },
    { label: 'Doctors', value: stats.doctors, icon: Stethoscope, color: 'bg-indigo-100 text-indigo-600', link: '/doctors' },
    { label: 'Available Rooms', value: stats.availableRooms, icon: DoorOpen, color: 'bg-green-100 text-green-600', link: '/rooms' },
    { label: 'Admitted Now', value: stats.admitted, icon: Bed, color: 'bg-amber-100 text-amber-600', link: '/inpatients' },
    { label: 'OPD Visits', value: stats.outpatientVisits, icon: CalendarCheck, color: 'bg-blue-100 text-blue-600', link: '/outpatients' },
    { label: 'Lab Reports', value: stats.reports, icon: FileText, color: 'bg-purple-100 text-purple-600', link: '/lab-reports' },
    { label: 'Bills Generated', value: stats.bills, icon: Receipt, color: 'bg-emerald-100 text-emerald-600', link: '/billing' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Welcome back</h1>
        <p className="text-slate-500 mt-1">Here's an overview of hospital operations today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <Link key={c.label} to={c.link} className="glass-card p-5 flex items-start gap-3 hover:shadow-md transition-shadow group">
            <div className={`p-2.5 rounded-xl ${c.color}`}><c.icon className="w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider group-hover:text-hospital-600 transition-colors">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Two-column detail panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Admitted */}
        <div className="glass-card flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 flex items-center gap-2"><Activity className="w-5 h-5 text-hospital-500" /> Recently Admitted</h2>
            <Link to="/inpatients" className="text-xs text-hospital-600 hover:underline font-medium">View all →</Link>
          </div>
          {recentInpatients.length === 0 ? (
            <div className="p-6 text-sm text-slate-400 text-center">No active admissions.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentInpatients.map(ip => (
                <div key={ip.id} className="px-5 py-3 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{ip.patients?.first_name} {ip.patients?.last_name}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[180px]">{ip.patients?.diseases || 'No details'}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-hospital-100 text-hospital-800">Room {ip.room_no}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{new Date(ip.date_of_admission).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Lab Reports */}
        <div className="glass-card flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 flex items-center gap-2"><FileText className="w-5 h-5 text-purple-500" /> Recent Lab Reports</h2>
            <Link to="/lab-reports" className="text-xs text-purple-600 hover:underline font-medium">View all →</Link>
          </div>
          {recentLabs.length === 0 ? (
            <div className="p-6 text-sm text-slate-400 text-center">No lab reports yet.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentLabs.map(r => (
                <div key={r.lab_no} className="px-5 py-3 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{r.patients?.first_name} {r.patients?.last_name}</p>
                    <p className="text-xs text-slate-400">{r.category_a || 'Uncategorized'}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-sm text-purple-600">₹{parseFloat(r.amount).toLocaleString()}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{new Date(r.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
