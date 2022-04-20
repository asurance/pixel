import { BaseFormApi } from '@douyinfe/semi-foundation/lib/es/form/interface'
import { IconInfoCircle } from '@douyinfe/semi-icons'
import { Form, Modal, Tooltip } from '@douyinfe/semi-ui'
import classnames from 'classnames'
import { FC, useCallback, useMemo, useRef, useState } from 'react'
import { GenerateConfig } from '@/interfaces/Config'
import ExceedSlider from '@/components/ExceedSlider'

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
  const [sizeValid, setSizeValid] = useState(
    imageWidth % 16 === 0 && imageHeight % 16 === 0,
  )
  const [kSafe, setKSafe] = useState(true)
  const formApiRef = useRef<BaseFormApi<GenerateConfig> | null>(null)
  const onGetFormApi = useCallback((formApi: BaseFormApi<GenerateConfig>) => {
    formApiRef.current = formApi
  }, [])
  const onSizeChange = useCallback(
    (value: number) => {
      setSizeValid(imageWidth % value === 0 && imageHeight % value === 0)
    },
    [imageHeight, imageWidth],
  )
  const onKChange = useCallback((value: number) => {
    setKSafe(value <= 64)
  }, [])
  const onModalOk = useCallback(async () => {
    if (formApiRef.current) {
      const config = await formApiRef.current.validate()
      onOK?.(config)
    }
  }, [onOK])
  const onModalCancel = useCallback(() => {
    onCancel?.()
  }, [onCancel])
  return (
    <Modal
      title="生成设置"
      okText="生成"
      maskClosable={false}
      closable={false}
      visible={visible}
      onOk={onModalOk}
      onCancel={onModalCancel}
    >
      <Form
        initValues={{ size: 16, k: 8 }}
        labelPosition="left"
        labelWidth={100}
        getFormApi={onGetFormApi}
      >
        <ExceedSlider
          className={styles['exceed-slider']}
          sliderWrapperClassName={styles.slider}
          field="size"
          label={{
            text: '像素大小',
            extra: (
              <Tooltip
                position="topLeft"
                content="图片宽度或高度无法整除，像素化结果会被裁剪"
              >
                <IconInfoCircle
                  className={classnames({
                    invisible: sizeValid,
                  })}
                />
              </Tooltip>
            ),
          }}
          min={2}
          sliderProps={{ max: 16 }}
          inputNumberProps={{
            className: styles['input-number'],
            max: Math.min(imageWidth, imageHeight),
          }}
          onChange={onSizeChange}
        />
        <ExceedSlider
          className={styles['exceed-slider']}
          sliderWrapperClassName={styles.slider}
          field="k"
          label={{
            text: '颜色数量',
            extra: (
              <Tooltip position="topLeft" content="颜色过多会影响生成时间">
                <IconInfoCircle
                  className={classnames({
                    invisible: kSafe,
                  })}
                />
              </Tooltip>
            ),
          }}
          sliderProps={{ min: 8, max: 32 }}
          inputNumberProps={{
            className: styles['input-number'],
            min: 2,
          }}
          onChange={onKChange}
        />
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
