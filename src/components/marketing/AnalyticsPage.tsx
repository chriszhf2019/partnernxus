import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const revenueByRegion = [
  { name: '华东', value: 28.5 }, { name: '华南', value: 22.1 }, { name: '华北', value: 18.3 },
  { name: '西部', value: 12.7 }, { name: '华中', value: 10.2 }, { name: '其他', value: 8.2 },
];

const quarterlyTrend = [
  { q: 'Q1', revenue: 28, partners: 850, deals: 320 },
  { q: 'Q2', revenue: 32, partners: 920, deals: 380 },
  { q: 'Q3', revenue: 36, partners: 980, deals: 420 },
  { q: 'Q4', revenue: 42, partners: 1050, deals: 480 },
  { q: 'Q1+1', revenue: 45, partners: 1120, deals: 510 },
  { q: 'Q2+1', revenue: 48, partners: 1180, deals: 540 },
];

const healthScores = [
  { name: '渠道覆盖', score: 85 }, { name: '伙伴活跃', score: 72 },
  { name: '能力建设', score: 64 }, { name: '合作意愿', score: 88 },
  { name: '业绩贡献', score: 78 },
];

const barColors = ['#18181b', '#3f3f46', '#52525b', '#71717a', '#a1a1aa'];

export const AnalyticsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">{t('analytics.title')}</h1>
          <p className="text-sm text-neutral-500 mt-1">{t('analytics.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm"><Calendar className="w-4 h-4" /> 本季度</Button>
          <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> 导出报表</Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '渠道营收', value: '¥4,850万', change: '+12.5%', up: true },
          { label: '活跃伙伴', value: '1,180', change: '+8.3%', up: true },
          { label: '商机转化率', value: '24.8%', change: '-2.1%', up: false },
          { label: '平均客单价', value: '¥8.6万', change: '+5.7%', up: true },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <div>
              <p className="text-xs text-neutral-500">{kpi.label}</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-white mt-1">{kpi.value}</p>
              <span className={`text-xs font-medium ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {kpi.change} vs 上季
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader><CardTitle>季度业绩趋势</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quarterlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="q" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} tickFormatter={(v) => `${v}M`} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#18181b" strokeWidth={2} dot={{ r: 4, fill: '#18181b' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Region Distribution */}
        <Card>
          <CardHeader><CardTitle>区域业绩分布</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByRegion} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} width={50} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                    {revenueByRegion.map((_, i) => <Cell key={i} fill={barColors[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Health */}
      <Card>
        <CardHeader><CardTitle>渠道健康度评分</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {healthScores.map((h) => (
              <div key={h.name} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e4e4e7" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#18181b" strokeWidth="3"
                      strokeDasharray={`${h.score} 100`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{h.score}</span>
                </div>
                <p className="text-xs text-neutral-500">{h.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
