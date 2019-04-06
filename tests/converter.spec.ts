import 'jest'

import { Image, Palette, RGBColor } from '../src/common'
import { buildImageConverter, ConversionOptions, ImageFunctionsAdapter, ImageStorageAdapter } from '../src/converter'

const givenAnImage = (): Image => {
  return {
    width: 8,
    height: 8,
    data: Buffer.allocUnsafe(8 * 8)
  }
}

describe("Converter", () => {
  it("must convert an image", () => {
    const imageStorage: ImageStorageAdapter = {
      readImage: (filename: string) => givenAnImage(),
      saveImage: (image: Image, filename: string) => null
    }
    const imageFunctions: ImageFunctionsAdapter = {
      createImage: (width: number, height: number, color?: RGBColor) => givenAnImage(),
      contrast: (inputImage: Image, outputImage: Image, amount: number) => null,
      sharpen: (inputImage: Image, outputImage: Image, hard: boolean) => null,
      quantize: (image1: Image, image2: Image, palette: Palette) => null
    }
    const options: ConversionOptions = {
      palette: [ {r: 0, g: 0, b: 0} ],
      contrastAmount: 0
    }
    const convertImage = buildImageConverter(imageStorage, imageFunctions)
    convertImage("input.png", "output.png", options)
  })
})
