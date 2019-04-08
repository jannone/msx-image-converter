import { nearestColorIndex, RGBToLab, RGBToLabPalette } from "./ciede"
import { Image, LabPalette, RGBPalette } from "./common"
import { getPixel } from "./image"

export interface DataBlocks {
  shapes: Buffer,
  colors: Buffer
}

const colorTupleToByte = (colorTuple: number[]) => colorTuple[0] * 16 + colorTuple[1]

const findColorTuple = (labPalette: LabPalette, image: Image, x: number, y: number, 
  defaultColorIndex: number): number[] => {
  let tuple: number[] = []
  for (let sx = 0; sx < 8; sx++) {
    const labPixel = RGBToLab( getPixel(image, x + sx, y) )
    const index = nearestColorIndex(labPalette, labPixel, defaultColorIndex)
    if (tuple.length === 0) {
      tuple.push(index)
    } else if (tuple.length === 1) {
      if (tuple[0] !== index) {
        tuple.push(index)
        break
      }
    }
  }
  if (tuple.length === 1) {
    tuple.push(defaultColorIndex)
  }
  if (tuple[0] < tuple[1]) {
    tuple = [ tuple[1], tuple[0] ]
  }
  return tuple
}

const findBitmask = (labPalette: LabPalette, colorTuple: number[], image: Image, x: number, y: number): number => {
  if (colorTuple[0] === colorTuple[1]) {
    return 0
  }
  let byte = 0
  const labTuple = [
    labPalette[ colorTuple[0] ],
    labPalette[ colorTuple[1] ],
  ]
  for (let sx = 0; sx < 8; sx++) {
    // tslint:disable-next-line:no-bitwise
    const bitIndex = 128 >> sx
    const labPixel = RGBToLab( getPixel(image, x + sx, y) )
    const index = nearestColorIndex(labTuple, labPixel, 0)
    const bit = (index === 0)
    if (bit) {
      // tslint:disable-next-line:no-bitwise
      byte |= bitIndex
    }
  }
  return byte
}

export const transform = (image: Image, rgbPalette: RGBPalette, defaultColorIndex: number): DataBlocks => {
  const { width, height } = image

  const labPalette = RGBToLabPalette(rgbPalette)
  const bufferSize = Math.ceil(width / 8) * height

  const shapes = Buffer.allocUnsafe(bufferSize)
  const colors = Buffer.allocUnsafe(bufferSize)

  let addr = 0
  for (let y = 0; y < height; y += 8) {
    for (let x = 0; x < width; x += 8) {
      for (let sy = 0; sy < 8; sy++, addr++) {
        const syy = sy + y
        if (syy >= height) {
          break;
        }
        const colorTuple = findColorTuple(labPalette, image, x, syy, defaultColorIndex)
        shapes[addr] = findBitmask(labPalette, colorTuple, image, x, syy)
        colors[addr] = colorTupleToByte(colorTuple)
      }
    }
  }

  return {
    shapes,
    colors
  }
}
