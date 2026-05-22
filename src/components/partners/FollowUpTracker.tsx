import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar,
  ChevronRight,
  Plus,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { FollowUpTask } from '../../types';
import { motion } from 'motion/react';

interface FollowUpTrackerProps {
  tasks: FollowUpTask[];
}

export const FollowUpTracker: React.FC<FollowUpTrackerProps> = ({ tasks }) => {
  const getStatusIcon = (status: FollowUpTask['status']) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Pending': return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  const getPriorityColor = (priority: FollowUpTask['priority']) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Low': return 'text-slate-600 bg-[#f5f5f7] dark:bg-[#2c2c2e] border-slate-100';
    }
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 border border-black/5 dark:border-white/5 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h4 className="text-lg font-black text-black dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-black dark:text-white" /> 会议行动项与跟进 (Action Items)
          </h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Track and manage tasks resulting from JBP and other meetings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-black dark:text-white transition-all border border-black/5 dark:border-white/5 rounded-xl">
            <Filter className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
            <Plus className="w-3.5 h-3.5" /> 新增行动项
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <motion.div 
            key={task.id}
            whileHover={{ x: 4 }}
            className="group flex items-center justify-between p-4 rounded-2xl border border-black/5 hover:border-black/5 dark:border-white/5 hover:bg-slate-50/30 transition-all"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                task.status === 'Completed' ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-100"
              )}>
                {getStatusIcon(task.status)}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <p className={cn(
                    "text-sm font-bold transition-all",
                    task.status === 'Completed' ? "text-slate-400 line-through" : "text-slate-700"
                  )}>
                    {task.title}
                  </p>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-tighter",
                    getPriorityColor(task.priority)
                  )}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3 h-3" /> {task.owner}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> 截止: {task.dueDate}
                  </span>
                  <span className="px-1.5 py-0.5 bg-[#f5f5f7] rounded text-slate-500 uppercase tracking-widest text-[8px]">
                    {task.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-slate-400 hover:text-black dark:text-white rounded-lg transition-all">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full mt-8 py-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] text-slate-500 text-[10px] font-black rounded-xl hover:bg-[#f5f5f7] transition-all uppercase tracking-widest border border-slate-100">
        查看所有历史行动项
      </button>
    </div>
  );
};
