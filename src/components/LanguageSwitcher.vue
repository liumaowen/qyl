<template>
  <ion-button 
    fill="clear" 
    @click="showLanguageModal = true"
    class="language-switcher">
    <ion-icon :icon="globe" slot="start"></ion-icon>
    {{ getCurrentLanguageName() }}
  </ion-button>

  <ion-modal :is-open="showLanguageModal" @did-dismiss="showLanguageModal = false">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ $t('common.language') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showLanguageModal = false">
            <ion-icon :icon="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item 
          v-for="locale in supportedLocales" 
          :key="locale.code"
          @click="changeLanguage(locale.code)"
          :class="{ 'selected': getCurrentLocale() === locale.code }">
          <ion-label>
            <div class="language-item">
              <span class="flag">{{ locale.flag }}</span>
              <span class="name">{{ locale.name }}</span>
            </div>
          </ion-label>
          <ion-icon 
            v-if="getCurrentLocale() === locale.code" 
            :icon="checkmark" 
            slot="end" 
            color="primary">
          </ion-icon>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  IonButton, 
  IonIcon, 
  IonModal, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel 
} from '@ionic/vue';
import { globe, close, checkmark } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { supportedLocales, changeLocale, getCurrentLocale } from '@/locales';

const { t } = useI18n();
const showLanguageModal = ref(false);

const getCurrentLanguageName = () => {
  const currentLocale = getCurrentLocale();
  const locale = supportedLocales.find(l => l.code === currentLocale);
  return locale ? locale.name : currentLocale;
};

const changeLanguage = async (localeCode: string) => {
  await changeLocale(localeCode);
  showLanguageModal.value = false;
};
</script>

<style scoped>
.language-switcher {
  --color: var(--ion-color-primary);
}

.language-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.flag {
  font-size: 20px;
}

.name {
  font-size: 16px;
}

.selected {
  --background: var(--ion-color-primary-tint);
  --color: var(--ion-color-primary-contrast);
}
</style> 