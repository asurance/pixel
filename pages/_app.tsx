import { AppProps } from 'next/app'

import '../global.css'

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default App
