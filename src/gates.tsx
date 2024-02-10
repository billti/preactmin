import {m2x2, Cplx, vec2} from './cplx.js';

export const e_to_ipi_4 = new Cplx(Math.SQRT1_2, Math.SQRT1_2);

export const Ident = m2x2(`
  1, 0,
  0, 1
`);

export const PauliX = m2x2(`
  0, 1,
  1, 0
`);

export const PauliY = m2x2(`
  0,-i,
  i, 0
`);

export const PauliZ = m2x2(`
  1, 0,
  0,-1
`);

export const Hadamard = m2x2(`
  1, 1,
  1,-1
`).mul(Math.SQRT1_2);

export const SGate = m2x2(`
  1, 0,
  0, i
`);

export const TGate = m2x2([
  1, 0,
  0, e_to_ipi_4
]);

export const Ket0 = vec2([1, 0]);
export const Ket1 = vec2([0, 1]);
export const KetPlus = vec2([1, 1]).mul(Math.SQRT1_2);
export const KetMinus = vec2([1, -1]).mul(Math.SQRT1_2);
