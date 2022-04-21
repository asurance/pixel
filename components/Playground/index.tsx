import {
  IconExport,
  IconFile,
  IconImage,
  IconImport,
  IconLink,
  IconPlay,
  IconStop,
} from '@douyinfe/semi-icons'
import { Button, Dropdown, SplitButtonGroup, Toast } from '@douyinfe/semi-ui'
import { FC, useCallback, useEffect, useRef, useState } from 'react'

import { useExportModal } from '@/components/ExportModal'
import { useGenerateModal } from '@/components/GenerateModal'
import Github from '@/components/Github'
import { useImportModal } from '@/components/ImportModal'
import useLastedToken from '@/hooks/useLasteToken'
import { ExportConfig, GenerateConfig, ImportConfig } from '@/interfaces/Config'
import { GetImageDataFromSrc } from '@/utils/ImageData'
import Pixelator from '@/utils/Pixelator'

import styles from './index.module.css'

type Props = {
  initialImageSrc?: string
}

const App: FC<Props> = ({ initialImageSrc = './0.jpeg' }) => {
  useEffect(() => {
    onImportOk({ url: initialImageSrc })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [fitTimeId, setFitTimeId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    return () => {
      if (fitTimeId !== null) {
        cancelAnimationFrame(fitTimeId)
      }
    }
  }, [fitTimeId])
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [pixelator, setPixelator] = useState<Pixelator | null>(null)
  useEffect(() => {
    if (canvasRef.current) {
      if (imageData) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')!
        canvas.width = imageData.width
        canvas.height = imageData.height
        ctx.putImageData(imageData, 0, 0)
      }
    }
  }, [imageData])
  const { getLastedToken, comsumeToken } = useLastedToken()
  const tryLoadBlob = useCallback(
    async (blob: Blob, token: number) => {
      const url = URL.createObjectURL(blob)
      try {
        const imageData = await GetImageDataFromSrc(url)
        comsumeToken(token, () => {
          setImageData(imageData)
          setPixelator(null)
          setLoading(false)
        })
      } catch {
        comsumeToken(token, () => {
          setLoading(false)
        })
        Toast.error('图片解析错误')
      }
      URL.revokeObjectURL(url)
    },
    [comsumeToken],
  )
  const onImportFromFile = useCallback(() => {
    const token = getLastedToken()
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.click()
    input.onchange = async () => {
      if (input.files && input.files.length > 0) {
        setLoading(true)
        await tryLoadBlob(input.files.item(0)!, token)
      }
    }
  }, [getLastedToken, tryLoadBlob])
  const onImportFromClipboard = useCallback(async () => {
    setLoading(true)
    const token = getLastedToken()
    try {
      const items = await navigator.clipboard.read()
      if (items.length > 0) {
        const item = items.at(0)!
        const blob = await item.getType(item.types[0])
        await tryLoadBlob(blob, token)
      } else {
        Toast.error('未读取到内容')
      }
    } catch {
      Toast.error('读取剪切板失败')
    }
  }, [getLastedToken, tryLoadBlob])
  const onImportOk = useCallback(
    async ({ url }: ImportConfig) => {
      setLoading(true)
      const token = getLastedToken()
      try {
        const response = await fetch(url)
        const blob = await response.blob()
        await tryLoadBlob(blob, token)
      } catch {
        Toast.error('图片下载失败')
      }
    },
    [getLastedToken, tryLoadBlob],
  )
  const { importModal, openImportModal } = useImportModal(onImportOk)
  const onGenerateOk = useCallback(
    (config: GenerateConfig) => {
      if (!imageData) return
      const pixelator = new Pixelator(imageData, config)
      setPixelator(pixelator)
      let lastCost = Infinity
      const update = () => {
        const now = Date.now()
        let time = Date.now()
        while (time - now < 10) {
          pixelator.fit()
          time = Date.now()
        }
        canvasRef.current && pixelator.toCanvas(canvasRef.current)
        const cost = pixelator.calculateCost()
        const dif = lastCost - cost
        if (dif > 0.1) {
          setFitTimeId(requestAnimationFrame(update))
        } else {
          setFitTimeId(null)
        }
        lastCost = cost
      }
      update()
    },
    [imageData],
  )
  const onClickStop = useCallback(() => {
    if (fitTimeId !== null) {
      cancelAnimationFrame(fitTimeId)
      setFitTimeId(null)
    }
  }, [fitTimeId])
  const { generateModal, openGenerateModal } = useGenerateModal(
    imageData?.width ?? 0,
    imageData?.height ?? 0,
    onGenerateOk,
  )
  const onExportOk = useCallback(
    (config: ExportConfig) => {
      pixelator?.export(config)
    },
    [pixelator],
  )
  const { openExportModal, exportModal } = useExportModal(onExportOk)
  return (
    <div className={styles.background}>
      <Github />
      <div className={styles['button-group']}>
        <SplitButtonGroup>
          <Dropdown
            trigger="click"
            clickToHide
            render={
              <Dropdown.Menu>
                <Dropdown.Item icon={<IconImage />} onClick={onImportFromFile}>
                  来自文件
                </Dropdown.Item>
                <Dropdown.Item
                  icon={<IconFile />}
                  onClick={onImportFromClipboard}
                >
                  来自剪切板
                </Dropdown.Item>
                <Dropdown.Item icon={<IconLink />} onClick={openImportModal}>
                  来自URL
                </Dropdown.Item>
              </Dropdown.Menu>
            }
          >
            <Button icon={<IconImport />}>导入图片</Button>
          </Dropdown>
          <Button
            icon={<IconPlay />}
            onClick={openGenerateModal}
            disabled={loading || fitTimeId !== null || imageData === null}
          >
            开始生成
          </Button>
          <Button
            icon={<IconStop />}
            onClick={onClickStop}
            disabled={fitTimeId === null}
          >
            停止生成
          </Button>
          <Button
            icon={<IconExport />}
            onClick={openExportModal}
            disabled={fitTimeId !== null || pixelator === null}
          >
            导出图片
          </Button>
        </SplitButtonGroup>
      </div>
      <div className={styles['canvas-container']}>
        <canvas className={styles.canvas} ref={canvasRef} />
      </div>
      {importModal}
      {generateModal}
      {exportModal}
    </div>
  )
}

export default App
