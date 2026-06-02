import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useMarketingData } from '../../hooks/useData';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { formatCurrency } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { Plus, TrendingUp, Users, Calendar, Target, Activity, DollarSign, BarChart3, PieChart, ExternalLink, X } from 'lucide-react';

export const MarketingIncentivePage = () => {
  const { t } = useLanguage();
  const { config } = useConfig();
  const navigate = useNavigate();
  const { mdfStats, mdfActivities, incentivePrograms, incentiveStats } = useMarketingData();
  const [q2Plans, setQ2Plans] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newActivity, setNewActivity] = useState({ name: '', type: '线下峰会', date: '', budget: '' });
  const [creating, setCreating] = useState(false);
  const cur = (v: number) => formatCurrency(v, config?.currency || 'CNY');

  // Current quarter = Q2 (months 4-6)
  const curQ = 'Q2';
  useEffect(() => {
    supabase.from('marketing_plan').select('*').eq('year', 2025).eq('quarter', curQ).eq('plan_status', 'approved').order('category').then(({ data }: any) => { if (data?.length) setQ2Plans(data); });
  }, []);

  // Filter activities to current quarter
  const qActivities = mdfActivities.filter((a: any) => {
    const d = a.event_date || a.date || '';
    const m = parseInt(d.split('-')[1] || '0');
    return m >= 4 && m <= 6;
  });
  const activeCount = qActivities.filter((a: any) => a.status !== 'Completed').length;
  const completedCount = qActivities.filter((a: any) => a.status === 'Completed').length;
  const totalLeads = qActivities.reduce((s: number, a: any) => s + (a.leadsGenerated || 0), 0);
  const totalBudget = q2Plans.reduce((s: number, p: any) => s + Number(p.approved_amount || 0), 0);
  const totalSpend = qActivities.reduce((s: number, a: any) => s + (a.actual_spend || 0), 0);
  const totalParticipants = qActivities.reduce((s: number, a: any) => s + (a.expected_attendees || 0), 0);

  const handleCreateActivity = async () => {
    if (!newActivity.name || !newActivity.budget) return;
    setCreating(true);
    await supabase.from('marketing_activities').insert({
      name: newActivity.name, type: newActivity.type, event_date: newActivity.date || new Date().toISOString().split('T')[0],
      status: 'Planning', budget: Number(newActivity.budget), actual_spend: 0, leads_generated: 0, progress: 0,
    });
    setShowCreate(false);
    setNewActivity({ name: '', type: '线下峰会', date: '', budget: '' });
    setCreating(false);
    window.location.reload();
  };

  const PieSVG = ({ data, size = 50 }: { data: number[]; size?: number }) => {
    const colors = ['#2563eb','#059669','#d97706','#7c3aed','#dc2626','#0891b2'];
    const total = data.reduce((s, v) => s + v, 0) || 1;
    const cx = size / 2, cy = size / 2, r = size / 2 - 2;
    let angle = -Math.PI / 2;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((v, i) => {
          if (v <= 0) return null;
          const a = (v / total) * Math.PI * 2;
          const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
          const x2 = cx + r * Math.cos(angle + a), y2 = cy + r * Math.sin(angle + a);
          const large = a > Math.PI ? 1 : 0;
          angle += a;
          return <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill={colors[i % colors.length]} />;
        })}
      </svg>
    );
  };

  const activityTypes: Record<string, number> = {};
  mdfActivities.forEach((a: any) => { activityTypes[a.type || '其他'] = (activityTypes[a.type || '其他'] || 0) + 1; });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-xl font-semibold text-neutral-900 dark:text-white">{t('marketing.title')}</h1><p className="text-sm text-neutral-500 mt-1">{t('marketing.subtitle')}</p></div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate('/marketing/plan')}><Target className="w-4 h-4" />年度规划</Button>
          <Button variant="brand" size="sm" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" />新建活动</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: `${curQ} 批复预算`, value: cur(totalBudget), sub: `${q2Plans.length} 个批复活动`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', onClick: () => navigate('/marketing/plan') },
          { label: `${curQ} 执行情况`, value: `${activeCount} 场进行中`, sub: `${completedCount} 场已完成 · 支出 ${cur(totalSpend)}`, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: '线索转化率', value: `${mdfStats.conversionRate}%`, sub: `获取 ${totalLeads} 条线索`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: '激励计划', value: `${incentiveStats.totalActivePrograms} 个活跃`, sub: `YTD ${cur(incentiveStats.totalPayoutYTD)}`, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', onClick: () => navigate('/incentives') },
        ].map((kpi, i) => (
          <Card key={i} className={kpi.onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} onClick={kpi.onClick}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center shrink-0`}><kpi.icon className={kpi.color} /></div>
              <div><p className="text-xs text-neutral-500">{kpi.label}</p><p className="text-lg font-semibold text-neutral-900 dark:text-white">{kpi.value}</p><p className="text-[11px] text-neutral-400">{kpi.sub}</p></div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity List */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{curQ} 营销活动</CardTitle><span className="text-xs text-neutral-400">{q2Plans.length + qActivities.length} 个活动 · 批复预算 {cur(totalBudget)} · 实际支出 {cur(totalSpend)}</span></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {q2Plans.length === 0 && qActivities.length === 0 && <p className="text-sm text-neutral-400 py-4 text-center">暂无 Q2 活动，请先在年度规划中批复 Q2 计划</p>}
              {/* Approved Q2 plans */}
              {q2Plans.map((p: any) => {
                const act = qActivities.find((a: any) => a.name === p.category || a.type === p.category);
                return (
                  <div key={p.id} className="p-3 rounded-lg border border-emerald-100 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="success" size="sm">{p.activity_type || 'Marketing'}</Badge>
                        <span className="text-sm font-medium">{p.category}{p.partner_name ? ` · ${p.partner_name}` : ''}</span>
                      </div>
                      <span className="text-sm font-semibold">{cur(act?.actualSpend || 0)} / {cur(p.approved_amount || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>{p.city || ''} · {p.expected_date || ''} · {p.responsible_person || ''}</span>
                      <span>{p.expected_attendees || 0} 参加 · 目标: {p.expected_output || p.goal || ''}</span>
                    </div>
                  </div>
                );
              })}
              {/* Other Q2 activities */}
              {qActivities.filter((a: any) => !q2Plans.some((p: any) => p.category === a.type || p.category === a.name)).slice(0, 4).map((act: any) => {
                const pct = act.budget > 0 ? Math.round(((act.actualSpend || 0) / act.budget) * 100) : 0;
                return (
                  <div key={act.id} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">{act.name}</span>
                        <Badge variant={act.status === 'Completed' ? 'success' : act.status === 'In Progress' ? 'info' : 'default'} size="sm">
                          {act.status === 'Completed' ? '已完成' : act.status === 'In Progress' ? '进行中' : '计划中'}
                        </Badge>
                      </div>
                      <span className="text-sm font-semibold">{cur(act.actualSpend || 0)} / {cur(act.budget)}</span>
                    </div>
                    <ProgressBar value={pct} size="sm" variant={pct >= 90 ? 'danger' : 'brand'} />
                    <div className="flex items-center justify-between mt-1.5 text-[11px] text-neutral-400">
                      <span>{act.date} · {act.type}</span>
                      <span>{act.leadsGenerated || 0} 线索 · {Math.round((act.leadsGenerated || 0) * 0.25)} 商机</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Activity Type Pie */}
          <Card>
            <CardHeader><CardTitle>活动类型</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <PieSVG data={Object.values(activityTypes)} size={70} />
                <div className="space-y-1 flex-1 text-xs">
                  {Object.entries(activityTypes).slice(0, 5).map(([t, c]) => {
                    const pct = Math.round((c / mdfActivities.length) * 100);
                    return <div key={t} className="flex items-center justify-between"><span className="text-neutral-500">{t}</span><span className="font-medium">{c}场 ({pct}%)</span></div>;
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>快速入口</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/incentives')}><Target className="w-4 h-4 mr-2" />激励计划管理</Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/marketing/plan')}><Calendar className="w-4 h-4 mr-2" />年度预算规划</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Activity Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">新建营销活动</h3><button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"><X className="w-5 h-5" /></button></div>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold text-neutral-500">活动名称 *</label><input className="w-full h-10 px-3 mt-1 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-sm" value={newActivity.name} onChange={e => setNewActivity({...newActivity, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-neutral-500">类型</label><select className="w-full h-10 px-3 mt-1 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-sm" value={newActivity.type} onChange={e => setNewActivity({...newActivity, type: e.target.value})}>{['线下峰会','线下沙龙','Webinar','联合营销','渠道招募','行业大会'].map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label className="text-xs font-semibold text-neutral-500">预算 *</label><input className="w-full h-10 px-3 mt-1 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-sm" type="number" value={newActivity.budget} onChange={e => setNewActivity({...newActivity, budget: e.target.value})} /></div>
              </div>
              <div><label className="text-xs font-semibold text-neutral-500">日期</label><input className="w-full h-10 px-3 mt-1 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-sm" type="date" value={newActivity.date} onChange={e => setNewActivity({...newActivity, date: e.target.value})} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><Button variant="secondary" onClick={() => setShowCreate(false)}>取消</Button><Button variant="brand" onClick={handleCreateActivity} disabled={creating}>{creating ? '创建中...' : '创建活动'}</Button></div>
          </div>
        </div>
      )}
    </div>
  );
};
