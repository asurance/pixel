import { useMemo } from 'react'
import { ChangeEvent, FC, useCallback, useState } from 'react'
import { CreateConfig } from '../interfaces/Config'
import Dialog from './Dialog'
import FormItem from './FormItem'

type Props = {
  imageWidth: number
  imageHeight: number
  open?: boolean
  onOK?: (config: CreateConfig) => void
  onCancel?: () => void
}

const CreateDialog: FC<Props> = ({
  open = false,
  imageWidth,
  imageHeight,
  onOK,
  onCancel,
}) => {
  const [createSize, setCreateSize] = useState<number>(16)
  const [createK, setCreateK] = useState<number>(16)
  const onCreateSizeChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      setCreateSize(parseInt(evt.target.value, 10))
    },
    [],
  )
  const onCreateKChange = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    setCreateK(parseInt(evt.target.value, 10))
  }, [])
  const onClickOk = useCallback(() => {
    onOK?.({ size: createSize, k: createK })
  }, [createK, createSize, onOK])
  const onClickCancel = useCallback(() => {
    onCancel?.()
  }, [onCancel])
  const shouldShowTips =
    imageWidth % createSize !== 0 || imageHeight % createSize !== 0
  return (
    <Dialog
      title="生成配置"
      open={open}
      containerClassName="flex-auto flex flex-col justify-center"
      onOk={onClickOk}
      onCancel={onClickCancel}
    >
      <FormItem title="像素大小">
        <input
          type="range"
          min={2}
          max={16}
          value={createSize}
          onChange={onCreateSizeChange}
        />
        {createSize}
        {shouldShowTips ? (
          <span
            className="ml-1 w-auto h-4 aspect-square text-xs font-bold border-2 border-black rounded-full flex justify-center items-center"
            title="图片宽高无法整除,结果会有裁剪"
          >
            !
          </span>
        ) : null}
      </FormItem>
      <FormItem title="颜色数量">
        <input
          type="range"
          min={8}
          max={32}
          step={8}
          value={createK}
          onChange={onCreateKChange}
        />
        {createK}
      </FormItem>
    </Dialog>
  )
}

export function useCreateDialog(
  imageWidth: number,
  imageHeight: number,
  onOK: (config: CreateConfig) => void,
) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const onCreateOK = useCallback(
    (config: CreateConfig) => {
      setCreateDialogOpen(false)
      onOK(config)
    },
    [onOK],
  )
  const onCreateCancel = useCallback(() => {
    setCreateDialogOpen(false)
  }, [])
  const createDialog = useMemo(
    () => (
      <CreateDialog
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        open={createDialogOpen}
        onOK={onCreateOK}
        onCancel={onCreateCancel}
      />
    ),
    [createDialogOpen, imageHeight, imageWidth, onCreateCancel, onCreateOK],
  )
  return {
    createDialog,
    openCreateDialog: useCallback(() => {
      setCreateDialogOpen(true)
    }, []),
    closeCreateDialog: useCallback(() => {
      setCreateDialogOpen(false)
    }, []),
  }
}

export default CreateDialog
