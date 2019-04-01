import 'jest'

import { createImage } from "../src/image"
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

  xit("must apply sharpen to image", () => {
    const image = createImage(3, 3, {r: 200, g: 128, b: 100})
    const output = createImage(3, 3)
    sharpen(image, output)
    expect(output.data).toEqual(Buffer.from([
      200, 128, 100, 255
    ]))
  })

})
