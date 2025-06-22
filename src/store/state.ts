import { reactive } from 'vue';

export const PLAYDOMAIN = 'https://video.claydai.com/';

export interface ShortVideoConfigType {
  shortVideoRandomMax: number;
  shortVideoRandomMin: number;
}

export const shortVideoConfig = reactive<ShortVideoConfigType>({
  shortVideoRandomMax: 200,
  shortVideoRandomMin: 1
});

export const state = reactive({
  tabHeight: 0
})

export const setTabHeight = (height: number) => {
  state.tabHeight = height
};