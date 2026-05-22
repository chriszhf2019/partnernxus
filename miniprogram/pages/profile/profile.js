const { userAPI, scoreAPI } = require('../../utils/api');
const { getUserProfile, getLocalUserInfo } = require('../../utils/auth');
const app = getApp();

Page({
  data: {
    userInfo: {},
    companyName: '',
    totalScore: 0,
    stats: {},
    searchText: '',
    searchResults: []
  },

  onShow() {
    this.setData({
      userInfo: getLocalUserInfo() || {},
      companyName: app.globalData.companyName || '',
      totalScore: 0
    });
    this.loadData();
  },

  async loadData() {
    try {
      const [profile, score] = await Promise.all([userAPI.profile(), scoreAPI.myScore()]);
      this.setData({
        stats: profile.stats || {},
        totalScore: score.total
      });
    } catch (err) { /* 静默 */ }
  },

  // 搜索公司
  onSearch(e) {
    const text = e.detail.value;
    this.setData({ searchText: text });
    if (text.length < 2) { this.setData({ searchResults: [] }); return; }
    // 模拟搜索
    this.setData({
      searchResults: [
        { id: 'PRA-073576', name: '北京网联信通', type: 'Gold' },
        { id: 'PRA-088088', name: '苏州新研联', type: 'Platinum' },
      ].filter(c => c.name.includes(text))
    });
  },

  // 绑定公司
  async bindCompany(e) {
    const { id, name } = e.currentTarget.dataset;
    try {
      await userAPI.bindCompany(id);
      app.globalData.companyId = id;
      app.globalData.companyName = name;
      this.setData({ companyName: name, searchResults: [] });
      wx.showToast({ title: '绑定成功', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: '绑定失败', icon: 'none' });
    }
  },

  // 获取用户信息
  async getUserInfo() {
    try {
      const info = await getUserProfile();
      this.setData({ userInfo: info });
    } catch (err) {
      wx.showToast({ title: '需要授权', icon: 'none' });
    }
  },

  switchAccount() {
    wx.removeStorageSync('token');
    app.wxLogin().then(() => {
      wx.switchTab({ url: '/pages/index/index' });
    });
  },

  applyNew() {
    wx.showToast({ title: '请通过渠道经理申请', icon: 'none' });
  },

  about() {
    wx.showModal({
      title: 'PartnerNexus 渠道会',
      content: '版本 1.0.0\n合作伙伴会议管理平台\n通过小程序邀请、签到、互动、积分兑换',
      showCancel: false
    });
  }
});
