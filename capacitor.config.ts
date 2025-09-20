import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qyl.quanyouliao',
  appName: 'shunle',
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
    },
    "StartioAds": {
      "enable": true
    }
  }
};

export default config;
