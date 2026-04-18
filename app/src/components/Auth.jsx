import React from 'react';
import { HeartPulse, ArrowRight, ShieldCheck, Activity, Users, Laptop, Zap, CloudOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="glass-card p-6 md:p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-br from-hospital-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6 text-hospital-600" />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

const Auth = () => {
  const { loginMock } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-hospital-200 selection:text-hospital-900 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-hospital-400/20 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[120px] mix-blend-multiply" />
      </div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 py-4 px-6 md:px-12 backdrop-blur-md bg-white/40 border-b border-white/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-hospital-500 to-hospital-600 rounded-xl shadow-lg shadow-hospital-500/30">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">NexusHMS</span>
          </div>
          <button 
            onClick={loginMock}
            className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Launch System <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <main className="relative pt-32 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="flex flex-col items-center text-center mt-12 md:mt-24 mb-32">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-hospital-100 shadow-sm mb-8 animate-fade-in-up">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hospital-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-hospital-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wide text-hospital-800 uppercase">System Online & Active</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
              Modernizing Healthcare <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-hospital-500 to-purple-600">
                Operations & Care
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              NexusHMS is an offline-capable, highly secure medical portal. Manage patients, track bed occupancy, process lab reports, and analyze hospital revenue—all from one beautiful interface.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={loginMock}
                className="group relative inline-flex items-center justify-center gap-3 bg-hospital-600 text-white px-8 py-4 rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-hospital-500/25"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                Access Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <ShieldCheck className="w-5 h-5 opacity-70" /> Secured System
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard 
              icon={CloudOff}
              title="Locally Resilient"
              desc="Built as a PWA with IndexedDB data sync. The registration desk keeps running even when the hospital's internet goes down."
            />
            <FeatureCard 
              icon={Activity}
              title="Real-time Vitals"
              desc="Live dashboard updates let management track available beds, current inpatient volume, and daily outpatient visits instantly."
            />
            <FeatureCard 
              icon={Zap}
              title="Blazing Fast"
              desc="Optimistic UI updates mean zero loading spinners. Staff can navigate through medical records and billing at lightning speed."
            />
            <FeatureCard 
              icon={Laptop}
              title="Unified Billing"
              desc="Generate invoices for both inpatients and outpatients with a single click. Seamlessly integrated with lab test charges."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Role-Based Security"
              desc="Strict Row Level Security guarantees data privacy. Staff see what they need; Management gets full financial access."
            />
            <FeatureCard 
              icon={Users}
              title="Complete Patient Graph"
              desc="Track patients from outpatient visits to inpatient admission to discharge, ensuring continuity of care and complete medical history."
            />
          </div>

          {/* Bottom CTA */}
          <div className="mt-32 mb-12 relative rounded-3xl overflow-hidden glass-card p-12 text-center md:text-left md:flex items-center justify-between">
            <div className="absolute inset-0 bg-gradient-to-r from-hospital-600 to-purple-800 opacity-90" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            
            <div className="relative z-10 max-w-xl text-white mb-8 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to upgrade your hospital?</h2>
              <p className="text-hospital-100/80 text-lg">Experience the future of medical administration. Dive into the live demo dashboard right now.</p>
            </div>
            
            <div className="relative z-10">
              <button 
                onClick={loginMock}
                className="bg-white text-hospital-700 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all w-full md:w-auto"
              >
                Launch Live Demo
              </button>
            </div>
          </div>

          {/* Footer Text */}
          <div className="text-center pb-8 text-slate-400 text-sm font-medium">
            <p>Designed for scale, secured by Supabase, built with React.</p>
            <p className="mt-1 opacity-60">© 2026 NexusHMS Inc.</p>
          </div>

        </div>
      </main>

      {/* Global generic animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
};

export default Auth;
