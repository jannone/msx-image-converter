import 'jest'

import { convert, msxPalette } from '../src/converter'
import { createImage, plot, getPixel, fillByCoord } from '../src/image'

describe("Converter", () => {
  it("must convert directly from palette colors", () => {
    const image = createImage(256, 192)
    const output = createImage(256, 192)
    fillByCoord(image, (x, y) => {
      return msxPalette[y % 16]
    })
    convert(image, output, msxPalette)
    for (let i = 0; i < 16; i++) {
      const pixel = getPixel(output, 0, i)
      expect(pixel).toEqual(msxPalette[i])
    }
  })
})
