import { db } from '../lib/supabase';
import type { Partner } from '../types';
import { IMPORTED_PARTNERS } from '../data/importedPartners';
import type { PaginatedResponse, PartnerFilters } from './types';

// ── Helpers ──────────────────────────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = (id: string) => UUID_RE.test(id);

const isLocalId = (id: string) => id.startsWith('local-') || (!isUUID(id) && !id.startsWith('PRA-') && !id.startsWith('PRC-'));

// PRA-/PRC- IDs are now valid in Supabase (migrated to TEXT column)
const isImportedId = (id: string) => id.startsWith('PRA-') || id.startsWith('PRC-');

const toSnake = (camel: Record<string, any>): Record<string, any> => {
  const map: Record<string, string> = {
    englishName: 'english_name', unifiedSocialCreditCode: 'unified_social_credit_code',
    cooperationScope: 'cooperation_scope', isCorePartner: 'is_core_partner',
    startDate: 'start_date', prevTier: 'prev_tier', winRate: 'win_rate',
    applicationDate: 'application_date', registeredAddress: 'registered_address',
  };
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(camel)) {
    if (v === undefined) continue;
    out[map[k] || k] = v;
  }
  return out;
};

const normalizePartner = (p: any): Partner => {
  const startDate = p.startDate || p.start_date || '';
  // Auto-calculate years from startDate if not explicitly set
  let years = p.years || 0;
  if (!years && startDate) {
    const d = new Date(startDate);
    if (!isNaN(d.getTime())) years = new Date().getFullYear() - d.getFullYear();
  }
  return {
    ...p,
    contacts: p.contacts || [],
    tags: p.tags || [],
    startDate,
    years,
    prevTier: p.prevTier || p.prev_tier || 'Registered',
    winRate: p.winRate || p.win_rate || 0,
    unifiedSocialCreditCode: p.unifiedSocialCreditCode || p.unified_social_credit_code || '',
    cooperationScope: p.cooperationScope || p.cooperation_scope || '',
    isCorePartner: p.isCorePartner ?? p.is_core_partner ?? false,
    englishName: p.englishName || p.english_name || '',
    website: p.website || '',
    applicationDate: p.applicationDate || p.application_date || '',
  };
};

// ── Audit Logger ─────────────────────────────────────
async function logOp(partnerId: string, action: string, operator: string, details: Record<string, any> = {}) {
  if (isLocalId(partnerId)) {
    const logs = JSON.parse(localStorage.getItem('operationLogs') || '[]');
    logs.push({ partner_id: partnerId, action, operator, details, created_at: new Date().toISOString() });
    localStorage.setItem('operationLogs', JSON.stringify(logs.slice(-50))); // keep last 50
    return;
  }
  try { await db.operationLogs().insert({ partner_id: partnerId, action, operator, details }); } catch { /* best-effort */ }
}

export const partnerService = {
  // ── List ─────────────────────────────────────────────
  list: async (filters: PartnerFilters = {}): Promise<PaginatedResponse<Partner>> => {
    try {
      let query = db.partners().select('*');
      if (filters.tier?.length) query = query.in('tier', filters.tier);
      if (filters.status?.length) query = query.in('status', filters.status);
      if (filters.type?.length) query = query.in('type', filters.type);
      if (filters.region?.length) query = query.in('region', filters.region);
      const { data } = await query;
      let partners = ((data || []) as Partner[]).map(normalizePartner);

      try {
        const local = JSON.parse(localStorage.getItem('localPartners') || '[]');
        partners = [...local, ...partners];
      } catch { /* ignore */ }

      if (filters.search) {
        const s = filters.search.toLowerCase();
        partners = partners.filter((p) => p.name.toLowerCase().includes(s) || (p.tags || []).some((t) => t.toLowerCase().includes(s)) || (p.manager || '').toLowerCase().includes(s));
      }
      return { items: partners, total: partners.length, page: 1, pageSize: partners.length };
    } catch {
      const local = JSON.parse(localStorage.getItem('localPartners') || '[]');
      const all = [...local, ...IMPORTED_PARTNERS];
      return { items: all, total: all.length, page: 1, pageSize: all.length };
    }
  },

  getById: async (id: string): Promise<Partner | null> => {
    // Try localStorage first for locally-created partners
    if (id.startsWith('local-')) {
      const stored = JSON.parse(localStorage.getItem('localPartners') || '[]');
      return stored.find((p: any) => p.id === id) || null;
    }
    // Try Supabase for PRA-/PRC- and UUID IDs
    try {
      const { data } = await db.partners().select('*').eq('id', id).single();
      if (data) {
        const partner = normalizePartner(data);
        // Enrich with contacts from imported data
        const imported = IMPORTED_PARTNERS.find(p => p.id === id);
        if (imported && imported.contacts?.length > 0 && (!partner.contacts || partner.contacts.length === 0)) {
          partner.contacts = imported.contacts;
        }
        return partner;
      }
    } catch { /* fall through */ }
    // Fallback to imported data
    return IMPORTED_PARTNERS.find((p) => p.id === id) || null;
  },

  // ── Create ───────────────────────────────────────────
  create: async (input: Record<string, any>): Promise<Partner> => {
    const dbFields: Record<string, any> = {
      name: input.name,
      logo: input.logo || '',
      tier: input.tier || 'Registered',
      status: input.status || 'Prospective',
      type: input.type || 'Reseller',
      manager: input.manager || '',
      location: input.location || '',
      region: input.region || '华北',
      province: input.province || '',
      city: input.city || '',
      district: input.district || '',
      start_date: input.startDate || input.start_date || new Date().toISOString().split('T')[0],
      years: input.years || 0,
      prev_tier: input.prevTier || input.prev_tier || 'Registered',
      tags: input.tags || [],
      win_rate: input.winRate || input.win_rate || 0,
      unified_social_credit_code: input.unifiedSocialCreditCode || input.unified_social_credit_code || '',
      industry: input.industry || '',
      cooperation_scope: input.cooperationScope || input.cooperation_scope || '',
      is_core_partner: input.isCorePartner ?? input.is_core_partner ?? false,
    };
    if (input.englishName || input.english_name) dbFields.english_name = input.englishName || input.english_name;
    if (input.website) dbFields.website = input.website;
    if (input.applicationDate || input.application_date) dbFields.application_date = input.applicationDate || input.application_date;
    if (input.registeredAddress || input.registered_address) dbFields.registered_address = input.registeredAddress || input.registered_address;

    try {
      const { data, error } = await db.partners().insert(dbFields).select().single();
      if (error) throw new Error(error.message);

      const contacts: any[] = input.contacts || [];
      if (contacts.length > 0) {
        await db.contacts().insert(contacts.map((c: any) => ({
          partner_id: (data as any).id,
          salutation: c.salutation || '',
          first_name: c.firstName || c.first_name || '',
          last_name: c.lastName || c.last_name || '',
          title: c.title || '', department: c.department || '',
          phone: c.phone || '', mobile: c.mobile || '',
          email: c.email || '',
          is_primary: c.isPrimary ?? c.is_primary ?? false,
        })));
      }

      await logOp((data as any).id, 'create', input._operator || 'system', { name: dbFields.name, status: dbFields.status });
      return normalizePartner(data);
    } catch (err: any) {
      console.warn('Supabase insert failed, local fallback:', err.message);
      const partner: Partner = {
        id: 'local-' + Date.now(), name: dbFields.name, logo: dbFields.logo || '',
        tier: dbFields.tier, status: 'Prospective', type: dbFields.type, manager: '',
        location: dbFields.location || '', region: dbFields.region || '华北',
        province: dbFields.province || '', city: dbFields.city || '', district: dbFields.district || '',
        startDate: dbFields.start_date, applicationDate: dbFields.application_date || dbFields.start_date,
        years: 0, prevTier: dbFields.prev_tier || 'Registered', tags: [], winRate: 0,
        contacts: (input.contacts || []).map((c: any) => ({
          salutation: c.salutation || '', firstName: c.firstName || c.first_name || '',
          lastName: c.lastName || c.last_name || '', title: c.title || '',
          department: c.department || '', phone: c.phone || '', mobile: c.mobile || '',
          email: c.email || '', isPrimary: c.isPrimary ?? c.is_primary ?? false,
        })),
        unifiedSocialCreditCode: dbFields.unified_social_credit_code || '',
        industry: dbFields.industry || '', cooperationScope: dbFields.cooperation_scope || '',
        isCorePartner: false, englishName: dbFields.english_name || '', website: dbFields.website || '',
      };
      const stored = JSON.parse(localStorage.getItem('localPartners') || '[]');
      stored.push(partner);
      localStorage.setItem('localPartners', JSON.stringify(stored));
      return partner;
    }
  },

  // ── Local write helper ──────────────────────────────
  _localWrite: (id: string, data: Record<string, any>) => {
    try {
      const raw = localStorage.getItem('localPartners') || '[]';
      const stored = JSON.parse(raw);
      if (!Array.isArray(stored)) { localStorage.setItem('localPartners', '[]'); return; }
      const idx = stored.findIndex((p: any) => p.id === id);
      if (idx >= 0) {
        stored[idx] = { ...stored[idx], ...data };
      } else {
        const existing = IMPORTED_PARTNERS.find(p => p.id === id);
        const base = existing ? { ...existing } : { id };
        stored.push({ ...base, ...data });
      }
      localStorage.setItem('localPartners', JSON.stringify(stored));
    } catch (e) {
      console.error('localStorage write failed', e);
    }
  },

  // ── Update ──────────────────────────────────────────
  update: async (id: string, data: Partial<Partner> & { _operator?: string }, operator?: string): Promise<void> => {
    // local- IDs go to localStorage only
    if (isLocalId(id)) { partnerService._localWrite(id, data as Record<string, any>); return; }

    const dbData = toSnake(data as Record<string, any>);
    delete dbData._operator;
    delete dbData.contacts;
    try {
      const { error } = await db.partners().upsert({ id, ...dbData, updated_at: new Date().toISOString() }, { onConflict: 'id' });
      if (error) throw new Error(error.message);
      await logOp(id, 'edit', data._operator || operator || 'system', { changes: dbData });
    } catch (err: any) {
      partnerService._localWrite(id, data as Record<string, any>);
      if (!err.message?.includes('not configured')) throw err;
    }
  },

  // ── Delete ──────────────────────────────────────────
  delete: async (id: string, operator?: string): Promise<void> => {
    if (isLocalId(id)) { /* handle locally */ return; }
    try {
      const { error } = await db.partners().delete().eq('id', id);
      if (error) throw new Error(error.message);
      await logOp(id, 'delete', operator || 'system', {});
    } catch (err: any) {
      if (err.message?.includes('not configured')) return;
      throw err;
    }
  },

  // ── Approve ──────────────────────────────────────────
  approve: async (id: string, data: { tier: string; status: string; manager: string; tags: string[] }, operator?: string): Promise<void> => {
    if (isLocalId(id)) { partnerService._localWrite(id, { ...data, startDate: new Date().toISOString().split('T')[0] }); return; }
    try {
      await db.partners().update({ tier: data.tier, status: data.status, manager: data.manager, tags: data.tags, start_date: new Date().toISOString().split('T')[0] }).eq('id', id);
      await logOp(id, 'approve', operator || 'system', data);
    } catch { partnerService._localWrite(id, { ...data, startDate: new Date().toISOString().split('T')[0] }); }
  },

  // ── Reject ───────────────────────────────────────────
  reject: async (id: string, operator?: string): Promise<void> => {
    if (isLocalId(id)) { partnerService._localWrite(id, { status: 'Inactive' }); return; }
    try { await db.partners().update({ status: 'Inactive' }).eq('id', id); await logOp(id, 'reject', operator || 'system', {}); } catch {}
  },

  // ── Batch approve ────────────────────────────────────
  batchApprove: async (ids: string[], data: { tier: string; status: string; manager: string; tags: string[] }, operator?: string): Promise<void> => {
    for (const id of ids) partnerService._localWrite(id, { ...data, startDate: new Date().toISOString().split('T')[0] });
    try {
      const dbIds = ids.filter(id => !isLocalId(id));
      if (dbIds.length > 0) {
        await db.partners().update({ tier: data.tier, status: data.status, manager: data.manager, tags: data.tags, start_date: new Date().toISOString().split('T')[0] }).in('id', dbIds);
        for (const id of dbIds) await logOp(id, 'approve', operator || 'system', { batch: true, ...data });
      }
    } catch { /* ok */ }
  },

  // ── Batch reject ─────────────────────────────────────
  batchReject: async (ids: string[], operator?: string): Promise<void> => {
    for (const id of ids) partnerService._localWrite(id, { status: 'Inactive' });
    try {
      const dbIds = ids.filter(id => !isLocalId(id));
      if (dbIds.length > 0) { await db.partners().update({ status: 'Inactive' }).in('id', dbIds); for (const id of dbIds) await logOp(id, 'reject', operator || 'system', { batch: true }); }
    } catch { /* ok */ }
  },

  // ── Operation logs ───────────────────────────────────
  getOperationLogs: async (partnerId: string): Promise<any[]> => {
    if (isLocalId(partnerId)) {
      const logs = JSON.parse(localStorage.getItem('operationLogs') || '[]');
      return logs.filter((l: any) => l.partner_id === partnerId);
    }
    try {
      const { data } = await db.operationLogs().select('*').eq('partner_id', partnerId).order('created_at', { ascending: false });
      return (data || []) as any[];
    } catch { return []; }
  },
};
