import { useState, useMemo } from 'react';
import {
  User, MapPin, ChevronRight, Building2, TrendingUp, TrendingDown, Award, CheckCircle2,
  AlertTriangle, History, FileText, Users, Phone, Mail, Download, Star, ShoppingCart,
  DollarSign, Target, Calendar, Network, GitBranch, ArrowUpRight, ArrowDownRight,
  Activity, Shield, Lightbulb, Crosshair, Rocket, Compass, Zap, Brain, Sparkles,
  Eye, Layers, BarChart3, Clock, Search, ExternalLink, Info, Link2, Plus, Trash2, Save, Pencil, XCircle,
} from 'lucide-react';
import { Partner, PartnerDetails, Activity as ActivityType, PartnerTier, PartnerStatus, PartnerType } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';
import { recordTypeLabel, TIER_LABELS, TYPE_LABELS, STATUS_CONFIG } from '../../lib/partner-labels';
import { useLanguage } from '../../contexts/LanguageContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Tabs } from '../ui/Tabs';
import { EmptyState } from '../ui/EmptyState';
import { partnerService } from '../../services/partner-service';

// ─── Tiny Helpers ─────────────────────────────────
const StatBox = ({ icon: I, label, value, sub, color, link }: any) => (
  <div className="text-center px-3 py-2">
    <I className={cn('w-4 h-4 mx-auto mb-1', color || 'text-neutral-400')} />
    <p className="text-lg font-semibold text-neutral-900 dark:text-white">{value}</p>
    <p className="text-[10px] text-neutral-500">{label}</p>
    {sub && <p className="text-[10px] text-neutral-400 mt-0.5">{sub}</p>}
    {link && <p className="text-[9px] text-blue-500 mt-0.5 cursor-pointer hover:underline">{link}</p>}
  </div>
);
const VDiv = ({ className }: any) => <div className={cn('w-px h-10 bg-neutral-200 dark:bg-neutral-800 hidden sm:block', className)} />;
const CrossRef = ({ text, to }: { text: string; to: string }) => (
  <span className="text-[10px] text-blue-500 cursor-pointer hover:underline" title={`关联: ${to}`}>↳ {text}</span>
);

type LayerType = 'execution' | 'insight' | 'intelligence';

export const PartnerProfile = ({ partner, activities, onBack, onPartnerUpdate }: {
  partner: PartnerDetails; activities: ActivityType[]; onBack?: () => void;
  onPartnerUpdate?: (updated: Partner) => void;
}) => {
  const { t } = useLanguage();
  const { config } = useConfig();
  const currency = config?.currency || 'CNY';
  const { user, role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === 'admin';
  const isInternal = ['admin', 'channel_director', 'channel_manager', 'marketing_director', 'marketing_manager', 'sales_director', 'sales_manager'].includes(role);
  const [layer, setLayer] = useState<LayerType>('execution');
  const [execTab, setExecTab] = useState('pipeline');
  const [insightTab, setInsightTab] = useState('capability');
  const [intelTab, setIntelTab] = useState('breakthrough');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [opLogs, setOpLogs] = useState<any[]>([]);

  const enterEdit = () => {
    setEditData({
      name: partner.name || '', englishName: partner.englishName || '',
      tier: partner.tier, status: partner.status, type: partner.type,
      manager: partner.manager || '', location: partner.location || '',
      city: partner.city || '', industry: partner.industry || '',
      isCorePartner: partner.isCorePartner || false,
      unifiedSocialCreditCode: partner.unifiedSocialCreditCode || '',
      cooperationScope: partner.cooperationScope || '',
      website: partner.website || '', registeredAddress: partner.registeredAddress || '',
      tags: (partner.tags || []).join('、'),
    });
    setEditMode(true);
  };
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    const updatedData = {
      ...editData,
      tags: (editData.tags || '').split(/[,，、]/).map((s: string) => s.trim()).filter(Boolean),
    };
    partnerService.update(partner.id, updatedData as any, user?.email || 'admin')
      .then(() => {
        setSaveMsg({ type: 'success', text: '保存成功' });
        onPartnerUpdate?.({ ...partner, ...updatedData, contacts: partner.contacts || [] } as Partner);
        setEditMode(false);
      })
      .catch((err: any) => { setSaveMsg({ type: 'error', text: `保存失败: ${err.message}` }); })
      .finally(() => setSaving(false));
  };
  const handleDeleteProfile = async () => {
    if (!confirm(`确定要删除「${partner.name}」吗？此操作不可撤销。`)) return;
    try {
      await partnerService.delete(partner.id, user?.email || 'admin');
      toast('success', '已删除');
      onBack?.();
    } catch (err: any) { toast('error', `删除失败: ${err.message}`); }
  };
  const loadOpLogs = async () => {
    const logs = await partnerService.getOperationLogs(partner.id);
    setOpLogs(logs);
  };

  if (!partner) return <EmptyState title="Partner not found" />;

  const contacts = partner.contacts || [];
  const primary = contacts.find((c: any) => c.isPrimary) || contacts[0];
  const pip = partner.pipeline || { registered: 0, solution: 0, commercial: 0, won: 0 };
  const en = partner.enablement || { certifiedEngineers: 0, specialists: 0, expiryRiskCount: 0, expiryDays: 0 };
  const mdf = partner.mdf || { total: 0, used: 0, remaining: 0, activities: [] };
  const mdfPct = mdf.total > 0 ? Math.round((mdf.used / mdf.total) * 100) : 0;
  const topProjects = partner.topProjects || [];
  const tags = partner.tags || [];

  // ── Scoring ────────────────────────────────────────
  const scores = useMemo(() => {
    const activity = Math.min(100, (pip.registered > 0 ? 30 : 0) + en.certifiedEngineers * 3 + (partner.winRate || 0) * 0.5);
    const capability = Math.min(100, en.certifiedEngineers * 3 + en.specialists * 8 + (partner.winRate || 0) * 0.3);
    const ph = pip.registered > 0 ? Math.round((pip.won / pip.registered) * 100) : 0;
    const loyalty = Math.min(100, (partner.years || 0) * 10 + (partner.tier === 'Platinum' ? 40 : partner.tier === 'Gold' ? 25 : 10));
    const growth = Math.max(0, Math.round(((pip.registered - pip.registered * 0.7) / (pip.registered * 0.7 || 1)) * 100));
    const overall = Math.round(activity * 0.25 + capability * 0.25 + ph * 0.2 + loyalty * 0.15 + growth * 0.15);
    const churnRisk = (partner.status !== 'Cooperating' ? 35 : 0) + (en.expiryRiskCount > 2 ? 20 : 0) + (pip.registered < 1000000 ? 20 : 0) + ((partner.winRate || 0) < 40 ? 15 : 0);
    return { activity, capability, ph, loyalty, growth, overall, churnRisk, churnLevel: churnRisk >= 50 ? '高' as const : churnRisk >= 25 ? '中' as const : '低' as const };
  }, [partner, pip, en]);
  const lifeStage = (partner.years || 0) >= 8 ? '战略期' : (partner.years || 0) >= 5 ? '成熟期' : (partner.years || 0) >= 3 ? '成长期' : '导入期';

  // ── Breakthroughs ──────────────────────────────────
  const breakthroughs = useMemo(() => {
    const b: any[] = [];
    if (pip.solution < pip.registered * 0.6) b.push({ t: '方案转化突破', c: `报备→方案仅${Math.round((pip.solution / Math.max(pip.registered, 1)) * 100)}%转化`, a: '安排原厂售前联合拜访Top3项目', roi: '3.5x', links: '能力画像:安全45分 | 组织:技术总监吴忠奎' });
    if (en.expiryRiskCount > 0) b.push({ t: '认证续期窗口', c: `${en.expiryRiskCount}人认证${en.expiryDays}天内过期——失去报备资格`, a: '紧急安排续证考试', roi: '紧急', links: '组织:技术部 | 生命周期:战略期要求' });
    if (mdfPct < 70) b.push({ t: 'MDF激活', c: `使用率${mdfPct}%，剩余${formatCurrency(mdf.remaining, currency)}`, a: 'Q3前提交2个活动方案', roi: '3.2x', links: 'QBR:Q2能力升级目标 | 客户:医疗行业' });
    b.push({ t: '生态协作放大', c: '协作项目客单价是非协作的2.4倍，当前仅3个活跃关系', a: '发起SI+ISV联合方案workshop', roi: '2.4x', links: '生态:昆仑联通+上海智医 | 客户:北京协和' });
    return b;
  }, [pip, en, mdfPct, mdf, currency]);

  const [showScoreDetail, setShowScoreDetail] = useState(false);

  const renderHeader = () => (
    <Card>
      <div className="flex flex-col md:flex-row md:items-center gap-5">
        <div className="relative group shrink-0">
          <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border">
            {partner.logo ? <img alt="" className="w-full h-full object-contain p-3 rounded-xl" src={partner.logo} /> : <Building2 className="w-7 h-7 text-neutral-500" />}
          </div>
          <button className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-medium" title="上传Logo">更换</button>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            {editMode ? (
              <input className="text-xl font-semibold bg-transparent border-b-2 border-brand dark:border-brand-light focus:outline-none text-neutral-900 dark:text-white w-full max-w-sm" value={editData.name || ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
            ) : <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">{partner.name}</h2>}
            {editMode ? (
              <div className="flex gap-2">
                <select className="h-8 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs" value={editData.tier || ''} onChange={(e) => setEditData({ ...editData, tier: e.target.value })}>
                  {(config?.partnerTiers || ['Platinum','Gold','Silver','Registered']).map((t) => <option key={t} value={t}>{TIER_LABELS[t] || t}</option>)}
                </select>
                <select className="h-8 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs" value={editData.status || ''} onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
                  {(config?.partnerStatuses || ['Cooperating','Inactive','Prospective']).map((s) => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
                </select>
                <select className="h-8 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs" value={editData.type || ''} onChange={(e) => setEditData({ ...editData, type: e.target.value })}>
                  {(config?.partnerTypes || ['Reseller','ISV','SI','Service']).map((t) => <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>)}
                </select>
              </div>
            ) : (
              <>
                <Badge variant="primary" size="md">{TIER_LABELS[partner.tier] || partner.tier}</Badge>
                <Badge variant={partner.status === 'Cooperating' ? 'success' : 'warning'} size="md">{partner.status === 'Cooperating' ? '合作中' : partner.status === 'Inactive' ? '已过期' : '潜在'}</Badge>
              </>
            )}
            <div className="relative">
              <button onClick={() => setShowScoreDetail(!showScoreDetail)}><Badge variant={scores.overall >= 80 ? 'success' : scores.overall >= 60 ? 'warning' : 'danger'} size="sm" className="cursor-pointer">健康{scores.overall}分</Badge></button>
              {showScoreDetail && (
                <div className="absolute top-full mt-2 left-0 w-64 p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-50 text-xs">
                  <p className="font-semibold mb-2">健康度 = 活跃×25% + 能力×25% + Pipeline×20% + 忠诚×15% + 增长×15%</p>
                  <div className="space-y-1 text-neutral-500">
                    <div className="flex justify-between"><span>活跃度</span><span>{scores.activity} × 0.25 = {(scores.activity * 0.25).toFixed(0)}</span></div>
                    <div className="flex justify-between"><span>能力值</span><span>{scores.capability} × 0.25 = {(scores.capability * 0.25).toFixed(0)}</span></div>
                    <div className="flex justify-between"><span>Pipeline健康</span><span>{scores.ph} × 0.20 = {(scores.ph * 0.2).toFixed(0)}</span></div>
                    <div className="flex justify-between"><span>忠诚度</span><span>{scores.loyalty} × 0.15 = {(scores.loyalty * 0.15).toFixed(0)}</span></div>
                    <div className="flex justify-between"><span>增长力</span><span>{scores.growth} × 0.15 = {(scores.growth * 0.15).toFixed(0)}</span></div>
                    <div className="flex justify-between font-semibold pt-1 border-t border-neutral-200 dark:border-neutral-700"><span>综合</span><span>{scores.overall}分</span></div>
                  </div>
                  <button onClick={() => setShowScoreDetail(false)} className="text-[10px] text-neutral-400 mt-2">点击关闭</button>
                </div>
              )}
            </div>
            <div className="relative group">
              <Badge variant="info" size="sm">{lifeStage}</Badge>
              <div className="absolute bottom-full left-0 mb-2 w-56 p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-50 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <p className="font-semibold mb-1">生命周期阶段</p>
                <p className="text-neutral-500">导入期(0-3年): 建立合作关系</p>
                <p className="text-neutral-500">成长期(3-5年): 业务起步</p>
                <p className="text-neutral-500">成熟期(5-8年): 规模交付</p>
                <p className="text-neutral-500">战略期(8年+): 联合创新</p>
                <p className="text-neutral-400 mt-1">当前: {partner.years || 0}年 → {lifeStage}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
            {editMode ? (
              <>
                <span className="flex items-center gap-1.5"><User className="w-4 h-4 shrink-0" /><input className="h-8 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-sm w-32" value={editData.manager || ''} onChange={(e) => setEditData({ ...editData, manager: e.target.value })} placeholder="渠道经理" /></span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 shrink-0" /><input className="h-8 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-sm w-40" value={editData.location || ''} onChange={(e) => setEditData({ ...editData, location: e.target.value })} placeholder="地址" /></span>
                <span className="flex items-center gap-1.5"><input className="h-8 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-sm w-28" value={editData.city || ''} onChange={(e) => setEditData({ ...editData, city: e.target.value })} placeholder="城市" /></span>
                <span className="flex items-center gap-1.5"><input className="h-8 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-sm w-48" value={editData.website || ''} onChange={(e) => setEditData({ ...editData, website: e.target.value })} placeholder="官网 URL" /></span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{partner.manager || '-'}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{partner.location || '-'}</span>
                <span className="flex items-center gap-1.5"><History className="w-4 h-4" />{(() => {
                  const yrs = partner.years || 0;
                  if (yrs > 0) return `${yrs}年`;
                  if (partner.startDate) {
                    const d = new Date(partner.startDate);
                    if (!isNaN(d.getTime())) return `${new Date().getFullYear() - d.getFullYear()}年`;
                  }
                  return '-';
                })()}</span>
                {primary && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{primary.lastName}{primary.firstName} {primary.phone || primary.mobile}</span>}
                {partner.website ? (
                  <a href={partner.website.startsWith('http') ? partner.website : 'https://' + partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline text-xs"><ExternalLink className="w-3 h-3" />{partner.website}</a>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-neutral-400"><ExternalLink className="w-3 h-3" />暂无网址</span>
                )}
              </>
            )}
          </div>
          {editMode ? (
            <div className="flex flex-wrap gap-2 mt-2">
              <input className="h-8 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs w-64" value={editData.tags || ''} onChange={(e) => setEditData({ ...editData, tags: e.target.value })} placeholder="标签（、分隔）" />
              <input className="h-8 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs w-64" value={editData.industry || ''} onChange={(e) => setEditData({ ...editData, industry: e.target.value })} placeholder="行业" />
              <input className="h-8 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs w-48" value={editData.unifiedSocialCreditCode || ''} onChange={(e) => setEditData({ ...editData, unifiedSocialCreditCode: e.target.value })} placeholder="信用代码" />
              <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={editData.isCorePartner || false} onChange={(e) => setEditData({ ...editData, isCorePartner: e.target.checked })} />核心合作伙伴</label>
              <input className="h-8 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs w-full" value={editData.cooperationScope || ''} onChange={(e) => setEditData({ ...editData, cooperationScope: e.target.value })} placeholder="合作范围" />
              <input className="h-8 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs w-48" value={editData.englishName || ''} onChange={(e) => setEditData({ ...editData, englishName: e.target.value })} placeholder="英文名称" />
              <input className="h-8 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs w-full" value={editData.registeredAddress || ''} onChange={(e) => setEditData({ ...editData, registeredAddress: e.target.value })} placeholder="注册地址" />
            </div>
          ) : (
            <div className="flex gap-2 mt-2">{tags.map((tag: string) => <Badge key={tag} variant="default" size="sm">{tag}</Badge>)}</div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-around border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-4">
        {layer === 'execution' && <>
          <StatBox icon={ShoppingCart} label="商机总额" value={formatCurrency(pip.registered, currency)} sub={`赢单 ${formatCurrency(pip.won, currency)} · 5个客户`} link="→ 客户组合" />
          <VDiv /><StatBox icon={Target} label="MDF使用率" value={`${mdfPct}%`} sub={`剩余 ${formatCurrency(mdf.remaining, currency)}`} link="→ Q2能力升级" />
          <VDiv /><StatBox icon={Award} label="认证工程师" value={String(en.certifiedEngineers)} sub={en.expiryRiskCount > 0 ? `${en.expiryRiskCount}人即将过期` : '全部有效'} color={en.expiryRiskCount > 0 ? 'text-red-500' : 'text-emerald-500'} link="→ 组织架构" />
          <VDiv /><StatBox icon={TrendingUp} label="赢单率" value={`${partner.winRate || 0}%`} sub={scores.ph >= 60 ? 'Pipeline健康' : '需提升转化'} link="→ 能力画像" />
        </>}
        {layer === 'insight' && <>
          <StatBox icon={Activity} label="活跃度" value={`${scores.activity}分`} sub={scores.activity >= 80 ? '交易/报备/参与均活跃' : scores.activity >= 60 ? '报备活跃·下单待提升' : '需激活'} color={scores.activity >= 80 ? 'text-emerald-500' : scores.activity >= 60 ? 'text-amber-500' : 'text-red-500'} />
          <VDiv /><StatBox icon={Shield} label="能力值" value={`${scores.capability}分`} sub={`${en.certifiedEngineers}认证·${en.specialists}专家`} color={scores.capability >= 70 ? 'text-emerald-500' : scores.capability >= 50 ? 'text-amber-500' : 'text-red-500'} />
          <VDiv /><StatBox icon={GitBranch} label="Pipeline健康" value={`${scores.ph}%`} sub={scores.ph >= 60 ? '转化效率达标' : '需提升转化'} color={scores.ph >= 60 ? 'text-emerald-500' : 'text-amber-500'} link="→ 能力维度诊断" />
          <VDiv /><StatBox icon={History} label="忠诚度" value={`${scores.loyalty}分`} sub={`${partner.years || 0}年·${TIER_LABELS[partner.tier] || partner.tier}`} color={scores.loyalty >= 70 ? 'text-emerald-500' : 'text-amber-500'} />
          <VDiv className="hidden lg:block" /><StatBox icon={TrendingUp} label="增长力" value={`${Math.max(0, scores.growth)}%`} sub={scores.growth >= 10 ? '增长强劲' : scores.growth >= 0 ? '平稳' : '下滑'} color={scores.growth >= 10 ? 'text-emerald-500' : scores.growth >= 0 ? 'text-blue-500' : 'text-red-500'} />
        </>}
        {layer === 'intelligence' && <>
          <StatBox icon={Crosshair} label="突破机会" value={`${breakthroughs.length}个`} sub={`ROI最高 ${breakthroughs[0]?.roi || '-'}`} color="text-blue-500" />
          <VDiv /><StatBox icon={AlertTriangle} label="流失风险" value={scores.churnLevel === '高' ? '高风险' : scores.churnLevel === '中' ? '中风险' : '低风险'} sub={`${scores.churnRisk}分`} color={scores.churnLevel === '高' ? 'text-red-500' : scores.churnLevel === '中' ? 'text-amber-500' : 'text-emerald-500'} />
          <VDiv /><StatBox icon={TrendingUp} label="预测Q3营收" value={formatCurrency(pip.registered * 0.4, currency)} sub={`基于${partner.winRate || 0}%赢单率`} color="text-blue-500" />
          <VDiv /><StatBox icon={Rocket} label="交叉销售潜力" value="+15~20%" sub={`AI+安全产品线`} color="text-purple-500" />
        </>}
      </div>
    </Card>
  );

  return (
    <div className="space-y-5">
      {/* Top Bar + Layer Switch */}
      <div className="flex items-center justify-between">
        {onBack && <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium text-sm"><ChevronRight className="w-4 h-4 rotate-180" />{t('profile.backToList')}</button>}
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
            {[{ id: 'execution' as const, label: '执行面' }, { id: 'insight' as const, label: '透视面' }, { id: 'intelligence' as const, label: '决策面' }].map((l) => (
              <button key={l.id} onClick={() => setLayer(l.id)} className={cn('px-4 py-1.5 rounded-md text-xs font-medium transition-all', layer === l.id ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700')}>{l.label}</button>
            ))}
          </div>
          {isInternal && (
            editMode ? (
              <>
                {saveMsg && <span className={`text-xs ${saveMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>{saveMsg.text}</span>}
                <Button variant="secondary" size="sm" onClick={() => { setEditMode(false); setSaveMsg(null); }}>取消</Button>
                <Button variant="brand" size="sm" onClick={handleSave} loading={saving}><Save className="w-4 h-4" />保存</Button>
              </>
            ) : (
              <Button variant="secondary" size="sm" onClick={enterEdit}><Pencil className="w-4 h-4" />编辑</Button>
            )
          )}
          {isAdmin && !editMode && <Button variant="danger" size="sm" onClick={handleDeleteProfile}><Trash2 className="w-4 h-4" />删除</Button>}
          <Button variant="secondary" size="sm"><Download className="w-4 h-4" />导出</Button>
          <Button variant="brand" size="sm">{t('profile.initiateJBP')}</Button>
        </div>
      </div>

      {renderHeader()}

      {/* ═══════════════════════════════════════════════════
          LAYER 1: 执行面
          ═══════════════════════════════════════════════════ */}
      {layer === 'execution' && (
        <div className="space-y-4">
          <Tabs tabs={[
            { id: 'pipeline', label: '商机执行' }, { id: 'org', label: '组织人员' }, { id: 'history', label: '合作往来' },
          ]} activeTab={execTab} onChange={setExecTab} />
          <div className="pt-2">
            {execTab === 'pipeline' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>商机漏斗</CardTitle><span className="text-xs text-neutral-400">↳ 驱动: 销售团队 · 影响: MDF投放 · 产出: 客户签约</span></CardHeader>
                    <CardContent>
                      {[{ l: '报备', v: pip.registered, bg: 'bg-neutral-900 dark:bg-white', tc: 'text-white dark:text-neutral-900', ref: '5个客户 · 2名销售' },
                        { l: '方案', v: pip.solution, bg: 'bg-neutral-600', tc: 'text-white', ref: `转化${pip.registered > 0 ? Math.round((pip.solution / pip.registered) * 100) : 0}% · 能力画像:安全45分` },
                        { l: '商务', v: pip.commercial, bg: 'bg-neutral-400', tc: 'text-neutral-900', ref: '北京协和医院:份额50%·竞品阿里云' },
                        { l: '赢单', v: pip.won, bg: 'bg-emerald-500', tc: 'text-white', ref: `赢单率${partner.winRate || 0}% · 3家独家客户` },
                      ].map((s) => {
                        const w = pip.registered > 0 ? `${Math.round((s.v / pip.registered) * 100)}%` : '0%';
                        return (<div key={s.l} className="mb-3"><div className="flex items-center gap-3"><span className="text-xs font-medium text-neutral-500 w-8">{s.l}</span><div className="flex-1 h-7 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden"><div className={cn('h-full rounded flex items-center px-3', s.bg, s.tc)} style={{ width: w }}><span className="text-xs font-semibold">{formatCurrency(s.v, currency)}</span></div></div></div><p className="text-[10px] text-neutral-400 ml-11 -mt-2">{s.ref}</p></div>);
                      })}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>在跟项目</CardTitle><span className="text-xs text-neutral-400">↳ 关联: 客户 · 销售 · 能力</span></CardHeader>
                    <CardContent>
                      {topProjects.length > 0 ? topProjects.map((pr: any) => (
                        <div key={pr.name} className="py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                          <div className="flex items-center justify-between"><span className="text-sm font-medium truncate flex-1">{pr.name}</span><span className="text-xs font-semibold ml-2">{formatCurrency(pr.amount, currency)}</span></div>
                          <div className="flex items-center justify-between mt-1"><ProgressBar value={pr.progress} size="sm" className="w-24" /><span className="text-[10px] text-neutral-400">{pr.closeDate}</span></div>
                        </div>
                      )) : <EmptyState title="暂无在跟项目" />}
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle>MDF基金使用</CardTitle><span className="text-xs text-neutral-400">↳ 来源: Q2能力升级 · 产出: 线索→商机</span></CardHeader>
                    <CardContent>
                      <div className="flex justify-between mb-2 text-sm"><span>已使用</span><span className="font-semibold">{formatCurrency(mdf.used, currency)} / {formatCurrency(mdf.total, currency)}</span></div>
                      <ProgressBar value={mdfPct} variant={mdfPct > 90 ? 'danger' : 'brand'} size="md" />
                      {(mdf.activities || []).length > 0 && <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">{mdf.activities.slice(0, 3).map((a: any) => (<div key={a.name} className="flex justify-between text-sm py-1"><span className="truncate">{a.name}</span><span className="text-xs text-neutral-400">{a.leads}条线索</span></div>))}</div>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>赋能认证</CardTitle><span className="text-xs text-neutral-400">↳ 关联: 技术团队 · 赢单率 · 报备资格</span></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl text-center"><Award className="w-8 h-8 text-blue-500 mx-auto mb-2" /><p className="text-2xl font-semibold">{en.certifiedEngineers}</p><p className="text-xs text-neutral-500">认证工程师</p></div>
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl text-center"><Star className="w-8 h-8 text-amber-500 mx-auto mb-2" /><p className="text-2xl font-semibold">{en.specialists}</p><p className="text-xs text-neutral-500">高级专家</p></div>
                      </div>
                      {en.expiryRiskCount > 0 && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <div><p className="text-xs font-semibold text-red-700 dark:text-red-400">{en.expiryRiskCount}人认证{en.expiryDays}天内过期</p><p className="text-[10px] text-red-600 dark:text-red-300 mt-0.5">影响: 失去对应产品报备资格 · 方案转化率下降 · 拖累赢单率</p></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {execTab === 'org' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle>组织架构</CardTitle><span className="text-xs text-neutral-400">↳ 关联: 认证团队 · Pipeline · QBR参会</span></CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center text-sm">
                        <div className="px-5 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-center mb-2 ring-4 ring-blue-100 dark:ring-blue-900/30">
                          <p className="font-semibold">任志刚 · 总经理</p><p className="text-xs opacity-60">决策者 · QBR参会 · JBP签署</p>
                        </div>
                        <div className="w-px h-3 bg-neutral-300 dark:bg-neutral-600" />
                        <div className="flex gap-6">
                          {[{ r: '销售总监', n: '何妮', d: '销售部', note: '驱动Pipeline · 管理2名销售' }, { r: '技术总监', n: '吴忠奎', d: '技术部', note: '24人认证团队 · 方案交付核心' }, { r: '商务经理', n: '高辉', d: '商务部', note: 'MDF申请 · 合同管理' }].map((p) => (
                            <div key={p.r} className="flex flex-col items-center">
                              <div className="w-px h-3 bg-neutral-300 dark:bg-neutral-600" />
                              <div className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center">
                                <p className="font-medium text-xs">{p.r}</p><p className="text-[10px] text-neutral-500">{p.n} · {p.d}</p>
                              </div>
                              <p className="text-[9px] text-neutral-400 mt-1 text-center max-w-[100px]">{p.note}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>关键联系人</CardTitle></CardHeader>
                    <CardContent>
                      {contacts.length === 0 ? <EmptyState title="暂无联系人" /> : contacts.slice(0, 6).map((c: any, i: number) => (
                        <div key={i} className={cn('py-2', i > 0 && 'border-t border-neutral-100 dark:border-neutral-800')}>
                          <p className="text-sm font-medium">{c.lastName}{c.firstName} {c.isPrimary && <Badge variant="warning" size="sm">主要</Badge>}</p>
                          <p className="text-xs text-neutral-400">{c.title || '-'}{c.department ? ` · ${c.department}` : ''}</p>
                          <p className="text-xs text-neutral-400"><Phone className="w-3 h-3 inline mr-1" />{c.phone || c.mobile || '-'} {c.email && <span className="ml-2"><Mail className="w-3 h-3 inline mr-1" />{c.email}</span>}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader><CardTitle>合作里程碑</CardTitle><span className="text-xs text-neutral-400">↳ 关联: 生命周期 · 等级变迁 · 客户获取</span></CardHeader>
                  <CardContent>
                    <div className="space-y-0">
                      {[{ y: '2018', s: '招募', e: '通过华北渠道峰会首次接触确认合作意向', link: '起点: 0客户 · 0认证' },
                        { y: '2019', s: '成长', e: '完成首批培训认证签约首个客户项目', link: '首个客户 · 首批认证工程师' },
                        { y: '2020', s: '扩张', e: '从银牌晋升金牌覆盖行业从金融扩展至医疗', link: '等级↑ · 行业:金融→医疗 · 客户+2' },
                        { y: '2022', s: '成熟', e: '年营收突破¥500万成为华北区Top10伙伴', link: '5个在服客户 · 认证团队成型' },
                        { y: '2024', s: '战略', e: '晋升白金伙伴参与联合产品定义', link: '等级:白金 · 开始生态协作' },
                        { y: '2025', s: '引领', e: '持续扩张预计年度营收¥850万+', link: '3个生态伙伴 · 8人高级专家 · Pipeline¥14.2M' },
                      ].map((m, i, arr) => (
                        <div key={i} className="flex gap-4 py-3 relative">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 z-10 text-sm', i === arr.length - 1 ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : i >= 3 ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500' : 'bg-white dark:bg-neutral-900 border text-neutral-500')}>{i + 1}</div>
                          <div className="flex-1 pt-1"><div className="flex items-center gap-2"><span className="text-sm font-semibold">{m.y}</span><Badge variant={i === arr.length - 1 ? 'primary' : 'default'} size="sm">{m.s}</Badge></div><p className="text-xs text-neutral-500 mt-0.5">{m.e}</p><p className="text-[10px] text-blue-500 mt-0.5">{m.link}</p></div>
                          {i < arr.length - 1 && <div className="absolute left-4 top-8 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800" />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {execTab === 'history' && (
              <div className="space-y-6">
                {/* ── Operation Logs ── */}
                <Card>
                  <CardHeader><CardTitle>操作记录</CardTitle><button className="text-xs text-blue-500 hover:underline" onClick={loadOpLogs}>加载记录</button></CardHeader>
                  <CardContent>
                    {opLogs.length === 0 ? (
                      <p className="text-xs text-neutral-400">点击"加载记录"查看操作历史</p>
                    ) : (
                      <div className="space-y-2">
                        {opLogs.map((log: any, i: number) => (
                          <div key={i} className="flex gap-3 py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                              {log.action === 'create' ? <Plus className="w-4 h-4 text-emerald-500" /> :
                               log.action === 'approve' ? <CheckCircle2 className="w-4 h-4 text-brand" /> :
                               log.action === 'reject' ? <XCircle className="w-4 h-4 text-red-500" /> :
                               log.action === 'edit' ? <Pencil className="w-4 h-4 text-amber-500" /> :
                               log.action === 'delete' ? <Trash2 className="w-4 h-4 text-red-600" /> :
                               <Clock className="w-4 h-4 text-neutral-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">
                                {log.action === 'create' ? '创建合作伙伴' :
                                 log.action === 'approve' ? '批复通过' :
                                 log.action === 'reject' ? '驳回申请' :
                                 log.action === 'edit' ? '编辑信息' :
                                 log.action === 'delete' ? '删除' : log.action}
                              </p>
                              <p className="text-xs text-neutral-400">{log.operator} · {new Date(log.created_at).toLocaleString('zh-CN')}</p>
                              {log.details && Object.keys(log.details).length > 0 && !log.details.batch && (
                                <p className="text-xs text-neutral-500 mt-0.5 truncate">{JSON.stringify(log.details)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>季度重要沟通 (QBR)</CardTitle><span className="text-xs text-neutral-400">↳ 关联: 设定目标→合作方案→Pipeline→业绩</span></CardHeader>
                  <CardContent>
                    {[
                      { q: '2025 Q2', d: '2025-06-18', goal: '能力升级', prog: '进行中', key: '5名工程师通过云原生高级认证，AI产品线POC启动', att: ['吴忠奎', 'Alex Rivera'], link: '→ MDF:Q2能力升级 · → 认证:24人' },
                      { q: '2025 Q1', d: '2025-03-20', goal: '新行业拓展', prog: '完成率92%', key: '金融行业实现首个标杆客户，医疗Pipeline增长40%', att: ['何妮', 'Alex Rivera'], link: '→ 客户:北京协和 · → Pipeline:增长' },
                      { q: '2024 Q4', d: '2024-12-15', goal: '年营收达标冲刺', prog: '完成率105%', key: '超额完成年度目标，签署3个新客户', att: ['任志刚', 'Alex Rivera'], link: '→ 等级:晋升白金 · → 生态:开始协作' },
                    ].map((qr, i) => (
                      <div key={i} className={cn('flex gap-4 py-4', i > 0 && 'border-t border-neutral-100 dark:border-neutral-800')}>
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', i === 0 ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-100 dark:bg-neutral-800')}><Calendar className={cn('w-5 h-5', i === 0 ? 'text-white dark:text-neutral-900' : 'text-neutral-500')} /></div>
                        <div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-sm font-semibold">{qr.q}</span><span className="text-xs text-neutral-400">{qr.d}</span><Badge variant={qr.prog.includes('进行中') ? 'info' : 'success'} size="sm">{qr.prog}</Badge></div><div className="grid grid-cols-2 gap-2 text-sm"><div className="p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded"><span className="text-xs text-neutral-500">目标</span><p className="font-medium">{qr.goal}</p></div><div className="p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded"><span className="text-xs text-neutral-500">关键成果</span><p className="font-medium text-xs">{qr.key}</p></div></div><p className="text-xs text-neutral-400 mt-1">参会: {qr.att.join('、')}</p><p className="text-[10px] text-blue-500 mt-1">{qr.link}</p></div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { n: '2025年度联合营销计划', t: '联合营销', d: '围绕金融行业数字化转型', s: '2025-01-01', e: '2025-12-31', st: 'Active', rev: 500, act: 320, ref: '→ Q1QBR:新行业拓展 · → MDF使用' },
                    { n: '云原生技术赋能计划', t: '技术赋能', d: '云原生技术培训及认证', s: '2025-03-15', e: '2025-09-15', st: 'Active', rev: 200, act: 85, ref: '→ Q2QBR:能力升级 · → 认证:24人' },
                  ].map((pl, i) => (
                    <Card key={i} hover><div className="space-y-2"><div className="flex justify-between"><h4 className="text-sm font-semibold">{pl.n}</h4><Badge variant={pl.st === 'Active' ? 'success' : 'default'} size="sm">{pl.st === 'Active' ? '进行中' : '已完成'}</Badge></div><p className="text-xs text-neutral-500">{pl.d}</p><div className="flex gap-3 text-xs text-neutral-400"><span>{pl.s} ~ {pl.e}</span><Badge variant="info" size="sm">{pl.t}</Badge></div><div className="flex justify-between text-xs pt-2 border-t border-neutral-100 dark:border-neutral-800"><span>目标 ¥{pl.rev}万</span><span className="text-emerald-600 font-medium">实际 ¥{pl.act}万</span></div><p className="text-[10px] text-blue-500">{pl.ref}</p></div></Card>
                  ))}
                </div>
                <Card>
                  <CardHeader><CardTitle>近期动态</CardTitle></CardHeader>
                  <CardContent>
                    {(activities.length > 0 ? activities.slice(0, 4) : [
                      { title: 'Q1季度业务回顾', description: '回顾Q4业绩制定Q1目标', date: '2025-01-15', ref: '→ Q1QBR' },
                      { title: '云原生技术培训', description: '5名工程师通过认证', date: '2025-02-20', ref: '→ 认证:24人 · → 技术部' },
                      { title: '金融行业客户沙龙', description: '获取15条有效商机线索', date: '2025-03-10', ref: '→ Pipeline:增长 · → MDF活动' },
                      { title: '银行数据平台项目签约', description: '签约金额450万', date: '2025-04-05', ref: '→ 赢单 · → 客户:在服' },
                    ] as any[]).map((act: any, i: number) => (
                      <div key={i} className={cn('flex gap-3 py-3', i > 0 && 'border-t border-neutral-100 dark:border-neutral-800')}>
                        <CheckCircle2 className={cn('w-4 h-4 mt-0.5 shrink-0', i === 0 ? 'text-neutral-900 dark:text-white' : 'text-neutral-400')} />
                        <div><p className="text-sm font-medium">{act.title}</p><p className="text-xs text-neutral-500 mt-0.5">{act.description}</p><p className="text-[11px] text-neutral-400 mt-1">{act.date} · <span className="text-blue-500">{act.ref}</span></p></div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          LAYER 2: 透视面
          ═══════════════════════════════════════════════════ */}
      {layer === 'insight' && (
        <div className="space-y-4">
          <Tabs tabs={[
            { id: 'capability', label: '能力画像' }, { id: 'lifecycle', label: '生命周期' }, { id: 'ecosystem', label: '生态客户' },
          ]} activeTab={insightTab} onChange={setInsightTab} />
          <div className="pt-2">
            {insightTab === 'capability' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[{ l: '综合', s: scores.overall }, { l: '活跃度', s: scores.activity }, { l: '能力值', s: scores.capability }, { l: 'Pipeline', s: scores.ph }, { l: '忠诚度', s: scores.loyalty }].map((d) => {
                    const color = d.s >= 80 ? '#059669' : d.s >= 60 ? '#d97706' : '#dc2626';
                    return <Card key={d.l}><div className="flex flex-col items-center"><svg width="48" height="48" className="-rotate-90"><circle cx="24" cy="24" r="20" fill="none" stroke="#e4e4e7" strokeWidth="4" /><circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="4" strokeDasharray={`${(Math.max(1, d.s) / 100) * 126} 126`} strokeLinecap="round" /><text x="24" y="25" textAnchor="middle" fontSize="10" fontWeight={700} fill="currentColor" className="dark:fill-white" transform="rotate(90 24 24)">{Math.max(1, d.s)}</text></svg><span className="text-[10px] text-neutral-500 mt-1">{d.l}</span></div></Card>;
                  })}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle>能力维度诊断</CardTitle><span className="text-xs text-neutral-400">↳ 每项能力直接影响商机转化和赢单率</span></CardHeader>
                    <CardContent>
                      {[
                        { dim: '云原生能力', score: en.certifiedEngineers > 10 ? 85 : en.certifiedEngineers * 8, detail: `${en.certifiedEngineers}名认证`, impact: '→ 方案转化率60% · 独家客户3家' },
                        { dim: 'AI/ML能力', score: en.specialists > 5 ? 60 : en.specialists * 10, detail: `${en.specialists}名高级专家`, impact: '→ 瑞金医院丢标 · 需补AI能力' },
                        { dim: '安全合规', score: (partner.winRate || 0) > 60 ? 70 : (partner.winRate || 0), detail: `赢单率${partner.winRate}%`, impact: '→ 金融行业准入受限 · 需提升' },
                        { dim: '数据平台', score: pip.registered > 5000000 ? 75 : 45, detail: `Pipeline ${formatCurrency(pip.registered, currency)}`, impact: '→ 政务客户2家 · 可交叉销售' },
                        { dim: '服务交付', score: (partner.years || 0) > 5 ? 80 : (partner.years || 0) * 10, detail: `${partner.years}年经验`, impact: '→ 5家在服客户 · 续约率高' },
                      ].map((c) => (
                        <div key={c.dim} className="mb-3"><div className="flex items-center justify-between mb-1 text-sm"><span className="font-medium">{c.dim}</span><span className={cn('font-semibold', c.score >= 70 ? 'text-emerald-600' : c.score >= 40 ? 'text-amber-600' : 'text-red-500')}>{c.score}分</span></div><ProgressBar value={c.score} size="sm" variant={c.score >= 70 ? 'success' : c.score >= 40 ? 'warning' : 'danger'} /><p className="text-[10px] text-neutral-400 mt-0.5">{c.detail}</p><p className="text-[10px] text-blue-500 mt-0.5">{c.impact}</p></div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>隐藏优势识别</CardTitle><Badge variant="info" size="sm"><Eye className="w-3 h-3" /> 深度挖掘</Badge></CardHeader>
                    <CardContent>
                      {[
                        { t: '长期合作信任壁垒', d: `${partner.years || 0}年合作+${partner.winRate || 0}%赢单率形成竞争护城河，新进入者难以替代`, link: '→ 3家独家客户 · → 忠诚度评分高' },
                        { t: '技术人才储备优势', d: `${en.specialists || 0}名高级专家+${en.certifiedEngineers || 0}名认证工程师，方案交付能力强于同级伙伴`, link: '→ 赢单率68% · → 技术部组织完备' },
                        { t: '生态枢纽地位', d: `作为${TIER_LABELS[partner.tier] || partner.tier}伙伴，连接SI/ISV/Reseller三种角色`, link: '→ 3个协作关系 · → 结构洞位置' },
                        { t: '行业纵深壁垒', d: `在${partner.industry || '核心'}行业有深入积累，客户关系牢靠转换成本高`, link: '→ 5个医疗客户 · → 独家份额高' },
                      ].map((s: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800 mb-3">
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">{s.t}</p><p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{s.d}</p><p className="text-[10px] text-blue-500 mt-1">{s.link}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {insightTab === 'lifecycle' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle>生命周期轨迹</CardTitle><span className="text-xs text-neutral-400">↳ 每阶段对应: 等级 · 客户 · 能力 · 生态</span></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[{ s: '招募', y: '2018', m: '0客户 · 0认证 · 注册' }, { s: '成长', y: '2019', m: '首客户 · 首批认证 · 注册' }, { s: '扩张', y: '2020', m: '客户+2 · 等级→银→金' }, { s: '成熟', y: '2022', m: '5客户 · 认证团队 · 金牌' }, { s: '战略', y: '2024', m: '白金 · 生态协作启动' }, { s: '引领', y: '2025', m: '3生态·8专家·¥14.2M' }].map((st, i, arr) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0', i < arr.length - 1 ? 'bg-emerald-500 text-white' : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 ring-4 ring-blue-100')}>{i < arr.length - 1 ? <CheckCircle2 className="w-3 h-3" /> : i + 1}</div>
                            <span className="text-sm font-medium w-10">{st.s}</span><span className="text-xs text-neutral-400 w-8">{st.y}</span><span className="text-[10px] text-neutral-500 flex-1">{st.m}</span>
                            {i < arr.length - 1 && <div className="w-0.5 h-5 bg-emerald-500 ml-3" />}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>等级变迁</CardTitle></CardHeader>
                    <CardContent>
                      {[{ f: '注册', t: '银牌', d: '2019 Q2', r: '完成首年业绩目标' }, { f: '银牌', t: '金牌', d: '2020 Q4', r: '年营收突破¥300万' }, { f: '金牌', t: '白金', d: '2024 Q1', r: '连续4季度超额+行业标杆' }].map((m, i) => (
                        <div key={i} className={cn('flex items-center gap-3 py-3', i > 0 && 'border-t border-neutral-100 dark:border-neutral-800')}>
                          <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div><span className="text-sm"><Badge variant="default" size="sm">{m.f}</Badge> <ChevronRight className="w-3 h-3 inline text-neutral-400" /> <Badge variant="primary" size="sm">{m.t}</Badge> <span className="text-xs text-neutral-400 ml-1">{m.d}</span></span><p className="text-xs text-neutral-500 mt-0.5">{m.r}</p></div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader><CardTitle>组织架构 · 人员能力图谱</CardTitle><span className="text-xs text-neutral-400">↳ 每个人关联: 负责客户 · 参与项目 · 认证状态 · QBR角色</span></CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center text-sm">
                      <div className="px-5 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-center ring-4 ring-blue-100"><p className="font-semibold">任志刚 · 总经理</p><p className="text-[10px] opacity-60">QBR决策 · JBP签署 · 战略方向</p></div>
                      <div className="w-px h-3 bg-neutral-300" />
                      <div className="flex gap-6">
                        {[
                          { r: '销售总监', n: '何妮', dept: '销售部', note: '管理2名销售 · QBR参会 · 驱动Pipeline ¥14.2M' },
                          { r: '技术总监', n: '吴忠奎', dept: '技术部', note: '24人认证团队 · 方案交付 · 云原生+AI能力建设' },
                          { r: '商务经理', n: '高辉', dept: '商务部', note: 'MDF申请 · 合同管理 · 合作方案执行' },
                        ].map((p) => (
                          <div key={p.r} className="flex flex-col items-center">
                            <div className="w-px h-3 bg-neutral-300" />
                            <div className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center"><p className="font-medium text-xs">{p.r}</p><p className="text-[10px] text-neutral-500">{p.n} · {p.dept}</p></div>
                            <p className="text-[9px] text-neutral-400 mt-1 text-center max-w-[120px]">{p.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {insightTab === 'ecosystem' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>客户组合分析</CardTitle><span className="text-xs text-neutral-400">↳ 关联: Pipeline项目 · 产品能力 · 竞品威胁</span></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-neutral-200 dark:border-neutral-800"><th className="text-left py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">客户</th><th className="text-left py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">行业</th><th className="text-left py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">产品</th><th className="text-center py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">份额</th><th className="text-left py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">竞品</th><th className="text-right py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">合同额</th><th className="text-center py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">状态</th></tr></thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {[
                        { n: '浙江省立医院', i: '医疗', p: '云原生平台', s: 100, c: '-', v: 4500000, st: '在服', ref: '→ Pipeline:赢单 · → 云原生能力' },
                        { n: '苏州市卫健委', i: '政务', p: '大数据平台', s: 70, c: '华为云', v: 2800000, st: 'POC', ref: '→ Pipeline:方案阶段 · → 数据能力' },
                        { n: '上海瑞金医院', i: '医疗', p: 'AI 智算平台', s: 0, c: 'AWS', v: 3200000, st: '丢标', ref: '⚠ AI能力不足 · → 需补AI短板' },
                        { n: '北京协和医院', i: '医疗', p: '混合云方案', s: 50, c: '阿里云', v: 6000000, st: '商务', ref: '→ Pipeline:商务 · 竞品压力 · → 安全能力' },
                      ].map((c, i) => (
                        <tr key={i}><td className="py-2.5 px-3 font-medium">{c.n}<p className="text-[10px] text-blue-500">{c.ref}</p></td><td className="py-2.5 px-3 text-neutral-500">{c.i}</td><td className="py-2.5 px-3">{c.p}</td><td className="py-2.5 px-3 text-center">{c.s === 0 ? <Badge variant="danger" size="sm">丢标</Badge> : c.s < 100 ? <div className="flex items-center gap-1"><ProgressBar value={c.s} size="sm" className="w-10" /><span className="text-[10px]">{c.s}%</span></div> : <Badge variant="success" size="sm">独家</Badge>}</td><td className="py-2.5 px-3">{c.c === '-' ? <span className="text-xs text-neutral-400">-</span> : <span className="text-xs font-medium text-amber-600">{c.c}</span>}</td><td className="py-2.5 px-3 text-right font-medium">{formatCurrency(c.v, currency)}</td><td className="py-2.5 px-3 text-center"><Badge variant={c.st === '在服' ? 'success' : c.st === 'POC' ? 'info' : c.st === '商务' ? 'warning' : 'danger'} size="sm">{c.st}</Badge></td></tr>
                      ))}
                    </tbody></table></div>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle>生态协作网络</CardTitle><span className="text-xs text-neutral-400">↳ 结构洞位置: 连接SI/ISV/Reseller</span></CardHeader>
                    <CardContent>
                      {[{ n: '昆仑联通', t: 'SI', r: '联合打单', v: 4500000, d: 5, ref: '→ 客户:新增 · → Pipeline:增长' }, { n: '精诚中国', t: 'Reseller', r: '分销代理', v: 2800000, d: 12, ref: '→ 渠道覆盖 · → 交易成本↓' }, { n: '上海智医', t: 'ISV', r: '方案互补', v: 1200000, d: 3, ref: '→ 补AI短板 · → 联合方案' }].map((ep, i) => (
                        <div key={i} className={cn('py-3', i > 0 && 'border-t border-neutral-100 dark:border-neutral-800')}>
                          <div className="flex items-center justify-between"><span className="font-medium">{ep.n}<span className="text-xs text-neutral-400 ml-2">{ep.t}·{ep.r}</span></span><Badge variant="primary" size="sm">{formatCurrency(ep.v, currency)}</Badge></div>
                          <p className="text-xs text-neutral-500 mt-1">{ep.d}个联合项目</p><p className="text-[10px] text-blue-500 mt-0.5">{ep.ref}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>子合作伙伴</CardTitle></CardHeader>
                    <CardContent>
                      {[{ n: '南京云帆科技有限公司', t: 'SI', c: '周伟', ph: '13812345678', st: 'Active', ref: '→ 区域交付延伸 · 华东二线城市' }, { n: '杭州智联信息技术有限公司', t: 'ISV', c: '林芳', ph: '13987654321', st: 'Active', ref: '→ AI能力补全 · 算法模型' }].map((sp, i) => (
                        <div key={i} className={cn('py-3', i > 0 && 'border-t border-neutral-100 dark:border-neutral-800')}>
                          <div className="flex items-center justify-between"><span className="font-medium">{sp.n}</span><Badge variant={sp.st === 'Active' ? 'success' : 'warning'} size="sm">{sp.st === 'Active' ? '活跃' : '非活跃'}</Badge></div>
                          <p className="text-xs text-neutral-400 mt-0.5">{sp.t} · {sp.c} · {sp.ph}</p><p className="text-[10px] text-blue-500 mt-0.5">{sp.ref}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          LAYER 3: 决策面
          ═══════════════════════════════════════════════════ */}
      {layer === 'intelligence' && (
        <div className="space-y-4">
          <Tabs tabs={[
            { id: 'breakthrough', label: '突破机会' }, { id: 'predict', label: '风险预测' }, { id: 'strategy', label: '战略建议' },
          ]} activeTab={intelTab} onChange={setIntelTab} />
          <div className="pt-2">
            {intelTab === 'breakthrough' && (
              <Card>
                <CardHeader><CardTitle>合作突破口</CardTitle><Badge variant="info" size="sm"><Brain className="w-3 h-3" /> AI交叉分析</Badge></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {breakthroughs.map((b, i) => (
                      <div key={i} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0"><Crosshair className="w-4 h-4 text-white" /></div>
                          <div className="flex-1"><p className="text-sm font-semibold text-blue-900 dark:text-blue-200">{b.t}</p><p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{b.c}</p>
                            <div className="flex items-center gap-3 mt-2"><span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ROI: {b.roi}</span><span className="text-[11px] text-blue-600">→ {b.a}</span></div>
                            <p className="text-[10px] text-purple-500 mt-2">{b.links}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {intelTab === 'predict' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { t: 'Q3业绩预测', c: `基于${partner.winRate || 0}%赢单率和当前Pipeline ¥${(pip.registered / 10000).toFixed(0)}万，预计Q3营收 ${formatCurrency(pip.registered * 0.4, currency)}`, i: TrendingUp, col: 'border-blue-200 dark:border-blue-800 bg-blue-50/30', ref: '输入: Pipeline漏斗 · 赢单率 · 转化周期' },
                  { t: '流失风险评估', c: scores.churnLevel === '高' ? `风险较高(${scores.churnRisk}分): 非合作状态+认证过期+Pipeline不足` : scores.churnLevel === '中' ? `中等风险(${scores.churnRisk}分): 认证过期+Pipeline偏低` : `低风险(${scores.churnRisk}分): 合作稳定Pipeline充裕`, i: AlertTriangle, col: scores.churnLevel === '高' ? 'border-red-200 bg-red-50/30' : 'border-amber-200 bg-amber-50/30', ref: '输入: 合作状态 · 认证状态 · Pipeline · 赢单率' },
                  { t: '交叉销售机会', c: `基于${partner.industry || '核心'}行业优势 + 客户组合分析，推荐拓展AI智算(份额0%)和安全合规(45分)产品线，预计增收15-20%`, i: Rocket, col: 'border-purple-200 bg-purple-50/30', ref: '输入: 能力画像 · 客户份额 · 竞品分析' },
                ].map((p, i) => (
                  <Card key={i} className={p.col}><div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center shrink-0"><p.i className="w-4 h-4" /></div><div><p className="text-sm font-semibold">{p.t}</p><p className="text-xs mt-1 opacity-80">{p.c}</p><p className="text-[10px] text-purple-500 mt-2">{p.ref}</p></div></div></Card>
                ))}
              </div>
            )}

            {intelTab === 'strategy' && (
              <Card>
                <CardHeader><CardTitle>战略行动建议</CardTitle><Badge variant="warning" size="sm"><Sparkles className="w-3 h-3" /> 综合生成</Badge></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { i: Network, t: '生态杠杆', c: '该伙伴处于结构洞位置(SI-ISV-Reseller连接点)，建议定位为"区域生态协调者"，赋予跨伙伴协作撮合权。预期撬动¥850万增量协作营收。', ref: '证据: 3个协作关系 · 协作客单价2.4x · 5个客户触点' },
                      { i: Shield, t: '风险对冲', c: `医疗行业客户占比${Math.round(4 / 5 * 100)}%，过度集中。建议引导向政务(卫健委)和金融(首个标杆)多元化，将行业集中度降至50%以内。`, ref: '证据: 5客户中4个医疗 · 竞品AWS/阿里云压力 · Q1QBR提出金融拓展' },
                      { i: Lightbulb, t: '能力变现', c: '技术团队有8名高级专家+24名认证工程师储备，联合ISV伙伴(上海智医)打造AI医疗方案作为标杆案例，在行业峰会发布后规模化复制。', ref: '证据: 能力画像AI=25分 · 瑞金丢标 · 上海智医协作·Q2能力升级进行中' },
                      { i: Compass, t: '战略路径', c: 'Q3完成认证续期(紧急)→Q4推出AI联合方案(能力变现)→明年Q1进入金融行业(风险对冲)，形成"守住医疗+拓展金融"双轮驱动', ref: '基于: 生命周期战略期 · 等级白金 · QBR节奏 · 能力缺口分析' },
                    ].map((r, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center shrink-0"><r.i className="w-5 h-5 text-amber-600" /></div>
                        <div className="flex-1"><p className="text-sm font-semibold text-neutral-900 dark:text-white">{r.t}: {r.c}</p><p className="text-[10px] text-purple-500 mt-1">{r.ref}</p></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
