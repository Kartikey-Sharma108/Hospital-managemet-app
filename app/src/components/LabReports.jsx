import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { FlaskConical, Plus, X } from 'lucide-react';

const LabReports = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient_id: '', doctor_id: '', date: new Date().toISOString().split('T')[0], amount: '', category_a: '' });

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['lab-reports'],
    queryFn: async () => {
      const { data, error } = await supabase.from('lab_reports')
        .select('*, patients(first_name, last_name), doctors:doctor_id(name)')
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients-select'],
    queryFn: async () => {
      const { data } = await supabase.from('patients').select('id, first_name, last_name').order('first_name');
      return data || [];
    },
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors-select'],
    queryFn: async () => {
      const { data } = await supabase.from('doctors').select('id, name').order('name');
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (record) => {
      const { error } = await supabase.from('lab_reports').insert([{ ...record, amount: parseFloat(record.amount) || 0 }]);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['lab-reports'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }); setShowForm(false); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <FlaskConical className="w-8 h-8 text-purple-500" /> Lab Reports
        </h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Plus className="w-5 h-5" /> New Report
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-card p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">New Lab Report</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Patient</label>
                <select required value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white shadow-sm">
                  <option value="">Select patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Doctor</label>
                <select required value={form.doctor_id} onChange={e => setForm({ ...form, doctor_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white shadow-sm">
                  <option value="">Select doctor...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                  <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Amount (₹)</label>
                  <input type="number" required min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <input value={form.category_a} onChange={e => setForm({ ...form, category_a: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white shadow-sm" placeholder="Blood Test, X-Ray, etc." />
              </div>
              <button type="submit" disabled={createMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-70">
                {createMutation.isPending ? 'Creating...' : 'Create Report'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Patient</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Doctor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 animate-pulse">Loading...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No lab reports yet.</td></tr>
              ) : reports.map(r => (
                <tr key={r.lab_no} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{r.patients?.first_name} {r.patients?.last_name}</td>
                  <td className="px-6 py-4 text-slate-600">{r.doctors?.name}</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{r.category_a || '—'}</span></td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">₹{parseFloat(r.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LabReports;
