#!/usr/bin/env node

import {
  buildImageConverter, 
  ConversionOptions, 
  FileStorageAdapter, 
  ImageFunctionsAdapter, 
  ImageStorageAdapter 
} from "./converter"
import { readImage } from "./decoder"
import { generateDataFiles, generateScreenFile } from "./file"
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
  { name: 'scr', type: String,
    description: 'SCR file to be generated', typeLabel: '{underline file.scr}' },
  { name: 'raw', type: String,
    description: 'Prefix of raw files to be generated', typeLabel: '{underline prefix}' },
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

export const buildDefaultImageConverter = (fileStorage: FileStorageAdapter) => {
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
  return buildImageConverter(imageStorage, imageFunctions, fileStorage)
}

const main = () => {
  const cliArguments = commandLineArgs(cliArgumentDefinitions)

  const imageFilename = cliArguments.input
  const scrFilename = cliArguments.scr 
  const rawPrefix = cliArguments.raw
  const previewFilename = cliArguments.preview
  const contrastAmount = cliArguments.contrast || 0

  if (cliArguments.help) {
    showHelp()
    return
  }
  if (!imageFilename) {
    return showHelp('missing input file')
  }
  if (!scrFilename && !rawPrefix && !previewFilename) {
    return showHelp('scr, raw and/or preview params required')
  }
  if (contrastAmount < 0 || contrastAmount > 255) {
    return showHelp('contrast must be between 0 and 255')
  }
  const fileStorage: FileStorageAdapter = {
    saveDataBlocks: (dataBlocks: DataBlocks) => {
      if (scrFilename) {
        generateScreenFile(dataBlocks, scrFilename)
      }
      if (rawPrefix) {
        generateDataFiles(dataBlocks, rawPrefix)
      }
    }
  }
  const convertImage = buildDefaultImageConverter(fileStorage)
  const options: ConversionOptions = {
    palette: msxPalette,
    contrastAmount,
    previewFilename,
  }
  try {
    convertImage(imageFilename, options)
  } catch (ex) {
    showHelp(ex.message)
  }
}

if (require.main === module) {
  main()
}
