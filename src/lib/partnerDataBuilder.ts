import type { Partner, PartnerDetails, PartnerContact } from '../types';

// Generate random pipeline values based on tier
function generatePipeline(tier: string): { registered: number; solution: number; commercial: number; won: number } {
  const tierMultiplier: Record<string, number> = {
    Diamond: 5, Platinum: 4, Gold: 3, Silver: 2, Registered: 1, Premier: 3.5, Standard: 1.5
  };
  const base = tierMultiplier[tier] || 1;
  const registered = Math.floor(Math.random() * 5000000 * base) + 1000000 * base;
  const solution = Math.floor(registered * (0.4 + Math.random() * 0.3));
  const commercial = Math.floor(solution * (0.3 + Math.random() * 0.4));
  const won = Math.floor(registered * (0.2 + Math.random() * 0.3));
  return { registered, solution, commercial, won };
}

// Generate MDF data
function generateMDF(tier: string, years: number): { total: number; used: number; remaining: number; activities: any[] } {
  const tierBudget: Record<string, number> = {
    Diamond: 1000000, Platinum: 750000, Gold: 500000, Silver: 200000, Registered: 50000, Premier: 600000, Standard: 100000
  };
  const total = tierBudget[tier] || 100000;
  const used = Math.floor(total * (0.3 + Math.random() * 0.6));
  const remaining = total - used;
  
  const activityNames = [
    '行业沙龙', '技术研讨会', '客户答谢会', '产品发布会', '渠道培训', '线上直播', '展会参展', '联合营销'
  ];
  const activities = [];
  const activityCount = Math.floor(Math.random() * 4) + 1;
  for (let i = 0; i < activityCount; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    activities.push({
      name: activityNames[Math.floor(Math.random() * activityNames.length)],
      date: date.toISOString().split('T')[0],
      leads: Math.floor(Math.random() * 100) + 20,
    });
  }
  
  return { total, used, remaining, activities };
}

// Generate milestones based on years of partnership
function generateMilestones(years: number, partnerName: string): any[] {
  if (years < 1) return [];
  const milestones = [];
  const templates = [
    `${partnerName} 成为认证合作伙伴`,
    `完成首批工程师认证培训`,
    `签署联合业务计划 (JBP)`,
    `达成年度业绩目标`,
    `升级为 ${['Gold', 'Platinum', 'Diamond'][Math.floor(Math.random() * 3)]} 合作伙伴`,
    `成功交付标杆项目`,
    `获得行业认证资质`,
    `扩展合作区域`,
  ];
  
  for (let i = 0; i < Math.min(years, 5); i++) {
    const year = new Date().getFullYear() - i;
    milestones.push({
      year: String(year),
      stage: ['起步阶段', '成长阶段', '成熟阶段', '领先阶段'][Math.min(i, 3)],
      description: templates[Math.floor(Math.random() * templates.length)],
      link: '#',
    });
  }
  return milestones.reverse();
}

// Generate top projects
function generateTopProjects(partnerName: string): any[] {
  const projectNames = [
    `${partnerName} - 数字化转型项目`,
    `${partnerName} - 云迁移项目`,
    `${partnerName} - 数据中心建设`,
    `${partnerName} - 智能运维平台`,
    `${partnerName} - 灾备解决方案`,
    `${partnerName} - 混合云架构`,
    `${partnerName} - 安全合规项目`,
  ];
  const projects = [];
  const count = Math.floor(Math.random() * 4) + 1;
  for (let i = 0; i < count; i++) {
    projects.push({
      name: projectNames[Math.floor(Math.random() * projectNames.length)],
      amount: Math.floor(Math.random() * 5000000) + 500000,
      progress: Math.floor(Math.random() * 100),
      closeDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  }
  return projects;
}

// Auto-build org structure from contact titles
function buildOrgFromContacts(contacts: PartnerContact[]) {
  if (!contacts || contacts.length === 0) return [];
  const levels: Record<string, { keywords: string[]; role: string }> = {
    executive: { keywords: ['总经理','总裁','CEO','董事长','创始人','owner','founder','president','director','合伙人'], role: '决策层' },
    management: { keywords: ['总监','经理','manager','director','supervisor','主管','lead','head'], role: '管理层' },
    sales: { keywords: ['销售','sales','客户','account','渠道','channel','bd','business development'], role: '销售' },
    technical: { keywords: ['工程师','engineer','技术','technical','开发','dev','架构','architect','运维','support','it'], role: '技术' },
    business: { keywords: ['商务','行政','admin','hr','人事','财务','finance','法务','legal','采购','purchasing'], role: '商务' },
  };
  const groups: Record<string, any[]> = {};
  const seen = new Set<string>();

  for (const c of contacts) {
    const key = `${c.lastName}${c.firstName}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const title = (c.title || '').toLowerCase();
    let role = '其他';
    for (const [level, cfg] of Object.entries(levels)) {
      if (cfg.keywords.some(k => title.includes(k))) { role = cfg.role; break; }
    }
    if (!groups[role]) groups[role] = [];
    const name = [c.lastName, c.firstName].filter(Boolean).join('') || c.email || '-';
    groups[role].push({ role, name, department: c.title || '', note: c.email || c.phone || '' });
  }

  const result: any[] = [];
  const order = ['决策层', '管理层', '销售', '技术', '商务', '其他'];
  for (const role of order) {
    if (groups[role]) result.push(...groups[role]);
  }
  return result;
}

// Build PartnerDetails from a real Partner record.
// Uses DB values when available, derives from contacts as fallback.

export function buildPartnerDetails(partner: Partner): PartnerDetails {
  const contacts = partner.contacts || [];
  const contactCount = contacts.length;

  // years: from DB or startDate
  let years = partner.years || 0;
  if (!years && partner.startDate) {
    const d = new Date(partner.startDate);
    if (!isNaN(d.getTime())) years = new Date().getFullYear() - d.getFullYear();
  }
  years = Math.max(0, years);

  // winRate: from DB, fallback to tier-based default
  const tierWinRates: Record<string, number> = {
    Diamond: 75, Platinum: 70, Gold: 65, Silver: 55, Registered: 45, Premier: 68, Standard: 50
  };
  const winRate = (partner as any).winRate ?? partner.winRate ?? tierWinRates[partner.tier] ?? 50;

  // Pipeline: from DB columns, fallback to generated values
  const dbPipeline = {
    registered: Number((partner as any).pipeline_registered || 0),
    solution: Number((partner as any).pipeline_solution || 0),
    commercial: Number((partner as any).pipeline_commercial || 0),
    won: Number((partner as any).pipeline_won || 0),
  };
  const hasDbPipeline = Object.values(dbPipeline).some(v => v > 0);
  const pipeline = hasDbPipeline ? dbPipeline : generatePipeline(partner.tier);

  // MDF: from DB columns, fallback to generated values
  const mdfTotal = Number((partner as any).mdf_total || 0);
  const mdfUsed = Number((partner as any).mdf_used || 0);
  const hasDbMDF = mdfTotal > 0 || mdfUsed > 0;
  const mdf = hasDbMDF 
    ? { total: mdfTotal, used: mdfUsed, remaining: mdfTotal - mdfUsed, activities: [] as any[] }
    : generateMDF(partner.tier, years);

  // Enablement: from DB columns, fallback to contacts-derived
  const certifiedEngineers = (partner as any).certified_engineers ?? (contactCount > 0 ? Math.max(1, Math.round(contactCount * 0.4)) : 2);
  const specialists = (partner as any).specialists_count ?? (contactCount > 3 ? Math.round(contactCount * 0.15) : 0);
  const expiryRiskCount = (partner as any).expiry_risk_count ?? (certifiedEngineers > 0 ? Math.floor(Math.random() * Math.ceil(certifiedEngineers * 0.3)) : 0);
  const expiryDays = (partner as any).expiry_days ?? (expiryRiskCount > 0 ? Math.floor(Math.random() * 60) + 1 : 0);

  // Follow-ups
  const followUps: any[] = [];
  if (expiryRiskCount > 0) {
    followUps.push({
      id: `${partner.id}-fu-cert`, title: `安排 ${expiryRiskCount} 位工程师完成认证续期`,
      status: 'In Progress', priority: 'High',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      owner: partner.manager || '渠道经理', category: 'Enablement',
    });
  }
  if (mdf.total > 0 && mdf.used < mdf.total * 0.5) {
    followUps.push({
      id: `${partner.id}-fu-mdf`, title: `提交 MDF 使用方案（剩余 ¥${mdf.remaining.toLocaleString()}）`,
      status: 'Pending', priority: 'Medium',
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      owner: partner.manager || '渠道经理', category: 'Marketing',
    });
  }
  if (partner.status === 'Prospective') {
    followUps.push({
      id: `${partner.id}-fu-new`, title: `审核并批复「${partner.name}」的合作申请`,
      status: 'Pending', priority: 'High',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      owner: partner.manager || '渠道经理', category: 'Operations',
    });
  }

  // Top projects: from DB, fallback to generated
  const dbTopProjects = (partner as any).top_projects || [];
  const topProjects = dbTopProjects.length > 0 ? dbTopProjects : generateTopProjects(partner.name);

  // Organization: from DB, or auto-built from contacts
  const orgStructure = (partner as any).org_structure && (partner as any).org_structure.length > 0
    ? (partner as any).org_structure
    : buildOrgFromContacts(contacts);

  // Insight layer data: from DB
  const tierHistory = (partner as any).tier_history || [];
  const customerPortfolio = (partner as any).customer_portfolio || [];
  const ecosystemPartnersData = (partner as any).ecosystem_partners || [];
  const subPartnersData = (partner as any).sub_partners || [];
  const strategyRecommendations = (partner as any).strategy_recommendations || [];
  
  // Milestones: from DB, fallback to generated
  const dbMilestones = (partner as any).milestones || [];
  const milestones = dbMilestones.length > 0 ? dbMilestones : generateMilestones(years, partner.name);
  
  const qbrRecords = (partner as any).qbr_records || [];
  const cooperationPlans = (partner as any).cooperation_plans || [];
  const activitiesLog = (partner as any).activities_log || [];

  return {
    ...partner,
    winRate,
    startDate: partner.startDate || '',
    years,
    pipeline,
    mdf,
    enablement: { certifiedEngineers, specialists, expiryRiskCount, expiryDays },
    followUps,
    topProjects,
    orgStructure,
    milestones,
    qbrRecords,
    cooperationPlans,
    activitiesLog,
    tierHistory,
    customerPortfolio,
    ecosystemPartners: ecosystemPartnersData,
    subPartners: subPartnersData,
    strategyRecommendations,
  };
}
