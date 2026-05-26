import { useState } from 'react';
import { User, Building2, Shield, Globe, Save, Plus, Trash2, Pencil, Check, X, Lock, Key, Clock, Smartphone, AlertTriangle, Mail } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABELS, isInternalRole, isExternalRole, type UserRole } from '../../services/auth-service';
import { useToast } from '../ui/Toast';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Tabs } from '../ui/Tabs';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { GlobalConfig } from '../../types';

interface SystemUser { id: string; name: string; email: string; role: UserRole; department: string; phone: string; status: 'active' | 'inactive'; lastLogin: string; }
interface CompanyInfo { nameCN: string; nameEN: string; logo: string; address: string; businessModel: string; annualTarget: string; quarterlyTarget: string; }

interface PermissionDef { key: string; label: string; desc: string; [role: string]: string | boolean; }
interface SecuritySettings { require2FA: boolean; passwordMinLength: number; passwordExpireDays: number; sessionTimeoutMin: number; loginAttempts: number; ipWhitelist: string; }

const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));
const deptOptions = [
  { value: '管理层', label: '管理层' }, { value: '渠道部', label: '渠道部' }, { value: '市场部', label: '市场部' },
  { value: '销售部', label: '销售部' }, { value: '技术部', label: '技术部' }, { value: '运营部', label: '运营部' },
  { value: '渠道商', label: '渠道商（外部）' },
];

const defaultUsers: SystemUser[] = [
  { id: 'u1', name: 'Alex Rivera', email: 'alex@partnernxus.com', role: 'admin', department: '管理层', phone: '13800000001', status: 'active', lastLogin: '2025-05-23 08:30' },
  { id: 'u2', name: '张伟', email: 'zhangw@partnernxus.com', role: 'channel_director', department: '渠道部', phone: '13800000002', status: 'active', lastLogin: '2025-05-22 17:15' },
  { id: 'u3', name: '李娜', email: 'lina@partnernxus.com', role: 'marketing_manager', department: '市场部', phone: '13800000003', status: 'active', lastLogin: '2025-05-23 09:00' },
  { id: 'u4', name: '王强', email: 'wangq@partnernxus.com', role: 'sales_manager', department: '销售部', phone: '13800000004', status: 'active', lastLogin: '2025-04-15 14:20' },
  { id: 'u5', name: '神州数码-管理员', email: 'dc_admin@digitalchina.com', role: 'partner_admin', department: '渠道商', phone: '13900000001', status: 'active', lastLogin: '2025-05-20 10:00' },
  { id: 'u6', name: '东软-销售', email: 'sales@neusoft.com', role: 'partner_sales', department: '渠道商', phone: '13900000002', status: 'active', lastLogin: '2025-05-21 14:30' },
  { id: 'u7', name: '浪潮-工程师', email: 'engineer@inspur.com', role: 'partner_engineer', department: '渠道商', phone: '13900000003', status: 'active', lastLogin: '2025-05-19 09:15' },
];

const defaultCompany: CompanyInfo = {
  nameCN: 'PartnerNexus 合作伙伴管理平台', nameEN: 'PartnerNexus PRM Platform',
  logo: '', address: '北京市海淀区中关村科技园',
  businessModel: '渠道合作伙伴关系管理（PRM），覆盖招募、赋能、激励、商机全生命周期',
  annualTarget: '¥5,000万', quarterlyTarget: '¥1,250万',
};

export const SettingsPage = () => {
  const { t, language, setLanguage } = useLanguage();
  const { config, updateConfig } = useConfig();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);

  // ── Company state ───────────────────────────────────
  const [company, setCompany] = useState<CompanyInfo>(defaultCompany);
  const [editingConfig, setEditingConfig] = useState(config);

  // ── User management state ───────────────────────────
  const [users, setUsers] = useState<SystemUser[]>(defaultUsers);
  const [editUser, setEditUser] = useState<SystemUser | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<SystemUser>({ id: '', name: '', email: '', role: 'channel_manager', department: '渠道部', phone: '', status: 'active', lastLogin: '-' });

  const openNewUser = () => { setUserForm({ id: '', name: '', email: '', role: 'channel_manager', department: '渠道部', phone: '', status: 'active', lastLogin: '-' }); setShowUserForm(true); };
  const openEditUser = (u: SystemUser) => { setUserForm({ ...u }); setShowUserForm(true); };
  const saveUser = () => {
    if (!userForm.name || !userForm.email) { toast('error', '姓名和邮箱不能为空'); return; }
    if (userForm.id) { setUsers((p) => p.map((u) => (u.id === userForm.id ? userForm : u))); toast('success', '用户已更新'); }
    else { setUsers((p) => [...p, { ...userForm, id: 'u' + Date.now() }]); toast('success', '用户已添加'); }
    setShowUserForm(false);
  };
  const deleteUser = () => { if (deleteId) { setUsers((p) => p.filter((u) => u.id !== deleteId)); setDeleteId(null); toast('success', '用户已删除'); } };

  const handleSave = async () => {
    setSaving(true);
    try { await updateConfig(editingConfig); toast('success', t('settings.saved')); } catch { toast('error', '保存失败'); }
    setSaving(false);
  };

  // ── Permissions matrix ──────────────────────────────
  // ── Editable permissions (admin can toggle and save) ──
  const [permissions, setPermissions] = useState<PermissionDef[]>([
    { key: 'dashboard', label: '工作台', desc: '查看业绩总揽、趋势图表', admin: true, channel_director: true, channel_manager: true, marketing_director: true, marketing_manager: true, sales_director: true, sales_manager: true, partner_admin: true, partner_sales: true, partner_engineer: true },
    { key: 'partners_view', label: '查看合作伙伴', desc: '浏览合作伙伴列表和详情', admin: true, channel_director: true, channel_manager: true, marketing_director: true, marketing_manager: true, sales_director: true, sales_manager: true, partner_admin: true, partner_sales: true, partner_engineer: true },
    { key: 'partners_edit', label: '编辑合作伙伴', desc: '新增、修改、删除合作伙伴', admin: true, channel_director: true, channel_manager: true, marketing_director: false, marketing_manager: false, sales_director: false, sales_manager: false, partner_admin: true, partner_sales: false, partner_engineer: false },
    { key: 'partners_import', label: '导入合作伙伴', desc: '批量导入 Excel 数据', admin: true, channel_director: true, channel_manager: false, marketing_director: false, marketing_manager: false, sales_director: false, sales_manager: false, partner_admin: true, partner_sales: false, partner_engineer: false },
    { key: 'deals_view', label: '查看商机', desc: '浏览商机报备列表', admin: true, channel_director: true, channel_manager: true, marketing_director: true, marketing_manager: true, sales_director: true, sales_manager: true, partner_admin: true, partner_sales: true, partner_engineer: true },
    { key: 'deals_approve', label: '审批商机', desc: '批复或拒绝商机报备', admin: true, channel_director: true, channel_manager: true, marketing_director: false, marketing_manager: false, sales_director: false, sales_manager: false, partner_admin: false, partner_sales: false, partner_engineer: false },
    { key: 'deals_register', label: '提交报备', desc: '渠道商提交新商机报备', admin: true, channel_director: true, channel_manager: true, marketing_director: false, marketing_manager: false, sales_director: false, sales_manager: false, partner_admin: true, partner_sales: true, partner_engineer: false },
    { key: 'marketing_view', label: '查看营销', desc: '查看 MDF、活动、激励计划', admin: true, channel_director: true, channel_manager: true, marketing_director: true, marketing_manager: true, sales_director: true, sales_manager: true, partner_admin: true, partner_sales: true, partner_engineer: false },
    { key: 'marketing_manage', label: '管理营销', desc: '派发 MDF、审批活动申请', admin: true, channel_director: false, channel_manager: false, marketing_director: true, marketing_manager: true, sales_director: false, sales_manager: false, partner_admin: true, partner_sales: false, partner_engineer: false },
    { key: 'incentives_manage', label: '管理激励', desc: '创建和调整激励计划', admin: true, channel_director: false, channel_manager: false, marketing_director: true, marketing_manager: false, sales_director: true, sales_manager: false, partner_admin: false, partner_sales: false, partner_engineer: false },
    { key: 'users_manage', label: '用户管理', desc: '添加/编辑/删除系统用户', admin: true, channel_director: false, channel_manager: false, marketing_director: false, marketing_manager: false, sales_director: false, sales_manager: false, partner_admin: false, partner_sales: false, partner_engineer: false },
    { key: 'settings_global', label: '全局设置', desc: '修改系统配置参数', admin: true, channel_director: false, channel_manager: false, marketing_director: false, marketing_manager: false, sales_director: false, sales_manager: false, partner_admin: false, partner_sales: false, partner_engineer: false },
    { key: 'security_settings', label: '安全设置', desc: '配置2FA、密码策略、会话', admin: true, channel_director: false, channel_manager: false, marketing_director: false, marketing_manager: false, sales_director: false, sales_manager: false, partner_admin: false, partner_sales: false, partner_engineer: false },
  ]);

  const togglePermission = (permKey: string, role: string) => {
    setPermissions((prev) => prev.map((p) => p.key === permKey ? { ...p, [role]: !p[role] } : p));
  };

  const savePermissions = () => {
    localStorage.setItem('partnernxus_permissions', JSON.stringify(permissions));
    toast('success', '权限配置已保存');
  };

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

  // ── Security settings ───────────────────────────────
  const [security, setSecurity] = useState<SecuritySettings>({
    require2FA: false, passwordMinLength: 8, passwordExpireDays: 90, sessionTimeoutMin: 60, loginAttempts: 5, ipWhitelist: '',
  });
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
            <CardHeader><CardTitle>公司信息</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="中文名称" value={company.nameCN} onChange={(e) => setCompany({ ...company, nameCN: e.target.value })} />
                <Input label="英文名称" value={company.nameEN} onChange={(e) => setCompany({ ...company, nameEN: e.target.value })} />
                <Input label="Logo URL" value={company.logo} onChange={(e) => setCompany({ ...company, logo: e.target.value })} placeholder="https://..." />
                <div className="md:col-span-2"><Input label="地址" value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} /></div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">业务模式</label>
                  <textarea className="w-full px-3 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/20" rows={2} value={company.businessModel} onChange={(e) => setCompany({ ...company, businessModel: e.target.value })} />
                </div>
                <Input label="年度目标" value={company.annualTarget} onChange={(e) => setCompany({ ...company, annualTarget: e.target.value })} />
                <Input label="季度目标" value={company.quarterlyTarget} onChange={(e) => setCompany({ ...company, quarterlyTarget: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          {/* Global Config */}
          <Card>
            <CardHeader><CardTitle>全局配置</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">结算币种</label>
                  <Select options={currencyOptions} value={editingConfig.currency} onChange={(e) => setEditingConfig({ ...editingConfig, currency: e.target.value as GlobalConfig['currency'] })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">界面语言</label>
                  <div className="flex gap-2">
                    <button onClick={() => setLanguage('zh')} className={cn('flex-1 py-2 rounded-lg border text-sm font-medium transition-all', language === 'zh' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900' : 'border-neutral-200 dark:border-neutral-700 text-neutral-500')}>中文</button>
                    <button onClick={() => setLanguage('en')} className={cn('flex-1 py-2 rounded-lg border text-sm font-medium transition-all', language === 'en' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900' : 'border-neutral-200 dark:border-neutral-700 text-neutral-500')}>English</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">区域设定</label>
                  <Input value={editingConfig.regions.join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, regions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="华北, 华东, 华南, 西部" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">行业设定</label>
                  <Input value={editingConfig.industries.join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, industries: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="金融, 医疗, 政务, 制造, 教育" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">伙伴等级</label>
                  <Input value={editingConfig.partnerTiers.join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, partnerTiers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="Platinum, Gold, Silver, Registered" />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 mt-3">伙伴类型</label>
                  <Input value={(editingConfig.partnerTypes || []).join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, partnerTypes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="Reseller, ISV, SI, Service, VAD, VAR, OEM" />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 mt-3">伙伴状态</label>
                  <Input value={(editingConfig.partnerStatuses || []).join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, partnerStatuses: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="Cooperating, Inactive, Prospective" />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 mt-3">合作厂商</label>
                  <Input value={(editingConfig.partnerVendors || []).join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, partnerVendors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="华为, 浪潮, 联想, Oracle, AWS" />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 mt-3">合作级别</label>
                  <Input value={(editingConfig.cooperationLevels || []).join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, cooperationLevels: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="战略级, 金牌代理, 银牌代理, 认证代理, 注册代理" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">销售阶段</label>
                  <Input value={editingConfig.salesStages.join(', ')} onChange={(e) => setEditingConfig({ ...editingConfig, salesStages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="需求发现, 方案阶段, 商务洽谈, 合同签约" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <Card padding={false}>
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <CardTitle>系统用户</CardTitle>
            <Button variant="brand" size="sm" onClick={openNewUser}><Plus className="w-4 h-4" />添加用户</Button>
          </div>
          {users.length === 0 ? <div className="py-16"><EmptyState title="暂无用户" description="点击添加按钮创建系统用户" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/30"><th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">用户</th><th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">角色</th><th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">部门</th><th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">状态</th><th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">最近登录</th><th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase">操作</th></tr></thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="px-6 py-3"><div><p className="font-medium text-neutral-900 dark:text-white">{u.name}</p><p className="text-xs text-neutral-400">{u.email}</p></div></td>
                      <td className="px-6 py-3"><Badge variant={u.role === 'admin' ? 'primary' : isInternalRole(u.role) ? 'info' : 'default'} size="sm">{ROLE_LABELS[u.role] || u.role}</Badge></td>
                      <td className="px-6 py-3 text-neutral-600 dark:text-neutral-400">{u.department}</td>
                      <td className="px-6 py-3">{u.status === 'active' ? <Badge variant="success" size="sm">活跃</Badge> : <Badge variant="warning" size="sm">停用</Badge>}</td>
                      <td className="px-6 py-3 text-xs text-neutral-400">{u.lastLogin}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditUser(u)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-blue-500" title="编辑"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-500" title="删除"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
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
                <span className="text-xs text-neutral-400">点击 ✅ / ❌ 切换权限</span>
                <Button variant="brand" size="sm" onClick={savePermissions}><Save className="w-3.5 h-3.5" /> 保存权限</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <p className="text-xs font-medium text-neutral-500 mb-3">公司内部</p>
                <table className="w-full text-sm mb-6">
                  <thead><tr className="border-b border-neutral-200 dark:border-neutral-800"><th className="text-left py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">权限项</th>{internalRoles.map((r) => (<th key={r} className="text-center py-2 px-1 text-[10px] font-semibold text-neutral-500 uppercase">{roleDefs[r] || r}</th>))}</tr></thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {permissions.map((p) => (
                      <tr key={p.key}><td className="py-2 px-3"><p className="text-xs font-medium text-neutral-900 dark:text-white">{p.label}</p></td>
                        {internalRoles.map((r) => (
                          <td key={r} className="py-2 px-1 text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded transition-colors"
                            onClick={() => togglePermission(p.key, r)} title={`${roleDefs[r] || r}: ${p[r] ? '已授权' : '未授权'} (点击切换)`}>
                            {p[r] ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-neutral-300 mx-auto hover:text-red-400" />}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs font-medium text-neutral-500 mb-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">公司外部（渠道商）</p>
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-neutral-200 dark:border-neutral-800"><th className="text-left py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">权限项</th>{externalRoles.map((r) => (<th key={r} className="text-center py-2 px-2 text-[10px] font-semibold text-neutral-500 uppercase">{roleDefs[r] || r}</th>))}</tr></thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {permissions.map((p) => (
                      <tr key={p.key}><td className="py-2 px-3"><p className="text-xs font-medium text-neutral-900 dark:text-white">{p.label}</p></td>
                        {externalRoles.map((r) => (
                          <td key={r} className="py-2 px-2 text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded transition-colors"
                            onClick={() => togglePermission(p.key, r)} title={`${roleDefs[r] || r}: ${p[r] ? '已授权' : '未授权'} (点击切换)`}>
                            {p[r] ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-neutral-300 mx-auto hover:text-red-400" />}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  <button onClick={() => setSecurity({ ...security, require2FA: !security.require2FA })}
                    className={cn('relative w-12 h-7 rounded-full transition-colors', security.require2FA ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-600')}>
                    <span className={cn('absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform', security.require2FA ? 'translate-x-5' : 'translate-x-0.5')} />
                  </button>
                </div>
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-neutral-500" /><span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">会话超时 (分钟)</span></div>
                  <Input type="number" value={security.sessionTimeoutMin} onChange={(e) => setSecurity({ ...security, sessionTimeoutMin: parseInt(e.target.value) || 60 })} />
                </div>
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-neutral-500" /><span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">密码最小长度</span></div>
                  <Input type="number" value={security.passwordMinLength} onChange={(e) => setSecurity({ ...security, passwordMinLength: parseInt(e.target.value) || 8 })} />
                </div>
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-neutral-500" /><span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">密码过期天数</span></div>
                  <Input type="number" value={security.passwordExpireDays} onChange={(e) => setSecurity({ ...security, passwordExpireDays: parseInt(e.target.value) || 90 })} />
                </div>
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /><span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">最大登录尝试次数</span></div>
                  <Input type="number" value={security.loginAttempts} onChange={(e) => setSecurity({ ...security, loginAttempts: parseInt(e.target.value) || 5 })} />
                </div>
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-neutral-500" /><span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">IP 白名单 (逗号分隔)</span></div>
                  <Input value={security.ipWhitelist} onChange={(e) => setSecurity({ ...security, ipWhitelist: e.target.value })} placeholder="192.168.1.0/24, 10.0.0.1" />
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
