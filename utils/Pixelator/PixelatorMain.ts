import { GenerateConfig } from '@/interfaces/Config'

import Pixelator from './Pixelator'
import PixelatorCore from './PixelatorCore'

export default class PixelatorMain extends Pixelator {
  private timeID: number | null = null
  private pixelator: PixelatorCore | null = null
  generate(source: ImageData, config: GenerateConfig): void {
    this.stop()
    this.config = config
    this.pixelator = new PixelatorCore(source, config)
    let lastCost = Infinity
    const update = () => {
      const now = performance.now()
      do {
        this.pixelator!.fit()
      } while (performance.now() - now <= 10)
      this.target = this.pixelator!.toImageData()
      const cost = this.pixelator!.calculateCost()
      let finish = false
      if (lastCost - cost > 0) {
        this.timeID = requestAnimationFrame(update)
      } else {
        this.timeID = null
        finish = true
      }
      lastCost = cost
      this.onUpdate(finish)
    }
    update()
  }

  stop(): void {
    if (this.timeID !== null) {
      cancelAnimationFrame(this.timeID)
    }
  }

  dispose() {
    this.stop()
    if (this.timeID !== null) {
      cancelAnimationFrame(this.timeID)
    }
  }
}
