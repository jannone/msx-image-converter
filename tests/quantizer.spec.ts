import 'jest'

import { createImage, fillByCoord, getPixel } from '../src/image'
import { msxPalette, quantize } from '../src/quantizer'

describe("Quantizer", () => {
  it("must quantize image with multiple of 8 size", () => {
    const image = createImage(64, 8, msxPalette[12])
    const output = createImage(64, 8)
    quantize(image, output, msxPalette)
    const pixel = getPixel(output, 63, 7)
    expect(pixel).toEqual(msxPalette[12])
  })

  it("must quantize directly from palette colors", () => {
    const image = createImage(256, 192)
    const output = createImage(256, 192)
    fillByCoord(image, (x, y) => {
      return msxPalette[y % 16]
    })
    quantize(image, output, msxPalette)
    for (let i = 0; i < 16; i++) {
      const pixel = getPixel(output, 0, i)
      expect(pixel).toEqual(msxPalette[i])
    }
  })
})
