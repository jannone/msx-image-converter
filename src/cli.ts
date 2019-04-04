import * as converter from './converter'
import { readImage } from './decoder'
import { contrast, sharpen } from './filter'
import { createImage, savePNG } from './image'

const convertImage = (inputFilename: string, outputFilename: string, contrastAmount: number) => {
  const image1 = readImage(inputFilename)
  const image2 = createImage(image1.width, image1.height)
  contrast(image1, image2, contrastAmount)
  sharpen(image2, image1, false)
  converter.convert(image1, image2, converter.msxPalette)
  savePNG(image2, outputFilename)
}

const showHelp = (errorMessage?: string) => {
  if (errorMessage) {
    // tslint:disable-next-line:no-console
    console.error('\nERROR:', errorMessage, '\n')
  }
  // tslint:disable-next-line:no-console
  console.log('Syntax: ts-node src/cli.ts <input> <output> <contrast>\n')
}

const main = () => {
  const imageFilename = process.argv[2]
  const outputFilename = process.argv[3]
  const contrastAmount = process.argv[4] ? parseInt(process.argv[4], 10) : 0
  if (!imageFilename) {
    return showHelp('missing input file')
  }
  if (!outputFilename) {
    return showHelp('missing output file')
  }
  if (contrastAmount < -255 || contrastAmount > 255) {
    return showHelp('contrast must be between -255 and 255')
  }
  convertImage(imageFilename, outputFilename, contrastAmount)
}

if (require.main === module) {
  main()
}
