import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

type EditData = Record<string, any>;

interface Props {
  data: EditData;
  onChange: (data: EditData) => void;
}

// Helper: parse array from editData, fallback to []
function arr(data: EditData, key: string): any[] {
  try { return Array.isArray(data[key]) ? data[key] : JSON.parse(data[key] || '[]'); } catch { return []; }
}

function setArr(data: EditData, key: string, value: any[]): EditData {
  return { ...data, [key]: value };
}

// Reusable section component
function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
        {title}
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
}

const inputClass = "h-7 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-[11px] w-full focus:outline-none focus:border-neutral-400";

export function PartnerEditForm({ data, onChange }: Props) {
  return (
    <div className="space-y-2 mt-3">
      <Section title="Pipeline & MDF 数据" defaultOpen>
        <div className="grid grid-cols-3 gap-2">
          {[
            ['pipeline_registered','报备 (¥)'],['pipeline_solution','方案 (¥)'],['pipeline_commercial','商务 (¥)'],
            ['pipeline_won','赢单 (¥)'],['mdf_total','MDF总额 (¥)'],['mdf_used','MDF已用 (¥)'],
            ['certified_engineers','认证工程师'],['specialists_count','高级专家'],
            ['expiry_risk_count','过期人数'],['expiry_days','过期天数'],
          ].map(([k, label]) => (
            <div key={k}>
              <label className="text-[10px] text-neutral-400 block mb-0.5">{label}</label>
              <input className={inputClass} type="number" value={data[k] || ''} onChange={e => onChange({...data, [k]: e.target.value})} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="在跟项目">
        <ProjectList data={data} onChange={onChange} />
      </Section>

      <Section title="组织架构">
        <OrgList data={data} onChange={onChange} />
      </Section>

      <Section title="合作里程碑">
        <MilestoneList data={data} onChange={onChange} />
      </Section>

      <Section title="QBR 季度沟通">
        <QBRList data={data} onChange={onChange} />
      </Section>

      <Section title="联合计划">
        <PlanList data={data} onChange={onChange} />
      </Section>

      <Section title="等级变迁">
        <TierHistoryList data={data} onChange={onChange} />
      </Section>

      <Section title="客户组合">
        <CustomerList data={data} onChange={onChange} />
      </Section>

      <Section title="生态协作">
        <EcosystemList data={data} onChange={onChange} />
      </Section>

      <Section title="战略建议">
        <StrategyList data={data} onChange={onChange} />
      </Section>

      <Section title="子合作伙伴">
        <SubPartnerList data={data} onChange={onChange} />
      </Section>

      <Section title="近期动态">
        <ActivityList data={data} onChange={onChange} />
      </Section>
    </div>
  );
}

// ── Reusable list helpers ────────────────────────────

function ProjectList({ data, onChange }: Props) {
  const items = arr(data, 'top_projects');
  const update = (i: number, f: string, v: any) => { const n=[...items]; n[i]={...n[i],[f]:v}; onChange(setArr(data,'top_projects',n)); };
  const add = () => { onChange(setArr(data,'top_projects',[...items,{name:'',amount:0,progress:0,closeDate:''}])); };
  const remove = (i: number) => { onChange(setArr(data,'top_projects',items.filter((_,j)=>j!==i))); };
  return (
    <div className="space-y-2">
      {items.map((p, i) => (
        <div key={i} className="flex gap-1.5 items-center">
          <input className={cn(inputClass,'flex-1')} placeholder="项目名称" value={p.name||''} onChange={e=>update(i,'name',e.target.value)} />
          <input className={cn(inputClass,'w-20')} type="number" placeholder="金额" value={p.amount||''} onChange={e=>update(i,'amount',Number(e.target.value))} />
          <input className={cn(inputClass,'w-16')} type="number" placeholder="进度%" value={p.progress||''} onChange={e=>update(i,'progress',Number(e.target.value))} />
          <input className={cn(inputClass,'w-24')} type="date" value={p.closeDate||''} onChange={e=>update(i,'closeDate',e.target.value)} />
          <button onClick={()=>remove(i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-600"><Plus className="w-3 h-3" />添加项目</button>
    </div>
  );
}

function OrgList({ data, onChange }: Props) {
  const items = arr(data, 'org_structure');
  const update = (i:number,f:string,v:any)=>{const n=[...items];n[i]={...n[i],[f]:v};onChange(setArr(data,'org_structure',n));};
  const add = ()=>onChange(setArr(data,'org_structure',[...items,{role:'',name:'',department:'',note:''}]));
  const remove = (i:number)=>onChange(setArr(data,'org_structure',items.filter((_,j)=>j!==i)));
  return <ListBlock items={items} add={add} remove={remove}>
    {(p,i)=><>
      <input className={cn(inputClass,'w-20')} placeholder="角色" value={p.role||''} onChange={e=>update(i,'role',e.target.value)} />
      <input className={cn(inputClass,'w-20')} placeholder="姓名" value={p.name||''} onChange={e=>update(i,'name',e.target.value)} />
      <input className={cn(inputClass,'w-24')} placeholder="部门" value={p.department||''} onChange={e=>update(i,'department',e.target.value)} />
      <input className={cn(inputClass,'flex-1')} placeholder="备注" value={p.note||''} onChange={e=>update(i,'note',e.target.value)} />
    </>}
  </ListBlock>;
}

function MilestoneList({ data, onChange }: Props) {
  const items = arr(data, 'milestones');
  const update = (i:number,f:string,v:any)=>{const n=[...items];n[i]={...n[i],[f]:v};onChange(setArr(data,'milestones',n));};
  const add = ()=>onChange(setArr(data,'milestones',[...items,{year:'',stage:'',description:'',link:''}]));
  const remove = (i:number)=>onChange(setArr(data,'milestones',items.filter((_,j)=>j!==i)));
  return <ListBlock items={items} add={add} remove={remove}>
    {(p,i)=><>
      <input className={cn(inputClass,'w-16')} placeholder="年份" value={p.year||''} onChange={e=>update(i,'year',e.target.value)} />
      <input className={cn(inputClass,'w-16')} placeholder="阶段" value={p.stage||''} onChange={e=>update(i,'stage',e.target.value)} />
      <input className={cn(inputClass,'flex-1')} placeholder="描述" value={p.description||''} onChange={e=>update(i,'description',e.target.value)} />
      <input className={cn(inputClass,'w-32')} placeholder="关联" value={p.link||''} onChange={e=>update(i,'link',e.target.value)} />
    </>}
  </ListBlock>;
}

function QBRList({ data, onChange }: Props) {
  const items = arr(data, 'qbr_records');
  const update = (i:number,f:string,v:any)=>{const n=[...items];n[i]={...n[i],[f]:v};onChange(setArr(data,'qbr_records',n));};
  const add = ()=>onChange(setArr(data,'qbr_records',[...items,{quarter:'',date:'',goal:'',progress:'',key_results:'',attendees:'',link:''}]));
  const remove = (i:number)=>onChange(setArr(data,'qbr_records',items.filter((_,j)=>j!==i)));
  return <ListBlock items={items} add={add} remove={remove}>
    {(p,i)=><>
      <input className={cn(inputClass,'w-20')} placeholder="季度" value={p.quarter||''} onChange={e=>update(i,'quarter',e.target.value)} />
      <input className={cn(inputClass,'w-28')} type="date" value={p.date||''} onChange={e=>update(i,'date',e.target.value)} />
      <input className={cn(inputClass,'w-24')} placeholder="目标" value={p.goal||''} onChange={e=>update(i,'goal',e.target.value)} />
      <input className={cn(inputClass,'w-20')} placeholder="进度" value={p.progress||''} onChange={e=>update(i,'progress',e.target.value)} />
      <input className={cn(inputClass,'flex-1')} placeholder="关键成果" value={p.key_results||''} onChange={e=>update(i,'key_results',e.target.value)} />
      <input className={cn(inputClass,'w-32')} placeholder="参会人(,分隔)" value={p.attendees||''} onChange={e=>update(i,'attendees',e.target.value)} />
      <input className={cn(inputClass,'w-32')} placeholder="关联" value={p.link||''} onChange={e=>update(i,'link',e.target.value)} />
    </>}
  </ListBlock>;
}

function PlanList({ data, onChange }: Props) {
  const items = arr(data, 'cooperation_plans');
  const update = (i:number,f:string,v:any)=>{const n=[...items];n[i]={...n[i],[f]:v};onChange(setArr(data,'cooperation_plans',n));};
  const add = ()=>onChange(setArr(data,'cooperation_plans',[...items,{name:'',type:'',description:'',start_date:'',end_date:'',status:'Active',target_revenue:0,actual_revenue:0,link:''}]));
  const remove = (i:number)=>onChange(setArr(data,'cooperation_plans',items.filter((_,j)=>j!==i)));
  return <ListBlock items={items} add={add} remove={remove}>
    {(p,i)=><>
      <input className={cn(inputClass,'w-28')} placeholder="计划名称" value={p.name||''} onChange={e=>update(i,'name',e.target.value)} />
      <input className={cn(inputClass,'w-20')} placeholder="类型" value={p.type||''} onChange={e=>update(i,'type',e.target.value)} />
      <input className={cn(inputClass,'flex-1')} placeholder="描述" value={p.description||''} onChange={e=>update(i,'description',e.target.value)} />
      <input className={cn(inputClass,'w-28')} type="date" value={p.start_date||''} onChange={e=>update(i,'start_date',e.target.value)} />
      <input className={cn(inputClass,'w-28')} type="date" value={p.end_date||''} onChange={e=>update(i,'end_date',e.target.value)} />
      <input className={cn(inputClass,'w-20')} type="number" placeholder="目标(万)" value={p.target_revenue||''} onChange={e=>update(i,'target_revenue',Number(e.target.value))} />
      <input className={cn(inputClass,'w-20')} type="number" placeholder="实际(万)" value={p.actual_revenue||''} onChange={e=>update(i,'actual_revenue',Number(e.target.value))} />
      <input className={cn(inputClass,'w-32')} placeholder="关联" value={p.link||''} onChange={e=>update(i,'link',e.target.value)} />
    </>}
  </ListBlock>;
}

function TierHistoryList({ data, onChange }: Props) {
  const items = arr(data, 'tier_history');
  const update = (i:number,f:string,v:any)=>{const n=[...items];n[i]={...n[i],[f]:v};onChange(setArr(data,'tier_history',n));};
  const add = ()=>onChange(setArr(data,'tier_history',[...items,{from:'Registered',to:'Silver',date:'',reason:''}]));
  const remove = (i:number)=>onChange(setArr(data,'tier_history',items.filter((_,j)=>j!==i)));
  return <ListBlock items={items} add={add} remove={remove}>
    {(p,i)=><>
      <input className={cn(inputClass,'w-20')} placeholder="从" value={p.from||''} onChange={e=>update(i,'from',e.target.value)} />
      <input className={cn(inputClass,'w-20')} placeholder="到" value={p.to||''} onChange={e=>update(i,'to',e.target.value)} />
      <input className={cn(inputClass,'w-28')} placeholder="日期" value={p.date||''} onChange={e=>update(i,'date',e.target.value)} />
      <input className={cn(inputClass,'flex-1')} placeholder="原因" value={p.reason||''} onChange={e=>update(i,'reason',e.target.value)} />
    </>}
  </ListBlock>;
}

function CustomerList({ data, onChange }: Props) {
  const items = arr(data, 'customer_portfolio');
  const update = (i:number,f:string,v:any)=>{const n=[...items];n[i]={...n[i],[f]:v};onChange(setArr(data,'customer_portfolio',n));};
  const add = ()=>onChange(setArr(data,'customer_portfolio',[...items,{name:'',industry:'',product:'',share:0,competitor:'-',value:0,status:'POC',ref:''}]));
  const remove = (i:number)=>onChange(setArr(data,'customer_portfolio',items.filter((_,j)=>j!==i)));
  return <ListBlock items={items} add={add} remove={remove}>
    {(p,i)=><>
      <input className={cn(inputClass,'w-24')} placeholder="客户名" value={p.name||''} onChange={e=>update(i,'name',e.target.value)} />
      <input className={cn(inputClass,'w-16')} placeholder="行业" value={p.industry||''} onChange={e=>update(i,'industry',e.target.value)} />
      <input className={cn(inputClass,'w-20')} placeholder="产品" value={p.product||''} onChange={e=>update(i,'product',e.target.value)} />
      <input className={cn(inputClass,'w-16')} type="number" placeholder="份额%" value={p.share||''} onChange={e=>update(i,'share',Number(e.target.value))} />
      <input className={cn(inputClass,'w-20')} placeholder="竞品" value={p.competitor||''} onChange={e=>update(i,'competitor',e.target.value)} />
      <input className={cn(inputClass,'w-20')} type="number" placeholder="合同额" value={p.value||''} onChange={e=>update(i,'value',Number(e.target.value))} />
      <input className={cn(inputClass,'w-16')} placeholder="状态" value={p.status||''} onChange={e=>update(i,'status',e.target.value)} />
      <input className={cn(inputClass,'w-32')} placeholder="关联" value={p.ref||''} onChange={e=>update(i,'ref',e.target.value)} />
    </>}
  </ListBlock>;
}

function EcosystemList({ data, onChange }: Props) {
  const items = arr(data, 'ecosystem_partners');
  const update = (i:number,f:string,v:any)=>{const n=[...items];n[i]={...n[i],[f]:v};onChange(setArr(data,'ecosystem_partners',n));};
  const add = ()=>onChange(setArr(data,'ecosystem_partners',[...items,{name:'',type:'SI',relation:'联合打单',value:0,projects:0,ref:''}]));
  const remove = (i:number)=>onChange(setArr(data,'ecosystem_partners',items.filter((_,j)=>j!==i)));
  return <ListBlock items={items} add={add} remove={remove}>
    {(p,i)=><>
      <input className={cn(inputClass,'w-24')} placeholder="名称" value={p.name||''} onChange={e=>update(i,'name',e.target.value)} />
      <input className={cn(inputClass,'w-16')} placeholder="类型" value={p.type||''} onChange={e=>update(i,'type',e.target.value)} />
      <input className={cn(inputClass,'w-20')} placeholder="关系" value={p.relation||''} onChange={e=>update(i,'relation',e.target.value)} />
      <input className={cn(inputClass,'w-20')} type="number" placeholder="金额" value={p.value||''} onChange={e=>update(i,'value',Number(e.target.value))} />
      <input className={cn(inputClass,'w-16')} type="number" placeholder="项目数" value={p.projects||''} onChange={e=>update(i,'projects',Number(e.target.value))} />
      <input className={cn(inputClass,'flex-1')} placeholder="关联" value={p.ref||''} onChange={e=>update(i,'ref',e.target.value)} />
    </>}
  </ListBlock>;
}

function StrategyList({ data, onChange }: Props) {
  const items = arr(data, 'strategy_recommendations');
  const update = (i:number,f:string,v:any)=>{const n=[...items];n[i]={...n[i],[f]:v};onChange(setArr(data,'strategy_recommendations',n));};
  const add = ()=>onChange(setArr(data,'strategy_recommendations',[...items,{title:'',content:'',evidence:''}]));
  const remove = (i:number)=>onChange(setArr(data,'strategy_recommendations',items.filter((_,j)=>j!==i)));
  return <ListBlock items={items} add={add} remove={remove}>
    {(p,i)=><>
      <input className={cn(inputClass,'w-32')} placeholder="标题" value={p.title||''} onChange={e=>update(i,'title',e.target.value)} />
      <input className={cn(inputClass,'flex-1')} placeholder="内容" value={p.content||''} onChange={e=>update(i,'content',e.target.value)} />
      <input className={cn(inputClass,'w-48')} placeholder="依据" value={p.evidence||''} onChange={e=>update(i,'evidence',e.target.value)} />
    </>}
  </ListBlock>;
}

function SubPartnerList({ data, onChange }: Props) {
  const items = arr(data, 'sub_partners');
  const update = (i:number,f:string,v:any)=>{const n=[...items];n[i]={...n[i],[f]:v};onChange(setArr(data,'sub_partners',n));};
  const add = ()=>onChange(setArr(data,'sub_partners',[...items,{name:'',type:'SI',contact:'',phone:'',status:'Active',ref:''}]));
  const remove = (i:number)=>onChange(setArr(data,'sub_partners',items.filter((_,j)=>j!==i)));
  return <ListBlock items={items} add={add} remove={remove}>
    {(p,i)=><>
      <input className={cn(inputClass,'w-28')} placeholder="名称" value={p.name||''} onChange={e=>update(i,'name',e.target.value)} />
      <input className={cn(inputClass,'w-16')} placeholder="类型" value={p.type||''} onChange={e=>update(i,'type',e.target.value)} />
      <input className={cn(inputClass,'w-20')} placeholder="联系人" value={p.contact||''} onChange={e=>update(i,'contact',e.target.value)} />
      <input className={cn(inputClass,'w-28')} placeholder="电话" value={p.phone||''} onChange={e=>update(i,'phone',e.target.value)} />
      <input className={cn(inputClass,'w-16')} placeholder="状态" value={p.status||''} onChange={e=>update(i,'status',e.target.value)} />
      <input className={cn(inputClass,'flex-1')} placeholder="关联" value={p.ref||''} onChange={e=>update(i,'ref',e.target.value)} />
    </>}
  </ListBlock>;
}

function ActivityList({ data, onChange }: Props) {
  const items = arr(data, 'activities_log');
  const update = (i:number,f:string,v:any)=>{const n=[...items];n[i]={...n[i],[f]:v};onChange(setArr(data,'activities_log',n));};
  const add = ()=>onChange(setArr(data,'activities_log',[...items,{title:'',description:'',date:'',ref:''}]));
  const remove = (i:number)=>onChange(setArr(data,'activities_log',items.filter((_,j)=>j!==i)));
  return <ListBlock items={items} add={add} remove={remove}>
    {(p,i)=><>
      <input className={cn(inputClass,'w-28')} placeholder="标题" value={p.title||''} onChange={e=>update(i,'title',e.target.value)} />
      <input className={cn(inputClass,'flex-1')} placeholder="描述" value={p.description||''} onChange={e=>update(i,'description',e.target.value)} />
      <input className={cn(inputClass,'w-28')} placeholder="日期" value={p.date||''} onChange={e=>update(i,'date',e.target.value)} />
      <input className={cn(inputClass,'w-32')} placeholder="关联" value={p.ref||''} onChange={e=>update(i,'ref',e.target.value)} />
    </>}
  </ListBlock>;
}

function ListBlock({ items, add, remove, children }: { items: any[]; add: () => void; remove: (i: number) => void; children: (item: any, index: number) => React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex gap-1 items-center">
          {children(item, i)}
          <button onClick={() => remove(i)} className="p-1 text-neutral-400 hover:text-red-500 shrink-0"><Trash2 className="w-3 h-3" /></button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-600"><Plus className="w-3 h-3" />添加</button>
    </div>
  );
}
