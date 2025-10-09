import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import i18n from './locales';
import { environment, configureVueForProduction } from './config/environment';
import { debug } from './utils/debug';

import { IonicVue } from '@ionic/vue';

// Vue 生产模式配置
configureVueForProduction();

if (environment.production) {
  if (debug.isDebugBuild()) {
    console.log('Running in production debug mode');
  } else {
    console.log('Running in production mode');
  }
} else {
  console.log('Running in development mode');
}

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import { register } from 'swiper/element/bundle';
register();
/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/vue/css/palettes/dark.always.css';
@import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import 'video.js/dist/video-js.css'

// 将非关键CSS设为异步导入
const loadOptionalCSS = async () => {
  await import('@ionic/vue/css/padding.css');
  await import('@ionic/vue/css/float-elements.css');
  await import('@ionic/vue/css/text-alignment.css');
  await import('@ionic/vue/css/text-transformation.css');
  await import('@ionic/vue/css/flex-utils.css');
  await import('@ionic/vue/css/display.css');
};

const app = createApp(App)
  .use(IonicVue,{innerHTMLTemplatesEnabled:true})
  .use(router)
  .use(i18n);

router.isReady().then(() => {
  app.mount('#app');
  loadOptionalCSS(); // 异步加载非关键CSS
});
