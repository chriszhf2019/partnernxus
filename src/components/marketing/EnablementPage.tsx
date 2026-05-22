import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { GraduationCap, Award, AlertTriangle, Users, BookOpen, Clock } from 'lucide-react';

const certifications = [
  { name: '云原生架构师认证', total: 120, certified: 85, expirySoon: 12, level: '高级' },
  { name: '数据平台工程师', total: 200, certified: 142, expirySoon: 8, level: '中级' },
  { name: '安全合规专家', total: 80, certified: 56, expirySoon: 3, level: '高级' },
  { name: 'AI 解决方案顾问', total: 150, certified: 64, expirySoon: 15, level: '中级' },
  { name: '基础销售认证', total: 500, certified: 420, expirySoon: 28, level: '初级' },
];

const expiringPeople = [
  { name: '张伟', partner: '华东医卫云科', cert: '云原生架构师', days: 14 },
  { name: '李娜', partner: '上海智医科技', cert: 'AI 解决方案顾问', days: 21 },
  { name: '王强', partner: '昆仑联通', cert: '安全合规专家', days: 7 },
  { name: '陈明', partner: '精诚中国', cert: '数据平台工程师', days: 30 },
];

export const EnablementPage = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">{t('enablement.title')}</h1>
        <p className="text-sm text-neutral-500 mt-1">{t('enablement.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: GraduationCap, label: '总认证人数', value: '767', sub: '+45 本月' },
          { icon: Award, label: '认证项目', value: '5', sub: '2 高级 / 2 中级 / 1 初级' },
          { icon: AlertTriangle, label: '即将过期', value: '66', sub: '需立即处理' },
          { icon: Users, label: '培训覆盖率', value: '78%', sub: '目标 85%' },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-neutral-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">{s.label}</p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-white">{s.value}</p>
                <p className="text-[11px] text-neutral-400">{s.sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certification Progress */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">认证进度</h3>
          {certifications.map((cert) => (
            <Card key={cert.name}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">{cert.name}</span>
                    <Badge variant={cert.level === '高级' ? 'warning' : 'info'} size="sm">{cert.level}</Badge>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">{cert.certified} / {cert.total} 人已认证</p>
                </div>
                {cert.expirySoon > 0 && (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {cert.expirySoon} 即将过期
                  </span>
                )}
              </div>
              <ProgressBar value={(cert.certified / cert.total) * 100} variant="brand" size="sm" />
            </Card>
          ))}
        </div>

        {/* Expiry Alerts */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            认证过期预警
          </h3>
          <Card>
            <CardContent>
              {expiringPeople.map((p, i) => (
                <div key={i} className={i > 0 ? 'pt-3 border-t border-neutral-100 dark:border-neutral-800 mt-3' : ''}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-neutral-500">{p.partner}</p>
                    </div>
                    <Badge variant="danger">{p.days} 天</Badge>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{p.cert}</p>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-3">查看全部预警</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
