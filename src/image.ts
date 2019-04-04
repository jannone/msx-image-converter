import fs = require('fs')

import { Image, RGBColor } from './common'

import { PNG } from 'pngjs'

export const getPixel = (image: Image, x: number, y: number): RGBColor => {
  const { data, width } = image
  const addr = (y * width + x) * 4
  return {
    r: data[addr],
    g: data[addr + 1],
    b: data[addr + 2],
  } as RGBColor
}

export const fill = (image: Image, color: RGBColor) => {
  const { width, height, data } = image
  const size = width * height * 4
  for (let i = 0; i < size; i += 4) {
    data[i + 0] = color.r
    data[i + 1] = color.g
    data[i + 2] = color.b
    data[i + 3] = 255
  }
}

export const fillByCoord = (image: Image, fn: (x: number, y: number) => RGBColor) => {
  const { width, height, data } = image
  let i = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++, i += 4) {
      const color = fn(x, y)
      data[i + 0] = color.r
      data[i + 1] = color.g
      data[i + 2] = color.b
      data[i + 3] = 255
    }
  }
}

export const createImage = (width: number, height: number, color?: RGBColor): Image => {
  const size = width * height * 4
  const data = Buffer.allocUnsafe(size)
  const image: Image = {
    width,
    height,
    data,
  }
  if (color) {
    fill(image, color)
  }
  return image
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
