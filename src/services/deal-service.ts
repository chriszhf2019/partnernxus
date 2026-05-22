import { db } from '../firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where, orderBy, type QueryConstraint } from 'firebase/firestore';
import type { Deal } from '../types';
import { DEALS, DEAL_STATS } from '../constants';
import type { PaginatedResponse, DealFilters } from './types';

const COLLECTION = 'deals';

export const dealService = {
  list: async (filters: DealFilters = {}): Promise<PaginatedResponse<Deal>> => {
    const constraints: QueryConstraint[] = [];
    if (filters.status?.length) constraints.push(where('status', 'in', filters.status));
    if (filters.region?.length) constraints.push(where('region', 'in', filters.region));
    if (filters.partnerId) constraints.push(where('partnerId', '==', filters.partnerId));
    constraints.push(orderBy('createdDate', 'desc'));

    try {
      const q = query(collection(db, COLLECTION), ...constraints);
      const snapshot = await getDocs(q);
      const deals = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Deal));

      let filtered = deals;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = deals.filter(
          (d) => d.title.toLowerCase().includes(s) || d.customer.toLowerCase().includes(s),
        );
      }

      return { items: filtered, total: filtered.length, page: 1, pageSize: filtered.length };
    } catch {
      let filtered = [...DEALS];
      if (filters.status?.length) filtered = filtered.filter((d) => filters.status!.includes(d.status));
      if (filters.partnerId) filtered = filtered.filter((d) => d.partnerId === filters.partnerId);
      if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(
          (d) => d.title.toLowerCase().includes(s) || d.customer.toLowerCase().includes(s),
        );
      }
      return { items: filtered, total: filtered.length, page: 1, pageSize: filtered.length };
    }
  },

  getById: async (id: string): Promise<Deal | null> => {
    try {
      const snapshot = await getDoc(doc(db, COLLECTION, id));
      if (snapshot.exists()) return { id: snapshot.id, ...snapshot.data() } as Deal;
    } catch {}
    return DEALS.find((d) => d.id === id) || null;
  },

  create: async (deal: Omit<Deal, 'id'>): Promise<Deal> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION), deal);
      return { id: docRef.id, ...deal };
    } catch {
      throw new Error('Failed to create deal');
    }
  },

  update: async (id: string, data: Partial<Deal>): Promise<void> => {
    try {
      await updateDoc(doc(db, COLLECTION, id), data);
    } catch {
      throw new Error('Failed to update deal');
    }
  },

  getStats: () => DEAL_STATS,
};
