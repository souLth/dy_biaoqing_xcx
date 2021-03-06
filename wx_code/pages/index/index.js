//index.js
//获取应用实例
import api from '../../utils/api.js';
import utils from '../../utils/util.js';
const app = getApp();

Page({
  data: {
    index: 1,
    userInfo: {},
    hasUserInfo: false,
    todayUpdate: [],
    recentUpdate: [],
    emoticon: [], // 表情包
    headPortrait: [],//头像
    backgroundImage: [],//背景图
    wallpaper: [],//壁纸
    hotEmoticon:[],
    hotHeadPortrait:[],
    hotBackgroundImage:[],
    hotWallpaper:[],
    allImgData: [],
    updateImg: 0,
    height: ''
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    });
  },
  onLoad: function () {
  },
  onReady: function () {
    var res = wx.getSystemInfoSync();
    console.log(res);
    this.setData({
      height: res.windowHeight + 'px'
    });
    wx.showLoading({
      title: 'loading'
    });
    this.searchTool = this.selectComponent('#searchTool');
    this.getAllImg();
  },
  showMoreDetail: function (e) {
    e.target.dataset.item.img =  e.target.dataset.item.img.split("?")[0]
    let imgItem = JSON.stringify(e.target.dataset.item);
    wx.navigateTo({
      url: `/pages/imagePanel/imagePanel?imgItem=${imgItem}`
    });
  },

  showMoreImg(e) {
    e.target.dataset.imgarr.forEach((item)=>{
      item.img = item.img.split("?")[0]
    })
    let imgarr = JSON.stringify(e.target.dataset.imgarr);
    let type = e.target.dataset.type;
    wx.navigateTo({
      url: `/pages/list/list?imgarr=${imgarr}&type=${type}`
    });
  },
  /**
   * 获取近期更新
   */
  getAllImg: function () {
    api.get(api.SERVER_PATH + api.IMGS).then(res => {
      res.data.forEach((item)=>{
        item.img = `${item.img}?imageView2/q/30`
      })
      res.data = res.data.reverse()
      wx.setStorageSync("all_img", res.data)
      api.get(api.SERVER_PATH + api.CLASSIFY).then(res1 => {
        let classifyArr = res1.data.map(item => item.classify_id)
        this.setData({
          emoticon: res.data.filter(item => item.classify_id === classifyArr[0]),
          headPortrait: res.data.filter(item => item.classify_id === classifyArr[1]),
          backgroundImage: res.data.filter(item => item.classify_id === classifyArr[2]),
          wallpaper: res.data.filter(item => item.classify_id === classifyArr[3]),
          hotEmoticon: res.data.filter(item => item.classify_id === classifyArr[0] && item.ishot),
          hotHeadPortrait: res.data.filter(item => item.classify_id === classifyArr[1] && item.ishot),
          hotBackgroundImage: res.data.filter(item => item.classify_id === classifyArr[2] && item.ishot),
          hotWallpaper: res.data.filter(item => item.classify_id === classifyArr[3] && item.ishot),
          allImgData: res.data
        })
        cososle.log(this.data)
      });
      wx.hideLoading();
    }).catch(res=>{
      console.log(res)
    });
  },

  getClassImg() {
    api.get(api.SERVER_PATH + api.CLASSIFY).then(res => {
      wx.hideLoading();
      this.setData({
        allData: res.data
      });
      console.log(this.data.allData);
    });
  },

  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function () { },
  onPullDownRefresh: function () { },
  onReachBottom: function () {
    console.log('下拉刷新')
    let allImgData = this.data.allImgData;
    if (this.data.updateImg > allImgData.length) return;
    this.setData({
      recentUpdate: this.data.recentUpdate.concat(allImgData.slice(this.data.updateImg, this.data.updateImg + 10)),
      updateImg: this.data.updateImg + 10
    });
  },
  openSearch: function () {
    this.searchTool.gotoSearch();
  }
});