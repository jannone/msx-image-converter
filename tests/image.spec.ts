import 'jest'

import { createImage, fillByCoord, getPixel, plot } from "../src/image"

describe("Image functions", () => {
  it("must create image with given size and color", () => {
    const image = createImage(1, 2, {r: 0, g: 128, b: 255})
    expect(image.width).toBe(1)
    expect(image.height).toBe(2)
    expect(image.data).toEqual(Buffer.from([
      0, 128, 255, 255,
      0, 128, 255, 255,
    ]))
  })

  it("must return a given pixel", () => {
    const color = {r: 32, g: 32, b: 32}
    const image = createImage(1, 1, color)
    const pixel = getPixel(image, 0, 0)
    expect(pixel).toEqual(color)
  })

  it("must plot a given pixel", () => {
    const color = {r: 32, g: 32, b: 32}
    const image = createImage(1, 2, {r: 0, g: 0, b: 0})
    plot(image, 0, 1, color)
    expect(image.data).toEqual(Buffer.from([
      0, 0, 0, 255,
      32, 32, 32, 255
    ]))
  })

  it("must fill image according to a function", () => {
    const image = createImage(10, 10)
    fillByCoord(image, (x: number, y: number) => {
      return { r: x, g: x, b: y }
    })
    expect(getPixel(image, 0, 0)).toEqual({ r: 0, g: 0, b: 0 })
    expect(getPixel(image, 9, 0)).toEqual({ r: 9, g: 9, b: 0 })
    expect(getPixel(image, 0, 9)).toEqual({ r: 0, g: 0, b: 9 })
  })

})
