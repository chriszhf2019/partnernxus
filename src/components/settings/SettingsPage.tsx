import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Globe, 
  Palette, 
  Save, 
  ChevronRight,
  Mail,
  Lock,
  CreditCard,
  Database,
  Cloud,
  Check,
  Settings,
  Layout,
  Layers,
  Activity,
  Map,
  DollarSign
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { useConfig } from '../../contexts/ConfigContext';
import { motion, AnimatePresence } from 'motion/react';
import { GlobalConfig } from '../../types';

type SettingsTab = 'profile' | 'organization' | 'global' | 'notifications' | 'security' | 'system';

export const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { config, updateConfig, isLoading: isConfigLoading } = useConfig();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Local state for editing lists
  const [editingConfig, setEditingConfig] = useState(config);

  // Sync editingConfig when config loads
  useEffect(() => {
    setEditingConfig(config);
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConfig(editingConfig);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'organization', label: t('settings.organization'), icon: Building2 },
    { id: 'global', label: t('settings.global'), icon: Settings },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'security', label: t('settings.security'), icon: Shield },
    { id: 'system', label: t('settings.system'), icon: Globe },
  ];

  const handleListUpdate = (key: keyof GlobalConfig, value: string) => {
    const list = [...(editingConfig[key] as string[])];
    // Simple logic to add/remove or just set as comma separated
    const newList = value.split(',').map(s => s.trim()).filter(Boolean);
    setEditingConfig({ ...editingConfig, [key]: newList });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqGlG0GoMp3Vgg2bqISihSiWyPKY0xSIcZqtsE_nJzyVxTtmgSlBjp2xCtq6nn2mHs3zhIwSb5LeooV-E7jMb9k4sp3LrxYzyPpmRWG4OZPLImvPKLAIf7G64sNtnyYDsRZDLpMkrR0fl2O4zI8rZVi1GbnWS6cpZiBAXBgRUeDEEfSFenzrMFrQHXou0vqjNKyX-hb30ot-CMCrbofjBjCISKa-thvezZ4v192SuUOLOQAMcpJ9OQRp1axUedIy_b1Ayl9musMUpX" 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl"
                  referrerPolicy="no-referrer"
                />
                <button className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">
                  更换头像
                </button>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Alex Rivera</h3>
                <p className="text-sm text-slate-500 font-bold">Ecosystem Administrator • alex.rivera@partnernexus.com</p>
                <div className="mt-2 flex gap-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-black uppercase tracking-tighter">超级管理员</span>
                  <span className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-100 rounded text-[10px] font-black uppercase tracking-tighter">华东总部</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">姓名</label>
                <input type="text" defaultValue="Alex Rivera" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">邮箱地址</label>
                <input type="email" defaultValue="alex.rivera@partnernexus.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">职位</label>
                <input type="text" defaultValue="Ecosystem Administrator" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">联系电话</label>
                <input type="text" defaultValue="+86 138-0000-0000" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>
          </div>
        );
      case 'organization':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-blue-100">
                  <Building2 className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">PartnerNexus Global</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Enterprise ID: PN-8829-X</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-white text-blue-600 text-[10px] font-black rounded-xl border border-blue-100 shadow-sm hover:bg-blue-50 transition-all uppercase tracking-widest">
                管理组织
              </button>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">区域配置 (Regional Config)</h5>
              <div className="grid grid-cols-3 gap-4">
                {editingConfig.regions.map((region) => (
                  <div key={region} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{region}</span>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'global':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Ecosystem Sections */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                <Layout className="w-3 h-3" /> 生态概览页面展示调整
              </h5>
              <div className="grid grid-cols-2 gap-4 text-xs">
                {Object.entries(editingConfig.sections).map(([key, isVisible]) => (
                  <label key={key} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-100/50 transition-colors">
                    <span className="font-bold text-slate-700">
                      {key === 'revenueAlignment' && '销售目标与缺口监控'}
                      {key === 'partnershipMatrix' && '区域/行业伙伴矩阵'}
                      {key === 'ecosystemNetwork' && '生态全景拓扑图'}
                      {key === 'mdfEfficiency' && 'MDF 投放效率分析'}
                    </span>
                    <input 
                      type="checkbox" 
                      checked={isVisible}
                      onChange={(e) => setEditingConfig({
                        ...editingConfig,
                        sections: { ...editingConfig.sections, [key]: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-primary focus:ring-primary/20" 
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Parameter Settings */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Layers className="w-3 h-3" /> 合作伙伴级别设定
                </h5>
                <textarea 
                  value={editingConfig.partnerTiers.join(', ')}
                  onChange={(e) => handleListUpdate('partnerTiers', e.target.value)}
                  placeholder="用逗号隔开，如：Platinum, Gold, Silver"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 h-24 resize-none"
                />
              </div>
              <div className="space-y-4">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Activity className="w-3 h-3" /> 销售阶段设定
                </h5>
                <textarea 
                  value={editingConfig.salesStages.join(', ')}
                  onChange={(e) => handleListUpdate('salesStages', e.target.value)}
                  placeholder="用逗号隔开"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 h-24 resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Map className="w-3 h-3" /> 行业和区域设定
                </h5>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    value={editingConfig.industries.join(', ')}
                    onChange={(e) => handleListUpdate('industries', e.target.value)}
                    placeholder="行业设定 (用逗号隔开)"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input 
                    type="text" 
                    value={editingConfig.regions.join(', ')}
                    onChange={(e) => handleListUpdate('regions', e.target.value)}
                    placeholder="区域设定 (用逗号隔开)"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                  <DollarSign className="w-3 h-3" /> 结算币种设定
                </h5>
                <div className="grid grid-cols-3 gap-3">
                  {['CNY', 'USD', 'JPY'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setEditingConfig({ ...editingConfig, currency: c as any })}
                      className={cn(
                        "py-3 rounded-2xl border text-[10px] font-black transition-all",
                        editingConfig.currency === c 
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      {c === 'CNY' ? '人民币 (CNY)' : c === 'USD' ? '美元 (USD)' : '日元 (JPY)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {[
              { title: '商机报备提醒', desc: '当合作伙伴提交新的商机报备时接收通知', icon: FileText },
              { title: 'MDF 审批提醒', desc: '当有新的市场基金申请需要审批时接收通知', icon: BarChart3 },
              { title: '激励结算提醒', desc: '当联合激励计划达到结算周期时接收通知', icon: CreditCard },
              { title: '系统安全警告', desc: '当检测到异常登录或API调用时接收通知', icon: Shield },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-100 rounded-xl text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{item.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
                  </div>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={idx < 3} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'security':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-lg font-black tracking-tight mb-2">双重身份验证 (2FA)</h4>
                <p className="text-slate-400 text-xs font-bold leading-relaxed max-w-md mb-6">
                  为您的账户添加额外的安全保护。启用后，登录时除了密码外，还需要输入手机生成的验证码。
                </p>
                <button className="px-6 py-2.5 bg-white text-slate-900 text-[10px] font-black rounded-xl uppercase tracking-widest hover:scale-105 transition-all">
                  立即启用
                </button>
              </div>
              <Shield className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12" />
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">API 访问令牌 (Access Tokens)</h5>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <Database className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Production_Sync_Key</p>
                    <p className="text-[8px] font-bold text-slate-400">CREATED: 2024-03-15 • EXPIRES: NEVER</p>
                  </div>
                </div>
                <button className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Revoke</button>
              </div>
            </div>
          </div>
        );
      case 'system':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">语言与地区 (Language & Region)</h5>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setLanguage('zh')}
                  className={cn(
                    "p-4 rounded-2xl border flex items-center justify-between transition-all",
                    language === 'zh' ? "bg-primary/5 border-primary text-primary" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                  )}
                >
                  <span className="text-xs font-bold">简体中文 (Simplified Chinese)</span>
                  {language === 'zh' && <Check className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "p-4 rounded-2xl border flex items-center justify-between transition-all",
                    language === 'en' ? "bg-primary/5 border-primary text-primary" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                  )}
                >
                  <span className="text-xs font-bold">English (US)</span>
                  {language === 'en' && <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">界面主题 (Interface Theme)</h5>
              <div className="flex gap-4">
                {['Light', 'Dark', 'System'].map((theme) => (
                  <button key={theme} className={cn(
                    "flex-1 p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                    theme === 'Light' ? "bg-primary/5 border-primary text-primary" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                  )}>
                    <Palette className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{theme}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{t('settings.title')}</h1>
          <p className="text-slate-400 text-sm font-bold opacity-80 uppercase tracking-widest">{t('settings.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-xl border border-emerald-100 flex items-center gap-2"
              >
                <Check className="w-3 h-3" /> {t('settings.saved')}
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-primary text-white text-xs font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {t('settings.save')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex min-h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-64 bg-slate-50/50 border-r border-slate-50 p-6 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
                activeTab === tab.id 
                  ? "bg-white text-primary shadow-sm border border-slate-100" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
              )}
            >
              <tab.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-primary" : "text-slate-300")} />
              <span>{tab.label}</span>
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-10">
          {renderTabContent()}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-8 bg-red-50/30 rounded-[2.5rem] border border-red-100/50 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black text-red-600 uppercase tracking-widest mb-1">{t('settings.dangerZone')}</h4>
          <p className="text-xs text-red-800/60 font-bold">{t('settings.dangerDesc')}</p>
        </div>
        <button className="px-6 py-2.5 bg-white text-red-500 text-[10px] font-black rounded-xl border border-red-100 shadow-sm hover:bg-red-50 transition-all uppercase tracking-widest">
          {t('settings.deactivate')}
        </button>
      </div>
    </div>
  );
};

// Helper components for the icons used in tabs
const FileText = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
const BarChart3 = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;
const Zap = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
