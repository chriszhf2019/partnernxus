import { 
  Partner, 
  Deal, 
  Activity, 
  DashboardStats, 
  MatrixData, 
  NetworkNode, 
  NetworkLink,
  PartnerDetails,
  MDFStats,
  MDFMonthlyActivity,
  IncentiveProgram,
  IncentiveStats,
  DealRegistrationStats
} from './types';

export const PARTNER_DETAILS: PartnerDetails = {
  id: '1',
  name: '华东医卫云科技术有限公司',
  logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXS9FYi7XicrOOumDk0oS6rXLqcgz0gKRCEbJDmQU6FOtw-0T-xzUHPbpzBHLl7GIv8fapCoEcoJU-Mb-8CpaaP_Ybboitids6EsopxMaK7GPM3CYHfedlJPB4yUxAkmCe3YZ_wITMnRDFufcoXBEhE_p0OJs15Zz78mX3AAVV9RdPFB3EDpqjK51XO50Lr6IReH-mSD2h72KjvHkFHKnjFFwRu-ZOGjRdlZSJwJcfoY_xl7Ur3OIWA9pzikznuw42rkTZsUG7GsJS',
  tier: 'Diamond',
  status: 'Cooperating',
  type: 'ISV',
  manager: '陈伟 (Chen Wei)',
  location: '上海市徐汇区',
  region: '华东',
  startDate: '2018-05-20',
  years: 6,
  prevTier: 'Diamond',
  tags: ['ISV', '医疗行业', '信创入围'],
  winRate: 68,
  pipeline: {
    registered: 14200000,
    solution: 8500000,
    commercial: 3100000,
    won: 12800000
  },
  mdf: {
    total: 2500000,
    used: 2100000,
    remaining: 400000,
    activities: [
      { name: '华东医疗 CIO 沙龙', date: '2024-03-15', leads: 42 },
      { name: '智慧医院数字化转型研讨会', date: '2024-02-10', leads: 28 },
      { name: '信创医疗云生态合作伙伴大会', date: '2024-01-20', leads: 56 }
    ]
  },
  enablement: {
    certifiedEngineers: 24,
    specialists: 8,
    expiryRiskCount: 3,
    expiryDays: 14
  },
  followUps: [
    { id: 'f1', title: '提交 Q3 联合营销方案 (MDF 申请)', status: 'In Progress', priority: 'High', dueDate: '2024-09-25', owner: 'Alex Rivera', category: 'Marketing' },
    { id: 'f2', title: '安排 5 位架构师参加原厂高级认证培训', status: 'Pending', priority: 'High', dueDate: '2024-10-05', owner: '陈伟 (Chen Wei)', category: 'Enablement' },
    { id: 'f3', title: '对齐杭州数字孪生医院项目的最终报价', status: 'Completed', priority: 'Medium', dueDate: '2024-09-15', owner: 'Alex Rivera', category: 'Sales' },
    { id: 'f4', title: '更新 FY25 联合业务计划 (JBP) 最终版', status: 'Pending', priority: 'Medium', dueDate: '2024-09-30', owner: 'Alex Rivera', category: 'Operations' }
  ],
  topProjects: [
    { name: '浙江省立医院 CMS 升级项目', amount: 4500000, progress: 75, closeDate: '2024-10-20' },
    { name: '苏州市卫健委医疗数据湖', amount: 2800000, progress: 40, closeDate: '2024-11-15' },
    { name: '杭州市养老数字化平台', amount: 1200000, progress: 15, closeDate: '2024-12-05' }
  ],
  contacts: [],
};

export const PARTNERS: Partner[] = [
  {
    id: '1',
    name: '华东医卫云科技术有限公司',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXS9FYi7XicrOOumDk0oS6rXLqcgz0gKRCEbJDmQU6FOtw-0T-xzUHPbpzBHLl7GIv8fapCoEcoJU-Mb-8CpaaP_Ybboitids6EsopxMaK7GPM3CYHfedlJPB4yUxAkmCe3YZ_wITMnRDFufcoXBEhE_p0OJs15Zz78mX3AAVV9RdPFB3EDpqjK51XO50Lr6IReH-mSD2h72KjvHkFHKnjFFwRu-ZOGjRdlZSJwJcfoY_xl7Ur3OIWA9pzikznuw42rkTZsUG7GsJS',
    tier: 'Diamond',
    status: 'Cooperating',
    type: 'ISV',
    manager: '陈伟 (Chen Wei)',
    location: '上海市徐汇区',
    region: '华东',
    startDate: '2018-05-20',
    years: 6,
    prevTier: 'Diamond',
    tags: ['ISV', '医疗行业', '信创入围'],
    winRate: 68,
    contacts: [],
  },
  {
    id: '2',
    name: 'CloudScale Solutions',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqw2SPfdAFFhc_8_rqOYO41Dsleb0cpWwkQkvn1N96hHkBtJVfk9Px4O7VTluQzc15qgCNCZR_V9fbFvzC38rVIzPKU6_fIqWKeVSa0iC4N8r0F3He852kJu6pK9RoWP4QwNAS554E6xyVZvJMqIwc5c6LZ7EsRkxecSSv8l5v0vfro8QsY050guvLu5ydiXyKvOkw7O7mXIs8rDeTU3BJTIRqbvqFny4nsHJHHrnHYMC6cRsldLEx7XhSv3eo81SGpBZLADw7rXGX',
    tier: 'Gold',
    status: 'Cooperating',
    type: 'Reseller',
    manager: 'Sarah Jenkins',
    location: 'Austin, TX',
    region: 'North America',
    startDate: '2020-03-15',
    years: 4,
    prevTier: 'Silver',
    tags: ['Cloud', 'SaaS'],
    winRate: 72,
    contacts: [],
  },
  {
    id: '3',
    name: '北京泰德科技有限公司',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFdu7iidT_Mu6yYcrJjp0-2VCT-GYZRuQ0ucZUSzghvhQZf_ojgMeVsmcf2msxXQqE_rUraYuBqAAmoDIsJsG3Q8wa79nOQQgOT5xbKKldXJGX5wvHLYxedB7CKu0eyIA-ySAOSyEDgcO16eyRAy-w9jOxAiL2YI0NSpZ7VkYx2RHHj3Z2CXgcIOUclL5I0A-BDuyRI-d4QPynkzabwXNkxIrvTwYU9BlJJAc1TXHmVMjhS1HXZsBxx0uxpesnFP1w22iQlKchITln',
    tier: 'Platinum',
    status: 'Inactive',
    type: 'SI',
    manager: '张强 (Zhang Qiang)',
    location: '北京市海淀区',
    region: '华北',
    startDate: '2015-11-10',
    years: 8,
    prevTier: 'Platinum',
    tags: ['SI', '政务', '安全'],
    winRate: 45,
    contacts: [],
  },
  {
    id: '4',
    name: '深圳智联创新有限公司',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFIBYyHGM1Vh_z5dWOzCwBCANHPDd2805Skev55zI8IxmsjoJnPKr4M6YVSrTydBFzNkIxZkRliAYiU0lXHibuKzFLd5DNz0Bcx9P9PkGXeUqLyTcWwJHKQiqGQUVvVI__sFa4bgO7ElyI9irIAu4ujq4D4C6FCInkV8t6C5zdYX_olBjvJwZp8gAb4fQT-outcdsW5sUVHYBON3Jqmv29RVAkNWpd8xMTJxbxqiREXtJxgVnsJv-AWHMclhRVNKKb1aSHBou-zK6I',
    tier: 'Silver',
    status: 'Prospective',
    type: 'OEM',
    manager: '李娜 (Li Na)',
    location: '深圳市南山区',
    region: '华南',
    startDate: '2024-01-05',
    years: 0,
    prevTier: 'Registered',
    tags: ['OEM', '制造', 'AI'],
    winRate: 0,
    contacts: [],
  },
  {
    id: '5',
    name: '成都云图服务有限公司',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGZM3f_9DTCIhoIKZGOpkorRjOFyHc6BrSqE7rf36LH3mycmazoXnFuZYBNnTxJaw12hTarKQsC0IvBAZXx0deVVLoJfoIK2j8xtrzUEjgWte2mUQlNCbtAzdSD66neIn_QpPQDrZ_gogTMQKWJW4NnJ-7i37OFuEMW7xigt59CekPn3-LTO4ygjcT1UZYiifp73P4vC8aWppLWoi7sAVReqoJaekqLfqyi-2bUoLeKAi7wbrmiyzMYsTtSOpX8uJBCPvemgR4sEbA',
    tier: 'Registered',
    status: 'Cooperating',
    type: 'Service',
    manager: '王伟 (Wang Wei)',
    location: '成都市高新区',
    region: '西部',
    startDate: '2022-08-12',
    years: 2,
    prevTier: 'Registered',
    tags: ['Service', '运维', '咨询'],
    winRate: 55,
    contacts: [],
  }
];

export const DEAL_STATS: DealRegistrationStats = {
  yearNew: 156,
  quarterNew: 42,
  monthNew: 12,
  weekNew: 3,
  rejected: 8,
  closed: 24
};

export const DEALS: Deal[] = [
  {
    id: 'd1',
    title: '浙江省立医院 CMS 升级项目',
    customer: '浙江省立医院',
    value: 4500000,
    partnerId: '1',
    partnerName: '华东医卫云科技术有限公司',
    partnerType: 'ISV',
    status: 'Approved',
    region: '华东',
    salesName: '张伟',
    salesTeam: '医疗事业部',
    productType: '云原生平台',
    createdDate: '2024-08-15',
    endDate: '2024-12-31',
    isPriority: true,
    lifecycle: [
      { stage: 'Registered', date: '2024-08-15', description: '合作伙伴提交报备', actor: '陈伟' },
      { stage: 'Approved', date: '2024-08-17', description: '渠道经理审核通过', actor: 'Alex Rivera' }
    ]
  },
  {
    id: 'd2',
    title: '苏州市卫健委医疗数据湖',
    customer: '苏州市卫健委',
    value: 2800000,
    partnerId: '1',
    partnerName: '华东医卫云科技术有限公司',
    partnerType: 'ISV',
    status: 'Pending',
    region: '华东',
    salesName: '李娜',
    salesTeam: '政府事业部',
    productType: '大数据平台',
    createdDate: '2024-09-01',
    endDate: '2025-03-31',
    lifecycle: [
      { stage: 'Registered', date: '2024-09-01', description: '合作伙伴提交报备', actor: '陈伟' }
    ]
  },
  {
    id: 'd3',
    title: '上海瑞金医院 AI 辅助诊断系统',
    customer: '上海瑞金医院',
    value: 3200000,
    partnerId: '2',
    partnerName: '上海智医科技',
    partnerType: 'ISV',
    status: 'Rejected',
    region: '华东',
    salesName: '王强',
    salesTeam: '医疗事业部',
    productType: 'AI 智算平台',
    createdDate: '2024-08-20',
    endDate: '2024-11-30',
    hasConflict: true,
    lifecycle: [
      { stage: 'Registered', date: '2024-08-20', description: '合作伙伴提交报备', actor: '张三' },
      { stage: 'Rejected', date: '2024-08-22', description: '存在存量商机冲突', actor: 'Alex Rivera' }
    ]
  }
];

export const DASHBOARD_STATS: DashboardStats = {
  activePartners: { value: 1240, growth: 12.5 },
  pipelineValue: 45200000,
  revenueAchievement: 78,
  leadsConversion: 24.8
};

export const MATRIX_DATA: MatrixData[] = [
  { industry: '金融', region: '华北', count: 45 },
  { industry: '金融', region: '华东', count: 68 },
  { industry: '金融', region: '华南', count: 32 },
  { industry: '金融', region: '西部', count: 12 },
  { industry: '医疗', region: '华北', count: 28 },
  { industry: '医疗', region: '华东', count: 52 },
  { industry: '医疗', region: '华南', count: 41 },
  { industry: '医疗', region: '西部', count: 18 },
  { industry: '政务', region: '华北', count: 56 },
  { industry: '政务', region: '华东', count: 42 },
  { industry: '政务', region: '华南', count: 38 },
  { industry: '政务', region: '西部', count: 25 },
  { industry: '制造', region: '华北', count: 34 },
  { industry: '制造', region: '华东', count: 76 },
  { industry: '制造', region: '华南', count: 58 },
  { industry: '制造', region: '西部', count: 15 },
  { industry: '教育', region: '华北', count: 22 },
  { industry: '教育', region: '华东', count: 31 },
  { industry: '教育', region: '华南', count: 19 },
  { industry: '教育', region: '西部', count: 8 },
];

export const NETWORK_NODES: NetworkNode[] = [
  { id: 'n1', name: 'CloudScale', role: 'ISV', size: 80 },
  { id: 'n2', name: 'Global Systems', role: 'SI', size: 60 },
  { id: 'n3', name: 'Apex Networks', role: 'VAD', size: 100 },
  { id: 'n4', name: 'MediTech', role: 'ISV', size: 40 },
  { id: 'n5', name: 'FinTech Pro', role: 'VAR', size: 30 },
  { id: 'n6', name: 'SecureLink', role: 'SI', size: 50 },
  { id: 'n7', name: 'DataHub', role: 'ISV', size: 45 },
  { id: 'n8', name: 'SmartCity SI', role: 'SI', size: 55 },
  { id: 'n9', name: 'HealthConnect', role: 'ISV', size: 35 },
  { id: 'n10', name: 'GovTech Solutions', role: 'SI', size: 65 },
  { id: 'n11', name: 'Mainland Disti', role: 'VAD', size: 90 },
  { id: 'n12', name: 'Local VAR 01', role: 'VAR', size: 25 },
];

export const NETWORK_LINKS: NetworkLink[] = [
  { source: 'n3', target: 'n1', type: 'distribution' },
  { source: 'n3', target: 'n2', type: 'distribution' },
  { source: 'n1', target: 'n4', type: 'collaboration' },
  { source: 'n2', target: 'n6', type: 'collaboration' },
  { source: 'n1', target: 'n7', type: 'collaboration' },
  { source: 'n5', target: 'n3', type: 'distribution' },
  { source: 'n11', target: 'n8', type: 'distribution' },
  { source: 'n11', target: 'n10', type: 'distribution' },
  { source: 'n8', target: 'n9', type: 'collaboration' },
  { source: 'n10', target: 'n4', type: 'collaboration' },
  { source: 'n11', target: 'n12', type: 'distribution' },
  { source: 'n2', target: 'n10', type: 'collaboration' },
];

export const MDF_STATS: MDFStats = {
  annualQuota: 10000000,
  quarterlyQuota: 2500000,
  usedAmount: 1850000,
  remainingAmount: 650000,
  conversionRate: 28.5,
  activityDistribution: [
    { type: '行业沙龙', percentage: 35, count: 12 },
    { type: '线上研讨会', percentage: 25, count: 8 },
    { type: '展会赞助', percentage: 20, count: 4 },
    { type: '联合广告', percentage: 15, count: 6 },
    { type: '其他', percentage: 5, count: 2 }
  ]
};

export const MDF_MONTHLY_ACTIVITIES: MDFMonthlyActivity[] = [
  { id: 'm1', name: '华东区医疗数字化转型峰会', type: '行业沙龙', date: '2024-09-15', status: 'In Progress', budget: 450000, actualSpend: 320000, leadsGenerated: 145, progress: 75 },
  { id: 'm2', name: '云原生架构师线上特训营', type: '线上研讨会', date: '2024-09-22', status: 'Planning', budget: 120000, actualSpend: 0, leadsGenerated: 0, progress: 20 },
  { id: 'm3', name: '大湾区制造企业 CIO 闭门会', type: '行业沙龙', date: '2024-09-08', status: 'Completed', budget: 280000, actualSpend: 275000, leadsGenerated: 86, progress: 100 },
  { id: 'm4', name: '全国信创生态巡展 - 西安站', type: '展会赞助', date: '2024-09-28', status: 'Planning', budget: 550000, actualSpend: 150000, leadsGenerated: 0, progress: 45 }
];

export const INCENTIVE_PROGRAMS: IncentiveProgram[] = [
  {
    id: 'i1',
    title: 'Q3 医疗行业商机冲刺计划',
    trigger: 'Pipeline Gap',
    status: 'Active',
    payoutType: 'Rebate',
    totalBudget: 2000000,
    claimedAmount: 1250000,
    participantsCount: 45,
    description: '针对医疗行业新增报备商机，成交后额外返点 2%。',
    startDate: '2026-03-01',
    endDate: '2026-06-30',
    currentMonthPerformance: { target: 50000000, actual: 42000000, growth: 15.4 }
  },
  {
    id: 'i2',
    title: '新一代 AI 智算平台首发激励',
    trigger: 'New Product',
    status: 'Active',
    payoutType: 'Cash',
    totalBudget: 1500000,
    claimedAmount: 450000,
    participantsCount: 28,
    description: '首单 AI 智算平台项目，奖励渠道经理 5 万元现金。',
    startDate: '2026-02-15',
    endDate: '2026-05-15',
    currentMonthPerformance: { target: 10, actual: 6, growth: 20.0 }
  },
  {
    id: 'i3',
    title: '国产化替代竞争性专项激励',
    trigger: 'Competitive',
    status: 'Active',
    payoutType: 'Rebate',
    totalBudget: 3000000,
    claimedAmount: 800000,
    participantsCount: 15,
    description: '成功替换竞品 A 的项目，返点比例提升至 15%。',
    startDate: '2026-04-01',
    endDate: '2026-09-30',
    currentMonthPerformance: { target: 20, actual: 8, growth: -5.2 }
  },
  {
    id: 'i4',
    title: 'FY25 渠道开门红激励计划',
    trigger: 'Sales Acceleration',
    status: 'Ended',
    payoutType: 'Cash',
    totalBudget: 5000000,
    claimedAmount: 4850000,
    participantsCount: 120,
    description: '财年第一季度新签约伙伴专项激励。',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    currentMonthPerformance: { target: 100, actual: 105, growth: 5.0 }
  },
  {
    id: 'i5',
    title: '2025 双十一云产品大促激励',
    trigger: 'Sales Acceleration',
    status: 'Ended',
    payoutType: 'Rebate',
    totalBudget: 1000000,
    claimedAmount: 980000,
    participantsCount: 85,
    description: '双十一期间核心云产品销售返点翻倍。',
    startDate: '2025-11-01',
    endDate: '2025-11-15',
    currentMonthPerformance: { target: 200, actual: 195, growth: -2.5 }
  }
];

export const INCENTIVE_STATS: IncentiveStats = {
  totalActivePrograms: 8,
  totalPayoutYTD: 12450000,
  avgParticipationRate: 64.5,
  topTrigger: 'Pipeline Gap'
};

export const ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    type: 'signing',
    title: 'JBP Signing Ceremony',
    description: 'Joint Business Plan for FY25 officially signed by Regional VP Chen Wei.',
    date: 'SEP 12, 2024',
    time: '14:20'
  },
  {
    id: 'a2',
    type: 'registration',
    title: 'New Deal Registered',
    description: 'Project: Hangzhou Digital Twin Hospital. Estimated ¥3.5M.',
    date: 'SEP 10, 2024',
    time: '09:15'
  },
  {
    id: 'a3',
    type: 'visit',
    title: 'On-site Visit Record',
    description: 'Quarterly business review at HuaDong HQ. Key focus on ISV integration roadmap.',
    date: 'SEP 08, 2024',
    time: '16:45'
  },
  {
    id: 'a4',
    type: 'milestone',
    title: 'Enablement Milestone',
    description: '5 engineers completed the Advanced Healthcare Cloud Architect certification.',
    date: 'AUG 28, 2024',
    time: '11:30'
  }
];
