import React from 'react';
import { Target } from 'lucide-react';

interface MetricHeaderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  unit: string;
  min?: number;
  max?: number;
}

const MetricInput: React.FC<MetricHeaderProps> = ({ label, value, onChange, unit }) => (
  <div className="flex items-center gap-2 px-2">
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap">{label}</p>
    <div className="relative">
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 sm:w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300">{unit}</span>
    </div>
  </div>
);

interface GapAnalysisHeaderProps {
  winRate: number;
  setWinRate: (val: number) => void;
  salesTarget: number;
  setSalesTarget: (val: number) => void;
  actualPipeline: number;
  setActualPipeline: (val: number) => void;
}

export const GapAnalysisHeader: React.FC<GapAnalysisHeaderProps> = ({
  winRate, setWinRate,
  salesTarget, setSalesTarget,
  actualPipeline, setActualPipeline
}) => {
  return (
    <div className="px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Target className="w-5 h-5 text-black dark:text-white" />
          销售目标与 Pipeline 缺口监控
        </h2>
        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest text-nowrap">Revenue Alignment & Gap Analysis</p>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100 overflow-x-auto no-scrollbar">
        <MetricInput label="赢单率" value={winRate} onChange={setWinRate} unit="%" />
        <div className="w-px h-6 bg-slate-200 shrink-0" />
        <MetricInput label="销售目标" value={salesTarget} onChange={setSalesTarget} unit="¥M" />
        <div className="w-px h-6 bg-slate-200 shrink-0" />
        <MetricInput label="实际 Pipeline" value={actualPipeline} onChange={setActualPipeline} unit="¥M" />
      </div>
    </div>
  );
};
