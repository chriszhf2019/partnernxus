import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (date: string | Date) => string;
  formatNumber: (num: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
  zh: {
    // Sidebar
    'nav.dashboard': '工作台',
    'nav.partners': '合作伙伴',
    'nav.deals': '商机管理',
    'nav.marketing': '营销赋能',
    'nav.incentives': '激励政策',
    'nav.enablement': '赋能培训',
    'nav.analytics': '数据分析',
    'nav.settings': '设置',
    
    // Dashboard
    'dashboard.title': '工作台',
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
    'deals.title': '商机管理',
    'deals.subtitle': '报备、审批、全生命周期追踪。',
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
    'deals.export': '导出',
    'deals.search': '搜索项目、客户或合作伙伴...',
    'deals.results': '个结果',
    'deals.noResults': '没有找到商机',
    'deals.noResultsDesc': '尝试调整搜索条件或筛选器',
    'deals.colProject': '项目信息',
    'deals.colPartner': '合作伙伴',
    'deals.colSales': '销售',
    'deals.colAmount': '金额 / 周期',
    'deals.colStatus': '状态',
    'deals.colPriority': '优先级',
    'deals.colActions': '操作',
    'deals.priority': '优先',
    'deals.filterRegion': '区域',
    'deals.filterProduct': '产品',
    'deals.filterPartnerType': '伙伴类型',
    'deals.statusPending': '待审批',
    'deals.statusApproved': '已批复',
    'deals.statusRejected': '已拒绝',
    'deals.statusConverted': '已转化',
    'deals.statusClosedWon': '已赢单',
    'deals.statusClosedLost': '已丢单',
    'deals.pipelineTotal': 'Pipeline 总额',
    'deals.approvalRate': '审批通过率',
    'deals.closeRate': '结单率',
    'deals.pendingCount': '待审批',
    'deals.pendingSub': '需处理',
    'deals.breakdownByType': '按伙伴类型',
    'deals.breakdownByTier': '按伙伴等级 · 按区域',
    'deals.breakdownByProduct': '按产品/方案',
    'deals.funnelTitle': '报备→结单 转化漏斗',
    'deals.funnelRegistered': '报备',
    'deals.funnelApproved': '批复通过',
    'deals.funnelConverted': '转化商机',
    'deals.funnelWon': '赢单',
    'deals.funnelConvertRate': '转化',
    'deals.funnelLost': '流失',
    'deals.sourceTitle': '转化来源分析',
    'deals.sourcePartner': '伙伴自主报备',
    'deals.sourceManager': '渠道经理指派',
    'deals.sourceMDF': 'MDF 活动转化',
    'deals.cycleTitle': '报备周期分析',
    'deals.cycleRegToApp': '报备→批复',
    'deals.cycleAppToConv': '批复→转化',
    'deals.cycleConvToWon': '转化→赢单',
    'deals.cycleFull': '全周期',
    'deals.cycleTarget': '目标',
    'deals.bottleneck': '瓶颈识别',
    'deals.lifecycle': '生命周期',
    'deals.manageActions': '管理操作',
    'deals.approve': '批复通过',
    'deals.reject': '拒绝报备',
    'deals.convert': '转化为商机',
    'deals.editInfo': '修改报备信息',
    'deals.conflictCheck': '冲突检测',
    'deals.conflictYes': '检测到该客户已有存量商机报备，请仔细核对报备规则。',
    'deals.conflictNo': '未检测到存量商机冲突。',

    // Incentives
    'incentives.title': '激励政策管理',
    'incentives.subtitle': '返点、积分、排名——驱动合作伙伴业绩增长。',

    // Enablement
    'enablement.title': '赋能培训中心',
    'enablement.subtitle': '认证管理、课程体系与合作伙伴能力建设。',

    // Analytics
    'analytics.title': '数据分析',
    'analytics.subtitle': '业绩报表、渠道健康度与数据洞察。',

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
    
    'marketing.title': '营销赋能',
    'marketing.subtitle': 'MDF 基金、联合活动与市场资源管理。',
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

    // Channel Dashboard
    'channels.title': '营销渠道仪表盘',
    'channels.subtitle': '多渠道表现与支出分析',
    'channels.search': '搜索渠道...',
    'channels.dateRange': '日期范围',
    'channels.export': '导出',
    'channels.totalSpend': '总支出',
    'channels.roi': '投资回报率',
    'channels.conversions': '转化数',
    'channels.activeChannels': '活跃渠道',
    'channels.chartTitle': '多渠道表现趋势',
    'channels.chartSubtitle': '按月收入与支出',
    'channels.revenue': '收入',
    'channels.spend': '支出',
    'channels.tableTitle': '表现最佳渠道',
    'channels.viewAll': '查看全部',
    'channels.colChannel': '渠道',
    'channels.colSpend': '支出',
    'channels.colCtr': '点击率',
    'channels.colConversions': '转化',
    'channels.colRoi': '回报率',
    'channels.colStatus': '状态',
    'channels.colActions': '操作',
    'channels.status.active': '运行中',
    'channels.status.paused': '已暂停',
    'channels.status.optimizing': '优化中',
    'channels.filter.thisMonth': '本月',
    'channels.filter.lastMonth': '上月',
    'channels.filter.thisQuarter': '本季度',
    'channels.filter.thisYear': '今年',
    'channels.distribution': '渠道支出分布',
    'channels.action1': '新建广告系列',
    'channels.action1Desc': '创建并启动',
    'channels.action2': '受众洞察',
    'channels.action2Desc': '分析目标人群',
    'channels.action3': '渠道对比',
    'channels.action3Desc': '并排分析',
    'channels.action4': '全球覆盖',
    'channels.action4Desc': '42个市场',

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

    // Settings
    'settings.title': 'System Settings',
    'settings.subtitle': 'Manage your profile, organization, and security preferences.',
    'settings.profile': 'Profile',
    'settings.organization': 'Organization',
    'settings.global': 'Global Settings',
    'settings.notifications': 'Notifications',
    'settings.security': 'Security',
    'settings.system': 'System',
    'settings.save': 'Save Changes',
    'settings.saved': 'Settings Saved',
    'settings.dangerZone': 'Danger Zone',
    'settings.dangerDesc': 'Delete your account or deactivate the organization. This action is irreversible.',
    'settings.deactivate': 'Deactivate Account',
    'settings.language': 'Language & Region',
    'settings.theme': 'Interface Theme',
    'settings.2fa': 'Two-Factor Authentication (2FA)',
    'settings.2faDesc': 'Add an extra layer of security to your account.',
    'settings.enable2fa': 'Enable Now',
    'settings.apiTokens': 'API Access Tokens',

    // Pipeline Board
    'pipeline.openPipeline': 'Open Pipeline This Quarter',
    'pipeline.newThisMonth': 'New This Month',
    'pipeline.sourceBreakdown': 'Source Breakdown',
    'pipeline.selfReg': 'Partner Self-Registered',
    'pipeline.vendorAssigned': 'Vendor Assigned',
    'pipeline.viewSourceDetail': 'View Source Details',
    'pipeline.funnelVelocity': 'Sales Funnel Velocity',
    'pipeline.viewFullFunnel': 'View Full Funnel',
    'pipeline.revenueAchievement': 'Revenue Achievement Rate',
    'pipeline.wonAmount': 'Won',
    'pipeline.targetAmount': 'Target',
    'pipeline.winRate': 'Channel Win Rate',
    'pipeline.avgCycle': 'Avg Deal Cycle',
    'pipeline.days': 'days',

    // KPI Card
    'kpi.activeBreakdown': 'Active Breakdown (by Priority)',
    'kpi.orderPartners': 'Ordering Partners',
    'kpi.reportPartners': 'Reporting Partners',
    'kpi.otherParticipants': 'Other Participants',
    'kpi.currentQTarget': 'Current Q Expected Close',
    'kpi.nextQReserve': 'Next Q Reserve Count',
    'kpi.items': 'items',
    'kpi.newInQ': 'New In Q',
    'kpi.historical': 'Historical',
    'kpi.avgConversionCycle': 'Avg Conversion Cycle',
    'kpi.annualTarget': 'Annual Revenue Target Locked',

    // Q Ops Control Tower
    'ops.contribution': 'Contribution Overview',
    'ops.contributionSub': 'Contribution Alignment',
    'ops.tierContribution': 'Tier Contribution Ratio',
    'ops.corePartnerRate': 'Core Partner Achievement Rate (Q/Q)',
    'ops.enterPerfBoard': 'Enter Performance Board',
    'ops.dealHealth': 'Deal Registration Health',
    'ops.dealHealthSub': 'Registration Health',
    'ops.grossPipeline': 'Gross Pipeline',
    'ops.viewRegList': 'View Registration List',
    'ops.marketingEfficiency': 'Marketing Efficiency',
    'ops.marketingEfficiencySub': 'Marketing Yield & ROI',
    'ops.activitiesThisQ': 'Activities This Quarter',
    'ops.completed': 'Completed',
    'ops.remaining': 'Remaining',
    'ops.pipelineOutput': 'Pipeline Output',
    'ops.leadConversion': 'Lead Conversion',
    'ops.viewMarketingROI': 'View Marketing ROI',
    'ops.incentiveRate': 'Incentive Achievement',
    'ops.incentiveRateSub': 'Incentive Mastery',
    'ops.active': 'Active',
    'ops.viewIncentiveDetail': 'View Incentive Details',

    // Strategic Goal Board
    'goal.diagnosis': 'Diagnosis Report',
    'goal.flowDiagnosis': 'Quarterly Revenue Flow Diagnosis',
    'goal.aiUpdating': 'AI Real-time Updating',
    'goal.conclusion': 'Conclusion',
    'goal.q3Rate': 'Q3 Achievement Rate',
    'goal.ytd': 'YTD Progress',
    'goal.gap': 'GAP',
    'goal.drillRegion': 'Drill Down by Region',
    'goal.viewEnablement': 'View Enablement Plan',
  },
  en: {
    // Sidebar
    'nav.dashboard': 'Dashboard',
    'nav.partners': 'Partners',
    'nav.deals': 'Deals',
    'nav.marketing': 'Marketing',
    'nav.incentives': 'Incentives',
    'nav.enablement': 'Enablement',
    'nav.analytics': 'Analytics',
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
    'deals.title': 'Deals',
    'deals.subtitle': 'Registration, approval, and full lifecycle tracking.',
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
    'deals.export': 'Export',
    'deals.search': 'Search projects, customers or partners...',
    'deals.results': 'results',
    'deals.noResults': 'No deals found',
    'deals.noResultsDesc': 'Try adjusting your search or filters',
    'deals.colProject': 'Project Info',
    'deals.colPartner': 'Partner',
    'deals.colSales': 'Sales',
    'deals.colAmount': 'Amount / Cycle',
    'deals.colStatus': 'Status',
    'deals.colPriority': 'Priority',
    'deals.colActions': 'Actions',
    'deals.priority': 'Priority',
    'deals.filterRegion': 'Region',
    'deals.filterProduct': 'Product',
    'deals.filterPartnerType': 'Partner Type',
    'deals.statusPending': 'Pending',
    'deals.statusApproved': 'Approved',
    'deals.statusRejected': 'Rejected',
    'deals.statusConverted': 'Converted',
    'deals.statusClosedWon': 'Closed Won',
    'deals.statusClosedLost': 'Closed Lost',
    'deals.pipelineTotal': 'Pipeline Total',
    'deals.approvalRate': 'Approval Rate',
    'deals.closeRate': 'Close Rate',
    'deals.pendingCount': 'Pending',
    'deals.pendingSub': 'to process',
    'deals.breakdownByType': 'By Partner Type',
    'deals.breakdownByTier': 'By Tier · By Region',
    'deals.breakdownByProduct': 'By Product/Solution',
    'deals.funnelTitle': 'Registration → Close Funnel',
    'deals.funnelRegistered': 'Registered',
    'deals.funnelApproved': 'Approved',
    'deals.funnelConverted': 'Converted',
    'deals.funnelWon': 'Won',
    'deals.funnelConvertRate': 'conv',
    'deals.funnelLost': 'lost',
    'deals.sourceTitle': 'Source Attribution',
    'deals.sourcePartner': 'Partner Self-Registered',
    'deals.sourceManager': 'Manager Assigned',
    'deals.sourceMDF': 'MDF Campaign',
    'deals.cycleTitle': 'Cycle Time Analysis',
    'deals.cycleRegToApp': 'Reg→Approve',
    'deals.cycleAppToConv': 'Approve→Convert',
    'deals.cycleConvToWon': 'Convert→Won',
    'deals.cycleFull': 'Full Cycle',
    'deals.cycleTarget': 'Target',
    'deals.bottleneck': 'Bottleneck',
    'deals.lifecycle': 'Lifecycle',
    'deals.manageActions': 'Actions',
    'deals.approve': 'Approve',
    'deals.reject': 'Reject',
    'deals.convert': 'Convert to Opportunity',
    'deals.editInfo': 'Edit Registration',
    'deals.conflictCheck': 'Conflict Check',
    'deals.conflictYes': 'Existing deal registration detected for this customer. Please verify registration rules.',
    'deals.conflictNo': 'No conflict detected.',

    // Incentives
    'incentives.title': 'Incentive Programs',
    'incentives.subtitle': 'Rebates, points, and rankings to drive partner performance.',

    // Enablement
    'enablement.title': 'Enablement & Training',
    'enablement.subtitle': 'Certification management, course system, and partner capability building.',

    // Analytics
    'analytics.title': 'Analytics',
    'analytics.subtitle': 'Performance reports, channel health, and data insights.',

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
    'marketing.title': 'Marketing',
    'marketing.subtitle': 'MDF funds, joint campaigns, and market resources.',
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

    // Channel Dashboard
    'channels.title': 'Marketing Channel Dashboard',
    'channels.subtitle': 'Multi-channel performance & spend analytics',
    'channels.search': 'Search channels...',
    'channels.dateRange': 'Date Range',
    'channels.export': 'Export',
    'channels.totalSpend': 'Total Spend',
    'channels.roi': 'ROI',
    'channels.conversions': 'Conversions',
    'channels.activeChannels': 'Active Channels',
    'channels.chartTitle': 'Multi-channel Performance Trend',
    'channels.chartSubtitle': 'Monthly revenue & spend',
    'channels.revenue': 'Revenue',
    'channels.spend': 'Spend',
    'channels.tableTitle': 'Top Performing Channels',
    'channels.viewAll': 'View All',
    'channels.colChannel': 'Channel',
    'channels.colSpend': 'Spend',
    'channels.colCtr': 'CTR',
    'channels.colConversions': 'Conversions',
    'channels.colRoi': 'ROI',
    'channels.colStatus': 'Status',
    'channels.colActions': 'Actions',
    'channels.status.active': 'Active',
    'channels.status.paused': 'Paused',
    'channels.status.optimizing': 'Optimizing',
    'channels.filter.thisMonth': 'This Month',
    'channels.filter.lastMonth': 'Last Month',
    'channels.filter.thisQuarter': 'This Quarter',
    'channels.filter.thisYear': 'This Year',
    'channels.distribution': 'Spend Distribution',
    'channels.action1': 'New Campaign',
    'channels.action1Desc': 'Create & launch',
    'channels.action2': 'Audience Insights',
    'channels.action2Desc': 'Analyze segments',
    'channels.action3': 'Channel Comparison',
    'channels.action3Desc': 'Side-by-side view',
    'channels.action4': 'Global Reach',
    'channels.action4Desc': '42 markets',

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

    // Settings
    'settings.title': 'System Settings',
    'settings.subtitle': 'Manage your profile, organization, and security preferences.',
    'settings.profile': 'Profile',
    'settings.organization': 'Organization',
    'settings.global': 'Global Settings',
    'settings.notifications': 'Notifications',
    'settings.security': 'Security',
    'settings.system': 'System',
    'settings.save': 'Save Changes',
    'settings.saved': 'Settings Saved',
    'settings.dangerZone': 'Danger Zone',
    'settings.dangerDesc': 'Delete your account or deactivate the organization. This action is irreversible.',
    'settings.deactivate': 'Deactivate Account',
    'settings.language': 'Language & Region',
    'settings.theme': 'Interface Theme',
    'settings.2fa': 'Two-Factor Authentication (2FA)',
    'settings.2faDesc': 'Add an extra layer of security to your account.',
    'settings.enable2fa': 'Enable Now',
    'settings.apiTokens': 'API Access Tokens',

    // Pipeline Board
    'pipeline.openPipeline': 'Open Pipeline This Quarter',
    'pipeline.newThisMonth': 'New This Month',
    'pipeline.sourceBreakdown': 'Source Breakdown',
    'pipeline.selfReg': 'Partner Self-Registered',
    'pipeline.vendorAssigned': 'Vendor Assigned',
    'pipeline.viewSourceDetail': 'View Source Details',
    'pipeline.funnelVelocity': 'Sales Funnel Velocity',
    'pipeline.viewFullFunnel': 'View Full Funnel',
    'pipeline.revenueAchievement': 'Revenue Achievement Rate',
    'pipeline.wonAmount': 'Won',
    'pipeline.targetAmount': 'Target',
    'pipeline.winRate': 'Channel Win Rate',
    'pipeline.avgCycle': 'Avg Deal Cycle',
    'pipeline.days': 'days',

    // KPI Card
    'kpi.activeBreakdown': 'Active Breakdown (by Priority)',
    'kpi.orderPartners': 'Ordering Partners',
    'kpi.reportPartners': 'Reporting Partners',
    'kpi.otherParticipants': 'Other Participants',
    'kpi.currentQTarget': 'Current Q Expected Close',
    'kpi.nextQReserve': 'Next Q Reserve Count',
    'kpi.items': 'items',
    'kpi.newInQ': 'New In Q',
    'kpi.historical': 'Historical',
    'kpi.avgConversionCycle': 'Avg Conversion Cycle',
    'kpi.annualTarget': 'Annual Revenue Target Locked',

    // Q Ops Control Tower
    'ops.contribution': 'Contribution Overview',
    'ops.contributionSub': 'Contribution Alignment',
    'ops.tierContribution': 'Tier Contribution Ratio',
    'ops.corePartnerRate': 'Core Partner Achievement Rate (Q/Q)',
    'ops.enterPerfBoard': 'Enter Performance Board',
    'ops.dealHealth': 'Deal Registration Health',
    'ops.dealHealthSub': 'Registration Health',
    'ops.grossPipeline': 'Gross Pipeline',
    'ops.viewRegList': 'View Registration List',
    'ops.marketingEfficiency': 'Marketing Efficiency',
    'ops.marketingEfficiencySub': 'Marketing Yield & ROI',
    'ops.activitiesThisQ': 'Activities This Quarter',
    'ops.completed': 'Completed',
    'ops.remaining': 'Remaining',
    'ops.pipelineOutput': 'Pipeline Output',
    'ops.leadConversion': 'Lead Conversion',
    'ops.viewMarketingROI': 'View Marketing ROI',
    'ops.incentiveRate': 'Incentive Achievement',
    'ops.incentiveRateSub': 'Incentive Mastery',
    'ops.active': 'Active',
    'ops.viewIncentiveDetail': 'View Incentive Details',

    // Strategic Goal Board
    'goal.diagnosis': 'Diagnosis Report',
    'goal.flowDiagnosis': 'Quarterly Revenue Flow Diagnosis',
    'goal.aiUpdating': 'AI Real-time Updating',
    'goal.conclusion': 'Conclusion',
    'goal.q3Rate': 'Q3 Achievement Rate',
    'goal.ytd': 'YTD Progress',
    'goal.gap': 'GAP',
    'goal.drillRegion': 'Drill Down by Region',
    'goal.viewEnablement': 'View Enablement Plan',
  }
};

type InterpolationParams = Record<string, string | number>;

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return stored === 'en' ? 'en' : 'zh';
  });

  const t = useCallback((key: string, params?: InterpolationParams) => {
    const text = translations[language][key];
    if (!text) return key;
    if (!params) return text;
    return Object.entries(params).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, String(v)), text);
  }, [language]);

  const setLanguagePersisted = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  }, []);

  const formatDate = useCallback((date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const locale = language === 'zh' ? 'zh-CN' : 'en-US';
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  }, [language]);

  const formatNumber = useCallback((num: number) => {
    const locale = language === 'zh' ? 'zh-CN' : 'en-US';
    return new Intl.NumberFormat(locale).format(num);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguagePersisted, t, formatDate, formatNumber }}>
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
