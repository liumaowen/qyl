// src/utils/tradplus-test-tools.ts
export interface TradPlusTestToolsPlugin {
  showTestTools(options: { appId: string }): Promise<void>
  isTestToolsAvailable(): Promise<{ available: boolean }>
}

import { registerPlugin } from '@capacitor/core'

const TradPlusTestTools = registerPlugin<TradPlusTestToolsPlugin>('TradPlusTestTools')

export default TradPlusTestTools