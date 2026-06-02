import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMarketingData } from '../../hooks/useData';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { formatCurrency } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { Gift, TrendingUp, Users, Target, Plus, ArrowUpRight, X, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

export const IncentivesPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { incentivePrograms, incentiveStats } = useMarketingData();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', trigger_type: 'Pipeline Gap', payout_type: 'Cash', total_budget: '', description: '', start_date: '', end_date: '' });
  const [creating, setCreating] = useState(false);

  const cur = (v: number) => formatCurrency(v, 'CNY');

  const handleCreate = async () => {
    if (!form.title || !form.total_budget) return;
    setCreating(true);
    try {
      const { error } = await supabase.from('incentive_programs').insert({
        title: form.title, trigger_type: form.trigger_type, payout_type: form.payout_type,
        total_budget: Number(form.total_budget), description: form.description,
        start_date: form.start_date, end_date: form.end_date, status: 'Active',
        claimed_amount: 0, participants_count: 0,
      });
      if (error) throw new Error(error.message);
      setShowCreate(false);
      setForm({ title: '', trigger_type: 'Pipeline Gap', payout_type: 'Cash', total_budget: '', description: '', start_date: '', end_date: '' });
    } catch (err) {
      console.error('Failed to create incentive program:', err);
    } finally {
      setCreating(false);
    }
  };

  const statusVariant = (s: string) => s === 'Active' ? 'success' as const : s === 'Upcoming' ? 'info' as const : 'default' as const;
  const statusLabel = (s: string) => s === 'Active' ? '进行中' : s === 'Upcoming' ? '即将开始' : '已结束';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-neutral-900 dark:text-white">{t('incentives.title')}</h1><p className="text-sm text-neutral-500 mt-1">管理合作伙伴激励计划，推动业绩增长</p></div>
        <Button variant="brand" size="sm" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" />新建激励计划</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '活跃计划', value: incentiveStats.totalActivePrograms, icon: Gift, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: '年度支出', value: cur(incentiveStats.totalPayoutYTD), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: '平均参与率', value: `${incentiveStats.avgParticipationRate}%`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: '核心驱动', value: incentiveStats.topTrigger, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', s.bg)}><s.icon className={cn('w-5 h-5', s.color)} /></div>
              <div><p className="text-xs text-neutral-500">{s.label}</p><p className="text-lg font-semibold text-neutral-900 dark:text-white">{s.value}</p></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {incentivePrograms.map((p: any) => {
          const pct = p.totalBudget > 0 ? Math.round((p.claimedAmount / p.totalBudget) * 100) : 0;
          return (
            <Card key={p.id} hover>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{p.title}</h3>
                  <Badge variant={statusVariant(p.status)}>{statusLabel(p.status)}</Badge>
                </div>
                <p className="text-xs text-neutral-500 line-clamp-2">{p.description}</p>
                <div className="flex items-center gap-2 text-xs text-neutral-400"><Calendar className="w-3 h-3" />{p.startDate} ~ {p.endDate}</div>
                <div className="space-y-1 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex justify-between text-xs"><span>预算使用</span><span>{pct}%</span></div>
                  <ProgressBar value={pct} size="sm" variant={pct > 90 ? 'danger' : 'brand'} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-[10px] text-neutral-400">总预算</p><p className="text-xs font-semibold">{cur(p.totalBudget)}</p></div>
                  <div><p className="text-[10px] text-neutral-400">已申领</p><p className="text-xs font-semibold">{cur(p.claimedAmount)}</p></div>
                  <div><p className="text-[10px] text-neutral-400">参与伙伴</p><p className="text-xs font-semibold">{p.participantsCount}</p></div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">新建激励计划</h3><button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"><X className="w-5 h-5" /></button></div>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold text-neutral-500">计划名称 *</label><input className="w-full h-10 px-3 mt-1 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-sm" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-neutral-500">触发类型</label><select className="w-full h-10 px-3 mt-1 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-sm" value={form.trigger_type} onChange={e => setForm({...form, trigger_type: e.target.value})}>{['Pipeline Gap','New Product','Competitive','Sales Acceleration'].map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label className="text-xs font-semibold text-neutral-500">发放类型</label><select className="w-full h-10 px-3 mt-1 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-sm" value={form.payout_type} onChange={e => setForm({...form, payout_type: e.target.value})}>{['Cash','Rebate','Points'].map(t => <option key={t}>{t}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs font-semibold text-neutral-500">总预算 *</label><input className="w-full h-10 px-3 mt-1 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-sm" type="number" value={form.total_budget} onChange={e => setForm({...form, total_budget: e.target.value})} /></div>
                <div><label className="text-xs font-semibold text-neutral-500">开始</label><input className="w-full h-10 px-3 mt-1 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-sm" type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} /></div>
                <div><label className="text-xs font-semibold text-neutral-500">结束</label><input className="w-full h-10 px-3 mt-1 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-sm" type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} /></div>
              </div>
              <div><label className="text-xs font-semibold text-neutral-500">描述</label><textarea className="w-full px-3 py-2 mt-1 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-sm resize-none" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><Button variant="secondary" onClick={() => setShowCreate(false)}>取消</Button><Button variant="brand" onClick={handleCreate} disabled={creating}>{creating ? '创建中...' : '创建计划'}</Button></div>
          </div>
        </div>
      )}
    </div>
  );
};
