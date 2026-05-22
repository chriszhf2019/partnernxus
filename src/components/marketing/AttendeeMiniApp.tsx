// @ts-nocheck
import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Calendar, 
  ChevronLeft, 
  QrCode, 
  MessageSquare, 
  Gift, 
  ClipboardCheck,
  Send,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AttendeeMiniAppProps {
  activityId: string;
  activityName: string;
  onClose: () => void;
}


export const AttendeeMiniApp: React.FC<AttendeeMiniAppProps> = ({ activityId, activityName, onClose }) => {
  const [view, setView] = useState<'home' | 'register' | 'live' | 'success'>('home');
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [attendeeDocId, setAttendeeDocId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [showToast, setShowToast] = useState<string | null>(null);

  // Check if user is already registered
  React.useEffect(() => {
    const checkRegistration = async () => {
      if (!auth.currentUser) return;
      const q = query(
        collection(db, `activities/${activityId}/attendees`), 
        where('uid', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setAttendeeDocId(snapshot.docs[0].id);
        setIsRegistered(true);
        setHasCheckedIn(data.status === '已签到');
        setView('live');
      }
    };
    checkRegistration();
  }, [activityId]);

  const handleRegister = async () => {
    if (!auth.currentUser) return;
    try {
      const docRef = await addDoc(collection(db, `activities/${activityId}/attendees`), {
        name: auth.currentUser.displayName || '匿名用户',
        company: '演示公司',
        role: '参会嘉宾',
        status: '已报名',
        uid: auth.currentUser.uid,
        score: 50,
        followUpStatus: 'New',
        time: new Date().toLocaleTimeString(),
        createdAt: serverTimestamp()
      });
      setAttendeeDocId(docRef.id);
      setIsRegistered(true);
      setView('live');
      triggerToast('报名成功！');
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleCheckIn = async () => {
    if (!attendeeDocId) return;
    try {
      await updateDoc(doc(db, `activities/${activityId}/attendees`, attendeeDocId), {
        status: '已签到',
        time: new Date().toLocaleTimeString(),
        score: 80
      });
      setHasCheckedIn(true);
      triggerToast('签到成功！');
    } catch (error) {
      console.error("Check-in failed:", error);
    }
  };

  const handleSendQuestion = async () => {
    if (!attendeeDocId || !question) return;
    try {
      await updateDoc(doc(db, `activities/${activityId}/attendees`, attendeeDocId), {
        engagement: '提问',
        notes: `问题: ${question}`,
        score: 90
      });
      setQuestion('');
      triggerToast('提问已发送至后台');
    } catch (error) {
      console.error("Question failed:", error);
    }
  };

  const handleLuckyDraw = async () => {
    if (!attendeeDocId) return;
    try {
      await updateDoc(doc(db, `activities/${activityId}/attendees`, attendeeDocId), {
        engagement: '抽奖',
        score: 85
      });
      triggerToast('抽奖已参与，请留意大屏幕');
    } catch (error) {
      console.error("Lucky draw failed:", error);
    }
  };

  const handleFeedback = async () => {
    if (!attendeeDocId) return;
    try {
      await updateDoc(doc(db, `activities/${activityId}/attendees`, attendeeDocId), {
        engagement: '反馈',
        score: 75
      });
      triggerToast('反馈已提交，感谢您的参与');
    } catch (error) {
      console.error("Feedback failed:", error);
    }
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[375px] h-[700px] bg-slate-50 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50" />

        {/* Status Bar */}
        <div className="h-12 flex items-end justify-between px-8 pb-2">
          <span className="text-[10px] font-black">9:41</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-slate-800/10" />
            <div className="w-3 h-3 rounded-full bg-slate-800/10" />
          </div>
        </div>

        {/* Mini App Header */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-full">
              <ChevronLeft className="w-5 h-5 text-slate-900" />
            </button>
            <span className="text-sm font-black text-slate-900 truncate max-w-[180px]">{activityName}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#f5f5f7] p-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div className="w-4 h-4 rounded-full border-2 border-slate-400" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                <div className="aspect-video bg-slate-200 rounded-3xl overflow-hidden relative">
                  <img 
                    src={`https://picsum.photos/seed/${activityName}/400/225`} 
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-black dark:bg-white text-white text-[10px] font-black rounded-full shadow-lg">热报中</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h1 className="text-xl font-black text-slate-900 leading-tight">{activityName}</h1>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-bold">2024-09-15 09:00 - 17:00</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs font-bold">上海 · 浦东新区世纪大道 88 号</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 mb-2">活动亮点</h3>
                  <ul className="space-y-2">
                    {['大咖面对面交流', '行业数字化白皮书首发', '现场抽取华为 Mate 60'].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <div className="w-1 h-1 rounded-full bg-black dark:bg-white mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {view === 'live' && (
              <motion.div 
                key="live"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 space-y-6"
              >
                <div className="bg-emerald-500 p-6 rounded-[2rem] text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase opacity-80 mb-1">正在进行中</p>
                    <h2 className="text-lg font-black mb-4">欢迎来到活动现场</h2>
                    {!hasCheckedIn ? (
                      <button 
                        onClick={handleCheckIn}
                        className="w-full py-3 bg-white text-emerald-600 text-xs font-black rounded-2xl shadow-xl flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        扫码签到
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-white font-black">
                        <CheckCircle2 className="w-5 h-5" />
                        您已完成签到
                      </div>
                    )}
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-20">
                    <QrCode className="w-24 h-24" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleLuckyDraw}
                    className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-transform"
                  >
                    <div className="p-3 bg-purple-50 rounded-2xl">
                      <Gift className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-xs font-black text-slate-900">幸运抽奖</span>
                  </button>
                  <button 
                    onClick={handleFeedback}
                    className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-transform"
                  >
                    <div className="p-3 bg-[#f5f5f7] rounded-2xl">
                      <ClipboardCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-black text-slate-900">问卷反馈</span>
                  </button>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-black dark:text-white" />
                    <span className="text-sm font-black text-slate-900">提问互动</span>
                  </div>
                  <div className="relative">
                    <textarea 
                      rows={3}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="向嘉宾提问..."
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button 
                      onClick={handleSendQuestion}
                      className="absolute bottom-3 right-3 p-2 bg-black dark:bg-white text-white rounded-xl shadow-lg"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Action Bar */}
        <div className="p-6 bg-white border-t border-slate-100">
          {view === 'home' && (
            <button 
              onClick={handleRegister}
              className="w-full py-4 bg-slate-900 text-white text-sm font-black rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition-all"
            >
              立即报名参与
            </button>
          )}
          {view === 'live' && (
            <div className="flex items-center justify-center gap-8 py-2">
              <div className="flex flex-col items-center gap-1 text-black dark:text-white">
                <Calendar className="w-5 h-5" />
                <span className="text-[10px] font-black">活动</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-slate-300">
                <User className="w-5 h-5" />
                <span className="text-[10px] font-black">我的</span>
              </div>
            </div>
          )}
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 bg-slate-800/90 backdrop-blur-md text-white text-[10px] font-black rounded-full z-[110]"
            >
              {showToast}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
