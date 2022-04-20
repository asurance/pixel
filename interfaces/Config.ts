export type GenerateConfig = {
  size: number
  k: number
}

export type ExportType = 'png' | 'jpeg'
export type ExportConfig = {
  filename: string
  type: ExportType
  quality: number
}
