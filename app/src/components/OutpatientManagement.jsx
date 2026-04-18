import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { CalendarCheck, Plus, X } from 'lucide-react';

const OutpatientManagement = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient_id: '', visit_date: new Date().toISOString().split('T')[0] });

  const { data: outpatients = [], isLoading } = useQuery({
    queryKey: ['outpatients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('outpatients')
        .select('*, patients(first_name, last_name)')
        .order('visit_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients-select'],
    queryFn: async () => {
      const { data, error } = await supabase.from('patients').select('id, first_name, last_name').order('first_name');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (record) => {
      const { error } = await supabase.from('outpatients').insert([record]);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['outpatients'] }); setShowForm(false); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const grouped = outpatients.reduce((acc, op) => {
    if (!acc[op.visit_date]) acc[op.visit_date] = [];
    acc[op.visit_date].push(op);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <CalendarCheck className="w-8 h-8 text-hospital-500" /> Outpatients
        </h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-hospital-600 hover:bg-hospital-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Plus className="w-5 h-5" /> Record Visit
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-card p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Record Visit</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Patient</label>
                <select required value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none bg-white shadow-sm">
                  <option value="">Select patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Visit Date</label>
                <input type="date" required value={form.visit_date} onChange={e => setForm({ ...form, visit_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none bg-white shadow-sm" />
              </div>
              <button type="submit" disabled={createMutation.isPending}
                className="w-full bg-hospital-600 hover:bg-hospital-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-70">
                {createMutation.isPending ? 'Saving...' : 'Record Visit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="glass-card p-8 text-center text-slate-400 animate-pulse">Loading...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="glass-card p-8 text-center text-slate-400">No outpatient visits yet.</div>
      ) : Object.entries(grouped).map(([date, visits]) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" />
            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            <span className="ml-auto text-xs bg-slate-100 px-2 py-0.5 rounded-full">{visits.length}</span>
          </h3>
          <div className="glass-card divide-y divide-slate-50 overflow-hidden">
            {visits.map(op => (
              <div key={op.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <p className="font-medium text-slate-900">{op.patients?.first_name} {op.patients?.last_name}</p>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">OPD</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OutpatientManagement;
