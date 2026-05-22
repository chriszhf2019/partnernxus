import { useState, useMemo, useDeferredValue } from 'react';
import {
  DollarSign, TrendingUp, MousePointerClick, Activity, ArrowUpRight,
  ArrowDownRight, MoreHorizontal, ExternalLink, Calendar, Download,
  Target, Users, Filter, Globe, Zap,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { Badge } from '../ui/Badge';

// ─── Static data (module scope, not recreated on render) ──
const performanceData = [
  { month: 'Jan', revenue: 42000, spend: 28000, conversions: 1240 },
  { month: 'Feb', revenue: 38000, spend: 25000, conversions: 1100 },
  { month: 'Mar', revenue: 55000, spend: 32000, conversions: 1580 },
  { month: 'Apr', revenue: 48000, spend: 30000, conversions: 1350 },
  { month: 'May', revenue: 65000, spend: 35000, conversions: 1720 },
  { month: 'Jun', revenue: 72000, spend: 38000, conversions: 1890 },
  { month: 'Jul', revenue: 68000, spend: 36000, conversions: 1760 },
  { month: 'Aug', revenue: 85000, spend: 42000, conversions: 2100 },
  { month: 'Sep', revenue: 78000, spend: 40000, conversions: 1950 },
  { month: 'Oct', revenue: 92000, spend: 45000, conversions: 2280 },
  { month: 'Nov', revenue: 88000, spend: 43000, conversions: 2150 },
  { month: 'Dec', revenue: 105000, spend: 48000, conversions: 2600 },
];

const channelData = [
  { id: 1, name: 'Google Ads', type: 'Search', spend: 185000, ctr: 3.2, conversions: 4520, roi: 3.8, status: 'active' as const, trend: 12.5 },
  { id: 2, name: 'Meta Ads', type: 'Social', spend: 142000, ctr: 2.8, conversions: 3850, roi: 2.9, status: 'active' as const, trend: 8.3 },
  { id: 3, name: 'TikTok Ads', type: 'Social', spend: 98000, ctr: 4.1, conversions: 2900, roi: 2.4, status: 'active' as const, trend: 22.1 },
  { id: 4, name: 'LinkedIn Ads', type: 'B2B', spend: 76000, ctr: 1.5, conversions: 980, roi: 4.5, status: 'optimizing' as const, trend: -3.2 },
  { id: 5, name: 'Bing Ads', type: 'Search', spend: 45000, ctr: 2.9, conversions: 1120, roi: 3.1, status: 'active' as const, trend: 5.7 },
  { id: 6, name: 'Programmatic DSP', type: 'Display', spend: 120000, ctr: 1.2, conversions: 2100, roi: 1.8, status: 'optimizing' as const, trend: -1.5 },
  { id: 7, name: 'Email Marketing', type: 'Direct', spend: 28000, ctr: 5.8, conversions: 3400, roi: 8.2, status: 'active' as const, trend: 15.4 },
  { id: 8, name: 'Affiliate Network', type: 'Partner', spend: 55000, ctr: 2.1, conversions: 1680, roi: 3.5, status: 'paused' as const, trend: -8.7 },
];

const sparklineRevenue = performanceData.map((d) => d.revenue / 1000);
const sparklineSpend = performanceData.map((d) => d.spend / 1000);
const sparklineConv = performanceData.map((d) => d.conversions / 10);
const sparklineCh = [12, 14, 13, 15, 14, 16, 18, 17, 19, 18, 20, 21];

const barColors = ['#18181b', '#3f3f46', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8'];

const statusVariants: Record<string, 'success' | 'warning' | 'default'> = {
  active: 'success', optimizing: 'warning', paused: 'default',
};

const quickActions = [
  { icon: Target, labelKey: 'channels.action1', descKey: 'channels.action1Desc' },
  { icon: Users, labelKey: 'channels.action2', descKey: 'channels.action2Desc' },
  { icon: Filter, labelKey: 'channels.action3', descKey: 'channels.action3Desc' },
  { icon: Globe, labelKey: 'channels.action4', descKey: 'channels.action4Desc' },
] as const;

// ─── Sparkline ──────────────────────────────────────────
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 60},${20 - ((v - min) / range) * 16}`).join(' ');
  return (
    <svg width="60" height="20" className="shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * 60} cy={20 - ((data[data.length - 1] - min) / range) * 16} r="2" fill={color} />
    </svg>
  );
};

// ─── Stat Card ──────────────────────────────────────────
const StatCard = ({ title, value, change, icon: Icon, sparklineData, sparklineColor }: {
  title: string; value: string; change: number; icon: typeof DollarSign; sparklineData: number[]; sparklineColor: string;
}) => {
  const isPositive = change >= 0;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <Icon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </div>
        <Sparkline data={sparklineData} color={sparklineColor} />
      </div>
      <div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
        <p className="text-2xl font-semibold text-zinc-900 dark:text-white mt-0.5 tracking-tight">{value}</p>
      </div>
      <div className="flex items-center gap-1">
        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
        <span className={cn('text-xs font-semibold', isPositive ? 'text-emerald-600' : 'text-red-500')}>{isPositive ? '+' : ''}{change}%</span>
        <span className="text-xs text-zinc-400 ml-1">vs last month</span>
      </div>
    </div>
  );
};

// ─── Channel Dashboard ──────────────────────────────────
export const ChannelDashboard = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('thisMonth');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);

  const stats = useMemo(() => {
    const totalRevenue = performanceData.reduce((s, d) => s + d.revenue, 0);
    const totalSpend = performanceData.reduce((s, d) => s + d.spend, 0);
    const totalConversions = performanceData.reduce((s, d) => s + d.conversions, 0);
    const roi = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(1) : '0';
    const activeCount = channelData.filter((c) => c.status === 'active').length;
    return {
      totalSpend: `$${(totalSpend / 1000).toFixed(0)}K`, roi: `${roi}x`,
      conversions: totalConversions.toLocaleString(), activeChannels: activeCount.toString(),
      spendChange: 8.2, roiChange: 5.4, convChange: 12.8, chChange: -2.1,
    };
  }, []);

  const filteredChannels = useMemo(() => {
    if (!deferredSearch.trim()) return channelData;
    const s = deferredSearch.toLowerCase();
    return channelData.filter((c) => c.name.toLowerCase().includes(s) || c.type.toLowerCase().includes(s));
  }, [deferredSearch]);

  const filters = ['thisMonth', 'lastMonth', 'thisQuarter', 'thisYear'] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">{t('channels.title')}</h1>
          <p className="text-sm text-zinc-500 mt-1">{t('channels.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="text" placeholder={t('channels.search')} value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 h-9 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 transition-all dark:text-white" />
          <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Calendar className="w-3.5 h-3.5" /> {t('channels.dateRange')}
          </button>
          <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Download className="w-3.5 h-3.5" /> {t('channels.export')}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 w-fit">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all', filter === f ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white')}>
            {t(`channels.filter.${f}`)}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('channels.totalSpend')} value={stats.totalSpend} change={stats.spendChange} icon={DollarSign} sparklineData={sparklineSpend} sparklineColor="#71717a" />
        <StatCard title={t('channels.roi')} value={stats.roi} change={stats.roiChange} icon={TrendingUp} sparklineData={sparklineRevenue} sparklineColor="#18181b" />
        <StatCard title={t('channels.conversions')} value={stats.conversions} change={stats.convChange} icon={MousePointerClick} sparklineData={sparklineConv} sparklineColor="#52525b" />
        <StatCard title={t('channels.activeChannels')} value={stats.activeChannels} change={stats.chChange} icon={Activity} sparklineData={sparklineCh} sparklineColor="#a1a1aa" />
      </div>

      {/* Main Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{t('channels.chartTitle')}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{t('channels.chartSubtitle')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 dark:bg-white" />
              <span className="text-[11px] font-medium text-zinc-500">{t('channels.revenue')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
              <span className="text-[11px] font-medium text-zinc-500">{t('channels.spend')}</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#18181b" stopOpacity={0.12} /><stop offset="100%" stopColor="#18181b" stopOpacity={0} /></linearGradient>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a1a1aa" stopOpacity={0.08} /><stop offset="100%" stopColor="#a1a1aa" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 500, fill: '#a1a1aa' }} dy={8} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 500, fill: '#a1a1aa' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} dx={-4} />
              <Tooltip contentStyle={{ fontSize: 12, fontWeight: 500, borderRadius: 12, border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', padding: '10px 14px' }} formatter={(value: number) => [`$${(value / 1000).toFixed(0)}K`, '']} />
              <Area type="monotone" dataKey="spend" stroke="#a1a1aa" strokeWidth={2} fill="url(#spendGrad)" dot={false} />
              <Area type="monotone" dataKey="revenue" stroke="#18181b" strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Table + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{t('channels.tableTitle')}</h3>
            <button className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">
              {t('channels.viewAll')} <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('channels.colChannel')}</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('channels.colSpend')}</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('channels.colCtr')}</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('channels.colConversions')}</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('channels.colRoi')}</th>
                  <th className="px-5 py-3 text-center text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('channels.colStatus')}</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('channels.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredChannels.map((ch) => (
                  <tr key={ch.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{ch.name}</p>
                      <p className="text-xs text-zinc-400">{ch.type}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">${(ch.spend / 1000).toFixed(0)}K</td>
                    <td className="px-5 py-3.5 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">{ch.ctr}%</td>
                    <td className="px-5 py-3.5 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">{ch.conversions.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={cn('text-sm font-semibold', ch.roi >= 3 ? 'text-emerald-600' : ch.roi >= 2 ? 'text-amber-600' : 'text-red-500')}>{ch.roi}x</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge variant={statusVariants[ch.status]} size="sm">{t(`channels.status.${ch.status}`)}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spend Distribution Sidebar */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">{t('channels.distribution')}</h3>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 500, fill: '#a1a1aa' }} width={80} />
                <Bar dataKey="spend" radius={[0, 4, 4, 0]} barSize={12}>
                  {channelData.slice(0, 6).map((_, i) => <Cell key={i} fill={barColors[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {channelData.slice(0, 5).map((ch) => (
              <div key={ch.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white" />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate max-w-[100px]">{ch.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-white">${(ch.spend / 1000).toFixed(0)}K</span>
                  <span className={cn('text-[10px] font-medium', ch.trend >= 0 ? 'text-emerald-600' : 'text-red-500')}>{ch.trend >= 0 ? '+' : ''}{ch.trend}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((item, i) => (
          <button key={i} className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-left hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
            <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-white transition-colors">
              <item.icon className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-zinc-900" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{t(item.labelKey)}</p>
              <p className="text-xs text-zinc-500">{t(item.descKey)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
