import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
  zh: {
    // Sidebar
    'nav.ecosystem': '生态概览',
    'nav.partners': '合作伙伴清单',
    'nav.deals': '商机报备',
    'nav.marketing': '营销与激励',
    'nav.settings': '设置',
    
    // Dashboard
    'dashboard.title': '生态系统驾驶舱',
    'dashboard.subtitle': '实时监控伙伴表现、商机漏斗与赋能进度。',
    'dashboard.activePartners': '活跃合作伙伴',
    'dashboard.pipelineValue': '商机池总额',
    'dashboard.revenueAchievement': '业绩达成率',
    'dashboard.leadsConversion': '线索转化率',
    
    // Partner List
    'partners.title': '合作伙伴管理中心',
    'partners.subtitle': '多维筛选、分级管理与战略协同。',
    'partners.search': '搜索合作伙伴名称、标签或负责人...',
    'partners.add': '新增合作伙伴',
    
    // Deal Registration
    'deals.title': '商机报备管理',
    'deals.subtitle': '实时监控报备状态、审批流与全生命周期追踪。',
    'deals.yearNew': '今年新增',
    'deals.quarterNew': '本季新增',
    'deals.monthNew': '本月新增',
    'deals.weekNew': '本周新增',
    'deals.rejected': '已拒绝',
    'deals.closed': '已结单',
    'deals.pendingTab': '待批复报备',
    'deals.allTab': '全部报备清单',
    'deals.add': '新增报备',
    'deals.step1': '基本信息',
    'deals.step2': '项目详情',
    'deals.step3': '提交审核',
    'deals.partnerName': '合作伙伴名称',
    'deals.customerName': '最终客户名称',
    'deals.projectTitle': '项目标题',
    'deals.dealValue': '预估商机金额 ($)',
    'deals.closeDate': '预计结单日期',
    'deals.description': '商机描述',
    'deals.documents': '支持文档',
    'deals.upload': '点击上传或拖拽文件',
    'deals.uploadLimit': 'PDF, DOCX, 或 XLSX (最大 10MB)',
    'deals.next': '下一步',
    'deals.prev': '上一步',
    'deals.submit': '提交报备',
    'deals.success': '报备提交成功！',
    'deals.successDesc': '您的商机报备已进入审批流程，我们将在 24 小时内完成初审。',
    
    // Dashboard Charts
    'charts.revenueTrend': '业绩达成趋势',
    'charts.partnerDistribution': '合作伙伴等级分布',
    'charts.pipelineFunnel': '商机漏斗分析',
    'charts.conversionRate': '转化率趋势',
    
    // Strategic Matrix
    'matrix.title': '行业 × 区域 覆盖沙盘',
    'matrix.headcount': '伙伴数量',
    'matrix.pipeline': '商机产出',
    'matrix.mdf': '资源投放',
    'matrix.target': '白地招募',
    'matrix.crowded': '拥挤/内卷',
    'matrix.recommendation': '匹配伙伴推荐',
    'matrix.assignLead': '派发商机',
    'matrix.viewAll': '查看该区域所有伙伴',
    
    // Capability Graph
    'graph.title': '生态画像与能力聚合网络',
    'graph.history': '历史协同网络',
    'graph.capability': '属性共性图谱',
    'graph.targetCohort': '精准靶向群体',
    'graph.matchmaking': '精准寻源',
    'graph.playbook': '规模化策略执行',
    'graph.execute': '确认并执行 Playbook',
    
    'marketing.title': '联合营销与激励管理',
    'marketing.subtitle': '通过战略协同驱动增长。',
    'marketing.mdfTab': 'MDF 市场基金',
    'marketing.incentiveTab': '联合激励计划',
    'marketing.essence': '营销本质',
    'marketing.essenceDesc': '需求创造、品牌沉淀与价值共创。',
    'marketing.core': '核心目标',
    'marketing.coreDesc': '精准获客、伙伴赋能与业绩转化。',
    'marketing.methods': '执行方式',
    'marketing.methodsDesc': '多维触达、全链路追踪与闭环管理。',
    'marketing.funnel': '营销漏斗转化 (Campaign Funnel)',
    'marketing.awareness': '品牌感知',
    'marketing.consideration': '方案考量',
    'marketing.conversion': '商机转化',
    'marketing.roi': '投入产出比',
    'marketing.toolkit': '营销工具包',
    'marketing.bestPractices': '最佳实践',
    
    // Common
    'common.back': '返回',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.status': '状态',
    'common.actions': '操作',
    'common.loading': '加载中...',
    'common.noData': '暂无数据',
    'common.error': '出现错误',
    'common.retry': '重试',
    'common.export': '导出',
    'common.viewAll': '查看全部',
    'common.viewDetails': '查看详情',
    'common.close': '关闭',

    // Partner Profile
    'profile.backToList': '返回合作伙伴列表',
    'profile.export360': '导出 360° 报告',
    'profile.initiateJBP': '发起 JBP 会议',
    'profile.pipelineTab': '商机与漏斗',
    'profile.marketingTab': '联合营销与基金',
    'profile.enablementTab': '赋能与认证',
    'profile.followupsTab': '会议跟进',
    'profile.activityTimeline': '交互时间轴',
    'profile.nextAction': '下步关键行动',
    'profile.viewHistory': '查看完整交互历史',

    // New Deal Form
    'newDeal.title': 'Register New Deal',
    'newDeal.subtitle': 'Curating new opportunities within the enterprise network.',

    // Ecosystem Dashboard sections
    'eco.title': '生态全景驾驶舱 (Master Cockpit)',
    'eco.subtitle': '思维可视化 · 结果 → 诊断 → 执行',
    'eco.updated': 'Last Updated',
    'eco.section1': '01. 业绩概览 (Performance Outlook)',
    'eco.section2': '02. 生态合作驱动力',
    'eco.section3': '03. 商机储备与转化漏斗',
    'eco.section4': '04. 营销赋能与激励效能',
    'eco.diagnosis': '四力驱动诊断 (Diagnosis Engine)',
    'eco.deepDive': '执行深度透视 (Execution Deep Dive)',
    'eco.filterRole': '角色',
    'eco.filterIndustry': '行业',
    'eco.filterTier': '级别',
    'eco.clearAll': 'Clear All',

    // Footer
    'footer.secure': 'Secure Enterprise Connection',
    'footer.assistance': 'Need assistance?',
  },
  en: {
    // Sidebar
    'nav.ecosystem': 'Ecosystem',
    'nav.partners': 'Partner List',
    'nav.deals': 'Deal Registration',
    'nav.marketing': 'Marketing & Incentives',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.title': 'Ecosystem Dashboard',
    'dashboard.subtitle': 'Real-time monitoring of partner performance, pipeline, and enablement.',
    'dashboard.activePartners': 'Active Partners',
    'dashboard.pipelineValue': 'Pipeline Value',
    'dashboard.revenueAchievement': 'Revenue Achievement',
    'dashboard.leadsConversion': 'Leads Conversion',
    
    // Partner List
    'partners.title': 'Partner Management',
    'partners.subtitle': 'Multi-dimensional filtering, tiering, and strategic collaboration.',
    'partners.search': 'Search partner name, tags, or manager...',
    'partners.add': 'Add Partner',
    
    // Deal Registration
    'deals.title': 'Deal Registration',
    'deals.subtitle': 'Real-time monitoring of status, approval flow, and lifecycle tracking.',
    'deals.yearNew': 'Year New',
    'deals.quarterNew': 'Quarter New',
    'deals.monthNew': 'Month New',
    'deals.weekNew': 'Week New',
    'deals.rejected': 'Rejected',
    'deals.closed': 'Closed',
    'deals.pendingTab': 'Pending Approval',
    'deals.allTab': 'All Deals',
    'deals.add': 'New Deal',
    'deals.step1': 'Basic Info',
    'deals.step2': 'Project Details',
    'deals.step3': 'Review & Submit',
    'deals.partnerName': 'Partner Name',
    'deals.customerName': 'End Customer Name',
    'deals.projectTitle': 'Project Title',
    'deals.dealValue': 'Estimated Deal Value ($)',
    'deals.closeDate': 'Expected Close Date',
    'deals.description': 'Deal Description',
    'deals.documents': 'Supporting Documents',
    'deals.upload': 'Click to upload or drag and drop',
    'deals.uploadLimit': 'PDF, DOCX, or XLSX (max 10MB)',
    'deals.next': 'Next Step',
    'deals.prev': 'Previous',
    'deals.submit': 'Submit Registration',
    'deals.success': 'Registration Submitted!',
    'deals.successDesc': 'Your deal registration has entered the approval flow. We will complete the review within 24 hours.',
    
    // Dashboard Charts
    'charts.revenueTrend': 'Revenue Achievement Trend',
    'charts.partnerDistribution': 'Partner Tier Distribution',
    'charts.pipelineFunnel': 'Pipeline Funnel Analysis',
    'charts.conversionRate': 'Conversion Rate Trend',
    
    // Strategic Matrix
    'matrix.title': 'Industry × Region Matrix',
    'matrix.headcount': 'Headcount',
    'matrix.pipeline': 'Pipeline',
    'matrix.mdf': 'MDF Investment',
    'matrix.target': 'Target Recruitment',
    'matrix.crowded': 'Crowded/Saturated',
    'matrix.recommendation': 'Partner Recommendations',
    'matrix.assignLead': 'Assign Lead',
    'matrix.viewAll': 'View All Partners in Region',
    
    // Capability Graph
    'graph.title': 'Capability & Profile Network',
    'graph.history': 'Collaboration History',
    'graph.capability': 'Attribute Map',
    'graph.targetCohort': 'Target Cohort',
    'graph.matchmaking': 'Matchmaking',
    'graph.playbook': 'Strategy Execution',
    'graph.execute': 'Confirm & Execute Playbook',
    
    // Marketing
    'marketing.title': 'Marketing & Incentives',
    'marketing.subtitle': 'Drive growth through strategic collaboration.',
    'marketing.mdfTab': 'MDF Funds',
    'marketing.incentiveTab': 'Incentive Programs',
    'marketing.essence': 'Marketing Essence',
    'marketing.essenceDesc': 'Demand generation, brand building, and value co-creation.',
    'marketing.core': 'Core Objectives',
    'marketing.coreDesc': 'Targeted acquisition, partner enablement, and conversion.',
    'marketing.methods': 'Execution Methods',
    'marketing.methodsDesc': 'Multi-dimensional reach, full-link tracking, and closed-loop management.',
    'marketing.funnel': 'Campaign Funnel',
    'marketing.awareness': 'Awareness',
    'marketing.consideration': 'Consideration',
    'marketing.conversion': 'Conversion',
    'marketing.roi': 'ROI Analysis',
    'marketing.toolkit': 'Marketing Toolkit',
    'marketing.bestPractices': 'Best Practices',
    
    // Common
    'common.back': 'Back',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.status': 'Status',
    'common.actions': 'Actions',
    'common.loading': 'Loading...',
    'common.noData': 'No Data',
    'common.error': 'An error occurred',
    'common.retry': 'Retry',
    'common.export': 'Export',
    'common.viewAll': 'View All',
    'common.viewDetails': 'View Details',
    'common.close': 'Close',

    // Partner Profile
    'profile.backToList': 'Back to Partner List',
    'profile.export360': 'Export 360° Report',
    'profile.initiateJBP': 'Initiate JBP Meeting',
    'profile.pipelineTab': 'Pipeline & Funnel',
    'profile.marketingTab': 'Joint Marketing & Funds',
    'profile.enablementTab': 'Enablement & Certification',
    'profile.followupsTab': 'Meeting Follow-ups',
    'profile.activityTimeline': 'Activity Timeline',
    'profile.nextAction': 'Next Key Action',
    'profile.viewHistory': 'View Complete History',

    // New Deal Form
    'newDeal.title': 'Register New Deal',
    'newDeal.subtitle': 'Curating new opportunities within the enterprise network.',

    // Ecosystem Dashboard sections
    'eco.title': 'Ecosystem Dashboard (Master Cockpit)',
    'eco.subtitle': 'Visual Thinking · Results → Diagnosis → Execution',
    'eco.updated': 'Last Updated',
    'eco.section1': '01. Performance Outlook',
    'eco.section2': '02. Ecosystem Drivers',
    'eco.section3': '03. Pipeline & Conversion Funnel',
    'eco.section4': '04. Marketing & Incentive Effectiveness',
    'eco.diagnosis': 'Four Forces Diagnosis Engine',
    'eco.deepDive': 'Execution Deep Dive',
    'eco.filterRole': 'Role',
    'eco.filterIndustry': 'Industry',
    'eco.filterTier': 'Tier',
    'eco.clearAll': 'Clear All',

    // Footer
    'footer.secure': 'Secure Enterprise Connection',
    'footer.assistance': 'Need assistance?',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
