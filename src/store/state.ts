import { reactive,ref } from 'vue';

// export const PLAYDOMAIN = 'https://video.claydai.com/';
export let PLAYDOMAIN = 'https://woailixiaoran.ythjjt.com/';
export const isInitialized = ref(false);

// 全局初始化状态管理
export const analyticsInitState = reactive({
  isInitializing: false,
  initPromise: null as Promise<void> | null,
  lastInitTime: 0
});

export interface ShortVideoConfigType {
  shortVideoRandomMax: number;
  shortVideoRandomMin: number;
}

export const shortVideoConfig = reactive<ShortVideoConfigType>({
  shortVideoRandomMax: 10,
  shortVideoRandomMin: 1
});
export const isadlook = ref(false); // 是否有广告
export const ismgtv = ref(false);  // 是否开启mgtv

export const state = reactive({
  tabHeight: 0,
  PLAYDOMAIN: PLAYDOMAIN
})

export const setTabHeight = (height: number) => {
  state.tabHeight = height
};

// 广告状态管理
export const adStore = reactive({
  isAdLoaded: false,
  isAdShowing: false,
  adCount: 0
});

export const setAdLoaded = (loaded: boolean) => {
  adStore.isAdLoaded = loaded;
};

export const setAdShowing = (showing: boolean) => {
  adStore.isAdShowing = showing;
};

export const incrementAdCount = () => {
  adStore.adCount++;
};

export const resetAdCount = () => {
  adStore.adCount = 0;
};