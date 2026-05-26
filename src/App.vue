<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
    // 初始化云开发环境
    if (typeof wx !== 'undefined' && wx.cloud) {
      try {
        const cloudOptions = {
          traceUser: true
        }
        if (wx.cloud.DYNAMIC_CURRENT_ENV) {
          cloudOptions.env = wx.cloud.DYNAMIC_CURRENT_ENV
        }
        wx.cloud.init(cloudOptions)
        console.log('云开发初始化成功')
      } catch (err) {
        console.error('云开发初始化失败:', err)
      }
    } else {
      console.log('当前环境不支持云开发')
    }
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  }
}
</script>

<style lang="scss">
/*每个页面公共 css */
@import '@/styles/common.scss';

page {
  background-color: #F5F7FA;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}
</style>
