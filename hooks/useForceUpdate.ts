import { useState } from 'react'

export default function useForceUpdate() {
  const [flag, setFlag] = useState(0)
  return {
    flag,
    forceUpdate() {
      setFlag((f) => f + 1)
    },
  }
}
