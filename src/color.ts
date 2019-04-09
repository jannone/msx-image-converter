import { LabColor, LabPalette, RGBColor, RGBPalette, XYZColor } from './common'

// This code is heavily based on https://github.com/markusn/color-diff

const { pow, sqrt, PI, cos, sin, atan2, exp, abs } = Math

export function ciede2000Lab(L1: number, a1: number, b1: number, L2: number, a2: number, b2: number): number {
  /**
   * Implemented as in "The CIEDE2000 Color-Difference Formula:
   * Implementation Notes, Supplementary Test Data, and Mathematical Observations"
   * by Gaurav Sharma, Wencheng Wu and Edul N. Dalal.
   */

  // Weight factors
  const kL = 1
  const kC = 1
  const kH = 1

  /**
   * Step 1: Calculate C1p, C2p, h1p, h2p
   */
  const C1 = sqrt(pow(a1, 2) + pow(b1, 2)) // (2)
  const C2 = sqrt(pow(a2, 2) + pow(b2, 2)) // (2)

  const aC1C2 = (C1 + C2) / 2.0 // (3)

  const G = 0.5 * (1 - sqrt(pow(aC1C2, 7.0) / (pow(aC1C2, 7.0) + pow(25.0, 7.0)))) // (4)

  const a1p = (1.0 + G) * a1 // (5)
  const a2p = (1.0 + G) * a2 // (5)

  const C1p = sqrt(pow(a1p, 2) + pow(b1, 2)) // (6)
  const C2p = sqrt(pow(a2p, 2) + pow(b2, 2)) // (6)

  const h1p = hpF(b1, a1p) // (7)
  const h2p = hpF(b2, a2p) // (7)

  /**
   * Step 2: Calculate dLp, dCp, dHp
   */
  const dLp = L2 - L1 // (8)
  const dCp = C2p - C1p // (9)

  const dhp = dhpF(C1, C2, h1p, h2p) // (10)
  const dHp = 2 * sqrt(C1p * C2p) * sin(radians(dhp) / 2.0) // (11)

  /**
   * Step 3: Calculate CIEDE2000 Color-Difference
   */
  const aL = (L1 + L2) / 2.0 // (12)
  const aCp = (C1p + C2p) / 2.0 // (13)

  const aHp = aHpF(C1, C2, h1p, h2p) // (14)
  const T =
    1 -
    0.17 * cos(radians(aHp - 30)) +
    0.24 * cos(radians(2 * aHp)) +
    0.32 * cos(radians(3 * aHp + 6)) -
    0.2 * cos(radians(4 * aHp - 63)) // (15)
  const dRo = 30 * exp(-pow((aHp - 275) / 25, 2)) // (16)
  const RC = sqrt(pow(aCp, 7.0) / (pow(aCp, 7.0) + pow(25.0, 7.0))) // (17)
  const SL = 1 + (0.015 * pow(aL - 50, 2)) / sqrt(20 + pow(aL - 50, 2.0)) // (18)
  const SC = 1 + 0.045 * aCp // (19)
  const SH = 1 + 0.015 * aCp * T // (20)
  const RT = -2 * RC * sin(radians(2 * dRo)) // (21)
  const dE = sqrt(
    pow(dLp / (SL * kL), 2) +
      pow(dCp / (SC * kC), 2) +
      pow(dHp / (SH * kH), 2) +
      RT * (dCp / (SC * kC)) * (dHp / (SH * kH)),
  ) // (22)
  return dE
}

const degrees = (n: number) => n * (180 / PI)
const radians = (n: number) => n * (PI / 180)

// (7)
const hpF = (x: number, y: number): number => {
  if (x === 0 && y === 0) {
    return 0
  }
  const tmphp = degrees(atan2(x, y))
  return tmphp >= 0 ? tmphp : tmphp + 360
}

// (10)
const dhpF = (C1: number, C2: number, h1p: number, h2p: number): number => {
  if (C1 * C2 === 0) {
    return 0
  }
  const delta = h2p - h1p
  if (abs(delta) <= 180) {
    return delta
  }
  if (delta > 180) {
    return delta - 360
  }
  if (delta < -180) {
    return delta + 360
  }
  throw new Error("Delta value is off limits: " + JSON.stringify({ C1, C2, h1p, h2p, delta }))
}

// (14)
const aHpF = (C1: number, C2: number, h1p: number, h2p: number): number => {
  const sum = h1p + h2p
  if (C1 * C2 === 0) {
    return sum
  }
  const delta = h1p - h2p
  if (abs(delta) <= 180) {
    return sum / 2.0
  }
  if (abs(delta) > 180 && sum < 360) {
    return (sum + 360) / 2.0
  }
  if (abs(delta) > 180 && sum >= 360) {
    return (sum - 360) / 2.0
  }
  throw new Error()
}

export const RGBToLab = (c: RGBColor): LabColor => XYZToLab(RGBToXYZ(c))

const RGBToXYZ = (c: RGBColor): XYZColor => {
  // Based on http://www.easyrgb.com/index.php?X=MATH&H=02
  const cR = c.r / 255
  const cG = c.g / 255
  const cB = c.b / 255

  const R = 100 * (cR > 0.04045 ? pow((cR + 0.055) / 1.055, 2.4) : cR / 12.92)

  const G = 100 * (cG > 0.04045 ? pow((cG + 0.055) / 1.055, 2.4) : cG / 12.92)

  const B = 100 * (cB > 0.04045 ? pow((cB + 0.055) / 1.055, 2.4) : cB / 12.92)

  // Observer. = 2°, Illuminant = D65
  return {
    x: R * 0.4124 + G * 0.3576 + B * 0.1805,
    y: R * 0.2126 + G * 0.7152 + B * 0.0722,
    z: R * 0.0193 + G * 0.1192 + B * 0.9505,
  }
}

const XYZToLab = (c: XYZColor): LabColor => {
  // Based on http://www.easyrgb.com/index.php?X=MATH&H=07
  const refY = 100.0
  const refZ = 108.883
  const refX = 95.047 // Observer= 2°, Illuminant= D65
  let Y = c.y / refY
  let Z = c.z / refZ
  let X = c.x / refX
  if (X > 0.008856) {
    X = pow(X, 1 / 3)
  } else {
    X = 7.787 * X + 16 / 116
  }
  if (Y > 0.008856) {
    Y = pow(Y, 1 / 3)
  } else {
    Y = 7.787 * Y + 16 / 116
  }
  if (Z > 0.008856) {
    Z = pow(Z, 1 / 3)
  } else {
    Z = 7.787 * Z + 16 / 116
  }

  return {
    l: 116 * Y - 16,
    a: 500 * (X - Y),
    b: 200 * (Y - Z),
  }
}

export const RGBToLabPalette = (rgbPalette: RGBPalette): LabPalette => 
  rgbPalette.map((rgbColor) => RGBToLab(rgbColor))

export const colorDistLab = (l1: LabColor, l2: LabColor) => ciede2000Lab(l1.l, l1.a, l1.b, l2.l, l2.a, l2.b)

export const nearestColorIndex = (labPalette: LabPalette, labColor: LabColor, defaultIndex: number): number => {
  const winner = 
    labPalette.reduce((prev, paletteLabColor, index) => {
      const dist = colorDistLab(paletteLabColor, labColor)
      return (dist < prev[0]) ? [ dist, index ] : prev
    }, [Number.MAX_SAFE_INTEGER, defaultIndex])

  return winner ? winner[1] : defaultIndex
}
