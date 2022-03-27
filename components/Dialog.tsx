import { FC, PropsWithChildren, ReactNode } from 'react'
import Button from './Button'

type Props = PropsWithChildren<{
  open?: boolean
  title: ReactNode
  containerClassName?: string
  onOk?: () => void
  onCancel?: () => void
}>

const Dialog: FC<Props> = ({
  open,
  title,
  containerClassName,
  children,
  onOk,
  onCancel,
}) =>
  open ? (
    <section className="w-screen h-screen fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="w-96 h-64 p-4 rounded-md bg-white flex flex-col">
        <div className="text-center text-2xl">{title}</div>
        <div className={containerClassName}>{children}</div>
        <div className="text-center">
          <Button className="mx-6" onClick={onOk}>
            确定
          </Button>
          <Button className="mx-6" onClick={onCancel}>
            取消
          </Button>
        </div>
      </div>
    </section>
  ) : null

export default Dialog
