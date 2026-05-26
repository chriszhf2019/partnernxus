import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const NetworkStatus = () => {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="bg-amber-500 text-white">
      <div className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold">
        <WifiOff className="w-4 h-4" />
        You are offline. Some features may be unavailable.
      </div>
    </div>
  );
};
