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
    const ctx = canvas.getContext('2d')!
    canvas.width = this.target.width * this.config.size
    canvas.height = this.target.height * this.config.size
    const imageData = new ImageData(
      this.target.width * this.config.size,
      this.target.height * this.config.size,
    )
    for (let i = 0; i < this.target.height; i++) {
      for (let j = 0; j < this.target.width; j++) {
        const source = this.target.data.slice(
          (i * this.target.width + j) * 4,
          (i * this.target.width + j) * 4 + 4,
        )
        for (let y = 0; y < this.config.size; y++) {
          for (let x = 0; x < this.config.size; x++) {
            imageData.data.set(
              source,
              ((i * this.config.size + y) *
                this.target.width *
                this.config.size +
                j * this.config.size +
                x) *
                4,
            )
          }
        }
      }
    }
    ctx.putImageData(imageData, 0, 0)
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
