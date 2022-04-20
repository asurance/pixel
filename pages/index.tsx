import { readdir } from 'fs'
import { GetStaticProps, NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useState } from 'react'
import { promisify } from 'util'

const Playground = dynamic(() => import('../components/Playground'), {
  ssr: false,
})

type Props = {
  imageUrls: string[]
}

const Index: NextPage<Props> = ({ imageUrls }) => {
  const [imageUrl] = useState(() => {
    const now = new Date().setMinutes(0, 0, 0) / 1000 / 60 / 60
    return imageUrls[now % imageUrls.length]
  })
  return (
    <div>
      <Head>
        <title>图片像素化</title>
        <meta name="description" content="利用无监督学习将图片转像素化的工具" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=0"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Playground initialImageSrc={imageUrl} />
    </div>
  )
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const result = await promisify(readdir)('public')
  return {
    props: {
      imageUrls: result.filter((file) => file.match(/\.jpeg$/)),
    },
  }
}

export default Index
