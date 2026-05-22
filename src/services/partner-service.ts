import { db } from '../firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, type QueryConstraint } from 'firebase/firestore';
import type { Partner } from '../types';
import { IMPORTED_PARTNERS } from '../data/importedPartners';
import type { PaginatedResponse, PaginationParams, PartnerFilters } from './types';

const COLLECTION = 'partners';

const buildQuery = (filters: PartnerFilters = {}): QueryConstraint[] => {
  const constraints: QueryConstraint[] = [];
  if (filters.tier?.length) constraints.push(where('tier', 'in', filters.tier));
  if (filters.status?.length) constraints.push(where('status', 'in', filters.status));
  if (filters.type?.length) constraints.push(where('type', 'in', filters.type));
  if (filters.region?.length) constraints.push(where('region', 'in', filters.region));
  return constraints;
};

export const partnerService = {
  list: async (filters: PartnerFilters = {}, pagination: PaginationParams = {}): Promise<PaginatedResponse<Partner>> => {
    const constraints = buildQuery(filters);
    if (pagination.sortBy) {
      constraints.push(orderBy(pagination.sortBy, pagination.sortOrder || 'desc'));
    }

    try {
      const q = query(collection(db, COLLECTION), ...constraints);
      const snapshot = await getDocs(q);
      const partners = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Partner));

      let filtered = partners;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = partners.filter(
          (p) =>
            p.name.toLowerCase().includes(s) ||
            p.tags.some((t) => t.toLowerCase().includes(s)) ||
            p.manager.toLowerCase().includes(s),
        );
      }

      const page = pagination.page || 1;
      const pageSize = pagination.pageSize || 50;
      const start = (page - 1) * pageSize;
      return {
        items: filtered.slice(start, start + pageSize),
        total: filtered.length,
        page,
        pageSize,
      };
    } catch {
      // Fallback to local data when Firebase is unavailable
      let filtered = [...IMPORTED_PARTNERS];
      if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(s) ||
            p.tags.some((t) => t.toLowerCase().includes(s)) ||
            p.manager.toLowerCase().includes(s),
        );
      }
      if (filters.tier?.length) filtered = filtered.filter((p) => filters.tier!.includes(p.tier));
      if (filters.status?.length) filtered = filtered.filter((p) => filters.status!.includes(p.status));

      const page = pagination.page || 1;
      const pageSize = pagination.pageSize || 50;
      const start = (page - 1) * pageSize;
      return {
        items: filtered.slice(start, start + pageSize),
        total: filtered.length,
        page,
        pageSize,
      };
    }
  },

  getById: async (id: string): Promise<Partner | null> => {
    try {
      const docRef = doc(db, COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Partner;
      }
    } catch {
      // Fallback to local data
    }
    return IMPORTED_PARTNERS.find((p) => p.id === id) || null;
  },

  create: async (partner: Omit<Partner, 'id'>): Promise<Partner> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION), partner);
      return { id: docRef.id, ...partner };
    } catch {
      throw new Error('Failed to create partner');
    }
  },

  update: async (id: string, data: Partial<Partner>): Promise<void> => {
    try {
      await updateDoc(doc(db, COLLECTION, id), data);
    } catch {
      throw new Error('Failed to update partner');
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch {
      throw new Error('Failed to delete partner');
    }
  },
};
