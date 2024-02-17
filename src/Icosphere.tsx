import { useEffect, useRef, useState } from "preact/hooks";

type Triangle = [DOMPoint, DOMPoint, DOMPoint];
type Triangles = Triangle[];

function normalize(point: DOMPoint) {
  const length = Math.sqrt(
    point.x * point.x + point.y * point.y + point.z * point.z
  );
  point.x /= length;
  point.y /= length;
  point.z /= length;
  return point;
}

function icosahedron(): Triangles {
  // See https://en.wikipedia.org/wiki/Regular_icosahedron

  const t = (1 + Math.sqrt(5)) / 2; // Golden ratio

  // 12 points
  const vertices = [
    normalize(new DOMPoint(-1, t, 0)),
    normalize(new DOMPoint(1, t, 0)),
    normalize(new DOMPoint(-1, -t, 0)),
    normalize(new DOMPoint(1, -t, 0)),

    normalize(new DOMPoint(0, -1, t)),
    normalize(new DOMPoint(0, 1, t)),
    normalize(new DOMPoint(0, -1, -t)),
    normalize(new DOMPoint(0, 1, -t)),

    normalize(new DOMPoint(t, 0, -1)),
    normalize(new DOMPoint(t, 0, 1)),
    normalize(new DOMPoint(-t, 0, -1)),
    normalize(new DOMPoint(-t, 0, 1)),
  ];

  function indicesToPoints(indices: number[]): Triangle {
    return indices.map((index) => vertices[index]) as Triangle;
  }

  // 20 triangles
  const triangles = [
    indicesToPoints([0, 11, 5]),
    indicesToPoints([0, 5, 1]),
    indicesToPoints([0, 1, 7]),
    indicesToPoints([0, 7, 10]),
    indicesToPoints([0, 10, 11]),
    indicesToPoints([1, 5, 9]),
    indicesToPoints([5, 11, 4]),
    indicesToPoints([11, 10, 2]),
    indicesToPoints([10, 7, 6]),
    indicesToPoints([7, 1, 8]),
    indicesToPoints([3, 9, 4]),
    indicesToPoints([3, 4, 2]),
    indicesToPoints([3, 2, 6]),
    indicesToPoints([3, 6, 8]),
    indicesToPoints([3, 8, 9]),
    indicesToPoints([4, 9, 5]),
    indicesToPoints([2, 4, 11]),
    indicesToPoints([6, 2, 10]),
    indicesToPoints([8, 6, 7]),
    indicesToPoints([9, 8, 1]),
  ];

  return triangles;
}

function splitTriangles(triangles: Triangles): Triangles {
  // Iterate over each triangle, and split it into 4 new triangles

  const newTriangles: Triangles = [];
  for (const triangle of triangles) {
    const [a, b, c] = triangle;
    const ab = normalize(
      new DOMPoint((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2)
    );
    const bc = normalize(
      new DOMPoint((b.x + c.x) / 2, (b.y + c.y) / 2, (b.z + c.z) / 2)
    );
    const ca = normalize(
      new DOMPoint((c.x + a.x) / 2, (c.y + a.y) / 2, (c.z + a.z) / 2)
    );

    newTriangles.push([a, ab, ca]);
    newTriangles.push([ab, b, bc]);
    newTriangles.push([ca, bc, c]);
    newTriangles.push([ab, bc, ca]);
  }
  return newTriangles;
}

const ico = icosahedron();
let triangles = splitTriangles(ico);
triangles = splitTriangles(triangles);
triangles = splitTriangles(triangles);

export function Icosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qX, setQX] = useState(0); // Increase rotates counter-clockwise from above
  const [qY, setQY] = useState(0); // Increase tilts the top away
  const [qZ, setQZ] = useState(0); // Increase tilts the top away

  const width = 600;
  const height = 600;

  function test(context: CanvasRenderingContext2D) {
    context.save();

    const squarePoints = [
      // X axis
      new DOMPoint(0, -0.025, 0),
      new DOMPoint(1.5, -0.025, 0),
      new DOMPoint(1.5, 0.025, 0),
      new DOMPoint(0, 0.025, 0),

      // Y axis
      new DOMPoint(0, -0.025, 0),
      new DOMPoint(0, -0.025, 1.5),
      new DOMPoint(0, 0.025, 1.5),
      new DOMPoint(0, 0.025, 0),

      // Z axis
      new DOMPoint(-0.025, 0, 0),
      new DOMPoint(-0.025, -1.5, 0),
      new DOMPoint(0.025, -1.5, 0),
      new DOMPoint(0.025, 0, 0),
    ];

    // Minor translation to make axes visible
    const matrix = new DOMMatrix("perspective(3px) translate(-0.2px, 0.2px)");
    matrix.rotateSelf(-qY, qZ, qX);

    const thePoints = squarePoints.map((point) => {
      // Need to handle perspective here, before doing the scaling and translation
      const t = point.matrixTransform(matrix);
      return new DOMPoint(t.x / t.w, t.y / t.w, 0);
    });

    context.translate(300 + (250 * 0.2), 300 - (250 * 0.2));
    context.scale(250, 250);

    context.strokeStyle = "black";
    context.fillStyle = "rgba(20, 40, 40, 0.5)";
    context.lineWidth = 0.01;

    for (let i = 0; i < 3; i++) {
      const offset = i * 4;

      context.beginPath();
      // Below seems to have some culling half the time
      // context.ellipse(0, 0, 0.025, 0.025, 0, 0, 2 * Math.PI);
      context.moveTo(thePoints[0 + offset].x, thePoints[0 + offset].y);
      context.lineTo(thePoints[1 + offset].x, thePoints[1 + offset].y);
      context.lineTo(thePoints[2 + offset].x, thePoints[2 + offset].y);
      context.lineTo(thePoints[3 + offset].x, thePoints[3 + offset].y);
      context.closePath();
      context.fill();
    }

    context.restore();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context: CanvasRenderingContext2D = canvas.getContext("2d")!;

    //const matrix = new DOMMatrix("translate(-0.2px, 0.2px)");
    const matrix = new DOMMatrix();
    matrix.scale3dSelf(1);
    matrix.rotateSelf(qY, -qZ, qX);

    // Set perspective
    matrix.m34 = 0.1;

    const rotatedTriangles = triangles.map((triangle) => {
      return triangle.map((point) => {
        return point.matrixTransform(matrix);
      }) as Triangle;
    });

    rotatedTriangles.sort((a, b) => {
      return b[0].z - a[0].z;
    });

    context.save();
    context.clearRect(0, 0, width, height);

    context.translate(width / 2, height / 2);
    context.scale(250, 250);

    context.strokeStyle = "gray";
    context.fillStyle = "rgba(200, 200, 220, 0.75)";
    context.lineWidth = 0.0025;
    context.lineCap = "butt";

    rotatedTriangles.forEach((triangle) => {
      context.beginPath();
      context.moveTo(triangle[0].x, triangle[0].y);
      context.lineTo(triangle[1].x, triangle[1].y);
      context.lineTo(triangle[2].x, triangle[2].y);
      context.closePath();
      context.fill();
      context.stroke();
    });
    context.beginPath();
    context.arc(width / 2, height / 2, 200, 0, 2 * Math.PI);
    context.stroke();
    context.restore();

    test(context);
  }, [qX, qY, qZ]);

  function updateQX(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = parseInt(target.value);
    setQX(value);
  }

  function updateQY(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = parseInt(target.value);
    setQY(value);
  }

  function updateQZ(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = parseInt(target.value);
    setQZ(value);
  }

  return (
    <>
      <canvas ref={canvasRef} width={width} height={height} />
      <input
        type="range"
        min="0"
        max="360"
        step="1"
        value={qX}
        id="qx"
        onInput={updateQX}
      />
      <input
        type="range"
        min="0"
        max="360"
        step="1"
        value={qY}
        id="qy"
        onInput={updateQY}
      />
      <input
        type="range"
        min="0"
        max="360"
        step="1"
        value={qZ}
        id="qz"
        onInput={updateQZ}
      />
    </>
  );
}
