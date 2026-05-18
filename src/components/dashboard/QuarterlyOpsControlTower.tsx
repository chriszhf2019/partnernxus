import React from 'react';
import { motion } from 'motion/react';
import { 
  Target, 
  Layers, 
  Megaphone, 
  Trophy, 
  Info, 
  TrendingUp, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface QuarterlyOpsControlTowerProps {
  onNavigate?: (view: string) => void;
}

export const QuarterlyOpsControlTower: React.FC<QuarterlyOpsControlTowerProps> = ({ onNavigate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {/* Card 1: Target Progress & Tier Contribution */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">业绩贡献概览</h4>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Contribution Alignment</p>
            </div>
          </div>
          <div className="group/tooltip relative">
            <Info className="w-4 h-4 text-slate-300 cursor-help hover:text-primary transition-colors" />
            <div className="absolute bottom-full right-0 mb-3 w-56 p-3 bg-slate-900 text-white text-[10px] rounded-2xl opacity-0 group-hover/tooltip:opacity-100 transition-all transform translate-y-2 group-hover/tooltip:translate-y-0 pointer-events-none z-50 shadow-2xl leading-relaxed font-medium">
              全年业绩节奏规则：上半年40% (20+20)，下半年60% (30+30)
              <div className="absolute top-full right-3 border-8 border-transparent border-t-slate-900"></div>
            </div>
          </div>
        </div>

        <div className="space-y-6 flex-1">
          {/* Stacked Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <span>级别贡献占比</span>
              <span className="text-slate-900">QTD ANALYSIS</span>
            </div>
            <div className="h-3 w-full flex rounded-full overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
              <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} className="h-full bg-blue-700" title="白金: 45%" />
              <motion.div initial={{ width: 0 }} animate={{ width: '30%' }} className="h-full bg-blue-500" title="金牌: 30%" />
              <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} className="h-full bg-blue-300" title="银牌: 15%" />
              <motion.div initial={{ width: 0 }} animate={{ width: '10%' }} className="h-full bg-slate-200" title="注册: 10%" />
            </div>
            <div className="flex flex-wrap gap-4 pt-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-700 shadow-sm" />
                <span className="text-[10px] font-black text-slate-600">白金 45%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" />
                <span className="text-[10px] font-black text-slate-600">金牌 30%</span>
              </div>
            </div>
          </div>

          {/* Achievement Rate */}
          <div className="pt-5 border-t border-slate-50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">核心伙伴达标率 (Q/Q)</p>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">12 / 18</h3>
              <div className="mb-1 flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50">
                <TrendingUp className="w-3 h-3" />
                <span className="text-[10px] font-black">66.7%</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-2 leading-relaxed italic">目前 2/3 的高阶伙伴已锁定季度基准目标</p>
          </div>

          <button onClick={() => onNavigate?.('deals')} className="w-full mt-auto py-4 bg-slate-900 border border-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200 group/btn">
            进入业绩看板 <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Card 2: Deal Registration Health */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full group hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
        <div className="flex items-center gap-4 mb-6 text-indigo-600">
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">商机报备健康度</h4>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Registration Health</p>
          </div>
        </div>

        <div className="space-y-6 flex-1">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">报备总盘子 (Gross Pipeline)</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">¥105M</h3>
          </div>

          <div className="space-y-4">
            {[
              { label: '白金级 (Platinum)', value: '¥42M', width: 90, color: 'bg-indigo-600' },
              { label: '金牌级 (Gold)', value: '¥35M', width: 75, color: 'bg-indigo-500' },
              { label: '银牌级 (Silver)', value: '¥20M', width: 45, color: 'bg-indigo-400' },
              { label: '注册级 (Registered)', value: '¥8M', width: 20, color: 'bg-indigo-300' },
            ].map((item) => (
              <div key={item.label} className="space-y-2 group/bar">
                <div className="flex justify-between text-[10px] font-black">
                  <span className="text-slate-500 group-hover/bar:text-indigo-600 transition-colors uppercase tracking-tight">{item.label}</span>
                  <span className="text-slate-900 font-mono tracking-tighter">{item.value}</span>
                </div>
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${item.width}%` }} 
                    className={cn("h-full rounded-full transition-all duration-500 shadow-sm", item.color)} 
                  />
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => onNavigate?.('deals')} className="w-full mt-auto py-4 bg-white border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm group/btn">
            报备清单纵览 <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Card 3: Marketing & ROI */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full group hover:shadow-xl hover:shadow-rose-500/5 transition-all">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 transition-transform group-hover:scale-110">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">联合营销效能</h4>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Marketing Yield & ROI</p>
          </div>
        </div>

        <div className="space-y-6 flex-1">
          {/* Execution Progress */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none">本季共执行 24 场活动</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-rose-500 text-white text-[9px] font-black rounded-xl shadow-lg shadow-rose-500/20">已完成: 18</span>
              <span className="px-3 py-1.5 bg-white text-slate-500 text-[9px] font-black rounded-xl border border-slate-200">本月剩余: 6</span>
            </div>
          </div>

          {/* ROI Stats */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">产出 Pipeline</p>
              <h3 className="text-2xl font-black text-rose-600 tracking-tighter">¥15.5M</h3>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">商机转化率</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">22.4%</h3>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
          
          <button onClick={() => onNavigate?.('marketing')} className="w-full mt-auto py-4 bg-rose-600 border border-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-rose-600/20 group/btn">
            营销 ROI 分析 <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Card 4: Incentives Tracking */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full group hover:shadow-xl hover:shadow-orange-500/5 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 text-orange-600">
            <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Incentive 达成率</h4>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Incentive Mastery</p>
            </div>
          </div>
          <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-100/50 uppercase tracking-widest">3 Active</span>
        </div>

        <div className="space-y-5 flex-1">
          {[
            { name: 'Core Product Rebate', progress: 68, color: 'bg-blue-600' },
            { name: 'New Logo Hunter', progress: 42, color: 'bg-orange-500' },
            { name: 'Cloud Migration SP', progress: 85, color: 'bg-emerald-600' },
          ].map((item) => (
            <div key={item.name} className="space-y-2 group/bar">
              <div className="flex justify-between items-center text-[10px] font-black">
                <span className="text-slate-500 uppercase tracking-tight group-hover/bar:text-orange-600 transition-colors truncate max-w-[150px]">{item.name}</span>
                <span className="text-slate-900 font-mono">{item.progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${item.progress}%` }} 
                  className={cn("h-full rounded-full transition-all duration-1000 shadow-sm", item.color)} 
                />
              </div>
            </div>
          ))}
          
          <div className="mt-4 p-4 bg-orange-50/30 rounded-2xl border border-orange-100/50 relative overflow-hidden group/tip">
            <div className="absolute top-0 right-0 p-2 opacity-5 text-orange-600 group-hover/tip:opacity-20 transition-opacity">
              <Info className="w-10 h-10" />
            </div>
            <p className="text-[10px] font-bold text-orange-700 leading-relaxed italic relative z-10">
              💡 关键提示：新客开拓进度明显落后，建议针对金牌伙伴发起定向激励。
            </p>
          </div>

          <button onClick={() => onNavigate?.('marketing')} className="w-full mt-auto py-4 bg-white border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm group/btn">
            查看激励详情 <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
