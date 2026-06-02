import { useState } from 'react';
import { 
  User, Phone, Mail, MapPin, Award, Building2, Briefcase, 
  Calendar, Star, TrendingUp, X, Plus, Edit2, ChevronRight,
  FileText, Users, Target, Activity, GraduationCap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { PartnerStaff, WorkHistory, StaffProject, StaffActivity, StaffCustomer } from '../../types';

interface PartnerStaffDetailProps {
  staff: PartnerStaff;
  workHistory: WorkHistory[];
  projects: StaffProject[];
  activities: StaffActivity[];
  customers: StaffCustomer[];
  onClose: () => void;
  onUpdate: (staff: PartnerStaff) => void;
}

const statusConfig = {
  active: { label: '活跃', className: 'bg-emerald-100 text-emerald-700' },
  inactive: { label: '停用', className: 'bg-neutral-100 text-neutral-500' },
  transferred: { label: '已转走', className: 'bg-amber-100 text-amber-700' },
};

const activityTypeConfig = {
  training: { label: '培训', icon: GraduationCap, color: 'text-blue-500' },
  activity: { label: '活动', icon: Activity, color: 'text-purple-500' },
  meeting: { label: '会议', icon: Users, color: 'text-green-500' },
  certification: { label: '认证', icon: Award, color: 'text-amber-500' },
};

export const PartnerStaffDetail = ({ 
  staff, 
  workHistory, 
  projects, 
  activities, 
  customers,
  onClose, 
  onUpdate 
}: PartnerStaffDetailProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(staff);
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'projects' | 'activities' | 'customers'>('profile');

  const handleSave = () => {
    onUpdate({ ...editData, updatedAt: new Date().toISOString() });
    setIsEditing(false);
  };

  const tabConfig = [
    { id: 'profile' as const, label: '基本信息', icon: User },
    { id: 'history' as const, label: '工作变动', icon: TrendingUp },
    { id: 'projects' as const, label: '参与项目', icon: Briefcase },
    { id: 'activities' as const, label: '活动培训', icon: Activity },
    { id: 'customers' as const, label: '重点客户', icon: Target },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-neutral-900 rounded-xl shadow-2xl">
        <Card className="m-0 rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xl">
                {staff.fullName.charAt(0)}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {editData.fullName}
                  <Badge className={cn(statusConfig[editData.status].className)}>
                    {statusConfig[editData.status].label}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-neutral-500">{editData.partnerName} - {editData.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="secondary" onClick={() => { setIsEditing(false); setEditData(staff); }}>
                    取消
                  </Button>
                  <Button onClick={handleSave}>保存</Button>
                </>
              ) : (
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4" />
                  编辑
                </Button>
              )}
              <Button variant="ghost" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <div className="border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex gap-1 p-1">
              {tabConfig.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                      : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'history' && workHistory.length > 0 && (
                    <Badge variant="default" className="text-xs">{workHistory.length}</Badge>
                  )}
                  {tab.id === 'projects' && projects.length > 0 && (
                    <Badge variant="default" className="text-xs">{projects.length}</Badge>
                  )}
                  {tab.id === 'activities' && activities.length > 0 && (
                    <Badge variant="default" className="text-xs">{activities.length}</Badge>
                  )}
                  {tab.id === 'customers' && customers.length > 0 && (
                    <Badge variant="default" className="text-xs">{customers.length}</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          <CardContent className="max-h-[60vh] overflow-y-auto p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-1">姓名</label>
                    {isEditing ? (
                      <Input value={editData.fullName} onChange={(e) => setEditData({ ...editData, fullName: e.target.value })} />
                    ) : (
                      <p className="text-neutral-900 dark:text-white">{editData.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-1">职位</label>
                    {isEditing ? (
                      <Input value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
                    ) : (
                      <p className="text-neutral-900 dark:text-white">{editData.title}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-1">部门</label>
                    {isEditing ? (
                      <Input value={editData.department || ''} onChange={(e) => setEditData({ ...editData, department: e.target.value })} />
                    ) : (
                      <p className="text-neutral-900 dark:text-white">{editData.department || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-1">城市</label>
                    {isEditing ? (
                      <Input value={editData.city || ''} onChange={(e) => setEditData({ ...editData, city: e.target.value })} />
                    ) : (
                      <p className="text-neutral-900 dark:text-white">{editData.city || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-1">电话</label>
                    <p className="text-neutral-900 dark:text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-neutral-400" />
                      {editData.phone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-1">手机</label>
                    <p className="text-neutral-900 dark:text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-neutral-400" />
                      {editData.mobile}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-1">邮箱</label>
                    <p className="text-neutral-900 dark:text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-neutral-400" />
                      {editData.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-1">加入日期</label>
                    <p className="text-neutral-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      {editData.joinDate}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-2">能力所长</label>
                  <div className="flex flex-wrap gap-2">
                    {editData.skills.map((skill, index) => (
                      <Badge key={index} variant="info">{skill}</Badge>
                    ))}
                    {editData.skills.length === 0 && <span className="text-neutral-400">暂无技能标签</span>}
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">{editData.points}</span>
                    <span className="text-sm text-neutral-500">积分</span>
                  </div>
                  <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-700" />
                  <div className="text-sm">
                    <p className="text-neutral-500">总积分</p>
                    <p className="text-neutral-900 dark:text-white font-medium">
                      培训: {editData.pointsHistory.filter(p => p.type === 'training').reduce((sum, p) => sum + p.points, 0)} | 
                      活动: {editData.pointsHistory.filter(p => p.type === 'activity').reduce((sum, p) => sum + p.points, 0)} |
                      项目: {editData.pointsHistory.filter(p => p.type === 'project').reduce((sum, p) => sum + p.points, 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {workHistory.length === 0 ? (
                  <div className="py-8 text-center text-neutral-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无工作变动记录</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-700" />
                    {workHistory.map((record, index) => (
                      <div key={record.id} className="relative flex gap-4 mb-6">
                        <div className="relative z-10 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-neutral-900 dark:text-white">
                              {record.fromPartnerName} → {record.toPartnerName}
                            </span>
                            <span className="text-sm text-neutral-500">{record.changeDate}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-neutral-500">
                            <span>{record.fromTitle} → {record.toTitle}</span>
                          </div>
                          {record.changeReason && (
                            <div className="mt-2 text-sm text-neutral-500">
                              <span className="font-medium">原因:</span> {record.changeReason}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4" />
                  添加变动记录
                </Button>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
                {projects.length === 0 ? (
                  <div className="py-8 text-center text-neutral-400">
                    <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无参与项目记录</p>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div key={project.id} className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-neutral-900 dark:text-white">{project.dealTitle}</h4>
                        <Badge variant="default">{project.role}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {project.startDate} - {project.endDate || '进行中'}
                        </span>
                      </div>
                      {project.contribution && (
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                          贡献: {project.contribution}
                        </p>
                      )}
                    </div>
                  ))
                )}
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4" />
                  关联项目
                </Button>
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <div className="py-8 text-center text-neutral-400">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无活动参与记录</p>
                  </div>
                ) : (
                  activities.map((activity) => {
                    const typeConfig = activityTypeConfig[activity.activityType];
                    const Icon = typeConfig.icon;
                    return (
                      <div key={activity.id} className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className={cn('w-4 h-4', typeConfig.color)} />
                            <h4 className="font-medium text-neutral-900 dark:text-white">{activity.activityName}</h4>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700">+{activity.points}分</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                          <span>{typeConfig.label}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {activity.attendanceDate}
                          </span>
                          <Badge variant="default" className={
                            activity.completionStatus === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : activity.completionStatus === 'in_progress'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-neutral-100 text-neutral-500'
                          }>
                            {activity.completionStatus === 'completed' ? '已完成' : activity.completionStatus === 'in_progress' ? '进行中' : '已注册'}
                          </Badge>
                        </div>
                        {activity.certificate && (
                          <p className="mt-2 text-sm text-neutral-500 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            证书编号: {activity.certificate}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4" />
                  添加活动记录
                </Button>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="space-y-4">
                {customers.length === 0 ? (
                  <div className="py-8 text-center text-neutral-400">
                    <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无重点客户记录</p>
                  </div>
                ) : (
                  customers.map((customer) => (
                    <div key={customer.id} className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-neutral-900 dark:text-white">{customer.customerName}</h4>
                        <span className="text-sm text-neutral-500">{customer.industry}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-neutral-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {customer.contactPerson}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {customer.contactPhone}
                        </div>
                        <div>年营收: {customer.annualRevenue.toLocaleString()}元</div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          合作始于 {customer.relationshipStart}
                        </div>
                      </div>
                      {customer.keyProducts.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-neutral-500">重点产品:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {customer.keyProducts.map((product, index) => (
                              <Badge key={index} variant="info" className="text-xs">{product}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4" />
                  添加重点客户
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
