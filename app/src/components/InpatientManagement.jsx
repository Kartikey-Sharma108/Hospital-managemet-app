import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Bed, Plus, X, LogOut as DischargeIcon } from 'lucide-react';

const InpatientManagement = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient_id: '', room_no: '', advance_payment: '0' });

  const { data: inpatients = [], isLoading } = useQuery({
    queryKey: ['inpatients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inpatients')
        .select('*, patients(first_name, last_name)')
        .order('date_of_admission', { ascending: false });
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

  const { data: availableRooms = [] } = useQuery({
    queryKey: ['rooms-available'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rooms').select('room_no, room_type').eq('status', 'Available').order('room_no');
      if (error) throw error;
      return data;
    },
  });

  const admitMutation = useMutation({
    mutationFn: async (record) => {
      const { error } = await supabase.from('inpatients').insert([{
        patient_id: record.patient_id,
        room_no: parseInt(record.room_no, 10),
        advance_payment: parseFloat(record.advance_payment) || 0,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inpatients'] });
      queryClient.invalidateQueries({ queryKey: ['rooms-available'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      resetForm();
    },
  });

  const dischargeMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('inpatients')
        .update({ date_of_discharge: new Date().toISOString().split('T')[0] })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inpatients'] });
      queryClient.invalidateQueries({ queryKey: ['rooms-available'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const resetForm = () => {
    setForm({ patient_id: '', room_no: '', advance_payment: '0' });
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    admitMutation.mutate(form);
  };

  const activeAdmissions = inpatients.filter(ip => !ip.date_of_discharge);
  const dischargedRecords = inpatients.filter(ip => ip.date_of_discharge);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Bed className="w-8 h-8 text-hospital-500" />
          Inpatients
        </h1>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-hospital-600 hover:bg-hospital-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Plus className="w-5 h-5" /> Admit Patient
        </button>
      </div>

      {/* Admit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="glass-card p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Admit Patient</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Patient</label>
                <select required value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none bg-white shadow-sm">
                  <option value="">Select a patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Room</label>
                <select required value={form.room_no} onChange={e => setForm({ ...form, room_no: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none bg-white shadow-sm">
                  <option value="">Select available room...</option>
                  {availableRooms.map(r => <option key={r.room_no} value={r.room_no}>Room {r.room_no} — {r.room_type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Advance Payment (₹)</label>
                <input type="number" min="0" step="0.01" value={form.advance_payment}
                  onChange={e => setForm({ ...form, advance_payment: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none bg-white shadow-sm" />
              </div>
              <button type="submit" disabled={admitMutation.isPending}
                className="w-full bg-hospital-600 hover:bg-hospital-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-70">
                {admitMutation.isPending ? 'Admitting...' : 'Confirm Admission'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Active Admissions */}
      <div>
        <h2 className="text-lg font-bold text-slate-700 mb-3">Currently Admitted ({activeAdmissions.length})</h2>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Patient</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Room</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Admitted On</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Advance (₹)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 animate-pulse">Loading...</td></tr>
                ) : activeAdmissions.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No patients currently admitted.</td></tr>
                ) : activeAdmissions.map(ip => (
                  <tr key={ip.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{ip.patients?.first_name} {ip.patients?.last_name}</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-hospital-100 text-hospital-800">Room {ip.room_no}</span></td>
                    <td className="px-6 py-4 text-slate-600">{new Date(ip.date_of_admission).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-600">₹{parseFloat(ip.advance_payment).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { if (confirm('Discharge this patient?')) dischargeMutation.mutate(ip.id); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-medium transition-colors">
                        <DischargeIcon className="w-3.5 h-3.5" /> Discharge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Discharged Records */}
      {dischargedRecords.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-700 mb-3">Discharged ({dischargedRecords.length})</h2>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Patient</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Room</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Admitted</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Discharged</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Advance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {dischargedRecords.map(ip => (
                    <tr key={ip.id} className="hover:bg-slate-50/50 transition-colors opacity-70">
                      <td className="px-6 py-4 font-medium text-slate-900">{ip.patients?.first_name} {ip.patients?.last_name}</td>
                      <td className="px-6 py-4 text-slate-600">Room {ip.room_no}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(ip.date_of_admission).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(ip.date_of_discharge).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-slate-600">₹{parseFloat(ip.advance_payment).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InpatientManagement;
