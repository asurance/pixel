export type CreateConfig = {
  size: number
  k: number
}

export type ExportType = 'png' | 'jpeg'
export type ExportConfig = {
  type: ExportType
  size: number
}
