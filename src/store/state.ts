import {reactive} from 'vue';

export const PLAYDOMAIN = 'https://video.claydai.com/';

export const state = reactive({
  tabHeight:0
})

export const setTabHeight = (height:number) => {
  state.tabHeight = height
}