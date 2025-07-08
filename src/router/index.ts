import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/tab2'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/tab2'
      },
      {
        path: 'tab1',
        component: () => import('@/views/Tab1Page.vue')
      },
      {
        path: 'tab2',
        component: () => import('@/views/Tab2Page.vue')
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue')
      },
      {
        path: 'shortDramas',
        name: 'ShortDramas',
        component: () => import('@/views/ShortDramas.vue')
      },
      {
        path: 'my',
        name: 'My',
        component: () => import('@/views/My.vue')
      }
    ]
  },
  {
    path: '/dramasDetail/:id',
    name: 'DramasDetail',
    component: () => import('@/views/DramasDetail.vue')
  },
  {
    path: '/analytics-demo',
    name: 'AnalyticsDemo',
    component: () => import('@/views/AnalyticsDemo.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
