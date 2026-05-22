import { db } from '../lib/supabase';
import type { Partner } from '../types';
import { IMPORTED_PARTNERS } from '../data/importedPartners';
import type { PaginatedResponse, PartnerFilters } from './types';

export const partnerService = {
  list: async (filters: PartnerFilters = {}): Promise<PaginatedResponse<Partner>> => {
    try {
      let query = db.partners().select('*');
      if (filters.tier?.length) query = query.in('tier', filters.tier);
      if (filters.status?.length) query = query.in('status', filters.status);
      if (filters.type?.length) query = query.in('type', filters.type);
      if (filters.region?.length) query = query.in('region', filters.region);
      const { data } = await query;
      let partners = (data || []) as Partner[];
      if (filters.search) {
        const s = filters.search.toLowerCase();
        partners = partners.filter((p) => p.name.toLowerCase().includes(s) || p.tags?.some((t) => t.toLowerCase().includes(s)) || p.manager?.toLowerCase().includes(s));
      }
      return { items: partners, total: partners.length, page: 1, pageSize: partners.length };
    } catch {
      return { items: IMPORTED_PARTNERS, total: IMPORTED_PARTNERS.length, page: 1, pageSize: IMPORTED_PARTNERS.length };
    }
  },

  getById: async (id: string): Promise<Partner | null> => {
    try {
      const { data } = await db.partners().select('*').eq('id', id).single();
      return (data as Partner) || IMPORTED_PARTNERS.find((p) => p.id === id) || null;
    } catch {
      return IMPORTED_PARTNERS.find((p) => p.id === id) || null;
    }
  },

  create: async (partner: Omit<Partner, 'id'>): Promise<Partner> => {
    const { data, error } = await db.partners().insert(partner).select().single();
    if (error) throw new Error(error.message);
    return data as Partner;
  },

  update: async (id: string, data: Partial<Partner>): Promise<void> => {
    const { error } = await db.partners().update(data).eq('id', id);
    if (error) throw new Error(error.message);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await db.partners().delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
