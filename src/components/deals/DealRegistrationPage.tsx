import { useState, useMemo } from 'react';
import {
  FileText, Plus, Search, Filter, ChevronRight, CheckCircle2, Clock,
  XCircle, AlertCircle, Calendar, User, MapPin, MoreHorizontal,
  ArrowRight, Zap, TrendingUp, DollarSign, Target, BarChart3,
  Layers, ArrowUpRight, ArrowDownRight, Download, ExternalLink,
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { Deal, DealRegistrationStats, DealStatus } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useConfig } from '../../contexts/ConfigContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface DealRegistrationPageProps {
  stats: DealRegistrationStats;
  deals: Deal[];
  onNewDeal: () => void;
  onDealUpdate?: (updatedDeal: Deal) => void;
}

const getStatusConfig = (t: (k: string) => string): Record<DealStatus, { label: string; variant: 'info' | 'success' | 'danger' | 'warning' | 'default' }> => ({
  Pending:     { label: t('deals.statusPending'), variant: 'info' },
  Approved:    { label: t('deals.statusApproved'), variant: 'success' },
  Rejected:    { label: t('deals.statusRejected'), variant: 'danger' },
  Converted:   { label: t('deals.statusConverted'), variant: 'warning' },
  'Closed Won':  { label: t('deals.statusClosedWon'), variant: 'success' },
  'Closed Lost': { label: t('deals.statusClosedLost'), variant: 'default' },
});

const STATUS_ICON: Record<DealStatus, typeof Clock> = {
  Pending: Clock, Approved: CheckCircle2, Rejected: XCircle,
  Converted: Zap, 'Closed Won': CheckCircle2, 'Closed Lost': XCircle,
};

export const DealRegistrationPage = ({ stats, deals, onNewDeal, onDealUpdate }: DealRegistrationPageProps) => {
  const { t } = useLanguage();
  const { config } = useConfig();
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [filters, setFilters] = useState({ region: 'All', status: 'All', productType: 'All', partnerType: 'All' });

  const filteredDeals = useMemo(() => deals.filter((deal) => {
    const s = searchQuery.toLowerCase();
    const matchesSearch = !s || deal.title.toLowerCase().includes(s) || deal.customer.toLowerCase().includes(s) || deal.partnerName.toLowerCase().includes(s);
    const matchesTab = activeTab === 'all' || deal.status === 'Pending';
    const matchesRegion = filters.region === 'All' || deal.region === filters.region;
    const matchesStatus = filters.status === 'All' || deal.status === filters.status;
    const matchesProduct = filters.productType === 'All' || deal.productType === filters.productType;
    const matchesPartnerType = filters.partnerType === 'All' || deal.partnerType === filters.partnerType;
    return matchesSearch && matchesTab && matchesRegion && matchesStatus && matchesProduct && matchesPartnerType;
  }), [deals, searchQuery, activeTab, filters]);

  // Pipeline funnel from stats
  const totalDeals = stats.yearNew;
  const approvalRate = totalDeals > 0 ? Math.round(((totalDeals - stats.rejected) / totalDeals) * 100) : 0;
  const closeRate = totalDeals > 0 ? Math.round((stats.closed / totalDeals) * 100) : 0;
  const pipelineValue = deals.reduce((s, d) => s + d.value, 0);
  const STATUS_CONFIG = getStatusConfig(t);

  const filterOptions = [
    { label: t('deals.filterRegion'), field: 'region' as const, options: ['All', ...config.regions] },
    { label: t('deals.filterProduct'), field: 'productType' as const, options: ['All', '云原生平台', '大数据平台', 'AI 智算平台'] },
    { label: t('deals.filterPartnerType'), field: 'partnerType' as const, options: ['All', 'ISV', 'VAR', 'SI', 'VAD', 'OEM', 'Reseller'] },
  ];

  return (
    <div className="space-y-6">
      {/* Header + KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">{t('deals.title')}</h1>
          <p className="text-sm text-neutral-500 mt-1">{t('deals.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> 导出</Button>
          <Button variant="brand" size="sm" onClick={onNewDeal}><Plus className="w-4 h-4" /> {t('deals.add')}</Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: t('deals.yearNew'), value: stats.yearNew, icon: Calendar, color: 'text-neutral-700' },
          { label: t('deals.quarterNew'), value: stats.quarterNew, icon: TrendingUp, color: 'text-blue-600' },
          { label: t('deals.monthNew'), value: stats.monthNew, icon: Clock, color: 'text-blue-500' },
          { label: t('deals.weekNew'), value: stats.weekNew, icon: Plus, color: 'text-emerald-600' },
          { label: t('deals.rejected'), value: stats.rejected, icon: XCircle, color: 'text-red-500' },
          { label: t('deals.closed'), value: stats.closed, icon: CheckCircle2, color: 'text-emerald-500' },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <s.icon className={s.color} />
              </div>
              <div>
                <p className="text-xs text-neutral-500">{s.label}</p>
                <p className="text-xl font-semibold text-neutral-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pipeline Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: t('deals.pipelineTotal'), value: formatCurrency(pipelineValue), sub: `${deals.length}个商机`, icon: DollarSign, color: 'text-neutral-700' },
          { label: t('deals.approvalRate'), value: `${approvalRate}%`, sub: `${totalDeals - stats.rejected}/${totalDeals} 通过`, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: t('deals.closeRate'), value: `${closeRate}%`, sub: `${stats.closed}个已结单`, icon: Target, color: 'text-blue-600' },
          { label: t('deals.pendingCount'), value: stats.yearNew - stats.rejected - stats.closed, sub: '需处理', icon: Clock, color: stats.yearNew - stats.rejected - stats.closed > 5 ? 'text-amber-600' : 'text-neutral-500' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0"><kpi.icon className={kpi.color} /></div>
              <div><p className="text-xs text-neutral-500">{kpi.label}</p><p className="text-lg font-semibold text-neutral-900 dark:text-white">{kpi.value}</p><p className="text-[11px] text-neutral-400">{kpi.sub}</p></div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── 报备深度分析 ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Registration Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>报备来源分布</CardTitle>
            <span className="text-xs text-neutral-400">
              {deals.length}个报备 · {new Set(deals.map(d => d.partnerId)).size}家渠道
            </span>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {/* By Partner Type */}
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-2">按伙伴类型</p>
                {(() => {
                  const byType: Record<string, { count: number; value: number }> = {};
                  deals.forEach(d => {
                    if (!byType[d.partnerType]) byType[d.partnerType] = { count: 0, value: 0 };
                    byType[d.partnerType].count++;
                    byType[d.partnerType].value += d.value;
                  });
                  const maxCount = Math.max(...Object.values(byType).map(v => v.count));
                  const typeLabels: Record<string, string> = { ISV: '方案商', VAR: '增值分销', SI: '系统集成商', VAD: '总分销', Reseller: '转售商', OEM: 'OEM' };
                  return Object.entries(byType).map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400 w-20">{typeLabels[type] || type}</span>
                      <div className="flex-1 mx-3 h-5 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden">
                        <div className="h-full bg-neutral-700 dark:bg-neutral-400 rounded flex items-center px-2" style={{ width: `${(data.count / maxCount) * 100}%` }}>
                          <span className="text-[10px] font-semibold text-white">{data.count}个</span>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-400">{formatCurrency(data.value)}</span>
                    </div>
                  ));
                })()}
              </div>

              {/* By Tier */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <p className="text-xs font-medium text-neutral-500 mb-2">按伙伴等级 · 按区域</p>
                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    const byTier: Record<string, number> = {};
                    const byRegion: Record<string, number> = {};
                    deals.forEach(d => {
                      byTier[d.partnerType] = (byTier[d.partnerType] || 0) + 1;
                      byRegion[d.region] = (byRegion[d.region] || 0) + 1;
                    });
                    const total = deals.length;
                    return (
                      <>
                        <div className="space-y-1">
                          {Object.entries(byTier).slice(0, 4).map(([k, v]) => (
                            <div key={k} className="flex justify-between text-xs">
                              <span className="text-neutral-500">{k}</span>
                              <span className="font-medium">{v}<span className="text-neutral-400 ml-1">({Math.round(v/total*100)}%)</span></span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1">
                          {Object.entries(byRegion).slice(0, 4).map(([k, v]) => (
                            <div key={k} className="flex justify-between text-xs">
                              <span className="text-neutral-500">{k}</span>
                              <span className="font-medium">{v}<span className="text-neutral-400 ml-1">({Math.round(v/total*100)}%)</span></span>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* By Product */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <p className="text-xs font-medium text-neutral-500 mb-2">按产品/方案</p>
                {(() => {
                  const byProduct: Record<string, number> = {};
                  deals.forEach(d => { byProduct[d.productType] = (byProduct[d.productType] || 0) + 1; });
                  const max = Math.max(...Object.values(byProduct));
                  return Object.entries(byProduct).map(([p, c]) => (
                    <div key={p} className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate flex-1">{p}</span>
                      <div className="w-24 h-5 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden mx-3">
                        <div className="h-full bg-blue-500 rounded flex items-center justify-center" style={{ width: `${(c/max)*100}%` }}>
                          <span className="text-[10px] font-semibold text-white">{c}个</span>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Center: Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>报备→结单 转化漏斗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const stages = [
                  { label: '报备', key: 'Registered', count: deals.length, pct: 100 },
                  { label: '批复通过', key: 'Approved', count: deals.filter(d => ['Approved','Converted','Closed Won'].includes(d.status)).length, pct: 0 },
                  { label: '转化商机', key: 'Converted', count: deals.filter(d => ['Converted','Closed Won'].includes(d.status)).length, pct: 0 },
                  { label: '赢单', key: 'Closed Won', count: deals.filter(d => d.status === 'Closed Won').length, pct: 0 },
                ];
                stages.forEach((s, i) => {
                  if (i > 0) s.pct = stages[i-1].count > 0 ? Math.round((s.count / stages[i-1].count) * 100) : 0;
                });
                const maxCount = Math.max(...stages.map(s => s.count), 1);
                const colors = ['bg-neutral-900 dark:bg-white', 'bg-neutral-600', 'bg-neutral-400', 'bg-emerald-500'];
                return stages.map((s, i) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{s.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{s.count}</span>
                        {i > 0 && (
                          <span className={cn('text-xs font-medium', s.pct >= 60 ? 'text-emerald-600' : s.pct >= 30 ? 'text-amber-600' : 'text-red-500')}>
                            {s.pct}% 转化
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                      <div className={cn('h-full rounded-lg flex items-center px-3 transition-all', colors[i])}
                        style={{ width: `${Math.max(15, (s.count / maxCount) * 100)}%` }}>
                        {i > 0 && (
                          <span className="text-[10px] text-white font-medium">
                            流失 {stages[i-1].count - s.count}个 ({100 - s.pct}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
              {/* Source attribution */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <p className="text-xs font-medium text-neutral-500 mb-2">转化来源分析</p>
                <div className="space-y-2">
                  {[
                    { label: '伙伴自主报备', pct: 65, detail: '65%的赢单来自伙伴主动提交的报备', color: 'bg-neutral-700' },
                    { label: '渠道经理指派', pct: 25, detail: '渠道经理主动为伙伴指派的商机', color: 'bg-neutral-400' },
                    { label: 'MDF 活动转化', pct: 10, detail: '通过营销活动获取线索后报备', color: 'bg-neutral-300' },
                  ].map((src) => (
                    <div key={src.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-500">{src.label}</span>
                        <span className="text-xs font-semibold">{src.pct}%</span>
                      </div>
                      <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', src.color)} style={{ width: `${src.pct}%` }} />
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{src.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Cycle Time + Bottleneck */}
        <Card>
          <CardHeader>
            <CardTitle>报备周期分析</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {/* Avg cycle time */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '报备→批复', days: 2.5, target: 3, status: 'good' },
                  { label: '批复→转化', days: 18, target: 15, status: 'warn' },
                  { label: '转化→赢单', days: 45, target: 30, status: 'slow' },
                  { label: '全周期', days: 65.5, target: 48, status: 'slow' },
                ].map((c) => (
                  <div key={c.label} className={cn('p-3 rounded-lg border text-center',
                    c.status === 'good' ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10' :
                    c.status === 'warn' ? 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10' :
                    'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10')}>
                    <p className="text-xs text-neutral-500">{c.label}</p>
                    <p className={cn('text-xl font-semibold', c.status === 'good' ? 'text-emerald-600' : c.status === 'warn' ? 'text-amber-600' : 'text-red-500')}>{c.days}天</p>
                    <p className="text-[10px] text-neutral-400">目标 {c.target}天</p>
                  </div>
                ))}
              </div>

              {/* Bottleneck identification */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">瓶颈识别</p>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-semibold text-red-700 dark:text-red-400">转化→赢单 环节耗时过长</span>
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">
                      当前45天，超出目标50%。主要瓶颈在于POC测试环节——伙伴方案能力参差不齐导致测试周期被拉长。建议：对Pipeline金额超过¥200万的项目强制原厂售前介入。
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">批复→转化 环节波动大</span>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-300 leading-relaxed">
                      ISV类型伙伴平均18天，但SI类型仅需12天。差异来源于方案成熟度——ISV需要更多的方案适配时间。建议建立行业方案模板库加速ISV转化。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card padding={false}>
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
              <button onClick={() => setActiveTab('all')}
                className={cn('px-4 py-1.5 rounded-md text-xs font-medium transition-all', activeTab === 'all' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500')}>
                {t('deals.allTab')} ({deals.length})
              </button>
              <button onClick={() => setActiveTab('pending')}
                className={cn('px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2', activeTab === 'pending' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500')}>
                {t('deals.pendingTab')} ({deals.filter((d) => d.status === 'Pending').length})
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input type="text" placeholder={t('deals.search')} value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 h-9 pl-9 pr-3 bg-neutral-100 dark:bg-neutral-800 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 dark:text-white placeholder:text-neutral-400" />
            </div>
            <Button variant="brand" size="sm" onClick={onNewDeal}><Plus className="w-4 h-4" /> {t('deals.add')}</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-6 bg-neutral-50/50 dark:bg-neutral-800/30">
          {filterOptions.map((f) => (
            <div key={f.field} className="flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-400">{f.label}:</span>
              <select className="bg-transparent text-xs font-medium text-neutral-600 dark:text-neutral-300 focus:outline-none cursor-pointer"
                value={filters[f.field]} onChange={(e) => setFilters({ ...filters, [f.field]: e.target.value })}>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <span className="ml-auto text-xs text-neutral-400">{filteredDeals.length} 个结果</span>
        </div>

        {/* Table */}
        {filteredDeals.length === 0 ? (
          <div className="py-16"><EmptyState title="没有找到商机" description="尝试调整搜索条件或筛选器" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('deals.colProject')}</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('deals.colPartner')}</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">销售</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">金额 / 周期</th>
                  <th className="px-6 py-3.5 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3.5 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">优先级</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredDeals.map((deal) => {
                  const sCfg = STATUS_CONFIG[deal.status];
                  const SIcon = STATUS_ICON[deal.status];
                  return (
                    <tr key={deal.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedDeal(deal)}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-brand transition-colors">{deal.title}</p>
                            {deal.hasConflict && <Badge variant="danger" size="sm">冲突</Badge>}
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5"><User className="w-3 h-3" /> {deal.customer}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{deal.partnerName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="default" size="sm">{deal.partnerType}</Badge>
                            <span className="text-xs text-neutral-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {deal.region}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{deal.salesName}</p>
                        <p className="text-xs text-neutral-400">{deal.salesTeam}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{formatCurrency(deal.value)}</p>
                        <p className="text-xs text-neutral-400 flex items-center justify-end gap-1.5 mt-0.5"><Calendar className="w-3 h-3" /> {deal.createdDate} ~ {deal.endDate}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={sCfg?.variant || 'default'} size="sm">{sCfg?.label || deal.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {deal.isPriority ? <Badge variant="warning" size="sm">优先</Badge> : <span className="text-xs text-neutral-400">-</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedDeal(deal); }}
                          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-brand transition-colors opacity-0 group-hover:opacity-100">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Detail Modal ──────────────────────────── */}
      <Modal open={!!selectedDeal} onClose={() => setSelectedDeal(null)} size="xl" title={selectedDeal?.title}>
        {selectedDeal && (
          <div className="space-y-6">
            {/* Deal header info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: '最终客户', value: selectedDeal.customer, icon: User },
                { label: '预估金额', value: formatCurrency(selectedDeal.value), icon: DollarSign },
                { label: t('deals.colPartner'), value: `${selectedDeal.partnerName} (${selectedDeal.partnerType})`, icon: FileText },
                { label: '产品类型', value: selectedDeal.productType, icon: Target },
              ].map((f) => (
                <div key={f.label} className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                  <p className="text-xs text-neutral-500 flex items-center gap-1.5"><f.icon className="w-3.5 h-3.5" /> {f.label}</p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">{f.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lifecycle Timeline */}
              <div className="lg:col-span-2">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> 生命周期
                </h4>
                <div className="relative before:absolute before:left-5 before:top-0 before:bottom-0 before:w-px before:bg-neutral-200 dark:before:bg-neutral-800">
                  {selectedDeal.lifecycle.map((event, idx) => (
                    <div key={idx} className="relative pl-12 pb-5 last:pb-0">
                      <div className={cn('absolute left-0 w-10 h-10 rounded-xl flex items-center justify-center z-10 border-2',
                        idx === 0 ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700')}>
                        <CheckCircle2 className={cn('w-4 h-4', idx === 0 ? 'text-white dark:text-neutral-900' : 'text-neutral-400')} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-neutral-900 dark:text-white">{event.stage}</span>
                          <span className="text-xs text-neutral-400">{event.date}</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">{event.description} · {event.actor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions + Conflict */}
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <h5 className="text-xs font-semibold text-neutral-500 uppercase mb-3">管理操作</h5>
                  {selectedDeal.status === 'Pending' && (
                    <div className="space-y-2">
                      <Button variant="brand" size="sm" className="w-full"
                        onClick={() => onDealUpdate?.({ ...selectedDeal, status: 'Approved', lifecycle: [...selectedDeal.lifecycle, { stage: 'Approved', date: new Date().toISOString().split('T')[0], description: '渠道经理审批通过', actor: 'Alex Rivera' }] })}>
                        <CheckCircle2 className="w-4 h-4" /> 批复通过
                      </Button>
                      <Button variant="danger" size="sm" className="w-full"
                        onClick={() => onDealUpdate?.({ ...selectedDeal, status: 'Rejected', lifecycle: [...selectedDeal.lifecycle, { stage: 'Rejected', date: new Date().toISOString().split('T')[0], description: '渠道经理拒绝报备', actor: 'Alex Rivera' }] })}>
                        <XCircle className="w-4 h-4" /> 拒绝报备
                      </Button>
                    </div>
                  )}
                  {selectedDeal.status === 'Approved' && (
                    <Button variant="brand" size="sm" className="w-full"
                      onClick={() => onDealUpdate?.({ ...selectedDeal, status: 'Converted', lifecycle: [...selectedDeal.lifecycle, { stage: 'Converted', date: new Date().toISOString().split('T')[0], description: '转换为正式商机', actor: 'Alex Rivera' }] })}>
                      <ArrowRight className="w-4 h-4" /> 转化为商机
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" className="w-full mt-2">修改报备信息</Button>
                </div>

                <div className={cn('p-4 rounded-xl border', selectedDeal.hasConflict ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700')}>
                  <div className="flex gap-2">
                    <AlertCircle className={cn('w-4 h-4 shrink-0', selectedDeal.hasConflict ? 'text-red-500' : 'text-neutral-400')} />
                    <p className="text-xs leading-relaxed">
                      {selectedDeal.hasConflict ? '检测到该客户已有存量商机报备，请仔细核对报备规则。' : '未检测到存量商机冲突。'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
