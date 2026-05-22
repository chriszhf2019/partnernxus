const { storeAPI, scoreAPI } = require('../../utils/api');

Page({
  data: { totalScore: 0, gifts: [], orders: [] },

  onShow() { this.loadData(); },

  async loadData() {
    try {
      const [score, gifts, orders] = await Promise.all([
        scoreAPI.myScore(), storeAPI.gifts(), storeAPI.orders()
      ]);
      this.setData({ totalScore: score.total, gifts, orders });
    } catch (err) { /* 静默 */ }
  },

  async doRedeem(e) {
    const { id, name, cost } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认兑换',
      content: `确定使用 ${cost} 积分兑换「${name}」？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await storeAPI.redeem(id);
            wx.showToast({ title: '兑换成功！', icon: 'success' });
            this.loadData();
          } catch (err) {
            wx.showToast({ title: '兑换失败', icon: 'none' });
          }
        }
      }
    });
  }
});
