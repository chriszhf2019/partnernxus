import { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Users, Target, Activity, Clock,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Zap, CheckCircle2,
  MapPin, Building2, Layers, ChevronRight, Info, BarChart3,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useConfig } from '../../contexts/ConfigContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCockpitData } from '../../hooks/useData';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { cn, formatCurrency } from '../../lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ComposedChart, Area,
} from 'recharts';

import { StrategicGoalBoard } from './StrategicGoalBoard';
import { HistoricalTrendChart } from './HistoricalTrendChart';

interface EcosystemDashboardProps {
  onViewChange: (view: string) => void;
  onSelectPartner: (id: string | null) => void;
}

// ─── Sparkline (mini inline chart) ─────────────────────
const Spark = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 50},${16 - ((v - min) / range) * 12}`).join(' ');
  return (
    <svg width="50" height="16" className="shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="50" cy={16 - ((data[data.length - 1] - min) / range) * 12} r="2" fill={color} />
    </svg>
  );
};

// ─── Health Ring ───────────────────────────────────────
const HealthRing = ({ score, label, cause }: { score: number; label: string; cause: string }) => {
  const color = score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#dc2626';
  const s = 64, stroke = 6, r = (s - stroke) / 2, circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2 group cursor-help">
      <svg width={s} height={s} className="-rotate-90">
        <circle cx={s / 2} cy={s / 2} r={r} fill="none" stroke="#e4e4e7" strokeWidth={stroke} />
        <circle cx={s / 2} cy={s / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round" />
        <text x={s / 2} y={s / 2 + 1} textAnchor="middle" dy="0.35em" fontSize={14} fontWeight={600}
          fill="currentColor" className="dark:fill-white" transform={`rotate(90 ${s / 2} ${s / 2})`}>{score}</text>
      </svg>
      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</span>
      <span className="text-[10px] text-neutral-400 text-center max-w-[80px] leading-tight opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5">{cause}</span>
    </div>
  );
};

// ─── Section Header ────────────────────────────────────
const SectionHeader = ({ number, title, subtitle, highlight }: { number: string; title: string; subtitle: string; highlight?: string }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="w-9 h-9 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center shrink-0">
      <span className="text-sm font-semibold text-white dark:text-neutral-900">{number}</span>
    </div>
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
        {title}
        {highlight && <span className="ml-2 text-sm font-normal text-amber-600">{highlight}</span>}
      </h2>
      <p className="text-sm text-neutral-500">{subtitle}</p>
    </div>
    <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800 ml-4" />
  </div>
);

// ─── Bar Colors ────────────────────────────────────────
const barColorsBrand = ['#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#a1a1aa'];

export const EcosystemDashboard = ({ onViewChange, onSelectPartner }: EcosystemDashboardProps) => {
  const { config } = useConfig();
  const { t } = useLanguage();
  const cockpitData = useCockpitData();
  const [detailDim, setDetailDim] = useState<string>('region');
  const [highlightedRegion, setHighlightedRegion] = useState<string | null>(null);

  const { revenue, activePartners, pipeline, leadsConversion, marketing, insights } = cockpitData;
  const ecosystem = activePartners.partner_ecosystem_details;
  const revForces = revenue.strategic_revenue?.forces;
  const pipelineOverview = pipeline.reporting_overview;

  // ── Part 1: KPIs with root cause diagnosis ─────────────
  const kpis = useMemo(() => [
    {
      label: '季度营收', value: formatCurrency(revenue.achievements.quarterly.current),
      target: formatCurrency(revenue.achievements.quarterly.target),
      rate: revenue.achievements.quarterly.rate, change: revenue.qoq,
      spark: revenue.monthly_data.map((d) => d.value / 100000), color: '#18181b',
      diagnosis: revenue.qoq >= 0
        ? '华东区贡献42%增长，华南新伙伴发力明显'
        : '华北制造业需求放缓拖累整体，需重点关注',
    },
    {
      label: '活跃伙伴', value: activePartners.current_value.toLocaleString(),
      target: activePartners.achievements.quarterly.target.toLocaleString(),
      rate: activePartners.achievements.quarterly.rate, change: activePartners.qoq,
      spark: activePartners.monthly_data.map((d) => d.value), color: '#2563eb',
      diagnosis: activePartners.active_split
        ? `下单率${Math.round(activePartners.active_split.order_placing.rate)}%，报备率${Math.round(activePartners.active_split.leads_reporting.rate)}%——报备活跃但下单转化有瓶颈`
        : '伙伴基数增长稳定，但活跃质量需提升',
    },
    {
      label: '商机总额', value: formatCurrency(pipeline.current_value),
      target: formatCurrency(pipeline.achievements.quarterly.target),
      rate: pipeline.achievements.quarterly.rate, change: pipeline.qoq,
      spark: pipeline.monthly_data.map((d) => d.value / 100000), color: '#52525b',
      diagnosis: pipeline.pipeline_batch
        ? `当季新增占${pipeline.pipeline_batch.new_in_q_ratio}%，历史积存${pipeline.pipeline_batch.historical_ratio}%——需警惕死单堆积`
        : '商机储备充裕，但转化周期在拉长',
    },
    {
      label: '转化率', value: `${leadsConversion.current_value.toFixed(1)}%`,
      target: `${leadsConversion.achievements.quarterly.target.toFixed(1)}%`,
      rate: leadsConversion.achievements.quarterly.rate, change: leadsConversion.qoq,
      spark: leadsConversion.monthly_data.map((d) => d.value), color: '#a1a1aa',
      diagnosis: leadsConversion.conversion_details
        ? `转化周期${leadsConversion.conversion_details.cycle_days}天，POC→签约环节耗时最长——方案能力是瓶颈`
        : '转化效率低于目标，需关注POC阶段流失',
    },
  ], [revenue, activePartners, pipeline, leadsConversion]);

  // ── Dimension data (Part 2) ───────────────────────────
  const dimensionOptions = [
    { id: 'region', label: '区域', icon: MapPin },
    { id: 'partner_type', label: '伙伴类型', icon: Building2 },
    { id: 'partner_tier', label: '伙伴等级', icon: Layers },
    { id: 'industry', label: '行业', icon: BarChart3 },
  ];

  const dimData = useMemo(() => {
    const allDims = revenue.dimensional_achievements || activePartners.dimensional_achievements || [];
    return allDims.find((d) => d.type === detailDim)?.data || [];
  }, [revenue, activePartners, detailDim]);

  // Derive key diagnostic insights from dimension data
  const dimDiagnosis = useMemo(() => {
    if (dimData.length === 0) return null;
    const top = dimData[0];
    const bottom = dimData[dimData.length - 1];
    const topName = top?.name || '';
    const bottomName = bottom?.name || '';
    const topRate = top?.rate || 0;
    const bottomRate = bottom?.rate || 0;
    const gap = topRate - bottomRate;

    if (detailDim === 'region') {
      return {
        finding: `区域差距达${Math.round(gap)}个百分点`,
        detail: `${topName}（${Math.round(topRate)}%）领跑，${bottomName}（${Math.round(bottomRate)}%）严重落后。${bottomName}仅2家银牌伙伴支撑，覆盖力不足是根本原因。`,
        action: `建议启动"${bottomName}专项招募计划"`,
        actionTarget: 'partners',
      };
    }
    if (detailDim === 'partner_type') {
      return {
        finding: `类型间转化效率差异显著`,
        detail: `${topName}达成率最高（${Math.round(topRate)}%），但${bottomName}（${Math.round(bottomRate)}%）因技术适配瓶颈拖累整体。ISV的联合方案能力是当前最短板。`,
        action: '加快ISV技术适配验证，提供专项PMDF',
        actionTarget: 'enablement',
      };
    }
    if (detailDim === 'partner_tier') {
      return {
        finding: '金字塔结构稳固，但腰部力量薄弱',
        detail: `Top 20%伙伴贡献78%业绩，大量银牌伙伴活跃度仅55%——存在"躺平"现象。银牌→金牌的晋升通道不畅。`,
        action: '启动末位激活与晋升激励专项',
        actionTarget: 'incentives',
      };
    }
    return {
      finding: `${topName}主导，${bottomName}待开发`,
      detail: `${topName}贡献了${Math.round((top as { contribution_percent?: number })?.contribution_percent ?? topRate)}%，而${bottomName}仅${Math.round(bottomRate)}%，存在显著不均衡。`,
      action: `针对${bottomName}加大资源投放`,
      actionTarget: 'marketing',
    };
  }, [dimData, detailDim]);

  // ── Channel health diagnosis ──────────────────────────
  const healthDiagnosis = useMemo(() => {
    if (!ecosystem || !revForces) return null;
    const issues: string[] = [];
    if (revForces.capability === 'at_risk') issues.push('能力值是当前最短板——伙伴产品能力不足以支撑战略转型');
    if (revForces.coverage === 'at_risk') issues.push('覆盖力不足——部分区域存在明显空白');
    if (revForces.activity === 'at_risk') issues.push('活跃度下降——伙伴行为趋于保守');
    if (revForces.will === 'at_risk') issues.push('意愿度下降——激励政策边际效应递减');
    if (issues.length === 0) issues.push('四力均衡，生态健康。继续关注能力建设与白地覆盖。');
    return issues;
  }, [ecosystem, revForces]);

  // ── Lifecycle diagnosis ───────────────────────────────
  const lifecycleDiagnosis = useMemo(() => {
    if (!ecosystem) return null;
    const churnRate = ecosystem.coverage.churn_quarter / ecosystem.coverage.total * 100;
    return {
      finding: churnRate > 3 ? '流失率偏高，需重点关注' : '流失率在可控范围内',
      detail: `本季新增${ecosystem.coverage.new_quarter}家，流失${ecosystem.coverage.churn_quarter}家，净增${ecosystem.coverage.new_quarter - ecosystem.coverage.churn_quarter}家。新招募伙伴从注册→活跃的转化周期约45天。`,
    };
  }, [ecosystem]);

  // ── Correlation diagnosis ─────────────────────────────
  const correlationFindings = [
    { source: 'SI', target: 'ISV', value: 45, insight: 'SI+ISV 是最强组合：SI 提供客户关系，ISV 提供方案，联合打单成功率 68%' },
    { source: 'VAD', target: 'Reseller', value: 55, insight: '总分销 → 转售商是最成熟的流转链路，但利润率偏低' },
    { source: 'ISV', target: 'Reseller', value: 28, insight: 'ISV方案通过转售商触达中小客户，潜力被低估——仅28个联合项目' },
    { source: 'SI', target: 'VAD', value: 32, insight: 'SI向VAD采购基础设施，协作稳定但缺乏增值空间' },
  ];

  // ── Tier migration trend ──────────────────────────────
  const tierMigration = [
    { from: '注册→银牌', count: 23, up: true, meaning: '新伙伴成长路径通畅' },
    { from: '银牌→金牌', count: 12, up: true, meaning: '腰部伙伴晋升动力足' },
    { from: '金牌→白金', count: 5, up: true, meaning: '头部生态持续壮大' },
    { from: '金牌→银牌', count: 3, up: false, meaning: '少数伙伴因业绩不达标降级' },
    { from: '银牌→注册', count: 8, up: false, meaning: '底层伙伴流失信号——意愿或能力不足' },
  ];

  return (
    <div className="space-y-12 pb-24">
      {/* ═══════════════════════════════════════════════════
          PART 1: 业绩总揽与根因分析
          "What happened + Why it happened"
          ═══════════════════════════════════════════════════ */}
      <section>
        <SectionHeader number="1" title="业绩总揽与根因分析" subtitle="不只呈现结果，更揭示驱动业绩变化的深层原因" />

        {/* KPI Cards with diagnosis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <Card key={kpi.label} hover>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-neutral-500">{kpi.label}</span>
                <Spark data={kpi.spark} color={kpi.color} />
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-semibold text-neutral-900 dark:text-white">{kpi.value}</span>
                <span className="text-xs text-neutral-400">/ {kpi.target}</span>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                {kpi.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
                <span className={cn('text-xs font-semibold', kpi.change >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                  {kpi.change >= 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                </span>
                <span className="text-xs text-neutral-400">vs 上季</span>
                <Badge variant={kpi.rate >= 80 ? 'success' : kpi.rate >= 60 ? 'warning' : 'danger'} size="sm" className="ml-auto">{Math.round(kpi.rate)}%</Badge>
              </div>
              {/* Root cause diagnosis */}
              <div className="mt-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-500 leading-relaxed">{kpi.diagnosis}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Revenue trend chart + Root cause summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>营收趋势与增长归因</CardTitle>
              <span className="text-xs text-neutral-400">环比 {revenue.qoq >= 0 ? '+' : ''}{revenue.qoq.toFixed(1)}%</span>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={revenue.monthly_data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7' }} formatter={(v: number) => [formatCurrency(v), '']} />
                    <Area type="monotone" dataKey="value" stroke="#18181b" fill="url(#revArea)" strokeWidth={2} />
                    <defs>
                      <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#18181b" stopOpacity={0.08} />
                        <stop offset="100%" stopColor="#18181b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              {/* Revenue growth decomposition */}
              {revenue.strategic_revenue && (
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs font-medium text-neutral-500 mb-2">增长归因分解</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                      <span className="text-xs text-neutral-500">预测着陆</span>
                      <p className="text-sm font-semibold">{formatCurrency(revenue.strategic_revenue.forecast_landing)}</p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                      <span className="text-xs text-neutral-500">Pipeline 倍率</span>
                      <p className="text-sm font-semibold">{revenue.strategic_revenue.pipeline_multiplier}x</p>
                      <p className="text-[10px] text-neutral-400">{revenue.strategic_revenue.pipeline_multiplier >= 3 ? '储备充裕' : '储备不足——需加大商机拓展'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Diagnosis (connects Part 1 → Part 2) */}
          {config.sections.revenueAlignment && (
            <StrategicGoalBoard revenue={revenue} insights={insights} onNavigate={onViewChange} />
          )}
        </div>

        {/* Cross-reference: Key risk signal connecting Part 1 to Part 2 */}
        {revForces && (revForces.capability === 'at_risk' || revForces.coverage === 'at_risk') && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {revForces.capability === 'at_risk' ? '能力值预警' : '覆盖力预警'}：该指标连续两季度低于健康线
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                {revForces.capability === 'at_risk'
                  ? '伙伴产品能力不足导致方案型商机转化率下降——详见下方"渠道细节"区域的能力维度拆解。建议优先推进认证培训计划。'
                  : '部分区域覆盖密度不足，限制业绩增长天花板——详见"渠道深度洞察"的白地分析。'}
              </p>
              <Button variant="ghost" size="sm" className="mt-2 text-amber-700 dark:text-amber-300"
                onClick={() => {
                  if (revForces.capability === 'at_risk') onViewChange('enablement');
                  else onViewChange('partners');
                }}>
                {revForces.capability === 'at_risk' ? '查看赋能计划' : '查看区域覆盖'} <ArrowUpRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════
          PART 2: 渠道三要素 —— 覆盖 · 活跃度 · 绩效
          ═══════════════════════════════════════════════════ */}
      <section>
        <SectionHeader number="2" title="渠道分析：覆盖 · 活跃度 · 绩效评估"
          subtitle="从三个核心维度全面诊断渠道健康度，揭示能力短板与增长机会" />

        {/* ═══ 2.1 覆盖 (Coverage) ═══ */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">覆盖</h3>
            <span className="text-xs text-neutral-400">渠道地理分布、等级结构与白地识别</span>
            <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800 ml-3" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Regional Coverage */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>区域覆盖密度</CardTitle>
                {ecosystem && <Badge variant={ecosystem.coverage.new_quarter > ecosystem.coverage.churn_quarter ? 'success' : 'warning'} size="sm">
                  净增 {ecosystem.coverage.new_quarter - ecosystem.coverage.churn_quarter}
                </Badge>}
              </CardHeader>
              <CardContent>
                {ecosystem && (
                  <div className="space-y-3">
                    {ecosystem.regional_coverage.map((region, i) => {
                      const density = region.city_count > 0 ? (region.partner_count / region.city_count).toFixed(1) : '0';
                      const isLowDensity = parseFloat(density) < 4;
                      const maxPartners = Math.max(...ecosystem.regional_coverage.map((r) => r.partner_count));
                      return (
                        <div key={i} className={cn('p-3 rounded-lg border transition-colors',
                          isLowDensity ? 'border-amber-200 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-900/5' : 'border-neutral-200 dark:border-neutral-800')}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <MapPin className={cn('w-4 h-4', isLowDensity ? 'text-amber-500' : 'text-neutral-400')} />
                              <span className="text-sm font-medium text-neutral-900 dark:text-white">{region.region}</span>
                              <Badge variant={isLowDensity ? 'warning' : 'default'} size="sm">{region.partner_count} 伙伴</Badge>
                              <span className="text-xs text-neutral-400">{region.city_count} 城 · 密度 {density}</span>
                            </div>
                            <span className="text-xs text-neutral-500">{((region.partner_count / maxPartners) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-2">
                            <div className={cn('h-full rounded-full', isLowDensity ? 'bg-amber-400' : 'bg-blue-500')}
                              style={{ width: `${(region.partner_count / maxPartners) * 100}%` }} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {region.new_cities.length > 0 ? (
                                <><span className="text-[11px] text-emerald-600 font-medium">新覆盖:</span>
                                  {region.new_cities.map((city) => <Badge key={city} variant="success" size="sm">{city}</Badge>)}</>
                              ) : <span className="text-[11px] text-neutral-400">本期无新增城市</span>}
                            </div>
                            {isLowDensity && <span className="text-[11px] text-amber-600">白地机会——优先招募</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tier Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>等级结构漏斗</CardTitle>
                <span className="text-xs text-neutral-400">各等级伙伴数量分布</span>
              </CardHeader>
              <CardContent>
                {ecosystem && (
                  <div className="space-y-3">
                    {ecosystem.tier_funnel.map((tier, idx) => {
                      const maxCount = Math.max(...ecosystem.tier_funnel.map((t) => t.count));
                      const colors = ['#18181b', '#3f3f46', '#71717a', '#d4d4d8'];
                      return (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1 text-sm">
                            <span className="font-medium text-neutral-700 dark:text-neutral-300">{tier.tier}</span>
                            <span className="font-semibold">{tier.count}<span className="text-xs text-neutral-400 ml-1">({tier.percentage}%)</span></span>
                          </div>
                          <div className="h-6 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden">
                            <div className="h-full rounded flex items-center px-2" style={{ width: `${(tier.count / maxCount) * 100}%`, backgroundColor: colors[idx] }}>
                              <span className="text-[10px] font-semibold text-white">{tier.count} 家</span>
                            </div>
                          </div>
                          {idx === 0 && <p className="text-[11px] text-neutral-400 mt-1">头部集中：白金伙伴占{ecosystem.contribution_mix.top_percent}% 贡献{ecosystem.contribution_mix.revenue_percent}% 营收</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
                  <span className="font-medium">覆盖诊断：</span>
                  {ecosystem && ecosystem.coverage.new_quarter > ecosystem.coverage.churn_quarter
                    ? `本季净增 ${ecosystem.coverage.new_quarter - ecosystem.coverage.churn_quarter} 家，覆盖扩张健康。但腰部伙伴（银牌）密度不足，限制了区域下沉能力。`
                    : `本季流失超过新增，覆盖出现净减少——需紧急关注伙伴留存。`}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ═══ 2.2 活跃度 (Activity) ═══ */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">活跃度</h3>
            <span className="text-xs text-neutral-400">伙伴行为分层、活跃质量与参与趋势</span>
            <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800 ml-3" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Levels */}
            <Card>
              <CardHeader>
                <CardTitle>活跃度分层 (L1/L2/L3)</CardTitle>
                <Badge variant="info" size="sm">行为模型</Badge>
              </CardHeader>
              <CardContent>
                {activePartners.active_split ? (
                  <div className="space-y-5">
                    {[
                      { label: 'L1: 交易活跃', sub: '有下单行为的伙伴', data: activePartners.active_split.order_placing, color: '#18181b', detail: '核心交易伙伴，平均单笔订单¥45.2万，复购率85%' },
                      { label: 'L2: 项目活跃', sub: '有商机报备的伙伴', data: activePartners.active_split.leads_reporting, color: '#2563eb', detail: '报备项目总额¥12.5亿，但转化周期拉长10%——方案能力瓶颈' },
                      { label: 'L3: 参与活跃', sub: '参与MDF/激励的伙伴', data: activePartners.active_split.incentive_participants, color: '#0891b2', detail: '营销活动参与度极高，PMDF使用率达历史峰值' },
                    ].map((level) => (
                      <div key={level.label}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">{level.label}</span>
                            <p className="text-[11px] text-neutral-400">{level.sub}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-semibold">{level.data.value}</span>
                            <span className="text-xs text-neutral-400 ml-1">/ {level.data.target}</span>
                          </div>
                        </div>
                        <ProgressBar value={level.data.rate} max={150} variant="default" size="md" />
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[11px] text-neutral-400">{level.detail}</span>
                          <span className={cn('text-xs font-semibold', level.data.yoy >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                            YoY {level.data.yoy >= 0 ? '+' : ''}{level.data.yoy}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400">活跃度数据加载中...</p>
                )}
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
                  <span className="font-medium">活跃度诊断：</span>
                  L1下单活跃度健康，但L2→L3之间存在明显断层——大量伙伴停留在"参与活动"层面，未能转化为实际的商机报备和交易。
                </div>
              </CardContent>
            </Card>

            {/* Activity by Dimension */}
            <Card>
              <CardHeader>
                <CardTitle>活跃度维度透视</CardTitle>
                <span className="text-xs text-neutral-400">按区域/类型拆解活跃率差异</span>
              </CardHeader>
              <CardContent>
                {activePartners.dimensional_achievements ? (
                  <div className="space-y-4">
                    {activePartners.dimensional_achievements.slice(0, 2).map((dim) => (
                      <div key={dim.type}>
                        <p className="text-xs font-medium text-neutral-500 mb-2">
                          {dim.type === 'region' ? '按区域' : dim.type === 'partner_type' ? '按伙伴类型' : dim.type === 'partner_tier' ? '按等级' : dim.type}
                        </p>
                        <div className="space-y-2">
                          {dim.data.slice(0, 4).map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                              <span className="text-sm text-neutral-600 dark:text-neutral-400 w-24 truncate">{item.name}</span>
                              <div className="flex-1 mx-3">
                                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                  <div className={cn('h-full rounded-full', (item.activity_rate ?? 0) >= 80 ? 'bg-emerald-500' : (item.activity_rate ?? 0) >= 50 ? 'bg-amber-400' : 'bg-red-400')}
                                    style={{ width: `${item.activity_rate ?? item.rate}%` }} />
                                </div>
                              </div>
                              <span className="text-sm font-semibold w-10 text-right">{item.activity_rate ?? Math.round(item.rate)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400">维度数据加载中...</p>
                )}
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
                  <span className="font-medium">活跃度诊断：</span>
                  区域间活跃度差异显著——华东活跃度领先，但中西部活跃率不足50%，与覆盖密度直接相关。覆盖不足 → 伙伴孤立 → 活跃度低，形成恶性循环。
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ═══ 2.3 绩效评估 (Performance) ═══ */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-md bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
              <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">绩效评估</h3>
            <span className="text-xs text-neutral-400">多维达成率、归因分析与贡献排名</span>
            <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800 ml-3" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Dimension achievement chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>多维度达成率</CardTitle>
                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
                  {dimensionOptions.map((d) => (
                    <button key={d.id} onClick={() => setDetailDim(d.id)}
                      className={cn('px-2.5 py-1 rounded-md text-[11px] font-medium transition-all',
                        detailDim === d.id ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700')}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dimData.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} width={100} />
                      <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={14}>
                        {dimData.slice(0, 8).map((_, i) => <Cell key={i} fill={barColorsBrand[i % barColorsBrand.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Detail Table with diagnostic tags */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>绩效明细与诊断</CardTitle>
                {dimDiagnosis && <Badge variant={dimDiagnosis.finding.includes('差距') || dimDiagnosis.finding.includes('短板') ? 'warning' : 'info'} size="sm">{dimDiagnosis.finding}</Badge>}
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">维度</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">达成率</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">YoY</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">贡献占比</th>
                        <th className="text-center py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">状态</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">诊断</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {dimData.slice(0, 10).map((item, i) => (
                        <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="font-medium text-neutral-900 dark:text-white">{item.name}</span>
                            {item.segment_tag && (
                              <Badge variant={item.segment_tag === 'Growth' ? 'info' : item.segment_tag === 'Risk' ? 'danger' : item.segment_tag === 'Harvesting' ? 'warning' : 'default'} size="sm" className="ml-2">
                                {item.segment_tag === 'Growth' ? '增长' : item.segment_tag === 'Risk' ? '风险' : item.segment_tag === 'Harvesting' ? '收割' : '稳定'}
                              </Badge>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={cn('font-semibold', item.rate >= 80 ? 'text-emerald-600' : item.rate >= 60 ? 'text-amber-600' : 'text-red-500')}>
                              {Math.round(item.rate)}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={(item.yoy ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}>{(item.yoy ?? 0) >= 0 ? '+' : ''}{(item.yoy ?? 0).toFixed(1)}%</span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-neutral-500">{item.contribution_percent ? `${item.contribution_percent}%` : '-'}</td>
                          <td className="py-2.5 px-3 text-center">
                            {item.health_status === 'healthy' && <Badge variant="success" size="sm">健康</Badge>}
                            {item.health_status === 'at_risk' && <Badge variant="warning" size="sm">关注</Badge>}
                            {item.health_status === 'critical' && <Badge variant="danger" size="sm">危险</Badge>}
                          </td>
                          <td className="py-2.5 px-3">
                            {item.analysis && <span className="text-[11px] text-neutral-500" title={item.analysis}>{item.analysis.slice(0, 20)}{item.analysis.length > 20 ? '...' : ''}</span>}
                            {item.suggestion && <span className="text-[11px] text-blue-600 block mt-0.5">→ {item.suggestion.slice(0, 20)}{item.suggestion.length > 20 ? '...' : ''}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {dimDiagnosis && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2">
                    <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">{dimDiagnosis.finding}</p>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">{dimDiagnosis.detail}</p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => onViewChange(dimDiagnosis.actionTarget)}>
                      {dimDiagnosis.action} <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance correlation: connects all 3 sub-dimensions */}
          <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 rounded-xl">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">三维联动诊断</p>
            <p className="text-xs text-neutral-500 leading-relaxed">
              覆盖、活跃度、绩效三者高度相关：
              {ecosystem && ecosystem.health_radar.coverage >= 80
                ? ' 当前覆盖力健康，但活跃度（' + ecosystem.health_radar.activity + '）和绩效（' + ecosystem.health_radar.capability + '）存在落差——覆盖≠产出。'
                : ' 覆盖力不足直接制约活跃度和绩效天花板——没有足够的伙伴密度，活跃度和绩效无从谈起。'}
              建议优先补齐短板维度，形成"覆盖→激活→产出"的正向飞轮。
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          PART 3: 渠道深度洞察与行动建议
          "Correlations, Lifecycle, Health → What to do"
          ═══════════════════════════════════════════════════ */}
      <section>
        <SectionHeader number="3" title="渠道深度洞察与行动建议"
          subtitle="揭示渠道间隐藏的相关性，诊断生命周期健康度，给出具体行动方案"
          highlight={healthDiagnosis ? `${healthDiagnosis.length}项关注` : undefined} />

        {/* Row 1: Health Radar + Diagnosis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>四力健康诊断</CardTitle>
              <Badge variant={revForces?.capability === 'at_risk' || revForces?.coverage === 'at_risk' ? 'warning' : 'success'} size="sm">
                {revForces?.capability === 'at_risk' || revForces?.coverage === 'at_risk' ? '需关注' : '健康'}
              </Badge>
            </CardHeader>
            <CardContent>
              {ecosystem && (
                <div className="flex justify-around py-2 mb-4">
                  <HealthRing score={ecosystem.health_radar.coverage} label="覆盖力"
                    cause={revForces?.coverage === 'healthy' ? '区域覆盖均衡' : '部分区域存在空白'} />
                  <HealthRing score={ecosystem.health_radar.activity} label="活跃力"
                    cause={revForces?.activity === 'healthy' ? '伙伴行为活跃' : '下单/报备频率下降'} />
                  <HealthRing score={ecosystem.health_radar.capability} label="能力值"
                    cause={revForces?.capability === 'healthy' ? '技术能力达标' : '产品认证覆盖率不足'} />
                  <HealthRing score={ecosystem.health_radar.will} label="意愿度"
                    cause={revForces?.will === 'healthy' ? '合作积极性高' : '激励边际效应递减'} />
                </div>
              )}
              {healthDiagnosis && (
                <div className="space-y-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  {healthDiagnosis.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      {d.includes('短板') || d.includes('不足') || d.includes('下降') ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      <span className={d.includes('短板') || d.includes('不足') || d.includes('下降') ? 'text-amber-700 dark:text-amber-400' : 'text-neutral-600 dark:text-neutral-400'}>
                        {d}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lifecycle + Migration */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>渠道生命周期与等级迁移</CardTitle>
              {lifecycleDiagnosis && <Badge variant={lifecycleDiagnosis.finding.includes('偏高') ? 'warning' : 'success'} size="sm">{lifecycleDiagnosis.finding}</Badge>}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* Lifecycle stages */}
                <div>
                  <p className="text-xs font-medium text-neutral-500 mb-3">伙伴生命周期分布</p>
                  <div className="space-y-2.5">
                    {[
                      { stage: '新招募', count: ecosystem?.coverage.new_quarter || 45, pct: 100, color: '#2563eb', meaning: '45天转化窗口期' },
                      { stage: '成长期', count: 128, pct: 72, color: '#0891b2', meaning: '月均下单2.3次' },
                      { stage: '成熟期', count: 186, pct: 58, color: '#059669', meaning: '稳定贡献68%营收' },
                      { stage: '预警期', count: 42, pct: 22, color: '#d97706', meaning: '活跃度<30%' },
                      { stage: '流失风险', count: ecosystem?.coverage.churn_quarter || 19, pct: 8, color: '#dc2626', meaning: '需立即介入' },
                    ].map((item) => (
                      <div key={item.stage} className="flex items-center gap-3">
                        <span className="text-xs text-neutral-500 w-14 shrink-0">{item.stage}</span>
                        <div className="flex-1 h-6 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden relative">
                          <div className="absolute inset-0 opacity-20 rounded" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                          <div className="absolute inset-0 flex items-center px-2 justify-between">
                            <span className="text-xs font-semibold" style={{ color: item.color }}>{item.count}</span>
                            <span className="text-[10px] text-neutral-400">{item.meaning}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {lifecycleDiagnosis && (
                    <p className="text-xs text-neutral-500 mt-3">{lifecycleDiagnosis.detail}</p>
                  )}
                </div>

                {/* Tier migration */}
                <div>
                  <p className="text-xs font-medium text-neutral-500 mb-3">等级迁移趋势</p>
                  <div className="space-y-2">
                    {tierMigration.map((t, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <div className="flex items-center gap-2">
                          {t.up ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                          )}
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">{t.from}</span>
                        </div>
                        <div className="text-right">
                          <span className={cn('text-sm font-semibold', t.up ? 'text-emerald-600' : 'text-red-500')}>
                            {t.up ? '+' : '-'}{t.count}
                          </span>
                          <p className="text-[10px] text-neutral-400">{t.meaning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Channel Correlation Matrix + Regional Coverage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Correlation Network */}
          <Card>
            <CardHeader>
              <CardTitle>渠道协同关系矩阵</CardTitle>
              <span className="text-xs text-neutral-400">伙伴类型间协作强度</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {correlationFindings.map((c, i) => {
                  const maxVal = Math.max(...correlationFindings.map((x) => x.value));
                  return (
                    <div key={i} className="group">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 w-12 text-right">{c.source}</span>
                        <div className="flex-1 h-6 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden">
                          <div className="h-full bg-neutral-900 dark:bg-white rounded flex items-center px-2"
                            style={{ width: `${(c.value / maxVal) * 100}%` }}>
                            <span className="text-[10px] font-semibold text-white dark:text-neutral-900">{c.value}</span>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 w-16">{c.target}</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 pl-14">{c.insight}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <p className="text-xs text-neutral-500">
                  <span className="font-semibold">关键发现：</span>
                  SI+ISV 协作项目平均客单价 ¥120万，是非协作项目的 2.4 倍。推动伙伴间协作是提升客单价最有效的杠杆。
                </p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => onViewChange('partners')}>
                  查看协作网络详情 <ArrowUpRight className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Regional White Space */}
          <Card>
            <CardHeader>
              <CardTitle>区域覆盖与白地机会</CardTitle>
            </CardHeader>
            <CardContent>
              {ecosystem && (
                <div className="space-y-3">
                  {ecosystem.regional_coverage.map((region, i) => {
                    const density = region.city_count > 0 ? (region.partner_count / region.city_count).toFixed(1) : '0';
                    const isLowDensity = parseFloat(density) < 4;
                    return (
                      <div key={i} className={cn('p-3 rounded-lg border transition-colors',
                        isLowDensity ? 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/5' : 'border-neutral-200 dark:border-neutral-800')}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className={cn('w-4 h-4', isLowDensity ? 'text-amber-500' : 'text-neutral-400')} />
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">{region.region}</span>
                            <Badge variant={isLowDensity ? 'warning' : 'default'} size="sm">{region.partner_count} 伙伴 · {region.city_count} 城市</Badge>
                          </div>
                          <span className="text-xs text-neutral-400">密度 {density}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {region.new_cities.length > 0 ? (
                            <>
                              <span className="text-[11px] text-emerald-600 font-medium">新覆盖:</span>
                              {region.new_cities.map((city) => <Badge key={city} variant="success" size="sm">{city}</Badge>)}
                            </>
                          ) : (
                            <span className="text-[11px] text-amber-600">本期无新增城市</span>
                          )}
                        </div>
                        {isLowDensity && (
                          <p className="text-[11px] text-amber-600 mt-1">城市密度偏低，存在白地机会——建议优先招募</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actionable Insights (connects all 3 parts) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, i) => (
            <Card key={i} hover onClick={() => onViewChange(
              insight.actionId === 'pmdf' ? 'marketing' : insight.actionId === 'training' ? 'enablement' : 'analytics')}>
              <div className="flex items-start gap-3">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                  insight.type === 'trend' ? 'bg-blue-50 dark:bg-blue-900/20' :
                  insight.type === 'risk' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20')}>
                  {insight.type === 'trend' ? <TrendingUp className="w-4 h-4 text-blue-600" /> :
                   insight.type === 'risk' ? <AlertTriangle className="w-4 h-4 text-amber-600" /> :
                   <Zap className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">{insight.title}</p>
                  <p className="text-xs text-neutral-500 leading-relaxed mb-2">{insight.content}</p>
                  <span className="text-xs font-medium text-neutral-900 dark:text-white hover:underline cursor-pointer flex items-center gap-1">
                    {insight.actionLabel} <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Historical Context */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-neutral-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">历史趋势</h2>
            <p className="text-sm text-neutral-500">3年数据回顾，辅助长期战略决策</p>
          </div>
          <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800 ml-4" />
        </div>
        <HistoricalTrendChart />
      </section>
    </div>
  );
};
