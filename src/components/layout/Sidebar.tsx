import { memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Handshake, FileText, Megaphone, Gift,
  GraduationCap, BarChart3, Settings, Plus, Network, Sun, Moon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

interface NavItem {
  path: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
}

const NAV_GROUPS: { items: NavItem[] }[] = [
  {
    items: [
      { path: '/ecosystem', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    ],
  },
  {
    items: [
      { path: '/partners', labelKey: 'nav.partners', icon: Handshake },
      { path: '/deals', labelKey: 'nav.deals', icon: FileText },
    ],
  },
  {
    items: [
      { path: '/marketing', labelKey: 'nav.marketing', icon: Megaphone },
      { path: '/incentives', labelKey: 'nav.incentives', icon: Gift },
      { path: '/enablement', labelKey: 'nav.enablement', icon: GraduationCap },
    ],
  },
  {
    items: [
      { path: '/analytics', labelKey: 'nav.analytics', icon: BarChart3 },
      { path: '/settings', labelKey: 'nav.settings', icon: Settings },
    ],
  },
];

export const Sidebar = memo(() => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/ecosystem' && location.pathname.startsWith(path));

  return (
    <aside
      className="h-screen w-60 fixed left-0 top-0 flex flex-col z-50 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center">
            <Network className="text-white dark:text-neutral-900 w-4 h-4" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">PartnerNexus</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-auto">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && <div className="mx-3 mb-2 h-px bg-neutral-200 dark:bg-neutral-800" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                        : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white',
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{t(item.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* CTA */}
      <div className="px-3 pb-2">
        <button
          onClick={() => navigate('/deals/new')}
          className="w-full h-9 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {t('deals.add')}
        </button>
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 border-t border-neutral-200 dark:border-neutral-800 pt-3">
        <div className="flex items-center justify-between mb-2.5">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="flex gap-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-md p-0.5">
            <button
              onClick={() => setLanguage('zh')}
              className={cn('px-2.5 py-1 rounded text-[11px] font-medium transition-all', language === 'zh' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500')}
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={cn('px-2.5 py-1 rounded text-[11px] font-medium transition-all', language === 'en' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500')}
            >
              EN
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
            AR
          </div>
          <div className="overflow-hidden">
            <p className="text-[12px] font-medium text-neutral-900 dark:text-white truncate">Alex Rivera</p>
            <p className="text-[11px] text-neutral-400 truncate">Ecosystem Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
});
