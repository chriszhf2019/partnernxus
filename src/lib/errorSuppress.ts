// Suppress known production runtime errors:
// 1. motion/react "removeChild" — AnimatePresence exit animation conflicts with React reconciliation
// 2. Supabase client errors when env vars are not configured (dev/localhost only)
const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export function suppressKnownErrors() {
  // Patch removeChild to be idempotent (for motion/react AnimatePresence)
  const _removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (!this.contains(child)) return child;
    return _removeChild.call(this, child) as T;
  };

  // Catch unhandled promise rejections for missing backend services
  window.addEventListener('unhandledrejection', (e) => {
    const msg = (e.reason?.message || e.reason || '') as string;
    if (typeof msg === 'string') {
      // Only suppress Supabase URL configuration errors
      if (msg.includes('supabaseUrl is required') || msg.includes('Missing supabase')) {
        if (isDev) console.warn('[Suppressed] Supabase not configured:', msg.slice(0, 80));
        e.preventDefault();
        return;
      }
    }
  });
}
