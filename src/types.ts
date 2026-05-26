export type PartnerTier = 'Platinum' | 'Gold' | 'Silver' | 'Registered' | 'Diamond' | 'Premier' | 'Standard';
export type PartnerStatus = 'Cooperating' | 'Inactive' | 'Prospective';
export type PartnerType = 'Reseller' | 'ISV' | 'OEM' | 'Service' | 'VAD' | 'VAR' | 'SI';
export type DealStatus = 'Pending' | 'Approved' | 'Rejected' | 'Converted' | 'Closed Won' | 'Closed Lost';

export interface JBPFormData {
  title: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  objectives: string[];
  participants: { name: string; role: string; side: string }[];
  agenda: { time: string; topic: string }[];
}

export interface PartnerContact {
  salutation?: string;
  firstName: string;
  lastName: string;
  title: string;
  department?: string;
  phone: string;
  mobile: string;
  email: string;
  isPrimary: boolean;
}

export interface Partner {
  id: string;
  name: string;
  englishName?: string;
  logo: string;
  website?: string;
  tier: PartnerTier;
  status: PartnerStatus;
  type: PartnerType;
  manager: string;
  location: string;
  region: string;
  province?: string;
  city?: string;
  district?: string;
  startDate: string;       // 批复时间
  applicationDate?: string; // 申请提交时间
  years: number;            // 自动计算: 当前年份 - startDate年份
  prevTier: PartnerTier;
  tags: string[];           // 批复时渠道经理添加
  winRate: number;          // 自动计算: 赢单/报备
  contacts: PartnerContact[];
  unifiedSocialCreditCode?: string;
  industry?: string;
  registeredAddress?: string;
  cooperationScope?: string;
  isCorePartner?: boolean;
}

export interface DealLifecycleEvent {
  stage: string;
  date: string;
  description: string;
  actor: string;
}

export interface Deal {
  id: string;
  title: string;
  customer: string;
  value: number;
  partnerId: string;
  partnerName: string;
  partnerType: PartnerType;
  status: DealStatus;
  region: string;
  salesName: string;
  salesTeam: string;
  productType: string;
  createdDate: string;
  endDate: string;
  isPriority?: boolean;
  hasConflict?: boolean;
  lifecycle: DealLifecycleEvent[];
  description?: string;
}

export interface DealRegistrationStats {
  yearNew: number;
  quarterNew: number;
  monthNew: number;
  weekNew: number;
  rejected: number;
  closed: number;
}

export interface DashboardStats {
  activePartners: { value: number; growth: number };
  pipelineValue: number;
  revenueAchievement: number;
  leadsConversion: number;
}

export interface MatrixData {
  industry: string;
  region: string;
  count: number;
}

export interface NetworkNode {
  id: string;
  name: string;
  role: 'VAD' | 'VAR' | 'ISV' | 'SI';
  size: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  type: 'distribution' | 'collaboration';
}

export interface PartnerPipeline {
  registered: number;
  solution: number;
  commercial: number;
  won: number;
}

export interface MDFData {
  total: number;
  used: number;
  remaining: number;
  activities: {
    name: string;
    date: string;
    leads: number;
  }[];
}

export interface EnablementData {
  certifiedEngineers: number;
  specialists: number;
  expiryRiskCount: number;
  expiryDays: number;
}

export interface FollowUpTask {
  id: string;
  title: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  owner: string;
  category: 'Sales' | 'Marketing' | 'Enablement' | 'Operations';
}

export interface CooperationPlan {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'Pending';
  description: string;
  revenueTarget?: number;
  actualRevenue?: number;
}

export interface CooperationRecord {
  id: string;
  date: string;
  type: 'meeting' | 'training' | 'activity' | 'deal' | 'other';
  title: string;
  description: string;
  participants: string[];
  outcome: string;
}

export interface SubPartner {
  id: string;
  name: string;
  type: PartnerType;
  contactPerson: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

export interface PartnerDetails extends Partner {
  pipeline: PartnerPipeline;
  mdf: MDFData;
  enablement: EnablementData;
  followUps: FollowUpTask[];
  topProjects: {
    name: string;
    amount: number;
    progress: number;
    closeDate: string;
  }[];
  cooperationPlans?: CooperationPlan[];
  cooperationRecords?: CooperationRecord[];
  subPartners?: SubPartner[];
}

export interface Activity {
  id: string;
  type: 'signing' | 'registration' | 'visit' | 'milestone';
  title: string;
  description: string;
  date: string;
  time: string;
}

export interface MDFStats {
  annualQuota: number;
  quarterlyQuota: number;
  usedAmount: number;
  remainingAmount: number;
  conversionRate: number;
  activityDistribution: { type: string; percentage: number; count: number }[];
}

export interface MDFMonthlyActivity {
  id: string;
  name: string;
  type: string;
  date: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'Cancelled';
  budget: number;
  actualSpend: number;
  leadsGenerated: number;
  progress: number;
}

export interface IncentiveProgram {
  id: string;
  title: string;
  trigger: 'Pipeline Gap' | 'New Product' | 'Competitive' | 'Sales Acceleration';
  status: 'Active' | 'Upcoming' | 'Ended';
  payoutType: 'Rebate' | 'Cash' | 'Points';
  totalBudget: number;
  claimedAmount: number;
  participantsCount: number;
  description: string;
  startDate: string;
  endDate: string;
  currentMonthPerformance: {
    target: number;
    actual: number;
    growth: number;
  };
}

export interface IncentiveStats {
  totalActivePrograms: number;
  totalPayoutYTD: number;
  avgParticipationRate: number;
  topTrigger: string;
}

export interface AchievementData {
  current: number;
  target: number;
  rate: number;
}

export interface TimeSeriesMetric {
  metric_name: string;
  current_value: number;
  yoy: number;
  qoq: number;
  mom: number;
  linear_rate: number;

  achievements: {
    monthly: AchievementData;
    quarterly: AchievementData;
    yearly: AchievementData;
  };

  active_split?: {
    order_placing: { value: number; target: number; rate: number; yoy: number; qoq: number };
    leads_reporting: { value: number; target: number; rate: number; yoy: number; qoq: number };
    pmdf_partners: { value: number; target: number; rate: number; yoy: number; qoq: number };
    incentive_participants: { value: number; target: number; rate: number; yoy: number; qoq: number };
  };

  pipeline_batch?: {
    current_q_target: number;
    next_q_count: number;
    new_in_q_ratio: number;
    historical_ratio: number;
    historical_amount: number;
    new_amount: number;
  };

  conversion_details?: {
    cycle_days: number;
    funnel_stages: {
      stage: string;
      count: number;
    }[];
  };

  marketing_details?: {
    pmdf_utilization: number;
    incentive_participation: number;
    roi_index: number;
    campaigns: {
      name: string;
      status: 'active' | 'completed';
      budget: number;
    }[];
  };

  strategic_revenue?: {
    achievement_amount: number;
    forecast_landing: number;
    pipeline_multiplier: number;
    forces: {
      coverage: 'healthy' | 'at_risk';
      activity: 'healthy' | 'at_risk';
      capability: 'healthy' | 'at_risk';
      will: 'healthy' | 'at_risk';
    };
    linearity_data: {
      month: string;
      plan: number;
      actual: number;
    }[];
  };

  dimensional_achievements?: {
    type: string;
    data: {
      name: string;
      current: number;
      target: number;
      rate: number;
      yoy?: number;
      qoq?: number;
      contribution_percent?: number;
      activity_rate?: number;
      new_recruits?: number;
      segment_tag?: 'Growth' | 'Harvesting' | 'Stable' | 'Risk';
      health_status?: 'healthy' | 'at_risk' | 'critical';
      power_scores?: {
        coverage: number;
        activity: number;
        contribution: number;
        capability: number;
      };
      sub_metrics?: {
        label: string;
        value: string | number;
        status?: 'success' | 'warning' | 'error';
        trend?: 'up' | 'down' | 'stable';
      }[];
      white_space_analysis?: {
        region: string;
        potential: string;
        gap: string;
      }[];
      analysis?: string;
      suggestion?: string;
    }[];
  }[];

  marketing_overview?: {
    activities: {
      completed: number;
      planned: number;
      categories: { label: string; value: number }[];
      yoy: number;
      mom: number;
    };
    yield: {
      attendance: number;
      leads: number;
      pipeline_gen: number;
      yoy_amount: number;
      mom_amount: number;
      target_rate: number;
    };
    incentives: {
      active_programs: number;
      payout_rate: number;
      revenue_contribution: number;
      yoy_participation: number;
      mom_participation: number;
      budget_consumption: number;
    };
    certification: {
      new_experts: number;
      target_experts: number;
      core_product_coverage: number;
      expiry_warning_count: number;
    };
  };

  reporting_overview?: {
    pipeline: {
      total_count: number;
      total_amount: number;
      target_achievement: number;
      yoy: number;
      mom: number;
    };
    approval: {
      submitted: number;
      approved: number;
      rejected: number;
      approval_rate: number;
      yoy_approved: number;
      mom_approved: number;
    };
    attribution: {
      sales_driven: number;
      pmdf_driven: number;
      incentive_driven: number;
      yoy: { sales: number; pmdf: number; incentive: number };
      mom: { sales: number; pmdf: number; incentive: number };
    };
    tier_contribution: {
      platinum: number;
      gold: number;
      silver: number;
      registered: number;
      yoy_active: number;
      mom_active: number;
    };
  };

  partner_ecosystem_details?: {
    coverage: {
      total: number;
      new_month: number;
      new_quarter: number;
      churn_quarter: number;
      growth_rate: number;
      yoy_quarter: number;
      qoq_quarter: number;
    };
    tier_funnel: {
      tier: string;
      count: number;
      percentage: number;
    }[];
    contribution_mix: {
      top_percent: number;
      revenue_percent: number;
    };
    health_radar: {
      coverage: number;
      activity: number;
      capability: number;
      will: number;
    };
    regional_coverage: {
      region: string;
      partner_count: number;
      city_count: number;
      new_cities: string[];
    }[];
  };

  monthly_data: {
    month: string;
    value: number;
    qoq: number;
  }[];
}

export interface AIInsight {
  type: 'trend' | 'risk' | 'opportunity';
  title: string;
  content: string;
  actionLabel: string;
  actionId: string;
}

export interface CockpitData {
  revenue: TimeSeriesMetric;
  activePartners: TimeSeriesMetric;
  pipeline: TimeSeriesMetric;
  leadsConversion: TimeSeriesMetric;
  marketing: TimeSeriesMetric;
  insights: AIInsight[];
}

export interface GlobalConfig {
  sections: {
    revenueAlignment: boolean;
    partnershipMatrix: boolean;
    ecosystemNetwork: boolean;
    mdfEfficiency: boolean;
  };
  partnerTiers: string[];
  partnerTypes: string[];
  partnerStatuses: string[];
  partnerVendors: string[];
  cooperationLevels: string[];
  salesStages: string[];
  industries: string[];
  regions: string[];
  currency: 'CNY' | 'USD' | 'JPY';
}
