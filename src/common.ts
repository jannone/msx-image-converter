export interface Image {
  width: number,
  height: number,
  data: number[]|Buffer
}

export type RGBColor = {
  r: number,
  g: number,
  b: number
} 

export type XYZColor = {
  x: number,
  y: number,
  z: number
} 

export type LabColor = {
  l: number,
  a: number,
  b: number
} 

export interface Rect {
  x: number,
  y: number,
  width: number,
  height: number
}
