// pages/set/set.js
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    characterTypeList: [
      {
        name: 'Hex',
        value: true,
      }, 
      {
        name: 'ASCII',
        value: false,
      }
    ],
    modeTypeList: [
      {
        name: '数据模式',
        value: false,
      }, 
      {
        name: '配置模式',
        value: true,
      }
    ],
    // 字符
    showCharacter: false,
    // 模式
    showMode: false,

    characterStr: 'Hex',
    modeStr: '数据模式',

    isSuppotConfig: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      isSuppotConfig: app.globalData.isSuppotConfig
    }) 
    let info = this.data.modeTypeList.find((item)=> app.globalData.isBleConfig == item.value);
    if (info) {
      this.setData({
        modeStr: info.name
      })
    }

    info = this.data.characterTypeList.find((item)=> app.globalData.isBleHex == item.value);
    if (info) {
      this.setData({
        characterStr: info.name
      })
    }
  },

  showCharacterPicker() {
    this.setData({
      showCharacter: true,
    })
  },

  showModePicker() {
    this.setData({
      showMode: true,
    })
  },

  onCancelSelectCharacter() {
    this.setData({
      showCharacter: false,
    })
  },

  // 切换字符
  onConfirmSelectCharacter(event) {
    this.setData({
      characterStr: event.detail.name
    })

    app.setBleHex(event.detail.value)
  },

  onCancelSelectMode() {
    this.setData({
      showMode: false,
    })
  },

  // 切换模式
  onConfirmSelectMode(event) {
    this.setData({
      modeStr: event.detail.name
    })

    app.setBleConfig(event.detail.value)
  },

})