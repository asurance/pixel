import { FC } from 'react'

type Props = JSX.IntrinsicElements['button']

const styles = 'px-1 bg-gray-800 text-gray-50 rounded'

const Button: FC<Props> = ({ children, className, ...rest }) => (
  <button className={className ? `${styles} ${className}` : styles} {...rest}>
    {children}
  </button>
)
export default Button
