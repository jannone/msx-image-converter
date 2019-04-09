import { Image, RGBColor, RGBPalette } from "./common"
import { DataBlocks } from "./transformer"

const MSX_DEFAULT_COLOR_INDEX = 1

export interface ImageStorageAdapter {
  readImage: (filename: string) => Image,
  saveImage: (image: Image, filename: string) => void
}

export interface ImageFunctionsAdapter {
  createImage: (width: number, height: number, color?: RGBColor) => Image,
  contrast: (inputImage: Image, outputImage: Image, amount: number) => void,
  sharpen: (inputImage: Image, outputImage: Image, hard: boolean) => void,
  quantize: (image1: Image, image2: Image, palette: RGBPalette) => void
  transform: (image: Image, rgbPalette: RGBPalette, defaultColorIndex: number) => DataBlocks,
}

export interface FileStorageAdapter {
  saveDataBlocks: (dataBlocks: DataBlocks) => void
}

export interface ConversionOptions {
  palette: RGBPalette,
  contrastAmount: number,
  previewFilename?: string
}

export const buildImageConverter = (imageStorage: ImageStorageAdapter, imageFunctions: ImageFunctionsAdapter, 
  fileStorage: FileStorageAdapter) => {
  const { readImage, saveImage } = imageStorage
  const { createImage, contrast, sharpen, quantize, transform } = imageFunctions
  const convertImage = (inputFilename: string, options: ConversionOptions) => {
    const image1 = readImage(inputFilename)
    const image2 = createImage(image1.width, image1.height)
    contrast(image1, image2, options.contrastAmount)
    sharpen(image2, image1, false)
    quantize(image1, image2, options.palette)
    if (options.previewFilename) {
      saveImage(image2, options.previewFilename)
    }
    const dataBlocks = transform(image2, options.palette, MSX_DEFAULT_COLOR_INDEX)
    fileStorage.saveDataBlocks(dataBlocks)
  }
  return convertImage
}
