// app.js
App({
  onLaunch() {
    //调用API从本地缓存中获取数据
    this.globalData.isBleHex = wx.getStorageSync('isBleHex')
  },
  globalData: {
    // true--数据模式， false--配置模式
    isBleConfig: false,
    // true--十六进制， false--Ascii
    isBleHex: false,
    selectDevice:null,
    // 是否支持配置模式
    isSuppotConfig: false,
  },

  setBleHex(bleHex) {
    wx.setStorageSync('isBleHex', bleHex)
    this.globalData.isBleHex = bleHex;
  },

  setBleConfig(bleConfig) {
    this.globalData.isBleConfig = bleConfig;
  }
})
