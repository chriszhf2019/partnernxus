import React from 'react';
import { Calendar, Users, Star, AlertTriangle, MoreHorizontal } from 'lucide-react';
import { Deal } from '../../types';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface DealCardProps {
  deal: Deal;
}

export const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const isClosedWon = deal.status === 'Closed Won';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-5 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden",
        isClosedWon 
          ? "bg-surface-container-lowest border-secondary-container grayscale opacity-70 hover:grayscale-0 hover:opacity-100"
          : deal.isPriority 
            ? "bg-tertiary-fixed/10 border-tertiary" 
            : "bg-surface-container-lowest border-black dark:border-white"
      )}
    >
      {deal.isPriority && (
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <AlertTriangle className="w-10 h-10 fill-current" />
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-on-surface leading-tight">{deal.title}</h4>
        <div className="flex gap-1">
          {deal.hasConflict && (
            <span className="text-[10px] font-bold text-on-secondary-container bg-secondary-container/20 px-2 py-0.5 rounded uppercase">Conflict</span>
          )}
          {deal.isPriority && (
            <span className="text-[10px] font-bold text-white bg-tertiary px-2 py-0.5 rounded uppercase">Priority</span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-on-surface-variant">Value</span>
          <span className="font-bold text-on-surface">${deal.value.toLocaleString()}</span>
        </div>
        {!isClosedWon && (
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant">Partner</span>
            <span className="font-bold text-secondary">{deal.partnerName}</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span className="text-on-surface-variant">Created</span>
          <span className="font-bold text-on-surface">{deal.createdDate}</span>
        </div>
      </div>

      {deal.hasConflict && !isClosedWon && (
        <div className="bg-tertiary-fixed text-[10px] p-2 rounded mb-4 font-semibold text-on-tertiary-fixed flex items-center gap-2">
          <AlertTriangle className="w-3 h-3" />
          Potential Conflict: Direct Account
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-surface-container">
        {isClosedWon ? (
          <>
            <span className="text-[10px] font-bold text-secondary-container uppercase">Won • {deal.endDate}</span>
            <Star className="w-5 h-5 text-secondary-container fill-current" />
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-on-surface-variant">
              <Calendar className="w-3 h-3" />
              {deal.endDate}
            </div>
            <div className="flex -space-x-2">
              {/* Team avatars removed or replaced with salesName */}
              <div className="w-5 h-5 rounded-full border-2 border-white bg-black dark:bg-white flex items-center justify-center text-[8px] text-white font-black">
                {deal.salesName.charAt(0)}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

interface KanbanBoardProps {
  deals: Deal[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ deals }) => {
  const stages: { id: Deal['status']; label: string; color: string }[] = [
    { id: 'Pending', label: 'Pending', color: 'bg-amber-500' },
    { id: 'Approved', label: 'Approved', color: 'bg-[#f5f5f7]0' },
    { id: 'Converted', label: 'Converted', color: 'bg-black dark:bg-white' },
    { id: 'Closed Won', label: 'Closed Won', color: 'bg-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {stages.map((stage) => (
        <div key={stage.id} className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", stage.color)}></div>
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">{stage.label}</h3>
              <span className="text-[10px] bg-surface-container-high px-2 py-0.5 rounded-full font-bold">
                {deals.filter(d => d.status === stage.id).length.toString().padStart(2, '0')}
              </span>
            </div>
            <MoreHorizontal className="text-on-surface-variant w-5 h-5 cursor-pointer" />
          </div>
          <div className="space-y-4">
            {deals
              .filter((deal) => deal.status === stage.id)
              .map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
