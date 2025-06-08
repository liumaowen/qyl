import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'qyl',
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
