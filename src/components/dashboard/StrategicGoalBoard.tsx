import React from 'react';
import { motion } from 'motion/react';
import { Target, TrendingUp, AlertCircle, ArrowRight, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { TimeSeriesMetric, AIInsight } from '../../types';

interface StrategicGoalBoardProps {
  revenue: TimeSeriesMetric;
  insights: AIInsight[];
  onNavigate?: (view: string) => void;
}

export const StrategicGoalBoard: React.FC<StrategicGoalBoardProps> = ({ revenue, insights, onNavigate }) => {
  const achievementRate = revenue.achievements.quarterly.rate;
  const isAtRisk = achievementRate < 60;

  const getStatusConclusion = () => {
    if (achievementRate >= 80) return "进度健康，Q3 结单势头强劲，建议保持当前投放节奏。";
    if (achievementRate >= 60) return "进度基本符合预期，但需关注大单转化率的波动。";
    return "进度落后时间轴 5%，且环比上月下降，需紧急关注执行效率。";
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-3.5 h-3.5 text-blue-500" />;
      case 'risk': return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      case 'opportunity': return <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const getInsightBg = (type: AIInsight['type']) => {
    switch (type) {
      case 'trend': return 'bg-blue-50/50 border-blue-100';
      case 'risk': return 'bg-amber-50/50 border-amber-100';
      case 'opportunity': return 'bg-emerald-50/50 border-emerald-100';
    }
  };

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 relative overflow-hidden group">
      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative">
        {/* Left: Huge Radial Progress */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center relative sticky top-0">
          <div className="relative w-56 h-56">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                className="text-slate-50"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <motion.circle
                className={cn(isAtRisk ? "text-amber-400" : "text-primary")}
                strokeWidth="10"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (achievementRate / 100) * 251.2 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-slate-900 tracking-tighter">
                {Math.round(achievementRate)}<span className="text-2xl">%</span>
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Q3 达成率</span>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-8 w-full border-t border-slate-50 pt-6">
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">年度进度 (YTD)</p>
              <p className="text-lg font-black text-slate-800">42.5%</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">缺口目标 (GAP)</p>
              <p className={cn("text-lg font-black", isAtRisk ? "text-amber-600" : "text-primary")}>
                {formatCurrency(revenue.achievements.quarterly.target - revenue.achievements.quarterly.current)}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Diagnosis & AI Insights */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded uppercase tracking-widest">诊断报告</div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                季度收益流向诊断 (Flow Diagnosis)
              </h2>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-primary animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> AI 实时更新中
            </div>
          </div>

          <p className={cn(
            "text-sm font-bold p-4 rounded-xl border flex items-center gap-3",
            isAtRisk ? "bg-amber-50 border-amber-100 text-amber-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"
          )}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            结论：{getStatusConclusion()}
          </p>

          {/* AI Insights Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "p-4 rounded-2xl border flex flex-col gap-2 group/card hover:shadow-md transition-all",
                  getInsightBg(insight.type)
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{insight.title}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover/card:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  {insight.content}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (insight.actionId === 'trends') onNavigate?.('deals');
                      else if (insight.actionId === 'training') onNavigate?.('partners');
                      else if (insight.actionId === 'pmdf') onNavigate?.('marketing');
                    }}
                    className="text-[9px] font-black text-primary uppercase tracking-widest cursor-pointer hover:underline"
                  >
                    立即执行：{insight.actionLabel}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
            <button onClick={() => onNavigate?.('deals')} className="px-8 py-4 bg-slate-900 text-white text-[11px] font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest">
              下划区域明细
            </button>
            <button onClick={() => onNavigate?.('partners')} className="px-8 py-4 bg-white text-slate-900 text-[11px] font-black rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all uppercase tracking-widest">
              查看赋能计划详情
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
