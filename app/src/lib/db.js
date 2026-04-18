import { openDB } from 'idb'

const DB_NAME = 'hms-offline-db';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('patients')) {
        db.createObjectStore('patients', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const saveOfflinePatient = async (patientData) => {
  const db = await initDB();
  const tx = db.transaction(['patients', 'sync-queue'], 'readwrite');
  
  // Store locally for immediate UI use
  await tx.objectStore('patients').put({ ...patientData, syncStatus: 'pending' });
  
  // Add to sync queue
  await tx.objectStore('sync-queue').add({
    action: 'CREATE_PATIENT',
    payload: patientData,
    timestamp: Date.now()
  });
  
  await tx.done;
  console.log("Patient saved offline and queued for sync:", patientData);
};

export const getOfflinePatients = async () => {
  const db = await initDB();
  return db.getAll('patients');
};

export const syncPendingData = async (supabase) => {
  if (!navigator.onLine) return;
  
  const db = await initDB();
  const queue = await db.getAll('sync-queue');
  
  if (queue.length === 0) return;

  console.log(`Syncing ${queue.length} items to Supabase...`);

  for (const item of queue) {
    if (item.action === 'CREATE_PATIENT') {
      try {
        const { error } = await supabase.from('patients').insert([item.payload]);
        
        if (!error) {
          // Remove from queue
          const tx = db.transaction(['patients', 'sync-queue'], 'readwrite');
          await tx.objectStore('sync-queue').delete(item.id);
          
          // Update patient syncStatus
          const patient = await tx.objectStore('patients').get(item.payload.id);
          if (patient) {
             patient.syncStatus = 'synced';
             await tx.objectStore('patients').put(patient);
          }
          await tx.done;
          console.log(`Successfully synced patient: ${item.payload.id}`);
        } else {
          console.error("Sync error for patient:", error);
        }
      } catch (err) {
        console.error("Sync caught error:", err);
      }
    }
  }
};
