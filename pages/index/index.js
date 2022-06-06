// index.js
// 获取应用实例
const app = getApp()
const util = require('../../utils/util')

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

  onLoad() {
    
    this.monitorBleChange()

    this.initBle()

    setInterval(() => {

      //循环执行代码 
      if (!this.data.isAvailable && !this.data.isToasting) {

        //已经弹窗
        this.setData({
          isToasting: true
        })

        wx.showModal({
          title: '提示',
          content: '请打开蓝牙和GPS！',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {

              //没有弹窗
              this.setData({
                isToasting: false
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    }, 5000) //循环时间 这里是5秒 

    setInterval(() => {

      if (this.data.isScanning) {

        //停止扫描
        wx.stopBluetoothDevicesDiscovery({
          success: (res) => {
            // success
          }
        })


        setTimeout(() => {
          //要延时执行的代码 

          //开始扫描
          wx.startBluetoothDevicesDiscovery({
            allowDuplicatesKey: true,
            success: (res) => {
            }
          })
        }, 200) //延迟时间 这里是300ms 
      }
    }, 5000) //循环时间 这里是5秒 
  },

  onHide() {
    if (this.data.isScanning) {
      this.scan();
    }
  },


  //蓝牙监听
  monitorBleChange() {
    //蓝牙状态更改，扫描状态更改，都会执行该函数
    wx.onBluetoothAdapterStateChange((res) => {

      //若没有正在扫描，蓝牙是否可用
      if (!this.data.isScanning && res.available) {

        this.initBle()
      }
      else if (!res.available) {
        this.setData({
          scanBtnData: "开始扫描",
          isScanning: false,
          scanBtnDisable: true,
          isAvailable: false
        })
      }
    })
  },

  //初始化蓝牙
  initBle () {
    // wx.onBluetoothAdapterStateChange(function(res) {
    //   console.log('adapterState changed, now is', res)
    //   })

    //打开蓝牙适配器
    wx.openBluetoothAdapter({
      success: (res) => {

        //使能按钮
        this.setData({
          scanBtnData: "开始扫描",
          isScanning: false,
          scanBtnDisable: false,
          isAvailable: true
        })
        
        //监听扫描
        wx.onBluetoothDeviceFound((res) => {
          if (res.devices[0].name.startsWith('HJ')) {
            console.log('onBluetoothDeviceFound', res)
          }
          
          // res电脑模拟器返回的为数组；手机返回的为蓝牙设备对象
          if (res instanceof Array) {
            // console.log("数组")
            this.updateBleList(res)
          }
          else {
            // console.log("对象")
            this.updateBleList([res])
          }

        })

      },
      fail:(res) => {
        // fail
        console.log('fail', res)
      },
      complete:(res) => {
        // complete
      }
    })
  },

  //扫描
  scan(view) {
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
        success: (res) => {
        }
      })
    }
    else {
      this.setData({
        scanBtnData: scanTitle,
        isScanning: false,
      })
      wx.stopBluetoothDevicesDiscovery({
        success:(res) =>{
          // success
        }
      })
    }    
  },

  //点击设备
  onSelectedDevice (view) {
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
      success: (res) => {
        // success
      }
    })
  },

  //更新数据 devices为数组类型
  updateBleList(devices) {
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
        
        // 过滤
        if (tempDevice.name == '') {
          continue
        }
        if (tempDevice.advertisServiceUUIDs.length == 1) {
          if (!tempDevice.advertisServiceUUIDs[0].toUpperCase().startsWith("00006958")) {
            continue
          }
        }
        else if (tempDevice.advertisServiceUUIDs.length == 4) {
          if (!tempDevice.advertisServiceUUIDs[0].toUpperCase().startsWith("00006958") &&
              !tempDevice.advertisServiceUUIDs[0].toUpperCase().startsWith("00006959")) {
                continue
          }
        }
        else {
          continue;
        }

        if (!this.isExist(tempDevice)) {
          newData.push(tempDevice)
        }
      }
      // console.log(newData)
      this.setData({
        bleList:newData
      })
  },

  //是否已存在 存在返回true 否则false
  isExist(device) {
    var tempData = this.data.bleList
    for(var i=0; i<tempData.length; i++) {
        if (tempData[i].deviceId == device.deviceId) {
          return true
        }
      }
      return false
  }
})
