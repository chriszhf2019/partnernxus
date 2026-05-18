import React, { useState } from 'react';
import {
  User,
  MapPin,
  Diamond,
  History,
  Handshake,
  PlusSquare,
  Eye,
  GraduationCap,
  Paperclip,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Megaphone,
  Award,
  ChevronRight,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { PartnerDetails, Activity } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { JBPMeetingForm } from './JBPMeetingForm';
import { FollowUpTracker } from './FollowUpTracker';
import { useLanguage } from '../../contexts/LanguageContext';

interface JBPFormData {
  title: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  objectives: string[];
  participants: { name: string; role: string; side: string }[];
  agenda: { time: string; topic: string }[];
}

interface PartnerProfileProps {
  partner: PartnerDetails;
  activities: Activity[];
  onBack?: () => void;
}

type TabType = 'pipeline' | 'marketing' | 'enablement' | 'followups';

export const PartnerProfile: React.FC<PartnerProfileProps> = ({ partner, activities, onBack }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('pipeline');
  const [showJBPForm, setShowJBPForm] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(value);
  };

  const handleJBPSubmit = (data: JBPFormData) => {
    console.log('JBP Meeting Scheduled:', data);
    setShowJBPForm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* JBP Meeting Form Modal */}
      <AnimatePresence>
        {showJBPForm && (
          <JBPMeetingForm 
            partner={partner} 
            onClose={() => setShowJBPForm(false)} 
            onSubmit={handleJBPSubmit}
          />
        )}
      </AnimatePresence>

      {/* Back Button */}
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold text-xs uppercase tracking-widest group"
        >
          <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          {t('profile.backToList')}
        </button>
      )}

      {/* Profile Header */}
      <section className="bg-surface-container-lowest rounded-2xl p-8 custom-shadow border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100 p-4">
              <img 
                alt={partner.name} 
                className="w-full h-full object-contain" 
                src={partner.logo}
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-3xl font-extrabold text-primary tracking-tight">{partner.name}</h2>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  <Diamond className="w-3 h-3 fill-current" />
                  {partner.tier}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-on-surface-variant text-sm mb-4">
                <span className="flex items-center gap-2 font-medium">
                  <User className="w-4 h-4 text-secondary" /> 
                  专属渠道经理: <span className="text-on-surface font-bold">{partner.manager}</span>
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <MapPin className="w-4 h-4 text-secondary" /> 
                  {partner.location}
                </span>
              </div>
              <div className="flex gap-2">
                {partner.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-wide border border-slate-200/50">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Paperclip className="w-4 h-4" /> 导出 360° 报告
            </button>
            <button 
              onClick={() => setShowJBPForm(true)}
              className="px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              {t('profile.initiateJBP')}
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Tabs Navigation */}
          <div className="bg-surface-container-lowest rounded-2xl p-2 custom-shadow border border-slate-100 flex gap-2">
            {[
              { id: 'pipeline', label: t('profile.pipelineTab'), icon: BarChart3 },
              { id: 'marketing', label: t('profile.marketingTab'), icon: Megaphone },
              { id: 'enablement', label: t('profile.enablementTab'), icon: Award },
              { id: 'followups', label: t('profile.followupsTab'), icon: CheckCircle2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                  activeTab === tab.id 
                    ? "bg-primary text-white shadow-md" 
                    : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-lowest rounded-2xl p-8 custom-shadow border border-slate-100 min-h-[500px]"
            >
              {activeTab === 'pipeline' && (
                <div className="space-y-10">
                  {/* Funnel Visualization */}
                  <div>
                    <h4 className="text-lg font-bold text-primary mb-8 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-secondary" /> 销售漏斗分析
                    </h4>
                    <div className="flex flex-col items-center gap-2 max-w-2xl mx-auto">
                      {[
                        { label: '报备 (Registered)', value: partner.pipeline.registered, color: 'bg-blue-600', width: 'w-full' },
                        { label: '方案 (Solution)', value: partner.pipeline.solution, color: 'bg-blue-500', width: 'w-[80%]' },
                        { label: '商务 (Commercial)', value: partner.pipeline.commercial, color: 'bg-blue-400', width: 'w-[60%]' },
                        { label: '赢单 (Won)', value: partner.pipeline.won, color: 'bg-green-500', width: 'w-[40%]' },
                      ].map((stage, idx) => (
                        <div key={stage.label} className="w-full flex items-center gap-4 group">
                          <div className="w-32 text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{stage.label.split(' ')[0]}</span>
                          </div>
                          <div className={cn("h-12 rounded-lg flex items-center justify-between px-6 text-white font-bold text-sm transition-all group-hover:scale-[1.02]", stage.color, stage.width)}>
                            <span>{stage.label}</span>
                            <span>{formatCurrency(stage.value)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Projects Table */}
                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-lg font-bold text-primary mb-6">正在跟进的 Top 3 具体项目</h4>
                    <div className="overflow-hidden rounded-xl border border-slate-100">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-4">项目名称</th>
                            <th className="px-6 py-4">预计金额</th>
                            <th className="px-6 py-4">当前阶段进度</th>
                            <th className="px-6 py-4">预计结案</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {partner.topProjects.map((project) => (
                            <tr key={project.name} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-5 font-bold text-sm text-slate-700">{project.name}</td>
                              <td className="px-6 py-5 font-headline font-bold text-primary">{formatCurrency(project.amount)}</td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-secondary rounded-full" style={{ width: `${project.progress}%` }}></div>
                                  </div>
                                  <span className="text-xs font-bold text-secondary">{project.progress}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-xs text-slate-500 font-medium">{project.closeDate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'marketing' && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* MDF Circular Chart */}
                    <div className="flex flex-col items-center">
                      <h4 className="text-lg font-bold text-primary mb-8 self-start">MDF 市场基金使用情况</h4>
                      <div className="relative w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                          <circle 
                            cx="18" cy="18" r="16" fill="none" stroke="#0058be" strokeWidth="3" 
                            strokeDasharray={`${(partner.mdf.used / partner.mdf.total) * 100}, 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-extrabold text-primary">{Math.round((partner.mdf.used / partner.mdf.total) * 100)}%</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">已核销</span>
                        </div>
                      </div>
                      <div className="mt-8 grid grid-cols-2 gap-8 w-full">
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">年度总额</p>
                          <p className="text-lg font-bold text-primary">{formatCurrency(partner.mdf.total)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">剩余可用</p>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(partner.mdf.remaining)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activities */}
                    <div>
                      <h4 className="text-lg font-bold text-primary mb-6">近期联合活动</h4>
                      <div className="space-y-4">
                        {partner.mdf.activities.map((activity) => (
                          <div key={activity.name} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-bold text-sm text-slate-700 group-hover:text-primary transition-colors">{activity.name}</p>
                              <span className="text-[10px] font-bold text-slate-400">{activity.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-bold">
                                {activity.leads} 条线索
                              </div>
                              <ChevronRight className="w-3 h-3 text-slate-300 ml-auto" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'enablement' && (
                <div className="space-y-10">
                  <h4 className="text-lg font-bold text-primary mb-8">赋能与认证统计</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
                      <GraduationCap className="w-12 h-12 text-secondary mx-auto mb-4" />
                      <p className="text-4xl font-extrabold text-primary mb-2">{partner.enablement.certifiedEngineers}</p>
                      <p className="text-sm font-bold text-slate-500">原厂技术认证工程师</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
                      <Award className="w-12 h-12 text-secondary mx-auto mb-4" />
                      <p className="text-4xl font-extrabold text-primary mb-2">{partner.enablement.specialists}</p>
                      <p className="text-sm font-bold text-slate-500">高级解决方案专家</p>
                    </div>
                  </div>

                  {/* Expiry Risk Warning */}
                  <div className="bg-red-50 rounded-2xl p-6 border border-red-100 flex items-start gap-6">
                    <div className="p-4 bg-red-100 rounded-xl text-red-600">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-red-800 font-bold text-lg mb-1">认证即将过期风险预警</h5>
                      <p className="text-red-700/80 text-sm leading-relaxed">
                        检测到该伙伴有 <span className="font-extrabold underline">{partner.enablement.expiryRiskCount} 位</span> 核心架构师的原厂认证即将在 <span className="font-extrabold">{partner.enablement.expiryDays} 天内</span> 过期。
                        这可能会影响该伙伴在下季度的项目报备优先级。
                      </p>
                      <div className="mt-6 flex gap-4">
                        <button
                          onClick={() => setActiveTab('followups')}
                          className="px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
                        >
                          立即安排培训
                        </button>
                        <button
                          onClick={() => setActiveTab('followups')}
                          className="px-6 py-2 bg-white text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-50 transition-all"
                        >
                          查看人员名单
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'followups' && (
                <FollowUpTracker tasks={partner.followUps} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar: Activity Timeline */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-surface-container-lowest p-8 rounded-2xl custom-shadow border border-slate-100 sticky top-8">
            <h4 className="font-headline font-extrabold text-xl mb-8 flex items-center gap-3 text-primary">
              <History className="text-secondary w-6 h-6" />
              {t('profile.activityTimeline')}
            </h4>
            <div className="relative space-y-10 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
              {activities.map((activity, idx) => (
                <div key={activity.id} className="relative flex items-start gap-6 group">
                  <div className={cn(
                    "absolute left-0 w-10 h-10 flex items-center justify-center rounded-full z-10 shadow-sm border-2 transition-all group-hover:scale-110",
                    idx === 0 ? "bg-primary border-primary text-white" : "bg-white border-slate-200 text-slate-400"
                  )}>
                    {activity.type === 'signing' && <Handshake className="w-4 h-4" />}
                    {activity.type === 'registration' && <PlusSquare className="w-4 h-4" />}
                    {activity.type === 'visit' && <Eye className="w-4 h-4" />}
                    {activity.type === 'milestone' && <GraduationCap className="w-4 h-4" />}
                  </div>
                  <div className="ml-12">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                        idx === 0 ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                      )}>
                        {idx === 0 ? '昨天' : idx === 1 ? '上周' : '上个月'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300">{activity.date}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">{activity.title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Next Action Card */}
            <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-primary fill-current" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t('profile.nextAction')}</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mb-2">{partner.followUps.find(f => f.status !== 'Completed')?.title || '暂无待办'}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">截止: {partner.followUps.find(f => f.status !== 'Completed')?.dueDate || '-'}</span>
                <button 
                  onClick={() => setActiveTab('followups')}
                  className="text-[10px] font-black text-primary hover:underline"
                >
                  去处理
                </button>
              </div>
            </div>

            <button className="w-full mt-10 py-4 bg-slate-50 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all uppercase tracking-widest border border-slate-100">
              {t('profile.viewHistory')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
