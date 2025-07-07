<template>
  <ion-page>
    <div v-if="showDownloadAlert" class="download-pop-mask">
                    <div class="download-pop">
        <div class="download-title">{{ $t('update.updateProgress') }}</div>
        <div class="download-bar">
          <div class="progress-bar">
            <div class="progress-inner" :style="{ width: Math.round(progress * 100) + '%' }"></div>
          </div>
        </div>
        <div class="download-text">{{ $t('update.updateCompleted', { percent: Math.round(progress * 100) }) }}</div>
      </div>
    </div>
    <ion-content class="fullscreen-content">
      <div class="my-container">
        <!-- 用户信息区域 -->
        <div class="user-section">
          <div class="avatar">
            <ion-icon :icon="person" size="large" color="primary"></ion-icon>
          </div>
          <h2 class="username">{{ $t('my.vip') }}</h2>
        </div>

        <!-- 功能按钮区域 -->
        <div class="function-section">
          <!-- 隐私政策 -->
          <ion-button expand="block" fill="clear" class="function-btn" @click="openPrivacy">
            <ion-icon :icon="lockClosed" slot="start"></ion-icon>
            {{ $t('common.privacyPolicy') }}
          </ion-button>
          <!-- 用户协议 -->
          <ion-button expand="block" fill="clear" class="function-btn" @click="openAgreement">
            <ion-icon :icon="documentText" slot="start"></ion-icon>
            {{ $t('common.userAgreement') }}
          </ion-button>
          <!-- 查看官网 -->
          <ion-button 
            expand="block" 
            fill="clear" 
            class="function-btn"
            @click="openWebsite">
            <ion-icon :icon="globe" slot="start"></ion-icon>
            {{ $t('my.viewWebsite') }}
          </ion-button>
          <!-- 检查更新 -->
          <ion-button 
            expand="block" 
            fill="clear" 
            class="function-btn"
            @click="checkUpdate(true)">
            <ion-icon :icon="refresh" slot="start"></ion-icon>
            {{ $t('my.checkUpdate') }}
          </ion-button>
          <!-- 联系我显示 -->
          <ion-button 
            expand="block" 
            fill="clear" 
            class="function-btn"
            @click="showContactModal = true">
            <ion-icon :icon="mail" slot="start"></ion-icon>
            {{ $t('my.contactMe') }}
          </ion-button>
          <!-- 解锁 -->
          <ion-button 
            expand="block" 
            fill="clear" 
            class="function-btn unlock-btn"
            @click="showPasswordModal = true">
            <ion-icon :icon="lockOpen" slot="start"></ion-icon>
            {{ $t('my.unlockContent') }}
          </ion-button>

          <!-- 解锁状态显示 -->
          <div v-if="isContentUnlocked()" class="unlock-status">
            <ion-chip color="success">
              <ion-icon :icon="checkmarkCircle"></ion-icon>
              <ion-label>{{ $t('common.unlocked') }} - {{ remainingTime }}小时</ion-label>
            </ion-chip>
          </div>


          <LanguageSwitcher />
        </div>

        <!-- 口令输入模态框 -->
        <ion-modal :is-open="showPasswordModal" @did-dismiss="showPasswordModal = false">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ $t('my.enterPassword') }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="showPasswordModal = false">
                  <ion-icon :icon="close"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <div class="password-form">
              <p class="password-hint">{{ $t('my.unlockHint') }}</p>
              
              <ion-item>
                <ion-label position="stacked">{{ $t('my.enterPassword') }}</ion-label>
                <ion-input
                  v-model="password"
                  type="text"
                  :placeholder="$t('my.passwordPlaceholder')"
                  :maxlength="6"
                  @ion-input="onPasswordInput"
                  @keyup.enter="verifyPasswordHandler">
                </ion-input>
              </ion-item>

              <div class="password-actions">
                <ion-button 
                  expand="block" 
                  @click="verifyPasswordHandler"
                  :disabled="password.length !== 6">
                  {{ $t('my.enterPassword') }}
                </ion-button>
                
                <ion-button 
                  expand="block" 
                  fill="clear"
                  @click="showPasswordModal = false">
                  {{ $t('common.cancel') }}
                </ion-button>
              </div>

              <div v-if="passwordError" class="password-error">
                {{ passwordError }}
              </div>
            </div>
          </ion-content>
        </ion-modal>
        <LegalModal :show="showLegal" :type="legalType" :onClose="closeLegal" />
        <!-- 联系方式Modal -->
        <ion-modal :is-open="showContactModal" @did-dismiss="showContactModal = false">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ $t('my.contactMe') }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="showContactModal = false">
                  <ion-icon :icon="close"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <div class="contact-list">
              <ion-list>
                <ion-item v-for="item in contactLinks" :key="item.label" :button="item.type !== 'coming'" :detail="false" 
                  @click="openContact(item)">
                  <ion-icon :icon="item.icon" slot="start"></ion-icon>
                  <ion-label>{{ item.label }}</ion-label>
                  <span v-if="item.type !== 'coming'" class="contact-link">{{ item.display }}</span>
                  <span v-else class="contact-coming">{{ item.display }}</span>
                </ion-item>
              </ion-list>
            </div>
          </ion-content>
        </ion-modal>
        <!-- 底部信息 -->
        <div class="footer-info">
          <p class="year">{{ $t('my.copyright', { year: currentYear,apptitle:environment.appTitle }) }}</p>
          <p class="version">{{ $t('my.version', { version: appVersion }) }}</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { environment } from '@/config/environment'
import { 
  IonPage, 
  IonContent, 
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput,
  IonChip,
  IonList,
  toastController,
  onIonViewWillEnter
} from '@ionic/vue';
import { person, globe, refresh, lockOpen, close,closeCircle,checkmarkCircle, mail,logoFacebook,logoDiscord,paperPlane, lockClosed, documentText } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { InAppBrowser } from '@capacitor/inappbrowser';
import { useAppUpdate } from '@/composables/useAppUpdate';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import { verifyPassword } from '@/api/video';
import { useI18n } from 'vue-i18n';
import { setContentUnlocked, isContentUnlocked, getRemainingUnlockTime } from '@/utils/unlock';
import LegalModal from '@/components/LegalModal.vue';

const { showDownloadAlert, progress, checkUpdate } = useAppUpdate();
const { t } = useI18n();
const showLegal = ref(false);
const legalType = ref<'privacy' | 'agreement'>('privacy');

// 口令相关状态
const showPasswordModal = ref(false);
const password = ref('');
const passwordError = ref('');
const remainingTime = ref(0);

// 联系方式
const contactLinks = [
  {
    label: 'Gmail',
    icon: mail,
    url: 'mailto:maowenliu@gmail.com',
    display: 'maowenliu@gmail.com',
    type: 'email',
  },
  {
    label: 'Telegram',
    icon: paperPlane,
    url: 'https://t.me/+oWEbySMuv4g4NmJl',
    display: 't.me/mytelegram',
    type: 'link',
  },
  // 预留扩展
  {
    label: 'Discord',
    icon: logoDiscord,
    url: '',
    display: '敬请期待',
    type: 'coming',
  },
  {
    label: 'Facebook',
    icon: logoFacebook,
    url: '',
    display: '敬请期待',
    type: 'coming',
  },
];

// 更新剩余时间
const updateRemainingTime = () => {
  remainingTime.value = getRemainingUnlockTime();
};

// 口令输入处理
const onPasswordInput = (event: any) => {
  const value = event.target.value;
  password.value = value;
  passwordError.value = '';
  
  // 限制只能输入6位字符
  if (value.length > 6) {
    password.value = value.slice(0, 6);
  }
};
const openContact = async (item:any) => {
  try {
    if (Capacitor.isNativePlatform()) {
      await InAppBrowser.openInExternalBrowser({ url: item.url });
    } else {
      if(item.type === 'link') {
        window.open(item.url, '_blank')
      } else if (item.type === 'email') {
        window.open(item.url)
      }
    }
  } catch (error) {
    console.error('打开联系失败:', error);
  }
}

// 验证口令
const verifyPasswordHandler = async () => {
  if (password.value.length !== 6) {
    passwordError.value = t('my.passwordLength');
    // 显示错误 Toast
    const warningToast = await toastController.create({
      message: t('my.passwordLength'),
      duration: 2000,
      position: 'top',
      color: 'warning',
      icon: 'warning'
    });
    await warningToast.present();
    return;
  }

  try {
    const response = await verifyPassword(password.value);
    if (response.result) {
      // 解锁成功
      passwordError.value = '';
      password.value = '';
      showPasswordModal.value = false;
      
      // 保存解锁状态到本地存储
      setContentUnlocked(true);
      
      // 更新剩余时间
      updateRemainingTime();
      
      // 显示成功提示
      const toast = await toastController.create({
        message: t('my.unlockSuccess'),
        duration: 2000,
        position: 'top',
        color: 'success',
        icon: checkmarkCircle
      });
      await toast.present();
    } else {
      passwordError.value = t('my.unlockFailed');
      // 显示错误 Toast
      const errorToast = await toastController.create({
        message: t('my.unlockFailed'),
        duration: 3000,
        position: 'top',
        color: 'danger',
        icon: closeCircle
      });
      await errorToast.present();
    }
  } catch (error) {
    console.error('口令验证失败:', error);
    passwordError.value = t('my.unlockFailed');
    // 显示错误 Toast
    const errorToast = await toastController.create({
      message: t('my.unlockFailed'),
      duration: 3000,
      position: 'top',
      color: 'danger',
      icon: closeCircle
    });
    await errorToast.present();
  }
};

// 自动获取当前年度
const currentYear = ref(new Date().getFullYear());

// 自动获取应用版本
const appVersion = ref('v1.0.0'); // 默认版本

// 获取应用版本信息
const getAppVersion = async () => {
  try {
    // 如果使用 Capacitor，可以获取原生版本信息
    if (Capacitor.isNativePlatform()) {
      // 这里可以调用原生API获取版本
      // 例如：const version = await App.getInfo();
      appVersion.value = 'v1.0.0'; // 暂时使用默认值
    } else {
      // Web环境，尝试从环境变量获取版本
      const version = import.meta.env.VITE_APP_VERSION || 'v1.0.0';
      appVersion.value = version;
    }
  } catch (error) {
    console.error('获取版本信息失败:', error);
    appVersion.value = 'v1.0.0'; // 失败时使用默认值
  }
};

// 打开官网
const openWebsite = async () => {
  const websiteUrl = 'https://www.qylapi.top';
  try {
    if (Capacitor.isNativePlatform()) {
      await InAppBrowser.openInExternalBrowser({ url: websiteUrl });
    } else {
      window.open(websiteUrl, '_blank');
    }
  } catch (error) {
    console.error('打开官网失败:', error);
  }
};
const openPrivacy = () => {
  legalType.value = 'privacy';
  showLegal.value = true;
};
const openAgreement = () => {
  legalType.value = 'agreement';
  showLegal.value = true;
};
const closeLegal = () => {
  showLegal.value = false;
};

const showContactModal = ref(false);

onMounted(async () => {
  // 获取应用版本信息
  await getAppVersion();
  
  // 更新剩余解锁时间
  updateRemainingTime();
  
  // 每分钟更新一次剩余时间
  setInterval(updateRemainingTime, 60000);
});
onIonViewWillEnter(async () => {
  if (Capacitor.isNativePlatform()) {
    await StatusBar.setStyle({ style: Style.Light });
  }
})

// @ts-ignore
// eslint-disable-next-line
declare const window: any;

</script>

<style scoped>
ion-header {
  --background: rgba(0, 0, 0, 0);
}

ion-toolbar {
  /* --background: rgba(0, 0, 0, 0); */
  --border-style: none;
  /* --color: #fff; */
}
.title{
    padding-left: 0!important;
}
.header-md{
    box-shadow:none!important;
}
.fullscreen-content {
  /* --background: #000; */
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
}

ion-content {
  --background: #f5f5f5;
}

.my-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

.user-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px 0;
}

.avatar {
  margin-bottom: 16px;
}

.username {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 500;
}

.function-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.function-btn {
  --background: #fff;
  --color: #333;
  --border-radius: 8px;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 0;
  height: 56px;
}

.function-btn:hover {
  --background: #f8f9fa;
}

.footer-info {
  text-align: center;
  padding: 20px 0;
  color: #666;
  font-size: 14px;
}

.year, .version {
  margin: 4px 0;
}

/* 口令解锁相关样式 */
.unlock-btn {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: #fff;
  --border-radius: 8px;
  --box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.unlock-btn:hover {
  --background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.unlock-status {
  margin-top: 12px;
  text-align: center;
}

.unlock-status ion-chip {
  --background: rgba(76, 175, 80, 0.1);
  --color: #4caf50;
  font-size: 14px;
  font-weight: 500;
}

.password-form {
  padding: 20px 0;
}

.password-hint {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.5;
}

.password-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.password-error {
  margin-top: 12px;
  padding: 8px 12px;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.contact-list {
  margin-top: 10px;
}
.contact-link {
  color: #007bff;
  margin-left: 8px;
  font-size: 14px;
}
.contact-coming {
  color: #aaa;
  margin-left: 8px;
  font-size: 14px;
}

</style>