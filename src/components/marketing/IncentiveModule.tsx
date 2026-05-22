import React, { useState } from 'react';
import { 
  Zap, 
  Target, 
  TrendingUp, 
  Users, 
  ChevronRight, 
  Plus, 
  Filter,
  MoreHorizontal,
  Handshake,
  ShieldCheck,
  AlertCircle,
  Trophy,
  Coins,
  Rocket,
  Gift,
  Info,
  BarChart3,
  Activity,
  Briefcase,
  Calendar,
  Clock,
  History,
  CheckCircle2
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { IncentiveProgram, IncentiveStats } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CreateIncentiveModal } from './CreateIncentiveModal';
import { IncentiveDetailModal } from './IncentiveDetailModal';

interface IncentiveModuleProps {
  stats: IncentiveStats;
  programs: IncentiveProgram[];
}

export const IncentiveModule: React.FC<IncentiveModuleProps> = ({ stats, programs }) => {
  const { t } = useLanguage();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'ended'>('active');

  const calculateDuration = (start: string, end: string) => {
    const now = new Date('2026-04-07'); // Current date from context
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const elapsed = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const remaining = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const total = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const timeProgress = Math.min(100, Math.max(0, (elapsed / total) * 100));

    return { elapsed, remaining, timeProgress };
  };

  const filteredPrograms = programs.filter(p => 
    activeTab === 'active' ? p.status === 'Active' : p.status === 'Ended'
  );

  const getIconForTrigger = (trigger: string) => {
    switch (trigger) {
      case 'Competitive': return { icon: ShieldCheck, bg: 'bg-red-50', color: 'text-red-600', border: 'border-red-100' };
      case 'New Product': return { icon: Rocket, bg: 'bg-[#f5f5f7]', color: 'text-blue-600', border: 'border-blue-100' };
      case 'Sales Acceleration': return { icon: Zap, bg: 'bg-emerald-50', color: 'text-emerald-600', border: 'border-emerald-100' };
      default: return { icon: BarChart3, bg: 'bg-slate-50', color: 'text-slate-600', border: 'border-slate-100' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <CreateIncentiveModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      
      {selectedProgram && (
        <IncentiveDetailModal 
          isOpen={!!selectedProgram} 
          onClose={() => setSelectedProgram(null)} 
          program={{
            ...selectedProgram,
            budget: formatCurrency(selectedProgram.totalBudget),
            consumed: formatCurrency(selectedProgram.claimedAmount),
            progress: Math.round((selectedProgram.claimedAmount / selectedProgram.totalBudget) * 100),
            partnersCount: selectedProgram.participantsCount,
            eligibleOpps: Math.round(selectedProgram.participantsCount * 2.8), // Mocking for detail
            objective: selectedProgram.trigger,
            target: '定向: 签约伙伴'
          }}
        />
      )}
      
      {/* Module 1: Global Investment & ROI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: YTD Spend (Pacing & Health) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">年度激励预算消耗 (YTD Spend)</p>
            <Coins className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-black text-black dark:text-white tracking-tight">{formatCurrency(stats.totalPayoutYTD)}</h3>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-full border border-emerald-100 flex items-center gap-1">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
              On Track (健康)
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-500">已消耗 62.3%</span>
              <span className="text-slate-400">总预算 ¥20M</span>
            </div>
            <div className="relative h-2 w-full bg-[#f5f5f7] rounded-full overflow-hidden">
              <div className="h-full bg-slate-900 rounded-full relative z-10" style={{ width: '62.3%' }} />
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-20" 
                style={{ left: '50%' }}
                title="当前时间基准 (Pacing)"
              >
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-400 rounded-full border border-white" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pacing Baseline: 50%</p>
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">+12.3% Ahead</p>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Global ROI (Output & Benchmarks) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">整体投资回报率 (Global ROI)</p>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-emerald-600 tracking-tight mb-4">1 : 18.5</h3>
          <div className="space-y-2.5 pt-2 border-t border-black/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">产出 Pipeline</span>
              <span className="text-xs font-black text-slate-900">¥230.3M</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">目标基准 (Target ROI)</span>
              <span className="text-xs font-bold text-slate-400">1 : 15.0</span>
            </div>
            <div className="h-1 w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500/30" style={{ width: '100%' }} />
            </div>
          </div>
        </motion.div>

        {/* Card 3: Adoption Rate (Structure & Penetration) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">核心伙伴激励渗透率 (Adoption Rate)</p>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-black text-black dark:text-white tracking-tight mb-1">{stats.avgParticipationRate}%</h3>
              <p className="text-[10px] font-bold text-slate-500">245 / 380 家目标伙伴已核销奖金</p>
            </div>
            <div className="text-right space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">白金/金牌覆盖</span>
                  <span className="text-[10px] font-black text-slate-900">85%</span>
                </div>
                <div className="w-16 h-1 bg-[#f5f5f7] rounded-full overflow-hidden ml-auto">
                  <div className="h-full bg-slate-900" style={{ width: '85%' }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">银牌/注册覆盖</span>
                  <span className="text-[10px] font-black text-slate-500">40%</span>
                </div>
                <div className="w-16 h-1 bg-[#f5f5f7] rounded-full overflow-hidden ml-auto">
                  <div className="h-full bg-slate-400" style={{ width: '40%' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-black/5">
            <p className="text-[9px] font-bold text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> 长尾伙伴激活率低于基准 15%
            </p>
          </div>
        </motion.div>
      </div>

      {/* Module 2: Strategic Allocation & Performance Summary */}
      <section className="bg-white dark:bg-[#1c1c1e] p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-black text-black dark:text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-black dark:text-white" />
              本年度激励预算的商业目标分布与执行成效
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Strategic Intent, Budget Allocation & Performance by Objective.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">健康 (Healthy)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">预警 (At Risk)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { 
              label: '基础规模返点', 
              sub: 'Volume Rebates', 
              value: '45%', 
              color: 'bg-slate-900', 
              icon: BarChart3,
              count: 12,
              partners: 342,
              pipeline: '¥103.5M',
              roi: '1:22',
              status: 'Healthy'
            },
            { 
              label: '新产品破冰', 
              sub: 'New Product SPIFFs', 
              value: '25%', 
              color: 'bg-black', 
              icon: Rocket,
              count: 8,
              partners: 156,
              pipeline: '¥58.2M',
              roi: '1:15',
              status: 'Healthy'
            },
            { 
              label: '竞品替换阻击', 
              sub: 'Competitive Takeout', 
              value: '15%', 
              color: 'bg-red-600', 
              icon: ShieldCheck,
              count: 4,
              partners: 45,
              pipeline: '¥34.5M',
              roi: '1:28',
              status: 'Healthy'
            },
            { 
              label: '销售结单加速', 
              sub: 'Velocity Accelerators', 
              value: '15%', 
              color: 'bg-black', 
              icon: Zap,
              count: 6,
              partners: 89,
              pipeline: '¥34.1M',
              roi: '1:12',
              status: 'At Risk'
            },
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 group hover:bg-white hover:shadow-xl hover:border-black/5 dark:border-white/5 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-xl text-white shadow-lg", item.color)}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-black dark:text-white leading-none">{item.value}</span>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", item.status === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500')} />
                    <span className={cn("text-[8px] font-black uppercase tracking-tighter", item.status === 'Healthy' ? 'text-emerald-600' : 'text-amber-600')}>{item.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-xs font-black text-black dark:text-white mb-0.5">{item.label}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.sub}</p>
              </div>

              <div className="grid grid-cols-2 gap-y-3 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">项目数量 (Count)</p>
                  <p className="text-xs font-black text-slate-900">{item.count} 个</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">参与伙伴 (Partners)</p>
                  <p className="text-xs font-black text-slate-900">{item.partners} 家</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">产出 Pipeline</p>
                  <p className="text-xs font-black text-slate-900">{item.pipeline}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">ROI 表现</p>
                  <p className="text-xs font-black text-emerald-600 font-mono">{item.roi}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 h-3 w-full bg-[#f5f5f7] rounded-full overflow-hidden flex shadow-inner">
          <div className="h-full bg-slate-900 transition-all duration-1000" style={{ width: '45%' }} />
          <div className="h-full bg-black transition-all duration-1000" style={{ width: '25%' }} />
          <div className="h-full bg-red-600 transition-all duration-1000" style={{ width: '15%' }} />
          <div className="h-full bg-black transition-all duration-1000" style={{ width: '15%' }} />
        </div>
      </section>

      {/* Module 3: Active Bounties & Execution */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-black text-black dark:text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-black dark:text-white" />
              激励计划执行看板
            </h2>
            <div className="flex items-center gap-1 p-1 bg-[#f5f5f7] rounded-xl">
              <button 
                onClick={() => setActiveTab('active')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-2",
                  activeTab === 'active' ? "bg-white text-black dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Zap className="w-3 h-3" /> 活跃中 ({programs.filter(p => p.status === 'Active').length})
              </button>
              <button 
                onClick={() => setActiveTab('ended')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-2",
                  activeTab === 'ended' ? "bg-white text-black dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <History className="w-3 h-3" /> 已完成 ({programs.filter(p => p.status === 'Ended').length})
              </button>
            </div>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-slate-900 text-white text-xs font-black rounded-2xl hover:scale-105 transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> 发起新激励
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {filteredPrograms.map((prog) => {
                const { elapsed, remaining, timeProgress } = calculateDuration(prog.startDate, prog.endDate);
                const budgetProgress = Math.round((prog.claimedAmount / prog.totalBudget) * 100);
                const visual = getIconForTrigger(prog.trigger);

                return (
                  <div key={prog.id} className="bg-white dark:bg-[#1c1c1e] p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm hover:border-black dark:border-white/30 transition-all group">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      <div className="lg:col-span-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", visual.bg, visual.color, visual.border)}>
                            <visual.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-900">{prog.title}</h3>
                            <div className="flex gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-[#f5f5f7] text-slate-500 text-[9px] font-black rounded uppercase tracking-widest flex items-center gap-1">
                                <Target className="w-2.5 h-2.5" /> 定向伙伴
                              </span>
                              <span className={cn("px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-widest flex items-center gap-1", visual.bg, visual.color)}>
                                <Activity className="w-2.5 h-2.5" /> {prog.trigger}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-black/5">
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">参与伙伴:</span>
                            <span className="text-xs font-black text-slate-900">{prog.participantsCount} 家</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">符合商机:</span>
                            <span className="text-xs font-black text-emerald-600">{Math.round(prog.participantsCount * 2.8)} 条</span>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Clock className="w-3 h-3" /> 执行进度 (Time)
                            </span>
                            <span className="text-slate-900">{prog.status === 'Ended' ? '已结束' : `${timeProgress.toFixed(0)}%`}</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#f5f5f7] rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", prog.status === 'Ended' ? "bg-slate-400" : "bg-slate-900")} style={{ width: `${timeProgress}%` }} />
                          </div>
                          <div className="flex justify-between text-[9px] font-bold">
                            <span className="text-slate-500">已执行 {elapsed} 天</span>
                            {prog.status === 'Active' && <span className="text-black dark:text-white">剩余 {remaining} 天</span>}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Coins className="w-3 h-3" /> 预算消耗 (Budget)
                            </span>
                            <span className="text-slate-900">{budgetProgress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#f5f5f7] rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", prog.status === 'Ended' ? "bg-emerald-500" : "bg-black dark:bg-white")} style={{ width: `${budgetProgress}%` }} />
                          </div>
                          <div className="flex justify-between text-[9px] font-bold">
                            <span className="text-slate-500">已计提 {formatCurrency(prog.claimedAmount)}</span>
                            <span className="text-slate-400">总额 {formatCurrency(prog.totalBudget)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-2 flex justify-end">
                        <button 
                          onClick={() => setSelectedProgram(prog)}
                          className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] text-slate-400 hover:text-black dark:text-white hover:bg-[#f5f5f7] rounded-2xl transition-all flex items-center gap-2 group/btn"
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity">
                            {prog.status === 'Ended' ? '回顾报告' : '查看明细'}
                          </span>
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};
