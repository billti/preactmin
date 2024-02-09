// Use mathjs for many of the matrix operations
// See https://mathjs.org/docs/datatypes/matrices.html#calculations and https://mathjs.org/docs/reference/functions.html

import {
  matrix,
  complex,
  SQRT1_2,
  multiply,
  conj,
  transpose,
  compare,
  type Matrix,
} from "mathjs";

const c0 = complex(0, 0);
const p1 = complex(1, 0);
const pi = complex(0, 1);
const n1 = complex(-1, 0);
const ni = complex(0, -1);

export const Identity = matrix([
  [p1, c0],
  [c0, p1],
]);

export const PauliX = matrix([
  [c0, p1],
  [p1, c0],
]);

export const PauliY = matrix([
  [c0, ni],
  [pi, c0],
]);

export const PauliZ = matrix([
  [p1, c0],
  [c0, n1],
]);

export const Hadamard = multiply(
  SQRT1_2,
  matrix([
    [p1, p1],
    [p1, n1],
  ])
);

export const SGate = matrix([
  [p1, c0],
  [c0, pi],
]);

const e_to_ipi_4 = complex(SQRT1_2, SQRT1_2);

export const TGate = matrix([
  [p1, c0],
  [c0, e_to_ipi_4],
]);

export const CNOT = matrix([
  [p1, c0, c0, c0],
  [c0, p1, c0, c0],
  [c0, c0, c0, p1],
  [c0, c0, p1, c0],
]);

export const SWAP = matrix([
  [p1, c0, c0, c0],
  [c0, c0, p1, c0],
  [c0, p1, c0, c0],
  [c0, c0, c0, p1],
]);

export function adjoint(m: Matrix): Matrix {
  return conj(transpose(m));
}

export function isMatrixEqual(m1: Matrix, m2: Matrix): boolean {
  // See https://mathjs.org/docs/core/configuration.html if the 'epsilon' value needs to be changed
  return compare(m1, m2) === 0;
}

/* To test (note: "!" == "dagger", or conjugate transpose, or "adjoint"):
SXS! = Y
SZS! = Z
HXH! = Z
HZH! = X
SQRT(Z) = S, SQRT(S) = T
T^2 = S, S^2 = Z
*/
