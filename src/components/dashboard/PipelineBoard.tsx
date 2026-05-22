import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Target,
  Zap,
  AlertCircle,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

import { useConfig } from '../../contexts/ConfigContext';

interface PipelineBoardProps {
  onNavigate?: (view: string) => void;
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({ onNavigate }) => {
  const { config } = useConfig();
  
  // Mock data for stages, in a real app these amounts would be aggregated from DB
  const mockAmounts = ['¥12.5M', '¥10.2M', '¥8.4M', '¥7.1M', '¥7.0M', '¥5.2M', '¥4.1M'];
  const mockInflows = ['+¥3.0M', '+¥1.5M', '+¥4.2M', '+¥0.8M', '+¥5.5M', '+¥1.2M', '+¥2.0M'];
  const mockOutflows = ['-¥0.8M', '-¥1.2M', '-¥1.5M', '-¥2.1M', '-¥0.0M', '-¥0.5M', '-¥0.3M'];

  const funnelStages = config.salesStages.map((stage, idx) => ({
    name: stage,
    amount: mockAmounts[idx % mockAmounts.length],
    inflow: mockInflows[idx % mockInflows.length],
    outflow: mockOutflows[idx % mockOutflows.length],
    warning: idx === 2 // Keep a sample warning for POC if it's the 3rd stage
  }));

  const currencySymbol = config.currency === 'JPY' || config.currency === 'CNY' ? '¥' : '$';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white rounded-xl shadow-sm border border-black/5 dark:border-white/5 overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100"
    >
      {/* Left Section: 25% - 大盘与商机水源 */}
      <div className="w-full lg:w-1/4 p-5 space-y-6">
        <div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">本季度 Open Pipeline</p>
          <h3 className="text-4xl font-black text-blue-900 tracking-tight">{currencySymbol}45.2M</h3>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[11px] font-medium text-slate-500">本月新增商机</span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +{currencySymbol}8.5M
            </span>
          </div>
        </div>

        <div className="pt-5 border-t border-black/5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-[#86868b] dark:text-[#98989d] uppercase tracking-wider">水源分布 (Source Breakdown)</span>
            <Activity className="w-3 h-3 text-slate-300" />
          </div>
          <div className="h-2.5 w-full flex rounded-full overflow-hidden mb-4 bg-[#f5f5f7]">
            <div className="h-full bg-blue-800 w-[65%] relative group" title="自主报备: 65%">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="h-full bg-blue-300 w-[35%] relative group" title="原厂分配: 35%">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-800"></div>
                <span className="text-[10px] font-bold text-slate-600">自主报备</span>
              </div>
              <p className="text-xs font-black text-black dark:text-white ml-3">65%</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                <span className="text-[10px] font-bold text-slate-600">原厂分配</span>
              </div>
              <p className="text-xs font-black text-black dark:text-white ml-3">35%</p>
            </div>
          </div>
        </div>

        <button onClick={() => onNavigate?.('deals')} className="w-full mt-auto py-2 bg-slate-50 text-slate-500 dark:text-slate-500 text-[10px] font-bold rounded-lg hover:bg-[#f5f5f7] transition-colors flex items-center justify-center gap-1">
          查看水源明细 <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Middle Section: 50% - 5 阶段动态漏斗 */}
      <div className="w-full lg:w-2/4 p-5 bg-slate-50/20 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">销售阶段流转动态 (Sales Funnel Velocity)</h4>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {funnelStages.map((stage, idx) => (
            <React.Fragment key={stage.name}>
              <div className={cn(
                "flex-1 bg-white p-3 rounded-xl border transition-all duration-300 group relative",
                stage.warning ? "border-red-100 shadow-sm shadow-red-50" : "border-black/5 dark:border-white/5 hover:border-blue-200 hover:shadow-md"
              )}>
                <p className="text-[9px] font-bold text-[#86868b] dark:text-[#98989d] mb-2 truncate" title={stage.name}>{idx + 1}. {stage.name}</p>
                <p className="text-sm font-black text-black dark:text-white mb-3 tracking-tight">{stage.amount}</p>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-bold rounded border border-emerald-100/50">
                    <TrendingUp className="w-2 h-2" />
                    {stage.inflow}
                  </div>
                  <div className="flex items-center justify-between px-1.5 py-0.5 bg-slate-50 text-[#86868b] dark:text-[#98989d] text-[8px] font-bold rounded border border-slate-100">
                    <TrendingDown className="w-2 h-2" />
                    {stage.outflow}
                  </div>
                </div>
                {/* Visual Progress Line */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50 rounded-b-xl overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000", idx === 4 ? "bg-green-500" : "bg-[#f5f5f7]0")} 
                    style={{ width: `${100 - idx * 15}%` }}
                  ></div>
                </div>
              </div>
              {idx < funnelStages.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-200 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        <button onClick={() => onNavigate?.('deals')} className="w-full mt-auto py-2 bg-white/50 text-blue-600 text-[10px] font-bold rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-1 border border-blue-100/50">
          查看全量漏斗 <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Right Section: 25% - 结单转化与流速 */}
      <div className="w-full lg:w-1/4 p-5 flex flex-col divide-y divide-slate-100">
        {/* Top Half: Sales Progress */}
        <div className="pb-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">本季度营收达成率</h4>
            <Target className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">78%</h3>
            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-400">已赢单 {currencySymbol}78M</span>
            </div>
          </div>
          <div className="w-full bg-[#f5f5f7] h-1.5 rounded-full overflow-hidden mb-1">
            <div className="bg-orange-500 h-full rounded-full shadow-sm" style={{ width: '78%' }}></div>
          </div>
          <div className="flex justify-end">
            <span className="text-[9px] font-bold text-slate-400">目标 {currencySymbol}100M</span>
          </div>
        </div>

        {/* Bottom Half: Win Rate & Velocity */}
        <div className="pt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-[#86868b] dark:text-[#98989d] uppercase">渠道整体赢单率</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-slate-800">32.5%</span>
                <span className="text-[9px] font-bold text-emerald-600 flex items-center">
                  <TrendingUp className="w-2.5 h-2.5" /> 2.1%
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-[#86868b] dark:text-[#98989d] uppercase">平均成交周期</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-slate-800">85 天</span>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50/50 p-2.5 rounded-lg border border-red-100/50 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-red-600 leading-tight">
              ⚠️ POC 测试阶段平均滞留超时 (40天)
            </p>
          </div>
        </div>

        <button onClick={() => onNavigate?.('marketing')} className="w-full mt-auto py-2 bg-slate-50 text-slate-500 dark:text-slate-500 text-[10px] font-bold rounded-lg hover:bg-[#f5f5f7] transition-colors flex items-center justify-center gap-1">
          查看达成明细 <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};
