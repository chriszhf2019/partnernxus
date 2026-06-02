import { useState } from 'react';
import { Activity, Calendar, Award, GraduationCap, Users, FileText, Plus, Search, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import type { StaffActivity, Activity as ActivityType } from '../../types';

interface StaffActivityListProps {
  activities: StaffActivity[];
  marketingActivities: ActivityType[];
  staffId?: string;
  onAddActivity: (activity: Omit<StaffActivity, 'id'>) => void;
}

const activityTypeConfig = {
  training: { label: '培训', icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-100' },
  activity: { label: '活动', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-100' },
  meeting: { label: '会议', icon: Users, color: 'text-green-500', bg: 'bg-green-100' },
  certification: { label: '认证', icon: Award, color: 'text-amber-500', bg: 'bg-amber-100' },
};

const statusConfig = {
  completed: { label: '已完成', className: 'bg-emerald-100 text-emerald-700' },
  pending: { label: '进行中', className: 'bg-amber-100 text-amber-700' },
  absent: { label: '缺席', className: 'bg-red-100 text-red-700' },
};

export const StaffActivityList = ({ activities, marketingActivities, staffId, onAddActivity }: StaffActivityListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activityId: '',
    activityName: '',
    activityType: 'training' as StaffActivity['activityType'],
    points: 0,
    attendanceDate: new Date().toISOString().split('T')[0],
    completionStatus: 'completed' as StaffActivity['completionStatus'],
    certificate: '',
  });

  const filteredActivities = activities.filter((a) => {
    const matchesStaff = !staffId || a.staffId === staffId;
    const matchesSearch = a.activityName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || a.activityType === filterType;
    return matchesStaff && matchesSearch && matchesType;
  });

  const sortedActivities = filteredActivities.sort((a, b) => new Date(b.attendanceDate).getTime() - new Date(a.attendanceDate).getTime());

  const handleAddActivity = () => {
    if (!newActivity.activityId) return;
    const activity = marketingActivities.find((a) => a.id === newActivity.activityId);
    if (!activity) return;
    
    onAddActivity({
      staffId: staffId || '',
      activityId: newActivity.activityId,
      activityName: activity.title,
      activityType: newActivity.activityType,
      points: newActivity.points,
      attendanceDate: newActivity.attendanceDate,
      completionStatus: newActivity.completionStatus,
      certificate: newActivity.certificate || undefined,
    });
    
    setShowAddModal(false);
    setNewActivity({
      activityId: '',
      activityName: '',
      activityType: 'training',
      points: 0,
      attendanceDate: new Date().toISOString().split('T')[0],
      completionStatus: 'completed',
      certificate: '',
    });
  };

  const totalPoints = activities.reduce((sum, a) => sum + a.points, 0);
  const completedCount = activities.filter((a) => a.completionStatus === 'completed').length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            活动培训记录
          </CardTitle>
          <CardDescription>管理合作伙伴人员参与的培训和活动</CardDescription>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          添加记录
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700">累计积分</span>
            </div>
            <p className="text-2xl font-bold text-blue-800">+{totalPoints}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700">完成次数</span>
            </div>
            <p className="text-2xl font-bold text-green-800">{completedCount}次</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="搜索活动名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部类型</option>
              <option value="training">培训</option>
              <option value="activity">活动</option>
              <option value="meeting">会议</option>
              <option value="certification">认证</option>
            </select>
          </div>
        </div>

        {sortedActivities.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Activity className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-500">暂无活动记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedActivities.map((activity) => {
              const typeConfig = activityTypeConfig[activity.activityType];
              const status = statusConfig[activity.completionStatus];
              const Icon = typeConfig.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                >
                  <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', typeConfig.bg)}>
                    <Icon className={cn('w-6 h-6', typeConfig.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-neutral-900 dark:text-white truncate">{activity.activityName}</h3>
                      <Badge className={typeConfig.bg + ' ' + typeConfig.color}>{typeConfig.label}</Badge>
                      <Badge className={status.className}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {activity.attendanceDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        +{activity.points}分
                      </span>
                    </div>
                    {activity.certificate && (
                      <p className="mt-1 text-sm text-neutral-500 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        证书: {activity.certificate}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">添加活动记录</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">活动类型</label>
                  <select
                    value={newActivity.activityType}
                    onChange={(e) => setNewActivity({ ...newActivity, activityType: e.target.value as StaffActivity['activityType'] })}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(activityTypeConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">活动名称</label>
                  <input
                    type="text"
                    value={newActivity.activityId ? marketingActivities.find(a => a.id === newActivity.activityId)?.title || '' : ''}
                    readOnly
                    className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm text-neutral-500"
                    placeholder="选择或输入活动名称"
                  />
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="text"
                      placeholder="或直接输入活动名称"
                      className="flex-1"
                      onChange={(e) => {
                        if (e.target.value) {
                          setNewActivity({ ...newActivity, activityId: '', activityName: e.target.value });
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-1">积分</label>
                    <Input
                      type="number"
                      min="0"
                      value={newActivity.points}
                      onChange={(e) => setNewActivity({ ...newActivity, points: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-1">参与日期</label>
                    <Input
                      type="date"
                      value={newActivity.attendanceDate}
                      onChange={(e) => setNewActivity({ ...newActivity, attendanceDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">完成状态</label>
                  <select
                    value={newActivity.completionStatus}
                    onChange={(e) => setNewActivity({ ...newActivity, completionStatus: e.target.value as StaffActivity['completionStatus'] })}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="completed">已完成</option>
                    <option value="pending">进行中</option>
                    <option value="absent">缺席</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">证书编号（可选）</label>
                  <Input
                    value={newActivity.certificate}
                    onChange={(e) => setNewActivity({ ...newActivity, certificate: e.target.value })}
                    placeholder="如：CERT-2024-001"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                  取消
                </Button>
                <Button onClick={handleAddActivity} disabled={!newActivity.activityId && !newActivity.activityName}>
                  确认添加
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
