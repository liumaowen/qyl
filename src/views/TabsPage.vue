<template>
  <ion-page>
    <ion-tabs ref="tabsRef">
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="tab1" href="/tabs/tab1">
          <ion-icon aria-hidden="true" :icon="triangle" />
          <ion-label>Tab 1</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/tab2">
          <ion-icon aria-hidden="true" :icon="ellipse" />
          <ion-label>Tab 2</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/tab3">
          <ion-icon aria-hidden="true" :icon="square" />
          <ion-label>Tab 3</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet,onIonViewWillEnter,onIonViewDidEnter } from '@ionic/vue';
import { ellipse, square, triangle } from 'ionicons/icons';
import { setTabHeight } from '@/store/state'
const tabsRef = ref<InstanceType<typeof IonTabs> | null>(null);

// onIonViewDidEnter(() => {
//   setTimeout(() => {
//   getTabSize();
//   }, 0);
// });

// const getTabSize = () => {
//   // 1. 处理 Ionic 组件实例（通过 $el 获取实际 DOM 元素）
//   const domElement = tabsRef.value?.$el ?? tabsRef.value;
//   // 2. 类型断言：明确 domElement 为 HTMLElement（或 null）
//   const htmlElement = domElement as HTMLElement | null;
//   // 获取 Tab 栏的 DOM 元素（根据实际结构调整选择器）
//     const tabBarElement = htmlElement?.querySelector('ion-tab-bar');
//     if (tabBarElement) {
//       // 通过 getBoundingClientRect 获取高度（包含边框和内边距）
//       const rect = tabBarElement.getBoundingClientRect();
//       setTabHeight(rect.height)
//     }
// };
</script>
<style lang="css" scoped>
/* 深度选择器穿透样式，修改底部导航栏主题 */
::v-deep ion-tab-bar {
  --background: #000000; /* 黑色背景 */
  --color: rgba(255, 255, 255, 0.7); /* 未选中状态的图标/文字颜色（白色半透明） */
  --color-selected: #ffffff; /* 选中状态的图标/文字颜色（纯白） */
}
</style>
