import {
  buildImageConverter, 
  ConversionOptions, 
  FileStorageAdapter, 
  ImageFunctionsAdapter, 
  ImageStorageAdapter 
} from "./converter"
import { readImage } from "./decoder"
import { generateScreenFile } from "./file"
import { contrast, sharpen } from "./filter"
import { createImage, savePNG } from "./image"
import { msxPalette, quantize } from "./quantizer"
import { DataBlocks, transform } from "./transformer"

// tslint:disable-next-line:no-var-requires
const commandLineArgs = require('command-line-args')
// tslint:disable-next-line:no-var-requires
const commandLineUsage = require('command-line-usage')

const cliArgumentDefinitions = [
  { name: 'input', alias: 'i', type: String, defaultOption: true,
    description: 'PNG file to be converted', typeLabel: '{underline file.png}' },
  { name: 'output', alias: 'o', type: String,
    description: 'SCR file to be generated', typeLabel: '{underline file.scr}' },
  { name: 'preview', alias: 'p', type: String,
    description: 'PNG preview file to be generated', typeLabel: '{underline file.png}' },
  { name: 'contrast', alias: 'c', type: Number,
    description: 'Amount of contrast', typeLabel: '[0-255]' },
  { name: 'help', alias: 'h', type: Boolean },
]

const showHelp = (errorMessage?: string) => {
  if (errorMessage) {
    // tslint:disable-next-line:no-console
    console.error('\nERROR:', errorMessage, '\n')
  }

  const sections = [
    {
      header: 'MSX Image Converter',
      content: 'MSX image converter based on Leandro Correia\'s source code'
    },
    {
      header: 'Options',
      optionList: cliArgumentDefinitions
    }
  ]
  const usage = commandLineUsage(sections)
  // tslint:disable-next-line:no-console
  console.log(usage)  
}

const main = () => {
  const cliArguments = commandLineArgs(cliArgumentDefinitions)

  const imageFilename = cliArguments.input
  const outputFilename = cliArguments.output 
  const previewFilename = cliArguments.preview
  const contrastAmount = cliArguments.contrast || 0

  if (cliArguments.help) {
    showHelp()
    return
  }
  if (!imageFilename) {
    return showHelp('missing input file')
  }
  if (!outputFilename && !previewFilename) {
    return showHelp('output and/or preview files required')
  }
  if (contrastAmount < 0 || contrastAmount > 255) {
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
    transform
  }
  const fileStorage: FileStorageAdapter = {
    saveDataBlocks: (dataBlocks: DataBlocks, filename: string) => generateScreenFile(dataBlocks, filename)
  }
  const options: ConversionOptions = {
    palette: msxPalette,
    contrastAmount,
    previewFilename,
  }
  const convertImage = buildImageConverter(imageStorage, imageFunctions, fileStorage)
  try {
    convertImage(imageFilename, outputFilename, options)
  } catch (ex) {
    showHelp(ex.message)
  }
}

if (require.main === module) {
  main()
}
