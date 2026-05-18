import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  Calendar,
  User,
  Users,
  Tag,
  MapPin,
  MoreHorizontal,
  ArrowRight,
  Zap,
  TrendingUp
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Deal, DealRegistrationStats, DealStatus } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';

interface DealRegistrationPageProps {
  stats: DealRegistrationStats;
  deals: Deal[];
  onNewDeal: () => void;
  onDealUpdate?: (updatedDeal: Deal) => void;
}

export const DealRegistrationPage: React.FC<DealRegistrationPageProps> = ({ stats, deals, onNewDeal, onDealUpdate }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    region: 'All',
    status: 'All',
    productType: 'All',
    partnerType: 'All'
  });

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           deal.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           deal.partnerName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = activeTab === 'all' ? true : deal.status === 'Pending';
      const matchesRegion = filters.region === 'All' || deal.region === filters.region;
      const matchesStatus = filters.status === 'All' || deal.status === filters.status;
      const matchesProduct = filters.productType === 'All' || deal.productType === filters.productType;
      const matchesPartnerType = filters.partnerType === 'All' || deal.partnerType === filters.partnerType;

      return matchesSearch && matchesTab && matchesRegion && matchesStatus && matchesProduct && matchesPartnerType;
    });
  }, [deals, searchQuery, activeTab, filters]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(value);
  };

  const getStatusBadge = (status: DealStatus) => {
    switch (status) {
      case 'Pending': return <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[10px] font-black uppercase tracking-tighter flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      case 'Approved': return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-black uppercase tracking-tighter flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case 'Rejected': return <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[10px] font-black uppercase tracking-tighter flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      case 'Converted': return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-black uppercase tracking-tighter flex items-center gap-1"><Zap className="w-3 h-3" /> Converted</span>;
      default: return <span className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-100 rounded text-[10px] font-black uppercase tracking-tighter">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Dashboard Header */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: t('deals.yearNew'), value: stats.yearNew, color: 'text-slate-900', icon: Calendar },
          { label: t('deals.quarterNew'), value: stats.quarterNew, color: 'text-blue-600', icon: TrendingUp },
          { label: t('deals.monthNew'), value: stats.monthNew, color: 'text-primary', icon: Clock },
          { label: t('deals.weekNew'), value: stats.weekNew, color: 'text-emerald-600', icon: Plus },
          { label: t('deals.rejected'), value: stats.rejected, color: 'text-red-500', icon: XCircle },
          { label: t('deals.closed'), value: stats.closed, color: 'text-slate-500', icon: CheckCircle2 },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <stat.icon className="w-3 h-3" /> {stat.label}
            </p>
            <h3 className={cn("text-xl font-black tracking-tight", stat.color)}>{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl">
            <button 
              onClick={() => setActiveTab('all')}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {t('deals.allTab')}
            </button>
            <button 
              onClick={() => setActiveTab('pending')}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'pending' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {t('deals.pendingTab')} <span className="w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center text-[8px]">{deals.filter(d => d.status === 'Pending').length}</span>
            </button>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索项目、客户或合作伙伴..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all border border-slate-100">
              <Filter className="w-4 h-4" />
            </button>
            <button 
              onClick={onNewDeal}
              className="px-6 py-2.5 bg-primary text-white text-xs font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> {t('deals.add')}
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-50 flex items-center gap-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">区域:</span>
            <select 
              className="bg-transparent text-[10px] font-bold text-slate-600 focus:outline-none"
              onChange={(e) => setFilters({...filters, region: e.target.value})}
            >
              <option>All</option>
              <option>华东</option>
              <option>华北</option>
              <option>华南</option>
              <option>西部</option>
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">产品类型:</span>
            <select 
              className="bg-transparent text-[10px] font-bold text-slate-600 focus:outline-none"
              onChange={(e) => setFilters({...filters, productType: e.target.value})}
            >
              <option>All</option>
              <option>云原生平台</option>
              <option>大数据平台</option>
              <option>AI 智算平台</option>
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">伙伴类型:</span>
            <select 
              className="bg-transparent text-[10px] font-bold text-slate-600 focus:outline-none"
              onChange={(e) => setFilters({...filters, partnerType: e.target.value})}
            >
              <option>All</option>
              <option>ISV</option>
              <option>VAR</option>
              <option>SI</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">项目信息</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">合作伙伴</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">销售信息</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">金额/周期</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">状态</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDeals.map((deal) => (
                <tr key={deal.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{deal.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                        <User className="w-3 h-3" /> {deal.customer}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700">{deal.partnerName}</p>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[8px] font-black text-slate-500 uppercase tracking-widest">{deal.partnerType}</span>
                        <span className="text-[8px] font-bold text-slate-400 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {deal.region}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700">{deal.salesName}</p>
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                        <Users className="w-3 h-3" /> {deal.salesTeam}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900">{formatCurrency(deal.value)}</p>
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> {deal.createdDate} - {deal.endDate}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {getStatusBadge(deal.status)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSelectedDeal(deal)}
                        className="p-2 text-slate-400 hover:text-primary transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deal Detail Modal */}
      <AnimatePresence>
        {selectedDeal && (
          <DealDetailModal
            deal={selectedDeal}
            onClose={() => setSelectedDeal(null)}
            onDealUpdate={(updated) => {
              onDealUpdate?.(updated);
              setSelectedDeal(updated);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface DealDetailModalProps {
  deal: Deal;
  onClose: () => void;
  onDealUpdate?: (deal: Deal) => void;
}

const DealDetailModal: React.FC<DealDetailModalProps> = ({ deal, onClose, onDealUpdate }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <FileText className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{deal.title}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deal Registration ID: {deal.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
          >
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex gap-8">
          {/* Left: Info */}
          <div className="flex-1 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">最终客户</p>
                <p className="text-lg font-black text-slate-900">{deal.customer}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">预估金额</p>
                <p className="text-lg font-black text-primary">{formatCurrency(deal.value)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">合作伙伴</p>
                <p className="text-sm font-bold text-slate-700">{deal.partnerName} ({deal.partnerType})</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">产品类型</p>
                <p className="text-sm font-bold text-slate-700">{deal.productType}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">全生命周期跟踪 (Lifecycle)</h4>
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                {deal.lifecycle.map((event, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className={cn(
                      "absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center",
                      idx === 0 ? "bg-primary" : "bg-slate-200"
                    )}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-black text-slate-900">{event.stage}</p>
                        <span className="text-[10px] font-bold text-slate-400">{event.date}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{event.description} • 操作人: {event.actor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="w-72 space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">管理操作</h5>
              {deal.status === 'Pending' && (
                <div className="space-y-2">
                  <button
                    onClick={() => onDealUpdate?.({ ...deal, status: 'Approved', lifecycle: [...deal.lifecycle, { stage: 'Approved', date: new Date().toISOString().split('T')[0], description: '渠道经理审批通过', actor: 'Alex Rivera' }] })}
                    className="w-full py-3 bg-emerald-600 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-100 hover:scale-105 transition-all"
                  >
                    批复通过 (Approve)
                  </button>
                  <button
                    onClick={() => onDealUpdate?.({ ...deal, status: 'Rejected', lifecycle: [...deal.lifecycle, { stage: 'Rejected', date: new Date().toISOString().split('T')[0], description: '渠道经理拒绝报备', actor: 'Alex Rivera' }] })}
                    className="w-full py-3 bg-white border border-red-200 text-red-500 text-xs font-black rounded-xl hover:bg-red-50 transition-all"
                  >
                    拒绝报备 (Reject)
                  </button>
                </div>
              )}
              {deal.status === 'Approved' && (
                <button
                  onClick={() => onDealUpdate?.({ ...deal, status: 'Converted', lifecycle: [...deal.lifecycle, { stage: 'Converted', date: new Date().toISOString().split('T')[0], description: '转换为正式商机', actor: 'Alex Rivera' }] })}
                  className="w-full py-3 bg-blue-600 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-100 hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  转换为商机 (Convert to Opp) <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button className="w-full py-3 bg-white border border-slate-200 text-slate-600 text-xs font-black rounded-xl hover:bg-slate-50 transition-all">
                修改报备信息
              </button>
            </div>

            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="flex gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">冲突检测</p>
                  <p className="text-[10px] text-amber-800/70 leading-relaxed">
                    {deal.hasConflict ? '检测到该客户已有存量商机报备，请仔细核对报备规则。' : '未检测到明显的存量商机冲突。'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
          >
            关闭详情
          </button>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-slate-900 text-white text-xs font-black rounded-xl shadow-lg hover:scale-105 transition-all">
              打印报备单
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
