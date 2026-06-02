import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Option {
  id: string;
  label: string;
  sub?: string;
}

interface Props {
  value: string;
  onChange: (id: string, label: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({ value, onChange, options, placeholder = '搜索...', className }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.id === value);
  const filtered = search ? options.filter(o => {
    const q = search.toLowerCase();
    return o.label.toLowerCase().includes(q) || (o.sub || '').toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
  }).slice(0, 20) : options.slice(0, 20);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      {selected ? (
        <div className="flex items-center gap-1 h-7 px-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-[11px]">
          <span className="truncate flex-1">{selected.label}</span>
          <button onClick={() => { onChange('', ''); setSearch(''); }} className="shrink-0 text-neutral-400 hover:text-neutral-600"><X className="w-3 h-3" /></button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
          <input className="w-full h-7 pl-6 pr-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500/30" placeholder={placeholder} value={search} onFocus={() => setOpen(true)} onChange={e => { setSearch(e.target.value); setOpen(true); }} />
        </div>
      )}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-40 overflow-y-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl min-w-[200px]">
          {filtered.length === 0 ? <p className="px-3 py-2 text-[11px] text-neutral-400">无匹配</p> : filtered.map(o => (
            <button key={o.id} type="button" onMouseDown={() => { onChange(o.id, o.label); setSearch(''); setOpen(false); }} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center justify-between">
              <span>{o.label}</span>
              {o.sub && <span className="text-neutral-400 text-[10px]">{o.sub}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
