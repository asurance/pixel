/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

const semi = require('@douyinfe/semi-next').default({})

module.exports = semi(nextConfig)
