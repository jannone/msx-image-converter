import fs = require("fs")
import path = require("path")

import TIF = require("decode-tiff")
import { PNG } from "pngjs"

import { Image } from "./common"

type ImageAdapter = (string) => Image

const pngAdapter: ImageAdapter = (filename) => {
  const filecontents = fs.readFileSync(filename)
  const png = PNG.sync.read(filecontents)
  const { width, height, data } = png
  return {
    width,
    height,
    data
  }
}

const tifAdapter: ImageAdapter = (filename) => {
  const { width, height, data } = TIF.decode(fs.readFileSync(filename))
  return {
    width,
    height,
    data
  }
}

function selectAdapter(filename) {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case ".png":
      return pngAdapter
    case ".tif":
      return tifAdapter
  }
  return null
}

export function readImage(filename) {
  const adapter = selectAdapter(filename)
  if (!adapter) {
    throw "Unrecognized image extension: " + filename
  }
  return adapter(filename)
}
