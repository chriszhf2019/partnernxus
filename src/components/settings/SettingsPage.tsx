import { useState, useEffect, useMemo } from 'react';
import { User, Building2, Shield, Globe, Save, Plus, Trash2, Pencil, Check, X, Lock, Key, Clock, Smartphone, AlertTriangle, Mail, ToggleLeft, ShieldCheck, ShieldAlert, BarChart3, TrendingUp, MessageSquare, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABELS, isInternalRole, isExternalRole, type UserRole } from '../../services/auth-service';
import { permissionService, PERMISSION_CATEGORIES, type PermissionDef } from '../../services/permission-service';
import { useToast } from '../ui/Toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Tabs } from '../ui/Tabs';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { GlobalConfig } from '../../types';

interface SystemUser { id: string; name: string; email: string; role: UserRole; department: string; phone: string; status: 'active' | 'inactive'; lastLogin: string; source: 'admin' | 'partner'; }
interface OperationLog { id: string; userId: string; userName: string; action: 'create' | 'update' | 'status_change'; field?: string; oldValue?: string; newValue?: string; timestamp: string; operator: string; }
interface CompanyInfo { nameCN: string; nameEN: string; logo: string; address: string; phone: string; email: string; website: string; businessModel: string; annualTarget: string; quarterlyTarget: string; partnerTarget: string; channelRegions: string; coreBusiness: string; }

interface SecuritySettings { require2FA: boolean; passwordMinLength: number; passwordExpireDays: number; sessionTimeoutMin: number; loginAttempts: number; ipWhitelist: string; }

const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));
const deptOptions = [
  { value: '管理层', label: '管理层' }, { value: '渠道部', label: '渠道部' }, { value: '市场部', label: '市场部' },
  { value: '销售部', label: '销售部' }, { value: '技术部', label: '技术部' }, { value: '运营部', label: '运营部' },
  { value: '渠道商', label: '渠道商（外部）' },
];

const defaultUsers: SystemUser[] = [
  { id: 'u1', name: 'Alex Rivera', email: 'alex@partnernxus.com', role: 'admin', department: '管理层', phone: '13800000001', status: 'active', lastLogin: '2025-05-23 08:30', source: 'admin' },
  { id: 'u2', name: '张伟', email: 'zhangw@partnernxus.com', role: 'channel_director', department: '渠道部', phone: '13800000002', status: 'active', lastLogin: '2025-05-22 17:15', source: 'admin' },
  { id: 'u3', name: '李娜', email: 'lina@partnernxus.com', role: 'marketing_manager', department: '市场部', phone: '13800000003', status: 'active', lastLogin: '2025-05-23 09:00', source: 'admin' },
  { id: 'u4', name: '王强', email: 'wangq@partnernxus.com', role: 'sales_manager', department: '销售部', phone: '13800000004', status: 'active', lastLogin: '2025-04-15 14:20', source: 'admin' },
  { id: 'u5', name: '神州数码-管理员', email: 'dc_admin@digitalchina.com', role: 'partner_admin', department: '渠道商', phone: '13900000001', status: 'active', lastLogin: '2025-05-20 10:00', source: 'partner' },
  { id: 'u6', name: '东软-销售', email: 'sales@neusoft.com', role: 'partner_sales', department: '渠道商', phone: '13900000002', status: 'active', lastLogin: '2025-05-21 14:30', source: 'partner' },
  { id: 'u7', name: '浪潮-工程师', email: 'engineer@inspur.com', role: 'partner_engineer', department: '渠道商', phone: '13900000003', status: 'active', lastLogin: '2025-05-19 09:15', source: 'partner' },
];

const defaultLogs: OperationLog[] = [
  { id: 'log1', userId: 'u1', userName: 'Alex Rivera', action: 'create', timestamp: '2025-05-23 08:30', operator: '系统管理员' },
  { id: 'log2', userId: 'u2', userName: '张伟', action: 'create', timestamp: '2025-05-22 17:15', operator: 'Alex Rivera' },
  { id: 'log3', userId: 'u5', userName: '神州数码-管理员', action: 'create', timestamp: '2025-05-20 10:00', operator: '张伟' },
  { id: 'log4', userId: 'u6', userName: '东软-销售', action: 'create', timestamp: '2025-05-21 14:30', operator: '张伟' },
  { id: 'log5', userId: 'u7', userName: '浪潮-工程师', action: 'create', timestamp: '2025-05-19 09:15', operator: '张伟' },
];

const defaultCompany: CompanyInfo = {
  nameCN: '星辰科技数据有限公司', nameEN: 'StarTech Data Co., Ltd.',
  logo: '', address: '北京市海淀区中关村科技园',
  phone: '400-888-8888', email: 'contact@startech.com', website: 'https://www.startech.com',
  businessModel: '渠道合作伙伴关系管理（PRM），覆盖招募、赋能、激励、商机全生命周期',
  annualTarget: '¥5,000万', quarterlyTarget: '¥1,250万',
  partnerTarget: '新增100家', channelRegions: '华北、华东、华南', coreBusiness: '信创、医疗、金融',
};

export const SettingsPage = () => {
  const { t, language, setLanguage } = useLanguage();
  const { config, updateConfig } = useConfig();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);

  // ── Company state ───────────────────────────────────
  const [editingConfig, setEditingConfig] = useState({
    ...config,
    companyName: config.companyName || defaultCompany.nameCN,
    companyNameEn: config.companyNameEn || defaultCompany.nameEN,
    companyAddress: config.companyAddress || defaultCompany.address,
    companyPhone: config.companyPhone || defaultCompany.phone,
    companyEmail: config.companyEmail || defaultCompany.email,
    companyWebsite: config.companyWebsite || defaultCompany.website,
    businessModel: config.businessModel || defaultCompany.businessModel,
    annualTarget: config.annualTarget || defaultCompany.annualTarget,
    quarterlyTarget: config.quarterlyTarget || defaultCompany.quarterlyTarget,
    partnerTarget: config.partnerTarget || defaultCompany.partnerTarget,
    channelRegions: config.channelRegions || defaultCompany.channelRegions,
    coreBusiness: config.coreBusiness || defaultCompany.coreBusiness,
  });

  // ── User management state ───────────────────────────
  const [users, setUsers] = useState<SystemUser[]>(defaultUsers);
  const [editUser, setEditUser] = useState<SystemUser | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<SystemUser>({ id: '', name: '', email: '', role: 'channel_manager', department: '渠道部', phone: '', status: 'active', lastLogin: '-', source: 'admin' });
  const [logs, setLogs] = useState<OperationLog[]>(defaultLogs);
  const [activeUserTab, setActiveUserTab] = useState<'all' | 'internal' | 'partner'>('all');

  const addLog = (action: OperationLog['action'], user: SystemUser, field?: string, oldValue?: string, newValue?: string) => {
    const newLog: OperationLog = {
      id: 'log' + Date.now(),
      userId: user.id,
      userName: user.name,
      action,
      field,
      oldValue,
      newValue,
      timestamp: new Date().toLocaleString('zh-CN'),
      operator: '当前管理员',
    };
    setLogs((p) => [newLog, ...p]);
  };

  const openNewUser = () => { 
    setUserForm({ id: '', name: '', email: '', role: 'channel_manager', department: '渠道部', phone: '', status: 'active', lastLogin: '-', source: 'admin' }); 
    setShowUserForm(true); 
  };
  const openEditUser = (u: SystemUser) => { setUserForm({ ...u }); setShowUserForm(true); };
  const saveUser = () => {
    if (!userForm.name || !userForm.email) { toast('error', '姓名和邮箱不能为空'); return; }
    if (userForm.id) {
      // 更新用户
      const existing = users.find((u) => u.id === userForm.id);
      if (existing) {
        // 记录变更日志
        if (existing.name !== userForm.name) addLog('update', userForm, '姓名', existing.name, userForm.name);
        if (existing.email !== userForm.email) addLog('update', userForm, '邮箱', existing.email, userForm.email);
        if (existing.role !== userForm.role) addLog('update', userForm, '角色', ROLE_LABELS[existing.role] || existing.role, ROLE_LABELS[userForm.role] || userForm.role);
        if (existing.department !== userForm.department) addLog('update', userForm, '部门', existing.department, userForm.department);
        if (existing.status !== userForm.status) addLog('status_change', userForm, '状态', existing.status === 'active' ? '活跃' : '停用', userForm.status === 'active' ? '活跃' : '停用');
      }
      setUsers((p) => p.map((u) => (u.id === userForm.id ? userForm : u))); 
      toast('success', '用户已更新'); 
    } else {
      // 新增用户
      const newUser = { ...userForm, id: 'u' + Date.now() };
      setUsers((p) => [...p, newUser]); 
      addLog('create', newUser);
      toast('success', '用户已添加'); 
    }
    setShowUserForm(false);
  };
  const deleteUser = () => { 
    toast('error', '禁止删除用户，请通过修改状态来停用用户');
    setDeleteId(null); 
  };

  const filteredUsers = useMemo(() => {
    if (activeUserTab === 'internal') return users.filter((u) => u.source === 'admin');
    if (activeUserTab === 'partner') return users.filter((u) => u.source === 'partner');
    return users;
  }, [users, activeUserTab]);

  const handleSave = async () => {
    setSaving(true);
    try { await updateConfig(editingConfig); toast('success', t('settings.saved')); } catch { toast('error', '保存失败'); }
    setSaving(false);
  };

  // Sync editingConfig with global config changes
  useEffect(() => {
    setEditingConfig((prev) => ({
      ...config,
      companyName: prev.companyName || config.companyName || defaultCompany.nameCN,
      companyNameEn: prev.companyNameEn || config.companyNameEn || defaultCompany.nameEN,
      companyAddress: prev.companyAddress || config.companyAddress || defaultCompany.address,
      companyPhone: prev.companyPhone || config.companyPhone || defaultCompany.phone,
      companyEmail: prev.companyEmail || config.companyEmail || defaultCompany.email,
      companyWebsite: prev.companyWebsite || config.companyWebsite || defaultCompany.website,
      businessModel: prev.businessModel || config.businessModel || defaultCompany.businessModel,
      annualTarget: prev.annualTarget || config.annualTarget || defaultCompany.annualTarget,
      quarterlyTarget: prev.quarterlyTarget || config.quarterlyTarget || defaultCompany.quarterlyTarget,
      partnerTarget: prev.partnerTarget || config.partnerTarget || defaultCompany.partnerTarget,
      channelRegions: prev.channelRegions || config.channelRegions || defaultCompany.channelRegions,
      coreBusiness: prev.coreBusiness || config.coreBusiness || defaultCompany.coreBusiness,
    }));
  }, [config]);

  // ── Permissions matrix ──────────────────────────────
  // 使用统一的权限服务
  const [permissions, setPermissions] = useState<PermissionDef[]>(() => {
    return permissionService.getPermissions();
  });

  const togglePermission = (permKey: string, role: string) => {
    const updated = permissions.map((p) => 
      p.key === permKey ? { ...p, [role]: !p[role] } : p
    );
    setPermissions(updated);
  };

  const savePermissions = () => {
    permissionService.savePermissions(permissions);
    toast('success', '权限配置已保存');
  };

  // 按类别分组权限
  const permissionsByCategory = useMemo(() => {
    const grouped: Record<string, PermissionDef[]> = {};
    PERMISSION_CATEGORIES.forEach(cat => {
      grouped[cat] = permissions.filter(p => p.category === cat);
    });
    return grouped;
  }, [permissions]);

  const internalRoles = ['admin','channel_director','channel_manager','marketing_director','marketing_manager','sales_director','sales_manager'];
  const externalRoles = ['partner_admin','partner_sales','partner_engineer'];

  // ── Editable role definitions ────────────────────────
  const [roleDefs, setRoleDefs] = useState<Record<string, string>>({ ...ROLE_LABELS });
  const [editRoleKey, setEditRoleKey] = useState<string | null>(null);
  const [editRoleValue, setEditRoleValue] = useState('');
  const [newRoleKey, setNewRoleKey] = useState('');
  const [newRoleValue, setNewRoleValue] = useState('');
  const [newRoleType, setNewRoleType] = useState<'internal' | 'external'>('internal');
  const [showAddRole, setShowAddRole] = useState(false);

  const startEditRole = (key: string) => { setEditRoleKey(key); setEditRoleValue(roleDefs[key] || ''); };
  const saveEditRole = () => { if (editRoleKey && editRoleValue.trim()) { setRoleDefs((p) => ({ ...p, [editRoleKey]: editRoleValue.trim() })); toast('success', '角色名称已更新'); } setEditRoleKey(null); };
  const deleteRole = (key: string) => { if (key === 'admin') { toast('error', '管理员角色不可删除'); return; } const updated = { ...roleDefs }; delete updated[key]; setRoleDefs(updated); toast('success', '角色已删除'); };
  const addRole = () => { if (!newRoleKey.trim() || !newRoleValue.trim()) { toast('error', '角色标识和名称不能为空'); return; } setRoleDefs((p) => ({ ...p, [newRoleKey.trim()]: newRoleValue.trim() })); setShowAddRole(false); setNewRoleKey(''); setNewRoleValue(''); toast('success', '角色已添加'); };

  const { user, role } = useAuth();

  const currencyOptions = [{ value: 'CNY', label: '人民币 (CNY ¥)' }, { value: 'USD', label: '美元 (USD $)' }, { value: 'JPY', label: '日元 (JPY ¥)' }];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-neutral-900 dark:text-white">{t('settings.title')}</h1><p className="text-sm text-neutral-500 mt-1">{t('settings.subtitle')}</p></div>
        <Button variant="brand" size="sm" onClick={handleSave} loading={saving}><Save className="w-4 h-4" />{t('settings.save')}</Button>
      </div>

      <Tabs tabs={[
        { id: 'company', label: '公司信息' }, { id: 'users', label: '用户管理' }, { id: 'roles', label: '角色权限' }, { id: 'security', label: '安全设置' }, { id: 'global', label: '全局设置' },
      ]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'company' && (
        <div className="space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>公司基本信息</CardTitle>
              <CardDescription>设置您公司的基本信息，这些信息将展示在系统的多个位置</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="公司中文名称" value={editingConfig.companyName || ''} onChange={(e) => setEditingConfig({ ...editingConfig, companyName: e.target.value })} placeholder="例如：星辰科技数据有限公司" />
                <Input label="公司英文名称" value={editingConfig.companyNameEn || ''} onChange={(e) => setEditingConfig({ ...editingConfig, companyNameEn: e.target.value })} placeholder="例如：StarTech Data Co., Ltd." />
                <Input label="公司地址" value={editingConfig.companyAddress || ''} onChange={(e) => setEditingConfig({ ...editingConfig, companyAddress: e.target.value })} placeholder="例如：北京市海淀区中关村科技园" />
                <Input label="联系电话" value={editingConfig.companyPhone || ''} onChange={(e) => setEditingConfig({ ...editingConfig, companyPhone: e.target.value })} placeholder="例如：400-888-8888" />
                <Input label="企业邮箱" value={editingConfig.companyEmail || ''} onChange={(e) => setEditingConfig({ ...editingConfig, companyEmail: e.target.value })} placeholder="例如：contact@company.com" />
                <Input label="企业网址" value={editingConfig.companyWebsite || ''} onChange={(e) => setEditingConfig({ ...editingConfig, companyWebsite: e.target.value })} placeholder="例如：https://www.company.com" />
              </div>
            </CardContent>
          </Card>

          {/* Company Business Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.businessGoals')}</CardTitle>
              <CardDescription>{t('settings.businessGoalsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t('settings.annualTarget')} value={editingConfig.annualTarget || ''} onChange={(e) => setEditingConfig({ ...editingConfig, annualTarget: e.target.value })} placeholder={t('settings.annualTargetPlaceholder')} />
                <Input label={t('settings.partnerTarget')} value={editingConfig.partnerTarget || ''} onChange={(e) => setEditingConfig({ ...editingConfig, partnerTarget: e.target.value })} placeholder={t('settings.partnerTargetPlaceholder')} />
                <Input label={t('settings.channelRegions')} value={editingConfig.channelRegions || ''} onChange={(e) => setEditingConfig({ ...editingConfig, channelRegions: e.target.value })} placeholder={t('settings.channelRegionsPlaceholder')} />
                <Input label={t('settings.coreBusiness')} value={editingConfig.coreBusiness || ''} onChange={(e) => setEditingConfig({ ...editingConfig, coreBusiness: e.target.value })} placeholder={t('settings.coreBusinessPlaceholder')} />
                <div className="md:col-span-2">
                  <Input label={t('settings.businessModel')} value={editingConfig.businessModel || ''} onChange={(e) => setEditingConfig({ ...editingConfig, businessModel: e.target.value })} placeholder={t('settings.businessModelPlaceholder')} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Config */}
          <Card>
            <CardHeader>
              <CardTitle>全局配置</CardTitle>
              <CardDescription>配置系统核心数据字典，影响合作伙伴管理、商机报备等多个模块</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 基础设置 */}
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">基础设置</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">结算币种</label>
                    <Select options={currencyOptions} value={editingConfig.currency} onChange={(e) => setEditingConfig({ ...editingConfig, currency: e.target.value as GlobalConfig['currency'] })} />
                    <p className="text-xs text-neutral-500 mt-1">用于商机金额、业绩报表等金额显示</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">界面语言</label>
                    <div className="flex gap-2">
                      <button onClick={() => setLanguage('zh')} className={cn('flex-1 py-2 rounded-lg border text-sm font-medium transition-all', language === 'zh' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900' : 'border-neutral-200 dark:border-neutral-700 text-neutral-500')}>中文</button>
                      <button onClick={() => setLanguage('en')} className={cn('flex-1 py-2 rounded-lg border text-sm font-medium transition-all', language === 'en' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900' : 'border-neutral-200 dark:border-neutral-700 text-neutral-500')}>English</button>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">系统界面显示语言</p>
                  </div>
                </div>
              </div>

              {/* 合作伙伴数据字典 */}
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">合作伙伴数据字典</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">伙伴等级 <span className="text-neutral-400">(英文标识)</span></label>
                    <Input value={editingConfig.partnerTiers.join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, partnerTiers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="Platinum, Gold, Silver, Registered" />
                    <p className="text-xs text-neutral-500 mt-1">用于合作伙伴等级划分，影响筛选和统计</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">伙伴类型 <span className="text-neutral-400">(英文标识)</span></label>
                    <Input value={(editingConfig.partnerTypes || []).join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, partnerTypes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="Reseller, ISV, SI, Service, VAD, VAR, OEM" />
                    <p className="text-xs text-neutral-500 mt-1">用于合作伙伴类型分类</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">伙伴状态 <span className="text-neutral-400">(英文标识)</span></label>
                    <Input value={(editingConfig.partnerStatuses || []).join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, partnerStatuses: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="Cooperating, Inactive, Prospective" />
                    <p className="text-xs text-neutral-500 mt-1">用于筛选待批复、合作中、已过期伙伴</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">合作级别</label>
                    <Input value={(editingConfig.cooperationLevels || []).join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, cooperationLevels: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="战略级, 金牌代理, 银牌代理, 认证代理, 注册代理" />
                    <p className="text-xs text-neutral-500 mt-1">用于合作伙伴授权级别管理</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">合作厂商</label>
                    <Input value={(editingConfig.partnerVendors || []).join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, partnerVendors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="华为, 浪潮, 联想, Oracle, AWS" />
                    <p className="text-xs text-neutral-500 mt-1">用于合作伙伴产品/技术厂商关联</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">产品类型</label>
                    <Input value={(editingConfig.productTypes || []).join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, productTypes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="云原生平台, 大数据平台, AI 智算平台" />
                    <p className="text-xs text-neutral-500 mt-1">用于商机报备时选择产品类型</p>
                  </div>
                </div>
              </div>

              {/* 业务数据字典 */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">业务数据字典</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">区域设定</label>
                    <Input value={editingConfig.regions.join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, regions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="华北, 华东, 华南, 西部" />
                    <p className="text-xs text-neutral-500 mt-1">用于合作伙伴地域分布和商机区域筛选</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">行业设定</label>
                    <Input value={editingConfig.industries.join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, industries: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="金融, 医疗, 政务, 制造, 教育" />
                    <p className="text-xs text-neutral-500 mt-1">用于合作伙伴行业分类和商机行业筛选</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">销售阶段</label>
                    <Input value={editingConfig.salesStages.join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, salesStages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="1. 需求发现, 2. 方案阶段, 3. 商务洽谈, 4. 合同签约, 5. 售后回访" />
                    <p className="text-xs text-neutral-500 mt-1">用于商机报备的销售阶段管理</p>
                  </div>
                </div>
              </div>

              {/* 合作伙伴时间线标签 */}
              <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">合作伙伴时间线标签</h4>
                <p className="text-xs text-neutral-500 mb-3">配置合作伙伴时间线中显示的事件类型</p>
                
                <div className="bg-neutral-50/50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                    {[
                      { key: 'approved', label: '合作伙伴批复' },
                      { key: 'tier_upgrade', label: '级别提升' },
                      { key: 'tier_downgrade', label: '级别降级' },
                      { key: 'first_deal', label: '首个商机报备' },
                      { key: 'first_order', label: '首个订单' },
                      { key: 'manager_change', label: '负责人变更' },
                      { key: 'milestone', label: '合作里程碑' },
                      { key: 'contract_renewal', label: '合同续签' },
                      { key: 'contract_expiry', label: '合同到期' },
                      { key: 'certification', label: '获得认证' },
                      { key: 'mdf_approved', label: 'MDF审批通过' },
                      { key: 'award', label: '获得奖项' },
                    ].map((event) => (
                      <label key={event.key} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300" />
                        <span>{event.label}</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-neutral-300" />
                      <span>其他</span>
                      <input type="text" placeholder="自定义" className="flex-1 max-w-xs ml-auto text-xs border rounded px-2 py-1 bg-white dark:bg-neutral-700" />
                    </label>
                  </div>
                </div>
              </div>

              {/* 合作伙伴活跃度指标 */}
              <div className="space-y-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">合作伙伴活跃度指标</h4>
                
                <div className="bg-neutral-50/50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3">
                  {/* 交易指标 */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">交易</span>
                    </div>
                    <div className="flex flex-wrap gap-3 flex-1">
                      <label className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-3 h-3 rounded border-neutral-300" />
                        <span>订单频次</span>
                      </label>
                      <label className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-3 h-3 rounded border-neutral-300" />
                        <span>项目报备数量</span>
                      </label>
                      <label className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-3 h-3 rounded border-neutral-300" />
                        <span>成单金额</span>
                      </label>
                    </div>
                    <label className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                      <input type="checkbox" className="w-3 h-3 rounded border-neutral-300" />
                      <span>其他</span>
                      <input type="text" placeholder="自定义" className="w-16 text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-neutral-700" />
                    </label>
                  </div>

                  {/* 互动指标 */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">互动</span>
                    </div>
                    <div className="flex flex-wrap gap-3 flex-1">
                      <label className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-3 h-3 rounded border-neutral-300" />
                        <span>渠道门户登录频次</span>
                      </label>
                      <label className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-3 h-3 rounded border-neutral-300" />
                        <span>参与培训</span>
                      </label>
                    </div>
                    <label className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                      <input type="checkbox" className="w-3 h-3 rounded border-neutral-300" />
                      <span>其他</span>
                      <input type="text" placeholder="自定义" className="w-16 text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-neutral-700" />
                    </label>
                  </div>

                  {/* 市场指标 */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-purple-600" />
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">市场</span>
                    </div>
                    <div className="flex flex-wrap gap-3 flex-1">
                      <label className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-3 h-3 rounded border-neutral-300" />
                        <span>联合市场活动次数</span>
                      </label>
                      <label className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-3 h-3 rounded border-neutral-300" />
                        <span>商机线索跟进速度</span>
                      </label>
                    </div>
                    <label className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                      <input type="checkbox" className="w-3 h-3 rounded border-neutral-300" />
                      <span>其他</span>
                      <input type="text" placeholder="自定义" className="w-16 text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-neutral-700" />
                    </label>
                  </div>

                  {/* 沟通指标 */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-amber-600" />
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">沟通</span>
                    </div>
                    <div className="flex flex-wrap gap-3 flex-1">
                      <label className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-3 h-3 rounded border-neutral-300" />
                        <span>季度业务回顾（QBR）参与度</span>
                      </label>
                    </div>
                    <label className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                      <input type="checkbox" className="w-3 h-3 rounded border-neutral-300" />
                      <span>其他</span>
                      <input type="text" placeholder="自定义" className="w-16 text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-neutral-700" />
                    </label>
                  </div>
                </div>
              </div>

{/* 合作伙伴分类类型 */}
              <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">合作伙伴分类类型</h4>
                <p className="text-xs text-neutral-500">基于活跃度和业绩表现自动对合作伙伴进行分类（分类结果在合作伙伴详情页显示）</p>
                
                <div className="bg-neutral-50/50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      { key: 'Champions', label: '战略核心型', description: '活跃度极高且稳定' },
                      { key: 'RisingStars', label: '成长活跃型', description: '处于上升期，活跃趋势明显' },
                      { key: 'Opportunists', label: '项目驱动型', description: '活跃度呈阵发性、不连续' },
                      { key: 'Dormant', label: '沉默/睡眠型', description: '长期无实质产出' },
                      { key: 'Newcomers', label: '新晋观察型', description: '刚签约，处于磨合期' },
                    ].map((category) => (
                      <label key={category.key} className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-neutral-700/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300" />
                        <div>
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{category.label}</span>
                          <p className="text-xs text-neutral-500">{category.description}</p>
                        </div>
                        <Badge variant="info" size="sm" className="ml-auto text-[10px]">{category.key}</Badge>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* 用户列表 */}
          <Card padding={false}>
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <CardTitle>系统用户</CardTitle>
              <Button variant="brand" size="sm" onClick={openNewUser}><Plus className="w-4 h-4" />添加用户</Button>
            </div>
            
            {/* 用户分类标签 */}
            <div className="px-6 py-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex gap-2">
                <button onClick={() => setActiveUserTab('all')} className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all', activeUserTab === 'all' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800')}>全部 ({users.length})</button>
                <button onClick={() => setActiveUserTab('internal')} className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all', activeUserTab === 'internal' ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800')}>本公司 ({users.filter(u => u.source === 'admin').length})</button>
                <button onClick={() => setActiveUserTab('partner')} className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all', activeUserTab === 'partner' ? 'bg-emerald-600 text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800')}>合作伙伴 ({users.filter(u => u.source === 'partner').length})</button>
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="py-16">
                <EmptyState title="暂无用户" description={activeUserTab === 'internal' ? '本公司用户由管理员添加' : activeUserTab === 'partner' ? '合作伙伴用户需通过合作伙伴中心申请' : '点击添加按钮创建系统用户'} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/30">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">用户</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">来源</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">角色</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">部门</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">状态</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">最近登录</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td className="px-6 py-3">
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white">{u.name}</p>
                            <p className="text-xs text-neutral-400">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant={u.source === 'admin' ? 'info' : 'default'} size="sm">
                            {u.source === 'admin' ? '管理员添加' : '合作伙伴申请'}
                          </Badge>
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant={u.role === 'admin' ? 'primary' : isInternalRole(u.role) ? 'info' : 'default'} size="sm">
                            {ROLE_LABELS[u.role] || u.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-neutral-600 dark:text-neutral-400">{u.department}</td>
                        <td className="px-6 py-3">
                          {u.status === 'active' ? (
                            <Badge variant="success" size="sm">活跃</Badge>
                          ) : (
                            <Badge variant="warning" size="sm">停用</Badge>
                          )}
                        </td>
                        <td className="px-6 py-3 text-xs text-neutral-400">{u.lastLogin}</td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditUser(u)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-blue-500" title="编辑">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-lg text-neutral-300 cursor-not-allowed" title="禁止删除" disabled>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* 操作日志 */}
          <Card>
            <CardHeader>
              <CardTitle>操作日志</CardTitle>
              <CardDescription>记录用户管理的所有操作，包括添加、修改和状态变更</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="py-8 text-center text-neutral-400 text-sm">暂无操作记录</div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {logs.slice(0, 20).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                        {log.action === 'create' && <Plus className="w-4 h-4 text-emerald-500" />}
                        {log.action === 'update' && <Pencil className="w-4 h-4 text-blue-500" />}
                        {log.action === 'status_change' && <ToggleLeft className="w-4 h-4 text-amber-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {log.action === 'create' && `创建用户: ${log.userName}`}
                          {log.action === 'update' && `修改用户 ${log.userName} 的 ${log.field}: ${log.oldValue} → ${log.newValue}`}
                          {log.action === 'status_change' && `用户 ${log.userName} 状态变更: ${log.oldValue} → ${log.newValue}`}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          操作人: {log.operator} | {log.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ 角色权限 ═══ */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>角色定义</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowAddRole(!showAddRole)}><Plus className="w-3.5 h-3.5" /> 添加角色</Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddRole && (
                <div className="flex items-center gap-3 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <Input value={newRoleKey} onChange={(e) => setNewRoleKey(e.target.value)} placeholder="标识(英文)" className="w-40" />
                  <Input value={newRoleValue} onChange={(e) => setNewRoleValue(e.target.value)} placeholder="名称(中文)" className="w-40" />
                  <Select options={[{value:'internal',label:'内部角色'},{value:'external',label:'外部角色'}]} value={newRoleType} onChange={(e) => setNewRoleType(e.target.value as 'internal'|'external')} />
                  <Button variant="brand" size="sm" onClick={addRole}>确认添加</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddRole(false)}>取消</Button>
                </div>
              )}
              <div className="space-y-4">
                <p className="text-xs font-medium text-neutral-500">公司内部角色</p>
                <div className="grid grid-cols-4 gap-3">
                  {internalRoles.filter((r) => roleDefs[r]).map((role) => (
                    <div key={role} className={cn('p-3 rounded-xl border group relative', role === 'admin' ? 'border-purple-200 dark:border-purple-800 bg-purple-50/30' : role.includes('channel') ? 'border-blue-200 dark:border-blue-800 bg-blue-50/30' : role.includes('marketing') ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30' : 'border-amber-200 dark:border-amber-800 bg-amber-50/30')}>
                      {editRoleKey === role ? (
                        <div className="flex items-center gap-1">
                          <input value={editRoleValue} onChange={(e) => setEditRoleValue(e.target.value)} className="flex-1 px-2 py-1 text-xs border rounded bg-white dark:bg-neutral-800" autoFocus onKeyDown={(e) => e.key === 'Enter' && saveEditRole()} />
                          <button onClick={saveEditRole} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"><Check className="w-3 h-3" /></button>
                          <button onClick={() => setEditRoleKey(null)} className="p-1 text-red-400 hover:bg-red-50 rounded"><X className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs font-semibold text-neutral-900 dark:text-white cursor-pointer" onClick={() => startEditRole(role)}>{roleDefs[role]}</p>
                          <Badge variant="primary" size="sm" className="mt-1">{users.filter((u) => u.role === role).length} 人</Badge>
                          {role !== 'admin' && (
                            <button onClick={() => deleteRole(role)} className="absolute top-1 right-1 p-0.5 rounded opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all"><Trash2 className="w-3 h-3" /></button>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <p className="text-xs font-medium text-neutral-500">公司外部角色（渠道商）</p>
                <div className="grid grid-cols-3 gap-3">
                  {externalRoles.filter((r) => roleDefs[r]).map((role) => (
                    <div key={role} className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 group relative">
                      {editRoleKey === role ? (
                        <div className="flex items-center gap-1">
                          <input value={editRoleValue} onChange={(e) => setEditRoleValue(e.target.value)} className="flex-1 px-2 py-1 text-xs border rounded bg-white dark:bg-neutral-800" autoFocus onKeyDown={(e) => e.key === 'Enter' && saveEditRole()} />
                          <button onClick={saveEditRole} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"><Check className="w-3 h-3" /></button>
                          <button onClick={() => setEditRoleKey(null)} className="p-1 text-red-400 hover:bg-red-50 rounded"><X className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs font-semibold text-neutral-900 dark:text-white cursor-pointer" onClick={() => startEditRole(role)}>{roleDefs[role]}</p>
                          <Badge variant="default" size="sm" className="mt-1">{users.filter((u) => u.role === role).length} 人</Badge>
                          <button onClick={() => deleteRole(role)} className="absolute top-1 right-1 p-0.5 rounded opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all"><Trash2 className="w-3 h-3" /></button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>权限矩阵</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">点击图标切换权限</span>
                <Button variant="brand" size="sm" onClick={savePermissions}><Save className="w-3.5 h-3.5" /> 保存权限</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 公司内部角色权限 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-neutral-500" />
                    <p className="text-xs font-medium text-neutral-500">公司内部角色</p>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">权限模块</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">权限项</th>
                          {internalRoles.map((r) => (
                            <th key={r} className="text-center py-3 px-3 text-[10px] font-semibold text-neutral-500 uppercase">
                              {roleDefs[r] || r}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {PERMISSION_CATEGORIES.map((category) => (
                          permissionsByCategory[category]?.map((p, idx) => (
                            <tr key={p.key} className={idx === 0 ? 'border-t border-neutral-200 dark:border-neutral-800' : ''}>
                              {idx === 0 && (
                                <td rowSpan={permissionsByCategory[category]?.length || 1} className="py-2 px-4 bg-neutral-50/50 dark:bg-neutral-800/30">
                                  <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{t(`permission.${category}`) || category}</p>
                                </td>
                              )}
                              <td className="py-2 px-4">
                                <div className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 -mx-4 px-4 py-1 rounded transition-colors">
                                  <p className="text-xs font-medium text-neutral-900 dark:text-white" title={t(`perm.${p.key}_desc`) || p.desc || ''}>
                                    {t(`perm.${p.key}`) || p.label}
                                  </p>
                                </div>
                              </td>
                              {internalRoles.map((r) => (
                                <td key={r} className="py-2 px-3 text-center">
                                  <button
                                    onClick={() => togglePermission(p.key, r)}
                                    className={cn('w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                                      p[r] 
                                        ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/30' 
                                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-400'
                                    )}
                                    title={`${roleDefs[r] || r}: ${p[r] ? t('common.authorized') || '已授权' : t('common.unauthorized') || '未授权'} (${t('common.clickToToggle') || '点击切换'})`}
                                  >
                                    {p[r] ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                  </button>
                                </td>
                              ))}
                            </tr>
                          ))
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 公司外部角色权限 */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-neutral-500" />
                    <p className="text-xs font-medium text-neutral-500">公司外部角色（渠道商）</p>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">权限模块</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">权限项</th>
                          {externalRoles.map((r) => (
                            <th key={r} className="text-center py-3 px-3 text-[10px] font-semibold text-neutral-500 uppercase">
                              {roleDefs[r] || r}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {PERMISSION_CATEGORIES.map((category) => (
                          permissionsByCategory[category]?.map((p, idx) => (
                            <tr key={p.key} className={idx === 0 ? 'border-t border-neutral-200 dark:border-neutral-800' : ''}>
                              {idx === 0 && (
                                <td rowSpan={permissionsByCategory[category]?.length || 1} className="py-2 px-4 bg-neutral-50/50 dark:bg-neutral-800/30">
                                  <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{t(`permission.${category}`) || category}</p>
                                </td>
                              )}
                              <td className="py-2 px-4">
                                <div className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 -mx-4 px-4 py-1 rounded transition-colors">
                                  <p className="text-xs font-medium text-neutral-900 dark:text-white" title={t(`perm.${p.key}_desc`) || p.desc || ''}>
                                    {t(`perm.${p.key}`) || p.label}
                                  </p>
                                </div>
                              </td>
                              {externalRoles.map((r) => (
                                <td key={r} className="py-2 px-3 text-center">
                                  <button
                                    onClick={() => togglePermission(p.key, r)}
                                    className={cn('w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                                      p[r] 
                                        ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/30' 
                                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-400'
                                    )}
                                    title={`${roleDefs[r] || r}: ${p[r] ? '已授权' : '未授权'} (点击切换)`}
                                  >
                                    {p[r] ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                  </button>
                                </td>
                              ))}
                            </tr>
                          ))
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 权限图例 */}
                <div className="flex items-center justify-center gap-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-neutral-500">已授权</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-neutral-400" />
                    <span className="text-xs text-neutral-500">未授权</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ 安全设置 ═══ */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>登录方式</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><Mail className="w-5 h-5 text-blue-600" /></div>
                    <div><p className="text-sm font-semibold text-neutral-900 dark:text-white">邮箱密码登录</p><p className="text-xs text-neutral-500">通过 Supabase Auth 进行邮箱密码认证</p></div>
                  </div>
                  <Badge variant="success" size="sm">已启用</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center"><Smartphone className="w-5 h-5 text-purple-600" /></div>
                    <div><p className="text-sm font-semibold text-neutral-900 dark:text-white">微信扫码登录</p><p className="text-xs text-neutral-500">通过微信公众号授权登录（需配置微信开放平台）</p></div>
                  </div>
                  <Badge variant="default" size="sm">待配置</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center"><Key className="w-5 h-5 text-amber-600" /></div>
                    <div><p className="text-sm font-semibold text-neutral-900 dark:text-white">SSO 单点登录</p><p className="text-xs text-neutral-500">通过 SAML/OIDC 对接企业身份系统</p></div>
                  </div>
                  <Badge variant="default" size="sm">待配置</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>安全策略</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><Shield className="w-5 h-5 text-red-500" /></div>
                    <div><p className="text-sm font-semibold text-neutral-900 dark:text-white">双因素认证 (2FA)</p><p className="text-xs text-neutral-500">登录时需额外验证手机验证码</p></div>
                  </div>
                  <button onClick={() => setEditingConfig({ ...editingConfig, require2FA: !editingConfig.require2FA })}
                    className={cn('relative w-12 h-7 rounded-full transition-colors', editingConfig.require2FA ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-600')}>
                    <span className={cn('absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform', editingConfig.require2FA ? 'translate-x-5' : 'translate-x-0.5')} />
                  </button>
                </div>
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-neutral-500" /><span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">会话超时 (分钟)</span></div>
                  <Input type="number" value={editingConfig.sessionTimeoutMin || 60} onChange={(e) => setEditingConfig({ ...editingConfig, sessionTimeoutMin: parseInt(e.target.value) || 60 })} />
                </div>
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-neutral-500" /><span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">密码最小长度</span></div>
                  <Input type="number" value={editingConfig.passwordMinLength || 8} onChange={(e) => setEditingConfig({ ...editingConfig, passwordMinLength: parseInt(e.target.value) || 8 })} />
                </div>
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /><span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">最大登录尝试次数</span></div>
                  <Input type="number" value={editingConfig.loginAttempts || 5} onChange={(e) => setEditingConfig({ ...editingConfig, loginAttempts: parseInt(e.target.value) || 5 })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>当前会话</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{user?.email || '未登录'}</p>
                    <p className="text-xs text-neutral-400">角色: {ROLE_LABELS[role] || role} · 本次登录: {new Date().toLocaleString()}</p>
                  </div>
                  <Badge variant="success" size="sm">活跃</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'global' && (
        <Card>
          <CardHeader><CardTitle>模块开关</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'revenueAlignment', label: '业绩概览与诊断' },
                { key: 'partnershipMatrix', label: '渠道矩阵与网络图' },
                { key: 'ecosystemNetwork', label: '生态拓扑图' },
                { key: 'mdfEfficiency', label: 'MDF 效率分析' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
                  <input type="checkbox" checked={!!editingConfig.sections[key as keyof typeof editingConfig.sections]}
                    onChange={(e) => setEditingConfig({ ...editingConfig, sections: { ...editingConfig.sections, [key]: e.target.checked } })}
                    className="w-4 h-4 rounded" />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── User Form Modal ─── */}
      {showUserForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowUserForm(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{userForm.id ? '编辑用户' : '添加用户'}</h3>
            <div className="space-y-3">
              <Input label="姓名 *" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
              <Input label="邮箱 *" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
              <Select label="角色" options={roleOptions} value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })} />
              <Select label="部门" options={deptOptions} value={userForm.department} onChange={(e) => setUserForm({ ...userForm, department: e.target.value })} />
              <Input label="手机号" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
              <Select label="状态" options={[{ value: 'active', label: '活跃' }, { value: 'inactive', label: '停用' }]} value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value as 'active' | 'inactive' })} />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => setShowUserForm(false)}>取消</Button>
              <Button variant="brand" onClick={saveUser}><Save className="w-4 h-4" />保存</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={deleteUser}
        title="确认删除" description="确定要移除此用户吗？此操作不可撤销。" confirmLabel="删除" variant="danger" />
    </div>
  );
};
