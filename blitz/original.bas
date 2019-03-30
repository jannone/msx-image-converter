;Graphic routine To convert RGB images To MSX1 video, by Leandro Correia (www.leandrocorreia.com)
; Run it on Blitz Basic. Enjoy!
 
Graphics 512,250,32,3
 
;Input and output images
 
;Image to be loaded and converted. TIP: images are usually better converted to MSX1 if contrast is increased and a sharpen effect is used after reducing them.
; A good converter could allow the user to crop the image, resample it automatically and then allow user to increase contrast and sharpen it. ;)
imagem=LoadImage("..\msxconv2x2\angelina.png")
 
;Name of the output BMP
nomefinal$="sample23.bmp"
 
;Color tolerance for dithering (from 0 to 100). Higher values mean dithering between colors that are not similar, which results in better color accuracy but ugly squares on degradees. 0 means no dithering
tolerance=100
 
DrawBlock imagem,0,0
 
Dim msxr(16),msxg(16),msxb(16)
Dim octetr(8),octetg(8),octetb(8)
Dim octetfinal(8), octetvalue(8)
Dim toner(5),toneg(5),toneb(5),distcolor(5)
 
; Reads the MSX RGB color values at the "data" statement at the end of the program.
For i=0To 15
    Read msxr(i),msxg(i),msxb(i)
Next
 
; Lookup table to make squareroots quicker...
Dim sqrt(9999999)
For i=0To 9999998
    sqrt(i)=Sqr(i)
Next
 
 
imgh=192:imgw=256
y=0:x=0
DrawBlock imagem,0,0
 
 
While y<192
    bestdistance=99999999
    For i=0To 7
        ; Get the RGB values of 8  pixels of the original image
        GetColor x+i,y
        octetr(i)=ColorRed()
        octetg(i)=ColorGreen()
        octetb(i)=ColorBlue()              
    Next
   
    ; Brute force starts. Programs tests all 15 x 15 MSX color combinations. For each pixel octet it'll have to compare the original pixel colors with three diffent colors: two MSX colors and a mixed RGB of both.
    For cor1=1To 15
        For cor2=cor1 To 15
           
 
            dist=0
           
            If KeyHit(1) Then End
           
            ; First MSX color of the octet
            toner(0)=msxr(cor1)
            toneg(0)=msxg(cor1)
            toneb(0)=msxb(cor1)
           
            ; Second MSX color of the octet
            toner(2)=msxr(cor2)
            toneg(2)=msxg(cor2)
            toneb(2)=msxb(cor2)
 
           
            ; A mix of both MSX colors RGB values. Since MSX cannot mix colors, later if this color is chosen it'll be substituted by a 2x2 dithering pattern.
            toner(1)=(msxr(cor1)+msxr(cor2))/2
            toneg(1)=(msxg(cor1)+msxg(cor2))/2
            toneb(1)=(msxb(cor1)+msxb(cor2))/2
       
            If calcdist2000(msxr(cor1),msxg(cor1),msxb(cor1),msxr(cor2),msxg(cor2),msxb(cor2)) <= tolerance Then ; if colors are not too distant, octect can be either dithered or not
 
                ; dithered
                For i=0To 7
                        For j=0To 2
                            distcolor(j)=calcdist2000(toner(j),toneg(j),toneb(j),octetr(i),octetg(i),octetb(i))
                        Next
                        finaldist=distcolor(0):octetvalue(i)=0
                        For j=1To 2
                            If distcolor(j)<finaldist Then finaldist=distcolor(j):octetvalue(i)=j
                        Next
           
                    dist=dist+finaldist
                    If dist > bestdistance Then Exit
                Next
            Else
                ; not dithered
                For i=0To 7
                    finaldista=calcdist2000(toner(0),toneg(0),toneb(0),octetr(i),octetg(i),octetb(i))
                    finaldistb=calcdist2000(toner(2),toneg(2),toneb(2),octetr(i),octetg(i),octetb(i))
                    If finaldista < finaldistb Then
                        octetvalue(i)=0
                        finaldist=finaldista                       
                    Else
                        octetvalue(i)=2
                        finaldist=finaldistb
                    End If
                    dist=dist+finaldist
                    If dist > bestdistance Then Exit
                Next
            End If
           
            If dist < bestdistance Then
                bestdistance=dist:bestcor1=cor1:bestcor2=cor2
                For i=0To 7
                    octetfinal(i)=octetvalue(i)
                Next
            End If
            If bestdistance=0 Then Exit
        Next
        If bestdistance=0 Then Exit
    Next
    byte=0
    For i=0To 7
        Select octetfinal(i)
            Case 0
                Color msxr(bestcor1),msxg(bestcor1),msxb(bestcor1)
            Case 1
            If y Mod 2 = i Mod 2 Then Color msxr(bestcor2),msxg(bestcor2),msxb(bestcor2) Else Color msxr(bestcor1),msxg(bestcor1),msxb(bestcor1)
 
            Case 2
                Color msxr(bestcor2),msxg(bestcor2),msxb(bestcor2)
            End Select
        If ColorRed()=msxr(bestcor2) And ColorGreen()=msxg(bestcor2) And ColorBlue()=msxb(bestcor2) Then byte=byte+2^(7-i)
        Plot 256+x+i,y
    Next   
    y=y+1:If y Mod 8=0 Then y=y-8:x=x+8:If x>255 Then x=0:y=y+8
   
    ; This would be the place for you to write the bytes in the final MSX screen file.
Wend
 
; Using Blitz Basic routines to save a bitmap with the conversion.
 
final=CreateImage(256,192)
CopyRect 256,0,256,192,0,0,FrontBuffer(),ImageBuffer(final)
SaveBuffer ImageBuffer(final),nomefinal$
 
WaitKey()
End
 
 
Function calcdist2000#(r1#,g1#,b1#,r2#,g2#,b2#)
 
; Convert two RGB color values into Lab and uses the CIEDE2000 formula to calculate the distance between them.
; This function first converts RGBs to XYZ and then to Lab.
 
; This is not optimized, but I did my best to make it readable. In some rare cases there are some weird colors, so MAYBE there's a small bug in the implementation.
; Or it could be improved since RGB To Lab is Not a direct conversion.
 
;   Converting RGB values into XYZ
 
    r#=r1#/255.0
    g#=g1#/255.0
    b#=b1#/255.0
   
    If r# > 0.04045 Then r#=((r#+0.055)/1.055)^2.4 Else r#=r#/12.92
    If g# > 0.04045 Then g#=((g#+0.055)/1.055)^2.4 Else g#=g#/12.92
    If b# > 0.04045 Then b#=((b#+0.055)/1.055)^2.4 Else b#=b#/12.92
   
    r#=r#*100.0
    g#=g#*100.0
    b#=b#*100.0
   
    ;Observer. = 2°, Illuminant = D65
    x#=r#*0.4124 + g#*0.3576 + b#*0.1805
    y#=r#*0.2126 + g#*0.7152 + b#*0.0722
    z#=r#*0.0193 + g#*0.1192 + b#*0.9505
   
    ;Print x
    ;Print y
    ;Print z
   
    x#=x#/95.047   ;Observer= 2°, Illuminant= D65
    y#=y#/100.000
    z#=z#/108.883
   
    If x# > 0.008856 Then x#=x# ^ (1.0/3.0) Else x# = (7.787 * x# ) + ( 16.0 / 116.0 )
    If y# > 0.008856 Then y#=y# ^ (1.0/3.0 ) Else y# = (7.787 * y# ) + ( 16.0 / 116.0 )
    If z# > 0.008856 Then z#=z# ^ (1.0/3.0 ) Else z# = (7.787 * z# ) + ( 16.0 / 116.0 )
   
    l1# = ( 116.0 * y# ) - 16.0
    a1# = 500.0 * (x#-y#)
    b1# = 200.0 * (y#-z#)
 
 
    r#=r2#/255.0
    g#=g2#/255.0
    b#=b2#/255.0
   
    If r# > 0.04045 Then r#=((r#+0.055)/1.055)^2.4 Else r#=r#/12.92
    If g# > 0.04045 Then g#=((g#+0.055)/1.055)^2.4 Else g#=g#/12.92
    If b# > 0.04045 Then b#=((b#+0.055)/1.055)^2.4 Else b#=b#/12.92
   
    r#=r#*100.0
    g#=g#*100.0
    b#=b#*100.0
   
    ;Observer. = 2°, Illuminant = D65
    x#=r#*0.4124 + g#*0.3576 + b#*0.1805
    y#=r#*0.2126 + g#*0.7152 + b#*0.0722
    z#=r#*0.0193 + g#*0.1192 + b#*0.9505
   
 
    x#=x#/95.047   ;Observer= 2°, Illuminant= D65
    y#=y#/100.000
    z#=z#/108.883
   
    If x# > 0.008856 Then x#=x# ^ (1/3.0) Else x# = (7.787 * x# ) + ( 16.0 / 116.0 )
    If y# > 0.008856 Then y#=y# ^ (1/3.0 ) Else y# = (7.787 * y# ) + ( 16.0 / 116.0 )
    If z# > 0.008856 Then z#=z# ^ (1/3.0 ) Else z# = (7.787 * z# ) + ( 16.0 / 116.0 )
   
;   Converts XYZ to Lab... 
   
    l2# = (116.0 * y#) - 16.0
    a2# = 500.0 * (x#-y#)
    b2# = 200.0 * (y#-z#)
   
; ...and then calculates distance between Lab colors, using the CIEDE2000 formula.
 
    dl#=l2-l1
    hl#=l1+dl*0.5
    sqb1#=Float b1*b1
    sqb2#=Float b2*b2
    c1#=Sqr(Float a1*a1+sqb1)
    c2#=Sqr(Float a2*a2+sqb2)
    hc7#=Float ((c1+c2)*0.5)^Float 7
    trc#=Sqr(hc7/(hc7+6103515625.0))
    t2#=1.5-trc*0.5
    ap1#=a1*t2
    ap2#=a2*t2
    c1#=Sqr(ap1*ap1+sqb1)
    c2#=Sqr(ap2*ap2+sqb2)
    dc#=c2-c1
    hc#=c1+dc*0.5
    hc7#=hc^7.0
    trc#=Sqr(hc7/(hc7+6103515625.0))
    h1#=ATan2(b1,ap1)
    If h1<0 Then h1=h1+Pi*2.0
    h2#=ATan2(b2,ap2)
    If h2<0 Then h2=h2+Pi*2.0
    hdiff#=h2-h1
    hh#=h1+h2
    If Abs(hdiff)>Pi Then
      hh=hh+Pi*2
      If h2<=h1 Then hdiff=hdiff+Pi*2.0
    Else
        hdiff=hdiff-Pi*2.0
    End If
 
    hh#=hh*0.5
    t2#=1-0.17*Cos(hh-Pi/6)+0.24*Cos(hh*2)
    t2#=t2+0.32*Cos(hh*3+Pi/30.0)
    t2#=t2-0.2*Cos(hh*4-Pi*63/180.0)
    dh#=2*Sqr(c1*c2)*Sin(hdiff*0.5)
    sqhl#=(hl-50.0)*(hl-50.0)
    fl#=dl/(1+(0.015*sqhl/sqrt(20.0+sqhl)))
    fc#=dc/(hc*0.045+1.0)
    fh=dh/(t2*hc*0.015+1.0)
    dt#=30*Exp(-(36.0*hh-55.0*Pi^2.0)/(25.0*Pi*Pi))
    r#=0-2*trc*Sin(2.0*dt*Pi/180.0)
    Return Sqr(fl*fl+fc*fc+fh*fh+r*fc*fh)  
End Function
 
; Data of the MSX palette RGB values.
Data 0,0,0,0,0,0,36,219,36,109,255,109,36,36,255,73,109,255,182,36,36,73,219,255,255,36,36,255,109,109,219,219,36,219,219,146,36,146,36,219,73,182,182,182,182,255,255,255