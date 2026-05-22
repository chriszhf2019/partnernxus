import { MDF_STATS, MDF_MONTHLY_ACTIVITIES, INCENTIVE_PROGRAMS, INCENTIVE_STATS } from '../constants';
import type { MDFStats, MDFMonthlyActivity, IncentiveProgram, IncentiveStats } from '../types';

export const marketingService = {
  getMDFStats: (): MDFStats => MDF_STATS,

  getMDFActivities: (): MDFMonthlyActivity[] => MDF_MONTHLY_ACTIVITIES,

  getIncentivePrograms: (): IncentiveProgram[] => INCENTIVE_PROGRAMS,

  getIncentiveStats: (): IncentiveStats => INCENTIVE_STATS,

  getIncentiveById: (id: string): IncentiveProgram | undefined =>
    INCENTIVE_PROGRAMS.find((p) => p.id === id),
};
