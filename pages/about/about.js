//about.js
//获取应用实例
var app = getApp()
Page({
  data: {
    
  },
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: "关于我们",
      success: function(res) {
        // success
      }
    })

  }
})