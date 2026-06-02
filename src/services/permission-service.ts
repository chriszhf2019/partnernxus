// WARNING: Permissions stored in localStorage are for UI gating only.
// Server-side enforcement (RLS policies, API middleware) is REQUIRED for
// actual security. Client-side permission checks are trivially bypassable.

import type { UserRole } from './auth-service';

export type PermissionKey = 
  // 工作台
  | 'dashboard_view'
  // 合作伙伴管理
  | 'partners_view'
  | 'partners_edit'
  | 'partners_import'
  | 'partners_staff_manage'
  // 商机管理
  | 'deals_view'
  | 'deals_approve'
  | 'deals_register'
  | 'deals_edit'
  // 营销管理
  | 'marketing_view'
  | 'marketing_manage'
  | 'marketing_mdf'
  | 'marketing_events'
  // 激励管理
  | 'incentives_view'
  | 'incentives_manage'
  // 赋能管理
  | 'enablement_view'
  | 'enablement_manage'
  // 数据分析
  | 'analytics_view'
  // 用户管理
  | 'users_manage'
  // 系统设置
  | 'settings_global'
  | 'settings_security'
  | 'settings_roles'
  // 日志审计
  | 'audit_logs';

export interface PermissionDef {
  key: PermissionKey;
  label: string;
  desc: string;
  category: string;
  [role: string]: string | boolean;
}

export const PERMISSIONS: PermissionDef[] = [
  // 工作台
  {
    key: 'dashboard_view',
    label: '查看工作台',
    desc: '查看业绩总揽、趋势图表',
    category: '工作台',
    admin: true, channel_director: true, channel_manager: true, 
    marketing_director: true, marketing_manager: true, 
    sales_director: true, sales_manager: true,
    partner_admin: true, partner_sales: true, partner_engineer: true,
  },
  
  // 合作伙伴管理
  {
    key: 'partners_view',
    label: '查看合作伙伴',
    desc: '浏览合作伙伴列表和详情',
    category: '合作伙伴',
    admin: true, channel_director: true, channel_manager: true, 
    marketing_director: true, marketing_manager: true, 
    sales_director: true, sales_manager: true,
    partner_admin: true, partner_sales: true, partner_engineer: true,
  },
  {
    key: 'partners_edit',
    label: '编辑合作伙伴',
    desc: '新增、修改、删除合作伙伴',
    category: '合作伙伴',
    admin: true, channel_director: true, channel_manager: true, 
    marketing_director: false, marketing_manager: false, 
    sales_director: false, sales_manager: false,
    partner_admin: true, partner_sales: false, partner_engineer: false,
  },
  {
    key: 'partners_import',
    label: '导入合作伙伴',
    desc: '批量导入 Excel 数据',
    category: '合作伙伴',
    admin: true, channel_director: true, channel_manager: false, 
    marketing_director: false, marketing_manager: false, 
    sales_director: false, sales_manager: false,
    partner_admin: true, partner_sales: false, partner_engineer: false,
  },
  {
    key: 'partners_staff_manage',
    label: '人员管理',
    desc: '管理合作伙伴人员信息和积分',
    category: '合作伙伴',
    admin: true, channel_director: true, channel_manager: true, 
    marketing_director: false, marketing_manager: false, 
    sales_director: false, sales_manager: false,
    partner_admin: true, partner_sales: true, partner_engineer: false,
  },
  
  // 商机管理
  {
    key: 'deals_view',
    label: '查看商机',
    desc: '浏览商机报备列表',
    category: '商机管理',
    admin: true, channel_director: true, channel_manager: true, 
    marketing_director: true, marketing_manager: true, 
    sales_director: true, sales_manager: true,
    partner_admin: true, partner_sales: true, partner_engineer: true,
  },
  {
    key: 'deals_approve',
    label: '审批商机',
    desc: '批复或拒绝商机报备',
    category: '商机管理',
    admin: true, channel_director: true, channel_manager: true, 
    marketing_director: false, marketing_manager: false, 
    sales_director: false, sales_manager: false,
    partner_admin: false, partner_sales: false, partner_engineer: false,
  },
  {
    key: 'deals_register',
    label: '提交报备',
    desc: '提交新商机报备',
    category: '商机管理',
    admin: true, channel_director: true, channel_manager: true, 
    marketing_director: false, marketing_manager: false, 
    sales_director: false, sales_manager: false,
    partner_admin: true, partner_sales: true, partner_engineer: false,
  },
  {
    key: 'deals_edit',
    label: '编辑商机',
    desc: '修改商机信息',
    category: '商机管理',
    admin: true, channel_director: true, channel_manager: true, 
    marketing_director: false, marketing_manager: false, 
    sales_director: false, sales_manager: false,
    partner_admin: true, partner_sales: true, partner_engineer: false,
  },
  
  // 营销管理
  {
    key: 'marketing_view',
    label: '查看营销',
    desc: '查看 MDF、活动、激励计划',
    category: '营销管理',
    admin: true, channel_director: true, channel_manager: true, 
    marketing_director: true, marketing_manager: true, 
    sales_director: true, sales_manager: true,
    partner_admin: true, partner_sales: true, partner_engineer: false,
  },
  {
    key: 'marketing_manage',
    label: '管理营销',
    desc: '派发 MDF、审批活动申请',
    category: '营销管理',
    admin: true, channel_director: false, channel_manager: false, 
    marketing_director: true, marketing_manager: true, 
    sales_director: false, sales_manager: false,
    partner_admin: true, partner_sales: false, partner_engineer: false,
  },
  {
    key: 'marketing_mdf',
    label: 'MDF管理',
    desc: '管理营销发展基金申请和审批',
    category: '营销管理',
    admin: true, channel_director: false, channel_manager: false, 
    marketing_director: true, marketing_manager: true, 
    sales_director: false, sales_manager: false,
    partner_admin: true, partner_sales: false, partner_engineer: false,
  },
  {
    key: 'marketing_events',
    label: '活动管理',
    desc: '创建和管理市场活动',
    category: '营销管理',
    admin: true, channel_director: false, channel_manager: false, 
    marketing_director: true, marketing_manager: true, 
    sales_director: false, sales_manager: false,
    partner_admin: true, partner_sales: true, partner_engineer: false,
  },
  
  // 激励管理
  {
    key: 'incentives_view',
    label: '查看激励',
    desc: '查看激励计划和返利政策',
    category: '激励管理',
    admin: true, channel_director: true, channel_manager: true, 
    marketing_director: true, marketing_manager: true, 
    sales_director: true, sales_manager: true,
    partner_admin: true, partner_sales: true, partner_engineer: false,
  },
  {
    key: 'incentives_manage',
    label: '管理激励',
    desc: '创建和调整激励计划',
    category: '激励管理',
    admin: true, channel_director: false, channel_manager: false, 
    marketing_director: true, marketing_manager: false, 
    sales_director: true, sales_manager: false,
    partner_admin: false, partner_sales: false, partner_engineer: false,
  },
  
  // 赋能管理
  {
    key: 'enablement_view',
    label: '查看赋能',
    desc: '查看培训课程和认证',
    category: '赋能管理',
    admin: true, channel_director: true, channel_manager: true, 
    marketing_director: true, marketing_manager: true, 
    sales_director: true, sales_manager: true,
    partner_admin: true, partner_sales: true, partner_engineer: true,
  },
  {
    key: 'enablement_manage',
    label: '管理赋能',
    desc: '创建培训课程和认证体系',
    category: '赋能管理',
    admin: true, channel_director: false, channel_manager: false, 
    marketing_director: true, marketing_manager: true, 
    sales_director: false, sales_manager: false,
    partner_admin: false, partner_sales: false, partner_engineer: false,
  },
  
  // 数据分析
  {
    key: 'analytics_view',
    label: '查看报表',
    desc: '查看数据报表和分析',
    category: '数据分析',
    admin: true, channel_director: true, channel_manager: true, 
    marketing_director: true, marketing_manager: true, 
    sales_director: true, sales_manager: true,
    partner_admin: true, partner_sales: true, partner_engineer: false,
  },
  
  // 用户管理
  {
    key: 'users_manage',
    label: '用户管理',
    desc: '添加/编辑/删除系统用户',
    category: '系统管理',
    admin: true, channel_director: false, channel_manager: false, 
    marketing_director: false, marketing_manager: false, 
    sales_director: false, sales_manager: false,
    partner_admin: false, partner_sales: false, partner_engineer: false,
  },
  
  // 系统设置
  {
    key: 'settings_global',
    label: '全局设置',
    desc: '修改系统配置参数',
    category: '系统管理',
    admin: true, channel_director: false, channel_manager: false, 
    marketing_director: false, marketing_manager: false, 
    sales_director: false, sales_manager: false,
    partner_admin: false, partner_sales: false, partner_engineer: false,
  },
  {
    key: 'settings_security',
    label: '安全设置',
    desc: '配置2FA、密码策略、会话',
    category: '系统管理',
    admin: true, channel_director: false, channel_manager: false, 
    marketing_director: false, marketing_manager: false, 
    sales_director: false, sales_manager: false,
    partner_admin: false, partner_sales: false, partner_engineer: false,
  },
  {
    key: 'settings_roles',
    label: '角色管理',
    desc: '管理角色和权限配置',
    category: '系统管理',
    admin: true, channel_director: false, channel_manager: false, 
    marketing_director: false, marketing_manager: false, 
    sales_director: false, sales_manager: false,
    partner_admin: false, partner_sales: false, partner_engineer: false,
  },
  
  // 日志审计
  {
    key: 'audit_logs',
    label: '审计日志',
    desc: '查看操作日志和审计记录',
    category: '系统管理',
    admin: true, channel_director: true, channel_manager: false, 
    marketing_director: false, marketing_manager: false, 
    sales_director: false, sales_manager: false,
    partner_admin: false, partner_sales: false, partner_engineer: false,
  },
];

export const PERMISSION_CATEGORIES = ['工作台', '合作伙伴', '商机管理', '营销管理', '激励管理', '赋能管理', '数据分析', '系统管理'];

const STORAGE_KEY = 'partnernxus_permissions';

export const permissionService = {
  getPermissions: (): PermissionDef[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return PERMISSIONS;
  },

  savePermissions: (permissions: PermissionDef[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(permissions));
  },

  hasPermission: (role: UserRole, permissionKey: PermissionKey): boolean => {
    const permissions = permissionService.getPermissions();
    const permission = permissions.find(p => p.key === permissionKey);
    if (!permission) return false;
    return permission[role] === true;
  },

  getRolePermissions: (role: UserRole): PermissionKey[] => {
    const permissions = permissionService.getPermissions();
    return permissions
      .filter(p => p[role] === true)
      .map(p => p.key);
  },

  togglePermission: (permissionKey: PermissionKey, role: UserRole): void => {
    const permissions = permissionService.getPermissions();
    const updated = permissions.map(p => 
      p.key === permissionKey 
        ? { ...p, [role]: !p[role] }
        : p
    );
    permissionService.savePermissions(updated);
  },
};
