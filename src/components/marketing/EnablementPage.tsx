import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { supabase } from '../../lib/supabase';
import { GraduationCap, Award, AlertTriangle, Users, BookOpen, Clock, Search } from 'lucide-react';

export const EnablementPage = () => {
  const { t } = useLanguage();
  const [programs, setPrograms] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('certification_programs').select('*').order('level').then(({ data }: any) => { if (data) setPrograms(data); });
    supabase.from('partner_certifications').select('*').order('expiry_count', { ascending: false }).then(({ data }: any) => { if (data) setCertifications(data); });
  }, []);

  // Stats computed from real data
  const totalCertified = certifications.reduce((s: number, c: any) => s + (c.certified_count || 0), 0);
  const totalExpiring = certifications.reduce((s: number, c: any) => s + (c.expiry_count || 0), 0);
  const totalTargets = programs.reduce((s: number, p: any) => s + (p.total_target || 0), 0);
  const coverage = totalTargets > 0 ? Math.round((totalCertified / totalTargets) * 100) : 0;

  const filtered = search ? certifications.filter((c: any) =>
    (c.partner_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.program_name || '').toLowerCase().includes(search.toLowerCase())
  ) : certifications;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-neutral-900 dark:text-white">{t('enablement.title')}</h1><p className="text-sm text-neutral-500 mt-1">认证管理与赋能培训</p></div>
        <Button variant="brand" size="sm"><BookOpen className="w-4 h-4" />新建认证计划</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: GraduationCap, label: '总认证人数', value: totalCertified.toString(), sub: `${programs.length} 个认证项目`, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: Award, label: '认证覆盖率', value: `${coverage}%`, sub: `目标 ${totalTargets} 人`, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { icon: AlertTriangle, label: '即将过期', value: totalExpiring.toString(), sub: totalExpiring > 0 ? '需立即处理' : '暂无风险', color: totalExpiring > 0 ? 'text-red-500' : 'text-emerald-500', bg: totalExpiring > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20' },
          { icon: Users, label: '参与伙伴', value: new Set(certifications.map(c => c.partner_id)).size.toString(), sub: `${certifications.length} 条记录`, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              <div><p className="text-xs text-neutral-500">{s.label}</p><p className="text-lg font-semibold text-neutral-900 dark:text-white">{s.value}</p><p className="text-[11px] text-neutral-400">{s.sub}</p></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certification Programs Progress */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">认证项目进度</h3>
          {programs.length === 0 && <p className="text-sm text-neutral-400 py-4">暂无认证项目</p>}
          {programs.map((prog: any) => {
            const progCerts = certifications.filter((c: any) => c.program_id === prog.id);
            const certified = progCerts.reduce((s: number, c: any) => s + (c.certified_count || 0), 0);
            const expiring = progCerts.reduce((s: number, c: any) => s + (c.expiry_count || 0), 0);
            const pct = prog.total_target > 0 ? Math.round((certified / prog.total_target) * 100) : 0;
            return (
              <Card key={prog.id}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">{prog.name}</span>
                      <Badge variant={prog.level === '高级' ? 'warning' : prog.level === '中级' ? 'info' : 'default'} size="sm">{prog.level}</Badge>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{certified} / {prog.total_target} 人已认证 · {progCerts.length} 个伙伴参与</p>
                  </div>
                  {expiring > 0 && <span className="text-xs text-red-500 flex items-center gap-1"><Clock className="w-3 h-3" />{expiring} 即将过期</span>}
                </div>
                <ProgressBar value={pct} variant={pct >= 80 ? 'success' : 'brand'} size="sm" />
              </Card>
            );
          })}
        </div>

        {/* Expiry Alerts + Partner List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />认证过期预警
          </h3>
          <Card>
            <CardContent>
              <div className="relative mb-3">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input className="w-full h-8 pl-7 pr-2 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-xs focus:outline-none" placeholder="搜索伙伴或认证..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              {filtered.filter((c: any) => c.expiry_count > 0).length === 0 && <p className="text-xs text-neutral-400 py-2 text-center">暂无过期风险</p>}
              {filtered.filter((c: any) => c.expiry_count > 0).slice(0, 8).map((c: any, i: number) => (
                <div key={c.id} className={i > 0 ? 'pt-3 border-t border-neutral-100 dark:border-neutral-800 mt-3' : ''}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{c.partner_name || '-'}</p>
                      <p className="text-xs text-neutral-500">{c.program_name}</p>
                    </div>
                    <Badge variant="danger">{c.expiry_count} 人 · {c.expiry_count > 1 ? '14-30天' : '即将'}</Badge>
                  </div>
                </div>
              ))}
              {filtered.filter((c: any) => c.expiry_count === 0).length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <p className="text-xs text-neutral-400 mb-2">认证正常</p>
                  {filtered.filter((c: any) => c.expiry_count === 0).slice(0, 5).map((c: any, i: number) => (
                    <div key={c.id} className="flex items-center justify-between py-1">
                      <span className="text-xs text-neutral-500">{c.partner_name}</span>
                      <span className="text-xs text-emerald-600">{c.certified_count} 认证 · {c.program_name?.slice(0, 8)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
