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

export interface Rect {
  x: number,
  y: number,
  width: number,
  height: number
}
