import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { DoorOpen, Plus, X, Pencil, Wrench } from 'lucide-react';

const RoomManagement = () => {
  const { profile } = useAuth();
  const isManagement = profile?.role === 'management';
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState({ room_no: '', room_type: 'General Ward', status: 'Available' });

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rooms').select('*').order('room_no');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (room) => {
      const { error } = await supabase.from('rooms').insert([{ ...room, room_no: parseInt(room.room_no, 10) }]);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rooms'] }); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ room_no, ...updates }) => {
      const { error } = await supabase.from('rooms').update(updates).eq('room_no', room_no);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rooms'] }); resetForm(); },
  });

  const resetForm = () => {
    setForm({ room_no: '', room_type: 'General Ward', status: 'Available' });
    setEditingRoom(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRoom) {
      updateMutation.mutate({ room_no: editingRoom.room_no, room_type: form.room_type, status: form.status });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (room) => {
    setForm({ room_no: room.room_no, room_type: room.room_type, status: room.status });
    setEditingRoom(room);
    setShowForm(true);
  };

  const statusColor = (s) => {
    switch (s) {
      case 'Available': return 'bg-green-100 text-green-700';
      case 'Occupied': return 'bg-red-100 text-red-700';
      case 'Maintenance': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const statusIcon = (s) => {
    if (s === 'Available') return <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />;
    if (s === 'Occupied') return <div className="w-2.5 h-2.5 rounded-full bg-red-500" />;
    return <Wrench className="w-3.5 h-3.5 text-amber-600" />;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <DoorOpen className="w-8 h-8 text-hospital-500" />
          Rooms
        </h1>
        {isManagement && (
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-hospital-600 hover:bg-hospital-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
            <Plus className="w-5 h-5" /> Add Room
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {['Available', 'Occupied', 'Maintenance'].map(status => (
          <div key={status} className="glass-card p-4 flex items-center gap-3">
            {statusIcon(status)}
            <div>
              <p className="text-2xl font-bold text-slate-900">{rooms.filter(r => r.status === status).length}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">{status}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="glass-card p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingRoom ? 'Edit Room' : 'Add Room'}</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Room Number</label>
                <input type="number" required disabled={!!editingRoom} value={form.room_no}
                  onChange={e => setForm({ ...form, room_no: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none bg-white shadow-sm disabled:bg-slate-100" placeholder="101" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Room Type</label>
                <select value={form.room_type} onChange={e => setForm({ ...form, room_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none bg-white shadow-sm">
                  <option>General Ward</option>
                  <option>Semi-Private</option>
                  <option>Private</option>
                  <option>ICU</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-hospital-500 outline-none bg-white shadow-sm">
                  <option>Available</option>
                  <option>Occupied</option>
                  <option>Maintenance</option>
                </select>
              </div>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full bg-hospital-600 hover:bg-hospital-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-70">
                {editingRoom ? 'Update Room' : 'Add Room'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Room Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse h-28" />
          ))
        ) : rooms.map(room => (
          <div key={room.room_no}
            className={`glass-card p-4 flex flex-col justify-between transition-all hover:shadow-md cursor-default border-l-4 ${
              room.status === 'Available' ? 'border-l-green-500' : room.status === 'Occupied' ? 'border-l-red-500' : 'border-l-amber-500'
            }`}>
            <div className="flex justify-between items-start">
              <p className="text-2xl font-bold text-slate-800">{room.room_no}</p>
              {isManagement && (
                <button onClick={() => startEdit(room)} className="p-1 text-slate-300 hover:text-hospital-600 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{room.room_type}</p>
            <span className={`mt-2 self-start px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(room.status)}`}>{room.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomManagement;
