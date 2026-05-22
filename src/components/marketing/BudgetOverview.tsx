import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, Plus } from 'lucide-react';

interface BudgetSectionProps {
  label: string;
  total: number;
  allocated: number;
  color: string;
  quarter: string;
}

const BudgetSection: React.FC<BudgetSectionProps> = ({ label, total, allocated, color, quarter }) => (
  <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{label}</span>
      </div>
      <span className={`text-[10px] font-bold ${color.replace('bg-', 'text-')}`}>{quarter}: ¥{(total / 1000000).toFixed(1)}M</span>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-[9px] font-bold">
        <span className="text-slate-400 uppercase">已执行 (Spent)</span>
        <span className="text-slate-900">¥{(allocated / 1000000).toFixed(1)}M ({Math.round((allocated / total) * 100)}%)</span>
      </div>
      <div className="h-1.5 w-full bg-white rounded-full overflow-hidden border border-slate-200">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(allocated / total) * 100}%` }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  </div>
);

interface BudgetOverviewProps {
  budgetData: {
    marketingTotal: number;
    marketingAllocated: number;
    pmdfTotal: number;
    pmdfAllocated: number;
    quarter?: string;
  };
  onNewActivity: () => void;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budgetData, onNewActivity }) => {
  const totalBudget = budgetData.marketingTotal + budgetData.pmdfTotal;
  const totalAllocated = budgetData.marketingAllocated + budgetData.pmdfAllocated;
  const allocationRate = Math.round((totalAllocated / totalBudget) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Budget Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">预算消耗概览 (Budget Overview)</p>
          <BarChart3 className="w-4 h-4 text-slate-300" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BudgetSection 
            label="Marketing (直营)" 
            total={budgetData.marketingTotal} 
            allocated={budgetData.marketingAllocated} 
            color="bg-[#f5f5f7]0" 
            quarter={budgetData.quarter || 'Q3'}
          />
          <BudgetSection 
            label="PMDF (渠道)" 
            total={budgetData.pmdfTotal} 
            allocated={budgetData.pmdfAllocated} 
            color="bg-purple-500" 
            quarter={budgetData.quarter || 'Q3'}
          />
        </div>
      </div>

      {/* Quarterly Allocation */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">当季度预算分配 (Q3 Allocation)</p>
          <button 
            onClick={onNewActivity}
            className="p-1.5 bg-black dark:bg-white text-white rounded-lg hover:bg-black dark:bg-white/90 transition-all shadow-sm flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase">新增活动</span>
          </button>
        </div>
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-400 uppercase">已分配 (Allocated)</span>
              <span className="text-slate-900">¥{(totalAllocated / 1000000).toFixed(1)}M</span>
            </div>
            <div className="h-2 w-full bg-[#f5f5f7] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${allocationRate}%` }}
                className="h-full bg-black dark:bg-white rounded-full"
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-400 uppercase">剩余 (Remaining)</span>
              <span className="text-slate-900">¥{((totalBudget - totalAllocated) / 1000000).toFixed(1)}M</span>
            </div>
            <div className="h-2 w-full bg-[#f5f5f7] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${100 - allocationRate}%` }}
                className="h-full bg-slate-200 rounded-full"
              />
            </div>
          </div>
          <div className="pt-2 border-t border-black/5">
            <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
              当前预算分配率 <span className="text-slate-900 font-black">{allocationRate}%</span>。{allocationRate > 80 ? '预算已接近饱和，建议收紧非核心投入。' : '仍有充足额度，建议优先对接高潜力渠道。'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
