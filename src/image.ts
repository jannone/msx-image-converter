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
