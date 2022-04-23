import { BaseFormApi } from '@douyinfe/semi-foundation/lib/es/form/interface'
import { Form, Modal } from '@douyinfe/semi-ui'
import { FC, useCallback, useMemo, useRef, useState } from 'react'

import { ExportConfig } from '@/interfaces/Config'

import styles from './index.module.css'

type Props = {
  visible?: boolean
  onOk?: (config: ExportConfig) => void
  onCancel?: () => void
}

const ExportModal: FC<Props> = ({ visible, onOk, onCancel }) => {
  const formApiRef = useRef<BaseFormApi<ExportConfig> | null>(null)
  const [showQuality, setShowQuality] = useState(false)
  const onGetFormApi = useCallback((formApi: BaseFormApi<ExportConfig>) => {
    formApiRef.current = formApi
  }, [])
  const onSelectChange = useCallback(
    (value: string | number | any[] | Record<string, any>) => {
      const type = value as string
      if (type === 'jpeg') {
        formApiRef.current?.setValue('quality', 0.92)
        setShowQuality(true)
      } else {
        setShowQuality(false)
      }
    },
    [],
  )
  const onModalOk = useCallback(async () => {
    if (formApiRef.current) {
      const config = await formApiRef.current.validate()
      setShowQuality(false)
      onOk?.(config)
    }
  }, [onOk])
  const onModalCancel = useCallback(() => {
    setShowQuality(false)
    onCancel?.()
  }, [onCancel])
  return (
    <Modal
      title="导出设置"
      okText="导出"
      maskClosable={false}
      closable={false}
      visible={visible}
      onOk={onModalOk}
      onCancel={onModalCancel}
    >
      <Form
        initValues={{ filename: '', type: 'png', quality: 0.92 }}
        labelPosition="left"
        labelWidth={100}
        getFormApi={onGetFormApi}
      >
        <Form.InputGroup label={{ text: '导出文件' }} style={{ width: '100%' }}>
          <Form.Input field="filename" className={styles.filename} />
          <Form.Select field="type" onChange={onSelectChange}>
            <Form.Select.Option value="png">.png</Form.Select.Option>
            <Form.Select.Option value="jpeg">.jpeg</Form.Select.Option>
          </Form.Select>
        </Form.InputGroup>
        {showQuality && (
          <Form.Slider field="quality" label="图片质量" max={1} step={0.01} />
        )}
      </Form>
    </Modal>
  )
}

export default ExportModal

export function useExportModal(onOk: (config: ExportConfig) => void) {
  const [exportModalVisible, setExportModalVisible] = useState(false)
  const onModalOk = useCallback(
    (config: ExportConfig) => {
      setExportModalVisible(false)
      onOk(config)
    },
    [onOk],
  )
  const onModalCancel = useCallback(() => {
    setExportModalVisible(false)
  }, [])
  const exportModal = useMemo(
    () => (
      <ExportModal
        visible={exportModalVisible}
        onOk={onModalOk}
        onCancel={onModalCancel}
      />
    ),
    [exportModalVisible, onModalCancel, onModalOk],
  )
  return {
    exportModal,
    openExportModal: useCallback(() => {
      setExportModalVisible(true)
    }, []),
    closeExportModal: useCallback(() => {
      setExportModalVisible(false)
    }, []),
  }
}
