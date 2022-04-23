import Pixelator from './Pixelator'
import PixelatorMain from './PixelatorMain'
import PixelatorWorker from './PixelatorWorker'

export const CreatePixelator: (
  onUpdate: (finish: boolean) => void,
) => Pixelator = window.Worker
  ? (onUpdate: (finish: boolean) => void) => new PixelatorWorker(onUpdate)
  : (onUpdate: (finish: boolean) => void) => new PixelatorMain(onUpdate)
