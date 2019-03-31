import 'jest'

import { convert, msxPalette } from '../src/converter'
import { createImage, plot, getPixel } from '../src/image'

describe("Converter", () => {
  it("must convert directly from palette colors", () => {
    const image = createImage(256, 192, {r: 0, g: 0, b: 0})
    for (let i = 0; i < 16; i++) {
      plot(image, 0, i, msxPalette[i])
    }
    const output = convert(image, msxPalette)
    for (let i = 0; i < 16; i++) {
      const pixel = getPixel(output, 0, i)
      expect(pixel).toEqual(msxPalette[i])
    }
  })
})
