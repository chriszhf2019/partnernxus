export type PartnerTier = 'Platinum' | 'Gold' | 'Silver' | 'Registered' | 'Diamond' | 'Premier' | 'Standard';
export type PartnerStatus = 'Cooperating' | 'Inactive' | 'Prospective';
export type PartnerType = 'Reseller' | 'ISV' | 'OEM' | 'Service' | 'VAD' | 'VAR' | 'SI';

export type DealLifecycleStage =
  | 'Registered'    // 已报备
  | 'UnderReview'   // 审批中
  | 'Approved'      // 已批复
  | 'Solution'      // 方案跟进
  | 'Commercial'    // 商务洽谈
  | 'ClosedWon'     // 赢单
  | 'ClosedLost';   // 丢单

export type DealStatus = 'Pending' | 'Approved' | 'Rejected' | 'Converted' | 'Closed Won' | 'Closed Lost';

export type DealSource =
  | 'PartnerInitiated'   // 伙伴自主报备
  | 'ChannelAssigned'    // 渠道经理指派
  | 'MDFCampaign'        // MDF活动转化
  | 'MarketingEvent'     // 市场活动
  | 'IncentiveProgram'   // 激励计划
  | 'Referral';          // 客户推荐

export type ConflictType =
  | 'SameCustomerSameProduct'   // 同客户同产品
  | 'SameCustomerSimilarProject' // 同客户相似项目
  | 'MultiPartnerSameDeal';     // 多伙伴同一商机

export interface Customer {
  id: string;
  name: string;
  industry: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  region: string;
  city: string;
  createdDate: string;
  totalDeals: number;
  totalValue: number;
  wonDeals: number;
}

export interface DealConflict {
  id: string;
  type: ConflictType;
  dealIds: string[];
  description: string;
  status: 'Pending' | 'Resolved' | 'Escalated';
  resolution?: string;
  resolvedBy?: string;
  resolvedDate?: string;
  createdDate: string;
}

export interface DealLifecycleEvent {
  stage: DealLifecycleStage;
  date: string;
  description: string;
  actor: string;
  durationDays?: number;
}

export interface DealConversionMetrics {
  registrationToApprovalDays: number;
  approvalToSolutionDays: number;
  solutionToCommercialDays: number;
  commercialToCloseDays: number;
  totalCycleDays: number;
  isOverdue: boolean;
  expectedCloseDate: string;
}

export interface DealSourceInfo {
  source: DealSource;
  relatedCampaignId?: string;
  relatedEventId?: string;
  incentiveProgramId?: string;
  referralPartnerId?: string;
  leadQuality: 'Hot' | 'Warm' | 'Cold';
  initialContactDate?: string;
}

export interface Deal {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  customerIndustry: string;
  value: number;
  partnerId: string;
  partnerName: string;
  partnerType: PartnerType;
  stage: DealLifecycleStage;
  status: DealStatus;
  region: string;
  province?: string;
  city?: string;
  salesName: string;
  salesTeam: string;
  productType: string;
  createdDate: string;
  lastActivityDate: string;
  expectedCloseDate: string;
  actualCloseDate?: string;
  isPriority?: boolean;
  hasConflict?: boolean;
  conflictId?: string;
  lifecycle: DealLifecycleEvent[];
  conversionMetrics?: DealConversionMetrics;
  sourceInfo?: DealSourceInfo;
  description?: string;
  notes?: string;
  nextAction?: string;
  nextActionDate?: string;
  relatedDeals?: string[];
  parentDealId?: string;
}

export interface DealRegistrationStats {
  yearNew: number;
  quarterNew: number;
  monthNew: number;
  weekNew: number;
  rejected: number;
  closed: number;
  totalPipelineValue: number;
  avgCycleDays: number;
  conversionRate: number;
  stageDistribution: Record<DealLifecycleStage, number>;
  sourceDistribution: Record<DealSource, number>;
  conflictCount: number;
  overdueCount: number;
}

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

// ── Activity ─────────────────────────────────────────
export interface Activity {
  id: string;
  type: 'signing' | 'registration' | 'visit' | 'milestone' | 'deal_update' | 'partner_approved' | 'deal_created' | 'mdf_submitted' | 'deal_won' | 'enablement_cert';
  title: string;
  description: string;
  date?: string;
  time?: string;
  timestamp?: string;
  user?: string;
  metadata?: Record<string, any>;
}

// ── Partner Detail Types ─────────────────────────────
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
  orgStructure?: any[];
  milestones?: any[];
  qbrRecords?: any[];
  activitiesLog?: any[];
  tierHistory?: any[];
  customerPortfolio?: any[];
  ecosystemPartners?: any[];
  strategyRecommendations?: any[];
}

// ── MDF & Incentive Types ────────────────────────────
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
  type?: string;
  quarter?: string;
  year?: number;
  trigger?: 'Pipeline Gap' | 'New Product' | 'Competitive' | 'Sales Acceleration';
  status: 'Active' | 'Upcoming' | 'Ended' | 'Planning';
  payoutType?: 'Rebate' | 'Cash' | 'Points';
  totalBudget?: number;
  budget?: number;
  used?: number;
  remaining?: number;
  claimedAmount?: number;
  participantsCount?: number;
  description?: string;
  startDate: string;
  endDate: string;
  targetDeals?: number;
  registeredDeals?: number;
  conversionRate?: number;
  topPartners?: any[];
  currentMonthPerformance?: {
    target: number;
    actual: number;
    growth: number;
  };
}

export interface IncentiveStats {
  totalActivePrograms?: number;
  totalPayoutYTD?: number;
  avgParticipationRate?: number;
  topTrigger?: string;
  totalBudget?: number;
  totalUsed?: number;
  totalRemaining?: number;
  activePrograms?: number;
  topEarners?: any[];
  topPerformers?: any[];
}

// ── Cockpit / Dashboard Types ────────────────────────
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
    funnel_stages: { stage: string; count: number }[];
  };
  marketing_details?: {
    pmdf_utilization: number;
    incentive_participation: number;
    roi_index: number;
    campaigns: { name: string; status: 'active' | 'completed'; budget: number }[];
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
    linearity_data: { month: string; plan: number; actual: number }[];
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
    tier_funnel: { tier: string; count: number; percentage: number }[];
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
  monthly_data: { month: string; value: number; qoq: number }[];
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
  productTypes?: string[];
  ctaButtonLabel?: string;
  partnerCenterUrl?: string;
  companyName?: string;
  companyNameEn?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  annualTarget?: string;
  quarterlyTarget?: string;
  partnerTarget?: string;
  channelRegions?: string;
  coreBusiness?: string;
  businessModel?: string;
  authorizedLevels?: string[];
  require2FA?: boolean;
  sessionTimeoutMin?: number;
  passwordMinLength?: number;
  loginAttempts?: number;
}

// ── Partner Staff Types ──────────────────────────────
export interface PointsRecord {
  id: string;
  staffId: string;
  type: 'training' | 'project' | 'certification' | 'activity' | 'bonus';
  points: number;
  source: string;
  description: string;
  date: string;
  operator: string;
}

export interface PartnerStaff {
  id: string;
  salutation?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  mobile: string;
  email: string;
  partnerId: string;
  partnerName: string;
  title: string;
  department: string;
  city: string;
  skills: string[];
  isPrimary: boolean;
  status: 'active' | 'inactive' | 'transferred';
  joinDate: string;
  points: number;
  pointsHistory: PointsRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkHistory {
  id: string;
  staffId: string;
  fromPartnerId: string;
  fromPartnerName: string;
  toPartnerId: string;
  toPartnerName: string;
  fromTitle: string;
  toTitle: string;
  changeDate: string;
  changeReason: string;
}

export interface StaffProject {
  id: string;
  staffId: string;
  dealId: string;
  dealTitle: string;
  partnerId: string;
  role: string;
  contribution: string;
  startDate: string;
  endDate?: string;
}

export interface StaffActivity {
  id: string;
  staffId: string;
  activityId: string;
  activityName: string;
  activityType: 'training' | 'activity' | 'meeting' | 'certification';
  points: number;
  attendanceDate: string;
  completionStatus: 'completed' | 'registered' | 'in_progress';
  certificate?: string;
}

export interface StaffCustomer {
  id: string;
  staffId: string;
  customerName: string;
  industry: string;
  contactPerson: string;
  contactPhone: string;
  annualRevenue: number;
  relationshipStart: string;
  keyProducts: string[];
}