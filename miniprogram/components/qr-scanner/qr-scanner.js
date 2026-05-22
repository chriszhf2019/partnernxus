Component({
  properties: {
    autoStart: { type: Boolean, value: false }
  },
  methods: {
    startScan() {
      wx.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode'],
        success: (res) => {
          this.triggerEvent('scan', { result: res.result });
        },
        fail: (err) => {
          this.triggerEvent('error', { error: err });
        }
      });
    }
  }
});
