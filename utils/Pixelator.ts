import { ExportConfig, GenerateConfig } from '@/interfaces/Config'

type Color = [number, number, number, number]
type Position = [number, number]

function ColorToStr(color: Color): string {
  return `#${color
    .map((val) => `0${Math.round(val).toString(16)}`.slice(-2))
    .join('')}`
}

function CalculateDifference(a: Color, b: Color) {
  let sum = 0
  for (let i = 0; i < 4; i++) {
    sum += (a[i] - b[i]) * (a[i] - b[i])
  }
  return sum
}

export default class Pixelator {
  private colors!: Color[][]
  private centers!: Color[]
  private indice: Map<number, Position[]>
  private config: GenerateConfig
  constructor(source: ImageData, config: GenerateConfig) {
    this.config = config
    this.initColors(source)
    this.initCenters()
    this.indice = new Map<number, Position[]>()
    this.findNearestCenter()
  }

  private initColors(source: ImageData) {
    const colors: Color[][] = []
    for (let i = 0; (i + 1) * this.config.size <= source.height; i++) {
      const line: Color[] = []
      for (let j = 0; (j + 1) * this.config.size <= source.width; j++) {
        const color: Color = [0, 0, 0, 0]
        for (
          let row = i * this.config.size;
          row < (i + 1) * this.config.size;
          row++
        ) {
          for (
            let col = j * this.config.size;
            col < (j + 1) * this.config.size;
            col++
          ) {
            color[0] += source.data[(row * source.width + col) * 4]
            color[1] += source.data[(row * source.width + col) * 4 + 1]
            color[2] += source.data[(row * source.width + col) * 4 + 2]
            color[3] += source.data[(row * source.width + col) * 4 + 3]
          }
        }
        for (let i = 0; i < 4; i++) {
          color[i] /= this.config.size * this.config.size
        }
        line.push(color)
      }
      colors.push(line)
    }
    this.colors = colors
  }

  private initCenters() {
    const centers: Color[] = []
    for (let i = 0; i < this.config.k; i++) {
      centers.push([
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
      ])
    }
    this.centers = centers
  }

  fit() {
    this.recalculateCenter()
    this.findNearestCenter()
  }

  private findNearestCenter() {
    this.indice.clear()
    for (let row = 0; row < this.colors.length; row++) {
      for (let col = 0; col < this.colors[0].length; col++) {
        const color = this.colors[row][col]
        let minIndex = 0
        let minDif = CalculateDifference(color, this.centers[0])
        for (let i = 1; i < this.config.k; i++) {
          const dif = CalculateDifference(color, this.centers[i])
          if (dif < minDif) {
            minDif = dif
            minIndex = i
          }
        }
        let list: Position[]
        if (this.indice.has(minIndex)) {
          list = this.indice.get(minIndex)!
        } else {
          list = []
          this.indice.set(minIndex, list)
        }
        list.push([row, col])
      }
    }
  }

  private recalculateCenter() {
    for (let i = 0; i < this.config.k; i++) {
      if (this.indice.has(i)) {
        const list = this.indice.get(i)!
        const center: Color = [0, 0, 0, 0]
        for (const [row, col] of list) {
          const color = this.colors[row][col]
          for (let j = 0; j < 4; j++) {
            center[j] += color[j]
          }
        }
        for (let j = 0; j < 4; j++) {
          center[j] /= list.length
        }
        this.centers[i] = center
      } else {
        this.centers[i] = [
          Math.random() * 255,
          Math.random() * 255,
          Math.random() * 255,
          Math.random() * 255,
        ]
      }
    }
  }

  calculateCost(): number {
    let result = 0
    for (let i = 0; i < this.config.k; i++) {
      if (this.indice.has(i)) {
        for (const [row, col] of this.indice.get(i)!) {
          result += CalculateDifference(this.centers[i], this.colors[row][col])
        }
      }
    }
    return result / this.colors.length / this.colors[0].length
  }

  toCanvas(canvas: HTMLCanvasElement) {
    canvas.width = this.colors[0].length * this.config.size
    canvas.height = this.colors.length * this.config.size
    const ctx = canvas.getContext('2d')!
    for (let i = 0; i < this.config.k; i++) {
      if (this.indice.has(i)) {
        ctx.fillStyle = ColorToStr(this.centers[i])
        for (const [row, col] of this.indice.get(i)!) {
          ctx.fillRect(
            col * this.config.size,
            row * this.config.size,
            this.config.size,
            this.config.size,
          )
        }
      }
    }
  }

  export({ filename, type, quality }: ExportConfig) {
    const canvas = document.createElement('canvas')
    canvas.width = this.colors[0].length
    canvas.height = this.colors.length
    const ctx = canvas.getContext('2d')!
    for (let i = 0; i < this.config.k; i++) {
      if (this.indice.has(i)) {
        ctx.fillStyle = ColorToStr(this.centers[i])
        for (const [row, col] of this.indice.get(i)!) {
          ctx.fillRect(col, row, 1, 1)
        }
      }
    }
    const url = canvas.toDataURL(`image/${type}`, quality)
    const a = document.createElement('a')
    a.href = url
    a.download = filename ? `${filename}.${type}` : ''
    a.click()
  }
}
