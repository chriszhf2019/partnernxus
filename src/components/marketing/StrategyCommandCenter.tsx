import React, { useState, useMemo } from 'react';
import { 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  TrendingDown, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Activity,
  BarChart3,
  Rocket,
  MousePointer2,
  Users,
  Calendar,
  ChevronRight,
  Info,
  Settings2,
  TrendingUp,
  X,
  MapPin,
  Clock,
  User,
  DollarSign,
  PieChart,
  CheckCircle2,
  BarChart,
  ArrowUpRight,
  Save,
  RotateCcw,
  Plus,
  PlusCircle,
  Building2,
  MessageSquare,
  QrCode,
  Gift,
  ClipboardCheck,
  Bell,
  Smartphone
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AttendeeMiniApp } from './AttendeeMiniApp';
import { GapAnalysisHeader } from './GapAnalysisHeader';
import { BudgetOverview } from './BudgetOverview';
import { db, auth } from '../../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

// Error Handling Spec for Firestore Operations
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const StrategyCommandCenter: React.FC = () => {
  const [user, setUser] = React.useState<any>({
    uid: 'guest-user',
    displayName: '访客用户',
    email: 'guest@strategy.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
  });
  const [isAuthReady, setIsAuthReady] = React.useState(true);
  const [activities, setActivities] = React.useState<any[]>([]);
  const [budgetData, setBudgetData] = React.useState<any>({
    marketingTotal: 9000000,
    marketingAllocated: 6000000,
    pmdfTotal: 6000000,
    pmdfAllocated: 3750000
  });

  const [winRate, setWinRate] = useState(25.0);
  const [salesTarget, setSalesTarget] = useState(100); // in Millions
  const [actualPipeline, setActualPipeline] = useState(355); // in Millions
  const [convRate, setConvRate] = useState(12.5);
  const [showInsights, setShowInsights] = useState(false);
  const [showExecutionBoard, setShowExecutionBoard] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'details' | 'edit' | 'leads' | 'attendees'>('details');
  const [editData, setEditData] = useState<any>(null);
  const [showNewActivityModal, setShowNewActivityModal] = useState(false);
  const [showMiniAppPreview, setShowMiniAppPreview] = useState(false);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [newActivityData, setNewActivityData] = useState({
    name: '',
    type: 'Marketing',
    budget: '',
    channel: '',
    desc: ''
  });

  // Data Listeners
  React.useEffect(() => {
    // Auth is mocked, so we proceed

    const activitiesQuery = query(collection(db, 'activities'), orderBy('createdAt', 'desc'));
    const unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivities(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'activities');
    });

    const budgetDoc = doc(db, 'budgets', 'Q3_2024');
    const unsubscribeBudget = onSnapshot(budgetDoc, (snapshot) => {
      if (snapshot.exists()) {
        setBudgetData(snapshot.data());
      } else {
        // Initialize default budget if not exists
        setDoc(budgetDoc, {
          quarter: 'Q3 2024',
          marketingTotal: 9000000,
          marketingAllocated: 6000000,
          pmdfTotal: 6000000,
          pmdfAllocated: 3750000
        }).catch(e => handleFirestoreError(e, OperationType.WRITE, 'budgets/Q3_2024'));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'budgets/Q3_2024');
    });

    return () => {
      unsubscribeActivities();
      unsubscribeBudget();
    };
  }, [isAuthReady, user]);

  // Attendee Listener for Selected Activity
  React.useEffect(() => {
    if (!selectedActivity?.id) {
      setAttendees([]);
      return;
    }

    const attendeesQuery = query(collection(db, `activities/${selectedActivity.id}/attendees`), orderBy('createdAt', 'desc'));
    const unsubscribeAttendees = onSnapshot(attendeesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAttendees(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `activities/${selectedActivity.id}/attendees`);
    });

    return () => unsubscribeAttendees();
  }, [selectedActivity?.id]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleCreateActivity = async () => {
    if (!newActivityData.name || !newActivityData.budget) return;

    const path = 'activities';
    try {
      await addDoc(collection(db, path), {
        ...newActivityData,
        budget: Number(newActivityData.budget),
        status: 'Planning',
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        wechatEnabled: true
      });
      setShowNewActivityModal(false);
      setNewActivityData({ name: '', type: 'Marketing', budget: '', channel: '', desc: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!window.confirm('确定要删除该活动及其所有参会数据吗？')) return;
    try {
      await deleteDoc(doc(db, 'activities', id));
      setSelectedActivity(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `activities/${id}`);
    }
  };

  const handleSaveEdit = async () => {
    if (!editData?.id) return;
    try {
      await updateDoc(doc(db, 'activities', editData.id), {
        ...editData,
        budget: Number(editData.budget),
        updatedAt: serverTimestamp()
      });
      setSelectedActivity(editData);
      setModalMode('details');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `activities/${editData.id}`);
    }
  };

  const handleEditClick = () => {
    setEditData({ ...selectedActivity });
    setModalMode('edit');
  };

  const requiredPipeline = useMemo(() => {
    return Math.round(salesTarget / (winRate / 100));
  }, [salesTarget, winRate]);

  const gap = useMemo(() => {
    return Math.max(0, requiredPipeline - actualPipeline);
  }, [requiredPipeline, actualPipeline]);

  const isAtRisk = gap > 0;

  // Calculate percentages for the chart
  // We'll use a max scale that accommodates both actual and required, plus some padding
  const maxScale = Math.max(actualPipeline, requiredPipeline) * 1.2;
  const actualWidth = (actualPipeline / maxScale) * 100;
  const requiredPos = (requiredPipeline / maxScale) * 100;
  const gapWidth = Math.abs(requiredPipeline - actualPipeline) / maxScale * 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* App Toolbar */}
      <div className="flex items-center justify-between bg-white px-6 py-3 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black dark:bg-white/10 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-black dark:text-white" />
          </div>
          <span className="text-xs font-black text-black dark:text-white uppercase">战略指挥中心 v2.1</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-slate-100">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-900">{user.displayName}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{user.email}</p>
            </div>
            <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200" />
          </div>
          <button 
            onClick={handleSignOut}
            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
            title="退出登录"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Module 1: Revenue Alignment & Gap Analysis */}
      <section className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
        <GapAnalysisHeader 
          winRate={winRate} setWinRate={setWinRate}
          salesTarget={salesTarget} setSalesTarget={setSalesTarget}
          actualPipeline={actualPipeline} setActualPipeline={setActualPipeline}
        />

        <div className="px-8 py-6">
          <div className="relative pt-6 pb-10">
            {/* Bullet Chart / Stacked Bar */}
            <div className="h-8 w-full bg-[#f5f5f7] rounded-xl relative overflow-hidden flex">
              {/* Actual Pipeline */}
              <motion.div 
                initial={false}
                animate={{ width: `${actualWidth}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-slate-900 relative z-10 flex items-center px-3"
              >
                <span className="text-white text-[10px] font-black">¥{actualPipeline}M</span>
              </motion.div>

              {/* Gap Area */}
              {isAtRisk && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-orange-500/20 border-x border-orange-500 border-dashed relative z-0 flex items-center justify-center"
                  style={{ width: `${gapWidth}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-[8px] font-black rounded-full shadow-md flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      ¥{gap}M 缺口
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Scale Markers */}
            <div className="absolute bottom-4 left-0 w-full flex justify-between px-1">
              <div className="flex flex-col items-center">
                <div className="w-px h-1.5 bg-slate-200 mb-0.5" />
                <span className="text-[8px] font-bold text-slate-300">0</span>
              </div>
              <div className="flex flex-col items-center" style={{ position: 'absolute', left: `${actualWidth}%`, transform: 'translateX(-50%)' }}>
                <div className="w-px h-1.5 bg-slate-900 mb-0.5" />
                <span className="text-[9px] font-black text-slate-900">{actualPipeline}M (Actual)</span>
              </div>
              <div className="flex flex-col items-center" style={{ position: 'absolute', left: `${requiredPos}%`, transform: 'translateX(-50%)' }}>
                <div className="w-px h-3 bg-orange-500 mb-0.5" />
                <span className="text-[9px] font-black text-orange-600">{requiredPipeline}M (Required)</span>
              </div>
              <div className="flex flex-col items-center" style={{ position: 'absolute', right: '0' }}>
                <div className="w-px h-4 bg-black dark:bg-white mb-0.5" />
                <span className="text-[9px] font-black text-black dark:text-white">¥{salesTarget}M (Target)</span>
              </div>
            </div>
          </div>

          <div className="mt-2 p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl border border-black/5 dark:border-white/5 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[10px] text-slate-500 leading-none">
              基于 <span className="font-bold text-slate-700">{winRate}% 赢单率</span>，目标 ¥{salesTarget}M 需 Pipeline <span className="font-bold text-slate-700">¥{requiredPipeline}M</span>。
              {isAtRisk ? (
                <> 缺口 <span className="font-bold text-orange-600">¥{gap}M</span>，建议启动补救。</>
              ) : (
                <> <span className="font-bold text-emerald-600">覆盖倍数健康</span>。</>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Module 2: Budget & Execution Dashboard */}
      <section className="space-y-6">
        <BudgetOverview 
          budgetData={budgetData} 
          onNewActivity={() => setShowNewActivityModal(true)} 
        />

        {/* Detailed Activity List */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-black/5 dark:border-white/5 bg-slate-50/50">
            <h3 className="text-xs font-black text-black dark:text-white uppercase tracking-widest">当季重点活动清单 (Q3 Key Activities)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">活动名称 (Activity)</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">时间 (Time)</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">地点 (Location)</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">类型 (Type)</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">主办者 (Host)</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">状态 (Status)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center space-y-3">
                      <div className="w-12 h-12 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-full flex items-center justify-center mx-auto border border-slate-100">
                        <Calendar className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">暂无活跃活动，请点击“新增活动”开始规划</p>
                    </td>
                  </tr>
                ) : activities.map((act, i) => (
                  <tr 
                    key={act.id || i} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => setSelectedActivity(act)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-black dark:text-white group-hover:text-black dark:text-white transition-colors">{act.name}</span>
                        <ChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-500">{act.time || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-500">{act.location || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-[#f5f5f7] text-slate-600 text-[9px] font-black rounded-lg uppercase tracking-tighter">
                        {act.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-500">{act.host || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 text-[9px] font-black rounded-lg uppercase tracking-tighter",
                        act.status === 'In Progress' ? 'text-blue-600 bg-[#f5f5f7]' :
                        act.status === 'Completed' ? 'text-emerald-600 bg-emerald-50' :
                        'text-amber-600 bg-amber-50'
                      )}>
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Module 3: Prescriptive Recommendations */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-black dark:text-white tracking-tight flex items-center gap-2">
            <Lightbulb className={cn("w-5 h-5 transition-colors duration-500", showInsights ? "text-amber-500" : "text-slate-300")} />
            🤖 系统洞察与智能建议 (Insights & Next Best Actions)
          </h2>
          <button 
            onClick={() => setShowInsights(!showInsights)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border",
              showInsights 
                ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200" 
                : "bg-white text-slate-600 border-black/5 dark:border-white/5 hover:border-black dark:hover:border-white hover:text-slate-900"
            )}
          >
            {showInsights ? (
              <>收起建议 (Collapse)</>
            ) : (
              <>获取智能建议 (Get Insights)</>
            )}
            <ChevronRight className={cn("w-3 h-3 transition-transform duration-300", showInsights ? "rotate-90" : "rotate-0")} />
          </button>
        </div>

        <AnimatePresence>
          {showInsights && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
                {/* Card 1: Budget Planning */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-[#1c1c1e] p-8 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BarChart3 className="w-24 h-24 text-blue-600" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="px-3 py-1 bg-[#f5f5f7] text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-100">
                        预算规划建议
                      </div>
                      <div className="w-2 h-2 rounded-full bg-[#f5f5f7]0 animate-pulse" />
                    </div>

                    <div className="space-y-4 mb-8">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">洞察 (Insight)</p>
                        <p className="text-sm font-bold text-black dark:text-white leading-relaxed">
                          根据缺口分析，医疗与政务行业 Pipeline 严重不足，现有活动无法支撑 Q3 目标。
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">建议 (Recommendation)</p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          建议冻结通用区域性展会的 MDF 审批，将剩余 <span className="font-black text-blue-600">¥120万</span> 预算全额倾斜至头部医疗 ISV 的定向数字营销。
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => alert('✅ 医疗专项定向 MDF 计划已生成\n\n- 目标伙伴: 42 家医疗 ISV\n- 预算: ¥120万\n- 执行周期: Q3-Q4\n- 预期 Pipeline: ¥25M')}
                      className="w-full py-4 bg-black text-white text-xs font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                    >
                      <Rocket className="w-4 h-4" />
                      🚀 一键生成医疗专项定向 MDF 计划
                    </button>
                  </div>
                </motion.div>

                {/* Card 2: Execution Correction */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-[#1c1c1e] p-8 rounded-3xl border border-orange-100 shadow-sm relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap className="w-24 h-24 text-orange-600" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-orange-100">
                        执行期纠偏建议
                      </div>
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    </div>

                    <div className="space-y-4 mb-8">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">洞察 (Insight)</p>
                        <p className="text-sm font-bold text-black dark:text-white leading-relaxed">
                          上月 15 场活动产出 800 个 MQL，但商机转化率仅为 <span className="text-orange-600">5%</span> (低于基准 12%)，存在大量沉睡线索。
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">建议 (Recommendation)</p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          不要再花钱办新活动。建议立刻启动<span className="font-black text-orange-600">『线索激活 SPIFF (短期激励)』</span>，用现金直奖刺激渠道销售跟进历史线索。
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => alert('✅ 线索激活 SPIFF 激励令已发布\n\n- 覆盖伙伴: 245 家\n- 激励金额: ¥5,000/条有效转化\n- 目标线索: 800 MQL\n- 预期激活商机: ¥12M')}
                      className="w-full py-4 bg-black text-white text-xs font-black rounded-2xl hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100"
                    >
                      <Zap className="w-4 h-4" />
                      ⚡ 一键发布线索激活专项激励令
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Module 4: Objective-Driven Execution Board */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-black dark:text-white tracking-tight flex items-center gap-2">
            <Activity className={cn("w-5 h-5 transition-colors duration-500", showExecutionBoard ? "text-black dark:text-white" : "text-slate-300")} />
            以目标为导向的执行看板 (Objective-Driven Execution Board)
          </h2>
          <button 
            onClick={() => setShowExecutionBoard(!showExecutionBoard)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border",
              showExecutionBoard 
                ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200" 
                : "bg-white text-slate-600 border-black/5 dark:border-white/5 hover:border-black dark:hover:border-white hover:text-slate-900"
            )}
          >
            {showExecutionBoard ? (
              <>收起看板 (Collapse)</>
            ) : (
              <>查看执行看板 (View Board)</>
            )}
            <ChevronRight className={cn("w-3 h-3 transition-transform duration-300", showExecutionBoard ? "rotate-90" : "rotate-0")} />
          </button>
        </div>

        <AnimatePresence>
          {showExecutionBoard && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-4">
                {/* Campaign Card A */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="p-8 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-black text-slate-900">【填补 Q3 基础缺口】</h3>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100">
                        执行中 (ON TRACK)
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">预期产出 (Expected)</p>
                          <p className="text-2xl font-black text-slate-900">¥20M</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">已产出 (Actual)</p>
                          <p className="text-2xl font-black text-emerald-600">¥15M</p>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-[#f5f5f7] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '75%' }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 bg-slate-50/50 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">包含的武器弹药 (Campaign Tools)</p>
                    <div className="flex flex-wrap gap-3">
                      <div className="px-4 py-2 bg-white border border-black/5 dark:border-white/5 rounded-xl flex items-center gap-2 shadow-sm">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-bold text-slate-700">2 个 MDF 线下沙龙</span>
                      </div>
                      <div className="px-4 py-2 bg-white border border-black/5 dark:border-white/5 rounded-xl flex items-center gap-2 shadow-sm">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-bold text-slate-700">1 个渠道首单 Incentive</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Campaign Card B */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="p-8 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-black text-slate-900">【AI 新品上市冲刺】</h3>
                      <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-full border border-red-100">
                        严重落后 (AT RISK)
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">预期产出 (Expected)</p>
                          <p className="text-2xl font-black text-slate-900">¥10M</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">已产出 (Actual)</p>
                          <p className="text-2xl font-black text-red-600">¥2M</p>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-[#f5f5f7] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '20%' }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-red-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 bg-slate-50/50 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">包含的武器弹药 (Campaign Tools)</p>
                    <div className="flex flex-wrap gap-3">
                      <div className="px-4 py-2 bg-white border border-black/5 dark:border-white/5 rounded-xl flex items-center gap-2 shadow-sm">
                        <MousePointer2 className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-xs font-bold text-slate-700">1 个 Webinar</span>
                      </div>
                      <div className="px-4 py-2 bg-white border border-black/5 dark:border-white/5 rounded-xl flex items-center gap-2 shadow-sm">
                        <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-700">高额阶梯返点计划</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Footer Insight */}
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" />
          系统已根据实时销售数据自动更新策略建议 • 最后更新: 2024-09-07 11:42
        </div>
      </div>

      {/* Activity Detail Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedActivity(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-0.5 text-[8px] font-black rounded-full uppercase tracking-widest", selectedActivity.color)}>
                        {selectedActivity.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedActivity.type}</span>
                    </div>
                    <h3 className="text-2xl font-black text-black dark:text-white tracking-tight">
                      {modalMode === 'leads' ? '线索跟进看板' : modalMode === 'edit' ? '编辑活动信息' : modalMode === 'attendees' ? '参会人员名单 (WeChat)' : selectedActivity.name}
                    </h3>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedActivity(null);
                      setModalMode('details');
                    }}
                    className="p-2 hover:bg-[#f5f5f7] rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                {modalMode === 'details' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                            <Calendar className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">活动时间</p>
                            <p className="text-sm font-black text-slate-900">{selectedActivity.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                            <MapPin className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">活动地点</p>
                            <p className="text-sm font-black text-slate-900">{selectedActivity.loc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                            <User className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">主办方</p>
                            <p className="text-sm font-black text-slate-900">{selectedActivity.host}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#f5f5f7] rounded-xl">
                            <DollarSign className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">预算投入</p>
                            <p className="text-sm font-black text-blue-600">{selectedActivity.budget}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 rounded-xl">
                            <PieChart className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">预期 ROI</p>
                            <p className="text-sm font-black text-emerald-600">{selectedActivity.expectedROI}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-50 rounded-xl">
                            <Users className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">预期线索数</p>
                            <p className="text-sm font-black text-purple-600">{selectedActivity.leads} MQLs</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-3xl border border-black/5 dark:border-white/5 mb-8">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">活动简介 (Description)</p>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {selectedActivity.desc}
                      </p>
                    </div>

                    {selectedActivity.wechatEnabled && (
                      <div className="mb-8 p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Smartphone className="w-12 h-12 text-emerald-600" />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-emerald-600" />
                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">微信小程序实时互动已开启</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-bold text-emerald-600">LIVE</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">已报名</p>
                            <p className="text-lg font-black text-slate-900">{attendees.length}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">现场签到</p>
                            <p className="text-lg font-black text-emerald-600">{attendees.filter(a => a.status === '已签到').length}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">互动提问</p>
                            <p className="text-lg font-black text-blue-600">{attendees.filter(a => a.engagement === '提问').length}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">抽奖参与</p>
                            <p className="text-lg font-black text-purple-600">{attendees.filter(a => a.engagement === '抽奖').length}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button 
                            onClick={() => setModalMode('attendees')}
                            className="flex-1 py-2 bg-white border border-emerald-200 text-emerald-700 text-[9px] font-black rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                          >
                            <Users className="w-3 h-3" />
                            管理参会名单
                          </button>
                          <button 
                            onClick={() => setShowMiniAppPreview(true)}
                            className="flex-1 py-2 bg-black text-white text-[9px] font-black rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                          >
                            <Smartphone className="w-3 h-3" />
                            预览小程序端
                          </button>
                          <button className="flex-1 py-2 bg-white border border-emerald-200 text-emerald-700 text-[9px] font-black rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
                            <Bell className="w-3 h-3" />
                            发送即时提醒
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button 
                        onClick={handleEditClick}
                        className="flex-1 py-4 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                      >
                        编辑活动详情
                      </button>
                      <button 
                        onClick={() => setModalMode('leads')}
                        className="flex-1 py-4 bg-white border border-black/5 dark:border-white/5 text-slate-600 text-xs font-black rounded-2xl hover:bg-[#f5f5f7] dark:bg-[#2c2c2e] transition-all"
                      >
                        查看线索跟进
                      </button>
                    </div>
                  </motion.div>
                )}

                {modalMode === 'edit' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">活动名称</label>
                        <input 
                          type="text" 
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-full px-4 py-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">活动时间</label>
                        <input 
                          type="date" 
                          value={editData.time}
                          onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                          className="w-full px-4 py-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">活动地点</label>
                        <input 
                          type="text" 
                          value={editData.loc}
                          onChange={(e) => setEditData({ ...editData, loc: e.target.value })}
                          className="w-full px-4 py-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">预算投入</label>
                        <input 
                          type="text" 
                          value={editData.budget}
                          onChange={(e) => setEditData({ ...editData, budget: e.target.value })}
                          className="w-full px-4 py-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">活动简介</label>
                      <textarea 
                        rows={3}
                        value={editData.desc}
                        onChange={(e) => setEditData({ ...editData, desc: e.target.value })}
                        className="w-full px-4 py-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={handleSaveEdit}
                        className="flex-1 py-4 bg-black dark:bg-white text-white text-xs font-black rounded-2xl hover:bg-black dark:bg-white/90 transition-all flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        保存修改
                      </button>
                      <button 
                        onClick={() => handleDeleteActivity(selectedActivity.id)}
                        className="flex-1 py-4 bg-red-50 text-red-600 text-xs font-black rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        删除活动
                      </button>
                    </div>
                  </motion.div>
                )}

                {modalMode === 'leads' && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-[#f5f5f7] rounded-2xl border border-blue-100">
                        <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">总线索 (MQL)</p>
                        <p className="text-xl font-black text-blue-600">{selectedActivity.leads}</p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">商机转化 (SQL)</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-xl font-black text-emerald-600">42</p>
                          <span className="text-[10px] font-bold text-emerald-400">28%</span>
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                        <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1">预估 Pipeline</p>
                        <p className="text-xl font-black text-purple-600">¥4.2M</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">转化漏斗 (Funnel)</p>
                      <div className="space-y-2">
                        {[
                          { label: '线索获取 (MQL)', value: 100, color: 'bg-[#f5f5f7]0' },
                          { label: '初步沟通 (SAL)', value: 65, color: 'bg-blue-400' },
                          { label: '商机确认 (SQL)', value: 28, color: 'bg-emerald-500' },
                          { label: '方案报价 (Proposal)', value: 12, color: 'bg-emerald-400' },
                        ].map((step, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <span className="w-24 text-[10px] font-bold text-slate-500">{step.label}</span>
                            <div className="flex-1 h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${step.value}%` }}
                                className={cn("h-full rounded-full", step.color)}
                              />
                            </div>
                            <span className="w-8 text-[10px] font-black text-black dark:text-white text-right">{step.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={() => setModalMode('details')}
                        className="w-full py-4 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        返回活动详情
                      </button>
                    </div>
                  </motion.div>
                )}

                {modalMode === 'attendees' && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] p-4 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">线索转化率</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-slate-900">25%</span>
                          <span className="text-[8px] font-bold text-emerald-600">↑ 5%</span>
                        </div>
                      </div>
                      <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] p-4 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">已转商机</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-blue-600">12</span>
                          <span className="text-[8px] font-bold text-slate-400">/ 48 Leads</span>
                        </div>
                      </div>
                      <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] p-4 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">高潜客户 (Hot)</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-orange-600">8</span>
                          <span className="text-[8px] font-bold text-slate-400">需立即跟进</span>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto rounded-2xl border border-slate-100">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white z-10 shadow-sm">
                          <tr className="border-b border-slate-100">
                            <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase">参会人信息</th>
                            <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase text-center">热度</th>
                            <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase">跟进状态</th>
                            <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {attendees.map((person: { id?: string; name: string; company: string; score: number; followUpStatus: string }, idx: number) => (
                            <tr key={person.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-4 py-3">
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-slate-900">{person.name}</span>
                                  <span className="text-[9px] text-slate-500">{person.company}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center">
                                  <div className="w-12 h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden">
                                    <div 
                                      className={cn(
                                        "h-full rounded-full",
                                        person.score > 80 ? "bg-orange-500" : person.score > 60 ? "bg-[#f5f5f7]0" : "bg-slate-300"
                                      )}
                                      style={{ width: `${person.score}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={cn(
                                  "px-2 py-0.5 text-[8px] font-black rounded-full uppercase",
                                  person.followUpStatus === 'Opportunity' ? "bg-blue-100 text-blue-700" :
                                  person.followUpStatus === 'Qualified' ? "bg-emerald-100 text-emerald-700" :
                                  person.followUpStatus === 'Contacted' ? "bg-amber-100 text-amber-700" :
                                  "bg-[#f5f5f7] text-slate-500"
                                )}>
                                  {person.followUpStatus === 'Opportunity' ? '已转商机' :
                                   person.followUpStatus === 'Qualified' ? '高潜力' :
                                   person.followUpStatus === 'Contacted' ? '已联系' : '新线索'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-1.5 hover:bg-[#f5f5f7] text-blue-600 rounded-lg transition-colors title='转商机'">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button className="p-1.5 hover:bg-[#f5f5f7] text-slate-600 rounded-lg transition-colors title='添加备注'">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[#f5f5f7]/50 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-3 h-3 text-blue-600" />
                          <span className="text-[9px] font-black text-blue-700 uppercase">热门提问</span>
                        </div>
                        <p className="text-[10px] text-slate-600 italic">“如何申请专项 MDF 额度？”</p>
                      </div>
                      <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="w-3 h-3 text-purple-600" />
                          <span className="text-[9px] font-black text-purple-700 uppercase">中奖名单</span>
                        </div>
                        <p className="text-[10px] text-slate-600">张伟、王强 等 5 人</p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={() => setModalMode('details')}
                        className="w-full py-4 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        返回活动详情
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Activity Modal */}
      <AnimatePresence>
        {showNewActivityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewActivityModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">规划新活动 (Plan New Activity)</p>
                    <h3 className="text-2xl font-black text-black dark:text-white tracking-tight">新增市场活动</h3>
                  </div>
                  <button 
                    onClick={() => setShowNewActivityModal(false)}
                    className="p-2 hover:bg-[#f5f5f7] rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">活动名称</label>
                    <input 
                      type="text" 
                      placeholder="例如：Q3 行业合作伙伴峰会"
                      value={newActivityData.name}
                      onChange={(e) => setNewActivityData({ ...newActivityData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">活动类型</label>
                      <select 
                        value={newActivityData.type}
                        onChange={(e) => setNewActivityData({ ...newActivityData, type: e.target.value })}
                        className="w-full px-4 py-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                      >
                        <option value="Marketing">Marketing (直营)</option>
                        <option value="PMDF">PMDF (渠道联合)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">预估预算</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="500,000"
                          value={newActivityData.budget}
                          onChange={(e) => setNewActivityData({ ...newActivityData, budget: e.target.value })}
                          className="w-full px-4 py-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">¥</span>
                      </div>
                    </div>
                  </div>

                  {newActivityData.type === 'PMDF' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1"
                    >
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="w-3 h-3 text-purple-500" />
                        指派对应渠道 (Assign Channel)
                      </label>
                      <select 
                        value={newActivityData.channel}
                        onChange={(e) => setNewActivityData({ ...newActivityData, channel: e.target.value })}
                        className="w-full px-4 py-3 bg-purple-50 border border-purple-100 rounded-2xl text-sm font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-200 appearance-none"
                      >
                        <option value="">选择合作伙伴...</option>
                        <option value="partner_a">上海华讯网络系统有限公司</option>
                        <option value="partner_b">北京神州数码有限公司</option>
                        <option value="partner_c">中软国际有限公司</option>
                      </select>
                      <p className="text-[9px] text-purple-400 font-medium mt-1">
                        * 指派后，系统将自动通知渠道负责人完成详细申请并补充活动内容。
                      </p>
                    </motion.div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">活动简述</label>
                    <textarea 
                      rows={3}
                      placeholder="简述活动目标与预期产出..."
                      value={newActivityData.desc}
                      onChange={(e) => setNewActivityData({ ...newActivityData, desc: e.target.value })}
                      className="w-full px-4 py-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={handleCreateActivity}
                      className="flex-1 py-4 bg-black dark:bg-white text-white text-xs font-black rounded-2xl hover:bg-black dark:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 dark:shadow-white/10"
                    >
                      <PlusCircle className="w-4 h-4" />
                      确认并发布规划
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Attendee Mini App Preview */}
      <AnimatePresence>
        {showMiniAppPreview && selectedActivity && (
          <AttendeeMiniApp 
            activityId={selectedActivity.id}
            activityName={selectedActivity.name}
            onClose={() => setShowMiniAppPreview(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
