import { useState } from 'react';
import { Award, TrendingUp, TrendingDown, Calendar, User, Plus, Search, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import type { PartnerStaff, PointsRecord } from '../../types';

interface PointsManagementProps {
  staff: PartnerStaff[];
  onAddPoints: (staffId: string, points: number, type: PointsRecord['type'], source: string, description: string) => void;
}

const typeConfig = {
  training: { label: '培训', className: 'bg-blue-100 text-blue-700', icon: TrendingUp },
  activity: { label: '活动', className: 'bg-purple-100 text-purple-700', icon: TrendingUp },
  project: { label: '项目', className: 'bg-green-100 text-green-700', icon: TrendingUp },
  certification: { label: '认证', className: 'bg-amber-100 text-amber-700', icon: TrendingUp },
  bonus: { label: '奖励', className: 'bg-emerald-100 text-emerald-700', icon: TrendingUp },
  deduction: { label: '扣减', className: 'bg-red-100 text-red-700', icon: TrendingDown },
};

export const PointsManagement = ({ staff, onAddPoints }: PointsManagementProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPoints, setNewPoints] = useState({
    type: 'training' as PointsRecord['type'],
    points: 0,
    source: '',
    description: '',
  });

  const allRecords = staff.flatMap((s) => 
    s.pointsHistory.map((record) => ({ ...record, staffName: s.fullName, staffId: s.id }))
  );

  const filteredRecords = allRecords.filter((record) => {
    const matchesSearch = record.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || record.type === filterType;
    return matchesSearch && matchesType;
  });

  const sortedRecords = filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddPoints = () => {
    if (!selectedStaff || newPoints.points <= 0) return;
    onAddPoints(selectedStaff, newPoints.points, newPoints.type, newPoints.source, newPoints.description);
    setShowAddModal(false);
    setNewPoints({ type: 'training', points: 0, source: '', description: '' });
    setSelectedStaff(null);
  };

  const totalPoints = staff.reduce((sum, s) => sum + s.points, 0);
  const thisMonthPoints = allRecords
    .filter((r) => r.date >= new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
    .reduce((sum, r) => sum + r.points, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            积分管理
          </CardTitle>
          <CardDescription>管理合作伙伴人员的积分记录</CardDescription>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          添加积分
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-amber-700">总积分</span>
            </div>
            <p className="text-3xl font-bold text-amber-800">{totalPoints.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700">本月新增</span>
            </div>
            <p className="text-3xl font-bold text-blue-800">+{thisMonthPoints.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700">活跃人员</span>
            </div>
            <p className="text-3xl font-bold text-green-800">{staff.filter(s => s.status === 'active').length}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="搜索人员姓名或来源..."
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
              <option value="project">项目</option>
              <option value="certification">认证</option>
              <option value="bonus">奖励</option>
              <option value="deduction">扣减</option>
            </select>
          </div>
        </div>

        {sortedRecords.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Award className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-500">暂无积分记录</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedRecords.map((record) => {
              const config = typeConfig[record.type];
              const Icon = config.icon;
              return (
                <div
                  key={record.id}
                  className="flex items-center gap-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                >
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', config.className)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-white truncate">{record.staffName}</span>
                      <Badge className={config.className}>{config.label}</Badge>
                    </div>
                    <p className="text-sm text-neutral-500 truncate">{record.source}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn('font-bold', record.points > 0 ? 'text-emerald-600' : 'text-red-600')}>
                      {record.points > 0 ? '+' : ''}{record.points}
                    </span>
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {record.date}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">添加积分</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">选择人员</label>
                  <select
                    value={selectedStaff || ''}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择人员</option>
                    {staff.filter(s => s.status === 'active').map((s) => (
                      <option key={s.id} value={s.id}>{s.fullName} ({s.partnerName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">积分类型</label>
                  <select
                    value={newPoints.type}
                    onChange={(e) => setNewPoints({ ...newPoints, type: e.target.value as PointsRecord['type'] })}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(typeConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">积分数量</label>
                  <Input
                    type="number"
                    min="1"
                    value={newPoints.points}
                    onChange={(e) => setNewPoints({ ...newPoints, points: parseInt(e.target.value) || 0 })}
                    placeholder="输入积分数量"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">来源/活动名称</label>
                  <Input
                    value={newPoints.source}
                    onChange={(e) => setNewPoints({ ...newPoints, source: e.target.value })}
                    placeholder="如：Q1技术培训"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">备注说明</label>
                  <textarea
                    value={newPoints.description}
                    onChange={(e) => setNewPoints({ ...newPoints, description: e.target.value })}
                    placeholder="可选，添加说明"
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={() => { setShowAddModal(false); setSelectedStaff(null); }}>
                  取消
                </Button>
                <Button onClick={handleAddPoints} disabled={!selectedStaff || newPoints.points <= 0 || !newPoints.source}>
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
