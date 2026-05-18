import React, { useState } from 'react';
import {
  Search,
  Filter,
  ChevronRight,
  MoreHorizontal,
  ExternalLink,
  Calendar,
  MapPin,
  User,
  ShieldCheck,
  Clock,
  Upload,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Partner, PartnerTier, PartnerStatus } from '../../types';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useConfig } from '../../contexts/ConfigContext';
import { ImportModal } from './ImportModal';

interface PartnerListProps {
  partners: Partner[];
  onSelectPartner: (partnerId: string) => void;
  onImport?: (partners: Partner[], mode: 'replace' | 'merge') => void;
}

export const PartnerList: React.FC<PartnerListProps> = ({ partners, onSelectPartner, onImport }) => {
  const { t } = useLanguage();
  const { config } = useConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | 'All'>('All');
  const [tierFilter, setTierFilter] = useState<string | 'All'>('All');
  const [showImport, setShowImport] = useState(false);

  const filteredPartners = partners.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesTier = tierFilter === 'All' || p.tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Diamond': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Platinum': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Gold': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Silver': return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'Registered': return 'bg-slate-50 text-slate-500 border-slate-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusColor = (status: PartnerStatus) => {
    switch (status) {
      case 'Cooperating': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Inactive': return 'bg-red-50 text-red-700 border-red-100';
      case 'Prospective': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusLabel = (status: PartnerStatus) => {
    switch (status) {
      case 'Cooperating': return '已合作';
      case 'Inactive': return '不合作';
      case 'Prospective': return '未正式合作';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{t('partners.title')}</h1>
          <p className="text-slate-400 text-sm font-bold opacity-80 uppercase tracking-widest">{t('partners.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索伙伴名称或负责人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all">
            <Filter className="w-5 h-5" />
          </button>
          {onImport && (
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              导入 Excel
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">合作状态:</span>
          <div className="flex gap-1.5">
            {['All', 'Cooperating', 'Inactive', 'Prospective'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as any)}
                className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-bold transition-all border",
                  statusFilter === s 
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                )}
              >
                {s === 'All' ? '全部' : getStatusLabel(s as PartnerStatus)}
              </button>
            ))}
          </div>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-2"></div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">伙伴级别:</span>
          <div className="flex gap-1.5">
            {['All', ...config.partnerTiers].map(t => (
              <button
                key={t}
                onClick={() => setTierFilter(t as any)}
                className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-bold transition-all border",
                  tierFilter === t 
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                )}
              >
                {t === 'All' ? '全部' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">伙伴名称</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">区域</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">级别 / 类型</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">状态</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">合作时间</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">联系人</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPartners.map((partner) => (
                <motion.tr 
                  key={partner.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                        {partner.logo ? (
                          <img src={partner.logo} alt={partner.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{partner.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3" /> {partner.manager}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-xs font-bold text-slate-600">{partner.region}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{partner.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-black border w-fit",
                        getTierColor(partner.tier)
                      )}>
                        {partner.tier}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {partner.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-black border",
                      getStatusColor(partner.status)
                    )}>
                      {getStatusLabel(partner.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-xs font-bold text-slate-600">{partner.startDate}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 合作 {partner.years} 年
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-600">
                      {partner.contacts.length > 0 ? `${partner.contacts.length} 人` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onSelectPartner(partner.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                    >
                      查看详情 <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPartners.length === 0 && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
              <Search className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-slate-900 font-black text-lg">未找到匹配伙伴</h3>
            <p className="text-slate-400 text-sm">尝试调整搜索词或筛选条件</p>
          </div>
        )}

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400">共显示 {filteredPartners.length} 家合作伙伴</p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
            <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={(partners, mode) => {
          onImport?.(partners, mode);
          setShowImport(false);
        }}
      />
    </div>
  );
};
