import { GenerateConfig } from './Config'

export type Main2WorkerMessage = GenerateMessage | StopMessage

export type Worker2MainMessage = UpdateMessage

export interface GenerateMessage {
  type: 'generate'
  source: ImageData
  config: GenerateConfig
}

export interface StopMessage {
  type: 'stop'
}

export interface UpdateMessage {
  type: 'update'
  result: ImageData
  finish: boolean
}
