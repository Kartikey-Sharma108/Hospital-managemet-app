import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Receipt, Plus, X } from 'lucide-react';

const Billing = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient_id: '', patient_type: 'Outpatient', charges: '', no_of_days: '1' });

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      const { data, error } = await supabase.from('bills')
        .select('*, patients(first_name, last_name)')
        .order('created_at', { ascending: false });
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

  const createMutation = useMutation({
    mutationFn: async (record) => {
      const { error } = await supabase.from('bills').insert([{
        ...record,
        charges: parseFloat(record.charges) || 0,
        no_of_days: parseInt(record.no_of_days, 10) || 1,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setShowForm(false);
      setForm({ patient_id: '', patient_type: 'Outpatient', charges: '', no_of_days: '1' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const totalRevenue = bills.reduce((sum, b) => sum + parseFloat(b.charges), 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Receipt className="w-8 h-8 text-emerald-500" /> Billing
        </h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Plus className="w-5 h-5" /> New Bill
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Bills</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{bills.length}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Avg per Bill</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">₹{bills.length ? (totalRevenue / bills.length).toFixed(0) : 0}</p>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-card p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Create Bill</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Patient</label>
                <select required value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm">
                  <option value="">Select patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Patient Type</label>
                <select value={form.patient_type} onChange={e => setForm({ ...form, patient_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm">
                  <option>Inpatient</option>
                  <option>Outpatient</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Charges (₹)</label>
                  <input type="number" required min="0" step="0.01" value={form.charges}
                    onChange={e => setForm({ ...form, charges: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">No. of Days</label>
                  <input type="number" required min="1" value={form.no_of_days}
                    onChange={e => setForm({ ...form, no_of_days: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm" />
                </div>
              </div>
              <button type="submit" disabled={createMutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-70">
                {createMutation.isPending ? 'Creating...' : 'Generate Bill'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bills Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Patient</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Days</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Charges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 animate-pulse">Loading...</td></tr>
              ) : bills.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No bills generated yet.</td></tr>
              ) : bills.map(b => (
                <tr key={b.bill_no} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">{new Date(b.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{b.patients?.first_name} {b.patients?.last_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${b.patient_type === 'Inpatient' ? 'bg-hospital-100 text-hospital-700' : 'bg-blue-100 text-blue-700'}`}>
                      {b.patient_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{b.no_of_days}</td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-600">₹{parseFloat(b.charges).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;
