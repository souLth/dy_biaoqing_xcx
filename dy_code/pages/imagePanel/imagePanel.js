// pages/imagePanel/imagePanel.js
import api from '../../utils/api.js';
import utils from '../../utils/util.js';
import apis from '../../utils/apis.js';

const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    selectUrl: '',
    isCollect: false,
    imgData: [],
    openId: null,
    percent_n: 0,
    imgItem: null,
    parseImgItem: null
  },

  //发放激励广告奖励
  addAdPlayerHistory() {
    var that = this
    console.log('广告已经看完，直接给激励')
    apis.addAdPlayerHistory({
      //推广者的id
      promote_user_id: tt.promote_user_id || 0,
      //产品id
      product_id: 0,
      token: tt.token
    }).then(res => {
      if (res.code == 200) {
        console.log('激励奖励领取成功')
      } else {

      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let imgItem = JSON.parse(options.imgItem);
    console.log(imgItem)
    imgItem.img = `${imgItem.img}?imageView2/q/30`
    this.setData({
      imgItem: options.imgItem,
      parseImgItem: imgItem
    })
    this.setData({
      selectUrl: imgItem.img
    })
    if (wx.getStorageSync('userData')) {
      this.setData({
        openId: wx.getStorageSync('userData').openId
      })
      this.getCollectImg(imgItem.img_id, wx.getStorageSync('userData').openId)
    } else if (app.userInfoReadyCallback) {
      app.userInfoReadyCallback = res => {
        this.setData({
          openId: res.openId
        })
        this.getCollectImg(imgItem.img_id, res.openId)
      };
    }
    if (imgItem.series_id) {
      api.get(api.SERVER_PATH + api.IMGS + `?series_id=${imgItem.series_id}`).then(res => {
        console.log(res)
        this.setData({
          imgData: res.data.map(item => `${item.img}?imageView2/q/30`)
        })
      });
    } else {
      this.setData({
        imgData: [imgItem.img]
      })
    }
    console.log(imgItem)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let imgItem = this.data.imgItem
    if (tt.wechat_user_id) {
      //扫码进来的，直接用二维码中
      var promote_user_id = tt.wechat_user_id
    } else {
      //非扫码进入，从登录的资料中获取
      var promote_user_id = tt.userinfo.user_id
    }
    var path = `/pages/imagePanel/imagePanel?imgItem=${imgItem}&promote_user_id=${promote_user_id}`

    console.log('页面为：', path)

    return {
      title: '',
      path: path,
      success: function (res) {// 转发成功
      },
      fail: function (res) {// 转发失败
      }
    };
  },
  getCollectImg(imgId, openId) {
    api.get(api.SERVER_PATH + api.COLLECT + `?user_id=${openId}`).then((res) => {
      tt.setStorageSync("collect_img", res.data)
      this.isCollect(imgId, isc => {
        this.setData({
          isCollect: isc
        });
      });
    })
  },

  /**
   * 选中图片
   */
  selectImg(e) {
    let url = e.target.dataset.url;
    this.setData({
      selectUrl: url
    });
    this.isCollect(utils.getIds(url)[0], isc => {
      this.setData({
        isCollect: isc
      });
    });
  },

  /**
   * 预览图片
   */
  previewImage: function () {
    let url = this.data.selectUrl.split("?")[0]
    let imgData = this.data.imgData.map(item => item.split("?")[0])
    tt.previewImage({
      current: url,
      urls: imgData
    });
  },
  shareImage: function () {
    var that = this;
    tt.getStorage({
      key: 'isSet',
      success: function (res) {
        that.previewImage();
      },
      fail: function (res) {
        tt.showModal({
          title: "温馨提示",
          content: "请在预览界面长按图片，然后选择【发送给朋友】即可",
          showCancel: false,
          confirmText: "我知道了",
          success: function (res) {
            if (res.confirm) {
              tt.setStorage({
                key: 'isSet',
                data: true
              });
              that.previewImage();
            } else if (res.cancel) {
              console.log('用户点击取消');
            }
          }
        });
      }
    });
  },
  collectImg: function (e) {
    if (!this.data.openId) {
      tt.showModal({
        title: '温馨提示',
        content: '小主,请先登录小程序，才可以收藏图片~',
        success: res => {
          if (res.confirm) {
            app.globalData.imgItemData = this.data.imgItem
            tt.switchTab({
              url: '/pages/collect/collect'
            });
          }
        }
      })
      return false
    }
    tt.showLoading({
      title: 'loading'
    });
    let openId = this.data.openId;
    let obj = {};
    obj.user_id = openId;
    obj.img_id = utils.getIds([this.data.selectUrl])[0];

    if (this.data.isCollect) {
      api.delete(api.SERVER_PATH + api.COLLECT + `?user_id=${openId}&img_id=${obj.img_id}`).then(res => {
        tt.showToast({
          title: '已取消收藏'
        });
        this.setData({
          isCollect: false
        });
        api.get(api.SERVER_PATH + api.COLLECT + `?user_id=${openId}`).then(res => {
          tt.setStorageSync("collect_img", res.data);
        });
      });
    } else {
      api.post(api.SERVER_PATH + api.COLLECT, obj).then(res => {
        tt.showToast({
          title: '成功收藏'
        });
        this.setData({
          isCollect: true
        });
        console.log(res.data == "success");

        if (res.data == "success") {
          api.get(api.SERVER_PATH + api.COLLECT + `?user_id=${openId}`).then(res => {
            tt.setStorageSync("collect_img", res.data);
          });
        }
      });
    }
  },
  isCollect: function (id, callback) {
    let collectImg = tt.getStorageSync('collect_img');
    callback(collectImg.findIndex(it => id == it.img_id) > -1);
  },
  gotozs: function () {
    let url = "http://www.moepan.net/uploads/2018032518452733765063.jpg";
    tt.previewImage({
      current: url,
      urls: [url]
    });
  },
  gotoHome: function () {
    /*配置了tabbar的只能使用switchtab */
    tt.switchTab({
      url: '/pages/index/index'
    });
  },
  beforeSave() {
    let that = this
    const systemInfo = tt.getSystemInfoSync()
    console.log(systemInfo.appName === 'Douyin')
    if (systemInfo.appName !== "Douyin") {
      this.saveImgs()
      return false
    }
    // if (!wx.getStorageSync('userData')) {
    //   tt.showModal({
    //     title: '温馨提示',
    //     content: '小主,请先登录小程序，才可以下载图片~',
    //     success: res => {
    //       if (res.confirm) {
    //         app.globalData.imgItemData = this.data.imgItem
    //         tt.switchTab({
    //           url: '/pages/collect/collect'
    //         });
    //       }
    //     }
    //   })
    //   return false
    // }
    // var dataStr = new Date().getTime()
    if (this.getHasStroge()) {
      this.saveImgs()
    } else {
      tt.showModal({
        title: '温馨提示',
        content: '观看视频解锁下载图片~',
        success: res => {
          if (res.confirm) {
            let videoAd = tt.createRewardedVideoAd({
              adUnitId: '2632m76gpedf5i5952'
            })
            // 显示广告
            videoAd
              .show()
              .then(() => {
                console.log("广告显示成功");
              })
              .catch(err => {
                tt.showToast({
                  title: '广告组件出现问题~',
                  icon: 'none',
                  duration: 1000
                })
                // 可以手动加载一次
                videoAd.load().then(() => {
                  console.log("手动加载成功");
                  // 加载成功后需要再显示广告
                  return videoAd.show();
                });
              });
            videoAd.onClose(res => {
                // 给予奖励
                //判断是否看完了广告
                if (res.isEnded) {
                  console.log('广告看完了')
                  that.addAdPlayerHistory()
                  // 给予奖励
                  if (this.data.parseImgItem.series_id) {
                    let obj = tt.getStorageSync('collectObj') || {}
                    let serkey = `series_id${this.data.parseImgItem.series_id}`
                    let serObj = {}
                    serObj[serkey] = true
                    let assignObj = Object.assign({}, serObj, obj)
                    tt.setStorageSync('collectObj', assignObj)
                  } else {
                    let obj = tt.getStorageSync('collectObj') || {}
                    let serkey = `img_id${this.data.parseImgItem.img_id}`
                    let serObj = {}
                    serObj[serkey] = true
                    let assignObj = Object.assign({}, serObj, obj)
                    tt.setStorageSync('collectObj', assignObj)
                  }
                } else if (res.cancel) {
                  //没看完，不给激励广告
                  console.log("cancel, cold");
                }
            });
          } else if (res.cancel) {
            console.log("cancel, cold");
          }
        }
      })
    }
  },
  getHasStroge() {
    let key = null
    if (this.data.parseImgItem.series_id) {
      key = 'series_id' + this.data.parseImgItem.series_id
    } else {
      key = 'img_id' + this.data.parseImgItem.img_id
    }
    if (tt.getStorageSync('collectObj')[key]) {
      return true
    } else {
      return false
    }
  },
  saveImgs() {
    let that = this
    let imgs = this.data.imgData
    imgs.forEach((item) => {
      item = item.split("?")[0]
    })
    var all_n = imgs.length
    tt.authorize({
      scope: 'scope.writePhotosAlbum',
      success() {
        tt.showToast(
          {
            title: '下载中...',
            icon: 'loading'
          }
        )
        for (let i = 0, j = 1; i < all_n; i++ , j++) {
          that.dow_temp(imgs[i], j, all_n, (text) => {
            if (text == 100) {
              tt.showLoading({
                title: j + '/' + all_n + '下载中',
                duration: 10000
              })
              if (j == all_n) {
                tt.showToast({
                  title: '下载完成',
                  duration: 1000
                })
              }
            } else {
              tt.showToast({
                title: '下载失败',
              })
            }
          })
        }
      },
      fail() {
        tt.showModal({
          title: '温馨提示',
          content: '小主，下载图片，需允许授权相册权限~',
          success(res) {
            if (res.confirm) {
              tt.openSetting({
                success(res) {
                  console.log(res.authSetting)
                }
              })
            }
          }
        })
      }
    })
  },
  dow_temp: function (str, i, all_n, callback) {
    var that = this;
    tt.authorize({
      scope: 'scope.writePhotosAlbum',
      success() {
        // 用户已经同意小程序使
        const downloadTask = tt.downloadFile({
          url: str,
          success: function (res) {
            var temp = res.tempFilePath
            tt.saveImageToPhotosAlbum({
              filePath: temp,
              success: function () { },
              fail: function () {
                tt.showToast({
                  title: '第' + i + '下载失败',
                })
              }
            })
          },
          fail: function (res) {
            tt.showToast({
              title: '下载失败',
            })
          }
        })

        downloadTask.onProgressUpdate((res) => {
          if (res.progress == 100) {
            callback(res.progress);
            var count = that.data.percent_n; //统计下载多少次了
            that.setData({
              percent_n: count + 1
            })
            if (that.data.percent_n == all_n) { //判断是否下载完成
              that.setData({ //完成后，清空percent-N,防止多次下载后，出错
                percent_n: 0
              })
            }
          }
        })

      },
      fail: function () {

      }
    })
  }
});