import React, { useState } from 'react';
import { 
  X, 
  Settings2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Coins,
  Target,
  Zap,
  ArrowRight,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface AdjustParametersModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: {
    id: string;
    title: string;
    budget: string;
    consumed: string;
  };
}

export const AdjustParametersModal: React.FC<AdjustParametersModalProps> = ({ isOpen, onClose, program }) => {
  const [budget, setBudget] = useState(500000);
  const [rewardRate, setRewardRate] = useState(5);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">调整激励参数 (Policy Tuning)</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{program.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-900">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 space-y-8">
            {/* Warning Banner */}
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-amber-800 leading-relaxed">
                注意：参数调整将实时生效。已核销的奖金不受影响，但所有待审核及未来提交的商机将按照新规则计算。
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Budget Adjustment */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Coins className="w-3.5 h-3.5" /> 总预算追加 (Budget Top-up)
                  </label>
                  <span className="text-xs font-black text-slate-900">当前: {program.budget}</span>
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black focus:outline-none focus:border-primary transition-all"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">CNY</span>
                </div>
                <div className="flex gap-2">
                  {[100000, 200000, 500000].map(val => (
                    <button 
                      key={val}
                      onClick={() => setBudget(val)}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:border-primary hover:text-primary transition-all"
                    >
                      + ¥{(val/1000).toLocaleString()}K
                    </button>
                  ))}
                </div>
              </div>

              {/* Reward Rule Adjustment */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Target className="w-3.5 h-3.5" /> 奖励比例 (Rate)
                    </label>
                    <span className="text-xs font-black text-primary">{rewardRate}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="15" 
                    step="0.5"
                    value={rewardRate}
                    onChange={(e) => setRewardRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" /> 激励权重 (Weight)
                    </label>
                    <span className="text-xs font-black text-slate-900">1.2x</span>
                  </div>
                  <div className="flex gap-2">
                    {['标准', '优先', '紧急'].map((level, i) => (
                      <button 
                        key={level}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-[10px] font-black transition-all border",
                          i === 1 ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Target Audience Expansion */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> 目标群体下沉 (Audience Expansion)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: '金牌及以上', active: true },
                    { label: '银牌伙伴', active: false },
                    { label: '注册伙伴', active: false },
                  ].map(item => (
                    <button 
                      key={item.label}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-left group",
                        item.active 
                          ? "border-primary bg-primary/5" 
                          : "border-slate-100 bg-slate-50 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn("text-[10px] font-black", item.active ? "text-primary" : "text-slate-400")}>{item.label}</span>
                        {item.active && <CheckCircle2 className="w-3 h-3 text-primary" />}
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 leading-tight">
                        {item.active ? '当前已覆盖' : '点击开放权限'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Impact Simulation Area */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">预期影响模拟 (Impact Simulation)</span>
                  </div>
                  <button 
                    onClick={handleSimulate}
                    disabled={isSimulating}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black transition-all flex items-center gap-2"
                  >
                    {isSimulating ? '模拟中...' : '重新模拟'}
                    <Zap className={cn("w-3 h-3", isSimulating && "animate-pulse")} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">预计新增 Pipeline</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black">¥{(budget * 18.5 / 1000000).toFixed(1)}M</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">预计 ROI 变化</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black">1 : {(18.5 * (1 + (rewardRate-5)/20)).toFixed(1)}</span>
                      <div className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-black rounded-full">+4.2%</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] -mr-16 -mt-16" />
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-4">
            <button 
              onClick={onClose}
              className="px-8 py-4 text-slate-500 text-xs font-black hover:text-slate-900 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={onClose}
              className="px-10 py-4 bg-slate-900 text-white text-xs font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
            >
              确认应用新参数
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
