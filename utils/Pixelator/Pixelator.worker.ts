import {
  GenerateMessage,
  Main2WorkerMessage,
  UpdateMessage,
} from '@/interfaces/Message'
import Pixelator from '@/utils/Pixelator/PixelatorCore'

let id: number | null
let pixelator: Pixelator | null = null

addEventListener('message', (event: MessageEvent) => {
  const message = event.data as Main2WorkerMessage
  switch (message.type) {
    case 'generate':
      onGenerate(message)
      break
    case 'stop':
      onStop()
      break
  }
})

function onGenerate(message: GenerateMessage) {
  onStop()
  pixelator = new Pixelator(message.source, message.config)
  let lastCost = Infinity
  const update = () => {
    const now = performance.now()
    do {
      pixelator!.fit()
    } while (performance.now() - now <= 10)
    const cost = pixelator!.calculateCost()
    const message: UpdateMessage = {
      type: 'update',
      result: pixelator!.toImageData(),
      finish: false,
    }
    if (lastCost - cost > 0) {
      id = requestAnimationFrame(update)
    } else {
      id = null
      message.finish = true
    }
    postMessage(message)
    lastCost = cost
  }
  update()
}

function onStop() {
  if (id !== null) {
    cancelAnimationFrame(id)
    id = null
  }
}
