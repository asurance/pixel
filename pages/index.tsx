import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'

const App = dynamic(() => import('../components/App'), {
  ssr: false,
})

const Index: NextPage = () => (
  <div>
    <Head>
      <title>图片像素化</title>
      <meta name="description" content="利用无监督学习将图片转像素化的工具" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <App />
  </div>
)

export default Index
