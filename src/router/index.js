import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import Welcome from '@/components/Welcome'
import Users from '@/components/user/User'
import Rights from '@/components/power/Rights'
import Roles from '@/components/power/Roles'
import Cate from '@/components/goods/Cate'
import params from '@/components/goods/params'
import GoodsList from '@/components/goods/List'
import Add from '@/components/goods/add'
import Order from '@/components/order/Order'
import Report from '@/components/report/Report'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    }, {
      path: '/Home',
      name: 'Home',
      component: Home,
      redirect: '/Welcome',
      children: [
        {path: '/Welcome', name: 'Welcome', component: Welcome},
        // 用户列表
        {path: '/users', name: 'Users', component: Users},
        // 权限列表
        {path: '/rights', name: Rights, component: Rights},
        // 角色列表
        {path: '/roles', name: '', component: Roles},
        // 商品分类
        {path: '/categories', name: '', component: Cate},
        // 商品分类参数
        {path: '/Params', name: '', component: params},
        //  商品列表
        {path: '/goods', name: '', component: GoodsList},
        //   商品列表，添加商品
        {path: '/goods/add', name: '', component: Add},
        //   订单管理
        {path: '/orders', name: '', component: Order},
        //   数据报表
        {path: '/reports', name: '', component: Report}
      ]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to代表将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行   next()  放行  next('/login')强制跳转
  if (to.path === '/') return next()
  // 获取 token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/')
  next()
})

export default router
