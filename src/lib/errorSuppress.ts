// Suppress known production runtime errors:
// 1. motion/react "removeChild" — AnimatePresence exit animation conflicts with React reconciliation
// 2. Supabase client errors when env vars are not configured
export function suppressKnownErrors() {
  // Patch removeChild to be idempotent
  const _removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (!this.contains(child)) return child;
    return _removeChild.call(this, child) as T;
  };

  // Catch unhandled errors from Supabase/Firebase when not configured
  window.addEventListener('error', (e) => {
    const msg = e.message || '';
    // Suppress Supabase URL errors in production
    if (msg.includes('supabase') || msg.includes('URL') || msg.includes('url')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

  // Catch unhandled promise rejections for missing backend services
  window.addEventListener('unhandledrejection', (e) => {
    const msg = e.reason?.message || e.reason || '';
    if (typeof msg === 'string' && (
      msg.includes('supabase') || msg.includes('not configured') ||
      msg.includes('fetch failed') || msg.includes('Failed to fetch')
    )) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
}
