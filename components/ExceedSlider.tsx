import { tipFormatterBasicType } from '@douyinfe/semi-foundation/lib/es/slider/foundation'
import { InputNumber, Slider, withField } from '@douyinfe/semi-ui'
import { InputNumberProps } from '@douyinfe/semi-ui/lib/es/inputNumber'
import { SliderProps } from '@douyinfe/semi-ui/lib/es/slider'
import { CSSProperties, FC, useCallback, useRef } from 'react'

type Props = {
  className?: string
  style?: CSSProperties
  value?: number
  sliderWrapperClassName?: string
  sliderWrapperStyle?: CSSProperties
  onChange?: (value: number) => void
  min?: number
  max?: number
  sliderProps?: Omit<SliderProps, 'value' | 'onChange'>
  inputNumberProps?: Omit<InputNumberProps, 'value' | 'onChange'>
}

const defaultTipFormatter = (value: tipFormatterBasicType) => `${value}`

const ExceedSlider: FC<Props> = ({
  className,
  style,
  sliderWrapperClassName,
  sliderWrapperStyle,
  min,
  max,
  sliderProps,
  inputNumberProps,
  value = min ?? 0,
  onChange,
}) => {
  const {
    min: sliderMin = min ?? 0,
    max: sliderMax = max ?? 0,
    tipFormatter: sliderTipFormatter = defaultTipFormatter,
    ...restSliderProps
  } = sliderProps ?? {}
  const {
    min: inputNumberMin = min ?? Number.MIN_SAFE_INTEGER,
    max: inputNumberMax = max ?? Number.MAX_SAFE_INTEGER,
    ...restInputNumberProps
  } = inputNumberProps ?? {}
  const tipFormatter = useCallback(
    () => sliderTipFormatter(value),
    [sliderTipFormatter, value],
  )
  const onSliderChange = useCallback(
    (value?: number | number[]) => {
      onChange?.(value as number)
      inputNumberRef.current?.blur()
    },
    [onChange],
  )
  const inputNumberRef = useRef<HTMLInputElement | null>(null)
  const onInputNumberChange = useCallback(
    (value: string | number) => {
      const val = typeof value === 'string' ? parseInt(value) : value
      if (!isNaN(val)) {
        onChange?.(val)
      }
    },
    [onChange],
  )
  return (
    <div className={className} style={style}>
      <div className={sliderWrapperClassName} style={sliderWrapperStyle}>
        <Slider
          value={value}
          min={sliderMin}
          max={sliderMax}
          tipFormatter={tipFormatter}
          onChange={onSliderChange}
          {...restSliderProps}
        />
      </div>
      <InputNumber
        ref={inputNumberRef}
        value={value}
        min={inputNumberMin}
        max={inputNumberMax}
        onChange={onInputNumberChange}
        {...restInputNumberProps}
      />
    </div>
  )
}

export default withField(ExceedSlider)
