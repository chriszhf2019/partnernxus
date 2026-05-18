export type PartnerTier = 'Platinum' | 'Gold' | 'Silver' | 'Registered' | 'Diamond' | 'Premier' | 'Standard';
export type PartnerStatus = 'Cooperating' | 'Inactive' | 'Prospective';
export type PartnerType = 'Reseller' | 'ISV' | 'OEM' | 'Service' | 'VAD' | 'VAR' | 'SI';
export type DealStatus = 'Pending' | 'Approved' | 'Rejected' | 'Converted' | 'Closed Won' | 'Closed Lost';

export interface PartnerContact {
  salutation?: string;
  firstName: string;
  lastName: string;
  title: string;
  phone: string;
  mobile: string;
  email: string;
  isPrimary: boolean;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  tier: PartnerTier;
  status: PartnerStatus;
  type: PartnerType;
  manager: string;
  location: string;
  region: string;
  startDate: string;
  years: number;
  prevTier: PartnerTier;
  tags: string[];
  winRate: number;
  contacts: PartnerContact[];
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
  yoy: number; // 同比
  qoq: number; // 季环比
  mom: number; // 月环比
  linear_rate: number; // 季度线性度
  
  // 达成率多维度透视
  achievements: {
    monthly: AchievementData;
    quarterly: AchievementData;
    yearly: AchievementData;
  };

  // 活跃度拆分 (仅针对活跃伙伴)
  active_split?: {
    order_placing: { value: number; target: number; rate: number; yoy: number; qoq: number };
    leads_reporting: { value: number; target: number; rate: number; yoy: number; qoq: number };
    pmdf_partners: { value: number; target: number; rate: number; yoy: number; qoq: number };
    incentive_participants: { value: number; target: number; rate: number; yoy: number; qoq: number };
  };

  // Pipeline 拆分 (仅针对 Pipeline)
  pipeline_batch?: {
    current_q_target: number; // 当季结单预期
    next_q_count: number;     // 下季储备数量
    new_in_q_ratio: number;   // 当季新增占比
    historical_ratio: number; // 历史积存占比
    historical_amount: number;
    new_amount: number;
  };

  // 转化效率 (仅针对线索转化率)
  conversion_details?: {
    cycle_days: number; // 转化周期
    funnel_stages: {
      stage: string;
      count: number;
    }[];
  };

  // 营销与激励 (仅针对 Marketing)
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

  // Strategic Summary for Revenue Overview
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

  // 维度达成 (用于下钻视图)
  dimensional_achievements?: {
    type: 'region' | 'channel_type' | 'team' | 'channel' | 'industry' | 'order_size' | 'product_expertise' | 'partner_tier' | 'partner_type' | 'geo_coverage' | 'industry_vertical' | 'tier_role' | 'product_breadth' | 'customer_segment' | 'activity_health' | 'campaigns' | 'incentive_tracker' | 'certification_hub' | 'regional_roi' | 'deals_tracking' | 'conversion_velocity' | 'source_efficiency' | 'win_loss_analysis';
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
      // New fields for granular partner analysis
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

  // 营销与激励概览 (模块三)
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

  // 商机报备与流转概览 (模块四)
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

  // 渠道覆盖与生态合作 (针对活跃伙伴/合作伙伴看板)
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
  salesStages: string[];
  industries: string[];
  regions: string[];
  currency: 'CNY' | 'USD' | 'JPY';
}
