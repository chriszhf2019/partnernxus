import React, { useState } from 'react';
import { 
  X, 
  Target, 
  Rocket, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Users, 
  Calendar, 
  Coins,
  ChevronRight,
  Info,
  AlertCircle,
  Plus,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface CreateIncentiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateIncentiveModal: React.FC<CreateIncentiveModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  
  // Dynamic Options State
  const [objectives, setObjectives] = useState([
    { id: 'volume', label: '基础规模返点', sub: 'Volume Rebates', icon: BarChart3, color: 'text-slate-900', bg: 'bg-slate-50', border: 'border-slate-200' },
    { id: 'new_product', label: '新产品破冰', sub: 'New Product SPIFFs', icon: Rocket, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'competitive', label: '竞品替换阻击', sub: 'Competitive Takeout', icon: ShieldCheck, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { id: 'velocity', label: '销售结单加速', sub: 'Velocity Accelerators', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  ]);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState('volume');

  const [targetAudiences, setTargetAudiences] = useState([
    '全体注册伙伴 (All Registered)',
    '金牌及以上伙伴 (Gold+ Only)',
    '定向 ISV 伙伴 (Targeted ISVs)',
    '新签约伙伴 (New Sign-ups)'
  ]);
  const [selectedAudience, setSelectedAudience] = useState(targetAudiences[0]);

  const [payoutTypes, setPayoutTypes] = useState(['现金 SPIFF', '阶梯返点', '培训积分', '营销额度']);
  const [selectedPayout, setSelectedPayout] = useState(payoutTypes[0]);

  const [kpis, setKpis] = useState(['新增客户数', '商机报备数', '合同额', '产品覆盖度', 'POC 完成数']);
  const [selectedKpis, setSelectedKpis] = useState<string[]>([]);

  // Inline Add State
  const [newOptionValue, setNewOptionValue] = useState('');
  const [showAddInput, setShowAddInput] = useState<string | null>(null);

  const handleAddOption = (type: 'objective' | 'audience' | 'payout' | 'kpi') => {
    if (!newOptionValue.trim()) return;

    if (type === 'objective') {
      const newId = `custom_${Date.now()}`;
      setObjectives([...objectives, {
        id: newId,
        label: newOptionValue,
        sub: 'Custom Objective',
        icon: Settings2,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200'
      }]);
      setSelectedObjectiveId(newId);
    } else if (type === 'audience') {
      setTargetAudiences([...targetAudiences, newOptionValue]);
      setSelectedAudience(newOptionValue);
    } else if (type === 'payout') {
      setPayoutTypes([...payoutTypes, newOptionValue]);
      setSelectedPayout(newOptionValue);
    } else if (type === 'kpi') {
      setKpis([...kpis, newOptionValue]);
    }

    setNewOptionValue('');
    setShowAddInput(null);
  };

  const toggleKpi = (kpi: string) => {
    setSelectedKpis(prev => 
      prev.includes(kpi) ? prev.filter(k => k !== kpi) : [...prev, kpi]
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Rocket className="w-6 h-6 text-primary" />
                发起目标导向型激励 (Create Objective-driven Incentive)
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Step {step} of 2: Define Strategic Intent</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">选择核心商业目标 (Select Strategic Objective)</label>
                    <button 
                      onClick={() => setShowAddInput('objective')}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> 新增目标
                    </button>
                  </div>

                  {showAddInput === 'objective' && (
                    <div className="mb-4 flex gap-2 animate-in slide-in-from-top-2 duration-300">
                      <input 
                        autoFocus
                        value={newOptionValue}
                        onChange={(e) => setNewOptionValue(e.target.value)}
                        placeholder="输入新目标名称..."
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-primary"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddOption('objective')}
                      />
                      <button 
                        onClick={() => handleAddOption('objective')}
                        className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl"
                      >
                        确定
                      </button>
                      <button 
                        onClick={() => setShowAddInput(null)}
                        className="px-4 py-2 bg-slate-100 text-slate-500 text-[10px] font-black rounded-xl"
                      >
                        取消
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {objectives.map((obj) => (
                      <button
                        key={obj.id}
                        onClick={() => setSelectedObjectiveId(obj.id)}
                        className={cn(
                          "p-6 rounded-3xl border-2 transition-all text-left group relative overflow-hidden",
                          selectedObjectiveId === obj.id 
                            ? cn("bg-white shadow-xl shadow-slate-100", obj.border)
                            : "bg-slate-50 border-transparent hover:border-slate-200"
                        )}
                      >
                        <div className="flex items-center gap-4 relative z-10">
                          <div className={cn("p-3 rounded-2xl", obj.bg, obj.color)}>
                            <obj.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{obj.label}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{obj.sub}</p>
                          </div>
                        </div>
                        {selectedObjectiveId === obj.id && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <ChevronRight className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">激励计划名称 (Program Title)</label>
                    <input 
                      type="text" 
                      placeholder="例如: Q4 医疗信创替换专项激励"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">目标受众 (Target Audience)</label>
                        <button 
                          onClick={() => setShowAddInput('audience')}
                          className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                        >
                          + 新增受众
                        </button>
                      </div>
                      
                      {showAddInput === 'audience' ? (
                        <div className="flex gap-2 mb-2">
                          <input 
                            autoFocus
                            value={newOptionValue}
                            onChange={(e) => setNewOptionValue(e.target.value)}
                            placeholder="新受众名称..."
                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddOption('audience')}
                          />
                          <button onClick={() => handleAddOption('audience')} className="p-2 bg-slate-900 text-white rounded-xl"><Plus className="w-4 h-4"/></button>
                        </div>
                      ) : (
                        <select 
                          value={selectedAudience}
                          onChange={(e) => setSelectedAudience(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none appearance-none cursor-pointer"
                        >
                          {targetAudiences.map(aud => <option key={aud} value={aud}>{aud}</option>)}
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">执行周期 (Duration)</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="2024-10-01 ~ 2024-12-31"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none"
                        />
                        <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">总预算投入 (Total Budget)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="0.00"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-black focus:outline-none"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">CNY</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">奖励发放形式 (Payout Type)</label>
                        <button 
                          onClick={() => setShowAddInput('payout')}
                          className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                        >
                          + 新增形式
                        </button>
                      </div>

                      {showAddInput === 'payout' && (
                        <div className="flex gap-2 mb-3">
                          <input 
                            autoFocus
                            value={newOptionValue}
                            onChange={(e) => setNewOptionValue(e.target.value)}
                            placeholder="新奖励形式..."
                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddOption('payout')}
                          />
                          <button onClick={() => handleAddOption('payout')} className="p-2 bg-slate-900 text-white rounded-xl"><Plus className="w-4 h-4"/></button>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {payoutTypes.map((type) => (
                          <button 
                            key={type} 
                            onClick={() => setSelectedPayout(type)}
                            className={cn(
                              "px-4 py-3 border rounded-xl text-xs font-bold transition-all",
                              selectedPayout === type 
                                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                : "bg-white border-slate-200 text-slate-600 hover:border-primary"
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="w-4 h-4 text-primary" />
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">ROI 预测模型 (System Projection)</p>
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-slate-500">预期拉动 Pipeline</span>
                        <span className="text-lg font-black text-slate-900">¥12.5M</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-slate-500">预期 ROI</span>
                        <span className="text-lg font-black text-emerald-600">1 : 25</span>
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-[10px] text-slate-400 leading-relaxed italic">
                          * 基于历史同类型激励计划数据测算，建议将单笔奖励上限设为 ¥5,000 以获得最佳投入产出比。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">核心考核指标 (Key KPI)</label>
                    <button 
                      onClick={() => setShowAddInput('kpi')}
                      className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      + 新增指标
                    </button>
                  </div>

                  {showAddInput === 'kpi' && (
                    <div className="flex gap-2 mb-3 max-w-xs">
                      <input 
                        autoFocus
                        value={newOptionValue}
                        onChange={(e) => setNewOptionValue(e.target.value)}
                        placeholder="新 KPI 名称..."
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddOption('kpi')}
                      />
                      <button onClick={() => handleAddOption('kpi')} className="p-2 bg-slate-900 text-white rounded-xl"><Plus className="w-4 h-4"/></button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {kpis.map((kpi) => (
                      <button 
                        key={kpi} 
                        onClick={() => toggleKpi(kpi)}
                        className={cn(
                          "px-6 py-2 text-xs font-bold rounded-full transition-all border",
                          selectedKpis.includes(kpi)
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                            : "bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200"
                        )}
                      >
                        {kpi}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <p className="text-[10px] font-bold text-slate-500">所有激励计划发布后将自动同步至伙伴门户 (Partner Portal)</p>
            </div>
            <div className="flex items-center gap-4">
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="px-8 py-4 text-slate-500 text-xs font-black hover:text-slate-900 transition-colors"
                >
                  上一步
                </button>
              )}
              <button 
                onClick={() => step < 2 ? setStep(step + 1) : onClose()}
                className="px-10 py-4 bg-slate-900 text-white text-xs font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
              >
                {step === 2 ? '确认发布激励令' : '下一步: 预算与规则'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
