// pages/deviceController/deviceController.js

var app = getApp()
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList:[{dataType:"其他",content:"正在连接。。。"}],
    receiveType:"接收",
    sendType:"发送",
    otherType:"其他",
    inputData:"",
    inputPlaceholder: '请输入十六进制数',

    // 没包发送的最大数
    sendGroupMaxLen: 20,

    sendByteLen: 0, // 已发送的字节数长度
    receiveByteLen: 0, // 已接收的字节数长度
    receiveSpeed: 0, // 实时速率，每秒接收字节数
    recLenBySecond: 0, // 计算速率使用

    serviceId:"0000FFF0-0000-1000-8000-00805F9B34FB",
    receiveId:"0000FFF1-0000-1000-8000-00805F9B34FB",
    sendId:"0000FFF2-0000-1000-8000-00805F9B34FB",
    
    configServiceId: "0000FFF0-0000-1000-8000-00805F9B34FB",
    configReceiveId:"0000FFF3-0000-1000-8000-00805F9B34FB",
    configSendId:"0000FFF3-0000-1000-8000-00805F9B34FB",
    // serviceId:"0000fff0-0000-1000-8000-00805f9b34fb",
    // receiveId:"0000fff1-0000-1000-8000-00805f9b34fb",
    // "sendId":"0000fff2-0000-1000-8000-00805f9b34fb",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 复位
    app.globalData.isSuppotConfig = false;
    app.setBleConfig(false)

    this.setData({
      serviceId: app.globalData.dataMainService,
      receiveId: app.globalData.dataReceiveCharacteristic,
      sendId: app.globalData.dataSendCharacteristic
    })

    var device = app.globalData.selectDevice
    wx.setNavigationBarTitle({
      title: device.name,
      success:(res) =>{
        // success
      }
    })

    //监听连接
    wx.onBLEConnectionStateChanged((res) => {
      console.log('state changed ', res)
      if(!res.connected) {
        this.addData({dataType:"其他",content:"连接已断开"})
      }
    })

    wx.createBLEConnection({
      deviceId: device.deviceId,
      success: (res) =>{ 
        // success
        console.log('createBLEConnection')
        this.addData({dataType:"其他",content:"连接成功，正在扫描服务。。。"})
        this.getServiceAndCharacteristics(device)

      },
      fail:(res) => {
        console.log('createBLEConnection 失败  ', res)
        this.addData({dataType:"其他",content:"连接失败"})
      }
    })

    this.startComputeSpeedTimer();
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
    if (app.globalData.isBleHex) {
      this.setData({
        inputPlaceholder: '请输入十六进制数'
      })
    }else {
      this.setData({
        inputPlaceholder: '请输入字符数据'
      })
    }
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
    wx.closeBLEConnection({
      deviceId:app.globalData.selectDevice.deviceId,
      success: (res) => {
        // success
      }
    })
  },

  // 开始计算速率
  startComputeSpeedTimer() {
    setInterval(() => {
      this.setData({
        receiveSpeed: this.data.recLenBySecond,
        recLenBySecond: 0,
      })
    }, 1000) //循环时间 这里是1秒 
  },

  //input输入
  bindInputData(e) {
    this.setData({
      inputData: e.detail.value
    })
  },

  // 清空列表
  bindClearAll() {
    this.setData({
      dataList:[],
      sendByteLen: 0, // 已发送的字节数长度
      receiveByteLen: 0, // 已接收的字节数长度
    })
  },

  // 设置
  bindSet() {
    wx.navigateTo({
      url: '../set/set',
    })
  },

  //发送按钮
  bindSend() {
    // var device = app.globalData.selectDevice

    const sendGroupMaxLen = this.data.sendGroupMaxLen

    let tempSendData = this.data.inputData
    let sendDataLen = 0;
    // 十六进制
    if (app.globalData.isBleHex) {
      // 必须是偶数
      if (tempSendData.length % 2 != 0) {
        return
      }
      const buffer = util.stringToHexBuffer(tempSendData)
      sendDataLen = buffer.byteLength
    } else {
      const buffer = util.char2buf(tempSendData);
      sendDataLen = buffer.byteLength
      tempSendData = util.ab2hex(buffer)
    }

    this.setData({
      sendByteLen: this.data.sendByteLen + sendDataLen,
    })
    
    var p = new Promise((resolve, reject) => {
      console.log('开始 new Promise...');
      resolve(tempSendData);
    });

    var count = parseInt((tempSendData.length + sendGroupMaxLen*2 - 1)/(sendGroupMaxLen*2))
    for(var i=0; i<count; i++) {
      p = p.then(this.sendData)
    }

    p.then((resolve, reject) => {
      this.addData({ dataType: "发送", content: this.data.inputData })
    }).catch((reason) => {
      console.log('失败了了,' + reason)
      this.addData({ dataType: "其他", content: '发送失败' })
    })
    
  },

  //发送数据
  sendData(data) {

    var device = app.globalData.selectDevice
    const sendGroupMaxLen = this.data.sendGroupMaxLen

    //前20个字节
    var before = data.substring(0, sendGroupMaxLen*2)
    var after = data.substring(sendGroupMaxLen*2)

    console.log('发送数据'+before)

    var buffer = util.stringToHexBuffer(before)
    return new Promise((resolve, reject) => {

      let serviceId = this.data.serviceId;
      let characteristicId = this.data.sendId;
      // 配置模式
      if (app.globalData.isBleConfig) {
        serviceId = this.data.configServiceId;
        characteristicId = this.data.configSendId;
      }

      wx.writeBLECharacteristicValue({
        deviceId: device.deviceId,
        serviceId,
        characteristicId,
        value: buffer,
        success: (res) => {
          // success
          console.log('write success:', res)
          resolve(after)
        },
        fail: (res) => {
          // fail
          console.log('write failed:', res)
          reject('发送失败')
        },
        complete: (res) => {
          // complete
        }
      })
    })
  },

  //获取服务
  getServiceAndCharacteristics(device) {
    //监听通知
    wx.onBLECharacteristicValueChange((res) => {      
      this.setData({
        receiveByteLen: this.data.receiveByteLen + res.value.byteLength,
        recLenBySecond: this.data.recLenBySecond + res.value.byteLength,
      })
      if (app.globalData.isBleHex) {
        const hex = util.ab2hex(res.value)
        console.log('返回的Hex数据：', hex)
        this.addData({dataType:"接收",content:hex})
      } else {
        const info = util.buf2char(res.value)
        console.log('返回的字符数据：', info)
        this.addData({dataType:"接收",content:info})
      }
    })

    wx.getBLEDeviceServices({
        deviceId: device.deviceId,
        success:(res) => {
          console.log('服务',res)
          // success
          
          wx.getBLEDeviceCharacteristics({
            deviceId: device.deviceId,
            serviceId: this.data.serviceId,
            success:(res) => {
              console.log('特征',res)

              this.addData({dataType:"其他",content:'扫描成功，正在打开数据服务通知。。。'})

              wx.notifyBLECharacteristicValueChanged({
                deviceId: device.deviceId,
                serviceId: this.data.serviceId,
                characteristicId: this.data.receiveId,
                state: true,
                success: (res) => {
                  // success
                  console.log('notify', res)
                  this.addData({dataType:"其他",content:'打开数据服务通知成功'})
                },
                fail:(res) => {
                  this.addData({dataType:"其他",content:'打开数据服务通知失败'})
                  console.log('失败',res)
                }
              })
            }
          })

          // 配置服务
          wx.getBLEDeviceCharacteristics({
            deviceId: device.deviceId,
            serviceId: this.data.configServiceId,
            success:(res) => {

              const info = res.characteristics.find((item) => item.uuid.toString().toUpperCase() == this.data.configReceiveId.toUpperCase())
              // 是否包含配置服务
              if (info) {
                wx.notifyBLECharacteristicValueChanged({
                  deviceId: device.deviceId,
                  serviceId: this.data.configServiceId,
                  characteristicId: this.data.configReceiveId,
                  state: true,
                  success: (res) => {
                    // success
                    this.addData({dataType:"其他",content:'打开配置服务通知成功'})
                    app.globalData.isSuppotConfig = true;
                  },
                  fail:(res) => {
                    console.log('失败',res)
                  }
                })
              }

              
            }
          })

          wx.onBLEMTUChange(res => {
            this.setData({
              sendGroupMaxLen: res.mtu
            })
          })

          // 需要获取mtu
          if (device.bRefreshMtu) {
            wx.setBLEMTU({
              deviceId: device.deviceId,
              mtu: 512,
              // success: (res)=> {
              //   console.log('setBLEMTU ', res)
              // },
              // fail: (res) => {
              //   console.log('setBLEMTU  fail ', res)
              // }
            })
          }
        },
        fail:(res)=> {
          console.log('服务扫描失败',res)
        }
      })
  },

  //添加数据
  addData (data) {
    var temp = this.data.dataList;

    temp.push(data)
    this.setData({
        dataList:temp
    })
  },
})