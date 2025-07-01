import { ref, onMounted } from 'vue';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { FileTransfer } from '@capacitor/file-transfer';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener, FileOpenerOptions } from '@capacitor-community/file-opener';
import { alertController } from '@ionic/vue';
import { getVersion } from '@/api/video';

const showDownloadAlert = ref(false);
const progress = ref(0);
let downloadUrl = '';
let localVersion = '';
let versionName = '';

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

const presentAlert = async () => {
  const alert = await alertController.create({
    header: '发现新版本, 是否更新?',
    cssClass: 'update-pop',
    backdropDismiss: false,
    message: `当前版本号：${escapeHtml(localVersion)}<br/>待更新版本号：${escapeHtml(versionName)}`,
    buttons: [
      { text: '取消', role: 'cancel' },
      { text: '立即更新', handler: startUpdate }
    ]
  });
  await alert.present();
};

async function startUpdate() {
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
          open(fileInfo.uri);
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

const open = async (url: string) => {
  showDownloadAlert.value = false;
  const openalert = await alertController.create({
    message: '应用下载完成，是否立即更新？',
    backdropDismiss: false,
    buttons: [
      {
        text: '打开',
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

onMounted(async () => {
  if (Capacitor.getPlatform() !== 'android') {
    return;
  }
  const info = await App.getInfo();
  localVersion = info.version;
  const res = await getVersion();
  versionName = res.versionName;
  downloadUrl = res.downloadUrl;
  if (compareVersion(versionName, localVersion) > 0) {
    presentAlert();
  }
});

export function useAppUpdate() {
  return {
    showDownloadAlert,
    progress
  };
} 