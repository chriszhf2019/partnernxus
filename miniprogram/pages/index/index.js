const { eventAPI, scoreAPI } = require('../../utils/api');
const app = getApp();

Page({
  data: {
    companyName: '',
    avatarUrl: '',
    totalScore: 0,
    scoreLevel: 'bronze',
    scoreLevelText: '铜牌',
    scoreDetail: {},
    activeTab: 'upcoming',
    events: [],
    loading: true
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.setData({
      companyName: app.globalData.companyName || '',
      avatarUrl: (app.globalData.userInfo && app.globalData.userInfo.avatarUrl) || ''
    });
    this.loadScores();
  },

  // 加载活动列表
  async loadData() {
    this.setData({ loading: true });
    try {
      const events = await eventAPI.list({ tab: this.data.activeTab });
      this.setData({
        events: events.map(e => ({
          ...e,
          countdown: this.formatCountdown(e.startTime),
          distance: this.formatDistance(e.startTime)
        })),
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 加载积分
  async loadScores() {
    try {
      const score = await scoreAPI.myScore();
      const level = this.calcLevel(score.total);
      this.setData({
        totalScore: score.total,
        scoreLevel: level.badge,
        scoreLevelText: level.text,
        scoreDetail: score.detail || {}
      });
    } catch (err) { /* 静默失败 */ }
  },

  // 切换Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.loadData();
  },

  // 跳转活动详情
  goEvent(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/event/event?id=${id}` });
  },

  // 跳转积分页
  goScore() {
    wx.switchTab({ url: '/pages/score/score' });
  },

  // 跳转兑换页
  goStore() {
    wx.switchTab({ url: '/pages/store/store' });
  },

  // 跳转个人页
  goProfile() {
    wx.switchTab({ url: '/pages/profile/profile' });
  },

  // 倒计时格式化
  formatCountdown(startTime) {
    const now = Date.now();
    const start = new Date(startTime).getTime();
    const diff = start - now;
    if (diff <= 0) return '进行中';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `${days}天后开始`;
    return `${hours}小时后开始`;
  },

  // 距离格式化
  formatDistance(startTime) {
    const now = Date.now();
    const start = new Date(startTime).getTime();
    const diff = start - now;
    if (diff <= 0) return '';
    const days = Math.floor(diff / 86400000);
    if (days > 30) return `${Math.floor(days / 30)}月后`;
    if (days > 0) return `${days}天后`;
    return '今天';
  },

  // 积分等级计算
  calcLevel(score) {
    if (score >= 200) return { badge: 'gold', text: '金牌' };
    if (score >= 100) return { badge: 'silver', text: '银牌' };
    return { badge: 'bronze', text: '铜牌' };
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh());
  }
});
