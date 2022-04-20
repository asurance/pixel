import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Button, SplitButtonGroup } from '@douyinfe/semi-ui'
import Github from '@/components/Github'
import Pixelator from '@/Pixelator'
import { ExportConfig, GenerateConfig } from '@/interfaces/Config'
import { useGenerateModal } from '@/components/GenerateModal'
import { useExportModal } from '@/components/ExportModal'

import styles from './index.module.css'
import {
  IconExport,
  IconImport,
  IconPlay,
  IconStop,
} from '@douyinfe/semi-icons'

type Props = {
  initialImageSrc?: string
}

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
  const onGenerateOk = useCallback(({ size, k }: GenerateConfig) => {
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
  const { generateModal, openGenerateModal } = useGenerateModal(
    imageRef.current.width,
    imageRef.current.height,
    onGenerateOk,
  )
  const onExportOK = useCallback((config: ExportConfig) => {
    pixelatorRef.current.export(config)
  }, [])
  const { openExportModal, exportModal } = useExportModal(onExportOK)
  return (
    <div className={styles.background}>
      <Github />
      <div className={styles['button-group']}>
        <SplitButtonGroup>
          <Button
            icon={<IconImport />}
            onClick={onClickImport}
            disabled={
              ![PictureState.Imported, PictureState.Finished].includes(
                pictureState,
              )
            }
          >
            导入图片
          </Button>
          <Button
            icon={<IconPlay />}
            onClick={openGenerateModal}
            disabled={
              ![PictureState.Imported, PictureState.Finished].includes(
                pictureState,
              )
            }
          >
            开始生成
          </Button>
          <Button
            icon={<IconStop />}
            onClick={onClickStop}
            disabled={pictureState !== PictureState.Calculating}
          >
            停止生成
          </Button>
          <Button
            icon={<IconExport />}
            onClick={openExportModal}
            disabled={pictureState !== PictureState.Finished}
          >
            导出图片
          </Button>
        </SplitButtonGroup>
      </div>
      <div className={styles['canvas-container']}>
        <canvas className={styles.canvas} ref={canvasRef} />
      </div>
      {generateModal}
      {exportModal}
    </div>
  )
}

export default App
