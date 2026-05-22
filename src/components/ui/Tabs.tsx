import { cn } from '../../lib/utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs = ({ tabs, activeTab, onChange, className }: TabsProps) => (
  <div className={cn('flex border-b border-neutral-200 dark:border-neutral-700', className)} role="tablist">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        role="tab"
        aria-selected={activeTab === tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          'px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px',
          activeTab === tab.id
            ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
            : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600',
        )}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span className="ml-2 px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);
