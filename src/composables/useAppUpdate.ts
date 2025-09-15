import { ref, onMounted } from 'vue';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { FileTransfer } from '@capacitor/file-transfer';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener, FileOpenerOptions } from '@capacitor-community/file-opener';
import { alertController, toastController } from '@ionic/vue';
import { getVersion } from '@/api/video';
import { useI18n } from 'vue-i18n';
import { checkmarkCircle } from 'ionicons/icons';

const showDownloadAlert = ref(false);
const progress = ref(0);
let downloadUrl = '';
let localVersion = '';
let versionName = '';
let updatedLog = '';

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, function (m) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    } as any)[m];
  });
}

function compareVersion(v1: string, v2: string): number {
  const arr1 = v1.split('.').map(Number);
  const arr2 = v2.split('.').map(Number);
  const len = Math.max(arr1.length, arr2.length);
  for (let i = 0; i < len; i++) {
    const n1 = arr1[i] || 0;
    const n2 = arr2[i] || 0;
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }
  return 0;
}

const presentAlert = async (t: any) => {
  const alert = await alertController.create({
    header: t('update.newVersionFound'),
    cssClass: 'update-pop',
    backdropDismiss: false,
    message: `${t('update.currentVersion', { version: escapeHtml(localVersion) })}<br/>${t('update.newVersion', { version: escapeHtml(versionName) })}<br/>${updatedLog}`,
    buttons: [
      // { text: t('update.cancel'), role: 'cancel' },
      { text: t('update.updateNow'), handler: () => startUpdate(t) }
    ]
  });
  await alert.present();
};

async function startUpdate(t: any) {
  const top = await alertController.getTop();
  if (top) await top.dismiss();
  showDownloadAlert.value = true;
  progress.value = 0;
  const fileInfo = await Filesystem.getUri({
    directory: Directory.Data,
    path: 'shunle.apk'
  });
  FileTransfer.addListener('progress', (prs) => {
    progress.value = prs.bytes / prs.contentLength;
    if (progress.value >= 1) {
      setTimeout(() => {
        showDownloadAlert.value = false;
        FileTransfer.removeAllListeners();
        if (fileInfo.uri) {
          open(fileInfo.uri, t);
        }
      }, 800);
    }
  });
  await FileTransfer.downloadFile({
    url: downloadUrl,
    path: fileInfo.uri,
    progress: true,
  });
}

const open = async (url: string, t: any) => {
  showDownloadAlert.value = false;
  const openalert = await alertController.create({
    message: t('update.downloadComplete'),
    backdropDismiss: false,
    buttons: [
      {
        text: t('update.open'),
        handler: async () => {
          try {
            const fileOpenerOptions: FileOpenerOptions = {
              filePath: url,
              contentType: 'application/vnd.android.package-archive',
              openWithDefault: true,
            };
            await FileOpener.open(fileOpenerOptions);
          } catch (e) {
            console.log('Error opening file', e);
          }
        }
      }
    ]
  });
  await openalert.present();
};

async function checkUpdate(t: any,isship:boolean) {
  if (Capacitor.getPlatform() !== 'android') {
    return;
  }
  const info = await App.getInfo();
  localVersion = info.version;
  const res = await getVersion();
  versionName = res.versionName;
  downloadUrl = res.downloadUrl;
  updatedLog = res.updatedLog;
  
  
  const versionComparison = compareVersion(versionName, localVersion);
  
  if (versionComparison > 0) {
    // 有新版本
    presentAlert(t);
  } else {
    if(isship) {
      // 已是最新版本
      const toast = await toastController.create({
        message: t('update.alreadyLatest'),
        duration: 2000,
        position: 'top',
        color: 'success',
        icon: checkmarkCircle
      });
      await toast.present();
    }
  }
}

function useAppUpdate() {
  const { t } = useI18n();

  onMounted(async () => {
    // if (Capacitor.getPlatform() !== 'android') {
    //   return;
    // }
    // const info = await App.getInfo();
    // localVersion = info.version;
    // const res = await getVersion();
    // versionName = res.versionName;
    // downloadUrl = res.downloadUrl;
    
    // const versionComparison = compareVersion(versionName, localVersion);
    
    // if (versionComparison > 0) {
    //   // 有新版本
    //   presentAlert(t);
    // } else {
    //   // 已是最新版本
    //   const toast = await toastController.create({
    //     message: t('update.alreadyLatest'),
    //     duration: 2000,
    //     position: 'top',
    //     color: 'success',
    //     icon: checkmarkCircle
    //   });
    //   await toast.present();
    // }
  });

  return {
    showDownloadAlert,
    progress,
    checkUpdate: (chip:boolean) => checkUpdate(t,chip)
  };
}

export { useAppUpdate }; 