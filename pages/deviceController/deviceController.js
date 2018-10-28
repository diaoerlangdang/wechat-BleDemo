//deviceController.js
//获取应用实例
//wuruizhi

var app = getApp()
Page({
  data: {
      dataList:[{dataType:"其他",content:"正在连接。。。"}],
      receiveType:"接收",
      sendType:"发送",
      otherType:"其他",
      inputData:"",
      serviceId:"0000FFF0-0000-1000-8000-00805F9B34FB",
      receiveId:"0000FFF1-0000-1000-8000-00805F9B34FB",
      "sendId":"0000FFF2-0000-1000-8000-00805F9B34FB",
      // serviceId:"0000fff0-0000-1000-8000-00805f9b34fb",
      // receiveId:"0000fff1-0000-1000-8000-00805f9b34fb",
      // "sendId":"0000fff2-0000-1000-8000-00805f9b34fb",
  },
  onLoad: function (options) {
    var device = app.globalData.selectDevice
    var that = this;
    wx.setNavigationBarTitle({
      title: device.name,
      success: function(res) {
        // success
      }
    })

    //监听连接
    wx.onBLEConnectionStateChanged(function(res) {
      console.log('state changed ', res)
      if(!res.connected) {
        that.addData({dataType:"其他",content:"连接已断开"})
      }
    })

    wx.createBLEConnection({
      deviceId: device.deviceId,
      success: function(res){ 
        // success
        console.log('createBLEConnection')
        that.addData({dataType:"其他",content:"连接成功，正在扫描服务。。。"})
        that.getServiceAndCharacteristics(device)

      },
      fail: function(res) {
        that.addData({dataType:"其他",content:"连接失败"})
      }
    })

  },

  //页面销毁时调用
  onUnload: function () {
    wx.closeBLEConnection({
      deviceId:app.globalData.selectDevice.deviceId,
      success: function(res){
        // success
      }
    })
  },

  //input输入
  bindInputData: function (e) {
    this.setData({
      inputData: e.detail.value
    })
  },

  //发送按钮
  bindSend: function () {
    var that = this
    var device = app.globalData.selectDevice
    console.log('发送按钮',device)

    var tempSendData = this.data.inputData
    var buffer = this.stringToHexBuffer(data)

    wx.writeBLECharacteristicValue({
      deviceId: device.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.sendId,
      value: buffer,
      success: function (res) {
        // success
        console.log('write success:', res)
        that.addData({ dataType: "发送", content: data })
      },
      fail: function (res) {
        // fail
        console.log('write failed:', res)
        that.addData({ dataType: "其他", content: '发送失败' })
      },
      complete: function (res) {
        // complete
        console.log('write', res)
      }
    })
    
  },

  //发送数据
  // sendData:function (data) {

  //   var that = this
  //   var device = app.globalData.selectDevice
  //   var buffer = this.stringToHexBuffer(data)
  //   return new Promise(function (resolve, reject) {

      

  //   })
  // },

  //获取服务
  getServiceAndCharacteristics: function (device) {
    var that = this
    wx.getBLEDeviceServices({
        deviceId: device.deviceId,
        success: function(res){
          console.log('服务',res)
          // success
          
          wx.getBLEDeviceCharacteristics({
            deviceId: device.deviceId,
            serviceId: that.data.serviceId,
            success: function(res){
              console.log('特征',res)

              that.addData({dataType:"其他",content:'扫描成功，正在打开通知。。。'})

              //监听通知
              wx.onBLECharacteristicValueChange(function(res) {
                // callback
                console.log('value change', res)
                const hex = that.buf2hex(res.value)
                console.log('返回的数据：', hex)
                that.addData({dataType:"接收",content:hex})
              })

              wx.notifyBLECharacteristicValueChanged({
                deviceId: device.deviceId,
                serviceId: that.data.serviceId,
                characteristicId: that.data.receiveId,
                state: true,
                success: function(res){
                  // success
                  console.log('notify', res)
                  that.addData({dataType:"其他",content:'打开通知成功'})
                },
                fail: function(res) {
                  console.log('失败',res)
                }
              })
        
            }
          })

        },
        fail: function(res) {
          console.log('服务扫描失败',res)
        }
      })
  },

  //添加数据
  addData:function (data) {
    var temp = this.data.dataList;

    temp.push(data)
    this.setData({
        dataList:temp
    })
  },

  //字符串转buffer 十六进制
  stringToHexBuffer: function (data) {
    // var data = 'AA5504B10000B5'
    var typedArray = new Uint8Array(data.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
    }))

    return typedArray.buffer
  },

  buf2hex: function (buffer) { // buffer is an ArrayBuffer
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    },

  //字符串转arraybuffer
  char2buf: function (str) {
    var out = new ArrayBuffer(str.length*2);
    var u16a= new Uint16Array(out);
    var strs = str.split("");
    for(var i =0 ; i<strs.length;i++){
        u16a[i]=strs[i].charCodeAt();
    }
    return out;
  },

  //arraybuffer 转字符串
  buf2char: function (buf) {
    var out="";
    var u16a = new Uint16Array(buf);
    var single ;
    for(var i=0 ; i < u16a.length;i++){
        single = u16a[i].toString(16)
        while(single.length<4) single = "0".concat(single);
        out+="\\u"+single;
    }
    return out//eval("'"+out+ "'");
  }

  

  

})