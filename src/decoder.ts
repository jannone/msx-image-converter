import fs = require('fs')
import path = require('path')

// tslint:disable-next-line:no-var-requires
const TIF = require('decode-tiff')
import { PNG } from 'pngjs'

import { Image } from './common'

type ImageAdapter = (filename: string) => Image

const pngAdapter: ImageAdapter = filename => {
  const filecontents = fs.readFileSync(filename)
  const png = PNG.sync.read(filecontents)
  const { width, height, data } = png
  return {
    width,
    height,
    data,
  }
}

const tifAdapter: ImageAdapter = filename => {
  const { width, height, data } = TIF.decode(fs.readFileSync(filename))
  return {
    width,
    height,
    data,
  }
}

function selectAdapter(filename: string) {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.png':
      return pngAdapter
    case '.tif':
      return tifAdapter
  }
  return null
}

export function readImage(filename: string) {
  const adapter = selectAdapter(filename)
  if (!adapter) {
    throw new Error('Unrecognized image extension: ' + filename)
  }
  return adapter(filename)
}
