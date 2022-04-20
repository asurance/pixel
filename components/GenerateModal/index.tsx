import { BaseFormApi } from '@douyinfe/semi-foundation/lib/es/form/interface'
import { IconInfoCircle } from '@douyinfe/semi-icons'
import { Form, Modal, Tooltip } from '@douyinfe/semi-ui'
import classnames from 'classnames'
import { FC, useCallback, useMemo, useRef, useState } from 'react'
import { GenerateConfig } from '../../interfaces/Config'

import styles from './index.module.css'

type Props = {
  imageWidth: number
  imageHeight: number
  visible?: boolean
  onOK?: (config: GenerateConfig) => void
  onCancel?: () => void
}

const GeneratorModal: FC<Props> = ({
  imageWidth,
  imageHeight,
  visible,
  onOK,
  onCancel,
}) => {
  const [sizeValid, setSizeValid] = useState(true)
  const formApiRef = useRef<BaseFormApi<GenerateConfig> | null>(null)
  const onGetFormApi = useCallback((formApi: BaseFormApi<GenerateConfig>) => {
    formApiRef.current = formApi
  }, [])
  const onSizeChange = useCallback(
    (value?: number | number[]) => {
      const val = value as number
      setSizeValid(imageWidth % val === 0 && imageHeight % val === 0)
    },
    [imageHeight, imageWidth],
  )
  const onModalOk = useCallback(async () => {
    if (formApiRef.current) {
      const config = await formApiRef.current.validate()
      console.log(config)
      onOK?.(config)
    }
  }, [onOK])
  const onModalCancel = useCallback(() => {
    onCancel?.()
  }, [onCancel])
  return (
    <Modal
      title="生成设置"
      centered
      okText="生成"
      size="medium"
      maskClosable={false}
      closable={false}
      visible={visible}
      onOk={onModalOk}
      onCancel={onModalCancel}
    >
      <Form
        initValues={{ size: 16, k: 1 }}
        labelPosition="left"
        labelWidth={100}
        getFormApi={onGetFormApi}
      >
        <Form.Slider
          field="size"
          label={
            <span className={styles.label}>
              像素大小
              <Tooltip
                position="topLeft"
                content="图片宽度或高度无法整除，像素化结果会被裁剪"
              >
                <IconInfoCircle
                  className={classnames(styles.icon, {
                    [styles.hide]: sizeValid,
                  })}
                />
              </Tooltip>
            </span>
          }
          min={2}
          max={16}
          onChange={onSizeChange}
        />
        <Form.Slider field="k" label="颜色数量" min={8} max={32} step={8} />
      </Form>
    </Modal>
  )
}

export default GeneratorModal

export function useGenerateModal(
  imageWidth: number,
  imageHeight: number,
  onOk: (config: GenerateConfig) => void,
) {
  const [generateModalVisible, setGenerateModalVisible] = useState(false)
  const onModalOk = useCallback(
    (config: GenerateConfig) => {
      setGenerateModalVisible(false)
      onOk(config)
    },
    [onOk],
  )
  const onModalCancel = useCallback(() => {
    setGenerateModalVisible(false)
  }, [])
  const generateModal = useMemo(
    () => (
      <GeneratorModal
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        visible={generateModalVisible}
        onOK={onModalOk}
        onCancel={onModalCancel}
      />
    ),
    [generateModalVisible, imageHeight, imageWidth, onModalCancel, onModalOk],
  )
  return {
    generateModal,
    openGenerateModal: useCallback(() => {
      setGenerateModalVisible(true)
    }, []),
    closeGenerateModal: useCallback(() => {
      setGenerateModalVisible(false)
    }, []),
  }
}
