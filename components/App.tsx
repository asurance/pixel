import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useExportDialog } from './ExportDialog'
import Button from './Button'
import CreateDialog, { useCreateDialog } from './CreateDialog'
import Github from './Github'
import Pixelator from '../Pixelator'
import { CreateConfig, ExportConfig } from '../interfaces/Config'

type Props = {
  initialImageSrc?: string
}

const imageUrls = ['./0.jpeg', './1.jpeg', './2.jpeg', './3.jpeg', './4.jpeg']

const enum PictureState {
  Loading,
  Imported,
  Calculating,
  Finished,
}

const App: FC<Props> = ({ initialImageSrc = './0.jpeg' }) => {
  const [pictureState, setPictureState] = useState(PictureState.Loading)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageRef = useRef(new Image())
  const pixelatorRef = useRef(new Pixelator(imageRef.current))
  useEffect(() => {
    const image = imageRef.current
    image.src = initialImageSrc
    image.onload = () => {
      URL.revokeObjectURL(image.src)
      setPictureState(PictureState.Imported)
      if (canvasRef.current) {
        const canvas = canvasRef.current
        canvas.width = image.width
        canvas.height = image.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(image, 0, 0)
      }
    }
    return () => {
      image.onload = null
      URL.revokeObjectURL(image.src)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const onClickImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.click()
    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        imageRef.current.src = URL.createObjectURL(input.files![0])
        setPictureState(PictureState.Loading)
      }
    }
  }, [])
  const timeIdRef = useRef<number | null>(null)
  useEffect(() => {
    return () => {
      if (timeIdRef.current !== null) {
        cancelAnimationFrame(timeIdRef.current)
      }
    }
  }, [])
  const onCreateOK = useCallback(({ size, k }: CreateConfig) => {
    const pixelator = pixelatorRef.current
    pixelator.setSize(size).setK(k)
    let lastCost = Infinity
    const update = () => {
      pixelator.fit()
      canvasRef.current && pixelator.toCanvas(canvasRef.current)
      const cost = pixelator.calculateCost()
      const dif = lastCost - cost
      if (dif > 0.1) {
        timeIdRef.current = requestAnimationFrame(update)
      } else {
        timeIdRef.current = null
        setPictureState(PictureState.Finished)
      }
      lastCost = cost
    }
    update()
    setPictureState(PictureState.Calculating)
  }, [])
  const onClickStop = () => {
    if (timeIdRef.current !== null) {
      cancelAnimationFrame(timeIdRef.current)
      timeIdRef.current = null
    }
    setPictureState(PictureState.Finished)
  }
  const { createDialog, openCreateDialog } = useCreateDialog(
    imageRef.current.width,
    imageRef.current.height,
    onCreateOK,
  )
  const onExportOK = useCallback((config: ExportConfig) => {
    pixelatorRef.current.export(config)
  }, [])
  const { openExportDialog, exportDialog } = useExportDialog(onExportOK)
  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50">
      <Github />
      <div className="fixed opacity-20 hover:opacity-100 transition-opacity">
        {[PictureState.Imported, PictureState.Finished].includes(
          pictureState,
        ) && (
          <Button className="m-1" onClick={onClickImport}>
            导入图片
          </Button>
        )}
        {[PictureState.Imported, PictureState.Finished].includes(
          pictureState,
        ) && (
          <Button className="m-1" onClick={openCreateDialog}>
            开始生成
          </Button>
        )}
        {pictureState === PictureState.Calculating && (
          <Button className="m-1" onClick={onClickStop}>
            停止生成
          </Button>
        )}
        {pictureState === PictureState.Finished && (
          <Button className="m-1" onClick={openExportDialog}>
            导出图片
          </Button>
        )}
      </div>
      <div className="w-screen h-screen grid place-items-center">
        <canvas
          className="bg-white p-4 border-2 border-black rounded-lg"
          ref={canvasRef}
        />
      </div>
      {createDialog}
      {exportDialog}
    </div>
  )
}

export default App
