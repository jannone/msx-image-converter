import { Image, Palette, RGBColor } from "./common"

export interface ImageStorageAdapter {
  readImage: (filename: string) => Image,
  saveImage: (image: Image, filename: string) => void
}

export interface ImageFunctionsAdapter {
  createImage: (width: number, height: number, color?: RGBColor) => Image,
  contrast: (inputImage: Image, outputImage: Image, amount: number) => void,
  sharpen: (inputImage: Image, outputImage: Image, hard: boolean) => void,
  quantize: (image1: Image, image2: Image, palette: Palette) => void
}

export interface ConversionOptions {
  palette: Palette,
  contrastAmount: number
}

export const buildImageConverter = (imageStorage: ImageStorageAdapter, imageFunctions: ImageFunctionsAdapter) => {
  const { readImage, saveImage } = imageStorage
  const { createImage, contrast, sharpen, quantize } = imageFunctions
  const convertImage = (inputFilename: string, outputFilename: string, options: ConversionOptions) => {
    const image1 = readImage(inputFilename)
    const image2 = createImage(image1.width, image1.height)
    contrast(image1, image2, options.contrastAmount)
    sharpen(image2, image1, false)
    quantize(image1, image2, options.palette)
    saveImage(image2, outputFilename)
  }
  return convertImage
}
