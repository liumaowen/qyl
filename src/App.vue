<template>
  <ion-app>
    <ion-router-outlet />
    <!-- 下载进度弹窗 -->
    <ion-alert v-if="showDownloadAlert" :isOpen="showDownloadAlert" cssclass="download-pop" header=""
      :message="downloadAlertMessage" :backdropDismiss="false" :buttons="[]" @onDidDismiss="showDownloadAlert = false" />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonAlert, IonProgressBar, alertController } from '@ionic/vue';
import { ref, onMounted, computed } from 'vue';
import { App } from '@capacitor/app';
import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { FileTransfer } from '@capacitor/file-transfer';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileViewer } from "@capacitor/file-viewer";
import { FileOpener, FileOpenerOptions } from '@capacitor-community/file-opener';

const showDownloadAlert = ref(false);
const progress = ref(0);
let downloadUrl = '';
let localVersion = '';
let version = '';
const downloadAlertMessage = computed(() => `
  <div class="download-title">正在下载更新，请稍等...</div>
  <div class="download-bar">
    <div class="progress-bar">
      <div class="progress-inner" :style="'width:' + Math.round(progress.value * 100) + '%'"></div>
    </div>
  </div>
  <div class="download-text">已完成：${Math.round(progress.value * 100)}%</div>
`);

onMounted(async () => {
  // 只有安卓设备检查更新
  if (Capacitor.getPlatform() !== 'android') {
    // return;
  }
  // 获取本地版本号
  // const info = await App.getInfo();
  // console.log('当前版本信息:', info);
  // localVersion = info.version;

  // 请求接口获取最新版本
  // const res = await axios.get('https://your-api.com/version');
  // ({ version, url: downloadUrl } = res.data);

  // // 对比版本号
  // if (compareVersion(version, localVersion) > 0) {
  //   presentAlert();
  // }
  version = '2.0.1'; // 模拟最新版本号
  downloadUrl = 'https://ossgp.oss-cn-hangzhou.aliyuncs.com/pub/prod/vcard/gangpin/qyl.apk'; // 模拟下载链接
  presentAlert();
});
// 是否立即更新弹窗
const presentAlert = async () => {
  const alert = await alertController.create({
    header: '发现新版本, 是否更新?',
    cssClass: 'update-pop',
    backdropDismiss: false, // 禁止点击遮罩关闭
    message: `当前版本号：${escapeHtml(localVersion)}<br/>待更新版本号：${escapeHtml(version)}`,
    buttons: [
      { text: '取消', role: 'cancel' },
      { text: '立即更新', handler: startUpdate }
    ]
  });
  await alert.present();
};

async function startUpdate() {
  // 关闭上一个弹窗
  const top = await alertController.getTop();
  if (top) await top.dismiss();
  showDownloadAlert.value = true;
  progress.value = 0;
  const fileInfo = await Filesystem.getUri({
    directory: Directory.Documents,
    path: 'qyl.apk'
  });
  FileTransfer.addListener('progress', (prs) => {
    console.log(`Downloaded ${prs.bytes} of ${prs.contentLength}`);
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
  // 下载新版本
 const aaa = await FileTransfer.downloadFile({
    url: downloadUrl,
    path: fileInfo.uri,
    progress: true,
  });
  console.log('下载完成:', aaa);
}
const open = async (url: string) => {
  console.log('打开文件：', url);
  // 关闭下载进度弹窗
  showDownloadAlert.value = false;
  // 打开文件
  const openalert = await alertController.create({
    message: '应用下载完成，是否立即更新？',
    backdropDismiss: false, // 禁止点击遮罩关闭
    buttons: [
      { text: '取消', role: 'cancel' },
      {
        text: '打开',
        handler: async () => {
          // await FileViewer.openDocumentFromLocalPath({
          //   path: url
          // });
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
</script>
<style scoped>
.download-pop .alert-wrapper {
  min-width: 320px;
}
.download-title {
  text-align: center;
  font-size: 17px;
  margin-bottom: 18px;
  margin-top: 8px;
}
.download-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}
.progress-bar {
  width: 80%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}
.progress-inner {
  height: 100%;
  background: #3880ff;
  transition: width 0.3s;
}
.download-text {
  text-align: center;
  font-size: 15px;
  margin-top: 8px;
}
.update-pop .alert-message {
  text-align: center;
  margin-top: 12px;
  font-size: 16px;
  line-height: 1.6;
}

.update-pop .versions {
  margin-bottom: 4px;
}
</style>
