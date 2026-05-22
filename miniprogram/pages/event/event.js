const { eventAPI, scoreAPI, shareAPI } = require('../../utils/api');
const { subscribeReminder } = require('../../utils/auth');
const app = getApp();

Page({
  data: {
    eventId: '',
    event: {},
    questions: [],
    questionText: '',
    isAnonymous: false,
    lotteryResult: null
  },

  onLoad(options) {
    this.setData({ eventId: options.id });
    this.loadEvent();
    this.loadQuestions();
  },

  async loadEvent() {
    try {
      const event = await eventAPI.detail(this.data.eventId);
      this.setData({ event });
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  async loadQuestions() {
    try {
      const questions = await eventAPI.questions(this.data.eventId);
      this.setData({ questions });
    } catch (err) { /* 静默 */ }
  },

  // 签到
  async doCheckin() {
    try {
      wx.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode'],
        success: async (res) => {
          wx.showLoading({ title: '签到中...' });
          await eventAPI.checkin(this.data.eventId, { qrData: res.result });
          wx.hideLoading();
          wx.showToast({ title: '签到成功！+30分', icon: 'success' });
          this.setData({ 'event.hasCheckedIn': true });
        }
      });
    } catch (err) {
      wx.showToast({ title: '签到失败', icon: 'none' });
    }
  },

  // 设置提醒
  async doReminder() {
    try {
      await subscribeReminder();
      await eventAPI.setReminder(this.data.eventId);
      wx.showToast({ title: '提醒已设置', icon: 'success' });
      this.setData({ 'event.hasReminder': true });
    } catch (err) {
      wx.showToast({ title: '设置失败', icon: 'none' });
    }
  },

  // 提问
  onQuestionInput(e) { this.setData({ questionText: e.detail.value }); },
  onAnonSwitch(e) { this.setData({ isAnonymous: e.detail.value }); },

  async askQuestion() {
    if (!this.data.questionText.trim()) return;
    try {
      await eventAPI.askQuestion(this.data.eventId, this.data.questionText, this.data.isAnonymous);
      wx.showToast({ title: '提问成功！+15分', icon: 'success' });
      this.setData({ questionText: '' });
      this.loadQuestions();
    } catch (err) {
      wx.showToast({ title: '提问失败', icon: 'none' });
    }
  },

  // 抽奖
  async doLottery() {
    wx.showLoading({ title: '抽奖中...' });
    try {
      const result = await eventAPI.lottery(this.data.eventId);
      this.setData({ lotteryResult: result.winners });
      wx.hideLoading();
      if (result.isWinner) {
        wx.showModal({ title: '🎉 恭喜中奖！', content: `您获得了：${result.prize}`, showCancel: false });
      } else {
        wx.showToast({ title: '未中奖，下次好运！', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '抽奖失败', icon: 'none' });
    }
  },

  // 分享
  async doShare() {
    try {
      const link = await shareAPI.generateLink(this.data.eventId);
      await shareAPI.recordShare(this.data.eventId, link.shareId);
      wx.showToast({ title: '分享成功！+10分', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: '分享失败', icon: 'none' });
    }
  },

  onShareAppMessage() {
    this.doShare();
    return {
      title: this.data.event.title,
      path: `/pages/event/event?id=${this.data.eventId}`,
      imageUrl: this.data.event.coverImage || ''
    };
  }
});
