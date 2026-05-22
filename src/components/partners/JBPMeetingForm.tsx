import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  FileText, 
  Zap, 
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { PartnerDetails, JBPFormData } from '../../types';

interface JBPMeetingFormProps {
  partner: PartnerDetails;
  onClose: () => void;
  onSubmit: (data: JBPFormData) => void;
}

export const JBPMeetingForm: React.FC<JBPMeetingFormProps> = ({ partner, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: `FY26 Q3 Joint Business Plan - ${partner.name}`,
    type: 'Quarterly Planning',
    date: '',
    time: '',
    duration: '90',
    location: 'Online / Teams',
    objectives: ['回顾 Q2 业绩达成情况', '对齐 Q3 联合拓展目标', 'MDF 投入计划确认'],
    participants: [
      { name: 'Alex Rivera', role: 'Channel Manager', side: 'Internal' },
      { name: partner.manager, role: 'Partner Manager', side: 'Partner' }
    ],
    agenda: [
      { time: '0-15min', topic: 'Executive Summary & Q2 Review' },
      { time: '15-45min', topic: 'Q3 Pipeline & Target Alignment' },
      { time: '45-75min', topic: 'Marketing & Enablement Plan' },
      { time: '75-90min', topic: 'AOB & Next Steps' }
    ]
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleAddObjective = () => {
    setFormData(prev => ({ ...prev, objectives: [...prev.objectives, ''] }));
  };

  const handleRemoveObjective = (index: number) => {
    setFormData(prev => ({ ...prev, objectives: prev.objectives.filter((_, i) => i !== index) }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData(prev => ({ ...prev, objectives: newObjectives }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center shadow-lg shadow-black/10 dark:shadow-white/10">
              <Target className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">发起 JBP 联合业务计划会议</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initiate Joint Business Plan Meeting with {partner.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#f5f5f7] rounded-xl transition-colors text-slate-400 hover:text-slate-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-8 py-4 bg-white border-b border-black/5 flex items-center justify-center gap-12">
          {[
            { step: 1, label: '基础信息', icon: FileText },
            { step: 2, label: '目标与议程', icon: Zap },
            { step: 3, label: '参会人员', icon: Users },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                step >= item.step ? "bg-black dark:bg-white text-white shadow-md" : "bg-[#f5f5f7] text-slate-400"
              )}>
                {step > item.step ? <CheckCircle2 className="w-5 h-5" /> : item.step}
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                step >= item.step ? "text-slate-900" : "text-slate-400"
              )}>
                {item.label}
              </span>
              {item.step < 3 && <div className="w-12 h-px bg-[#f5f5f7] ml-4" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">会议主题</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-black dark:border-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">会议类型</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-black dark:border-white transition-all"
                    >
                      <option>Quarterly Planning</option>
                      <option>Annual Strategic Review</option>
                      <option>Monthly Sync</option>
                      <option>Emergency Alignment</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">会议地点</label>
                    <input 
                      type="text" 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-black dark:border-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">会议日期</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="date" 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-black dark:border-white transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">开始时间</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="time" 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-black dark:border-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">核心议题与目标</label>
                    <button 
                      onClick={handleAddObjective}
                      className="text-[10px] font-black text-black dark:text-white hover:text-black dark:text-white/80 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> 添加目标
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.objectives.map((obj, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex-1 relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                          <input 
                            type="text" 
                            value={obj}
                            onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                            placeholder="输入会议目标..."
                            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-black dark:border-white transition-all"
                          />
                        </div>
                        <button 
                          onClick={() => handleRemoveObjective(idx)}
                          className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">会议议程安排</label>
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                    {formData.agenda.map((item, idx) => (
                      <div key={idx} className={cn(
                        "flex items-center gap-6 px-6 py-4",
                        idx !== formData.agenda.length - 1 && "border-b border-slate-100"
                      )}>
                        <span className="w-20 text-[10px] font-black text-slate-400 font-mono">{item.time}</span>
                        <span className="text-sm font-bold text-slate-700">{item.topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#f5f5f7]0" /> 内部参会人员 (Internal)
                    </label>
                    <div className="space-y-3">
                      {formData.participants.filter(p => p.side === 'Internal').map((p, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-[#f5f5f7]/50 border border-blue-100 rounded-xl">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900">{p.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{p.role}</p>
                          </div>
                        </div>
                      ))}
                      <button className="w-full py-3 border-2 border-dashed border-slate-100 rounded-xl text-[10px] font-black text-slate-400 hover:border-black dark:border-white/30 hover:text-black dark:text-white transition-all">
                        + 邀请内部专家
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> 伙伴参会人员 (Partner)
                    </label>
                    <div className="space-y-3">
                      {formData.participants.filter(p => p.side === 'Partner').map((p, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900">{p.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{p.role}</p>
                          </div>
                        </div>
                      ))}
                      <button className="w-full py-3 border-2 border-dashed border-slate-100 rounded-xl text-[10px] font-black text-slate-400 hover:border-black dark:border-white/30 hover:text-black dark:text-white transition-all">
                        + 邀请伙伴侧人员
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="flex gap-4">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600 h-fit">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-amber-900 mb-1">智能建议：JBP 成功要素</p>
                      <p className="text-xs text-amber-800/70 leading-relaxed">
                        根据该伙伴 Q2 的业绩表现，建议在会议中重点讨论 <span className="font-bold underline">“华东区金融行业商机转化率”</span>。
                        系统检测到该伙伴有 3 个核心认证即将过期，建议在“赋能计划”环节优先对齐。
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all"
          >
            上一步
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-[#f5f5f7] rounded-xl transition-all"
            >
              取消
            </button>
            {step < 3 ? (
              <button 
                onClick={nextStep}
                className="px-8 py-3 bg-slate-900 text-white text-sm font-black rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                下一步 <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => onSubmit(formData)}
                className="px-10 py-3 bg-black dark:bg-white text-white text-sm font-black rounded-xl shadow-xl shadow-black/10 dark:shadow-white/10 hover:scale-105 transition-all flex items-center gap-2"
              >
                立即发送邀请 <Zap className="w-4 h-4 fill-current" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
