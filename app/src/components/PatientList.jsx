import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Users, Search, Eye } from 'lucide-react';

const PatientList = () => {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*, doctors:assigned_doctor_id(name, department)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (p.diseases || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Users className="w-8 h-8 text-hospital-500" />
          All Patients
        </h1>
        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{patients.length} total</span>
      </div>

      <div className="relative max-w-md">
        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input type="text" placeholder="Search by name or disease..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none transition-all bg-white shadow-sm" />
      </div>

      {/* Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPatient(null)}>
          <div className="glass-card p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Patient Details</h2>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-900">{selectedPatient.first_name} {selectedPatient.last_name}</span></div>
                <div><span className="text-slate-500">Age:</span> <span className="font-medium text-slate-900">{selectedPatient.age}</span></div>
                <div><span className="text-slate-500">Gender:</span> <span className="font-medium text-slate-900">{selectedPatient.gender}</span></div>
                <div><span className="text-slate-500">Doctor:</span> <span className="font-medium text-slate-900">{selectedPatient.doctors?.name || 'Unassigned'}</span></div>
              </div>
              <div><span className="text-slate-500">Address:</span> <span className="font-medium text-slate-900">{selectedPatient.address || 'N/A'}</span></div>
              <div><span className="text-slate-500">Diseases:</span> <span className="font-medium text-slate-900">{selectedPatient.diseases || 'None listed'}</span></div>
              <div><span className="text-slate-500">Registered:</span> <span className="font-medium text-slate-900">{new Date(selectedPatient.created_at).toLocaleDateString()}</span></div>
            </div>
            <button onClick={() => setSelectedPatient(null)} className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-medium transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Doctor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Diseases</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400 animate-pulse">Loading patients...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No patients found.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{p.first_name} {p.last_name}</td>
                  <td className="px-6 py-4 text-slate-600">{p.age}</td>
                  <td className="px-6 py-4 text-slate-600">{p.gender}</td>
                  <td className="px-6 py-4 text-slate-600">{p.doctors?.name || <span className="text-slate-300">—</span>}</td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">{p.diseases || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedPatient(p)} className="p-2 text-slate-400 hover:text-hospital-600 transition-colors"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientList;
