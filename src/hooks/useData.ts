import { useMemo, useRef, useState, useEffect } from 'react';
import {
  DEALS, ACTIVITIES as FALLBACK_ACTIVITIES, PARTNER_DETAILS, DEAL_STATS, DASHBOARD_STATS,
  MDF_STATS, MDF_MONTHLY_ACTIVITIES, INCENTIVE_PROGRAMS, INCENTIVE_STATS,
  MATRIX_DATA, NETWORK_NODES, NETWORK_LINKS,
} from '../constants';
import { IMPORTED_PARTNERS } from '../data/importedPartners';
import { dealService } from '../services/deal-service';
import { getMockCockpitData } from '../lib/mockGenerator';
import type { CockpitData, Partner, Deal } from '../types';

// Simple normalization function to ensure consistent status values
function normalizeStatus(partner: any): Partner {
  const status = (partner.status || 'Prospective').trim();
  return {
    ...partner,
    status,
    tags: partner.tags || [],
  };
}

export function usePartners() {
  const partnerListRef = useRef<Partner[]>([]);

  const partners = useMemo(() => {
    let local: Partner[] = [];
    try {
      local = JSON.parse(localStorage.getItem('localPartners') || '[]');
    } catch { /* ignore */ }
    const all = [...local, ...IMPORTED_PARTNERS].map(normalizeStatus);
    partnerListRef.current = all;
    return all;
  }, []);

  return useMemo(() => ({
    partners,
    partnerDetails: PARTNER_DETAILS,
    partnerListRef,
  }), [partners]);
}

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>(DEALS);
  const [stats, setStats] = useState(DEAL_STATS);

  useEffect(() => {
    dealService.list().then((result) => {
      const items = result.items;
      setDeals(items);
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const weekStart = new Date(now.getTime() - now.getDay() * 86400000);
      setStats({
        ...DEAL_STATS,
        yearNew: items.filter(d => d.createdDate && new Date(d.createdDate) >= yearStart).length,
        quarterNew: items.filter(d => d.createdDate && new Date(d.createdDate) >= quarterStart).length,
        monthNew: items.filter(d => d.createdDate && new Date(d.createdDate) >= monthStart).length,
        weekNew: items.filter(d => d.createdDate && new Date(d.createdDate) >= weekStart).length,
        rejected: items.filter(d => d.status === 'Rejected').length,
        closed: items.filter(d => d.status === 'Converted' || d.status === 'Closed Won').length,
        totalPipelineValue: items.reduce((s, d) => s + Number(d.value || 0), 0),
        avgCycleDays: items.filter(d => d.conversionMetrics?.totalCycleDays).length > 0
          ? Math.round(items.reduce((s, d) => s + (d.conversionMetrics?.totalCycleDays || 0), 0) / items.filter(d => d.conversionMetrics?.totalCycleDays).length)
          : DEAL_STATS.avgCycleDays,
        conversionRate: items.length > 0
          ? Math.round((items.filter(d => d.status === 'Converted' || d.status === 'Closed Won').length / items.length) * 100)
          : DEAL_STATS.conversionRate,
        stageDistribution: items.reduce((acc, d) => {
          const stage = d.stage || 'Registered';
          acc[stage] = (acc[stage] || 0) + 1;
          return acc;
        }, { ...DEAL_STATS.stageDistribution } as Record<string, number>),
        conflictCount: items.filter(d => d.hasConflict).length,
        overdueCount: items.filter(d => d.expectedCloseDate && new Date(d.expectedCloseDate) < now && d.status !== 'Closed Won' && d.status !== 'Closed Lost').length,
      });
    }).catch(() => {});
  }, []);

  return useMemo(() => ({ deals, stats }), [deals, stats]);
}

export function useActivities() {
  const [activities, setActivities] = useState(FALLBACK_ACTIVITIES);
  useEffect(() => {
    import('../lib/supabase').then(({ supabase }) => {
      Promise.all([
        supabase.from('partner_operation_logs').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('jbp_meetings').select('*').order('created_at', { ascending: false }).limit(5),
      ]).then(([logRes, jbpRes]: any[]) => {
        const logs = (logRes.data || []).map((l: any) => ({
          id: l.id, type: l.action === 'create' ? 'registration' : l.action === 'approve' ? 'milestone' : l.action === 'edit' ? 'registration' : 'visit',
          title: l.action === 'create' ? '创建合作伙伴' : l.action === 'approve' ? '批复通过' : l.action === 'reject' ? '驳回申请' : l.action === 'edit' ? '编辑信息' : l.action,
          description: l.details ? JSON.stringify(l.details).slice(0, 60) : '', date: l.created_at?.split('T')[0] || '', time: l.created_at?.split('T')[1]?.slice(0, 5) || '',
        }));
        const jbps = (jbpRes.data || []).map((j: any) => ({
          id: j.id, type: 'milestone', title: `JBP: ${j.title}`, description: `${j.meeting_type} · ${j.location}`, date: j.meeting_date || '', time: '',
        }));
        setActivities([...jbps, ...logs].slice(0, 20));
      }).catch(() => {});
    });
  }, []);
  return useMemo(() => ({ activities }), [activities]);
}

export function useDashboardStats() {
  const [stats, setStats] = useState(DASHBOARD_STATS);
  useEffect(() => {
    import('../lib/supabase').then(({ supabase }) => {
      Promise.all([
        supabase.from('partners').select('status'),
        supabase.from('deals').select('value, status'),
      ]).then(([pRes, dRes]: any[]) => {
        const partners = (pRes.data || []) as any[];
        const deals = (dRes.data || []) as any[];
        const active = partners.filter((p: any) => p.status === 'Cooperating').length;
        const totalDealValue = deals.reduce((s: number, d: any) => s + Number(d.value || 0), 0);
        const wonValue = deals.filter((d: any) => d.status === 'Converted' || d.status === 'Closed Won').reduce((s: number, d: any) => s + Number(d.value || 0), 0);
        setStats({
          activePartners: { value: active, growth: Math.round((active / Math.max(1, partners.length)) * 100) },
          pipelineValue: totalDealValue,
          revenueAchievement: deals.length > 0 ? Math.round((wonValue / Math.max(1, totalDealValue)) * 100) : 0,
          leadsConversion: 0,
        });
      }).catch(() => {});
    });
  }, []);
  return useMemo(() => ({ stats }), [stats]);
}

export function useMarketingData() {
  const [mdfActivities, setMdfActivities] = useState(MDF_MONTHLY_ACTIVITIES);
  const [incentivePrograms, setIncentivePrograms] = useState(INCENTIVE_PROGRAMS);

  useEffect(() => {
    import('../lib/supabase').then(({ supabase }) => {
      supabase.from('marketing_activities').select('*').order('event_date', { ascending: false }).then(({ data }: any) => {
        if (data?.length) setMdfActivities(data.map((a: any) => ({
          id: a.id, name: a.name, type: a.type, date: a.event_date, status: a.status,
          budget: a.budget, actualSpend: a.actual_spend, leadsGenerated: a.leads_generated, progress: a.progress,
        })));
      });
      supabase.from('incentive_programs').select('*').order('created_at', { ascending: false }).then(({ data }: any) => {
        if (data?.length) setIncentivePrograms(data.map((p: any) => ({
          id: p.id, title: p.title, trigger: p.trigger_type, status: p.status, payoutType: p.payout_type,
          totalBudget: p.total_budget, claimedAmount: p.claimed_amount, participantsCount: p.participants_count,
          description: p.description, startDate: p.start_date, endDate: p.end_date,
          currentMonthPerformance: { target: Math.round(p.total_budget / 6), actual: Math.round(p.claimed_amount / 3), growth: 12 },
        })));
      });
    }).catch(() => {});
  }, []);

  const mdfStats = useMemo(() => {
    const total = mdfActivities.reduce((s, a) => s + (a.budget || 0), 0);
    const used = mdfActivities.reduce((s, a) => s + (a.actualSpend || 0), 0);
    const leads = mdfActivities.reduce((s, a) => s + (a.leadsGenerated || 0), 0);
    return {
      annualQuota: total || MDF_STATS.annualQuota,
      quarterlyQuota: Math.round((total || MDF_STATS.annualQuota) / 4),
      usedAmount: used || MDF_STATS.usedAmount,
      remainingAmount: (total || MDF_STATS.annualQuota) - (used || MDF_STATS.usedAmount),
      conversionRate: leads > 0 ? Math.round((leads / mdfActivities.length) * 2) : MDF_STATS.conversionRate,
      activityDistribution: mdfActivities.map(a => ({ type: a.type || '活动', percentage: Math.round(100 / mdfActivities.length), count: 1 })),
    };
  }, [mdfActivities]);

  const incentiveStats = useMemo(() => ({
    totalActivePrograms: incentivePrograms.filter(p => p.status === 'Active').length,
    totalPayoutYTD: incentivePrograms.reduce((s, p) => s + (p.claimedAmount || 0), 0),
    avgParticipationRate: Math.round(incentivePrograms.reduce((s, p) => s + (p.participantsCount || 0), 0) / Math.max(1, incentivePrograms.length)),
    topTrigger: 'Pipeline Gap',
  }), [incentivePrograms]);

  return useMemo(() => ({ mdfStats, mdfActivities, incentivePrograms, incentiveStats }), [mdfStats, mdfActivities, incentivePrograms, incentiveStats]);
}

export function useMatrixData() {
  const [data, setData] = useState(MATRIX_DATA);
  useEffect(() => {
    import('../lib/supabase').then(async ({ supabase }) => {
      try {
        const { data: rows } = await supabase.from('partners').select('region, industry');
        if (!rows?.length) return;
        const map = new Map<string, number>();
        rows.forEach((r: any) => {
          const key = `${r.region || '其他'}|${r.industry || '未分类'}`;
          map.set(key, (map.get(key) || 0) + 1);
        });
        const result: any[] = [];
        map.forEach((count, key) => {
          const [region, industry] = key.split('|');
          result.push({ industry, region, count });
        });
        setData(result);
      } catch {
        // ignore
      }
    });
  }, []);
  return useMemo(() => ({ data }), [data]);
}

export function useNetworkData() {
  const [data, setData] = useState({ nodes: NETWORK_NODES, links: NETWORK_LINKS });
  useEffect(() => {
    import('../lib/supabase').then(async ({ supabase }) => {
      try {
        const { data: rows } = await supabase.from('partners').select('id, name, type, tier').limit(20);
        if (!rows?.length) return;
        const nodes: any[] = rows.map((p: any) => ({ id: p.id, name: p.name, role: p.type || 'Reseller', size: p.tier === 'Platinum' ? 5 : p.tier === 'Gold' ? 4 : 3 }));
        setData({ nodes, links: [] });
      } catch {
        // ignore
      }
    });
  }, []);
  return useMemo(() => ({ nodes: data.nodes, links: data.links }), [data]);
}

export function useCockpitData(): CockpitData {
  const [data, setData] = useState<CockpitData>(getMockCockpitData());
  useEffect(() => {
    import('../lib/realCockpitData').then(({ getRealCockpitData }) => {
      getRealCockpitData().then(setData).catch(() => {});
    });
  }, []);
  return data;
}
