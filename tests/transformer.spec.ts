import 'jest'

import { fillByCoord } from '../src/image'
import { DataBlocks, transform } from '../src/transformer'

describe("Transformer", () => {
  it("must transform an image to shapes and colors", () => {
    const image = {
      width: 8,
      height: 3,
      data: Buffer.allocUnsafe(8 * 3 * 4)
    }
    const rgbPalette = [
      {r: 255, g: 0, b: 0},
      {r: 0, g: 255, b: 0},
      {r: 0, g: 0, b: 255},
      {r: 255, g: 255, b: 255},
    ]
    fillByCoord(image, (x, y) => {
      return (x === y) ? rgbPalette[3] : rgbPalette[y % 3]
    })
    const dataBlocks: DataBlocks = transform(image, rgbPalette, 0)
    expect(dataBlocks).toEqual({
      shapes: Buffer.from([128, 64, 32]),
      colors: Buffer.from([48, 49, 50])
    })
  })
})
