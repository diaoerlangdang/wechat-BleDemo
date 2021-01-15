//index.js
//获取应用实例

var app = getApp()

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

Page({
  data: {
    bleList:[], //蓝牙设备数组
    scanBtnData:'开始扫描', //扫描标题
    scanBtnDisable: true,  //是否禁止扫描按钮
    isScanning: false, // 是否正在扫描
    isAvailable: false,

    isToasting: false,

    initSuccess: true, //初始化是否成功
  },
  onLoad: function () {
    console.log('onLoad index')

    this.monitorBleChange()

    this.initBle()

    var that = this
    setInterval(function () {

      //循环执行代码 
      if (!that.data.isAvailable && !that.data.isToasting) {

        //已经弹窗
        that.setData({
          isToasting: true
        })

        wx.showModal({
          title: '提示',
          content: '请打开蓝牙和GPS！',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {

              //没有弹窗
              that.setData({
                isToasting: false
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    }, 5000) //循环时间 这里是5秒 

    setInterval(function () {

      if (that.data.isScanning) {

        //停止扫描
        wx.stopBluetoothDevicesDiscovery({
          success: function (res) {
            // success
          }
        })


        setTimeout(function () {
          //要延时执行的代码 

          //开始扫描
          wx.startBluetoothDevicesDiscovery({
            allowDuplicatesKey: true,
            success: function (res) {
            }
          })
        }, 200) //延迟时间 这里是300ms 

      }

    }, 5000) //循环时间 这里是5秒 

  },

  //蓝牙监听
  monitorBleChange: function () {
    var that = this;

    //蓝牙状态更改，扫描状态更改，都会执行该函数
    wx.onBluetoothAdapterStateChange(function (res) {

      //若没有正在扫描，蓝牙是否可用
      if (!that.data.isScanning && res["available"]) {

        that.initBle()
      }
      else if (!res["available"]) {
        that.setData({
          scanBtnData: "开始扫描",
          isScanning: false,
          scanBtnDisable: true,
          isAvailable: false
        })
      }

    })

  },

  //初始化蓝牙
  initBle: function () {
    var that = this;

    // wx.onBluetoothAdapterStateChange(function(res) {
    //   console.log('adapterState changed, now is', res)
    //   })

    //打开蓝牙适配器
    wx.openBluetoothAdapter({
      success: function(res){

        //使能按钮
        that.setData({
          scanBtnData: "开始扫描",
          isScanning: false,
          scanBtnDisable: false,
          isAvailable: true
        })
        
        //监听扫描
        wx.onBluetoothDeviceFound(function(res) {

          console.log(res)
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
        allowDuplicatesKey:true,
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

    this.setData({
      scanBtnData: '开始扫描',
      isScanning: false,
    })
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        // success
      }
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
  }

})
