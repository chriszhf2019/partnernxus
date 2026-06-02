import { useState } from 'react';
import { Briefcase, Calendar, Target, Plus, Search, Filter, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import type { StaffProject, Deal } from '../../types';

interface StaffProjectListProps {
  projects: StaffProject[];
  deals: Deal[];
  staffId?: string;
  onAddProject: (project: Omit<StaffProject, 'id'>) => void;
}

export const StaffProjectList = ({ projects, deals, staffId, onAddProject }: StaffProjectListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    dealId: '',
    role: '',
    contribution: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const filteredProjects = projects.filter((p) => {
    const matchesStaff = !staffId || p.staffId === staffId;
    const matchesSearch = p.dealTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStaff && matchesSearch;
  });

  const availableDeals = deals.filter((d) => !projects.find((p) => p.dealId === d.id));

  const handleAddProject = () => {
    if (!newProject.dealId || !newProject.role) return;
    const deal = deals.find((d) => d.id === newProject.dealId);
    if (!deal) return;
    
    onAddProject({
      staffId: staffId || '',
      dealId: newProject.dealId,
      dealTitle: deal.title,
      partnerId: deal.partnerId,
      role: newProject.role,
      contribution: newProject.contribution,
      startDate: newProject.startDate,
      endDate: newProject.endDate || undefined,
    });
    
    setShowAddModal(false);
    setNewProject({
      dealId: '',
      role: '',
      contribution: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
  };

  const isCompleted = (project: StaffProject) => project.endDate && new Date(project.endDate) < new Date();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            参与项目
          </CardTitle>
          <CardDescription>管理合作伙伴人员参与的项目</CardDescription>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          关联项目
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="搜索项目名称或角色..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredProjects.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-500">暂无项目记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => {
              const deal = deals.find((d) => d.id === project.dealId);
              return (
                <div
                  key={project.id}
                  className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-neutral-900 dark:text-white">{project.dealTitle}</h3>
                        <Badge variant={isCompleted(project) ? 'default' : 'info'}>
                          {isCompleted(project) ? '已完成' : '进行中'}
                        </Badge>
                        {deal && (
                          <Badge className={cn(
                            deal.status === 'Closed Won' ? 'bg-emerald-100 text-emerald-700' :
                            deal.status === 'Closed Lost' ? 'bg-red-100 text-red-700' :
                            deal.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                            'bg-neutral-100 text-neutral-500'
                          )}>
                            {deal.status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Target className="w-3.5 h-3.5" />
                          {project.role}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {project.startDate} - {project.endDate || '至今'}
                        </span>
                        {deal && (
                          <span>{deal.customerName}</span>
                        )}
                      </div>
                      {project.contribution && (
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                          贡献: {project.contribution}
                        </p>
                      )}
                    </div>
                    {deal && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">
                          {deal.value.toLocaleString()}
                        </p>
                        <p className="text-xs text-neutral-400">商机金额</p>
                      </div>
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
              <h3 className="text-lg font-semibold mb-4">关联项目</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">选择商机</label>
                  <select
                    value={newProject.dealId}
                    onChange={(e) => setNewProject({ ...newProject, dealId: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择商机</option>
                    {availableDeals.map((deal) => (
                      <option key={deal.id} value={deal.id}>
                        {deal.title} ({deal.customerName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">角色</label>
                  <Input
                    value={newProject.role}
                    onChange={(e) => setNewProject({ ...newProject, role: e.target.value })}
                    placeholder="如：技术负责人、销售顾问"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">贡献描述</label>
                  <textarea
                    value={newProject.contribution}
                    onChange={(e) => setNewProject({ ...newProject, contribution: e.target.value })}
                    placeholder="描述在项目中的主要贡献"
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-1">开始日期</label>
                    <Input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-1">结束日期（可选）</label>
                    <Input
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                  取消
                </Button>
                <Button onClick={handleAddProject} disabled={!newProject.dealId || !newProject.role}>
                  确认关联
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
