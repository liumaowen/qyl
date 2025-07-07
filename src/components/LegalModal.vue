<template>
    <ion-modal :is-open="show" @did-dismiss="close">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ title }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="close">
              <ion-icon :icon="closeIcon"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div v-html="content" class="legal-content"></div>
      </ion-content>
    </ion-modal>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, onMounted } from 'vue';
  import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent } from '@ionic/vue';
  import { close as closeIcon } from 'ionicons/icons';
  import { useI18n } from 'vue-i18n';
  
  const props = defineProps<{
    show: boolean;
    type: 'privacy' | 'agreement';
    onClose: () => void;
  }>();
  
  const { locale, t } = useI18n();
  const content = ref('');
  const title = ref('');
  
  const loadContent = async () => {
    let file = '';
    if (props.type === 'privacy') {
      title.value = t('common.privacyPolicy');
      file = locale.value === 'zh-CN' ? '/privacy-policy.zh.md' : '/privacy-policy.en.md';
    } else {
      title.value = t('common.userAgreement');
      file = locale.value === 'zh-CN' ? '/user-agreement.zh.md' : '/user-agreement.en.md';
    }
    const res = await fetch(file);
    content.value = (await res.text())
      .replace(/\n/g, '<br/>') // 简单换行处理
      .replace(/ /g, '&nbsp;');
  };
  
  watch(() => props.show, (val) => { if (val) loadContent(); });
  watch(() => locale.value, () => { if (props.show) loadContent(); });
  onMounted(() => { if (props.show) loadContent(); });
  
  const close = () => props.onClose();
  </script>
  
  <style scoped>
  .legal-content {
    font-size: 15px;
    line-height: 1.7;
    white-space: pre-line;
  }
  </style>