import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const TopNav: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/partners?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-8 border-b border-slate-200/20 dark:border-slate-800/20 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input
            className="w-full bg-surface-container-low dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm dark:text-slate-200 focus:ring-2 focus:ring-secondary/20 transition-all outline-none"
            placeholder={t('partners.search')}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors relative" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white dark:border-slate-950"></span>
        </button>
        <div className="h-8 w-[1px] bg-outline-variant/20 mx-2"></div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-on-surface-variant dark:text-slate-400">PEM System</span>
          <img
            alt="Organization Logo"
            className="w-8 h-8 rounded-md bg-primary/10"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAM6BBfHuQ_3FSuKJZje1tLnaAN4NkpqFWjn9JGn6jVRb5tmq9EyBugJZsKeEZdifbGimUFZFvzfHl1HK0Z8Ky40NY_9CuEMsDEQZuaoMbI_3NypLj8mlcnHRm63YiYK-gBCW9xzW6QrY0DP5aKdfWvELTvuRitfRwXwpskv0V5YA9pWDRvjPaRSVIeI7ZyxuQqA8OnomJv-72skDvC_QZIEm1pKBD9soEhuCtbWZ4SZM2hThHy8SudHLKnEv1drZ5SGPI_-C3E15Q"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
};
