import React, { useState } from 'react';
import { ChevronRight, CloudUpload, Lightbulb, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { useConfig } from '../../contexts/ConfigContext';
import { motion, AnimatePresence } from 'motion/react';

export const DealRegistrationForm: React.FC = () => {
  const { t } = useLanguage();
  const { config } = useConfig();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    partnerName: '',
    customerName: '',
    projectTitle: '',
    dealValue: '',
    closeDate: '',
    description: '',
    salesStage: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-16 space-y-6"
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('deals.success')}</h2>
        <p className="text-slate-500 font-bold max-w-md mx-auto leading-relaxed">
          {t('deals.successDesc')}
        </p>
        <div className="pt-8">
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
          >
            {t('common.back')}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-8 items-start">
      <div className="col-span-12 lg:col-span-8 space-y-8">
        {/* Stepper */}
        <div className="flex items-center justify-between px-2">
          {[
            { id: 1, label: t('deals.step1') },
            { id: 2, label: t('deals.step2') },
            { id: 3, label: t('deals.step3') }
          ].map((s, idx) => (
            <React.Fragment key={s.id}>
              <div className={cn(
                "flex items-center gap-3 transition-all",
                step >= s.id ? "opacity-100" : "opacity-40"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all",
                  step === s.id ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : 
                  step > s.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                )}>
                  {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 hidden sm:block">{s.label}</span>
              </div>
              {idx < 2 && (
                <div className={cn(
                  "h-0.5 flex-1 mx-4 rounded-full transition-all",
                  step > s.id ? "bg-emerald-500" : "bg-slate-100"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('deals.partnerName')}</label>
                      <select 
                        name="partnerName"
                        value={formData.partnerName}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">Select a partner...</option>
                        <option value="CloudScale">CloudScale Solutions</option>
                        <option value="GlobalIntegrity">Global Integrity Systems</option>
                        <option value="Apex">Apex Networks Inc.</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('deals.customerName')}</label>
                      <input 
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="e.g. Acme Corp" 
                        type="text" 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('deals.projectTitle')}</label>
                      <input 
                        name="projectTitle"
                        value={formData.projectTitle}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="Enterprise Infrastructure Expansion 2024" 
                        type="text" 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">当前销售阶段 (Sales Stage)</label>
                      <select 
                        name="salesStage"
                        value={formData.salesStage}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">Select current stage...</option>
                        {config.salesStages.map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
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
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                        {t('deals.dealValue')} ({config.currency})
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                          {config.currency === 'USD' ? '$' : '¥'}
                        </div>
                        <input 
                          name="dealValue"
                          value={formData.dealValue}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 pl-7 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                          placeholder="0.00" 
                          type="number" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('deals.closeDate')}</label>
                      <input 
                        name="closeDate"
                        value={formData.closeDate}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                        type="date" 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('deals.description')}</label>
                      <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" 
                        placeholder="Briefly describe the scope and primary objectives..." 
                        rows={4}
                      />
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
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('deals.documents')}</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group">
                      <div className="w-16 h-16 rounded-3xl bg-white text-primary flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <CloudUpload className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-black text-slate-900">{t('deals.upload')}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{t('deals.uploadLimit')}</p>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Review Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-400 font-bold uppercase tracking-tighter mb-1">Project</p>
                        <p className="font-black text-slate-900">{formData.projectTitle || 'Untitled Project'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold uppercase tracking-tighter mb-1">Value</p>
                        <p className="font-black text-slate-900">
                          {config.currency === 'USD' ? '$' : '¥'}
                          {formData.dealValue || '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-8 flex items-center justify-between border-t border-slate-100">
              {step > 1 ? (
                <button 
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2.5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> {t('deals.prev')}
                </button>
              ) : (
                <div />
              )}
              
              {step < 3 ? (
                <button 
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl"
                >
                  {t('deals.next')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  type="submit"
                  className="px-8 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-primary/20"
                >
                  {t('deals.submit')}
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                <Lightbulb className="text-primary w-5 h-5" />
              </div>
              <h3 className="text-lg font-black tracking-tight">Registration Tips</h3>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-xs font-bold text-slate-400 leading-relaxed">
                  Ensure the <strong className="text-white">End Customer Name</strong> matches their legal registration for faster validation.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-xs font-bold text-slate-400 leading-relaxed">
                  Attaching a preliminary <strong className="text-white">Bill of Materials (BOM)</strong> increases approval speed by 40%.
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};
