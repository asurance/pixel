export function GetImageDataFromSrc(src: string) {
  return new Promise<ImageData>((resolve, reject) => {
    const image = new Image()
    image.src = src
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')!
      context.drawImage(image, 0, 0)
      resolve(context.getImageData(0, 0, image.width, image.height))
    }
    image.onerror = reject
  })
}
