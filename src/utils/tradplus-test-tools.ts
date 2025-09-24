// src/utils/tradplus-test-tools.ts
import { CapacitorPlugin } from '@capacitor/core'

export interface TradPlusTestToolsPlugin extends CapacitorPlugin {
  showTestTools(options: { appId: string }): Promise<void>
  isTestToolsAvailable(): Promise<{ available: boolean }>
}

import { registerPlugin } from '@capacitor/core'

const TradPlusTestTools = registerPlugin<TradPlusTestToolsPlugin>('TradPlusTestTools')

export default TradPlusTestTools