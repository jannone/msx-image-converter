import 'jest'

import { createImage, getPixel, plot } from "../src/image"
import { contrast, sharpen } from '../src/filter'

describe("Filter functions", () => {

  it("must apply contrast to image", () => {
    const image = createImage(1, 1, {r: 200, g: 128, b: 100})
    const output = createImage(1, 1)
    contrast(image, output, 100)
    expect(output.data).toEqual(Buffer.from([
      255, 128, 64, 255
    ]))
  })

  it("must apply sharpen to image", () => {
    const image = createImage(3, 3, {r: 200, g: 128, b: 100})
    const output = createImage(3, 3)
    plot(image, 1, 0, {r: 255, g: 128, b: 100})
    sharpen(image, output, false)
    const pixel = getPixel(output, 1, 1)
    expect(pixel).toEqual({r: 145, g: 128, b: 100})
  })

})
