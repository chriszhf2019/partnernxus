import { db } from '../lib/supabase';
import type { Deal, DealLifecycleEvent, DealLifecycleStage } from '../types';
import { DEALS, DEAL_STATS } from '../constants';
import type { PaginatedResponse, DealFilters } from './types';

// ── DB ↔ TS normalization ────────────────────────────
// The Supabase deals table has a legacy schema. This normalizes old columns
// to the new TypeScript Deal type and vice versa.

function normalizeDeal(row: any): Deal {
  return {
    id: row.id,
    title: row.title || '',
    customerId: row.customer_id || row.customerId || '',
    customerName: row.customer_name || row.customer || '',
    customerIndustry: row.customer_industry || row.customerIndustry || '',
    value: Number(row.value || 0),
    partnerId: row.partner_id || row.partnerId || '',
    partnerName: row.partner_name || row.partnerName || '',
    partnerType: row.partner_type || row.partnerType || 'Reseller',
    stage: (row.stage || 'Registered') as DealLifecycleStage,
    status: row.status || 'Pending',
    region: row.region || '',
    province: row.province || '',
    city: row.city || '',
    salesName: row.sales_name || row.salesName || '',
    salesTeam: row.sales_team || row.salesTeam || '',
    productType: row.product_type || row.productType || '',
    createdDate: row.created_date || row.createdDate || '',
    lastActivityDate: row.last_activity_date || row.lastActivityDate || row.updated_at || row.created_date || '',
    expectedCloseDate: row.expected_close_date || row.expectedCloseDate || row.end_date || '',
    actualCloseDate: row.actual_close_date || row.actualCloseDate || undefined,
    isPriority: row.is_priority ?? row.isPriority ?? false,
    hasConflict: row.has_conflict ?? row.hasConflict ?? false,
    conflictId: row.conflict_id || row.conflictId || undefined,
    lifecycle: Array.isArray(row.lifecycle) ? row.lifecycle as DealLifecycleEvent[] : [],
    description: row.description || '',
    notes: row.notes || undefined,
    nextAction: row.next_action || row.nextAction || undefined,
    nextActionDate: row.next_action_date || row.nextActionDate || undefined,
  };
}

function toSnakeDeal(deal: Partial<Deal>): Record<string, any> {
  const out: Record<string, any> = {};
  const map: Record<string, string> = {
    customerId: 'customer_id',
    customerName: 'customer_name',
    customerIndustry: 'customer_industry',
    partnerId: 'partner_id',
    partnerName: 'partner_name',
    partnerType: 'partner_type',
    salesName: 'sales_name',
    salesTeam: 'sales_team',
    productType: 'product_type',
    createdDate: 'created_date',
    lastActivityDate: 'last_activity_date',
    expectedCloseDate: 'expected_close_date',
    actualCloseDate: 'actual_close_date',
    isPriority: 'is_priority',
    hasConflict: 'has_conflict',
    conflictId: 'conflict_id',
    nextAction: 'next_action',
    nextActionDate: 'next_action_date',
  };
  for (const [k, v] of Object.entries(deal)) {
    if (v === undefined) continue;
    out[map[k] || k] = v;
  }
  return out;
}

// ── Service ──────────────────────────────────────────
export const dealService = {
  list: async (filters: DealFilters = {}): Promise<PaginatedResponse<Deal>> => {
    try {
      let query = db.deals().select('*');
      if (filters.status?.length) query = query.in('status', filters.status);
      if (filters.region?.length) query = query.in('region', filters.region);
      if (filters.partnerId) query = query.eq('partner_id', filters.partnerId);
      const { data } = await query.order('created_date', { ascending: false });
      let deals = ((data || []) as any[]).map(normalizeDeal);
      if (filters.search) {
        const s = filters.search.toLowerCase();
        deals = deals.filter((d) => d.title.toLowerCase().includes(s) || d.customerName.toLowerCase().includes(s));
      }
      return { items: deals, total: deals.length, page: 1, pageSize: deals.length };
    } catch {
      if (import.meta.env.DEV) console.warn('[dealService] Supabase unavailable, falling back to mock deals');
      return { items: DEALS, total: DEALS.length, page: 1, pageSize: DEALS.length };
    }
  },

  getById: async (id: string): Promise<Deal | null> => {
    try {
      const { data } = await db.deals().select('*').eq('id', id).single();
      if (data) return normalizeDeal(data);
      return DEALS.find((d) => d.id === id) || null;
    } catch {
      if (import.meta.env.DEV) console.warn(`[dealService] Supabase unavailable, falling back to mock deal for id=${id}`);
      return DEALS.find((d) => d.id === id) || null;
    }
  },

  create: async (deal: Omit<Deal, 'id'>): Promise<Deal> => {
    const snake = toSnakeDeal(deal);
    // Ensure required legacy columns
    if (!snake.customer) snake.customer = deal.customerName || '';
    snake.created_date = snake.created_date || new Date().toISOString().split('T')[0];
    snake.lifecycle = snake.lifecycle || [];
    const { data, error } = await db.deals().insert(snake).select().single();
    if (error) throw new Error(error.message);
    return normalizeDeal(data);
  },

  update: async (id: string, dealData: Partial<Deal>): Promise<void> => {
    const snake = toSnakeDeal(dealData);
    const { error } = await db.deals().update(snake).eq('id', id);
    if (error) throw new Error(error.message);
  },

  getStats: () => DEAL_STATS,
};
