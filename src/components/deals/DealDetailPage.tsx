import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle2, XCircle, Calendar, User, MapPin, ArrowRight,
  DollarSign, Target, GitBranch, AlertCircle, ChevronLeft, Edit3,
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { Deal, DealLifecycleStage, DealSource } from '../../types';
import { dealService } from '../../services/deal-service';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PageLoader } from '../ui/PageLoader';

const STAGE_CONFIG: Record<DealLifecycleStage, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  'Registered':    { label: '已报备', color: 'text-neutral-700', bgColor: 'bg-neutral-100 dark:bg-neutral-800', icon: FileText },
  'UnderReview':  { label: '审批中', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20', icon: Clock },
  'Approved':     { label: '已批复', color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle2 },
  'Solution':     { label: '方案跟进', color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20', icon: Target },
  'Commercial':   { label: '商务洽谈', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/20', icon: DollarSign },
  'ClosedWon':    { label: '赢单', color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle2 },
  'ClosedLost':   { label: '丢单', color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20', icon: XCircle },
};

const SOURCE_CONFIG: Record<DealSource, { label: string; icon: typeof ArrowRight }> = {
  'PartnerInitiated':  { label: '伙伴自主报备', icon: User },
  'ChannelAssigned':   { label: '渠道经理指派', icon: ArrowRight },
  'MDFCampaign':       { label: 'MDF活动转化', icon: Target },
  'MarketingEvent':    { label: '市场活动', icon: Calendar },
  'IncentiveProgram':  { label: '激励计划', icon: DollarSign },
  'Referral':          { label: '客户推荐', icon: GitBranch },
};

export const DealDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('未找到商机ID');
      return;
    }

    dealService.getById(id).then((d) => {
      if (d) {
        setDeal(d);
      } else {
        setError('未找到该商机');
      }
      setLoading(false);
    }).catch(() => {
      setError('获取商机信息失败');
      setLoading(false);
    });
  }, [id]);

  if (loading) return <PageLoader />;

  if (!deal || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <AlertCircle className="w-12 h-12 text-neutral-300" />
        <p className="text-lg font-semibold text-neutral-400">{error || '未找到商机'}</p>
        <button onClick={() => navigate('/deals')} className="text-sm text-brand hover:underline flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> 返回商机列表
        </button>
      </div>
    );
  }

  const currentStage = deal.stage;
  const stageCfg = STAGE_CONFIG[currentStage];
  const SourceIcon = deal.sourceInfo ? SOURCE_CONFIG[deal.sourceInfo.source]?.icon : null;
  const sourceLabel = deal.sourceInfo ? SOURCE_CONFIG[deal.sourceInfo.source]?.label : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/deals')}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{deal.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium', stageCfg.bgColor, stageCfg.color)}>
                {stageCfg.icon && <stageCfg.icon className="w-3.5 h-3.5" />}
                {stageCfg.label}
              </span>
              {deal.hasConflict && <Badge variant="danger" size="sm">冲突</Badge>}
              {deal.isPriority && <Badge variant="warning" size="sm">优先级</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/deals/${deal.id}/edit`)}>
            <Edit3 className="w-4 h-4" /> 编辑
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '客户名称', value: deal.customerName, icon: User },
          { label: '商机金额', value: formatCurrency(deal.value), icon: DollarSign },
          { label: '合作伙伴', value: `${deal.partnerName} (${deal.partnerType})`, icon: FileText },
          { label: '产品类型', value: deal.productType, icon: Target },
        ].map((f) => (
          <Card key={f.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-neutral-500" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">{f.label}</p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">{f.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" /> 生命周期
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative before:absolute before:left-5 before:top-0 before:bottom-0 before:w-px before:bg-neutral-200 dark:before:bg-neutral-800">
                {deal.lifecycle.map((event, idx) => {
                  const eventStageCfg = STAGE_CONFIG[event.stage];
                  const EventIcon = eventStageCfg?.icon || CheckCircle2;
                  return (
                    <div key={idx} className="relative pl-12 pb-5 last:pb-0">
                      <div className={cn(
                        'absolute left-0 w-10 h-10 rounded-xl flex items-center justify-center z-10 border-2',
                        idx === deal.lifecycle.length - 1
                          ? 'bg-brand border-brand text-white'
                          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700'
                      )}>
                        <EventIcon className={cn('w-4 h-4', idx === deal.lifecycle.length - 1 ? 'text-white' : 'text-neutral-400')} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-neutral-900 dark:text-white">{eventStageCfg?.label || event.stage}</span>
                          <span className="text-xs text-neutral-400">{event.date}</span>
                          {event.durationDays !== undefined && event.durationDays > 0 && (
                            <Badge variant="default" size="sm">+{event.durationDays}天</Badge>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">{event.description} · {event.actor}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {deal.sourceInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" /> 来源信息
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    {SourceIcon && <SourceIcon className="w-5 h-5 text-neutral-500" />}
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">{sourceLabel}</span>
                    <Badge
                      variant={deal.sourceInfo.leadQuality === 'Hot' ? 'success' : deal.sourceInfo.leadQuality === 'Warm' ? 'warning' : 'default'}
                      size="sm"
                    >
                      {deal.sourceInfo.leadQuality === 'Hot' ? '高意向' : deal.sourceInfo.leadQuality === 'Warm' ? '中意向' : '低意向'}
                    </Badge>
                  </div>
                  {deal.sourceInfo.initialContactDate && (
                    <p className="text-xs text-neutral-500">首次接触: {deal.sourceInfo.initialContactDate}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" /> 详细信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500">地区</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{deal.region} · {deal.city}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">客户行业</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{deal.customerIndustry}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">预计成交日期</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{deal.expectedCloseDate}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">实际成交日期</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{deal.actualCloseDate || '-'}</p>
                </div>
              </div>
              {deal.description && (
                <div>
                  <p className="text-xs text-neutral-500">项目描述</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">{deal.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {deal.hasConflict && (
            <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" /> 冲突提醒
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700 dark:text-red-400">该商机存在冲突，请尽快处理。</p>
                <Button variant="danger" size="sm" className="mt-3 w-full">
                  处理冲突
                </Button>
              </CardContent>
            </Card>
          )}

          {deal.conversionMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">转化指标</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">报备到审批</span>
                  <span className="font-medium">{deal.conversionMetrics.registrationToApprovalDays}天</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">审批到方案</span>
                  <span className="font-medium">{deal.conversionMetrics.approvalToSolutionDays}天</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">方案到商务</span>
                  <span className="font-medium">{deal.conversionMetrics.solutionToCommercialDays}天</span>
                </div>
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">总周期</span>
                    <span className={cn('font-medium', deal.conversionMetrics.isOverdue ? 'text-red-500' : 'text-emerald-600')}>
                      {deal.conversionMetrics.totalCycleDays}天
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {deal.stage === 'UnderReview' && (
                <>
                  <Button variant="brand" size="sm" className="w-full">
                    <CheckCircle2 className="w-4 h-4" /> 审批通过
                  </Button>
                  <Button variant="danger" size="sm" className="w-full">
                    <XCircle className="w-4 h-4" /> 拒绝报备
                  </Button>
                </>
              )}
              {deal.stage === 'Approved' && (
                <Button variant="brand" size="sm" className="w-full">
                  <ArrowRight className="w-4 h-4" /> 进入方案阶段
                </Button>
              )}
              {deal.stage === 'Solution' && (
                <Button variant="brand" size="sm" className="w-full">
                  <ArrowRight className="w-4 h-4" /> 进入商务阶段
                </Button>
              )}
              {deal.stage === 'Commercial' && (
                <>
                  <Button variant="brand" size="sm" className="w-full">
                    <CheckCircle2 className="w-4 h-4" /> 标记赢单
                  </Button>
                  <Button variant="danger" size="sm" className="w-full">
                    <XCircle className="w-4 h-4" /> 标记丢单
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
