import { geoGraticule10, geoPath, geoOrthographic } from "d3-geo";
import { useEffect, useRef, useState } from "preact/hooks";
import { type MultiLineString } from "geojson";

// Useful links for developers:
// - Quantum state and Bloch sphere: https://medium.com/quantum-untangled/quantum-states-and-the-bloch-sphere-9f3c0c445ea3
// - D3 Geo docs: https://d3js.org/d3-geo
// - D3 Geo concepts: https://www.d3indepth.com/geographic/
// - GeoJSON: https://tools.ietf.org/html/rfc7946 & https://github.com/topojson/topojson-specification
// - D3 geo samples
//   - Zoom: https://observablehq.com/@d3/versor-zooming?collection=@d3/d3-geo
//   - Transparent: https://observablehq.com/@d3/projection-reflectx?collection=@d3/d3-geo
//   - Shading: https://observablehq.com/@d3/orthographic-shading?collection=@d3/d3-geo
// - Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
// - DOMPoint and matrix APIs: https://www.w3.org/TR/geometry-1/
// - CSS transforms: https://developer.mozilla.org/en-US/docs/Web/CSS/transform & https://www.w3.org/TR/css-transforms-1/
// - Matrix math: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Matrix_math_for_the_web
// - Perspective:
//   - https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection
//   - https://www.w3.org/TR/css-transforms-2/#perspective

// TODO: 
// - See https://observablehq.com/@d3/projection-reflectx?collection=@d3/d3-geo for example with drag to rotate (disable zoom)
// - Try making the sphere semi-transparent
// - Try drawing lines from the |0> and |1> axis to check rendering paths
// - Try to draw the (labeled) X, Y, Z axes on the sphere?
// - Try to draw the lines with gradients to show the path of the qubit
// - Consider using a Spherical Fibonacci grid to draw the sphere: https://observablehq.com/@fil/icosahedron

function test() {
  // x, y, z, w. w default to 1, others to 0.
  // Can also use the syntax: const p = DOMPoint.fromPoint({x: 1, y: 2});
  const point = new DOMPoint(3, 2, 1);

  const mat = new DOMMatrix([1,2,3,4,5,6]);
  point.matrixTransform(mat);
}

export function Sphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0); // Increase rotates counter-clockwise from above
  const [tilt, setTilt] = useState(0);  // Increase tilts the top away

  const inset = 20,
    width = 600,
    height = 600;
  const outline = { type: "Sphere" };
  const projection = geoOrthographic().fitExtent(
    [
      [inset, inset],
      [width - inset, height - inset],
    ],
    outline as any
  ).clipAngle(90);
  const graticule = geoGraticule10();

  const myPaths: MultiLineString = {
    type: "MultiLineString",
    coordinates: [
      [
        [100, 0],
        [110, 10],
        [110, 5],
      ],
      [
        [50, 100],
        [90, 145],
      ],
      [
        [0, 0], // first 0 is on the equator, second 0 is on the prime meridian
        [10, -20], // 10 degrees east of the prime meridian, 20 degrees south of the equator
      ],
    ],
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context: CanvasRenderingContext2D = canvas.getContext("2d")!;

    draw();

    async function draw() {
      context.clearRect(0, 0, width, height);
      const path = geoPath(projection, context);
      projection.rotate([rotation, tilt]);
      context.save();
    
      context.beginPath();
      context.globalAlpha = 0.25;
      projection.precision(0.2);
      path(graticule);
      context.stroke();

      context.beginPath();
      context.lineWidth = 1;
      context.arc(
        width / 2,
        height / 2,
        width / 2 - inset,
        0,
        2 * Math.PI,
        false
      );
      context.stroke();

      context.beginPath();
      projection.precision(0.2);
      context.strokeStyle = "red";
      context.lineWidth = 5;
      context.globalAlpha = 1;
      path(myPaths);
      context.stroke();
    
      context.restore();
    }
  });

  function updateRotation(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = parseInt(target.value);
    setRotation(value);
  }

  function updateTilt(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = parseInt(target.value);
    setTilt(value);
  }

  return (
    <>
      <canvas ref={canvasRef} width="600" height="600"></canvas>
      <input
        type="range"
        min="0"
        max="360"
        step="1"
        value={rotation}
        id="rotation"
        onInput={updateRotation}
      />
      <input
        type="range"
        min="0"
        max="360"
        step="1"
        value={tilt}
        id="tilt"
        onInput={updateTilt}
      />
    </>
  );
}
