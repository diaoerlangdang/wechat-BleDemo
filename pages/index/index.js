//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    bleList:[], //蓝牙设备数组
    scanBtnData:'开始扫描', //扫描标题
    scanBtnDisable: true,  //是否禁止扫描按钮
    isScanning: false, // 是否正在扫描
    serviceId: "0000FFF0-0000-1000-8000-00805F9B34FB",
    initSuccess: true, //初始化是否成功
  },
  onLoad: function () {
    
    this.initBle()

    console.log(this.getServiceId())
  },

  //初始化蓝牙
  initBle: function () {
    var that = this;

    wx.onBluetoothAdapterStateChange(function(res) {
      console.log('adapterState changed, now is', res)
      })

    //打开蓝牙适配器
    wx.openBluetoothAdapter({
      success: function(res){

        //使能按钮
        that.setData({
          scanBtnDisable: false
        })
        
        //监听扫描
        wx.onBluetoothDeviceFound(function(res) {

          // res电脑模拟器返回的为数组；手机返回的为蓝牙设备对象
          if (res instanceof Array) {
            // console.log("数组")
            that.updateBleList(res)
          }
          else {
            // console.log("对象")
            that.updateBleList([res])
          }

        })

      },
      fail: function(res) {
        // fail
        console.log(res)
      },
      complete: function(res) {
        // complete
      }
    })
  },

  //扫描
  scan: function (view) {
    var that = this;

    var scanTitle = "开始扫描"
    if (this.data.scanBtnData == scanTitle) {
      scanTitle = "停止扫描"

      this.setData({
        scanBtnData: scanTitle,
        isScanning: true,
        bleList: [],
      })

      //开始扫描
      wx.startBluetoothDevicesDiscovery({
        success: function(res){
        }
      })
    }
    else {
      this.setData({
        scanBtnData: scanTitle,
        isScanning: false,
      })
      wx.stopBluetoothDevicesDiscovery({
        success: function(res){
          // success
        }
      })
    }    
  },

  //点击设备
  onSelectedDevice: function (view) {
    var index = view.currentTarget.dataset.index
    var device = this.data.bleList[index]
    app.globalData.selectDevice = device

    wx.navigateTo({
      url: '../deviceController/deviceController'
    })
  },

  //更新数据 devices为数组类型
  updateBleList: function(devices) {
      var newData = this.data.bleList
      var tempDevice = null;
      for(var i=0; i<devices.length; i++) {
        //ios设备
        if (devices[i].devices != null) {
          if (devices[i].devices.length > 0) {
            tempDevice = devices[i].devices[0];
          }
          else {
            continue
          }
        }
        //安卓
        else {
          tempDevice = devices[i];
        }
        if (!this.isExist(tempDevice)) {
          newData.push(tempDevice)
        }
      }
      console.log(newData)
      this.setData({
        bleList:newData
      })
  },

  //是否已存在 存在返回true 否则false
  isExist: function(device) {
    var tempData = this.data.bleList
    for(var i=0; i<tempData.length; i++) {
        if (tempData[i].deviceId == device.deviceId) {
          return true
        }
      }
      return false
  },

  //服务id
  getServiceId: function () {

    var platform = app.globalData.platform

    //ios 平台 服务id 中字母必须为大写
    if (platform == "ios") {
      return this.data.serviceId.toUpperCase();
    }
    //android 平台 服务id 中字母必须为小写
    else if (platform == "android") {
      return this.data.serviceId.toLowerCase();
    }
    else {
      return this.data.serviceId
    }
  },

})
