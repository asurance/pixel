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

function RGBA2HSVA(color: Color): Color {
  let h = 0
  let s = 0
  const min = Math.min(...color.slice(0, 3))
  const max = Math.max(...color.slice(0, 3))
  if (max === min) {
    h = 0
  } else if (max === color[0] && color[1] >= color[2]) {
    h = 60 * ((color[1] - color[2]) / (max - min))
  } else if (max === color[0] && color[1] < color[2]) {
    h = 60 * ((color[1] - color[2]) / (max - min)) + 360
  } else if (max === color[1]) {
    h = 60 * ((color[2] - color[0]) / (max - min)) + 120
  } else if (max === color[2]) {
    h = 60 * ((color[0] - color[1]) / (max - min)) + 240
  }
  if (max === 0) {
    s = 0
  } else {
    s = (1 - min / max) * 100
  }
  return [h, s, (max / 255) * 100, color[3]]
}

function HSVA2RGBA(color: Color): Color {
  const i = Math.floor(color[0] / 60) % 6
  const s = color[1] / 100
  const v = color[2] / 100
  const f = color[0] / 60 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  let r = 0
  let g = 0
  let b = 0
  switch (i) {
    case 0:
      r = v
      g = t
      b = p
      break
    case 1:
      r = q
      g = v
      b = p
      break
    case 2:
      r = p
      g = v
      b = t
      break
    case 3:
      r = p
      g = q
      b = v
      break
    case 4:
      r = t
      g = p
      b = v
      break
    case 5:
      r = v
      g = p
      b = q
      break
  }
  return [r * 255, g * 255, b * 255, color[3]]
}
export default class Pixelator {
  private colors!: Color[][]
  private centers!: Color[]
  private indice: Map<number, Position[]>
  private config: GenerateConfig
  constructor(source: ImageData, config: GenerateConfig) {
    this.config = config
    console.log(config)
    this.initColors(source)
    this.initCenters()
    this.indice = new Map<number, Position[]>()
    this.findNearestCenter()
  }

  private colorFromRGBA(color: Color) {
    if (this.config.mode === 'rgba') {
      return color
    } else {
      return RGBA2HSVA(color)
    }
  }

  private colorToRGBA(color: Color) {
    if (this.config.mode === 'rgba') {
      return color
    } else {
      return HSVA2RGBA(color)
    }
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
        line.push(this.colorFromRGBA(color))
      }
      colors.push(line)
    }
    this.colors = colors
  }

  private initCenters() {
    const centers: Color[] = []
    for (let i = 0; i < this.config.k; i++) {
      centers.push(
        this.colorFromRGBA([
          Math.random() * 255,
          Math.random() * 255,
          Math.random() * 255,
          Math.random() * 255,
        ]),
      )
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
        this.centers[i] = this.colorFromRGBA([
          Math.random() * 255,
          Math.random() * 255,
          Math.random() * 255,
          Math.random() * 255,
        ])
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
        ctx.fillStyle = ColorToStr(this.colorToRGBA(this.centers[i]))
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
        ctx.fillStyle = ColorToStr(this.colorToRGBA(this.centers[i]))
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
