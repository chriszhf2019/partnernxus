import { useMemo, useRef } from 'react';
import {
  DEALS,
  ACTIVITIES,
  PARTNER_DETAILS,
  DEAL_STATS,
  DASHBOARD_STATS,
  MDF_STATS,
  MDF_MONTHLY_ACTIVITIES,
  INCENTIVE_PROGRAMS,
  INCENTIVE_STATS,
  MATRIX_DATA,
  NETWORK_NODES,
  NETWORK_LINKS,
} from '../constants';
import { IMPORTED_PARTNERS } from '../data/importedPartners';
import { getMockCockpitData } from '../lib/mockGenerator';
import type { CockpitData, Partner } from '../types';

export function usePartners() {
  const partnerListRef = useRef<Partner[]>(IMPORTED_PARTNERS);
  return useMemo(() => ({
    partners: IMPORTED_PARTNERS,
    partnerDetails: PARTNER_DETAILS,
    partnerListRef,
  }), []);
}

export function useDeals() {
  return useMemo(() => ({ deals: DEALS, stats: DEAL_STATS }), []);
}

export function useActivities() {
  return useMemo(() => ({ activities: ACTIVITIES }), []);
}

export function useDashboardStats() {
  return useMemo(() => ({ stats: DASHBOARD_STATS }), []);
}

export function useMarketingData() {
  return useMemo(() => ({
    mdfStats: MDF_STATS,
    mdfActivities: MDF_MONTHLY_ACTIVITIES,
    incentivePrograms: INCENTIVE_PROGRAMS,
    incentiveStats: INCENTIVE_STATS,
  }), []);
}

export function useMatrixData() {
  return useMemo(() => ({ data: MATRIX_DATA }), []);
}

export function useNetworkData() {
  return useMemo(() => ({ nodes: NETWORK_NODES, links: NETWORK_LINKS }), []);
}

export function useCockpitData(): CockpitData {
  return useMemo(() => getMockCockpitData(), []);
}
