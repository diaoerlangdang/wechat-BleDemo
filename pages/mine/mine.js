// pages/mine/mine.js
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

    // 扫描过滤
    scanFilter: true,
    version: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let accountInfo = wx.getAccountInfoSync(); 
    let version = accountInfo.miniProgram.version;
    this.setData({
      version: version,
      scanFilter: app.globalData.isScanFilter
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  // 切换扫描过滤
  changeScanFilter() {
    const newState = !this.data.scanFilter
    this.setData({
      scanFilter: newState
    })
    app.setScanFilter(newState)
  },

  // 设置数据服务
  setDataService() {
    wx.navigateTo({
      url: '../setService/setService',
    })
  },

  // 关于我们
  aboutUs() {
    wx.navigateTo({
      url: '../about/about',
    })
  }

})