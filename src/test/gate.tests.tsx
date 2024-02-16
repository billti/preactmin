import {
  Ident,
  Hadamard,
  PauliX,
  PauliY,
  PauliZ,
  SGate,
  TGate,
  Ket0,
  Ket1,
  KetPlus,
  KetMinus,
  KetPlusI,
  KetMinusI,
} from "../gates.js";

import { Cplx, m2x2, vec2 } from "../cplx.js";

describe("Gate combos", () => {
  it("HZH† = X", () => {
    const HZHt = Hadamard.mul(PauliZ).mul(Hadamard.adjoint());
    expect(HZHt.compare(PauliX)).toBe(true);
  });

  it("SS† = I", () => {
    const SSt = SGate.mul(SGate.adjoint());
    expect(SSt.compare(Ident)).toBe(true);
  });

  it("TT = S", () => {
    const TT = TGate.mul(TGate);
    expect(TT.compare(SGate)).toBe(true);
  });

  it("transposes", () => {
    const yTranspose = m2x2("0,i,-i,0");
    expect(PauliY.transpose().compare(yTranspose)).toBe(true);
  });
});

describe("Gate application", () => {
  it("Applies Hadamard to |0>", () => {
    const result = Hadamard.mulVec2(Ket0);
    expect(result.compare(KetPlus)).toBe(true);
  });

  it("Applies ZH to |0>", () => {
    const result = PauliZ.mulVec2(Hadamard.mulVec2(Ket0));

    expect(result.compare(KetMinus)).toBe(true);
  });

  it("Applies XH to |0>", () => {
    const result = PauliX.mulVec2(Hadamard.mulVec2(Ket0));

    expect(result.compare(KetPlus)).toBe(true);
  });

  it("Applies X to |0>", () => {
    const result = PauliX.mulVec2(Ket0);
    expect(result.compare(Ket1)).toBe(true);
  });

  it("Applies Y to |0>", () => {
    const result = PauliY.mulVec2(Ket0);
    const expected = vec2("0,i");
    expect(result.compare(expected)).toBe(true);
  });

  it("|0> lands in |+i> after Hadamard and SGate", () => {
    const Xplus = Hadamard.mulVec2(Ket0);
    const result = SGate.mulVec2(Xplus);
    expect(result.compare(KetPlusI)).toBe(true);
  });

  it("|1> lands in |-i> after Hadamard and SGate", () => {
    const Xneg = Hadamard.mulVec2(Ket1);
    const result = SGate.mulVec2(Xneg);
    expect(result.compare(KetMinusI)).toBe(true);
  });
});

describe("Math tests", () => {
  it("Checks tolerance inside bounds", () => {
    const a = new Cplx(1.0000002, 0);
    expect(Ident.a.compare(a)).toBe(true);
  });

  it("Checks tolerance outside bounds", () => {
    const a = new Cplx(1.000002, 0);
    expect(Ident.a.compare(a)).toBe(false);
  });

  it("Checks matrix equality", () => {
    const mx = m2x2("1,0,0,1");
    expect(mx.compare(Ident)).toBe(true);
  });

  it("Checks matrix inequality", () => {
    const mx = m2x2("1,0,0,i");
    expect(mx.compare(Ident)).toBe(false);
  });
});
