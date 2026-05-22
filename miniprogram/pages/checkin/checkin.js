const { eventAPI } = require('../../utils/api');
const { getLocation } = require('../../utils/auth');
const app = getApp();

Page({
  data: {
    checkedIn: false,
    eventName: '',
    checkinTime: '',
    companyName: '',
    userName: '',
    eventId: ''
  },

  onLoad(options) {
    if (options.eventId) {
      this.setData({ eventId: options.eventId });
    }
  },

  async startScan() {
    try {
      const res = await new Promise((resolve, reject) => {
        wx.scanCode({
          onlyFromCamera: true,
          scanType: ['qrCode'],
          success: resolve,
          fail: reject
        });
      });

      wx.showLoading({ title: '签到中...' });

      // 解析二维码数据获取 eventId
      let eventId = this.data.eventId;
      try {
        const qrData = JSON.parse(res.result);
        eventId = qrData.eventId || eventId;
      } catch (e) { /* 非JSON二维码 */ }

      // 获取位置
      let location;
      try { location = await getLocation(); } catch (e) { /* 位置可选 */ }

      // 调用签到接口
      await eventAPI.checkin(eventId, location);

      wx.hideLoading();
      this.setData({
        checkedIn: true,
        eventName: qrData.eventName || '当前活动',
        checkinTime: new Date().toLocaleString(),
        companyName: app.globalData.companyName || '未知公司',
        userName: (app.globalData.userInfo && app.globalData.userInfo.nickName) || '用户'
      });

    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '签到失败', icon: 'none' });
    }
  },

  goEvent() {
    if (this.data.eventId) {
      wx.redirectTo({ url: `/pages/event/event?id=${this.data.eventId}` });
    } else {
      wx.switchTab({ url: '/pages/index/index' });
    }
  }
});
