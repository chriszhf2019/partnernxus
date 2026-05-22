const { scoreAPI } = require('../../utils/api');

Page({
  data: {
    totalScore: 0,
    scoreLevel: 'bronze',
    scoreLevelText: '铜牌',
    nextLevelScore: 100,
    scoreDetail: {},
    activeTab: 'earn',
    records: [],
    rules: [
      { action: '报名参会', points: 20 },
      { action: '到场签到', points: 30 },
      { action: '提问互动', points: 15, note: '/次' },
      { action: '转发分享', points: 10, note: '/次' },
      { action: '邀请到场', points: 40, note: '/人' },
    ]
  },

  onShow() { this.loadData(); },

  async loadData() {
    try {
      const score = await scoreAPI.myScore();
      const level = this.calcLevel(score.total);
      this.setData({
        totalScore: score.total,
        scoreLevel: level.badge,
        scoreLevelText: level.text,
        nextLevelScore: level.next,
        scoreDetail: score.detail || {}
      });
      this.loadRecords();
    } catch (err) { /* 静默 */ }
  },

  async loadRecords() {
    try {
      const data = await scoreAPI.history();
      const records = data.filter(r => this.data.activeTab === 'earn' ? r.type === 'earn' : r.type === 'spend');
      this.setData({ records });
    } catch (err) { /* 静默 */ }
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
    this.loadRecords();
  },

  calcLevel(score) {
    if (score >= 500) return { badge: 'gold', text: '金牌', next: 0 };
    if (score >= 200) return { badge: 'gold', text: '金牌', next: 500 - score };
    if (score >= 100) return { badge: 'silver', text: '银牌', next: 200 - score };
    return { badge: 'bronze', text: '铜牌', next: 100 - score };
  }
});
