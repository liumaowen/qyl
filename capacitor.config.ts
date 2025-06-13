import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
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
