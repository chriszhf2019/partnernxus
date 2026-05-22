import { useState, useReducer, useCallback, useMemo } from 'react';
import {
  User, MapPin, Phone, History, ChevronRight, Building2, TrendingUp, TrendingDown,
  Target, Award, DollarSign, Clock, CheckCircle2, AlertTriangle, ExternalLink,
  ArrowUpRight, ArrowDownRight, Download, Plus, Save, FileText, Users, Zap,
  Layers, Briefcase, GitBranch, Network, Calendar, Package, ShoppingCart, Star,
  Lightbulb, Info, Link2, Activity, Shield, Search, BarChart3, PieChart, Eye,
  MessageSquare, ThumbsUp, ThumbsDown, RefreshCw, Rocket, Crosshair, Compass,
  Radar, Flame, Bell, Mail,
} from 'lucide-react';
import { PartnerDetails, Activity as ActivityType, JBPFormData, PartnerContact } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';
import { TIER_OPTIONS, TYPE_OPTIONS, STATUS_OPTIONS, INDUSTRY_OPTIONS, recordTypeLabel, TIER_LABELS } from '../../lib/partner-labels';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { debug } from '../../lib/debug';
import { JBPMeetingForm } from './JBPMeetingForm';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { ProgressBar } from '../ui/ProgressBar';
import { RegionCascader } from '../ui/RegionCascader';
import { EmptyState } from '../ui/EmptyState';
import { Tabs } from '../ui/Tabs';

type FormState = ReturnType<typeof createInitialFormState>;
type FormAction = { type: 'SET'; field: keyof FormState; value: string | boolean };
const formReducer = (s: FormState, a: FormAction): FormState => a.type === 'SET' ? { ...s, [a.field]: a.value } : s;
function createInitialFormState(p: PartnerDetails) { return { name: p.name, unifiedSocialCreditCode: p.unifiedSocialCreditCode || '', type: p.type, tier: p.tier, status: p.status, startDate: p.startDate, industry: p.industry || '金融', province: p.province || '', city: p.city || '', district: p.district || '', registeredAddress: p.registeredAddress || '', cooperationScope: p.cooperationScope || '', isCorePartner: p.isCorePartner || false }; }
const DEFAULT_CONTACT: PartnerContact = { salutation: '', firstName: '', lastName: '', title: '', department: '', phone: '', mobile: '', email: '', isPrimary: false };

// ─── Score Gauge ──────────────────────────────────────
const Gauge = ({ score, label, max = 100 }: { score: number; label: string; max?: number }) => {
  const pct = Math.min(100, (score / max) * 100);
  const color = pct >= 80 ? '#059669' : pct >= 60 ? '#d97706' : '#dc2626';
  const s = 52, stroke = 5, r = (s - stroke) / 2, circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={s} height={s} className="-rotate-90">
        <circle cx={s/2} cy={s/2} r={r} fill="none" stroke="#e4e4e7" strokeWidth={stroke} />
        <circle cx={s/2} cy={s/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round" />
        <text x={s/2} y={s/2+1} textAnchor="middle" dy="0.35em" fontSize={13} fontWeight={700} fill="currentColor" className="dark:fill-white" transform={`rotate(90 ${s/2} ${s/2})`}>{score}</text>
      </svg>
      <span className="text-[10px] text-neutral-500 font-medium">{label}</span>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, trend, color }: { icon: typeof TrendingUp; label: string; value: string; sub?: string; trend?: number; color?: string }) => (
  <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
    <div className="flex items-center justify-between mb-1">
      <Icon className={cn('w-4 h-4', color || 'text-neutral-400')} />
      {trend !== undefined && (
        <span className={cn('text-xs font-semibold flex items-center gap-0.5', trend >= 0 ? 'text-emerald-600' : 'text-red-500')}>
          {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-lg font-semibold text-neutral-900 dark:text-white">{value}</p>
    <p className="text-[11px] text-neutral-500">{label}</p>
    {sub && <p className="text-[10px] text-neutral-400 mt-0.5">{sub}</p>}
  </div>
);

// ─── Breakthrough Card ─────────────────────────────────
const Breakthrough = ({ title, desc, action, target, roi }: { title: string; desc: string; action: string; target: string; roi: string }) => (
  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0"><Crosshair className="w-4 h-4 text-white" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">{title}</p>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{desc}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">预期ROI: {roi}</span>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">→ {action}</span>
        </div>
      </div>
    </div>
  </div>
);

export const PartnerProfile = ({ partner, activities, onBack }: { partner: PartnerDetails; activities: ActivityType[]; onBack?: () => void }) => {
  const { t } = useLanguage();
  const [showJBPForm, setShowJBPForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, dispatch] = useReducer(formReducer, partner, createInitialFormState);
  const [contacts, setContacts] = useState<PartnerContact[]>(partner.contacts.length > 0 ? [...partner.contacts] : [{ ...DEFAULT_CONTACT }]);

  const addContact = useCallback(() => setContacts((p) => [...p, { ...DEFAULT_CONTACT }]), []);
  const updateContact = useCallback((i: number, f: keyof PartnerContact, v: string | boolean) => setContacts((p) => p.map((c, j) => j === i ? { ...c, [f]: v } : c)), []);
  const removeContact = useCallback((i: number) => setContacts((p) => p.filter((_, j) => j !== i)), []);
  const handleSave = useCallback(() => { debug.log('Save:', formData, contacts); setIsEditing(false); }, [formData, contacts]);

  const primaryContact = partner.contacts.find((c) => c.isPrimary) || partner.contacts[0];
  const mdfPct = partner.mdf.total > 0 ? Math.round((partner.mdf.used / partner.mdf.total) * 100) : 0;

  // ═══════════════════════════════════════════════════════
  // COMPREHENSIVE SCORING ENGINE
  // ═══════════════════════════════════════════════════════
  const scores = useMemo(() => {
    const activity = Math.min(100, Math.round(
      (partner.pipeline.registered > 0 ? 30 : 0) +
      (partner.enablement.certifiedEngineers > 5 ? 25 : partner.enablement.certifiedEngineers * 5) +
      (partner.winRate > 50 ? 25 : partner.winRate * 0.5) +
      (partner.mdf.used > 0 ? 20 : 0)
    ));
    const capability = Math.min(100, Math.round(
      (partner.enablement.certifiedEngineers * 3) +
      (partner.enablement.specialists * 8) +
      (partner.winRate * 0.3)
    ));
    const loyalty = Math.min(100, Math.round(
      partner.years * 10 + (partner.tier === 'Platinum' ? 40 : partner.tier === 'Diamond' ? 35 : partner.tier === 'Gold' ? 25 : 10)
    ));
    const pipelineHealth = partner.pipeline.registered > 0 ? Math.round((partner.pipeline.won / partner.pipeline.registered) * 100) : 0;
    const growth = Math.round(((partner.pipeline.registered - (partner.pipeline.registered * 0.7)) / (partner.pipeline.registered * 0.7 || 1)) * 100);
    const overall = Math.round((activity * 0.25 + capability * 0.25 + loyalty * 0.15 + pipelineHealth * 0.2 + Math.max(0, growth) * 0.15));
    const churnRisk = (
      (partner.status !== 'Cooperating' ? 35 : 0) +
      (partner.enablement.expiryRiskCount > 2 ? 20 : 0) +
      (partner.pipeline.registered < 1000000 ? 20 : 0) +
      (partner.winRate < 40 ? 15 : 0) +
      (mdfPct < 30 ? 10 : 0)
    );
    return { activity, capability, loyalty, pipelineHealth, growth, overall, churnRisk,
      churnLevel: churnRisk >= 50 ? '高' as const : churnRisk >= 25 ? '中' as const : '低' as const,
      churnColor: churnRisk >= 50 ? 'danger' as const : churnRisk >= 25 ? 'warning' as const : 'success' as const,
      tierBenchmark: partner.tier === 'Platinum' ? 78 : partner.tier === 'Diamond' ? 72 : partner.tier === 'Gold' ? 65 : 50 };
  }, [partner, mdfPct]);

  // ═══════════════════════════════════════════════════════
  // BREAKTHROUGH OPPORTUNITIES
  // ═══════════════════════════════════════════════════════
  const breakthroughs = useMemo(() => {
    const ops: { title: string; desc: string; action: string; target: string; roi: string }[] = [];
    if (partner.pipeline.solution < partner.pipeline.registered * 0.5) {
      ops.push({ title: '方案转化突破', desc: `报备→方案转化率仅${Math.round((partner.pipeline.solution / Math.max(partner.pipeline.registered, 1)) * 100)}%，远低于同级伙伴均值60%。根本原因可能是方案能力不足或客户需求匹配不够。`, action: '安排原厂售前联合拜访Top 3在跟项目', target: '商机销售', roi: '3.5x' });
    }
    if (partner.enablement.expiryRiskCount > 0) {
      ops.push({ title: '认证续期窗口', desc: `${partner.enablement.expiryRiskCount}人认证${partner.enablement.expiryDays}天内过期——一旦过期将失去对应产品的报备资格。这是当前最紧急的事项。`, action: `在${partner.enablement.expiryDays}天内完成续证考试安排`, target: '组织架构', roi: '紧急' });
    }
    if (mdfPct < 70) {
      ops.push({ title: 'MDF 激活机会', desc: `MDF使用率仅${mdfPct}%，剩余${formatCurrency(partner.mdf.remaining)}未使用。MDF是撬动联合营销最有效的杠杆——每投入1元MDF平均产生3.2元Pipeline。`, action: 'Q3前提交至少2个联合营销活动方案', target: '季度沟通', roi: '3.2x' });
    }
    ops.push({ title: '生态协作放大', desc: `该伙伴处于SI-ISV-Reseller网络枢纽位置，但当前仅3个活跃协作关系。推动与昆仑联通(SI)的联合打单数量从5个增至10个，预计可带来${formatCurrency(2800000)}增量营收。`, action: '发起SI+ISV联合方案 workshop', target: '合作生态', roi: '2.4x' });
    if (partner.winRate < 60) {
      ops.push({ title: '赢单率提升', desc: `当前赢单率${partner.winRate}%，低于白金伙伴均值72%。每个百分点的提升对应约${formatCurrency(partner.pipeline.registered * 0.01)}的增量营收。`, action: '复盘近3个丢标项目，识别共性失败原因', target: '商机销售', roi: '5x' });
    }
    return ops.slice(0, 4);
  }, [partner, mdfPct]);

  // ── Mock data ────────────────────────────────────────
  const lifecycleStages = [
    { year: '2018', stage: '招募', desc: '通过华北渠道峰会首次接触', event: '渠道峰会' },
    { year: '2019', stage: '成长', desc: '完成首批培训认证，签约首个客户', event: '首单签约' },
    { year: '2020', stage: '扩张', desc: '晋升金牌，行业从金融扩展至医疗', event: '等级晋升' },
    { year: '2022', stage: '成熟', desc: '年营收突破¥500万，华北区Top 10', event: '规模突破' },
    { year: '2024', stage: '战略', desc: '晋升白金，参与联合产品定义', event: '战略升级' },
    { year: '2025', stage: '引领', desc: '预计营收¥850万+，生态枢纽', event: '当前' },
  ];

  const orgStructure = [
    { role: '总经理', name: '任志刚', dept: '管理层', children: [
      { role: '销售总监', name: '何妮', dept: '销售部', children: [{ role: '大客户经理', name: '谭丽娜', dept: '销售部' }, { role: '渠道销售', name: '顾伟雀', dept: '销售部' }] },
      { role: '技术总监', name: '吴忠奎', dept: '技术部', children: [{ role: '高级架构师', name: '吴晓迪', dept: '技术部' }, { role: '网络工程师', name: '侯亚斌', dept: '技术部' }, { role: '系统工程师', name: '宋超阳', dept: '技术部' }] },
      { role: '商务经理', name: '高辉', dept: '商务部' },
    ]},
  ];

  const keyCustomers = [
    { name: '浙江省立医院', industry: '医疗', product: '云原生平台', ourShare: 100, competitor: '-', value: 4500000, status: '在服' },
    { name: '苏州市卫健委', industry: '政务', product: '大数据平台', ourShare: 70, competitor: '华为云', value: 2800000, status: 'POC' },
    { name: '上海瑞金医院', industry: '医疗', product: 'AI 智算平台', ourShare: 0, competitor: 'AWS', value: 3200000, status: '丢标' },
    { name: '北京协和医院', industry: '医疗', product: '混合云方案', ourShare: 50, competitor: '阿里云', value: 6000000, status: '商务' },
    { name: '杭州市养老平台', industry: '政务', product: '数字化平台', ourShare: 100, competitor: '-', value: 1200000, status: '在服' },
  ];

  const ecosystemPartners = [
    { name: '昆仑联通', type: 'SI', relation: '联合打单', products: ['云原生平台', '备份存储'], volume: 4500000, deals: 5 },
    { name: '精诚中国', type: 'Reseller', relation: '分销代理', products: ['安全合规', '数据平台'], volume: 2800000, deals: 12 },
    { name: '上海智医', type: 'ISV', relation: '方案互补', products: ['AI 智算平台'], volume: 1200000, deals: 3 },
  ];

  const quarterlyReviews = [
    { q: '2024 Q4', date: '2024-12-15', goal: '年营收达标冲刺', progress: '完成率 105%', key: '超额完成年度目标，签署3个新客户', attendees: ['任志刚', 'Alex Rivera'] },
    { q: '2025 Q1', date: '2025-03-20', goal: '新行业拓展', progress: '完成率 92%', key: '金融行业实现首个标杆客户，医疗Pipeline增长40%', attendees: ['何妮', 'Alex Rivera'] },
    { q: '2025 Q2', date: '2025-06-18', goal: '能力升级', progress: '进行中', key: '5名工程师通过云原生高级认证，AI产品线POC启动', attendees: ['吴忠奎', 'Alex Rivera'] },
  ];

  // Recent activity data (last 30 days)
  const recentActivity = [
    { type: 'deal', date: '2天前', desc: '北京协和医院混合云方案进入商务阶段', icon: ShoppingCart },
    { type: 'training', date: '5天前', desc: '吴晓迪完成云原生架构师高级认证', icon: Award },
    { type: 'meeting', date: '1周前', desc: 'Q2 QBR会议——能力升级目标确认', icon: Calendar },
    { type: 'alert', date: '1周前', desc: '3人认证将在14天内过期', icon: AlertTriangle },
    { type: 'deal', date: '2周前', desc: '杭州市养老平台续约完成，合同额¥120万', icon: CheckCircle2 },
  ];

  const tabItems = [
    { id: 'overview', label: '全景概览' }, { id: 'activity', label: '活跃度' },
    { id: 'performance', label: '绩效评估' }, { id: 'opportunity', label: '合作机会' },
    { id: 'profile', label: '关系档案' }, { id: 'network', label: '关联网络' },
  ];

  return (
    <div className="space-y-5">
      <AnimatePresence>{showJBPForm && <JBPMeetingForm partner={partner} onClose={() => setShowJBPForm(false)} onSubmit={(d: JBPFormData) => { debug.log('JBP:', d); setShowJBPForm(false); }} />}</AnimatePresence>

      {/* ═══════════════════════════════════════════════════
          HEADER: Identity + Health Pulse + Breakthrough Alerts
          ═══════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        {onBack && <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium text-sm transition-colors"><ChevronRight className="w-4 h-4 rotate-180" />{t('profile.backToList')}</button>}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="secondary" size="sm"><Download className="w-4 h-4" />{t('profile.export360')}</Button>
          <Button variant="brand" size="sm" onClick={() => setShowJBPForm(true)}>{t('profile.initiateJBP')}</Button>
        </div>
      </div>

      <Card>
        {/* Identity Row */}
        <div className="flex flex-col md:flex-row md:items-center gap-5 mb-5">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 shrink-0 relative">
            {partner.logo ? <img alt={partner.name} className="w-full h-full object-contain p-3 rounded-xl" src={partner.logo} referrerPolicy="no-referrer" /> : <Building2 className="w-7 h-7 text-neutral-500" />}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" title="在线活跃" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">{partner.name}</h2>
              <Badge variant="primary" size="md">{partner.tier}</Badge>
              {formData.isCorePartner && <Badge variant="warning" size="md"><Star className="w-3 h-3 fill-current" />核心</Badge>}
              <Badge variant={partner.status === 'Cooperating' ? 'success' : 'warning'} size="md">{partner.status === 'Cooperating' ? '合作中' : partner.status === 'Inactive' ? '已过期' : '潜在'}</Badge>
              <Badge variant={scores.churnColor} size="sm">流失风险{scores.churnLevel}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{partner.manager}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{partner.location}</span>
              <span className="flex items-center gap-1.5"><History className="w-4 h-4" />{partner.years}年</span>
              {primaryContact && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{primaryContact.lastName}{primaryContact.firstName}</span>}
            </div>
            <div className="flex gap-2 mt-2">{partner.tags.map((t) => <Badge key={t} variant="default" size="sm">{t}</Badge>)}</div>
          </div>
        </div>

        {/* Health Pulse Row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="col-span-2 md:col-span-1 flex justify-center"><Gauge score={scores.overall} label="综合评分" /></div>
          <StatCard icon={Flame} label="活跃度" value={`${scores.activity}分`} trend={8} color="text-orange-500" sub={`高于${TIER_LABELS[partner.tier] || partner.tier}均值${scores.activity - scores.tierBenchmark}分`} />
          <StatCard icon={Shield} label="能力值" value={`${scores.capability}分`} sub={`${partner.enablement.certifiedEngineers}认证 · ${partner.enablement.specialists}专家`} color="text-blue-500" />
          <StatCard icon={Target} label="Pipeline健康" value={`${scores.pipelineHealth}%`} sub={`赢单率 ${partner.winRate}%`} color={scores.pipelineHealth >= 60 ? 'text-emerald-500' : 'text-amber-500'} />
          <StatCard icon={DollarSign} label="MDF使用" value={`${mdfPct}%`} sub={`剩余 ${formatCurrency(partner.mdf.remaining)}`} color={mdfPct > 50 ? 'text-emerald-500' : 'text-amber-500'} />
          <StatCard icon={TrendingUp} label="增长趋势" value={scores.growth >= 0 ? `+${scores.growth}%` : `${scores.growth}%`} trend={scores.growth} color={scores.growth >= 0 ? 'text-emerald-500' : 'text-red-500'} />
        </div>

        {/* Critical Alerts */}
        {breakthroughs.length > 0 && breakthroughs[0].roi === '紧急' && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
            <Bell className="w-5 h-5 text-red-500 animate-pulse" />
            <div className="flex-1"><p className="text-sm font-semibold text-red-700 dark:text-red-400">紧急提醒</p><p className="text-xs text-red-600 dark:text-red-300">{breakthroughs[0].desc}</p></div>
            <Button variant="danger" size="sm">{breakthroughs[0].action.slice(0, 20)}...</Button>
          </div>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════
          TABS
          ═══════════════════════════════════════════════════ */}
      <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="pt-4">

          {/* ══════════════════════════════════════════════
              TAB 1: 全景概览 — Executive Dashboard
              ══════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Breakthrough Opportunities */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2"><Crosshair className="w-4 h-4 text-blue-600" />合作突破口</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {breakthroughs.map((b, i) => <Breakthrough key={i} {...b} />)}
                </div>
              </div>

              {/* Pipeline + MDF */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>商机漏斗</CardTitle><Badge variant={scores.pipelineHealth >= 60 ? 'success' : 'warning'} size="sm">健康度 {scores.pipelineHealth}%</Badge></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[{ label: '报备', v: partner.pipeline.registered, w: '100%', c: 'bg-neutral-900 dark:bg-white' }, { label: '方案', v: partner.pipeline.solution, w: `${Math.round((partner.pipeline.solution/Math.max(partner.pipeline.registered,1))*100)}%`, c: 'bg-neutral-600' }, { label: '商务', v: partner.pipeline.commercial, w: `${Math.round((partner.pipeline.commercial/Math.max(partner.pipeline.registered,1))*100)}%`, c: 'bg-neutral-400' }, { label: '赢单', v: partner.pipeline.won, w: `${Math.round((partner.pipeline.won/Math.max(partner.pipeline.registered,1))*100)}%`, c: 'bg-emerald-500' }].map((s) => (
                        <div key={s.label} className="flex items-center gap-3"><span className="text-xs font-medium text-neutral-500 w-8">{s.label}</span><div className="flex-1 h-7 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden"><div className={cn('h-full rounded flex items-center px-3', s.c)} style={{width:s.w}}><span className={cn('text-xs font-semibold',s.c.includes('900')||s.c.includes('600')?'text-white':'text-neutral-900')}>{formatCurrency(s.v)}</span></div></div></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>在跟项目 & MDF</CardTitle></CardHeader>
                  <CardContent>
                    {partner.topProjects.length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {partner.topProjects.map((p) => (
                          <div key={p.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{p.name}</p><p className="text-xs text-neutral-400">{formatCurrency(p.amount)} · {p.closeDate}</p></div>
                            <ProgressBar value={p.progress} size="sm" className="w-20" />
                          </div>
                        ))}
                      </div>
                    ) : <EmptyState title="暂无在跟项目" />}
                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center justify-between mb-1"><span className="text-sm text-neutral-600 dark:text-neutral-400">MDF使用</span><span className="text-sm font-semibold">{formatCurrency(partner.mdf.used)}/{formatCurrency(partner.mdf.total)}</span></div>
                      <ProgressBar value={mdfPct} variant={mdfPct>90?'danger':'brand'} size="md" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Feed */}
              <Card>
                <CardHeader><CardTitle>近期动态 (30天)</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {recentActivity.map((a, i) => (
                      <div key={i} className={cn('flex items-center gap-3 py-2.5', i>0&&'border-t border-neutral-100 dark:border-neutral-800')}>
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', a.type==='alert'?'bg-red-100 dark:bg-red-900/20':'bg-neutral-100 dark:bg-neutral-800')}>
                          <a.icon className={cn('w-4 h-4', a.type==='alert'?'text-red-500':'text-neutral-500')} />
                        </div>
                        <div className="flex-1 min-w-0"><p className="text-sm text-neutral-700 dark:text-neutral-300">{a.desc}</p></div>
                        <span className="text-xs text-neutral-400 shrink-0">{a.date}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 2: 活跃度分析
              ══════════════════════════════════════════════ */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* Activity Score + Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader><CardTitle>活跃度综合评分</CardTitle></CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <Gauge score={scores.activity} label="综合活跃度" />
                    <div className="w-full mt-4 space-y-2">
                      {[
                        { label: '交易活跃', score: partner.pipeline.registered > 0 ? 85 : 20, icon: ShoppingCart, detail: '是否有在跟Pipeline' },
                        { label: '赋能活跃', score: partner.enablement.certifiedEngineers > 5 ? 80 : partner.enablement.certifiedEngineers * 15, icon: Award, detail: '认证人员数量' },
                        { label: '营销活跃', score: partner.mdf.used > 0 ? 75 : 10, icon: Target, detail: 'MDF基金使用情况' },
                        { label: '协作活跃', score: ecosystemPartners.length > 2 ? 82 : ecosystemPartners.length * 25, icon: Users, detail: '生态协作关系数' },
                      ].map((d) => (
                        <div key={d.label} className="flex items-center gap-3">
                          <d.icon className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm text-neutral-600 dark:text-neutral-400 w-16">{d.label}</span>
                          <ProgressBar value={d.score} size="sm" className="flex-1" />
                          <span className="text-xs font-semibold w-8 text-right">{d.score}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader><CardTitle>活跃趋势与行为分析</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: '最近交易', value: '2天前', status: 'active', detail: '北京协和医院进入商务阶段' },
                          { label: '最近报备', value: '5天前', status: 'active', detail: '新商机: 某三甲医院云平台项目' },
                          { label: '最近培训', value: '1周前', status: 'warning', detail: '3人认证即将过期需续期' },
                        ].map((r) => (
                          <div key={r.label} className={cn('p-3 rounded-lg border', r.status === 'active' ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30' : 'border-amber-200 dark:border-amber-800 bg-amber-50/30')}>
                            <p className="text-xs text-neutral-500">{r.label}</p>
                            <p className="text-lg font-semibold text-neutral-900 dark:text-white">{r.value}</p>
                            <p className="text-[10px] text-neutral-400 mt-1">{r.detail}</p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">活跃度诊断</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span className="text-neutral-600 dark:text-neutral-400">交易活跃度健康——近30天有2笔交易进展，高于同级伙伴均值</span></div>
                          <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span className="text-neutral-600 dark:text-neutral-400">协作活跃度优秀——3个活跃生态协作关系，网络效应显著</span></div>
                          <div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" /><span className="text-neutral-600 dark:text-neutral-400">赋能活跃度存在风险——{partner.enablement.expiryRiskCount}人认证即将过期，可能影响下季度报备优先级</span></div>
                          <div className="flex items-start gap-2"><Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /><span className="text-neutral-600 dark:text-neutral-400">营销活跃度可提升——MDF使用率{mdfPct}%，建议加大联合营销投入</span></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 3: 绩效评估
              ══════════════════════════════════════════════ */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                  { label: '综合评分', score: scores.overall, max: 100, benchmark: scores.tierBenchmark },
                  { label: '活跃度', score: scores.activity, max: 100, benchmark: 65 },
                  { label: '能力值', score: scores.capability, max: 100, benchmark: 70 },
                  { label: '忠诚度', score: scores.loyalty, max: 100, benchmark: 55 },
                  { label: 'Pipeline', score: scores.pipelineHealth, max: 100, benchmark: 60 },
                  { label: '增长力', score: Math.max(0, scores.growth), max: 50, benchmark: 25 },
                ].map((m) => (
                  <Card key={m.label}>
                    <div className="text-center">
                      <Gauge score={m.score} label={m.label} max={m.max} />
                      <div className="mt-2 flex items-center justify-center gap-1 text-[10px]">
                        <span className="text-neutral-400">同级均值</span>
                        <span className={cn('font-semibold', m.score >= m.benchmark ? 'text-emerald-600' : 'text-amber-600')}>{m.benchmark}</span>
                        <span className={m.score >= m.benchmark ? 'text-emerald-500' : 'text-amber-500'}>{m.score >= m.benchmark ? '↑' : '↓'}{Math.abs(m.score - m.benchmark)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader><CardTitle>多维评估矩阵</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">评估维度</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">得分</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">同级均值</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">排名</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">趋势</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">评价</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {[
                          { dim: '营收贡献', score: 88, benchmark: 72, rank: 'Top 15%', trend: 12, note: '远超同级均值，是区域营收核心引擎' },
                          { dim: '商机转化', score: 68, benchmark: 70, rank: 'Top 45%', trend: -3, note: '方案→商务环节存在瓶颈，需优化' },
                          { dim: '客户满意度', score: 92, benchmark: 78, rank: 'Top 8%', trend: 5, note: '客户续约率95%，NPS得分行业领先' },
                          { dim: '技术能力', score: 75, benchmark: 68, rank: 'Top 30%', trend: 8, note: '认证覆盖率高，但AI新赛道不足' },
                          { dim: '生态贡献', score: 85, benchmark: 55, rank: 'Top 10%', trend: 15, note: '网络枢纽价值突出，协作产出高' },
                          { dim: '创新投入', score: 60, benchmark: 45, rank: 'Top 35%', trend: 10, note: '参与联合产品定义，创新意愿强' },
                        ].map((r, i) => (
                          <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                            <td className="py-3 px-4 font-medium text-neutral-900 dark:text-white">{r.dim}</td>
                            <td className="py-3 px-4 text-center"><span className={cn('font-semibold', r.score >= 80 ? 'text-emerald-600' : r.score >= 60 ? 'text-amber-600' : 'text-red-500')}>{r.score}</span></td>
                            <td className="py-3 px-4 text-center text-neutral-400">{r.benchmark}</td>
                            <td className="py-3 px-4 text-center"><Badge variant={r.rank.includes('Top 2') ? 'success' : r.rank.includes('Top 5') ? 'info' : 'default'} size="sm">{r.rank}</Badge></td>
                            <td className="py-3 px-4 text-center"><span className={cn('text-xs font-semibold', r.trend >= 0 ? 'text-emerald-600' : 'text-red-500')}>{r.trend >= 0 ? '↑' : '↓'}{Math.abs(r.trend)}%</span></td>
                            <td className="py-3 px-4 text-xs text-neutral-500">{r.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 4: 合作机会
              ══════════════════════════════════════════════ */}
          {activeTab === 'opportunity' && (
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>合作突破口识别</CardTitle><Badge variant="info" size="sm">AI 推荐</Badge></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {breakthroughs.map((b, i) => <Breakthrough key={i} {...b} />)}
                  </div>
                </CardContent>
              </Card>

              {/* ── 能力画像总览 ─────────────────────────── */}
              <Card>
                <CardHeader>
                  <CardTitle>能力画像</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">技术域 × 行业覆盖</span>
                    <div className="relative group/ml">
                      <span className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] text-neutral-500 cursor-help inline-flex">?</span>
                      <div className="absolute right-0 top-5 w-64 p-2 bg-white dark:bg-neutral-800 border rounded-lg shadow-xl z-50 opacity-0 invisible group-hover/ml:opacity-100 group-hover/ml:visible transition-all text-[10px] text-neutral-500 leading-relaxed">
                        能力画像从两个维度评估：<b>技术成熟度</b>（传统/云/AI/安全/数据/服务 6域）和<b>行业覆盖度</b>（医疗/政务/金融/制造/教育）。圆的填充比例=该领域的自主交付能力。
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left: Hexagonal Capability Map */}
                    <div className="lg:col-span-2 flex items-center justify-center">
                      <div className="relative w-64 h-64">
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          {/* Background hexagon grid */}
                          {[0.3, 0.55, 0.8].map((scale, si) => (
                            <polygon key={si} points="100,15 180,55 180,125 100,165 20,125 20,55"
                              fill="none" stroke="#e4e4e7" strokeWidth="0.5"
                              transform={`scale(${scale})`} transform-origin="100 90" />
                          ))}
                          {/* Axes */}
                          {[0, 60, 120, 180, 240, 300].map((angle, ai) => {
                            const rad = (angle * Math.PI) / 180;
                            return <line key={ai} x1="100" y1="90" x2={100 + 75 * Math.cos(rad)} y2={90 + 75 * Math.sin(rad)} stroke="#e4e4e7" strokeWidth="0.5" />;
                          })}
                          {/* Capability shape */}
                          {[
                            { name: '传统IT', value: 85, angle: 300, color: '#52525b' },
                            { name: '云原生', value: 90, angle: 0, color: '#2563eb' },
                            { name: 'AI/ML', value: 25, angle: 60, color: '#dc2626' },
                            { name: '安全', value: 45, angle: 120, color: '#d97706' },
                            { name: '数据', value: 80, angle: 180, color: '#059669' },
                            { name: '服务', value: 70, angle: 240, color: '#7c3aed' },
                          ].map((cap) => {
                            const rad = (cap.angle * Math.PI) / 180;
                            const points = [
                              { name: '传统IT', value: 85, angle: 300 },
                              { name: '云原生', value: 90, angle: 0 },
                              { name: 'AI/ML', value: 25, angle: 60 },
                              { name: '安全', value: 45, angle: 120 },
                              { name: '数据', value: 80, angle: 180 },
                              { name: '服务', value: 70, angle: 240 },
                            ].map((p) => {
                              const r = (p.angle * Math.PI) / 180;
                              const dist = 15 + (p.value / 100) * 65;
                              return `${100 + dist * Math.cos(r)},${90 + dist * Math.sin(r)}`;
                            }).join(' ');
                            return <polygon key={cap.name} points={points} fill="rgba(37,99,235,0.08)" stroke="#2563eb" strokeWidth="1.5" />;
                          })}
                          {/* Data points + labels */}
                          {[
                            { name: '传统IT', value: 85, angle: 300, color: '#52525b' },
                            { name: '云原生', value: 90, angle: 0, color: '#2563eb' },
                            { name: 'AI/ML', value: 25, angle: 60, color: '#dc2626' },
                            { name: '安全', value: 45, angle: 120, color: '#d97706' },
                            { name: '数据', value: 80, angle: 180, color: '#059669' },
                            { name: '服务', value: 70, angle: 240, color: '#7c3aed' },
                          ].map((cap) => {
                            const rad = (cap.angle * Math.PI) / 180;
                            const dist = 15 + (cap.value / 100) * 65;
                            const cx = 100 + dist * Math.cos(rad);
                            const cy = 90 + dist * Math.sin(rad);
                            const lx = 100 + 80 * Math.cos(rad);
                            const ly = 90 + 80 * Math.sin(rad);
                            const capFill = cap.value >= 70 ? '#059669' : cap.value >= 40 ? '#d97706' : '#dc2626';
                            return (
                              <g key={cap.name}>
                                <circle cx={cx} cy={cy} r="4" fill={capFill} stroke="white" strokeWidth="2" />
                                <text x={lx} y={ly} textAnchor="middle" fontSize="9" fontWeight={600} fill="#888" dy={cap.angle === 0 ? -6 : cap.angle === 180 ? 14 : 4}>
                                  {cap.name}
                                </text>
                                <text x={lx} y={ly} textAnchor="middle" fontSize="8" fill={capFill} dy={cap.angle === 0 ? 6 : cap.angle === 180 ? 24 : 14}>
                                  {cap.value}%
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>

                    {/* Right: Industry × Capability Matrix + Detail */}
                    <div className="lg:col-span-3 space-y-4">
                      <div>
                        <p className="text-xs font-medium text-neutral-500 mb-2">行业 × 技术能力覆盖矩阵</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                                <th className="text-left py-2 px-2 font-medium text-neutral-400">行业</th>
                                <th className="text-center py-2 px-2 font-medium text-neutral-400">传统IT</th>
                                <th className="text-center py-2 px-2 font-medium text-neutral-400">云原生</th>
                                <th className="text-center py-2 px-2 font-medium text-neutral-400">AI/ML</th>
                                <th className="text-center py-2 px-2 font-medium text-neutral-400">安全</th>
                                <th className="text-center py-2 px-2 font-medium text-neutral-400">数据</th>
                                <th className="text-center py-2 px-2 font-medium text-neutral-400">服务</th>
                                <th className="text-center py-2 px-2 font-medium text-neutral-400">覆盖度</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { industry: '医疗', cells: [1,1,0,0.5,1,1], coverage: 75 },
                                { industry: '政务', cells: [1,1,0,0,1,0.5], coverage: 58 },
                                { industry: '金融', cells: [0.5,0.5,0,0.5,0.5,0.5], coverage: 42 },
                                { industry: '制造', cells: [0.5,0,0,0,0,0], coverage: 8 },
                                { industry: '教育', cells: [0,0,0,0,0,0], coverage: 0 },
                              ].map((row, ri) => (
                                <tr key={ri} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                  <td className="py-2.5 px-2 font-medium text-neutral-700 dark:text-neutral-300">{row.industry}</td>
                                  {row.cells.map((v, ci) => (
                                    <td key={ci} className="py-2.5 px-2 text-center">
                                      <div className={cn('w-5 h-5 rounded mx-auto', v === 1 ? 'bg-emerald-500' : v >= 0.5 ? 'bg-amber-400' : 'bg-neutral-200 dark:bg-neutral-700')}
                                        title={v === 1 ? '自主交付' : v >= 0.5 ? '协作交付' : '未覆盖'} />
                                    </td>
                                  ))}
                                  <td className="py-2.5 px-2 text-center">
                                    <span className={cn('text-xs font-semibold', row.coverage >= 60 ? 'text-emerald-600' : row.coverage >= 30 ? 'text-amber-600' : 'text-red-500')}>
                                      {row.coverage}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-[10px] text-neutral-400">
                          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500" /> 自主交付</span>
                          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-400" /> 协作交付</span>
                          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-neutral-200 dark:bg-neutral-700" /> 未覆盖</span>
                        </div>
                      </div>

                      {/* Gap-specific callouts */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <span className="text-xs font-semibold text-red-700 dark:text-red-400">最大缺口</span>
                          </div>
                          <p className="text-[11px] text-red-600 dark:text-red-300">AI/ML能力仅25%——医疗+政务行业均未覆盖，竞品AWS已抢占先机</p>
                        </div>
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">待加强</span>
                          </div>
                          <p className="text-[11px] text-amber-600 dark:text-amber-300">安全能力45%依赖生态协作——金融行业合规要求高，自主能力是准入门槛</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── 客户拓展建议 ─────────────────────────── */}
              <Card>
                <CardHeader><CardTitle>行业拓展路径</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { target: '医疗行业深耕', detail: '3个独家客户→撬动同区域标杆', cases: '积水潭医院、华山医院', priority: '高', capability: '云原生+数据' },
                      { target: '政务行业扩展', detail: '卫健委→人社局、医保局', cases: '数据平台+云原生组合', priority: '高', capability: '数据+云原生' },
                      { target: '金融行业突破', detail: '首个标杆→城商行、保险', cases: '需补安全+AI能力', priority: '中', capability: '安全+AI缺口' },
                      { target: 'AI医疗联合方案', detail: '与上海智医ISV联合打造', cases: '瑞金丢标复盘→差异化', priority: '中', capability: '需生态协作补全' },
                    ].map((t) => (
                      <div key={t.target} className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-neutral-900 dark:text-white">{t.target}</span>
                          <Badge variant={t.priority === '高' ? 'danger' : 'warning'} size="sm">{t.priority}</Badge>
                        </div>
                        <p className="text-xs text-neutral-500 mb-2">{t.detail}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-neutral-400">靶向:</span>
                          <span className="text-[10px] font-medium text-neutral-700 dark:text-neutral-300">{t.cases}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-1.5">
                          <span className="text-[10px] text-neutral-400">所需能力:</span>
                          <Badge variant={t.capability.includes('缺口') ? 'danger' : t.capability.includes('协作') ? 'warning' : 'info'} size="sm">{t.capability}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 5: 关系档案
              ══════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Layered Info + Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle>基本信息</CardTitle><Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>{isEditing ? '取消' : '编辑'}</Button></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="名称" value={formData.name} onChange={(e) => dispatch({ type: 'SET', field: 'name', value: e.target.value })} disabled={!isEditing} />
                        <Input label="信用代码" value={formData.unifiedSocialCreditCode} onChange={(e) => dispatch({ type: 'SET', field: 'unifiedSocialCreditCode', value: e.target.value })} disabled={!isEditing} />
                        <Select label="类型" options={TYPE_OPTIONS} value={formData.type} onChange={(e) => dispatch({ type: 'SET', field: 'type', value: e.target.value })} disabled={!isEditing} />
                        <Select label="等级" options={TIER_OPTIONS} value={formData.tier} onChange={(e) => dispatch({ type: 'SET', field: 'tier', value: e.target.value })} disabled={!isEditing} />
                        <Select label="状态" options={STATUS_OPTIONS} value={formData.status} onChange={(e) => dispatch({ type: 'SET', field: 'status', value: e.target.value })} disabled={!isEditing} />
                        <Input label="加入日期" type="date" value={formData.startDate} onChange={(e) => dispatch({ type: 'SET', field: 'startDate', value: e.target.value })} disabled={!isEditing} />
                        <Select label="行业" options={INDUSTRY_OPTIONS} value={formData.industry} onChange={(e) => dispatch({ type: 'SET', field: 'industry', value: e.target.value })} disabled={!isEditing} />
                        <RegionCascader label="所在地区" value={{ province: formData.province, city: formData.city, district: formData.district }} onChange={(v) => { dispatch({ type: 'SET', field: 'province', value: v.province }); dispatch({ type: 'SET', field: 'city', value: v.city }); dispatch({ type: 'SET', field: 'district', value: v.district }); }} />
                        <div className="col-span-2"><Input label="注册地址" value={formData.registeredAddress} onChange={(e) => dispatch({ type: 'SET', field: 'registeredAddress', value: e.target.value })} disabled={!isEditing} /></div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">合作范围</label>
                          <textarea className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm resize-none disabled:bg-neutral-50 dark:disabled:bg-neutral-800/50 focus:outline-none focus:ring-2 focus:ring-brand/20" rows={2} value={formData.cooperationScope} onChange={(e) => dispatch({ type: 'SET', field: 'cooperationScope', value: e.target.value })} disabled={!isEditing} />
                        </div>
                        <div className="flex items-center gap-2"><input type="checkbox" id="isCore" checked={formData.isCorePartner} onChange={(e) => dispatch({ type: 'SET', field: 'isCorePartner', value: e.target.checked })} disabled={!isEditing} className="w-4 h-4 rounded" /><label htmlFor="isCore" className="text-sm cursor-pointer select-none">核心合作伙伴</label></div>
                      </div>
                      {isEditing && <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800"><Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>取消</Button><Button variant="brand" size="sm" onClick={handleSave}><Save className="w-4 h-4" />保存</Button></div>}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>联系人</CardTitle>{isEditing && <Button variant="ghost" size="sm" onClick={addContact}><Plus className="w-3.5 h-3.5" />添加</Button>}</CardHeader>
                    <CardContent>
                      {contacts.length === 0 ? <EmptyState title="暂无联系人" /> : (
                        <div className="space-y-3">
                          {contacts.map((c, i) => (
                            <div key={i} className={cn('p-3 rounded-lg border', c.isPrimary ? 'border-amber-200 dark:border-amber-800 bg-amber-50/20' : 'border-neutral-200 dark:border-neutral-800')}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-neutral-900 dark:text-white">{c.lastName}{c.firstName || '新联系人'}</span>
                                <div className="flex items-center gap-2">
                                  <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="radio" name="pc" checked={c.isPrimary} onChange={() => setContacts((p) => p.map((x, j) => ({ ...x, isPrimary: j === i })))} disabled={!isEditing} /> 主要</label>
                                  {isEditing && contacts.length > 1 && <button onClick={() => removeContact(i)} className="p-1 text-neutral-400 hover:text-red-500"><Plus className="w-3 h-3 rotate-45" /></button>}
                                </div>
                              </div>
                              {isEditing ? (
                                <div className="grid grid-cols-2 gap-2">
                                  <Input value={c.lastName} onChange={(e) => updateContact(i, 'lastName', e.target.value)} placeholder="姓" />
                                  <Input value={c.firstName} onChange={(e) => updateContact(i, 'firstName', e.target.value)} placeholder="名" />
                                  <Input value={c.department || ''} onChange={(e) => updateContact(i, 'department', e.target.value)} placeholder="部门" />
                                  <Input value={c.title} onChange={(e) => updateContact(i, 'title', e.target.value)} placeholder="职位" />
                                  <Input value={c.phone} onChange={(e) => updateContact(i, 'phone', e.target.value)} placeholder="手机号" />
                                  <Input value={c.email} onChange={(e) => updateContact(i, 'email', e.target.value)} placeholder="邮箱" />
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                  {c.department && <span className="text-neutral-500"><span className="text-xs font-medium">部门:</span> {c.department}</span>}
                                  <span className="text-neutral-500"><span className="text-xs font-medium">职位:</span> {c.title || '-'}</span>
                                  <span className="text-neutral-500 flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone || c.mobile || '-'}</span>
                                  <span className="text-neutral-500 flex items-center gap-1"><Mail className="w-3 h-3" />{c.email || '-'}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle>合作里程碑</CardTitle></CardHeader>
                    <CardContent>
                      <div className="relative before:absolute before:inset-0 before:ml-5 before:w-px before:bg-neutral-200 dark:before:bg-neutral-800">
                        {lifecycleStages.map((m, i) => (
                          <div key={m.year} className="relative flex gap-4 pb-5 last:pb-0">
                            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 border-2', i === lifecycleStages.length - 1 ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700')}>
                              <span className={cn('text-xs font-semibold', i === lifecycleStages.length - 1 ? 'text-white dark:text-neutral-900' : 'text-neutral-500')}>{m.year.slice(2)}</span>
                            </div>
                            <div className="pt-1"><div className="flex items-center gap-2"><span className="text-sm font-semibold text-neutral-900 dark:text-white">{m.stage}</span><span className="text-xs text-neutral-400">{m.event}</span></div><p className="text-xs text-neutral-500 mt-0.5">{m.desc}</p></div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>组织架构</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center text-sm">
                        <div className="px-4 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-center mb-2"><p className="font-semibold">{orgStructure[0].role}</p><p className="text-xs opacity-70">{orgStructure[0].name}</p></div>
                        <div className="w-px h-3 bg-neutral-300 dark:bg-neutral-600" />
                        <div className="flex gap-4">
                          {orgStructure[0].children?.map((c, ci) => (
                            <div key={ci} className="flex flex-col items-center">
                              <div className="w-px h-3 bg-neutral-300 dark:bg-neutral-600" />
                              <div className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center"><p className="font-medium text-neutral-900 dark:text-white">{c.role}</p><p className="text-xs text-neutral-500">{c.name}</p></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>等级变迁</CardTitle></CardHeader>
                    <CardContent>
                      {[{ from: '注册', to: '银牌', date: '2019Q2' }, { from: '银牌', to: '金牌', date: '2020Q4' }, { from: '金牌', to: '白金', date: '2024Q1' }].map((t, i) => (
                        <div key={i} className="flex items-center gap-2 py-2"><Badge variant="default" size="sm">{t.from}</Badge><ArrowUpRight className="w-3 h-3 text-emerald-500" /><Badge variant="primary" size="sm">{t.to}</Badge><span className="text-xs text-neutral-400 ml-auto">{t.date}</span></div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Lifecycle + Customers + Quarterly stacked */}
              <Card>
                <CardHeader><CardTitle>重要客户</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-neutral-200 dark:border-neutral-800"><th className="text-left py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">客户</th><th className="text-left py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">产品</th><th className="text-center py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">份额</th><th className="text-left py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">竞品</th><th className="text-right py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">年合同额</th><th className="text-center py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">状态</th></tr></thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {keyCustomers.map((c, i) => (
                          <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                            <td className="py-2.5 px-3 font-medium text-neutral-900 dark:text-white">{c.name}<p className="text-xs text-neutral-400">{c.industry}</p></td>
                            <td className="py-2.5 px-3 text-neutral-500">{c.product}</td>
                            <td className="py-2.5 px-3 text-center">{c.ourShare===0?<Badge variant="danger" size="sm">丢标</Badge>:c.ourShare<100?<div className="flex items-center gap-2"><ProgressBar value={c.ourShare} size="sm" className="w-12"/><span className="text-xs">{c.ourShare}%</span></div>:<Badge variant="success" size="sm">独家</Badge>}</td>
                            <td className="py-2.5 px-3">{c.competitor==='-'?<span className="text-xs text-neutral-400">-</span>:<span className="text-xs font-medium text-amber-600">{c.competitor}</span>}</td>
                            <td className="py-2.5 px-3 text-right font-medium">{formatCurrency(c.value)}</td>
                            <td className="py-2.5 px-3 text-center"><Badge variant={c.status==='在服'?'success':c.status==='POC'?'info':c.status==='商务'?'warning':'danger'} size="sm">{c.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>季度沟通记录</CardTitle></CardHeader>
                <CardContent>
                  {quarterlyReviews.map((qr, i) => (
                    <div key={qr.q} className={cn('flex gap-4 py-3', i>0&&'border-t border-neutral-100 dark:border-neutral-800')}>
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', i===0?'bg-neutral-900 dark:bg-white':'bg-neutral-100 dark:bg-neutral-800')}><Calendar className={cn('w-4 h-4', i===0?'text-white dark:text-neutral-900':'text-neutral-500')} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1"><span className="text-sm font-semibold text-neutral-900 dark:text-white">{qr.q}</span><span className="text-xs text-neutral-400">{qr.date}</span><Badge variant={qr.progress.includes('进行中')?'info':'success'} size="sm">{qr.progress}</Badge></div>
                        <div className="grid grid-cols-2 gap-2 text-sm"><div className="p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded"><span className="text-xs text-neutral-500">目标</span><p className="font-medium">{qr.goal}</p></div><div className="p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded"><span className="text-xs text-neutral-500">成果</span><p className="font-medium">{qr.key}</p></div></div>
                        <p className="text-xs text-neutral-400 mt-1">参会: {qr.attendees.join('、')}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 6: 生态协作网络
              ══════════════════════════════════════════════ */}
          {activeTab === 'network' && (
            <div className="space-y-6">
              {/* Network Position Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>网络位置分析</CardTitle>
                  <div className="relative group">
                    <button className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[11px] font-semibold text-neutral-500 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors">?</button>
                    <div className="absolute right-0 top-6 w-72 p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      该伙伴处于生态网络的<b>结构洞</b>位置——连接了原本不互通的SI和ISV群体，因此享有<b>信息优势</b>（比别人更早知道机会）和<b>控制优势</b>（决定信息如何流动）。这种"桥梁"角色赋予其独特的生态定价权。
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Hub-and-spoke diagram */}
                    <div className="flex flex-col items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                      <div className="relative w-48 h-48">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-neutral-900 dark:bg-white flex flex-col items-center justify-center text-white dark:text-neutral-900 z-10 shadow-lg">
                          <span className="text-[9px] font-semibold">本伙伴</span>
                          <span className="text-[8px] opacity-70">{partner.tier}</span>
                        </div>
                        {[
                          { label: '昆仑联通', type: 'SI', angle: -90, dist: 55, color: '#2563eb' },
                          { label: '精诚中国', type: 'Reseller', angle: -20, dist: 60, color: '#059669' },
                          { label: '上海智医', type: 'ISV', angle: 50, dist: 55, color: '#7c3aed' },
                          { label: '南京云帆', type: 'SI(子)', angle: 130, dist: 50, color: '#d97706' },
                          { label: '杭州智联', type: 'ISV(子)', angle: 200, dist: 55, color: '#0891b2' },
                        ].map((node) => {
                          const rad = (node.angle * Math.PI) / 180;
                          const cx = 50 + node.dist * Math.cos(rad) * 0.8;
                          const cy = 50 + node.dist * Math.sin(rad) * 0.8;
                          return (
                            <svg key={node.label} className="absolute inset-0 w-full h-full overflow-visible" style={{ pointerEvents: 'none' }}>
                              <line x1="50%" y1="50%" x2={`${cx}%`} y2={`${cy}%`} stroke={node.color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
                              <circle cx={`${cx}%`} cy={`${cy}%`} r="5" fill={node.color} opacity="0.8" />
                              <text x={`${cx}%`} y={`${cy + 5}%`} textAnchor="middle" fontSize="7" fill="#888">{node.label}</text>
                            </svg>
                          );
                        })}
                      </div>
                      <p className="text-xs text-neutral-500 mt-2 text-center">星型拓扑 · 该伙伴是网络中心节点</p>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                          <b>该伙伴处于网络的"桥梁"位置。</b>SI（昆仑联通）和ISV（上海智医）原本没有直接连接，而是通过该伙伴间接协作。这使得该伙伴不仅是一个交易中介，更是<b>信息枢纽和信任中介</b>——谁掌握连接，谁就掌握价值分配的话语权。
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">网络价值增长潜力</span>
                            <div className="relative group/ml">
                              <span className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] text-neutral-500 cursor-help inline-flex">?</span>
                              <div className="absolute left-0 top-5 w-56 p-2 bg-white dark:bg-neutral-800 border rounded-lg shadow-xl z-50 opacity-0 invisible group-hover/ml:opacity-100 group-hover/ml:visible transition-all text-[10px] text-neutral-500 leading-relaxed">
                                网络价值与连接节点数的平方成正比。当前5节点=25单位价值，扩展到8节点将达到64单位(+156%)。
                              </div>
                            </div>
                          </div>
                          <p className="text-2xl font-semibold text-neutral-900 dark:text-white">+156%</p>
                          <p className="text-xs text-neutral-500 mt-1">5节点→8节点的预期价值增幅</p>
                        </div>
                        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">互补性评估</span>
                            <div className="relative group/ml">
                              <span className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] text-neutral-500 cursor-help inline-flex">?</span>
                              <div className="absolute left-0 top-5 w-56 p-2 bg-white dark:bg-neutral-800 border rounded-lg shadow-xl z-50 opacity-0 invisible group-hover/ml:opacity-100 group-hover/ml:visible transition-all text-[10px] text-neutral-500 leading-relaxed">
                                创新商业化需要互补性资产。云原生方案(核心)+AI能力(互补)+分销渠道(互补)=完整的价值闭环。互补性越强，协作的不可替代性越高。
                              </div>
                            </div>
                          </div>
                          <p className="text-2xl font-semibold text-emerald-600">高</p>
                          <p className="text-xs text-neutral-500 mt-1">核心+AI+渠道形成完整闭环</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Collaboration Table */}
              <Card>
                <CardHeader><CardTitle>协作关系图谱</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">协作伙伴</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">关系类型</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">协作强度</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">协作产出</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">联合项目</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">协作逻辑 <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-[9px] text-neutral-500 cursor-help">?</span></th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">放大建议</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {[
                          { ...ecosystemPartners[0], logic: 'SI提供客户关系 + 本伙伴提供技术方案 → 联合打单的交易成本远低于各自独立获客，这是典型的专业化分工带来的效率提升', amplify: '联合项目数从5个→10个，预计增量营收¥280万' },
                          { ...ecosystemPartners[1], logic: '双方存在相互依赖：精诚依赖本伙伴的产品授权，本伙伴依赖精诚的客户渠道。这种对称的相互依赖创造了最稳定的合作基础', amplify: '拓展安全+数据产品线，利用精诚的12个客户触点交叉销售' },
                          { ...ecosystemPartners[2], logic: '本伙伴的云原生方案(核心能力) + 上海智医的AI算法(稀缺能力) = 单一伙伴无法独立提供的完整AI医疗解决方案，协作的不可替代性极高', amplify: '联合参加Q3医疗峰会，预计产出5-8个高质量商机' },
                        ].map((ep, i) => (
                          <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 group">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#2563eb','#059669','#7c3aed'][i] }} />
                                <span className="font-medium text-neutral-900 dark:text-white">{ep.name}</span>
                              </div>
                              <p className="text-xs text-neutral-400 mt-0.5">{ep.type}</p>
                            </td>
                            <td className="py-4 px-4 text-center"><Badge variant={i===0?'primary':i===1?'success':'info'} size="sm">{ep.relation}</Badge></td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <ProgressBar value={ep.deals/0.15} size="sm" className="w-16" variant={ep.deals>=8?'brand':'default'} />
                                <span className="text-xs font-medium">{ep.deals>=8?'强':ep.deals>=4?'中':'弱'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right font-semibold">{formatCurrency(ep.volume)}</td>
                            <td className="py-4 px-4 text-center">{ep.deals} 个</td>
                            <td className="py-4 px-4 max-w-[220px]"><p className="text-xs text-neutral-500 leading-relaxed">{ep.logic}</p></td>
                            <td className="py-4 px-4 max-w-[200px]"><p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">{ep.amplify}</p></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Sub-partners */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>子合作伙伴</CardTitle>
                    <Button variant="secondary" size="sm"><Plus className="w-4 h-4" />新增</Button>
                  </CardHeader>
                  <CardContent>
                    {[
                      { id: 'sp1', name: '南京云帆科技有限公司', type: 'SI', contact: '周伟', phone: '13812345678', status: 'Active', role: '区域交付延伸——弥补华东二线城市覆盖', analysis: '自建华东二线交付团队成本约¥80万/年，子合作模式成本仅¥30万/年，节约63%。当交易频率低、资产专用性低时，外包优于内部化。' },
                      { id: 'sp2', name: '杭州智联信息技术有限公司', type: 'ISV', contact: '林芳', phone: '13987654321', status: 'Active', role: 'AI能力补全——弥补算法和模型开发短板', analysis: 'AI能力自建需2年+¥200万投入，子合作模式6个月即获得可用能力。当速度是首要竞争要素时，外部获取优于内部建设。' },
                    ].map((sp) => (
                      <div key={sp.id} className="py-4 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div><p className="text-sm font-medium text-neutral-900 dark:text-white">{sp.name}</p><p className="text-xs text-neutral-400">{sp.type} · {sp.contact} · {sp.phone}</p></div>
                          <Badge variant={sp.status === 'Active' ? 'success' : 'warning'} size="sm">{sp.status === 'Active' ? '活跃' : '非活跃'}</Badge>
                        </div>
                        <p className="text-xs text-neutral-500 mb-1">战略角色: {sp.role}</p>
                        <div className="flex items-start gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] text-neutral-500 cursor-help shrink-0 mt-0.5 relative group/ml">
                            ?
                            <div className="absolute left-0 bottom-5 w-52 p-2 bg-white dark:bg-neutral-800 border rounded-lg shadow-xl z-50 opacity-0 invisible group-hover/ml:opacity-100 group-hover/ml:visible transition-all text-[10px] text-neutral-500 leading-relaxed">
                              企业边界的决策逻辑：当外部交易成本低于内部管理成本时，选择合作而非自建。这里的分析量化了两种模式的成本和速度差异。
                            </div>
                          </span>
                          <p className="text-xs text-neutral-500 leading-relaxed">{sp.analysis}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>协作网络价值评估</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { dim: '连接广度', desc: '5个直接连接节点形成一级协作圈，星型拓扑中心位置——连接的数量和多样性决定了信息获取的广度', score: 85 },
                        { dim: '关系深度', desc: '与昆仑联通合作5个项目（联合打单成功率68%），但与ISV协作仅3个项目——深度有待加强', score: 72 },
                        { dim: '认知协同', desc: '与精诚中国12个项目的长期合作建立了共享市场理解和客户洞察——默契降低了沟通成本', score: 80 },
                      ].map((d) => (
                        <div key={d.dim} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-neutral-900 dark:text-white">{d.dim}</span>
                              <div className="relative group/ml">
                                <span className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] text-neutral-500 cursor-help inline-flex">?</span>
                                <div className="absolute left-0 top-5 w-56 p-2 bg-white dark:bg-neutral-800 border rounded-lg shadow-xl z-50 opacity-0 invisible group-hover/ml:opacity-100 group-hover/ml:visible transition-all text-[10px] text-neutral-500 leading-relaxed">
                                  协作价值取决于三个维度：连接谁（结构）、关系多深（关系）、是否互相理解（认知）。三个维度共同决定了协作的效率和产出。
                                </div>
                              </div>
                            </div>
                            <span className={cn('text-sm font-semibold', d.score >= 80 ? 'text-emerald-600' : d.score >= 70 ? 'text-amber-600' : 'text-red-500')}>{d.score}分</span>
                          </div>
                          <ProgressBar value={d.score} size="sm" variant={d.score >= 80 ? 'success' : 'default'} />
                          <p className="text-xs text-neutral-500 mt-2">{d.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        <b>综合评估：</b>协作网络总评分79分（白金前25%）。该伙伴在连接广度上表现优异，但关系深度（特别是ISV协作）有提升空间——应从项目级协作升级为方案级共创。核心建议：将伙伴定位从"渠道代理"升级为<b>"区域生态协调者"</b>，赋予更多跨伙伴协作的撮合权。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ecosystem Value Summary */}
              <Card>
                <CardHeader><CardTitle>生态协作价值总览</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: '网络规模', value: '5节点', sub: '3生态+2子伙伴' },
                      { label: '协作营收', value: formatCurrency(ecosystemPartners.reduce((s,e)=>s+e.volume,0)), sub: '占总营收60%' },
                      { label: '网络位置', value: '枢纽', sub: '星型拓扑中心' },
                      { label: '协作评分', value: '79分', sub: '白金前25%' },
                    ].map((m) => (
                      <div key={m.label} className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl text-center">
                        <p className="text-xs text-neutral-400 mb-1">{m.label}</p>
                        <p className="text-xl font-semibold text-neutral-900 dark:text-white">{m.value}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{m.sub}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
