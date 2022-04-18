import { ChangeEvent, FC, useCallback, useMemo, useState } from 'react'
import { ExportConfig, ExportType } from '../interfaces/Config'
import Dialog from './Dialog'
import FormItem from './FormItem'

type Props = {
  open?: boolean
  onOK?: (config: ExportConfig) => void
  onCancel?: () => void
}

const ExportDialog: FC<Props> = ({ open = false, onOK: onOk, onCancel }) => {
  const [exportType, setExportType] = useState<ExportType>('png')
  const [exportSize, setExportSize] = useState<number>(1)
  const onExportTypeChange = useCallback(
    (evt: ChangeEvent<HTMLSelectElement>) => {
      setExportType(evt.target.value as ExportType)
    },
    [],
  )
  const onExportSizeChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      setExportSize(parseInt(evt.target.value, 10))
    },
    [],
  )
  const onClickOk = useCallback(() => {
    onOk?.({ type: exportType, size: exportSize })
  }, [exportSize, exportType, onOk])
  const onClickCancel = useCallback(() => {
    onCancel?.()
  }, [onCancel])
  return (
    <Dialog
      title="导出图片"
      open={open}
      containerClassName="flex-auto flex flex-col justify-center"
      onOk={onClickOk}
      onCancel={onClickCancel}
    >
      <FormItem title="导出类型">
        <select
          className="outline-none"
          id="export-type"
          title="导出类型"
          aria-label="导出类型"
          value={exportType}
          onChange={onExportTypeChange}
        >
          <option value="png">png</option>
          <option value="jpeg">jpeg</option>
        </select>
      </FormItem>
      <FormItem title="像素大小">
        <input
          type="range"
          min={1}
          max={16}
          value={exportSize}
          onChange={onExportSizeChange}
        />
        {exportSize}
      </FormItem>
    </Dialog>
  )
}

export function useExportDialog(onOK: (config: ExportConfig) => void) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const onExportOK = useCallback(
    (config: ExportConfig) => {
      setExportDialogOpen(false)
      onOK(config)
    },
    [onOK],
  )
  const onExportCancel = useCallback(() => {
    setExportDialogOpen(false)
  }, [])
  const exportDialog = useMemo(
    () => (
      <ExportDialog
        open={exportDialogOpen}
        onOK={onExportOK}
        onCancel={onExportCancel}
      />
    ),
    [exportDialogOpen, onExportCancel, onExportOK],
  )
  return {
    exportDialog,
    openExportDialog: useCallback(() => {
      setExportDialogOpen(true)
    }, []),
    closeExportDialog: useCallback(() => {
      setExportDialogOpen(false)
    }, []),
  }
}

export default ExportDialog
