import 'jest'

import * as fs from "fs"

import { ciede2000Lab } from "../src/color"

const roundFloat = (v: number) => Math.round(v * 10000) / 10000

const givenCIEDEdata = () => {
  const data = fs.readFileSync("./tests/fixtures/ciede2000testdata.txt", "utf8")
  return data.split("\n").map((line) => {
    const values: number[] = line.trim().split("\t").map(parseFloat)
    return values
  })
}

describe("Color", () => {

  givenCIEDEdata().forEach(([ L1, a1, b1, L2, a2, b2, dist ]) => {
    it(`color distance must be ${dist}`, () => {
      const result = ciede2000Lab(L1, a1, b1, L2, a2, b2)      
      expect(roundFloat(result)).toBe(dist)
    })
  })

})

