import React from 'react';
import { TrendingUp, TrendingDown, Verified, PlusCircle, Sparkles } from 'lucide-react';
import { Deal } from '../../types';
import { KanbanBoard } from '../deals/KanbanBoard';

interface DashboardProps {
  deals: Deal[];
  onNewDeal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ deals, onNewDeal }) => {
  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-label uppercase tracking-[0.2em] text-on-surface-variant font-semibold text-[10px] mb-2">Transaction Hub</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Deal Registration</h1>
        </div>
        <button 
          onClick={onNewDeal}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="font-bold tracking-tight">Register New Deal</span>
        </button>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <p className="text-on-surface-variant text-sm font-medium mb-1">Total Pipeline Value</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-primary">$14.2M</span>
              <span className="text-xs font-bold text-secondary flex items-center gap-1">+12% <TrendingUp className="w-3 h-3" /></span>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <p className="text-on-surface-variant text-sm font-medium mb-1">Win Rate</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-primary">64.5%</span>
              <span className="text-xs font-bold text-tertiary flex items-center gap-1">-2% <TrendingDown className="w-3 h-3" /></span>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <p className="text-on-surface-variant text-sm font-medium mb-1">Average Deal Cycle</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-primary">82 Days</span>
              <span className="text-xs font-bold text-secondary flex items-center gap-1">Best <Verified className="w-3 h-3" /></span>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard deals={deals} />

      {/* Floating Insights Panel (Glassmorphism) */}
      <div className="fixed bottom-8 right-8 w-80 bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 z-30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold tracking-tight text-primary">Curated Insights</h3>
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="space-y-4">
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-[11px] font-medium leading-relaxed">
              <span className="font-bold text-primary">Negotiation Phase:</span> 3 deals have been stationary for &gt;15 days. Suggest following up with <span className="underline">Prime Partners</span>.
            </p>
          </div>
          <div className="p-3 bg-secondary/5 rounded-lg border border-secondary/10">
            <p className="text-[11px] font-medium leading-relaxed">
              <span className="font-bold text-secondary">Conflict Detected:</span> BioHealth Research matches an existing direct enterprise target. Review required.
            </p>
          </div>
        </div>
        <button className="w-full mt-4 py-2 text-xs font-bold text-primary-container bg-surface-container-high rounded-lg hover:bg-surface-container-highest transition-colors">
          View Full Intelligence Report
        </button>
      </div>
    </div>
  );
};
