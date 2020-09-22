import {
  a1,
  a2,
  brightness,
  getcomp,
  monochrome,
  op,
  pixel,
  pos,
  random,
  resolution,
  simplex,
  time,
  vec2,
  Vec4,
  WrappedExpr,
  mut,
  Float,
  float,
  BasicFloat,
  wrapInValue,
  PrimitiveFloat,
} from "@bandaloo/merge-pass";

export class OldFilm extends WrappedExpr<Vec4> {
  speckIntensityFloat: BasicFloat;
  lineIntensityFloat: BasicFloat;
  grainIntensityFloat: BasicFloat;

  speckIntensity: Float;
  lineIntensity: Float;
  grainIntensity: Float;
  constructor(
    speckIntensity: Float,
    lineIntensity: Float,
    grainIntensity: Float
  ) {
    const speckIntensityFloat = float(speckIntensity);
    const lineIntensityFloat = float(lineIntensity);
    const grainIntensityFloat = float(grainIntensity);
    const ftime = a1("floor", op(time(), "*", 24));
    const grainy = op(
      random(op(pixel(), "+", a2("mod", op(ftime, "*", 99), 3000))),
      "*",
      grainIntensityFloat
    );
    const rate = 10;
    const triangles = op(
      op(
        op(
          a1(
            "abs",
            op(
              op(2, "*", a1("fract", op(rate, "*", getcomp(pos(), "x")))),
              "-",
              1
            )
          ),
          "-",
          0.5
        ),
        "*",
        2
      ),
      "*",
      lineIntensityFloat
    );
    const stepping = a2(
      "step",
      op(1, "-", op(1, "/", rate * 12)),
      a2(
        "mod",
        op(getcomp(pos(), "x"), "+", random(op(vec2(50, 50), "*", time()))),
        1
      )
    );
    const lines = op(triangles, "*", stepping);
    const spos = a2(
      "mod",
      op(
        op(pos(), "*", op(resolution(), "/", getcomp(resolution(), "y"))),
        "+",
        ftime
      ),
      vec2(100, 100)
    );

    const fsimplex = op(op(simplex(op(spos, "*", 7)), "*", 0.44), "+", 0.5);
    const spots = op(a2("step", fsimplex, 0.08), "*", speckIntensityFloat);
    super(monochrome(brightness(spots, brightness(lines, brightness(grainy)))));

    this.speckIntensityFloat = speckIntensityFloat;
    this.lineIntensityFloat = lineIntensityFloat;
    this.grainIntensityFloat = grainIntensityFloat;

    this.speckIntensity = speckIntensity;
    this.lineIntensity = lineIntensity;
    this.grainIntensity = grainIntensity;
  }

  setSpeckIntensity(speckIntensity: PrimitiveFloat | number) {
    this.speckIntensityFloat.setVal(wrapInValue(speckIntensity));
    this.speckIntensity = wrapInValue(speckIntensity);
  }

  setLineIntensity(lineIntensity: PrimitiveFloat | number) {
    this.lineIntensityFloat.setVal(wrapInValue(lineIntensity));
    this.lineIntensity = wrapInValue(lineIntensity);
  }

  setGrainIntensity(grainIntensity: PrimitiveFloat | number) {
    this.grainIntensityFloat.setVal(wrapInValue(grainIntensity));
    this.grainIntensity = wrapInValue(grainIntensity);
  }
}

export function oldfilm(
  speckIntensity: Float | number = mut(0.4),
  lineIntensity: Float | number = mut(0.12),
  grainIntensity: Float | number = mut(0.11)
) {
  return new OldFilm(
    wrapInValue(speckIntensity),
    wrapInValue(lineIntensity),
    wrapInValue(grainIntensity)
  );
}
