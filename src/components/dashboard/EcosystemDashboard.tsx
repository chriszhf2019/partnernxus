import React, { useState } from 'react';
import { 
  X,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useConfig } from '../../contexts/ConfigContext';
import { useCockpitData } from '../../hooks/useData';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { PipelineBoard } from './PipelineBoard';
import { QuarterlyOpsControlTower } from './QuarterlyOpsControlTower';
import { StrategicMatrix } from './StrategicMatrix';
import { CapabilityGraphEngine } from './CapabilityGraphEngine';
import { IntegratedMetricSection } from './IntegratedMetricSection';
import { StrategicGoalBoard } from './StrategicGoalBoard';
import { RevenueTrendChart, PartnerTierChart, PipelineFunnelChart } from './DashboardCharts';

interface EcosystemDashboardProps {
  onViewChange: (view: string) => void;
  onSelectPartner: (id: string | null) => void;
}


const HistoricalTrendChart = () => {
  const [showPerformance, setShowPerformance] = useState(true);
  const [showOrders, setShowOrders] = useState(true);

  // Generate 12 quarters of data (3 years)
  const chartData = [
    { name: '21Q1', rev: 2800000, orders: 120 },
    { name: '21Q2', rev: 3200000, orders: 150 },
    { name: '21Q3', rev: 3100000, orders: 140 },
    { name: '21Q4', rev: 4500000, orders: 210 },
    { name: '22Q1', rev: 3500000, orders: 180 },
    { name: '22Q2', rev: 4200000, orders: 220 },
    { name: '22Q3', rev: 3900000, orders: 190 },
    { name: '22Q4', rev: 5800000, orders: 310 },
    { name: '23Q1', rev: 4200000, orders: 240 },
    { name: '23Q2', rev: 5100000, orders: 280 },
    { name: '23Q3', rev: 4800000, orders: 260 },
    { name: '23Q4', rev: 7200000, orders: 420 },
  ];

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-4 bg-primary rounded-full" />
          <span className="text-xs font-black text-slate-900 uppercase tracking-widest">3年销售业绩与订单趋势回顾 (3-Year Sales & Volume Trend)</span>
        </div>
        <div className="flex gap-4">
           <label className="flex items-center gap-2 cursor-pointer group">
             <input 
               type="checkbox" 
               checked={showPerformance} 
               onChange={() => setShowPerformance(!showPerformance)}
               className="hidden"
             />
             <div className={cn(
               "w-4 h-4 rounded-md border transition-all flex items-center justify-center",
               showPerformance ? "bg-primary border-primary shadow-sm" : "bg-white border-slate-200"
             )}>
               {showPerformance && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
             </div>
             <span className={cn("text-[10px] font-black uppercase transition-colors tracking-widest", showPerformance ? "text-primary" : "text-slate-400")}>销售业绩 (Revenue)</span>
           </label>
           <label className="flex items-center gap-2 cursor-pointer group">
             <input 
               type="checkbox" 
               checked={showOrders} 
               onChange={() => setShowOrders(!showOrders)}
               className="hidden"
             />
             <div className={cn(
               "w-4 h-4 rounded-md border transition-all flex items-center justify-center",
               showOrders ? "bg-emerald-500 border-emerald-500 shadow-sm" : "bg-white border-slate-200"
             )}>
               {showOrders && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
             </div>
             <span className={cn("text-[10px] font-black uppercase transition-colors tracking-widest", showOrders ? "text-emerald-500" : "text-slate-400")}>订单数量 (Orders)</span>
           </label>
        </div>
      </div>

      <div className="h-48 w-full px-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
              hide={!showPerformance}
              tickFormatter={(val) => `¥${(val / 1000000).toFixed(0)}M`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
              hide={!showOrders}
            />
            <Tooltip 
              contentStyle={{ 
                fontSize: '10px', 
                fontWeight: 900, 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              labelStyle={{ color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            {showPerformance && (
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="rev" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            )}
            {showOrders && (
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="orders" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Growth</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Expansion</span>
        </div>
      </div>
    </div>
  );
};

export const EcosystemDashboard: React.FC<EcosystemDashboardProps> = ({ onViewChange, onSelectPartner }) => {
  const { config } = useConfig();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const cockpitData = useCockpitData();

  const INDUSTRIES = config.industries;
  const REGIONS = config.regions;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearAllTags = () => setSelectedTags([]);

  const filterGroups = [
    { label: '角色', tags: ['VAD', 'VAR', 'ISV', 'SI'] },
    { label: '行业', tags: INDUSTRIES },
    { label: '级别', tags: config.partnerTiers },
  ];

  return (
    <div className="space-y-12 pb-24">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <LayoutDashboard className="w-7 h-7 text-primary" />
              生态全景驾驶舱 (Master Cockpit)
            </h1>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-4">
            思维可视化 · 结果 {'->'} 诊断 {'->'} 执行
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated</p>
            <p className="text-[11px] font-bold text-slate-900">Today, 10:45 AM</p>
          </div>
        </div>
      </div>

      {/* 1.5 Historical Trend Chart (Added between header and sections) */}
      <HistoricalTrendChart />

      {/* 2. Core Dashboard Sections (Integrated Master-Detail) */}
      <div className="space-y-8">
        {/* Section 1: Revenue (The Priority) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">01. 业绩概览 (Performance Outlook)</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          <IntegratedMetricSection data={cockpitData.revenue} isCurrency />
        </div>

        {/* Strategic Goal Board & AI Diagnosis (Prescription - Integrated with AI) */}
        {config.sections.revenueAlignment && (
          <StrategicGoalBoard revenue={cockpitData.revenue} insights={cockpitData.insights} onNavigate={onViewChange} />
        )}

        {/* Section 2: Active Partners (The Driver) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">02. 生态合作驱动力</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          <IntegratedMetricSection data={cockpitData.activePartners} />
        </div>

        {/* Section 3: Opportunities & Funnel (The Future - Combined) */}
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">03. 商机储备与转化漏斗</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <IntegratedMetricSection data={cockpitData.pipeline} isCurrency />
              <IntegratedMetricSection data={cockpitData.leadsConversion} />
            </div>
          </div>
        </div>

        {/* Section 4: Marketing & Incentives (Added Section) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">04. 营销赋能与激励效能</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          <IntegratedMetricSection data={cockpitData.marketing} isCurrency />
        </div>
      </div>

      {/* 5. Diagnosis Section (Diagnosis) */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">四力驱动诊断 (Diagnosis Engine)</h3>
          <div className="h-px flex-1 bg-slate-100" />
        </div>
        
        {/* Pipeline & Performance Board (Capability & Activity) */}
        {config.sections.revenueAlignment && <PipelineBoard onNavigate={onViewChange} />}

        {/* Quarterly Ops Control Tower (Efficiency) */}
        {config.sections.mdfEfficiency && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <QuarterlyOpsControlTower onNavigate={onViewChange} />
          </motion.div>
        )}
      </div>

      {/* 6. Interactive Charts & Strategic Matrix */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">执行深度透视 (Execution Deep Dive)</h3>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <RevenueTrendChart />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <PartnerTierChart />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <PipelineFunnelChart />
          </motion.div>
        </div>

        {/* Tag Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-8">
            {filterGroups.map(group => (
              <div key={group.label} className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.label}:</span>
                <div className="flex gap-1.5">
                  {group.tags.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)} className={cn("px-3 py-1 rounded-lg text-[10px] font-bold transition-all border", selectedTags.includes(tag) ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300")}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <AnimatePresence>
            {selectedTags.length > 0 && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={clearAllTags} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-3 h-3" /> Clear All
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Strategic Matrix Sandtable */}
        {config.sections.partnershipMatrix && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-5">
              <StrategicMatrix />
            </div>
            <div className="col-span-12 lg:col-span-7">
              <CapabilityGraphEngine />
            </div>
          </div>
        )}

        {config.sections.ecosystemNetwork && !config.sections.partnershipMatrix && (
          <div className="grid grid-cols-1 gap-6">
            <CapabilityGraphEngine />
          </div>
        )}
      </div>
    </div>
  );
};
