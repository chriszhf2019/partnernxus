import React, { useState } from 'react';
import { 
  Network, 
  Fingerprint, 
  Check, 
  Plus, 
  Search, 
  Stethoscope, 
  Cloud, 
  Award, 
  Send, 
  BookOpen, 
  DollarSign, 
  Target,
  X,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';

type ViewMode = 'history' | 'capability';

interface FilterTag {
  id: string;
  label: string;
  active: boolean;
}

export const CapabilityGraphEngine: React.FC = () => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('capability');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterTag[]>([
    { id: 'industry', label: '聚焦行业 (医疗、政务)', active: true },
    { id: 'product', label: '主打产品线 (云原生、AI算力)', active: true },
    { id: 'tier', label: '合作级别 (金牌、银牌)', active: true },
    { id: 'size', label: '客户体量', active: false },
  ]);

  const toggleFilter = (id: string) => {
    setFilters(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f));
  };

  // Hub positions (simulated)
  const hubs = [
    { id: 'h1', label: '医疗行业', icon: <Stethoscope className="w-4 h-4" />, x: '15%', y: '20%' },
    { id: 'h2', label: '云原生产品', icon: <Cloud className="w-4 h-4" />, x: '85%', y: '25%' },
    { id: 'h3', label: '银牌级', icon: <Award className="w-4 h-4" />, x: '50%', y: '85%' },
  ];

  // Target Cohort Partners (Center)
  const targetPartners = [
    { id: 'p1', name: '中科软', x: '46%', y: '42%' },
    { id: 'p2', name: '东华软件', x: '54%', y: '45%' },
    { id: 'p3', name: '卫宁健康', x: '50%', y: '55%' },
    { id: 'p4', name: '创业慧康', x: '42%', y: '50%' },
  ];

  // Scattered Partners (Periphery)
  const scatteredPartners = [
    { id: 's1', name: '伙伴A', x: '20%', y: '60%' },
    { id: 's2', name: '伙伴B', x: '80%', y: '70%' },
    { id: 's3', name: '伙伴C', x: '30%', y: '15%' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[600px] relative overflow-hidden">
      {/* 1. Control Bar */}
      <div className="p-4 border-b border-slate-100 space-y-4 bg-slate-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-900 rounded-lg text-white">
              <Fingerprint className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-black text-slate-900">{t('graph.title')}</h4>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
            <button
              onClick={() => setViewMode('history')}
              className={cn(
                "px-4 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center gap-2",
                viewMode === 'history' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Network className="w-3.5 h-3.5" /> {t('graph.history')}
            </button>
            <button
              onClick={() => setViewMode('capability')}
              className={cn(
                "px-4 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center gap-2",
                viewMode === 'capability' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Zap className="w-3.5 h-3.5" /> {t('graph.capability')}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1.5",
                filter.active 
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              )}
            >
              {filter.active ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Graph Canvas */}
      <div className="flex-1 relative bg-slate-50/50 overflow-hidden cursor-grab active:cursor-grabbing">
        {/* SVG Lines (Edges) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          {/* Lines from center to hubs */}
          {hubs.map(hub => (
            <React.Fragment key={hub.id}>
              {targetPartners.map(p => (
                <line 
                  key={`${hub.id}-${p.id}`}
                  x1={p.x} y1={p.y} 
                  x2={hub.x} y2={hub.y} 
                  stroke="#64748b" 
                  strokeWidth="1" 
                  strokeDasharray="4,4" 
                />
              ))}
            </React.Fragment>
          ))}
        </svg>

        {/* Hub Nodes */}
        {hubs.map(hub => (
          <div 
            key={hub.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 z-20 border border-slate-700"
            style={{ left: hub.x, top: hub.y }}
          >
            {hub.icon}
            <span className="text-[11px] font-black tracking-wider uppercase">{hub.label}</span>
          </div>
        ))}

        {/* Target Cohort Highlight Glow */}
        <div 
          onClick={() => setIsDrawerOpen(true)}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-400/5 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] border-2 border-dashed border-blue-400/30 animate-[pulse_4s_infinite] cursor-pointer group z-10"
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
            ✨ {t('graph.targetCohort')}
          </div>
          <div className="absolute inset-0 bg-blue-400/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Partner Nodes (Target) */}
        {targetPartners.map(p => (
          <div 
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-30"
            style={{ left: p.x, top: p.y }}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-black">
              {p.name[0]}
            </div>
            <span className="text-[9px] font-bold text-slate-600 bg-white/80 px-1.5 py-0.5 rounded shadow-sm">{p.name}</span>
          </div>
        ))}

        {/* Partner Nodes (Scattered) */}
        {scatteredPartners.map(p => (
          <div 
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-40 grayscale"
            style={{ left: p.x, top: p.y }}
          >
            <div className="w-6 h-6 rounded-full bg-slate-400 border border-white shadow-sm"></div>
            <span className="text-[8px] font-medium text-slate-400">{p.name}</span>
          </div>
        ))}
      </div>

      {/* 3. Strategy Action Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-[320px] bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-black text-slate-900">选中群体：医疗云新星群</h5>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">共包含 4 家匹配的银牌伙伴</p>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-auto p-5 space-y-8">
                {/* Module A: Matchmaking */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Search className="w-4 h-4" />
                    <h6 className="text-[11px] font-black uppercase tracking-widest">{t('graph.matchmaking')}</h6>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 space-y-3">
                    <p className="text-[10px] font-bold text-blue-800">当前有 12 条待分配的医疗行业线索</p>
                    <button className="w-full py-2.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                      <Send className="w-3.5 h-3.5" /> 批量派发医疗行业新线索
                    </button>
                  </div>
                </div>

                {/* Module B: Playbook Execution */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Zap className="w-4 h-4" />
                    <h6 className="text-[11px] font-black uppercase tracking-widest">{t('graph.playbook')}</h6>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: <BookOpen className="w-3.5 h-3.5" />, label: '指派培训《医疗云合规白皮书》', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                      { icon: <DollarSign className="w-3.5 h-3.5" />, label: '开放定向营销基金 (MDF) 报销率至 70%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { icon: <Target className="w-3.5 h-3.5" />, label: '下达晋升对赌 KPI (银牌 → 金牌)', color: 'text-orange-600', bg: 'bg-orange-50' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", item.bg, item.color)}>
                            {item.icon}
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 leading-tight max-w-[140px]">{item.label}</span>
                        </div>
                        <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-5 bg-slate-50 border-t border-slate-100">
                <button className="w-full py-3 bg-slate-900 text-white text-[11px] font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  {t('graph.execute')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
