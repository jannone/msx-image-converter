import { readImage } from "./decoder"
import { savePNG, createImage, contrast } from "./image"
import * as converter from "./converter"

const convertImage = (inputFilename: string, outputFilename: string, contrastAmount: number) => {
  const image = readImage(inputFilename)
  const intermediate = createImage(image.width, image.height, {r: 0, g: 0, b: 0})
  contrast(image, intermediate, contrastAmount)

  const convertedImage = converter.convert(intermediate, converter.msxPalette)
  savePNG(convertedImage, outputFilename)
}

const showHelp = (errorMessage?: string) => {
  if (errorMessage) {
    console.error("\nERROR:", errorMessage, "\n")
  }
  console.log("Syntax: ts-node src/cli.ts <input> <output> <contrast>\n")
}

const main = () => {
  const imageFilename = process.argv[2]
  const outputFilename = process.argv[3]
  const contrastAmount = process.argv[4] ? parseInt(process.argv[4], 10) : 0
  if (!imageFilename) {
    return showHelp("missing input file")
  }
  if (!outputFilename) {
    return showHelp("missing output file")
  }
  if (contrastAmount < -255 || contrastAmount > 255) {
    return showHelp("contrast must be between -255 and 255")
  }
  convertImage(imageFilename, outputFilename, contrastAmount)
}

if (require.main === module) { 
  main()
}
