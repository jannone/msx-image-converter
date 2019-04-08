import fs = require('fs')

import { DataBlocks } from "./transformer"

const generateIntermediateData = () => {
  const data = Buffer.alloc(2048, 0)
  let addr = 0
  for (let r = 0; r < 3; r++) {
    for (let x = 0; x < 256; x++) {
      data[addr++] = x
    }
  }
  for (let r = 0; r < 32; r++) {
    data[addr++] = 209
    data[addr++] = 0
    data[addr++] = r
    data[addr++] = 15
  }
  return data
}

const generateHeader = (from: number, size: number) => {
  const end = size + from - 1
  return Buffer.from([
    // tslint:disable-next-line:no-bitwise
    254, from & 255, (from >> 8) & 255, end & 255, (end >> 8) & 255, from & 255, (from >> 8) & 255
  ])
}

export const generateScreenFile = (dataBlocks: DataBlocks, filename: string) => {
  const intermediateData = generateIntermediateData()
  const header = generateHeader(0, dataBlocks.shapes.length + intermediateData.length + dataBlocks.colors.length)
  fs.writeFileSync(filename, header)
  fs.appendFileSync(filename, dataBlocks.shapes)
  fs.appendFileSync(filename, intermediateData)
  fs.appendFileSync(filename, dataBlocks.colors)
}
