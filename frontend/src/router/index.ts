import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: '登录', public: true }
    },
    {
      path: '/',
      name: 'EmployeeList',
      component: () => import('../views/EmployeeList.vue'),
      meta: { title: '员工列表' }
    },
    {
      path: '/resigned',
      name: 'ResignedList',
      component: () => import('../views/ResignedList.vue'),
      meta: { title: '离职员工管理' }
    },
    {
      path: '/accounts',
      name: 'AccountList',
      component: () => import('../views/AccountList.vue'),
      meta: { title: '账号管理', adminOnly: true }
    },
    {
      path: '/create',
      name: 'EmployeeCreate',
      component: () => import('../views/EmployeeCreate.vue'),
      meta: { title: '创建员工' }
    },
    {
      path: '/edit/:id',
      name: 'EmployeeEdit',
      component: () => import('../views/EmployeeEdit.vue'),
      meta: { title: '编辑员工' }
    },
    {
      path: '/detail/:id',
      name: 'EmployeeDetail',
      component: () => import('../views/EmployeeDetail.vue'),
      meta: { title: '员工详情' }
    }
  ]
})

router.beforeEach((to) => {
  document.title = `${to.meta.title || '员工管理系统'} - EMS`

  const token = localStorage.getItem('token')
  if (!to.meta.public && !token) {
    return '/login'
  }
  if (to.path === '/login' && token) {
    return '/'
  }
})

export default router
