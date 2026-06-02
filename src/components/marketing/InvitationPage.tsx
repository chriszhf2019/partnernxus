import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { supabase } from '../../lib/supabase';
import { Calendar, MapPin, Phone, User, FileText, Gift, MessageCircle, CheckCircle, QrCode, Share2, Clock, Trophy, Star, ChevronDown, ChevronUp } from 'lucide-react';

export const InvitationPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showLottery, setShowLottery] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [registerForm, setRegisterForm] = useState({ name: '', phone: '', company: '' });
  const [checkinCode, setCheckinCode] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [lotteryWinners, setLotteryWinners] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    if (code) {
      supabase.from('marketing_activities').select('*').eq('invitation_code', code).single().then(({ data }) => {
        if (data) {
          setActivity(data);
          supabase.from('activity_registrations').select('*').eq('activity_id', data.id).then(({ data: regs }) => {
            if (regs) setRegistrations(regs);
          });
          supabase.from('activity_questions').select('*').eq('activity_id', data.id).order('created_at', { ascending: false }).then(({ data: qs }) => {
            if (qs) setQuestions(qs);
          });
        }
      });
    }
  }, [code]);

  const handleRegister = async () => {
    if (!registerForm.name || !registerForm.phone) return;
    setIsRegistering(true);
    try {
      await supabase.from('activity_registrations').insert({
        activity_id: activity.id,
        name: registerForm.name,
        phone: registerForm.phone,
        company: registerForm.company,
        status: 'registered',
        signup_time: new Date().toISOString(),
      });
      setIsRegistered(true);
      setRegistrationSuccess(true);
      
      // 发放报名积分
      await addPoints(registerForm.phone, activity.signup_points || 10, '活动报名');
      
      setTimeout(() => setRegistrationSuccess(false), 3000);
    } catch (err) {
      console.warn('Registration failed:', err);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCheckin = async () => {
    if (checkinCode.toUpperCase() !== activity.invitation_code) {
      alert('签到码不正确');
      return;
    }
    setIsCheckingIn(true);
    try {
      const reg = registrations.find(r => r.phone === registerForm.phone);
      if (reg) {
        await supabase.from('activity_registrations').update({ 
          status: 'checked_in',
          checkin_time: new Date().toISOString()
        }).eq('id', reg.id);
        setShowCheckin(false);
        
        // 发放签到积分
        await addPoints(registerForm.phone, activity.checkin_points || 20, '活动签到');
        
        alert('签到成功！');
      }
    } catch (err) {
      console.warn('Checkin failed:', err);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;
    try {
      await supabase.from('activity_questions').insert({
        activity_id: activity.id,
        content: newQuestion,
        author: registerForm.name || '匿名',
        phone: registerForm.phone,
      });
      setQuestions([{
        id: Date.now(),
        content: newQuestion,
        author: registerForm.name || '匿名',
        created_at: new Date().toISOString(),
      }, ...questions]);
      setNewQuestion('');
    } catch (err) {
      console.warn('Failed to submit question:', err);
    }
  };

  const handleDrawLottery = async () => {
    setIsDrawing(true);
    const checkedInRegs = registrations.filter(r => r.status === 'checked_in');
    if (checkedInRegs.length === 0) {
      alert('暂无已签到人员');
      setIsDrawing(false);
      return;
    }
    
    // 模拟抽奖动画
    let tempWinners: string[] = [];
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const randomIndex = Math.floor(Math.random() * checkedInRegs.length);
      const winner = checkedInRegs[randomIndex];
      tempWinners.push(winner.name);
    }
    setLotteryWinners(tempWinners);
    setIsDrawing(false);
    
    // 记录抽奖结果
    await supabase.from('activity_lottery').insert({
      activity_id: activity.id,
      winners: JSON.stringify(tempWinners),
      draw_time: new Date().toISOString(),
    });
  };

  const addPoints = async (phone: string, points: number, reason: string) => {
    try {
      await supabase.from('partner_points').insert({
        phone,
        points,
        reason,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to add points:', err);
    }
  };

  const copyInvitationLink = () => {
    const link = `${window.location.origin}/invitation/${code}`;
    navigator.clipboard.writeText(link);
    alert('链接已复制到剪贴板');
  };

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500">活动不存在或邀请码无效</p>
          <Button variant="secondary" onClick={() => navigate('/marketing')} className="mt-4">返回营销页面</Button>
        </div>
      </div>
    );
  }

  const isPast = new Date(activity.event_date) < new Date();
  const isToday = new Date(activity.event_date).toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900/30 dark:via-neutral-900 dark:to-purple-900/30">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-neutral-900 dark:text-white">{activity.name}</h1>
              <p className="text-xs text-neutral-500">邀请函</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={copyInvitationLink}>
            <Share2 className="w-4 h-4 mr-1" />分享
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Activity Info Card */}
        <Card className="overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative h-full flex items-end p-6">
              <div>
                <Badge variant="info" className="mb-2 bg-white/20 backdrop-blur-sm">
                  {activity.type} · {activity.host_type === 'partner' ? '代理商合办' : '厂商自办'}
                </Badge>
                <h2 className="text-2xl font-bold text-white">{activity.name}</h2>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-neutral-500">活动日期</p>
                  <p className="font-medium text-neutral-900 dark:text-white">{activity.event_date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-neutral-500">活动地点</p>
                  <p className="font-medium text-neutral-900 dark:text-white">{activity.location || '未指定'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-neutral-500">联系电话</p>
                  <p className="font-medium text-neutral-900 dark:text-white">{activity.contact_phone || '未提供'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-neutral-500">联系人</p>
                  <p className="font-medium text-neutral-900 dark:text-white">{activity.contact_name || '未提供'}</p>
                </div>
              </div>
            </div>
            {activity.description && (
              <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">活动描述</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">{activity.description}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invitation QR Code */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">邀请码</CardTitle>
            <button onClick={() => setShowQR(!showQR)} className="text-sm text-blue-600 hover:text-blue-700">
              {showQR ? '隐藏二维码' : '显示二维码'}
            </button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <QrCode className="w-5 h-5 text-blue-600" />
                  <span className="font-mono text-lg font-bold text-neutral-900 dark:text-white">{activity.invitation_code}</span>
                </div>
                <p className="text-xs text-neutral-500 mt-2">分享此邀请码或扫描下方二维码报名参加活动</p>
              </div>
              {showQR && (
                <div className="w-24 h-24 bg-white p-2 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/invitation/${activity.invitation_code}`)}`}
                    alt="QR Code"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Registration Section */}
        {!isRegistered ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                立即报名
              </CardTitle>
            </CardHeader>
            <CardContent>
              {registrations.length >= (activity.max_attendees || 100) ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-neutral-500">名额已满</p>
                  <p className="text-sm text-neutral-400 mt-1">本次活动报名人数已达上限</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 block mb-2">姓名 *</label>
                      <input 
                        className="w-full h-10 px-3 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-sm"
                        value={registerForm.name}
                        onChange={e => setRegisterForm({...registerForm, name: e.target.value})}
                        placeholder="请输入您的姓名"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 block mb-2">手机号 *</label>
                      <input 
                        className="w-full h-10 px-3 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-sm"
                        value={registerForm.phone}
                        onChange={e => setRegisterForm({...registerForm, phone: e.target.value})}
                        placeholder="请输入您的手机号"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-2">公司名称</label>
                    <input 
                      className="w-full h-10 px-3 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-sm"
                      value={registerForm.company}
                      onChange={e => setRegisterForm({...registerForm, company: e.target.value})}
                      placeholder="请输入您的公司名称（选填）"
                    />
                  </div>
                  <Button 
                    variant="brand" 
                    className="w-full" 
                    onClick={handleRegister}
                    disabled={isRegistering || !registerForm.name || !registerForm.phone}
                  >
                    {isRegistering ? '提交中...' : `立即报名 · 获得 ${activity.signup_points || 10} 积分`}
                  </Button>
                  {registrationSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm text-emerald-700 dark:text-emerald-300">报名成功！</span>
                    </div>
                  )}
                  <p className="text-xs text-center text-neutral-400">
                    当前已有 {registrations.length} 人报名，剩余名额 {Math.max(0, (activity.max_attendees || 100) - registrations.length)} 个
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-emerald-800 dark:text-emerald-300">报名成功</p>
                <p className="text-sm text-emerald-700/70 dark:text-emerald-400">您已成功报名本次活动</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checkin Section */}
        {isRegistered && (isToday || !isPast) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                现场签到
              </CardTitle>
              <button onClick={() => setShowCheckin(!showCheckin)} className="text-sm text-blue-600">
                {showCheckin ? '收起' : '展开'}
              </button>
            </CardHeader>
            {showCheckin && (
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-2">输入签到码</label>
                    <input 
                      className="w-full h-10 px-3 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-sm font-mono text-center text-lg"
                      value={checkinCode}
                      onChange={e => setCheckinCode(e.target.value)}
                      placeholder="请输入签到码"
                    />
                  </div>
                  <Button 
                    variant="brand" 
                    className="w-full" 
                    onClick={handleCheckin}
                    disabled={isCheckingIn || !checkinCode}
                  >
                    {isCheckingIn ? '签到中...' : `确认签到 · 获得 ${activity.checkin_points || 20} 积分`}
                  </Button>
                  <p className="text-xs text-center text-neutral-400">
                    签到码：<span className="font-mono font-bold">{activity.invitation_code}</span>
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Questions Section */}
        {activity.enable_questions && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                在线提问
              </CardTitle>
              <button onClick={() => setShowQuestions(!showQuestions)} className="text-sm text-blue-600">
                {showQuestions ? '收起' : `展开 · ${questions.length} 个问题`}
              </button>
            </CardHeader>
            {showQuestions && (
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <textarea 
                      className="w-full h-20 px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border rounded-lg text-sm resize-none"
                      value={newQuestion}
                      onChange={e => setNewQuestion(e.target.value)}
                      placeholder="提出您的问题..."
                    />
                    <Button 
                      variant="secondary"
                      className="mt-2"
                      onClick={handleSubmitQuestion}
                      disabled={!newQuestion.trim()}
                    >
                      提交问题
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {questions.length === 0 ? (
                      <p className="text-sm text-neutral-400 text-center py-4">暂无问题，快来提问吧！</p>
                    ) : (
                      questions.map((q) => (
                        <div key={q.id} className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{q.author || '匿名'}</span>
                            <span className="text-xs text-neutral-400">
                              {new Date(q.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">{q.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Lottery Section */}
        {activity.enable_lottery && isToday && (
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-200 dark:border-amber-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-600" />
                幸运抽奖
              </CardTitle>
              {activity.lotteryReward && (
                <Badge variant="warning">{activity.lotteryReward}</Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-center">
                {isDrawing ? (
                  <div className="py-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-amber-500 animate-pulse flex items-center justify-center">
                      <Trophy className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-lg font-medium text-amber-700 dark:text-amber-300">正在抽取幸运观众...</p>
                  </div>
                ) : lotteryWinners.length > 0 ? (
                  <div className="py-8">
                    <h3 className="text-lg font-bold text-amber-700 dark:text-amber-300 mb-4">🎉 恭喜中奖者！</h3>
                    <div className="space-y-2">
                      {lotteryWinners.map((winner, i) => (
                        <div key={i} className="flex items-center justify-center gap-2">
                          <Star className={`w-5 h-5 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-neutral-400' : 'text-amber-700'}`} />
                          <span className="font-medium">{winner}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Button 
                      variant="brand" 
                      size="lg"
                      onClick={handleDrawLottery}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      <Gift className="w-5 h-5 mr-2" />
                      开始抽奖
                    </Button>
                    <p className="text-xs text-neutral-500 mt-3">
                      已签到 {registrations.filter(r => r.status === 'checked_in').length} 人可参与抽奖
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registered List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">报名名单</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {registrations.length === 0 ? (
                <p className="text-sm text-neutral-400 col-span-full text-center py-4">暂无报名人员</p>
              ) : (
                registrations.map((reg) => (
                  <div 
                    key={reg.id} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      reg.status === 'checked_in' 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                        : 'bg-neutral-50 dark:bg-neutral-800'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium">{reg.name}</p>
                      <p className="text-xs text-neutral-500">{reg.company || reg.phone}</p>
                    </div>
                    <Badge variant={reg.status === 'checked_in' ? 'success' : 'default'} size="sm">
                      {reg.status === 'checked_in' ? '已签到' : '已报名'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};