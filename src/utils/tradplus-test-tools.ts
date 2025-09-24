// src/utils/tradplus-test-tools.ts
export interface TradPlusTestToolsPlugin {
  showTestTools(options: { appId: string }): Promise<void>
  isTestToolsAvailable(): Promise<{ available: boolean }>
  addListener(eventName: string, listenerFunc: (event: any) => void): Promise<any>
  removeAllListeners(): Promise<void>
}

import { registerPlugin } from '@capacitor/core'

const TradPlusTestTools = registerPlugin<TradPlusTestToolsPlugin>('TradPlusTestTools')

export default TradPlusTestTools