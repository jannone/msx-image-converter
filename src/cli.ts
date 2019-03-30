import { readImage } from "./decoder"
import { savePNG } from "./image"
import * as converter from "./converter"

const convertImage = (inputFilename: string, outputFilename: string) => {
  const image = readImage(inputFilename)
  const convertedImage = converter.convert(image, converter.msxPalette)
  savePNG(convertedImage, outputFilename)
}

const showHelp = (errorMessage?: string) => {
  if (errorMessage) {
    console.error("\nERROR:", errorMessage, "\n")
  }
  console.log("Syntax: ts-node src/cli.ts <input> <output>\n")
}

const main = () => {
  const imageFilename = process.argv[2]
  const outputFilename = process.argv[3]
  if (!imageFilename) {
    return showHelp("missing input file")
  }
  if (!outputFilename) {
    return showHelp("missing output file")
  }
  convertImage(imageFilename, outputFilename)
}

if (require.main === module) { 
  main()
}
