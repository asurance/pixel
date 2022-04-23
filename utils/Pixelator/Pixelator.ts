import { ExportConfig, GenerateConfig } from '@/interfaces/Config'

const TempCanvas = document.createElement('canvas')
const TempCtx = TempCanvas.getContext('2d')!

export default abstract class Pixelator {
  constructor(public onUpdate: (finish: boolean) => void) {}

  protected config!: GenerateConfig
  protected target!: ImageData
  abstract generate(source: ImageData, config: GenerateConfig): void
  abstract stop(): void
  abstract dispose(): void

  toCanvas(canvas: HTMLCanvasElement) {
    TempCanvas.width = this.target.width
    TempCanvas.height = this.target.height
    TempCtx.putImageData(this.target, 0, 0)
    const ctx = canvas.getContext('2d')!
    canvas.width = this.target.width * this.config.size
    canvas.height = this.target.height * this.config.size
    ctx.drawImage(TempCanvas, 0, 0, canvas.width, canvas.height)
  }

  export({ filename, type, quality }: ExportConfig) {
    TempCanvas.width = this.target.width
    TempCanvas.height = this.target.height
    TempCtx.putImageData(this.target, 0, 0)
    const url = TempCanvas.toDataURL(`image/${type}`, quality)
    const a = document.createElement('a')
    a.href = url
    a.download = filename ? `${filename}.${type}` : ''
    a.click()
  }
}
