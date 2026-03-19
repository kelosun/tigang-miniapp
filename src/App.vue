<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
    // 初始化云开发环境
    if (wx?.cloud) {
      wx.cloud.init({
        env: 'cloud1-2gpe6fvi07555d29', // 替换为你的云环境 ID
        traceUser: true
      })
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
