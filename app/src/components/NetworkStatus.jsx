import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { syncPendingData } from '../lib/db';
import { supabase } from '../lib/supabase';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      // Let standard React render finish before blocking
      setTimeout(async () => {
        await syncPendingData(supabase);
        setIsSyncing(false);
      }, 500);
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync
    if (navigator.onLine) {
        handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`fixed bottom-4 right-4 rounded-full px-4 py-2 shadow-lg flex items-center gap-2 transition-all duration-300 ${isOnline ? (isSyncing ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700') : 'bg-red-100 text-red-700'}`}>
      {isOnline ? (
        <>
          <Wifi className="w-5 h-5" />
          <span className="font-medium text-sm">{isSyncing ? 'Syncing...' : 'Online'}</span>
          {isSyncing && <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin ml-2"></div>}
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5" />
          <span className="font-medium text-sm">Offline Mode</span>
        </>
      )}
    </div>
  );
};

export default NetworkStatus;
