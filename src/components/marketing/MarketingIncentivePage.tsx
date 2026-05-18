import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { StrategyCommandCenter } from './StrategyCommandCenter';
import { IncentiveModule } from './IncentiveModule';
import { useMarketingData } from '../../hooks/useData';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Target, TrendingUp } from 'lucide-react';

type ViewType = 'revenue' | 'incentive';

export const MarketingIncentivePage: React.FC = () => {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<ViewType>('revenue');
  const { incentiveStats, incentivePrograms } = useMarketingData();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{t('marketing.title')}</h1>
          <p className="text-slate-400 text-sm font-bold opacity-80 uppercase tracking-widest">{t('marketing.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          {[
            { id: 'revenue', label: '营收对齐策略', icon: Target },
            { id: 'incentive', label: '激励投资 ROI', icon: TrendingUp },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as ViewType)}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all",
                activeView === view.id
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <view.icon className="w-4 h-4" />
              {view.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'revenue' ? (
            <StrategyCommandCenter />
          ) : (
            <IncentiveModule stats={incentiveStats} programs={incentivePrograms} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
