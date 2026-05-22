import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Gift, TrendingUp, Users, Target, Plus, ArrowUpRight } from 'lucide-react';
import { INCENTIVE_PROGRAMS, INCENTIVE_STATS } from '../../constants';
import { cn } from '../../lib/utils';

export const IncentivesPage = () => {
  const { t } = useLanguage();

  const stats = [
    { label: '活跃计划', value: INCENTIVE_STATS.totalActivePrograms, icon: Gift, color: 'text-purple-600' },
    { label: '年度支出', value: `¥${(INCENTIVE_STATS.totalPayoutYTD / 10000).toFixed(0)}万`, icon: TrendingUp, color: 'text-emerald-600' },
    { label: '参与率', value: `${INCENTIVE_STATS.avgParticipationRate}%`, icon: Users, color: 'text-blue-600' },
    { label: '核心驱动', value: INCENTIVE_STATS.topTrigger, icon: Target, color: 'text-amber-600' },
  ];

  const statusVariant = (status: string) => {
    if (status === 'Active') return 'success' as const;
    if (status === 'Upcoming') return 'info' as const;
    return 'default' as const;
  };

  const statusLabel = (status: string) => {
    if (status === 'Active') return '进行中';
    if (status === 'Upcoming') return '即将开始';
    return '已结束';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">{t('incentives.title')}</h1>
        <p className="text-sm text-neutral-500 mt-1">{t('incentives.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', 'bg-neutral-100 dark:bg-neutral-800')}>
                <s.icon className={cn('w-5 h-5', s.color)} />
              </div>
              <div>
                <p className="text-xs text-neutral-500">{s.label}</p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="primary" size="sm"><Plus className="w-4 h-4" /> 新建激励计划</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INCENTIVE_PROGRAMS.map((p) => (
          <Card key={p.id} hover>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{p.title}</h3>
                <Badge variant={statusVariant(p.status)}>{statusLabel(p.status)}</Badge>
              </div>
              <p className="text-xs text-neutral-500">{p.description}</p>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>{p.startDate} ~ {p.endDate}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <div>
                  <p className="text-[10px] text-neutral-400">总预算</p>
                  <p className="text-xs font-semibold">¥{(p.totalBudget / 10000).toFixed(0)}万</p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400">已申领</p>
                  <p className="text-xs font-semibold">¥{(p.claimedAmount / 10000).toFixed(0)}万</p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400">参与伙伴</p>
                  <p className="text-xs font-semibold">{p.participantsCount}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full">
                查看详情 <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
