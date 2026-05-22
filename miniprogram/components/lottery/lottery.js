Component({
  properties: {
    participants: { type: Number, value: 0 },
    participantNames: { type: Array, value: [] },
    prizes: { type: Array, value: ['一等奖', '二等奖', '三等奖'] }
  },
  data: {
    spinning: false,
    showResult: false,
    currentIndex: 0,
    rollingNames: [],
    winner: '',
    prize: '',
    intervalId: null
  },
  methods: {
    startSpin() {
      if (this.data.participantNames.length === 0) {
        wx.showToast({ title: '无参与者', icon: 'none' });
        return;
      }
      const rolling = [...this.data.participantNames, ...this.data.participantNames, ...this.data.participantNames];
      this.setData({ spinning: true, rollingNames: rolling, currentIndex: 0 });

      const interval = setInterval(() => {
        this.setData({ currentIndex: (this.data.currentIndex + 1) % rolling.length });
      }, 50);
      this.setData({ intervalId: interval });
    },

    stopSpin() {
      clearInterval(this.data.intervalId);
      const idx = Math.floor(Math.random() * this.data.participantNames.length);
      const winner = this.data.participantNames[idx];
      const prize = this.data.prizes[Math.floor(Math.random() * this.data.prizes.length)];
      this.setData({ spinning: false, showResult: true, winner, prize });
      this.triggerEvent('result', { winner, prize });
    },

    reset() {
      this.setData({ spinning: false, showResult: false, winner: '', prize: '' });
    }
  }
});
