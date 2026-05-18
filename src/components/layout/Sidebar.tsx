import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Handshake,
  FileText,
  BarChart3,
  Settings,
  PlusCircle,
  Network,
  Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const Sidebar = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'ecosystem', path: '/ecosystem', label: t('nav.ecosystem'), icon: LayoutDashboard },
    { id: 'partners', path: '/partners', label: t('nav.partners'), icon: Handshake },
    { id: 'deals', path: '/deals', label: t('nav.deals'), icon: FileText },
    { id: 'marketing', path: '/marketing', label: t('nav.marketing'), icon: BarChart3 },
    { id: 'settings', path: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-50 dark:bg-slate-900 flex flex-col py-6 font-headline text-sm font-medium z-50 border-r border-slate-200/50 dark:border-slate-800" role="navigation" aria-label="Main navigation">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Network className="text-white w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <div className="text-xl font-bold text-blue-900 dark:text-blue-100">PartnerNexus</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">The Digital Curator</div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            aria-current={isActive(item.path) ? 'page' : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 transition-colors rounded-lg",
              isActive(item.path)
                ? "text-blue-700 dark:text-blue-300 font-bold border-r-4 border-blue-700 bg-blue-50/50 dark:bg-blue-900/10"
                : "text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            )}
          >
            <item.icon className="w-5 h-5" aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-4 mt-6">
        <button
          onClick={() => navigate('/deals/new')}
          aria-label="Register New Deal"
          className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
        >
          <PlusCircle className="w-5 h-5" aria-hidden="true" />
          Register New Deal
        </button>
      </div>

      <div className="px-6 mt-auto pt-6 border-t border-slate-200/50 dark:border-slate-800 space-y-4">
        <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-700">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <div className="flex items-center gap-2 px-1">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{language === 'zh' ? '中文' : 'EN'}</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setLanguage('zh')}
              aria-label="Switch to Chinese"
              className={cn(
                "px-2 py-1 rounded text-[10px] font-black transition-all",
                language === 'zh' ? "bg-primary text-white shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              ZH
            </button>
            <button
              onClick={() => setLanguage('en')}
              aria-label="Switch to English"
              className={cn(
                "px-2 py-1 rounded text-[10px] font-black transition-all",
                language === 'en' ? "bg-primary text-white shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              EN
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 shadow-sm">
          <img
            alt="User Avatar"
            className="w-8 h-8 rounded-full bg-slate-200"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqGlG0GoMp3Vgg2bqISihSiWyPKY0xSIcZqtsE_nJzyVxTtmgSlBjp2xCtq6nn2mHs3zhIwSb5LeooV-E7jMb9k4sp3LrxYzyPpmRWG4OZPLImvPKLAIf7G64sNtnyYDsRZDLpMkrR0fl2O4zI8rZVi1GbnWS6cpZiBAXBgRUeDEEfSFenzrMFrQHXou0vqjNKyX-hb30ot-CMCrbofjBjCISKa-thvezZ4v192SuUOLOQAMcpJ9OQRp1axUedIy_b1Ayl9musMUpX"
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate dark:text-slate-200">Alex Rivera</p>
            <p className="text-[10px] text-on-surface-variant dark:text-slate-400 truncate">Ecosystem Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
