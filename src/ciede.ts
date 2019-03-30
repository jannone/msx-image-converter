import { RGBColor, XYZColor, LabColor } from "./common";

// This code is heavily based on https://github.com/markusn/color-diff

const { pow, sqrt, PI, cos, sin, atan2, exp, abs } = Math

export function ciede2000Lab(L1: number, a1: number, b1: number, L2: number, a2: number, b2: number): number
{
  /**
   * Implemented as in "The CIEDE2000 Color-Difference Formula:
   * Implementation Notes, Supplementary Test Data, and Mathematical Observations"
   * by Gaurav Sharma, Wencheng Wu and Edul N. Dalal.
   */

  // Weight factors
  const kL = 1;
  const kC = 1;
  const kH = 1;

  /**
   * Step 1: Calculate C1p, C2p, h1p, h2p
   */
  const C1 = sqrt(pow(a1, 2) + pow(b1, 2)) //(2)
  const C2 = sqrt(pow(a2, 2) + pow(b2, 2)) //(2)

  const a_C1_C2 = (C1+C2)/2.0;             //(3)

  const G = 0.5 * (1 - sqrt(pow(a_C1_C2 , 7.0) /
                          (pow(a_C1_C2, 7.0) + pow(25.0, 7.0)))); //(4)

  const a1p = (1.0 + G) * a1; //(5)
  const a2p = (1.0 + G) * a2; //(5)

  const C1p = sqrt(pow(a1p, 2) + pow(b1, 2)); //(6)
  const C2p = sqrt(pow(a2p, 2) + pow(b2, 2)); //(6)

  const h1p = hp_f(b1, a1p); //(7)
  const h2p = hp_f(b2, a2p); //(7)

  /**
   * Step 2: Calculate dLp, dCp, dHp
   */
  const dLp = L2 - L1; //(8)
  const dCp = C2p - C1p; //(9)

  const dhp = dhp_f(C1,C2, h1p, h2p); //(10)
  const dHp = 2*sqrt(C1p*C2p)*sin(radians(dhp)/2.0); //(11)

  /**
   * Step 3: Calculate CIEDE2000 Color-Difference
   */
  const a_L = (L1 + L2) / 2.0; //(12)
  const a_Cp = (C1p + C2p) / 2.0; //(13)

  const a_hp = a_hp_f(C1,C2,h1p,h2p); //(14)
  const T = 1-0.17*cos(radians(a_hp-30))+0.24*cos(radians(2*a_hp))+
    0.32*cos(radians(3*a_hp+6))-0.20*cos(radians(4*a_hp-63)); //(15)
  const d_ro = 30 * exp(-(pow((a_hp-275)/25,2))); //(16)
  const RC = sqrt((pow(a_Cp, 7.0)) / (pow(a_Cp, 7.0) + pow(25.0, 7.0)));//(17)
  const SL = 1 + ((0.015 * pow(a_L - 50, 2)) /
                sqrt(20 + pow(a_L - 50, 2.0)));//(18)
  const SC = 1 + 0.045 * a_Cp;//(19)
  const SH = 1 + 0.015 * a_Cp * T;//(20)
  const RT = -2 * RC * sin(radians(2 * d_ro));//(21)
  const dE = sqrt(pow(dLp /(SL * kL), 2) + pow(dCp /(SC * kC), 2) +
                pow(dHp /(SH * kH), 2) + RT * (dCp /(SC * kC)) *
                (dHp / (SH * kH))); //(22)
  return dE;
}

function degrees(n) { return n*(180/PI); }
function radians(n) { return n*(PI/180); }

function hp_f(x,y) //(7)
{
  if(x === 0 && y === 0) return 0;
  else{
    const tmphp = degrees(atan2(x,y));
    if(tmphp >= 0) return tmphp
    else           return tmphp + 360;
  }
}

function dhp_f(C1, C2, h1p, h2p) //(10)
{
  if(C1*C2 === 0)              return 0;
  else if(abs(h2p-h1p) <= 180) return h2p-h1p;
  else if((h2p-h1p) > 180)     return (h2p-h1p)-360;
  else if((h2p-h1p) < -180)    return (h2p-h1p)+360;
  else                         throw(new Error());
}

function a_hp_f(C1, C2, h1p, h2p) { //(14)
  if(C1*C2 === 0)                                     return h1p+h2p
  else if(abs(h1p-h2p)<= 180)                         return (h1p+h2p)/2.0;
  else if((abs(h1p-h2p) > 180) && ((h1p+h2p) < 360))  return (h1p+h2p+360)/2.0;
  else if((abs(h1p-h2p) > 180) && ((h1p+h2p) >= 360)) return (h1p+h2p-360)/2.0;
  else                                                throw(new Error());
}

export function rgb_to_lab(c: RGBColor): LabColor
{
  return xyz_to_lab(rgb_to_xyz(c))
}

function rgb_to_xyz(c: RGBColor): XYZColor
{
  // Based on http://www.easyrgb.com/index.php?X=MATH&H=02
  let R = ( c.r / 255 );
  let G = ( c.g / 255 );
  let B = ( c.b / 255 );

  if ( R > 0.04045 ) R = pow(( ( R + 0.055 ) / 1.055 ),2.4);
  else               R = R / 12.92;
  if ( G > 0.04045 ) G = pow(( ( G + 0.055 ) / 1.055 ),2.4);
  else               G = G / 12.92;
  if ( B > 0.04045 ) B = pow(( ( B + 0.055 ) / 1.055 ), 2.4);
  else               B = B / 12.92;

  R *= 100;
  G *= 100;
  B *= 100;

  // Observer. = 2°, Illuminant = D65
  const x = R * 0.4124 + G * 0.3576 + B * 0.1805;
  const y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const z = R * 0.0193 + G * 0.1192 + B * 0.9505;
  return { x, y, z }
}

function xyz_to_lab(c: XYZColor): LabColor
{
  // Based on http://www.easyrgb.com/index.php?X=MATH&H=07
  const ref_Y = 100.000;
  const ref_Z = 108.883;
  const ref_X = 95.047; // Observer= 2°, Illuminant= D65
  let Y = c.y / ref_Y;
  let Z = c.z / ref_Z;
  let X = c.x / ref_X;
  if ( X > 0.008856 ) X = pow(X, 1/3);
  else                X = ( 7.787 * X ) + ( 16 / 116 );
  if ( Y > 0.008856 ) Y = pow(Y, 1/3);
  else                Y = ( 7.787 * Y ) + ( 16 / 116 );
  if ( Z > 0.008856 ) Z = pow(Z, 1/3);
  else                Z = ( 7.787 * Z ) + ( 16 / 116 );
  const l = ( 116 * Y ) - 16;
  const a = 500 * ( X - Y );
  const b = 200 * ( Y - Z );
  return { l, a, b };
}
