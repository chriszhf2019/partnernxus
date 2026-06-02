import { useState } from 'react';
import { Users, Building2, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PartnerStaffList } from './PartnerStaffList';
import { PartnerStaffDetail } from './PartnerStaffDetail';
import { PointsManagement } from './PointsManagement';
import { StaffProjectList } from './StaffProjectList';
import { StaffActivityList } from './StaffActivityList';
import { StaffCustomerList } from './StaffCustomerList';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Tabs } from '../ui/Tabs';
import type { PartnerStaff, WorkHistory, StaffProject, StaffActivity, StaffCustomer, Deal, Activity as ActivityType } from '../../types';

export const PartnerStaffPage = () => {
  const navigate = useNavigate();
  const params = useParams<{ partnerId?: string }>();
  const [selectedStaff, setSelectedStaff] = useState<PartnerStaff | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  const mockStaff: PartnerStaff[] = [
    {
      id: 's1',
      salutation: 'Mr.',
      firstName: '伟',
      lastName: '王',
      fullName: '王伟',
      phone: '010-88881234',
      mobile: '13800138001',
      email: 'wangwei@partner1.com',
      partnerId: params.partnerId || 'p1',
      partnerName: '星辰科技数据有限公司',
      title: '技术总监',
      department: '技术部',
      city: '北京',
      skills: ['Java', '云原生', 'AI', '大数据'],
      isPrimary: true,
      status: 'active',
      joinDate: '2020-06-15',
      points: 256,
      pointsHistory: [
        { id: 'p1', staffId: 's1', type: 'training', points: 20, source: '云原生架构师培训', description: '完成云原生架构师认证培训', date: '2024-03-15', operator: '系统' },
        { id: 'p2', staffId: 's1', type: 'project', points: 50, source: '北京协和医院项目', description: '技术负责人', date: '2024-02-20', operator: '系统' },
        { id: 'p3', staffId: 's1', type: 'certification', points: 30, source: 'AI专家认证', description: '获得AI专家认证', date: '2024-01-10', operator: '系统' },
      ],
      createdAt: '2020-06-15T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z',
    },
    {
      id: 's2',
      salutation: 'Ms.',
      firstName: '芳',
      lastName: '李',
      fullName: '李芳',
      phone: '010-88881235',
      mobile: '13800138002',
      email: 'lifang@partner1.com',
      partnerId: params.partnerId || 'p1',
      partnerName: '星辰科技数据有限公司',
      title: '销售经理',
      department: '销售部',
      city: '北京',
      skills: ['大客户销售', '医疗行业', '商务谈判'],
      isPrimary: false,
      status: 'active',
      joinDate: '2021-03-20',
      points: 189,
      pointsHistory: [
        { id: 'p4', staffId: 's2', type: 'activity', points: 10, source: 'Q1渠道大会', description: '参加Q1渠道大会', date: '2024-03-01', operator: '系统' },
        { id: 'p5', staffId: 's2', type: 'bonus', points: 25, source: '季度销售冠军', description: 'Q4销售冠军奖励', date: '2024-01-15', operator: '系统' },
      ],
      createdAt: '2021-03-20T00:00:00Z',
      updatedAt: '2024-03-01T00:00:00Z',
    },
    {
      id: 's3',
      salutation: 'Mr.',
      firstName: '强',
      lastName: '张',
      fullName: '张强',
      phone: '021-66667890',
      mobile: '13900139003',
      email: 'zhangqiang@partner2.com',
      partnerId: 'p2',
      partnerName: '华泰科技有限公司',
      title: '售前顾问',
      department: '售前部',
      city: '上海',
      skills: ['解决方案', '云平台', '售前支持'],
      isPrimary: true,
      status: 'active',
      joinDate: '2022-01-10',
      points: 145,
      pointsHistory: [
        { id: 'p6', staffId: 's3', type: 'training', points: 15, source: '售前技能培训', description: '完成售前技能进阶培训', date: '2024-02-20', operator: '系统' },
        { id: 'p7', staffId: 's3', type: 'project', points: 35, source: '上海瑞金医院项目', description: '售前支持', date: '2024-01-25', operator: '系统' },
      ],
      createdAt: '2022-01-10T00:00:00Z',
      updatedAt: '2024-02-20T00:00:00Z',
    },
    {
      id: 's4',
      salutation: 'Ms.',
      firstName: '敏',
      lastName: '陈',
      fullName: '陈敏',
      phone: '0755-22223456',
      mobile: '13600136004',
      email: 'chenmin@partner3.com',
      partnerId: 'p3',
      partnerName: '深圳智联科技',
      title: '技术经理',
      department: '技术部',
      city: '深圳',
      skills: ['AI开发', '机器学习', '数据分析'],
      isPrimary: false,
      status: 'active',
      joinDate: '2021-09-01',
      points: 203,
      pointsHistory: [
        { id: 'p8', staffId: 's4', type: 'certification', points: 25, source: 'ML工程师认证', description: '获得ML工程师认证', date: '2024-03-10', operator: '系统' },
        { id: 'p9', staffId: 's4', type: 'activity', points: 8, source: 'AI技术沙龙', description: '参加AI技术沙龙', date: '2024-02-28', operator: '系统' },
      ],
      createdAt: '2021-09-01T00:00:00Z',
      updatedAt: '2024-03-10T00:00:00Z',
    },
    {
      id: 's5',
      salutation: 'Mr.',
      firstName: '华',
      lastName: '赵',
      fullName: '赵华',
      phone: '020-33334567',
      mobile: '13500135005',
      email: 'zhaohua@partner1.com',
      partnerId: params.partnerId || 'p1',
      partnerName: '星辰科技数据有限公司',
      title: '项目经理',
      department: '项目管理部',
      city: '广州',
      skills: ['项目管理', 'Scrum', '风险管理'],
      isPrimary: false,
      status: 'inactive',
      joinDate: '2020-12-01',
      points: 167,
      pointsHistory: [
        { id: 'p10', staffId: 's5', type: 'training', points: 12, source: 'PMP培训', description: 'PMP认证培训', date: '2023-11-15', operator: '系统' },
      ],
      createdAt: '2020-12-01T00:00:00Z',
      updatedAt: '2023-11-15T00:00:00Z',
    },
  ];

  const mockWorkHistory: WorkHistory[] = [
    {
      id: 'w1',
      staffId: 's1',
      fromPartnerId: 'old-p1',
      fromPartnerName: '北京汇智科技',
      toPartnerId: params.partnerId || 'p1',
      toPartnerName: '星辰科技数据有限公司',
      fromTitle: '高级工程师',
      toTitle: '技术总监',
      changeDate: '2020-06-15',
      changeReason: '职业发展',
    },
    {
      id: 'w2',
      staffId: 's3',
      fromPartnerId: 'old-p2',
      fromPartnerName: '上海信通',
      toPartnerId: 'p2',
      toPartnerName: '华泰科技有限公司',
      fromTitle: '技术支持',
      toTitle: '售前顾问',
      changeDate: '2022-01-10',
      changeReason: '公司并购',
    },
  ];

  const mockProjects: StaffProject[] = [
    {
      id: 'proj1',
      staffId: 's1',
      dealId: 'deal1',
      dealTitle: '北京协和医院云平台项目',
      partnerId: params.partnerId || 'p1',
      role: '技术负责人',
      contribution: '主导架构设计，负责核心模块开发',
      startDate: '2024-01-01',
      endDate: '2024-06-30',
    },
    {
      id: 'proj2',
      staffId: 's2',
      dealId: 'deal2',
      dealTitle: '苏州市卫健委数字化平台',
      partnerId: params.partnerId || 'p1',
      role: '销售负责人',
      contribution: '客户关系维护，商务谈判',
      startDate: '2024-02-15',
    },
    {
      id: 'proj3',
      staffId: 's3',
      dealId: 'deal3',
      dealTitle: '上海瑞金医院大数据项目',
      partnerId: 'p2',
      role: '售前顾问',
      contribution: '方案设计，POC演示',
      startDate: '2024-01-20',
      endDate: '2024-04-30',
    },
  ];

  const mockActivities: StaffActivity[] = [
    {
      id: 'act1',
      staffId: 's1',
      activityId: 'act-001',
      activityName: '云原生架构师认证培训',
      activityType: 'training',
      points: 20,
      attendanceDate: '2024-03-15',
      completionStatus: 'completed',
      certificate: 'CERT-CNA-2024-001',
    },
    {
      id: 'act2',
      staffId: 's2',
      activityId: 'act-002',
      activityName: 'Q1渠道大会',
      activityType: 'activity',
      points: 10,
      attendanceDate: '2024-03-01',
      completionStatus: 'completed',
    },
    {
      id: 'act3',
      staffId: 's3',
      activityId: 'act-003',
      activityName: '售前技能进阶培训',
      activityType: 'training',
      points: 15,
      attendanceDate: '2024-02-20',
      completionStatus: 'completed',
    },
    {
      id: 'act4',
      staffId: 's4',
      activityId: 'act-004',
      activityName: 'ML工程师认证',
      activityType: 'certification',
      points: 25,
      attendanceDate: '2024-03-10',
      completionStatus: 'completed',
      certificate: 'CERT-ML-2024-002',
    },
  ];

  const mockCustomers: StaffCustomer[] = [
    {
      id: 'cust1',
      staffId: 's1',
      customerName: '北京协和医院',
      industry: '医疗',
      contactPerson: '王主任',
      contactPhone: '010-66661234',
      annualRevenue: 4500000,
      relationshipStart: '2020-06-15',
      keyProducts: ['云原生平台', '大数据平台'],
    },
    {
      id: 'cust2',
      staffId: 's2',
      customerName: '苏州市卫健委',
      industry: '政务',
      contactPerson: '李处长',
      contactPhone: '0512-88885678',
      annualRevenue: 2800000,
      relationshipStart: '2021-03-20',
      keyProducts: ['数字化平台'],
    },
    {
      id: 'cust3',
      staffId: 's3',
      customerName: '上海瑞金医院',
      industry: '医疗',
      contactPerson: '张院长',
      contactPhone: '021-55559012',
      annualRevenue: 3200000,
      relationshipStart: '2022-01-10',
      keyProducts: ['AI智算平台', '混合云方案'],
    },
  ];

  const mockDeals: Deal[] = [
    {
      id: 'deal1',
      title: '北京协和医院云平台项目',
      customerId: 'c1',
      customerName: '北京协和医院',
      customerIndustry: '医疗',
      value: 4500000,
      partnerId: params.partnerId || 'p1',
      partnerName: '星辰科技数据有限公司',
      partnerType: 'SI',
      stage: 'ClosedWon',
      status: 'Closed Won',
      region: '华北',
      salesName: '李芳',
      salesTeam: '医疗行业组',
      productType: '云原生平台',
      createdDate: '2024-01-01',
      lastActivityDate: '2024-06-30',
      expectedCloseDate: '2024-06-30',
      isPriority: true,
      lifecycle: [],
    },
    {
      id: 'deal2',
      title: '苏州市卫健委数字化平台',
      customerId: 'c2',
      customerName: '苏州市卫健委',
      customerIndustry: '政务',
      value: 2800000,
      partnerId: params.partnerId || 'p1',
      partnerName: '星辰科技数据有限公司',
      partnerType: 'SI',
      stage: 'Approved',
      status: 'Approved',
      region: '华东',
      salesName: '李芳',
      salesTeam: '政务行业组',
      productType: '数字化平台',
      createdDate: '2024-02-15',
      lastActivityDate: '2024-03-01',
      expectedCloseDate: '2024-12-31',
      lifecycle: [],
    },
  ];

  const mockMarketingActivities: ActivityType[] = [
    { id: 'ma1', type: 'milestone', title: '云原生架构师培训', description: '高级认证培训', date: '2024-03-15', time: '09:00' },
    { id: 'ma2', type: 'visit', title: 'Q1渠道大会', description: '年度渠道大会', date: '2024-03-01', time: '09:00' },
    { id: 'ma3', type: 'milestone', title: '合作伙伴季度沟通会', description: 'Q1季度业务回顾', date: '2024-04-01', time: '14:00' },
  ];

  const handleViewDetails = (staff: PartnerStaff) => {
    setSelectedStaff(staff);
  };

  const handleUpdateStaff = (updatedStaff: PartnerStaff) => {
    setSelectedStaff(updatedStaff);
  };

  const handleAddPoints = (staffId: string, points: number, type: any, source: string, description: string) => {
    const staff = mockStaff.find(s => s.id === staffId);
    if (staff) {
      staff.points += points;
      staff.pointsHistory.push({
        id: `p-${Date.now()}`,
        staffId,
        type,
        points,
        source,
        description,
        date: new Date().toISOString().split('T')[0],
        operator: '管理员',
      });
    }
  };

  const handleAddProject = (project: Omit<StaffProject, 'id'>) => {
    mockProjects.push({ ...project, id: `proj-${Date.now()}` });
  };

  const handleAddActivity = (activity: Omit<StaffActivity, 'id'>) => {
    mockActivities.push({ ...activity, id: `act-${Date.now()}` });
  };

  const handleAddCustomer = (customer: Omit<StaffCustomer, 'id'>) => {
    mockCustomers.push({ ...customer, id: `cust-${Date.now()}` });
  };

  const staffForPartner = params.partnerId 
    ? mockStaff.filter(s => s.partnerId === params.partnerId)
    : mockStaff;

  const tabItems = [
    { id: 'list', label: '人员列表' },
    { id: 'points', label: '积分管理' },
    { id: 'projects', label: '项目管理' },
    { id: 'activities', label: '活动培训' },
    { id: 'customers', label: '重点客户' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/partners')} 
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回合作伙伴列表
        </button>
        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" />
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
          <Users className="w-5 h-5 inline-block mr-2" />
          合作伙伴人员管理
          {params.partnerId && (
            <span className="text-sm font-normal text-neutral-500 ml-2">
              - {staffForPartner[0]?.partnerName}
            </span>
          )}
        </h1>
      </div>

      <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

      <div className="pt-4">
        {activeTab === 'list' && (
          <PartnerStaffList 
            staff={mockStaff} 
            partnerId={params.partnerId}
            onViewDetails={handleViewDetails}
          />
        )}

        {activeTab === 'points' && (
          <PointsManagement 
            staff={mockStaff} 
            onAddPoints={handleAddPoints}
          />
        )}

        {activeTab === 'projects' && (
          <StaffProjectList 
            projects={mockProjects} 
            deals={mockDeals}
            staffId={selectedStaff?.id}
            onAddProject={handleAddProject}
          />
        )}

        {activeTab === 'activities' && (
          <StaffActivityList 
            activities={mockActivities}
            marketingActivities={mockMarketingActivities}
            staffId={selectedStaff?.id}
            onAddActivity={handleAddActivity}
          />
        )}

        {activeTab === 'customers' && (
          <StaffCustomerList 
            customers={mockCustomers}
            staffId={selectedStaff?.id}
            onAddCustomer={handleAddCustomer}
          />
        )}
      </div>

      {selectedStaff && (
        <PartnerStaffDetail 
          staff={selectedStaff}
          workHistory={mockWorkHistory.filter(w => w.staffId === selectedStaff.id)}
          projects={mockProjects.filter(p => p.staffId === selectedStaff.id)}
          activities={mockActivities.filter(a => a.staffId === selectedStaff.id)}
          customers={mockCustomers.filter(c => c.staffId === selectedStaff.id)}
          onClose={() => setSelectedStaff(null)}
          onUpdate={handleUpdateStaff}
        />
      )}
    </div>
  );
};
