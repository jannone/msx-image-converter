import { Image } from "./common"

type ConvolutionKernel = number[]

const clamp = (value: number) => (value < 0) ? 0 : ((value > 255) ? 255 : value)

export const contrast = (inputImage: Image, outputImage: Image, amount: number) => {
  if (amount < -255 || amount > 255) {
    throw "Contrast amount must be in the interval of [-255, 255]"
  }
  const factor = (259 * (amount + 255)) / (255 * (259 - amount))
  const apply = (value: number, factor: number) => clamp(factor * (value - 128) + 128)
  const inputData = inputImage.data
  const outputData = outputImage.data
  const size = inputImage.data.length
  for (let i = 0; i < size; i += 4) {
    outputData[i]     = apply(inputData[i], factor)
    outputData[i + 1] = apply(inputData[i + 1], factor)
    outputData[i + 2] = apply(inputData[i + 2], factor)
    outputData[i + 3] = inputData[i + 3]
  }
}

const convolution = (inputImage: Image, outputImage: Image, weights: ConvolutionKernel, opaque: boolean) => {
  const side = Math.round(Math.sqrt(weights.length))
  const halfSide = Math.floor(side/2)
  const { width, height, data } = inputImage
  const dst = outputImage.data
  const alphaFac = opaque ? 1 : 0
  for (let y=0; y < height; y++) {
      for (let x=0; x < width; x++) {
          const sy = y
          const sx = x
          const dstOff = (y * width + x) * 4
          let r=0, g=0, b=0, a=0
          for (let cy=0; cy < side; cy++) {
              for (let cx=0; cx < side; cx++) {
                  const scy = sy + cy - halfSide
                  const scx = sx + cx - halfSide
                  if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
                      const srcOff = (scy * width + scx) * 4
                      const wt = weights[cy * side + cx]
                      r += data[srcOff] * wt
                      g += data[srcOff + 1] * wt
                      b += data[srcOff + 2] * wt
                      a += data[srcOff + 3] * wt
                  }
              }
          }
          dst[dstOff] = clamp(r)
          dst[dstOff + 1] = clamp(g)
          dst[dstOff + 2] = clamp(b)
          dst[dstOff + 3] = clamp(a + alphaFac * (255 - a))
      }
  }
  return dst
}

export const sharpen = (inputImage: Image, outputImage: Image, hard: boolean) => {
  convolution(inputImage, outputImage, hard ? kernelSharpenHard() : kernelSharpenSoft(), true)
}

export const kernelSharpenHard = (): ConvolutionKernel => {
  return [ -1, -1, -1,
    -1,  9, -1,
    -1, -1, -1 ]
}

export const kernelSharpenSoft = (): ConvolutionKernel => {
  return [ 0, -1, 0,
    -1,  5, -1,
    0, -1, 0 ]
}

export const kernelSobel = (): ConvolutionKernel => {
  return [ -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1 ]
}

export const kernelBlur = (value: number): ConvolutionKernel => {
  const offset = 1 / (value / 10);
  return [offset, offset, offset,
    offset, offset, offset,
    offset, offset, offset ]
}
