// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import vueParticles from 'vue-particles'
import ElementUI from 'element-ui'
import './assets/fonts/iconfont.css'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
//          引入全局的css样式
import './assets/css/global.css'
//          引入树形控件
import TreeTable from 'vue-table-with-tree-grid'
//          引入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//          富文本编辑器样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
//          导入Nprogress包对应的js和css（js是实现的效果，css是实现的样式）
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'

//  解决不会阻止默认滑动行为的问题
import 'default-passive-events'

Vue.use(VueQuillEditor)
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//  在 request 拦截器中，展示进度条  NProgress.start()
axios.interceptors.request.use(config => {
  Nprogress.start()
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须return config
  return config
})
//  在response拦截器中，隐藏进度条   NProgress.done()
axios.interceptors.response.use(config => {
  Nprogress.done()
  return config
})

Vue.prototype.$http = axios

Vue.use(ElementUI)

Vue.use(vueParticles)

Vue.config.productionTip = false

//  全局注册树形Table插件名字为tree-table
Vue.component('tree-table', TreeTable)

Vue.filter('dataFormat', function(originVal) {
  const dt = new Date(originVal)
  // 年月日
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  //  时分秒
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  //  最后返回一个  年-月-日  时-分-秒   的格式
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
