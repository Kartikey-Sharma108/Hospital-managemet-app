import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Shield, TrendingUp, Users, Bed, Receipt, Stethoscope } from 'lucide-react';

const FinancialReports = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['financial-reports'],
    queryFn: async () => {
      const [bills, inpatients, outpatients, labReports, doctors, rooms] = await Promise.all([
        supabase.from('bills').select('*'),
        supabase.from('inpatients').select('*'),
        supabase.from('outpatients').select('*'),
        supabase.from('lab_reports').select('*'),
        supabase.from('doctors').select('*'),
        supabase.from('rooms').select('*'),
      ]);

      const billData = bills.data || [];
      const totalRevenue = billData.reduce((s, b) => s + parseFloat(b.charges), 0);
      const inpatientBills = billData.filter(b => b.patient_type === 'Inpatient');
      const outpatientBills = billData.filter(b => b.patient_type === 'Outpatient');
      const labData = labReports.data || [];
      const labRevenue = labData.reduce((s, l) => s + parseFloat(l.amount), 0);
      const activeAdmissions = (inpatients.data || []).filter(ip => !ip.date_of_discharge).length;
      const roomsData = rooms.data || [];
      const occupancy = roomsData.length ? ((roomsData.filter(r => r.status === 'Occupied').length / roomsData.length) * 100).toFixed(1) : 0;

      return {
        totalRevenue, labRevenue,
        billCount: billData.length,
        inpatientRevenue: inpatientBills.reduce((s, b) => s + parseFloat(b.charges), 0),
        outpatientRevenue: outpatientBills.reduce((s, b) => s + parseFloat(b.charges), 0),
        inpatientCount: inpatientBills.length,
        outpatientCount: outpatientBills.length,
        activeAdmissions,
        totalOutpatientVisits: (outpatients.data || []).length,
        labReportCount: labData.length,
        doctorCount: (doctors.data || []).length,
        roomCount: roomsData.length,
        occupancy,
      };
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" /></div>;
  }

  const d = data;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-purple-500" />
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Financial Reports</h1>
          <p className="text-slate-500 text-sm">Management-only analytics dashboard</p>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{d.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">{d.billCount} bills</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-purple-500">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Lab Revenue</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">₹{d.labRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">{d.labReportCount} reports</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-hospital-500">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Room Occupancy</p>
          <p className="text-2xl font-bold text-hospital-600 mt-1">{d.occupancy}%</p>
          <p className="text-xs text-slate-400 mt-1">{d.roomCount} rooms total</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-amber-500">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Active Beds</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{d.activeAdmissions}</p>
          <p className="text-xs text-slate-400 mt-1">patients admitted</p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" /> Revenue Breakdown</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Inpatient Revenue</span>
                <span className="font-semibold text-slate-900">₹{d.inpatientRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-hospital-500 h-3 rounded-full transition-all" style={{ width: `${d.totalRevenue ? (d.inpatientRevenue / d.totalRevenue * 100) : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Outpatient Revenue</span>
                <span className="font-semibold text-slate-900">₹{d.outpatientRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${d.totalRevenue ? (d.outpatientRevenue / d.totalRevenue * 100) : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Lab Revenue</span>
                <span className="font-semibold text-slate-900">₹{d.labRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-purple-500 h-3 rounded-full transition-all" style={{ width: `${(d.totalRevenue + d.labRevenue) ? (d.labRevenue / (d.totalRevenue + d.labRevenue) * 100) : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-hospital-500" /> Operations Summary</h2>
          <div className="space-y-3">
            {[
              { icon: Stethoscope, label: 'Doctors on Staff', value: d.doctorCount, color: 'text-hospital-600' },
              { icon: Bed, label: 'Total Rooms', value: d.roomCount, color: 'text-amber-600' },
              { icon: Users, label: 'Total OPD Visits', value: d.totalOutpatientVisits, color: 'text-blue-600' },
              { icon: Receipt, label: 'Inpatient Bills', value: d.inpatientCount, color: 'text-emerald-600' },
              { icon: Receipt, label: 'Outpatient Bills', value: d.outpatientCount, color: 'text-purple-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;
