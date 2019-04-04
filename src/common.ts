export interface Image {
  width: number
  height: number
  data: number[] | Buffer
}

export interface RGBColor {
  r: number
  g: number
  b: number
}

export interface XYZColor {
  x: number
  y: number
  z: number
}

export interface LabColor {
  l: number
  a: number
  b: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}
