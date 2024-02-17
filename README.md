# Bloch

Some notes about canvas and coordinates.

Per https://www.w3.org/TR/css-transforms-2/#transform-rendering

- X is the left edge, extending to the right
- Y is the top edge, extending to the bottom
- Z has its origin on the XY plane, and increases towards the viewer.

In 3d translation, scaling is proportional to "d / (d - Z)", where 'd' is
the value of 'perspective.

The goal is to translate the DOMPoint, into the x and y coordinate for
the canvas. Assuming it is in some unit circle/square (-1 to 1), want to:

- Perform any rotation about the origin
- Apply any perspective
  - If origin is 0 and Z goes -1 to 1, 'd' of 10 gives 10% increase/decrease front to back
  - Make Z larger to reduce perspective warp
- Scale up by width or height / 2
  - May flip y at this point also
  - May want to scale by width or height over 4 to leave room
- Translate x by width / 2 y by height / 2

DOMMatrix is in column major order, so m34 is in the 3rd column or the 4th row.
a, b, c, d, e, f map to m11, m12, m21, m22, m41, m42 respectively
For 2d matrices, the 3rd and 4th columns, and the 3rd row, must be 0, expect m33 and m44 which should be 1.