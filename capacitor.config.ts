import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qyl.quanyouliao',
  appName: '全有料',
  webDir: 'dist',
  "plugins": {
    "Cordova": {
      "enable": true
    },
    "FileTransfer": {
      "enable": true
    },
    "FileOpener": {
      "enable": true
    }
  }
};

export default config;
