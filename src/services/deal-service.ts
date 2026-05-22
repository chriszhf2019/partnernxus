import { db } from '../lib/supabase';
import type { Deal } from '../types';
import { DEALS, DEAL_STATS } from '../constants';
import type { PaginatedResponse, DealFilters } from './types';

export const dealService = {
  list: async (filters: DealFilters = {}): Promise<PaginatedResponse<Deal>> => {
    try {
      let query = db.deals().select('*');
      if (filters.status?.length) query = query.in('status', filters.status);
      if (filters.region?.length) query = query.in('region', filters.region);
      if (filters.partnerId) query = query.eq('partner_id', filters.partnerId);
      const { data } = await query.order('created_date', { ascending: false });
      let deals = (data || []) as Deal[];
      if (filters.search) {
        const s = filters.search.toLowerCase();
        deals = deals.filter((d) => d.title.toLowerCase().includes(s) || d.customer.toLowerCase().includes(s));
      }
      return { items: deals, total: deals.length, page: 1, pageSize: deals.length };
    } catch {
      return { items: DEALS, total: DEALS.length, page: 1, pageSize: DEALS.length };
    }
  },

  getById: async (id: string): Promise<Deal | null> => {
    try {
      const { data } = await db.deals().select('*').eq('id', id).single();
      return (data as Deal) || DEALS.find((d) => d.id === id) || null;
    } catch {
      return DEALS.find((d) => d.id === id) || null;
    }
  },

  create: async (deal: Omit<Deal, 'id'>): Promise<Deal> => {
    const { data, error } = await db.deals().insert(deal).select().single();
    if (error) throw new Error(error.message);
    return data as Deal;
  },

  update: async (id: string, data: Partial<Deal>): Promise<void> => {
    const { error } = await db.deals().update(data).eq('id', id);
    if (error) throw new Error(error.message);
  },

  getStats: () => DEAL_STATS,
};
