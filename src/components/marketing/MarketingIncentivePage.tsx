import { useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMarketingData } from '../../hooks/useData';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { cn, formatCurrency } from '../../lib/utils';
import {
  Target, TrendingUp, Users, Calendar, Plus, ArrowUpRight, Zap,
  Megaphone, MousePointerClick, DollarSign, Activity, BarChart3,
  CheckCircle2, Clock, AlertTriangle, ExternalLink,
} from 'lucide-react';
import { PMDFManagement } from './PMDFManagement';

export const MarketingIncentivePage = () => {
  const { t } = useLanguage();
  const { mdfStats, mdfActivities, incentiveStats } = useMarketingData();

  // MDF KPI cards
  const mdfKpis = useMemo(() => [
    { label: '年度配额', value: formatCurrency(mdfStats.annualQuota), icon: Target, color: 'text-neutral-700' },
    { label: '已使用', value: formatCurrency(mdfStats.usedAmount), sub: `${Math.round((mdfStats.usedAmount / mdfStats.annualQuota) * 100)}%`, icon: Activity, color: 'text-blue-600' },
    { label: '剩余可用', value: formatCurrency(mdfStats.remainingAmount), sub: `Q3配额 ${formatCurrency(mdfStats.quarterlyQuota)}`, icon: DollarSign, color: 'text-emerald-600' },
    { label: '线索转化率', value: `${mdfStats.conversionRate}%`, sub: 'MDF活动→商机', icon: TrendingUp, color: 'text-amber-600' },
  ], [mdfStats]);

  // Activity distribution
  const activityDist = mdfStats.activityDistribution;

  // Active campaigns (from activities)
  const activeCampaigns = mdfActivities.filter((a) => a.status === 'In Progress' || a.status === 'Planning');
  const completedCampaigns = mdfActivities.filter((a) => a.status === 'Completed');

  const totalLeads = mdfActivities.reduce((s, a) => s + a.leadsGenerated, 0);
  const totalSpend = mdfActivities.reduce((s, a) => s + a.actualSpend, 0);
  const totalBudget = mdfActivities.reduce((s, a) => s + a.budget, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">{t('marketing.title')}</h1>
          <p className="text-sm text-neutral-500 mt-1">{t('marketing.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm"><Calendar className="w-4 h-4" /> Q3 2025</Button>
          <Button variant="brand" size="sm"><Plus className="w-4 h-4" /> 新建活动</Button>
        </div>
      </div>

      {/* MDF KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mdfKpis.map((kpi) => (
          <Card key={kpi.label}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <kpi.icon className={kpi.color} />
              </div>
              <div>
                <p className="text-xs text-neutral-500">{kpi.label}</p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-white">{kpi.value}</p>
                {kpi.sub && <p className="text-[11px] text-neutral-400">{kpi.sub}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* MDF Budget + Activity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Usage */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>MDF 预算使用</CardTitle>
            <span className="text-xs text-neutral-400">
              总预算 {formatCurrency(totalBudget)} · 已支出 {formatCurrency(totalSpend)}
            </span>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCampaigns.concat(completedCampaigns).slice(0, 5).map((act) => {
                const pct = act.budget > 0 ? Math.round((act.actualSpend / act.budget) * 100) : 0;
                return (
                  <div key={act.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{act.name}</span>
                        <Badge variant={act.status === 'Completed' ? 'success' : act.status === 'In Progress' ? 'info' : 'default'} size="sm">
                          {act.status === 'Completed' ? '已完成' : act.status === 'In Progress' ? '进行中' : '计划中'}
                        </Badge>
                      </div>
                      <span className="text-sm font-semibold">{formatCurrency(act.actualSpend)} / {formatCurrency(act.budget)}</span>
                    </div>
                    <ProgressBar value={pct} size="sm" variant={pct >= 90 ? 'danger' : pct >= 70 ? 'warning' : 'brand'} />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-neutral-400">{act.date} · {act.type}</span>
                      <span className="text-[11px] text-neutral-400">{act.leadsGenerated} 线索</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Activity Type Distribution */}
        <Card>
          <CardHeader><CardTitle>活动类型分布</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityDist.map((item) => (
                <div key={item.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.type}</span>
                    <span className="text-sm font-semibold">{item.percentage}%</span>
                  </div>
                  <ProgressBar value={item.percentage} size="sm" variant="default" />
                  <p className="text-[11px] text-neutral-400 mt-0.5">{item.count} 场活动</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                  <p className="text-lg font-semibold text-neutral-900 dark:text-white">{totalLeads}</p>
                  <p className="text-xs text-neutral-500">总线索数</p>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                  <p className="text-lg font-semibold text-emerald-600">{mdfStats.conversionRate}%</p>
                  <p className="text-xs text-neutral-500">转化率</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4" /> 营销活动
          </h3>
          <Button variant="ghost" size="sm">查看全部 <ArrowUpRight className="w-3.5 h-3.5" /></Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mdfActivities.map((act) => (
            <Card key={act.id} hover>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white leading-snug">{act.name}</h4>
                  <Badge variant={act.status === 'Completed' ? 'success' : act.status === 'In Progress' ? 'info' : 'default'} size="sm">
                    {act.status === 'Completed' ? '已完成' : act.status === 'In Progress' ? '进行中' : '计划中'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {act.date}</span>
                  <span>{act.type}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <div>
                    <p className="text-[10px] text-neutral-400">预算</p>
                    <p className="text-sm font-semibold">{formatCurrency(act.budget)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400">支出</p>
                    <p className="text-sm font-semibold">{formatCurrency(act.actualSpend)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400">线索</p>
                    <p className="text-sm font-semibold text-blue-600">{act.leadsGenerated}</p>
                  </div>
                </div>
                <ProgressBar value={act.progress} size="sm" variant={act.status === 'Completed' ? 'success' : 'brand'} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Lead Pipeline Summary */}
      <Card>
        <CardHeader>
          <CardTitle>线索转化漏斗</CardTitle>
          <span className="text-xs text-neutral-400">MDF 活动 → 商机 Pipeline</span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { stage: '活动触达', value: 2450, pct: 100, color: 'bg-neutral-200 dark:bg-neutral-700', icon: Megaphone, detail: '沙龙/路演/线上研讨' },
              { stage: '线索收集', value: 860, pct: 35, color: 'bg-blue-200 dark:bg-blue-800', icon: Users, detail: 'MQL 市场合格线索' },
              { stage: '商机转化', value: 245, pct: 10, color: 'bg-amber-200 dark:bg-amber-800', icon: Target, detail: 'SQL 销售合格线索' },
              { stage: '签约成交', value: 68, pct: 2.8, color: 'bg-emerald-200 dark:bg-emerald-800', icon: CheckCircle2, detail: '¥85M Pipeline产出' },
            ].map((s, i) => (
              <div key={s.stage} className="text-center">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2', s.color)}>
                  <s.icon className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                </div>
                <p className="text-xs text-neutral-400">{s.stage}</p>
                <p className="text-xl font-semibold text-neutral-900 dark:text-white">{s.value.toLocaleString()}</p>
                <p className="text-[11px] text-neutral-400">{s.pct}% · {s.detail}</p>
                {i < 3 && <ArrowUpRight className="w-4 h-4 text-neutral-300 mx-auto mt-1 rotate-90" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Incentive Quick Stats (link to /incentives) */}
      <Card>
        <CardHeader>
          <CardTitle>激励计划概览</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/incentives'}>
            查看详情 <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{incentiveStats.totalActivePrograms}</p>
              <p className="text-xs text-neutral-500">活跃计划</p>
            </div>
            <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{formatCurrency(incentiveStats.totalPayoutYTD)}</p>
              <p className="text-xs text-neutral-500">年度支出</p>
            </div>
            <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{incentiveStats.avgParticipationRate}%</p>
              <p className="text-xs text-neutral-500">平均参与率</p>
            </div>
            <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{incentiveStats.topTrigger}</p>
              <p className="text-xs text-neutral-500">核心驱动</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PMDF 全链路管理 */}
      <PMDFManagement />
    </div>
  );
};
