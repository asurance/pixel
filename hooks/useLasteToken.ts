import { useCallback, useRef } from 'react'

export default function useLastedToken() {
  const setRef = useRef(new Set<number>())
  const curRef = useRef<number | null>(null)
  return {
    getLastedToken: useCallback(() => {
      let token = Math.random()
      while (setRef.current.has(token)) {
        token = Math.random()
      }
      setRef.current.add(token)
      curRef.current = token
      return token
    }, []),
    comsumeToken: useCallback((token: number, fn: () => void) => {
      setRef.current.delete(token)
      if (curRef.current === token) {
        fn()
      }
    }, []),
  }
}
