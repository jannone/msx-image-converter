import fs = require("fs")

import { Image, RGBColor } from "./common"

const PNG = require('pngjs').PNG

export const getPixel = (image: Image, x: number, y: number): RGBColor => {
  const { data, width } = image
  const addr = (y * width + x) * 4
  return {
    r: data[addr],
    g: data[addr + 1],
    b: data[addr + 2]
  } as RGBColor 
}

export const createImage = (width: number, height: number, color: RGBColor): Image => {
  const size = width * height * 4
  const data = Buffer.allocUnsafe(size)
  for (let i = 0; i < size; i += 4) {
    data[i + 0] = color.r
    data[i + 1] = color.g
    data[i + 2] = color.b
    data[i + 3] = 255
  }
  return {
    width,
    height,
    data
  } as Image
}

export const plot = (image: Image, x: number, y: number, color: RGBColor) => {
  const { data, width } = image
  const addr = (y * width + x) * 4
  data[addr + 0] = color.r
  data[addr + 1] = color.g
  data[addr + 2] = color.b
  data[addr + 3] = 255
}

export const contrast = (inputImage: Image, outputImage: Image, amount: number) => {
  if (amount < -255 || amount > 255) {
    throw "Contrast amount must be in the interval of [-255, 255]"
  }
  const factor = (259 * (amount + 255)) / (255 * (259 - amount))
  const trunc = (value: number) => (value < 0) ? 0 : ((value > 255) ? 255 : value)
  const apply = (value: number, factor: number) => trunc(factor * (value - 128) + 128)
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

export const savePNG = (image: Image, filename: string) => {
  const { width, height, data } = image
  const size = image.data.length
  const png = new PNG({ width, height })
  const pngData = png.data
  for (let i = 0; i < size; i++) {
    pngData[i] = data[i]
  }
  png.pack().pipe(fs.createWriteStream(filename))
}
