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
    const imageStorage = {
      readImage: jest.fn( (filename: string) => givenAnImage() ),
      saveImage: jest.fn( (image: Image, filename: string) => null )
    }
    const imageFunctions = {
      createImage: jest.fn( (width: number, height: number, color?: RGBColor) => givenAnImage() ),
      contrast: jest.fn( (inputImage: Image, outputImage: Image, amount: number) => null ),
      sharpen: jest.fn( (inputImage: Image, outputImage: Image, hard: boolean) => null ),
      quantize: jest.fn( (image1: Image, image2: Image, palette: Palette) => null )
    }
    const options: ConversionOptions = {
      palette: [ {r: 0, g: 0, b: 0} ],
      contrastAmount: 0
    }
    const convertImage = buildImageConverter(imageStorage, imageFunctions)
    convertImage("input.png", "output.png", options)

    expect(imageStorage.readImage.mock.calls.length).toBe(1)
    expect(imageStorage.readImage.mock.calls[0][0]).toBe("input.png")
    expect(imageStorage.saveImage.mock.calls.length).toBe(1)
    expect(imageStorage.saveImage.mock.calls[0][1]).toBe("output.png")

    expect(imageFunctions.createImage.mock.calls.length).toBe(1)
    expect(imageFunctions.contrast.mock.calls.length).toBe(1)
    expect(imageFunctions.sharpen.mock.calls.length).toBe(1)
    expect(imageFunctions.quantize.mock.calls.length).toBe(1)
  })
})
