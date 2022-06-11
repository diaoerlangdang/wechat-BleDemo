// pages/setService/setService.js

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mainService: '',
    receiveCharacteristic: '',
    sendCharacteristic: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      mainService: app.globalData.dataMainService,
      receiveCharacteristic: app.globalData.dataReceiveCharacteristic,
      sendCharacteristic: app.globalData.dataSendCharacteristic
    })
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

  verifyServiceUUID(serviceId) {
    const patrn=/^([0-9a-fA-F]{8})-([0-9a-fA-F]{4})-([0-9a-fA-F]{4})-([0-9a-fA-F]{4})-([0-9a-fA-F]{12})$/;

    return patrn.test(serviceId)
  },

  save() {
    if (!this.verifyServiceUUID(this.data.mainService)) {
      wx.showToast({
        title: '主服务格式不正确',
        icon: 'none'
      })
      return
    }
    if (!this.verifyServiceUUID(this.data.receiveCharacteristic)) {
      wx.showToast({
        title: '通知服务格式不正确',
        icon: 'none'
      })
      return
    }
    if (!this.verifyServiceUUID(this.data.sendCharacteristic)) {
      wx.showToast({
        title: '发送服务格式不正确',
        icon: 'none'
      })
      return
    }
    app.setDataMainService(this.data.mainService)
    app.setDataReceiveCharacteristic(this.data.receiveCharacteristic)
    app.setDataSendCharacteristic(this.data.sendCharacteristic)

    wx.navigateBack()
  },

  resetDefault() {
    app.clearDataService()
    wx.navigateBack()
  }
})