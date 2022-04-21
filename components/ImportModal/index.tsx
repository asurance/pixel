import { BaseFormApi } from '@douyinfe/semi-foundation/lib/es/form/interface'
import { Form, Modal, Tooltip } from '@douyinfe/semi-ui'
import { FC, useCallback, useMemo, useRef, useState } from 'react'
import { ImportConfig } from '@/interfaces/Config'
import { IconInfoCircle } from '@douyinfe/semi-icons'

type Props = {
  visible?: boolean
  onOk?: (config: ImportConfig) => void
  onCancel?: () => void
}

const ImportModal: FC<Props> = ({ visible, onOk, onCancel }) => {
  const formApiRef = useRef<BaseFormApi<ImportConfig> | null>(null)
  const onGetFormApi = useCallback((formApi: BaseFormApi<ImportConfig>) => {
    formApiRef.current = formApi
  }, [])
  const onModalOk = useCallback(async () => {
    if (formApiRef.current) {
      try {
        const config = await formApiRef.current.validate()
        onOk?.(config)
      } catch {}
    }
  }, [onOk])
  const onModalCancel = useCallback(() => {
    onCancel?.()
  }, [onCancel])
  return (
    <Modal
      title="导入设置"
      okText="导入"
      maskClosable={false}
      closable={false}
      visible={visible}
      onOk={onModalOk}
      onCancel={onModalCancel}
    >
      <Form
        initValues={{ url: '', type: 'png' }}
        labelPosition="left"
        labelWidth={100}
        getFormApi={onGetFormApi}
      >
        <Form.Input
          field="url"
          label={{
            text: 'URL',
            extra: (
              <Tooltip position="topLeft" content="仅支持允许跨域访问的URL">
                <IconInfoCircle />
              </Tooltip>
            ),
          }}
          rules={[{ required: true, message: 'URL不能为空' }]}
        />
      </Form>
    </Modal>
  )
}

export default ImportModal

export function useImportModal(onOk: (config: ImportConfig) => void) {
  const [importModalVisible, setImportModalVisible] = useState(false)
  const onModalOk = useCallback(
    (config: ImportConfig) => {
      setImportModalVisible(false)
      onOk(config)
    },
    [onOk],
  )
  const onModalCancel = useCallback(() => {
    setImportModalVisible(false)
  }, [])
  const importModal = useMemo(
    () => (
      <ImportModal
        visible={importModalVisible}
        onOk={onModalOk}
        onCancel={onModalCancel}
      />
    ),
    [importModalVisible, onModalCancel, onModalOk],
  )
  return {
    importModal,
    openImportModal: useCallback(() => {
      setImportModalVisible(true)
    }, []),
    closeImportModal: useCallback(() => {
      setImportModalVisible(false)
    }, []),
  }
}
