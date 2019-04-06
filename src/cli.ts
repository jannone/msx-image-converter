import { buildImageConverter, ConversionOptions, ImageFunctionsAdapter, ImageStorageAdapter } from "./converter"
import { readImage } from "./decoder"
import { contrast, sharpen } from "./filter"
import { createImage, savePNG } from "./image"
import { msxPalette, quantize } from "./quantizer"

const showHelp = (errorMessage?: string) => {
  if (errorMessage) {
    // tslint:disable-next-line:no-console
    console.error('\nERROR:', errorMessage, '\n')
  }
  // tslint:disable-next-line:no-console
  console.log('Syntax: ts-node src/cli.ts <input> <output> <contrast>\n')
}

const main = () => {
  const [ imageFilename, outputFilename, contrastAmountOpt ] = process.argv.slice(2)
  const contrastAmount = contrastAmountOpt ? parseInt(contrastAmountOpt, 10) : 0
  if (!imageFilename) {
    return showHelp('missing input file')
  }
  if (!outputFilename) {
    return showHelp('missing output file')
  }
  if (contrastAmount < -255 || contrastAmount > 255) {
    return showHelp('contrast must be between -255 and 255')
  }
  const imageStorage: ImageStorageAdapter = {
    readImage,
    saveImage: savePNG
  }
  const imageFunctions: ImageFunctionsAdapter = {
    createImage,
    contrast,
    sharpen,
    quantize,    
  }
  const options: ConversionOptions = {
    palette: msxPalette,
    contrastAmount
  }
  const convertImage = buildImageConverter(imageStorage, imageFunctions)
  try {
    convertImage(imageFilename, outputFilename, options)
  } catch (ex) {
    showHelp(ex.message)
  }
}

if (require.main === module) {
  main()
}
