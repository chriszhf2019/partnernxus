import { useState, useMemo, useDeferredValue, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Upload, Pencil, Trash2, MapPin, Phone, CheckCircle2, XCircle, X, CheckSquare } from 'lucide-react';
import { Partner, PartnerStatus, PartnerTier } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import { ImportModal } from './ImportModal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { TIER_STYLES, TYPE_LABELS, STATUS_CONFIG } from '../../lib/partner-labels';
import { partnerService } from '../../services/partner-service';
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
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | 'All'>('All');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [showImport, setShowImport] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'pending'>('all');
  const [approvePartner, setApprovePartner] = useState<Partner | null>(null);
  const [approvalForm, setApprovalForm] = useState({ tier: 'Gold' as PartnerTier, status: 'Cooperating' as PartnerStatus, tags: '', manager: '' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const isAdmin = role === 'admin';
  const isInternal = ['admin', 'channel_director', 'channel_manager', 'marketing_director', 'marketing_manager', 'sales_director', 'sales_manager'].includes(role);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await partnerService.list();
      if (onImport) onImport(result.items, 'replace');
    } catch { /* keep current state */ }
    setRefreshing(false);
  }, [onImport]);

  const pendingCount = partners.filter((p) => p.status === 'Prospective').length;

  const toggleSelect = (id: string) => {
    setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const toggleAll = () => {
    if (selected.size === pagedPartners.length) setSelected(new Set());
    else setSelected(new Set(pagedPartners.map((p) => p.id)));
  };

  const filteredPartners = useMemo(() => {
    let result = partners;
    if (tab === 'pending') { result = result.filter((p) => p.status === 'Prospective'); }
    else {
      if (deferredSearch.trim()) {
        const s = deferredSearch.toLowerCase();
        result = result.filter((p) => p.name.toLowerCase().includes(s) || (p.manager || '').toLowerCase().includes(s) || (p.tags || []).some((t) => t.toLowerCase().includes(s)));
      }
      if (statusFilter !== 'All') result = result.filter((p) => p.status === statusFilter);
      if (tierFilter !== 'All') result = result.filter((p) => p.tier === tierFilter);
      if (typeFilter !== 'All') result = result.filter((p) => p.type === typeFilter);
    }
    return result;
  }, [partners, deferredSearch, statusFilter, tierFilter, typeFilter, tab]);

  const totalPages = Math.max(1, Math.ceil(filteredPartners.length / ITEMS_PER_PAGE));
  const pagedPartners = filteredPartners.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const partnerTypes = useMemo(() => [...new Set(partners.map((p) => p.type))], [partners]);
  const startRecord = filteredPartners.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const endRecord = Math.min(page * ITEMS_PER_PAGE, filteredPartners.length);

  const filterBtn = (active: boolean, onClick: () => void, label: string) => (
    <button onClick={onClick} className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all', active ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800')}>{label}</button>
  );

  // ── Approve / Reject / Delete handlers ─────────────────
  const handleApprove = async () => {
    if (!approvePartner) return;
    try {
      await partnerService.approve(approvePartner.id, {
        tier: approvalForm.tier, status: approvalForm.status,
        manager: approvalForm.manager,
        tags: approvalForm.tags.split(',').map((s: string) => s.trim()).filter(Boolean),
      }, user?.email || 'admin');
      toast('success', `「${approvePartner.name}」已批复`);
      setApprovePartner(null);
      await refresh();
    } catch (err: any) { toast('error', `批复失败: ${err.message}`); }
  };
  const handleReject = async (partner: Partner) => {
    try {
      await partnerService.reject(partner.id, user?.email || 'admin');
      toast('success', `「${partner.name}」已驳回`);
      await refresh();
    } catch (err: any) { toast('error', `驳回失败: ${err.message}`); }
  };
  const handleDeletePartner = async () => {
    if (!deleteId) return;
    try {
      await partnerService.delete(deleteId, user?.email || 'admin');
      toast('success', '已删除');
      setDeleteId(null);
      await refresh();
    } catch (err: any) { toast('error', `删除失败: ${err.message}`); }
  };
  const handleBatchApprove = async () => {
    try {
      await partnerService.batchApprove([...selected], {
        tier: 'Gold', status: 'Cooperating', manager: '', tags: [],
      }, user?.email || 'admin');
      toast('success', `已批量批复 ${selected.size} 个合作伙伴`);
      setSelected(new Set());
      await refresh();
    } catch (err: any) { toast('error', `批量批复失败: ${err.message}`); }
  };
  const handleBatchReject = async () => {
    try {
      await partnerService.batchReject([...selected], user?.email || 'admin');
      toast('success', `已批量驳回 ${selected.size} 个合作伙伴`);
      setSelected(new Set());
      await refresh();
    } catch (err: any) { toast('error', `批量驳回失败: ${err.message}`); }
  };

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

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
          <button onClick={() => setTab('all')} className={cn('px-4 py-1.5 rounded-md text-xs font-medium transition-all', tab === 'all' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500')}>全部</button>
          <button onClick={() => setTab('pending')} className={cn('px-4 py-1.5 rounded-md text-xs font-medium transition-all', tab === 'pending' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500')}>待批复 {pendingCount > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px]">{pendingCount}</span>}</button>
        </div>
      </div>

      {/* Batch Actions */}
      {selected.size > 0 && isInternal && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl">
          <span className="text-sm font-medium text-brand-700 dark:text-brand-300">已选 {selected.size} 项</span>
          {tab === 'pending' && (
            <>
              <Button variant="brand" size="sm" onClick={handleBatchApprove}><CheckCircle2 className="w-3.5 h-3.5" />批量批复</Button>
              <Button variant="danger" size="sm" onClick={handleBatchReject}><XCircle className="w-3.5 h-3.5" />批量驳回</Button>
            </>
          )}
          <button className="ml-auto text-xs text-neutral-400 hover:text-neutral-600" onClick={() => setSelected(new Set())}>取消选择</button>
        </div>
      )}

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
                  {isInternal && <th className="px-4 py-3.5 w-10"><input type="checkbox" checked={selected.size === pagedPartners.length && pagedPartners.length > 0} onChange={toggleAll} className="rounded" /></th>}
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
                  const primary = (partner.contacts || []).find((c) => c.isPrimary) || (partner.contacts || [])[0];
                  const tierStyle = TIER_STYLES[partner.tier] || TIER_STYLES.Registered;
                  const statusCfg = STATUS_CONFIG[partner.status];
                  return (
                    <tr key={partner.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                      {isInternal && <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selected.has(partner.id)} onChange={() => toggleSelect(partner.id)} className="rounded" /></td>}
                      <td className="px-6 py-4 cursor-pointer" onClick={() => onSelectPartner(partner.id)}>
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
                          {tab === 'pending' && isInternal ? (
                            <>
                              <Button variant="brand" size="sm" onClick={() => { setApprovePartner(partner); setApprovalForm({ tier: 'Gold' as PartnerTier, status: 'Cooperating' as PartnerStatus, tags: '', manager: '' }); }}>
                                <CheckCircle2 className="w-3.5 h-3.5" />批复
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleReject(partner)}>
                                <XCircle className="w-3.5 h-3.5" />驳回
                              </Button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => onSelectPartner(partner.id)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-brand transition-colors" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                              {isAdmin && <button onClick={() => setDeleteId(partner.id)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-500 transition-colors" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>}
                            </>
                          )}
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
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDeletePartner}
        title="确认删除" description="确定要删除此合作伙伴吗？此操作不可撤销。" confirmLabel="删除" variant="danger" />

      {/* ── Approval Modal ─────────────────── */}
      {approvePartner && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setApprovePartner(null)}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">批复合作伙伴</h3>
              <button onClick={() => setApprovePartner(null)} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-neutral-500 mb-4">批复「{approvePartner.name}」的申请</p>
            <div className="space-y-3">
              <Select label="合作伙伴等级" options={(config?.partnerTiers || ['Platinum','Gold','Silver','Registered']).map(v=>({value:v,label:v}))} value={approvalForm.tier} onChange={(e) => setApprovalForm({...approvalForm, tier: e.target.value as PartnerTier})} />
              <Select label="合作伙伴状态" options={(config?.partnerStatuses || ['Cooperating','Inactive','Prospective']).map(v=>({value:v,label:v==='Cooperating'?'合作中':v==='Inactive'?'已过期':'潜在'}))} value={approvalForm.status} onChange={(e) => setApprovalForm({...approvalForm, status: e.target.value as PartnerStatus})} />
              <Input label="渠道经理" value={approvalForm.manager} onChange={(e) => setApprovalForm({...approvalForm, manager: e.target.value})} placeholder="指派渠道经理" />
              <Input label="标签（逗号分隔）" value={approvalForm.tags} onChange={(e) => setApprovalForm({...approvalForm, tags: e.target.value})} placeholder="如：信创,医疗,华北" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setApprovePartner(null)}>取消</Button>
              <Button variant="danger" size="sm" onClick={() => { setApprovePartner(null); handleReject(approvePartner); }}><XCircle className="w-4 h-4" />驳回</Button>
              <Button variant="brand" size="sm" onClick={handleApprove}><CheckCircle2 className="w-4 h-4" />批复通过</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
