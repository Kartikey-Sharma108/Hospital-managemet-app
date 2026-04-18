import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Plus, X, Pencil, Trash2, Search } from 'lucide-react';

const DoctorManagement = () => {
  const { profile } = useAuth();
  const isManagement = profile?.role === 'management';
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', department: '', employment_type: 'Permanent' });

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (doctor) => {
      const { error } = await supabase.from('doctors').insert([doctor]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { error } = await supabase.from('doctors').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('doctors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctors'] }),
  });

  const resetForm = () => {
    setForm({ name: '', department: '', employment_type: 'Permanent' });
    setEditingDoctor(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDoctor) {
      updateMutation.mutate({ id: editingDoctor.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (doctor) => {
    setForm({ name: doctor.name, department: doctor.department, employment_type: doctor.employment_type });
    setEditingDoctor(doctor);
    setShowForm(true);
  };

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.department.toLowerCase().includes(search.toLowerCase())
  );

  const badgeColor = (type) => {
    switch (type) {
      case 'Permanent': return 'bg-green-100 text-green-700';
      case 'Trainee': return 'bg-amber-100 text-amber-700';
      case 'Visiting': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Stethoscope className="w-8 h-8 text-hospital-500" />
          Doctors
        </h1>
        {isManagement && (
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-hospital-600 hover:bg-hospital-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
            <Plus className="w-5 h-5" /> Add Doctor
          </button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input type="text" placeholder="Search by name or department..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none transition-all bg-white shadow-sm" />
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => resetForm()}>
          <div className="glass-card p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none bg-white shadow-sm" placeholder="Dr. Jane Smith" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
                <input required value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none bg-white shadow-sm" placeholder="Cardiology" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Employment Type</label>
                <select value={form.employment_type} onChange={e => setForm({ ...form, employment_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none bg-white shadow-sm">
                  <option value="Permanent">Permanent</option>
                  <option value="Trainee">Trainee</option>
                  <option value="Visiting">Visiting</option>
                </select>
              </div>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full bg-hospital-600 hover:bg-hospital-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-70">
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingDoctor ? 'Update Doctor' : 'Add Doctor')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                {isManagement && <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 animate-pulse">Loading doctors...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No doctors found.</td></tr>
              ) : filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{doc.name}</td>
                  <td className="px-6 py-4 text-slate-600">{doc.department}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeColor(doc.employment_type)}`}>{doc.employment_type}</span>
                  </td>
                  {isManagement && (
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => startEdit(doc)} className="p-2 text-slate-400 hover:text-hospital-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => { if (confirm('Delete this doctor?')) deleteMutation.mutate(doc.id); }}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorManagement;
