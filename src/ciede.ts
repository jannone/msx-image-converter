export function calcdist2000(r1, g1, b1, r2, g2, b2) { 
  // Convert two RGB color values into Lab and uses the CIEDE2000 formula to calculate the distance between them.
  // This function first converts RGBs to XYZ and then to Lab.

  // This is not optimized, but I did my best to make it readable. 
  // In some rare cases there are some weird colors, so MAYBE there's a small bug in the implementation.
  // Or it could be improved since RGB To Lab is Not a direct conversion.

  //	Converting RGB values into XYZ

  const { pow } = Math

  let r, g, b
  let x, y, z

	r = r1 / 255.0
	g = g1 / 255.0
	b = b1 / 255.0
	
	r = (r > 0.04045) ? pow( ((r + 0.055) / 1.055), 2.4) : r / 12.92
	g = (g > 0.04045) ? pow( ((g + 0.055) / 1.055), 2.4) : g / 12.92
	b = (b > 0.04045) ? pow( ((b + 0.055) / 1.055), 2.4) : b / 12.92
	
	r = r * 100.0
	g = g * 100.0
	b = b * 100.0
	
	// Observer. = 2°, Illuminant = D65
	x = r * 0.4124 + g * 0.3576 + b * 0.1805
	y = r * 0.2126 + g * 0.7152 + b * 0.0722
	z = r * 0.0193 + g * 0.1192 + b * 0.9505
		
	x = x / 95.047   // Observer= 2°, Illuminant= D65
	y = y / 100.000
	z = z / 108.883
	
	x = (x > 0.008856) ? pow(x, (1.0/3.0)) : (7.787 * x) + ( 16.0 / 116.0 )
	y = (y > 0.008856) ? pow(y, (1.0/3.0)) : (7.787 * y) + ( 16.0 / 116.0 )
	z = (z > 0.008856) ? pow(z, (1.0/3.0)) : (7.787 * z) + ( 16.0 / 116.0 )
	
	const L1 = ( 116.0 * y ) - 16.0
	const A1 = 500.0 * (x - y)
	const B1 = 200.0 * (y - z)

	r = r2 / 255.0
	g = g2 / 255.0
	b = b2 / 255.0
	
	r = (r > 0.04045) ? pow( ((r + 0.055) / 1.055), 2.4) : r / 12.92
	g = (g > 0.04045) ? pow( ((g + 0.055) / 1.055), 2.4) : g / 12.92
	b = (b > 0.04045) ? pow( ((b + 0.055) / 1.055), 2.4) : b / 12.92
	
	r = r * 100.0
	g = g * 100.0
	b = b * 100.0
	
	// Observer. = 2°, Illuminant = D65
	x = r * 0.4124 + g * 0.3576 + b * 0.1805
	y = r * 0.2126 + g * 0.7152 + b * 0.0722
	z = r * 0.0193 + g * 0.1192 + b * 0.9505

	x = x / 95.047   // Observer= 2°, Illuminant= D65
	y = y / 100.000
	z = z / 108.883
	
	x = (x > 0.008856) ? pow(x, (1/3.0)) : (7.787 * x) + ( 16.0 / 116.0 )
	y = (y > 0.008856) ? pow(y, (1/3.0)) : (7.787 * y) + ( 16.0 / 116.0 )
	z = (z > 0.008856) ? pow(z, (1/3.0)) : (7.787 * z) + ( 16.0 / 116.0 )
	
  //	Converts XYZ to Lab...	
	
	const L2 = (116.0 * y) - 16.0
	const A2 = 500.0 * (x - y)
	const B2 = 200.0 * (y - z)
	
  // ...and then calculates distance between Lab colors, using the CIEDE2000 formula.

  const dl = L2 - L1
  const hl = L1 + dl * 0.5
  const sqB1 = B1 * B1
  const sqB2 = B2 * B2
  let c1 = Math.sqrt(A1 * A1 + sqB1)
  let c2 = Math.sqrt(A2 * A2 + sqB2)
  let hc7 = pow( ((c1 + c2) * 0.5), 7)
  let trc = Math.sqrt(hc7/(hc7 + 6103515625.0))
  let t2 = 1.5 - trc * 0.5
  const ap1 = A1 * t2
  const ap2 = A2 * t2
  c1 = Math.sqrt(ap1 * ap1 + sqB1)
  c2 = Math.sqrt(ap2 * ap2 + sqB2)
  const dc = c2 - c1
  const hc = c1 + dc * 0.5
  hc7 = pow(hc, 7.0)
  trc = Math.sqrt(hc7/(hc7 + 6103515625.0))
  let h1 = Math.atan2(B1,ap1)
  h1 = (h1 < 0) ? h1 + Math.PI * 2.0 : h1
  let h2 = Math.atan2(B2,ap2)
  h2 = (h2 < 0) ? h2 + Math.PI * 2.0 : h2
  let hdiff = h2 - h1
  let hh = h1 + h2
  if (Math.abs(hdiff) > Math.PI) {
    hh = hh + Math.PI * 2
    if (h2 <= h1) {
      hdiff = hdiff + Math.PI * 2.0
    }
  } else {
    hdiff = hdiff - Math.PI * 2.0
  }

  hh = hh * 0.5
  t2 = 1-0.17 * Math.cos(hh-Math.PI/6)+0.24 * Math.cos(hh*2)
  t2 = t2+0.32 * Math.cos(hh*3+Math.PI/30.0)
  t2 = t2-0.2 * Math.cos(hh*4-Math.PI*63/180.0)
  const dh = 2 * Math.sqrt(c1*c2) * Math.sin(hdiff*0.5)
  const sqhl = (hl-50.0)*(hl-50.0)
  const fl = dl/(1+(0.015*sqhl/ Math.sqrt(20.0+sqhl)))
  const fc = dc/(hc*0.045+1.0)
  const fh = dh/(t2*hc*0.015+1.0)
  const dt = 30 * Math.exp( -(36.0 * hh - 55.0 * pow(Math.PI , 2.0)) / (25.0*Math.PI*Math.PI))
  const R = -2 * trc * Math.sin(2.0*dt*Math.PI/180.0)
  return Math.sqrt(fl*fl+fc*fc+fh*fh+R*fc*fh)	
}
