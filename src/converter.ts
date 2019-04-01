import { rgb_to_lab, ciede2000Lab } from './ciede'
import { RGBColor, Image, LabColor } from './common'
import { getPixel, plot, createImage } from './image'

// Color tolerance for dithering (from 0 to 100). 
// Higher values mean dithering between colors that are not similar, which results in better color accuracy 
// but ugly squares on degradees. 0 means no dithering
const tolerance = 100 

export const msxPalette = [
  { r: 0,   g: 0,   b: 0   },
  { r: 0,   g: 0,   b: 0   },
  { r: 36,  g: 219, b: 36  },
  { r: 109, g: 255, b: 109 },
  { r: 36,  g: 36,  b: 255 },
  { r: 73,  g: 109, b: 255 },
  { r: 182, g: 36,  b: 36  },
  { r: 73,  g: 219, b: 255 },
  { r: 255, g: 36,  b: 36  },
  { r: 255, g: 109, b: 109 },
  { r: 219, g: 219, b: 36  },
  { r: 219, g: 219, b: 146 },
  { r: 36,  g: 146, b: 36  },
  { r: 219, g: 73,  b: 182 },
  { r: 182, g: 182, b: 182 },
  { r: 255, g: 255, b: 255 }
] as RGBColor[]

const mixedColor = (c1: RGBColor, c2: RGBColor): RGBColor => {
  return {
    r: (c1.r + c2.r) / 2,
    g: (c1.g + c2.g) / 2,
    b: (c1.b + c2.b) / 2,
  }
}

const colorDistLab = (l1: LabColor, l2: LabColor) => ciede2000Lab(l1.l, l1.a, l1.b, l2.l, l2.a, l2.b)

// TIP: images are usually better converted to MSX1 if contrast is increased
// and a sharpen effect is used after reducing them.
// A good converter could allow the user to crop the image, resample it automatically and then allow user 
// to increase contrast and sharpen it. ;)
export const convert = (inputImage: Image, outputImage: Image, palette: RGBColor[]) => {
  let y = 0
  let x = 0

  const labPalette = palette.map((c) => rgb_to_lab(c))

  while (y < inputImage.height) {
    const octet: LabColor[] = []
    let bestdistance = 99999999
    for (let i = 0; i < 8; i++) {
      // Get the RGB values of 8 pixels of the original image
      const pixel = rgb_to_lab( getPixel(inputImage, x+i, y) )
      octet.push(pixel)
    }
    
    // Brute force starts. Programs tests all 15 x 15 MSX color combinations. 
    // For each pixel octet it'll have to compare the original pixel colors with three diffent colors: 
    // two MSX colors and a mixed RGB of both.
    let bestcolor1, bestcolor2 
    let octetfinal = [0, 0, 0, 0, 0, 0, 0, 0]
    for (let c1 = 1; c1 < 16; c1++) {
      for (let c2 = c1; c2 < 16; c2++) {
        
        let dist = 0
        
        const tone = [
          // first MSX color of the octet
          labPalette[c1],
          // a mix of both MSX colors RGB values
          // since MSX cannot mix colors, later if this color is chosen it'll be substituted by a 2x2 dithering pattern
          rgb_to_lab( mixedColor(palette[c1], palette[c2]) ),
          // second MSX color of the octet
          labPalette[c2],
        ]
      
        // if colors are not too distant, octect can be either dithered or not
        let finaldist
        const octetvalue = [0, 0, 0, 0, 0, 0, 0, 0]
        if (colorDistLab(labPalette[c1], labPalette[c2]) <= tolerance) {
          // dithered
          let distcolor = [0, 0]
          for (let i = 0; i < 8; i++) {
              for (let j = 0; j <= 2; j++) {
                distcolor[j] = colorDistLab(tone[j],octet[i])
              }
              finaldist = distcolor[0]
              octetvalue[i] = 0
              for (let j = 1; j <= 2; j++) {
                if (distcolor[j] < finaldist) {
                  finaldist = distcolor[j]
                  octetvalue[i] = j
                }
              }
              dist += finaldist
              if (dist > bestdistance) {
                break
              }
          }
        } else {
          // not dithered
          for (let i = 0; i < 8; i++) {
            const finaldista = colorDistLab(tone[0],octet[i]) 
            const finaldistb = colorDistLab(tone[2],octet[i])
            if (finaldista < finaldistb) {
              octetvalue[i] = 0
              finaldist = finaldista
            } else {
              octetvalue[i] = 2
              finaldist = finaldistb
            }
            dist = dist + finaldist
            if (dist > bestdistance) {
              break
            }
          }
        }
        
        if (dist < bestdistance) {
          bestdistance = dist
          bestcolor1 = c1
          bestcolor2 = c2
          for (let i = 0; i < 8; i++) {
            octetfinal[i] = octetvalue[i]
          }
        }
        if (bestdistance == 0) {
          break
        }
      }
      if (bestdistance == 0) {
        break
      }
    }
    for (let i = 0; i < 8; i++) {
      let col
      switch (octetfinal[i]) {
        case 0:
          col = palette[bestcolor1]
          break;
        case 1:
          if ((y % 2) == (i % 2)) {
            col = palette[bestcolor2]
          } else {
            col = palette[bestcolor1]
          }
          break;
        case 2:
          col = palette[bestcolor2]
          break;
      }
      plot(outputImage, x+i, y, col)
    }
    y++
    if ((y % 8) == 0) {
      y -= 8
      x += 8
      if (x > 255) {
        x = 0
        y += 8
      }
    }
    // This would be the place for you to write the bytes in the final MSX screen file.
  }
}
