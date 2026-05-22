import { useState, useMemo, useDeferredValue, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Upload, Pencil, Trash2, MapPin, Phone } from 'lucide-react';
import { Partner, PartnerStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useConfig } from '../../contexts/ConfigContext';
import { ImportModal } from './ImportModal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { TIER_STYLES, TYPE_LABELS, STATUS_CONFIG } from '../../lib/partner-labels';
import { cn } from '../../lib/utils';

interface PartnerListProps {
  partners: Partner[];
  onSelectPartner: (partnerId: string) => void;
  onImport?: (partners: Partner[], mode: 'replace' | 'merge') => void;
}

const ITEMS_PER_PAGE = 10;

export const PartnerList = ({ partners, onSelectPartner, onImport }: PartnerListProps) => {
  const { t } = useLanguage();
  const { config } = useConfig();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | 'All'>('All');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [showImport, setShowImport] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredPartners = useMemo(() => {
    let result = partners;
    if (deferredSearch.trim()) {
      const s = deferredSearch.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(s) || p.manager.toLowerCase().includes(s) || p.tags.some((t) => t.toLowerCase().includes(s)));
    }
    if (statusFilter !== 'All') result = result.filter((p) => p.status === statusFilter);
    if (tierFilter !== 'All') result = result.filter((p) => p.tier === tierFilter);
    if (typeFilter !== 'All') result = result.filter((p) => p.type === typeFilter);
    return result;
  }, [partners, deferredSearch, statusFilter, tierFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPartners.length / ITEMS_PER_PAGE));
  const pagedPartners = filteredPartners.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const partnerTypes = useMemo(() => [...new Set(partners.map((p) => p.type))], [partners]);
  const startRecord = filteredPartners.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const endRecord = Math.min(page * ITEMS_PER_PAGE, filteredPartners.length);

  const filterBtn = (active: boolean, onClick: () => void, label: string) => (
    <button onClick={onClick} className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all', active ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800')}>{label}</button>
  );

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">{t('partners.title')}</h1>
          <p className="text-sm text-neutral-500 mt-1">{t('partners.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" placeholder={t('partners.search')} value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-72 h-9 pl-9 pr-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand dark:text-white transition-all" />
          </div>
          {onImport && (
            <Button variant="secondary" size="md" onClick={() => setShowImport(true)}>
              <Upload className="w-4 h-4" /> Import
            </Button>
          )}
          <Button variant="brand" size="md" onClick={() => navigate('/partners/new')}>
            {t('partners.add')}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Status</span>
        <div className="flex gap-1">{(['All', 'Cooperating', 'Inactive', 'Prospective'] as const).map((s) => filterBtn(statusFilter === s, () => { setStatusFilter(s); setPage(1); }, s === 'All' ? '全部' : STATUS_CONFIG[s].label))}</div>
        <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700" />
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Tier</span>
        <div className="flex gap-1">{['All', ...config.partnerTiers].map((t) => filterBtn(tierFilter === t, () => { setTierFilter(t); setPage(1); }, t === 'All' ? '全部' : t))}</div>
        <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700" />
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Type</span>
        <div className="flex gap-1">{['All', ...partnerTypes].map((t) => filterBtn(typeFilter === t, () => { setTypeFilter(t); setPage(1); }, t === 'All' ? '全部' : TYPE_LABELS[t] || t))}</div>
        <span className="ml-auto text-xs text-neutral-400">{filteredPartners.length} partners</span>
      </div>

      {/* Table */}
      {pagedPartners.length === 0 ? (
        <EmptyState title="没有找到合作伙伴" description="尝试调整搜索条件或筛选器" />
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">合作伙伴名称</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">类型</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">等级</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">加入日期</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">联系人</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {pagedPartners.map((partner) => {
                  const primary = partner.contacts.find((c) => c.isPrimary) || partner.contacts[0];
                  const tierStyle = TIER_STYLES[partner.tier] || TIER_STYLES.Registered;
                  const statusCfg = STATUS_CONFIG[partner.status];
                  return (
                    <tr key={partner.id} onClick={() => onSelectPartner(partner.id)}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-50 to-blue-100 dark:from-brand-900/30 dark:to-blue-900/30 flex items-center justify-center shrink-0 text-xs font-semibold text-brand-600 dark:text-brand-300">
                            {partner.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-brand dark:group-hover:text-brand-light transition-colors">{partner.name}</p>
                            <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{partner.location || partner.region}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-300">{TYPE_LABELS[partner.type] || partner.type}</td>
                      <td className="px-6 py-4">
                        <span className={cn('inline-flex px-2 py-0.5 rounded-md text-xs font-medium border', tierStyle)}>{partner.tier}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{partner.startDate || '-'}</td>
                      <td className="px-6 py-4"><Badge variant={statusCfg?.variant || 'default'} size="md">{statusCfg?.label || partner.status}</Badge></td>
                      <td className="px-6 py-4">
                        {primary ? (
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">{primary.lastName}{primary.firstName}</p>
                            <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{primary.phone || primary.mobile || '-'}</p>
                          </div>
                        ) : <span className="text-sm text-neutral-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => onSelectPartner(partner.id)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-brand transition-colors" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(partner.id)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-500 transition-colors" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
            <span className="text-xs text-neutral-500">显示第 {startRecord} 到 {endRecord} 条，总共 {filteredPartners.length} 条记录</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="h-8 px-3 rounded-md text-xs font-medium border border-neutral-200 dark:border-neutral-700 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">上一页</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) { pageNum = i + 1; }
                else if (page <= 4) { pageNum = i + 1; }
                else if (page >= totalPages - 3) { pageNum = totalPages - 6 + i; }
                else { pageNum = page - 3 + i; }
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)}
                    className={cn('w-8 h-8 rounded-md text-xs font-medium transition-all', page === pageNum ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400')}>{pageNum}</button>
                );
              })}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="h-8 px-3 rounded-md text-xs font-medium border border-neutral-200 dark:border-neutral-700 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">下一页</button>
            </div>
          </div>
        </div>
      )}

      <ImportModal isOpen={showImport} onClose={() => setShowImport(false)}
        onImport={(imported, mode) => { onImport?.(imported, mode); setShowImport(false); }} />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) setDeleteId(null); }}
        title="确认删除" description="确定要删除此合作伙伴吗？此操作不可撤销。" confirmLabel="删除" variant="danger" />
    </div>
  );
};
