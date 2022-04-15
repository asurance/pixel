import { ExportConfig } from './interfaces/Config'

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
  size = 16
  k = 16
  width = 0
  height = 0
  colors: Color[][] = []
  centers: Color[] = []
  indice = new Map<number, Position[]>()
  constructor(public image: HTMLImageElement) {}

  setSize(size = 16): this {
    this.size = size
    this.colors.length = 0
    const canvas = document.createElement('canvas')
    canvas.width = this.image.width
    canvas.height = this.image.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(this.image, 0, 0)
    const imageData = ctx.getImageData(
      0,
      0,
      this.image.width,
      this.image.height,
    )
    for (let i = 0; (i + 1) * this.size <= this.image.height; i++) {
      const line: Color[] = []
      for (let j = 0; (j + 1) * this.size <= this.image.width; j++) {
        const color: Color = [0, 0, 0, 0]
        for (let row = i * this.size; row < (i + 1) * this.size; row++) {
          for (let col = j * this.size; col < (j + 1) * this.size; col++) {
            color[0] += imageData.data[(row * this.image.width + col) * 4]
            color[1] += imageData.data[(row * this.image.width + col) * 4 + 1]
            color[2] += imageData.data[(row * this.image.width + col) * 4 + 2]
            color[3] += imageData.data[(row * this.image.width + col) * 4 + 3]
          }
        }
        for (let i = 0; i < 4; i++) {
          color[i] /= this.size * this.size
        }
        line.push(color)
      }
      this.colors.push(line)
    }
    this.height = this.colors.length
    this.width = this.colors[0].length
    return this
  }

  setK(k = 16): this {
    this.k = k
    this.centers.length = 0
    for (let i = 0; i < this.k; i++) {
      this.centers[i] = [
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
      ]
    }
    return this
  }

  fit() {
    this.indice.clear()
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const color = this.colors[row][col]
        let minIndex = 0
        let minDif = CalculateDifference(color, this.centers[0])
        for (let i = 1; i < this.k; i++) {
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
    for (let i = 0; i < this.k; i++) {
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
    for (let i = 0; i < this.k; i++) {
      if (this.indice.has(i)) {
        for (const [row, col] of this.indice.get(i)!) {
          result += CalculateDifference(this.centers[i], this.colors[row][col])
        }
      }
    }
    return result / this.width / this.height
  }

  toCanvas(canvas: HTMLCanvasElement) {
    canvas.width = this.width * this.size
    canvas.height = this.height * this.size
    const ctx = canvas.getContext('2d')!
    for (let i = 0; i < this.k; i++) {
      if (this.indice.has(i)) {
        ctx.fillStyle = ColorToStr(this.centers[i])
        for (const [row, col] of this.indice.get(i)!) {
          ctx.fillRect(col * this.size, row * this.size, this.size, this.size)
        }
      }
    }
  }

  export({ type, size }: ExportConfig) {
    const canvas = document.createElement('canvas')
    canvas.width = this.width * size
    canvas.height = this.height * size
    const ctx = canvas.getContext('2d')!
    for (let i = 0; i < this.k; i++) {
      if (this.indice.has(i)) {
        ctx.fillStyle = ColorToStr(this.centers[i])
        for (const [row, col] of this.indice.get(i)!) {
          ctx.fillRect(col * size, row * size, size, size)
        }
      }
    }
    const url = canvas.toDataURL(type === 'png' ? 'image/png' : 'image/jpeg', 1)
    const a = document.createElement('a')
    a.href = url
    a.download = ''
    a.click()
  }
}
