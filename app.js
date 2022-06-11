// app.js
const Default_Data_Main_Service = '0000FFF0-0000-1000-8000-00805F9B34FB'
const Default_Data_Send_Characteristic = '0000FFF2-0000-1000-8000-00805F9B34FB'
const Default_Data_Receive_Characteristic = '0000FFF1-0000-1000-8000-00805F9B34FB'
App({
  onLaunch() {
    //调用API从本地缓存中获取数据
    this.globalData.isBleHex = wx.getStorageSync('isBleHex')
    const scanFilter = wx.getStorageSync('isScanFilter')
    if (scanFilter === '') {
      this.globalData.isScanFilter = true
    } else {
      this.globalData.isScanFilter = scanFilter
    }

    const dataMainService = wx.getStorageSync('dataMainService')
    if (dataMainService) {
      this.globalData.dataMainService = dataMainService
    }

    const dataReceiveCharacteristic = wx.getStorageSync('dataReceiveCharacteristic')
    if (dataReceiveCharacteristic) {
      this.globalData.dataReceiveCharacteristic = dataReceiveCharacteristic
    }

    const dataSendCharacteristic = wx.getStorageSync('dataSendCharacteristic')
    if (dataSendCharacteristic) {
      this.globalData.dataSendCharacteristic = dataSendCharacteristic
    }
  },
  globalData: {
    // true--数据模式， false--配置模式
    isBleConfig: false,
    // true--十六进制， false--Ascii
    isBleHex: false,
    isScanFilter: true,
    selectDevice:null,
    // 是否支持配置模式
    isSuppotConfig: false,
    // 数据主服务
    dataMainService: Default_Data_Main_Service,
    dataReceiveCharacteristic: Default_Data_Receive_Characteristic,
    dataSendCharacteristic: Default_Data_Send_Characteristic,
  },

  setDataMainService(serviceId) {
    wx.setStorageSync('dataMainService', serviceId.toUpperCase())
    this.globalData.dataMainService = serviceId.toUpperCase();
  },
  setDataReceiveCharacteristic(receiveId) {
    wx.setStorageSync('dataReceiveCharacteristic', receiveId.toUpperCase())
    this.globalData.dataReceiveCharacteristic = receiveId.toUpperCase();
  },
  setDataSendCharacteristic(sendId) {
    wx.setStorageSync('dataSendCharacteristic', sendId.toUpperCase())
    this.globalData.dataSendCharacteristic = sendId.toUpperCase();
  },
  // 清除数据服务，恢复默认
  clearDataService() {
    wx.removeStorageSync('dataMainService')
    wx.removeStorageSync('dataReceiveCharacteristic')
    wx.removeStorageSync('dataSendCharacteristic')

    this.globalData.dataMainService = Default_Data_Main_Service
    this.globalData.dataReceiveCharacteristic = Default_Data_Receive_Characteristic
    this.globalData.dataSendCharacteristic = Default_Data_Send_Characteristic
  },

  setBleHex(bleHex) {
    wx.setStorageSync('isBleHex', bleHex)
    this.globalData.isBleHex = bleHex;
  },
  setScanFilter(scanFilter) {
    wx.setStorageSync('isScanFilter', scanFilter)
    this.globalData.isScanFilter = scanFilter;
  },

  setBleConfig(bleConfig) {
    this.globalData.isBleConfig = bleConfig;
  }
})
