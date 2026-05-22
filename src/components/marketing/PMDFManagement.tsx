import { useState, useMemo } from 'react';
import {
  DollarSign, Plus, Search, ChevronRight, Calendar, MapPin, Users, Clock,
  CheckCircle2, XCircle, FileText, Send, Download, Eye, MessageSquare,
  QrCode, Gift, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Target, Award, Bell, Smartphone, Zap, Filter, MoreHorizontal, Building2,
  Mail, Phone, User, BarChart3, PieChart, Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { ProgressBar } from '../ui/ProgressBar';
import { Tabs } from '../ui/Tabs';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { cn, formatCurrency } from '../../lib/utils';

// ─── Types ─────────────────────────────────────────────
type WorkflowStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'executing' | 'completed';
type AllocationStatus = 'available' | 'allocated' | 'used';

interface PMDFApplication {
  id: string;
  partnerId: string;
  partnerName: string;
  eventName: string;
  eventDate: string;
  location: string;
  budgetRequested: number;
  budgetApproved: number;
  costBreakdown: { item: string; amount: number }[];
  invitedCustomers: { name: string; company: string; title: string; phone: string; email: string }[];
  agenda: { time: string; topic: string; speaker: string }[];
  status: WorkflowStatus;
  submittedAt: string;
  approvedAt?: string;
  miniProgramId?: string;
  attendance?: number;
  leads?: number;
}

interface AllocationRecord {
  id: string;
  partnerId: string;
  partnerName: string;
  tier: string;
  amount: number;
  status: AllocationStatus;
  applications: number;
  approvedApps: number;
}

// ─── Mock Data ─────────────────────────────────────────
const quarterlyPool = { q: '2025 Q3', total: 2500000, allocated: 1850000, remaining: 650000, partnerCount: 8 };

const allocations: AllocationRecord[] = [
  { id: 'al1', partnerId: 'PRA-073576', partnerName: '北京网联信通', tier: 'Gold', amount: 500000, status: 'used', applications: 2, approvedApps: 2 },
  { id: 'al2', partnerId: 'PRA-088088', partnerName: '苏州新研联', tier: 'Platinum', amount: 450000, status: 'allocated', applications: 1, approvedApps: 1 },
  { id: 'al3', partnerId: 'PRA-001215', partnerName: '昆仑联通', tier: 'Platinum', amount: 400000, status: 'used', applications: 2, approvedApps: 2 },
  { id: 'al4', partnerId: 'PRA-045205', partnerName: '精诚中国', tier: 'Platinum', amount: 300000, status: 'allocated', applications: 2, approvedApps: 0 },
  { id: 'al5', partnerId: 'PRA-089977', partnerName: '广州恒硕', tier: 'Gold', amount: 200000, status: 'available', applications: 0, approvedApps: 0 },
];

const applications: PMDFApplication[] = [
  { id: 'app1', partnerId: 'PRA-073576', partnerName: '北京网联信通', eventName: '华北医疗CIO数字化转型峰会', eventDate: '2025-08-15', location: '北京国家会议中心', budgetRequested: 320000, budgetApproved: 280000, costBreakdown: [{ item: '场地租赁', amount: 80000 }, { item: '茶歇餐饮', amount: 45000 }, { item: '演讲嘉宾', amount: 60000 }, { item: '物料制作', amount: 35000 }, { item: '媒体推广', amount: 40000 }, { item: '其他', amount: 20000 }], invitedCustomers: [{ name: '张伟', company: '北京协和医院', title: '信息科主任', phone: '13800138001', email: 'zhangw@hospital.com' }, { name: '李明', company: '北京大学第一医院', title: 'IT总监', phone: '13800138002', email: 'lim@hospital.com' }, { name: '王芳', company: '中日友好医院', title: '信息中心副主任', phone: '13800138003', email: 'wangf@hospital.com' }], agenda: [{ time: '09:00-09:30', topic: '签到与欢迎', speaker: '任志刚' }, { time: '09:30-10:30', topic: '医疗数字化转型趋势', speaker: '行业专家' }, { time: '10:30-11:30', topic: '云原生在医疗场景的实践', speaker: '吴晓迪' }, { time: '11:30-12:00', topic: '圆桌讨论', speaker: '全体' }, { time: '12:00-13:30', topic: '商务午餐', speaker: '-' }], status: 'executing', submittedAt: '2025-07-01', approvedAt: '2025-07-10', miniProgramId: 'MP20250815', attendance: 45, leads: 18 },
  { id: 'app2', partnerId: 'PRA-088088', partnerName: '苏州新研联', eventName: '长三角云原生技术研讨会', eventDate: '2025-08-22', location: '苏州金鸡湖国际会议中心', budgetRequested: 180000, budgetApproved: 150000, costBreakdown: [{ item: '场地租赁', amount: 50000 }, { item: '茶歇餐饮', amount: 25000 }, { item: '演讲嘉宾', amount: 35000 }, { item: '物料制作', amount: 20000 }, { item: '其他', amount: 20000 }], invitedCustomers: [{ name: '陈强', company: '苏州市卫健委', title: '信息处处长', phone: '13900139001', email: 'chenq@gov.com' }, { name: '刘洋', company: '苏州工业园区管委会', title: '数字办副主任', phone: '13900139002', email: 'liuy@gov.com' }], agenda: [{ time: '09:00-09:30', topic: '签到', speaker: '-' }, { time: '09:30-11:00', topic: '云原生架构最佳实践', speaker: '技术专家' }, { time: '11:00-12:00', topic: '客户案例分享', speaker: '客户代表' }], status: 'approved', submittedAt: '2025-07-05', approvedAt: '2025-07-12' },
  { id: 'app3', partnerId: 'PRA-045205', partnerName: '精诚中国', eventName: '大湾区制造业数字化转型论坛', eventDate: '2025-09-05', location: '深圳福田香格里拉', budgetRequested: 250000, budgetApproved: 0, costBreakdown: [{ item: '场地租赁', amount: 90000 }, { item: '餐饮', amount: 50000 }, { item: '演讲嘉宾', amount: 50000 }, { item: '物料', amount: 30000 }, { item: '推广', amount: 30000 }], invitedCustomers: [{ name: '赵强', company: '比亚迪', title: 'CIO', phone: '13700137001', email: 'zhaoq@byd.com' }], agenda: [{ time: '09:00-12:00', topic: '主题演讲', speaker: '待定' }], status: 'submitted', submittedAt: '2025-07-08' },
  { id: 'app4', partnerId: 'PRA-073576', partnerName: '北京网联信通', eventName: '金融行业数据安全研讨会', eventDate: '2025-09-20', location: '北京金融街威斯汀', budgetRequested: 220000, budgetApproved: 200000, costBreakdown: [{ item: '场地', amount: 70000 }, { item: '餐饮', amount: 40000 }, { item: '演讲', amount: 50000 }, { item: '物料', amount: 30000 }, { item: '推广', amount: 30000 }], invitedCustomers: [{ name: '周明', company: '中国工商银行', title: '科技部总经理', phone: '13600136001', email: 'zhoum@icbc.com' }], agenda: [{ time: '09:00-12:00', topic: '数据安全合规', speaker: '安全专家' }], status: 'draft', submittedAt: '' },
];

// ─── Mini Program behavior data ────────────────────────
const behaviorScores = [
  { name: '张伟', company: '北京协和医院', registered: true, attended: true, questions: 3, shared: 5, referrals: 2, score: 185, level: '金牌' },
  { name: '李明', company: '北京大学第一医院', registered: true, attended: true, questions: 1, shared: 2, referrals: 0, score: 85, level: '银牌' },
  { name: '王芳', company: '中日友好医院', registered: true, attended: false, questions: 0, shared: 1, referrals: 0, score: 25, level: '铜牌' },
  { name: '陈强', company: '苏州市卫健委', registered: true, attended: true, questions: 5, shared: 8, referrals: 3, score: 245, level: '金牌' },
  { name: '刘洋', company: '苏州工业园区管委会', registered: true, attended: true, questions: 2, shared: 3, referrals: 1, score: 115, level: '银牌' },
];

const scoreRules = [
  { action: '报名参会', points: 20, icon: Calendar },
  { action: '到场签到', points: 30, icon: CheckCircle2 },
  { action: '提问互动', points: 15, icon: MessageSquare, note: '/次' },
  { action: '转发邀请', points: 10, icon: Send, note: '/次' },
  { action: '邀请到场', points: 40, icon: Users, note: '/人' },
];

const gifts = [
  { name: '品牌定制笔记本', cost: 50, stock: 100, image: '📓' },
  { name: '蓝牙耳机', cost: 200, stock: 30, image: '🎧' },
  { name: '技术书籍套装', cost: 300, stock: 20, image: '📚' },
  { name: '云平台代金券 ¥500', cost: 500, stock: 50, image: '💳' },
  { name: '行业峰会门票', cost: 1000, stock: 10, image: '🎫' },
];

export const PMDFManagement = () => {
  const [activeTab, setActiveTab] = useState('pool');
  const [selectedApp, setSelectedApp] = useState<PMDFApplication | null>(null);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showAppDetail, setShowAppDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredApps = applications.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (searchTerm && !a.eventName.includes(searchTerm) && !a.partnerName.includes(searchTerm)) return false;
    return true;
  });

  const tabItems = [
    { id: 'pool', label: '资源池' }, { id: 'applications', label: '申请审批' },
    { id: 'execution', label: '执行跟踪' }, { id: 'miniprogram', label: '小程序' },
  ];

  const statusLabel = (s: WorkflowStatus) => ({ draft: '草稿', submitted: '待审批', approved: '已批复', rejected: '已驳回', executing: '执行中', completed: '已完成' }[s]);
  const statusVariant = (s: WorkflowStatus) => ({ draft: 'default', submitted: 'info', approved: 'success', rejected: 'danger', executing: 'warning', completed: 'success' }[s] as 'default'|'info'|'success'|'danger'|'warning');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">PMDF 市场发展基金管理</h1>
          <p className="text-sm text-neutral-500 mt-1">资源池 → 派发 → 申请 → 批复 → 执行 → 评估，全链路数字化管理</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> 导出报表</Button>
          <Button variant="brand" size="sm" onClick={() => setShowAllocateModal(true)}><Plus className="w-4 h-4" /> 新建派发</Button>
        </div>
      </div>

      <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

      {/* ══════════════════════════════════════════════
          TAB 1: 资源池
          ══════════════════════════════════════════════ */}
      {activeTab === 'pool' && (
        <div className="space-y-6">
          {/* Pool Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="lg:col-span-1">
              <div className="text-center py-4">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e4e4e7" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#2563eb" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${((quarterlyPool.allocated / quarterlyPool.total) * 100) * 2.51} 251`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-semibold">{Math.round((quarterlyPool.allocated / quarterlyPool.total) * 100)}%</span>
                    <span className="text-[10px] text-neutral-400">已分配</span>
                  </div>
                </div>
                <p className="text-sm font-semibold">{quarterlyPool.q} 资源池</p>
                <p className="text-xs text-neutral-400 mt-1">总额 {formatCurrency(quarterlyPool.total)}</p>
              </div>
            </Card>
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: '资源池总额', value: formatCurrency(quarterlyPool.total), icon: DollarSign, color: 'text-neutral-700' },
                { label: '已派发', value: formatCurrency(quarterlyPool.allocated), sub: `${quarterlyPool.partnerCount}家伙伴`, icon: Send, color: 'text-blue-600' },
                { label: '可派发余额', value: formatCurrency(quarterlyPool.remaining), sub: '待分配资源', icon: Target, color: 'text-emerald-600' },
                { label: '预期ROI', value: '3.2x', sub: `预计产生 ${formatCurrency(quarterlyPool.total * 3.2)} Pipeline`, icon: TrendingUp, color: 'text-amber-600' },
              ].map((s) => (
                <Card key={s.label}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0"><s.icon className={s.color} /></div>
                    <div><p className="text-xs text-neutral-500">{s.label}</p><p className="text-lg font-semibold text-neutral-900 dark:text-white">{s.value}</p>{s.sub && <p className="text-[11px] text-neutral-400">{s.sub}</p>}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Allocation Table */}
          <Card>
            <CardHeader><CardTitle>派发记录</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-neutral-200 dark:border-neutral-800"><th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">伙伴名称</th><th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">等级</th><th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">派发金额</th><th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">状态</th><th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">申请/批复</th><th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">操作</th></tr></thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {allocations.map((al) => (
                      <tr key={al.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td className="py-3 px-4 font-medium text-neutral-900 dark:text-white">{al.partnerName}</td>
                        <td className="py-3 px-4 text-center"><Badge variant={al.tier === 'Platinum' ? 'primary' : 'default'} size="sm">{al.tier}</Badge></td>
                        <td className="py-3 px-4 text-right font-semibold">{formatCurrency(al.amount)}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={al.status === 'used' ? 'success' : al.status === 'allocated' ? 'info' : 'default'} size="sm">
                            {al.status === 'used' ? '已使用' : al.status === 'allocated' ? '已派发' : '可用'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center text-xs text-neutral-500">{al.applications}申 / {al.approvedApps}批</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setActiveTab('applications'); }}>查看申请</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 2: 申请审批
          ══════════════════════════════════════════════ */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input type="text" placeholder="搜索活动或伙伴..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 dark:text-white" />
            </div>
            <div className="flex gap-1">
              {['all', 'submitted', 'approved', 'executing', 'completed', 'rejected'].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', statusFilter === s ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800')}>
                  {s === 'all' ? '全部' : statusLabel(s as WorkflowStatus)}
                </button>
              ))}
            </div>
          </div>

          {/* Application Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredApps.map((app) => (
              <Card key={app.id} hover className="cursor-pointer" onClick={() => { setSelectedApp(app); setShowAppDetail(true); }}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{app.eventName}</h4>
                      <p className="text-xs text-neutral-500 mt-0.5">{app.partnerName} · {app.location}</p>
                    </div>
                    <Badge variant={statusVariant(app.status)} size="md">{statusLabel(app.status)}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{app.eventDate}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{formatCurrency(app.budgetApproved || app.budgetRequested)}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{app.invitedCustomers.length}位客户</span>
                  </div>
                  {app.status === 'submitted' && (
                    <div className="flex gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                      <Button variant="brand" size="sm" onClick={(e) => { e.stopPropagation(); }}><CheckCircle2 className="w-3.5 h-3.5" /> 批复</Button>
                      <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); }}><XCircle className="w-3.5 h-3.5" /> 驳回</Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 3: 执行跟踪
          ══════════════════════════════════════════════ */}
      {activeTab === 'execution' && (
        <div className="space-y-6">
          {applications.filter((a) => a.status === 'executing' || a.status === 'approved').map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{app.eventName}</CardTitle>
                  <Badge variant={statusVariant(app.status)} size="sm">{statusLabel(app.status)}</Badge>
                </div>
                <span className="text-xs text-neutral-400">{app.partnerName} · {app.eventDate}</span>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Agenda */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase mb-3 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 会议议程</p>
                    <div className="space-y-2">
                      {app.agenda.map((item, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <span className="text-xs text-neutral-400 w-20 shrink-0">{item.time}</span>
                          <div><p className="font-medium text-neutral-900 dark:text-white">{item.topic}</p><p className="text-xs text-neutral-400">{item.speaker}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Invited Customers */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase mb-3 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> 预邀客户 ({app.invitedCustomers.length}人)</p>
                    <div className="space-y-2">
                      {app.invitedCustomers.map((c, i) => (
                        <div key={i} className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 text-sm">
                          <p className="font-medium text-neutral-900 dark:text-white">{c.name} · {c.title}</p>
                          <p className="text-xs text-neutral-400">{c.company}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Cost + Mini Program */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase mb-3 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> 费用明细 & 数字化</p>
                    <div className="space-y-1.5 mb-3">
                      {app.costBreakdown.map((c, i) => (
                        <div key={i} className="flex justify-between text-xs"><span className="text-neutral-500">{c.item}</span><span className="font-medium">{formatCurrency(c.amount)}</span></div>
                      ))}
                      <div className="flex justify-between text-xs font-semibold pt-1 border-t border-neutral-200 dark:border-neutral-800"><span>合计</span><span>{formatCurrency(app.costBreakdown.reduce((s, c) => s + c.amount, 0))}</span></div>
                    </div>
                    {app.miniProgramId && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-1"><QrCode className="w-4 h-4 text-blue-600" /><span className="text-xs font-semibold text-blue-700 dark:text-blue-400">小程序已对接</span></div>
                        <p className="text-xs text-blue-600 dark:text-blue-300">ID: {app.miniProgramId} · {app.attendance || 0}人签到 · {(app.leads || 0)}条线索</p>
                      </div>
                    )}
                    {app.status === 'executing' && <Button variant="brand" size="sm" className="w-full mt-3">标记完成</Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 4: 小程序对接
          ══════════════════════════════════════════════ */}
      {activeTab === 'miniprogram' && (
        <div className="space-y-6">
          {/* Mini Program Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: '扫码签到', desc: '微信扫描会议二维码完成签到，自动归属到对应公司名下。签到后推送会议资料和议程提醒。', icon: QrCode, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
              { title: '互动功能', desc: '提问/投票/抽奖——现场大屏实时展示。提问可匿名或实名，投票结果即时统计。抽奖支持扫码参与。', icon: MessageSquare, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
              { title: '行为积分', desc: '报名+20 · 签到+30 · 提问+15/次 · 转发+10/次 · 邀请到场+40/人。积分可兑换礼品。', icon: Gift, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' },
            ].map((f) => (
              <Card key={f.title}>
                <div className="flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', f.color)}><f.icon className="w-5 h-5" /></div>
                  <div><h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">{f.title}</h4><p className="text-xs text-neutral-500 leading-relaxed">{f.desc}</p></div>
                </div>
              </Card>
            ))}
          </div>

          {/* Behavior Score Table */}
          <Card>
            <CardHeader><CardTitle>用户行为积分榜</CardTitle><Badge variant="info" size="sm">实时更新</Badge></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-neutral-200 dark:border-neutral-800"><th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">姓名</th><th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">公司</th><th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">报名</th><th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">签到</th><th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">提问</th><th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">转发</th><th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">邀请</th><th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">积分</th><th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">等级</th></tr></thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {behaviorScores.map((u, i) => (
                      <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td className="py-3 px-4 font-medium text-neutral-900 dark:text-white">{u.name}</td>
                        <td className="py-3 px-4 text-xs text-neutral-500">{u.company}</td>
                        <td className="py-3 px-4 text-center">{u.registered ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-neutral-300 mx-auto" />}</td>
                        <td className="py-3 px-4 text-center">{u.attended ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-neutral-300 mx-auto" />}</td>
                        <td className="py-3 px-4 text-center text-xs font-medium">{u.questions}次</td>
                        <td className="py-3 px-4 text-center text-xs font-medium">{u.shared}次</td>
                        <td className="py-3 px-4 text-center text-xs font-medium">{u.referrals}人</td>
                        <td className="py-3 px-4 text-right font-semibold text-neutral-900 dark:text-white">{u.score}</td>
                        <td className="py-3 px-4 text-center"><Badge variant={u.level === '金牌' ? 'warning' : u.level === '银牌' ? 'default' : 'info'} size="sm">{u.level}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Score Rules + Gift Exchange */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>积分规则</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scoreRules.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                      <div className="flex items-center gap-2"><r.icon className="w-4 h-4 text-neutral-500" /><span className="text-sm text-neutral-700 dark:text-neutral-300">{r.action}{(r as { note?: string }).note && <span className="text-xs text-neutral-400">{(r as { note?: string }).note}</span>}</span></div>
                      <Badge variant="primary" size="sm">+{r.points}分</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>积分兑换礼品</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gifts.map((g, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{g.image}</span>
                        <div><p className="text-sm font-medium text-neutral-900 dark:text-white">{g.name}</p><p className="text-xs text-neutral-400">库存 {g.stock}件</p></div>
                      </div>
                      <Badge variant="warning" size="sm">{g.cost}积分</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── Application Detail Modal ─────────────────── */}
      <Modal open={showAppDetail && !!selectedApp} onClose={() => { setShowAppDetail(false); setSelectedApp(null); }} size="xl" title={selectedApp?.eventName}>
        {selectedApp && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" />{selectedApp.partnerName}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{selectedApp.eventDate}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{selectedApp.location}</span>
              <Badge variant={statusVariant(selectedApp.status)}>{statusLabel(selectedApp.status)}</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase mb-3">费用明细</p>
                <div className="space-y-1.5">
                  {selectedApp.costBreakdown.map((c, i) => (
                    <div key={i} className="flex justify-between text-sm"><span className="text-neutral-500">{c.item}</span><span className="font-medium">{formatCurrency(c.amount)}</span></div>
                  ))}
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t"><span>申请总额</span><span>{formatCurrency(selectedApp.budgetRequested)}</span></div>
                  {selectedApp.budgetApproved > 0 && <div className="flex justify-between text-sm font-semibold text-emerald-600"><span>批复金额</span><span>{formatCurrency(selectedApp.budgetApproved)}</span></div>}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase mb-3">会议议程</p>
                <div className="space-y-2">
                  {selectedApp.agenda.map((item, i) => (
                    <div key={i} className="flex gap-3 text-sm"><span className="text-xs text-neutral-400 w-24 shrink-0">{item.time}</span><div><p className="font-medium">{item.topic}</p><p className="text-xs text-neutral-400">{item.speaker}</p></div></div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase mb-3">预邀客户名单</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedApp.invitedCustomers.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                    <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-semibold">{c.name[0]}</div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-neutral-900 dark:text-white">{c.name} · {c.title}</p><p className="text-xs text-neutral-400">{c.company} · {c.phone}</p></div>
                  </div>
                ))}
              </div>
            </div>

            {selectedApp.status === 'submitted' && (
              <div className="flex gap-3 justify-end pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <Button variant="secondary"><XCircle className="w-4 h-4" /> 驳回</Button>
                <Button variant="brand"><CheckCircle2 className="w-4 h-4" /> 批复通过</Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── New Allocation Modal ────────────────────── */}
      <Modal open={showAllocateModal} onClose={() => setShowAllocateModal(false)} size="md" title="新建 PMDF 派发">
        <div className="space-y-4">
          <Select label="选择合作伙伴" options={allocations.map((a) => ({ value: a.partnerId, label: a.partnerName }))} placeholder="请选择合作伙伴" />
          <Input label="派发金额" type="number" placeholder="请输入金额" />
          <Select label="季度" options={[{ value: '2025Q3', label: '2025 Q3' }, { value: '2025Q4', label: '2025 Q4' }]} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">备注</label>
            <textarea className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/20" rows={2} placeholder="可选备注信息" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAllocateModal(false)}>取消</Button>
            <Button variant="brand"><Send className="w-4 h-4" /> 确认派发</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
