import { useState } from 'react';
import { User, Phone, Mail, MapPin, Award, ChevronRight, Search, Filter, Plus, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import type { PartnerStaff } from '../../types';

interface PartnerStaffListProps {
  staff: PartnerStaff[];
  partnerId?: string;
  onViewDetails: (staff: PartnerStaff) => void;
  onCreate?: () => void;
}

const statusConfig = {
  active: { label: '活跃', className: 'bg-emerald-100 text-emerald-700' },
  inactive: { label: '停用', className: 'bg-neutral-100 text-neutral-500' },
  transferred: { label: '已转走', className: 'bg-amber-100 text-amber-700' },
};

export const PartnerStaffList = ({ staff, partnerId, onViewDetails, onCreate }: PartnerStaffListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  const filteredStaff = staff.filter((s) => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.phone.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || s.department === filterDepartment;
    const matchesPartner = !partnerId || s.partnerId === partnerId;
    return matchesSearch && matchesStatus && matchesDepartment && matchesPartner;
  });

  const departments = [...new Set(staff.map((s) => s.department).filter(Boolean))];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            合作伙伴人员
          </CardTitle>
          <CardDescription>管理合作伙伴的员工信息</CardDescription>
        </div>
        {onCreate && (
          <Button onClick={onCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            添加人员
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="搜索姓名、邮箱或电话..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部状态</option>
                <option value="active">活跃</option>
                <option value="inactive">停用</option>
                <option value="transferred">已转走</option>
              </select>
            </div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部部门</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredStaff.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <User className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-500">暂无人员数据</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStaff.map((member) => (
              <div
                key={member.id}
                onClick={() => onViewDetails(member)}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all',
                  'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200'
                )}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                  {member.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                      {member.fullName}
                    </h3>
                    {member.isPrimary && (
                      <Badge variant="info" className="text-xs">主要联系人</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {member.partnerName}
                    </span>
                    <span>{member.title}</span>
                    {member.department && <span>{member.department}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={cn(statusConfig[member.status].className)}>
                    {statusConfig[member.status].label}
                  </Badge>
                  <div className="flex items-center gap-3 text-sm text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      {member.points}分
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
