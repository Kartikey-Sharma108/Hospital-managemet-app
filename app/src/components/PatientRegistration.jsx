import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { saveOfflinePatient } from '../lib/db';
import { UserPlus, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

const PatientRegistration = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [submitStatus, setSubmitStatus] = useState(null);
  const queryClient = useQueryClient();

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors-select'],
    queryFn: async () => {
      const { data } = await supabase.from('doctors').select('id, name, department').order('name');
      return data || [];
    },
  });

  const onSubmit = async (data) => {
    try {
      setSubmitStatus({ type: 'info', message: 'Processing registration...' });
      const newPatient = {
        id: crypto.randomUUID(),
        ...data,
        age: parseInt(data.age, 10),
        assigned_doctor_id: data.assigned_doctor_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (navigator.onLine) {
        const { error } = await supabase.from('patients').insert([newPatient]);
        if (error) throw error;
        setSubmitStatus({ type: 'success', message: 'Patient registered successfully.' });
        queryClient.invalidateQueries({ queryKey: ['patients'] });
        queryClient.invalidateQueries({ queryKey: ['patients-select'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      } else {
        await saveOfflinePatient(newPatient);
        setSubmitStatus({ type: 'success', message: 'Offline: Saved locally. Will sync when connected.' });
      }
      reset();
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (err) {
      setSubmitStatus({ type: 'error', message: err.message || 'Failed to register.' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-hospital-500" /> Patient Registration
        </h1>
        <p className="text-slate-500 mt-2">Enter patient details. Works seamlessly offline.</p>
      </div>

      {submitStatus && (
        <div className={`p-4 mb-6 rounded-lg flex items-center gap-3 ${
          submitStatus.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
          submitStatus.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
          'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          {submitStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="font-medium">{submitStatus.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">First Name <span className="text-red-500">*</span></label>
            <input {...register('first_name', { required: 'Required' })}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 focus:border-hospital-500 outline-none bg-white shadow-sm" placeholder="John" />
            {errors.first_name && <p className="text-sm text-red-500">{errors.first_name.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Last Name <span className="text-red-500">*</span></label>
            <input {...register('last_name', { required: 'Required' })}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 focus:border-hospital-500 outline-none bg-white shadow-sm" placeholder="Doe" />
            {errors.last_name && <p className="text-sm text-red-500">{errors.last_name.message}</p>}
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700">Address</label>
            <textarea {...register('address')} rows={2}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none bg-white shadow-sm resize-none" placeholder="123 Health St, City" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Age <span className="text-red-500">*</span></label>
            <input type="number" {...register('age', { required: 'Required', min: { value: 1, message: 'Must be > 0' }, max: { value: 150, message: 'Invalid' } })}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none bg-white shadow-sm" placeholder="45" />
            {errors.age && <p className="text-sm text-red-500">{errors.age.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Gender <span className="text-red-500">*</span></label>
            <select {...register('gender', { required: 'Required' })}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none bg-white shadow-sm">
              <option value="">Select Gender...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Assigned Doctor</label>
            <select {...register('assigned_doctor_id')}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none bg-white shadow-sm">
              <option value="">None (Assign Later)</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.department}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Known Diseases</label>
            <input {...register('diseases')}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none bg-white shadow-sm" placeholder="Hypertension, Diabetes" />
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button type="submit" disabled={isSubmitting}
            className="flex items-center gap-2 bg-hospital-600 hover:bg-hospital-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:ring-4 focus:ring-hospital-200 disabled:opacity-70">
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            Register Patient
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistration;
