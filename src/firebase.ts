// Firebase has been migrated to Supabase
// See src/lib/supabase.ts for the new client
// This file kept for backward compatibility during migration
export const db = null as any;
export const auth = {
  currentUser: null,
  onAuthStateChanged: (cb: any) => { cb(null); return () => {}; },
} as any;
