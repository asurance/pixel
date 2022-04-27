import { GenerateConfig } from '@/interfaces/Config'
import {
  GenerateMessage,
  StopMessage,
  Worker2MainMessage,
} from '@/interfaces/Message'

import Pixelator from './Pixelator'

export default class PixelatorWorker extends Pixelator {
  private worker = new Worker(new URL('./Pixelator.worker', import.meta.url))
  private generating = false

  constructor(onUpdate: (finish: boolean) => void) {
    super(onUpdate)
    this.worker.onmessage = (evt) => {
      const message = evt.data as Worker2MainMessage
      switch (message.type) {
        case 'update':
          this.target = message.result
          this.onUpdate(message.finish)
          break
      }
    }
  }

  generate(source: ImageData, config: GenerateConfig): void {
    this.stop()
    this.config = config
    const message: GenerateMessage = {
      type: 'generate',
      source,
      config,
    }
    this.worker.postMessage(message)
    this.generating = true
  }

  stop(): void {
    if (this.generating) {
      const message: StopMessage = {
        type: 'stop',
      }
      this.worker.postMessage(message)
      this.generating = false
    }
  }

  dispose() {
    this.stop()
    this.worker.terminate()
  }
}
