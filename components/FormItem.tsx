import { FC, PropsWithChildren, ReactNode } from 'react'

type Props = PropsWithChildren<{
  title: ReactNode
}>

const FormItem: FC<Props> = ({ title, children }) => (
  <p className="m-2 w-full flex items-center">
    <label className="mr-2 inline-block w-1/3 text-right" htmlFor="export-type">
      {title}
    </label>
    {children}
  </p>
)

export default FormItem
