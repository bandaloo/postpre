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
    const period = 1 / 3;
    const ftime = a1("floor", op(time(), "*", 24));
    const grainy = op(
      random(op(pixel(), "+", a2("mod", op(ftime, "*", 99), 3000))),
      "*",
      grainIntensityFloat
    );
    // mod is to wrap values back around
    const rpos = a2(
      "mod",
      op(pos(), "+", random(vec2(ftime, 0))),
      vec2(10000, 10000)
    );
    const lines = op(
      a2("pow", a1("sin", getcomp(op(rpos, "/", period), "x")), 3000),
      "*",
      op(
        op(random(vec2(ftime, 0)), "*", op(lineIntensityFloat, "*", -1)),
        "+",
        op(lineIntensityFloat, "/", 5)
      )
    );
    const spos = op(
      op(pos(), "*", op(resolution(), "/", getcomp(resolution(), "y"))),
      "+",
      op(ftime, "*", 4)
    );

    // TODO consider adding an optional cue mark

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
  lineIntensity: Float | number = mut(0.25),
  grainIntensity: Float | number = mut(0.11)
) {
  return new OldFilm(
    wrapInValue(speckIntensity),
    wrapInValue(lineIntensity),
    wrapInValue(grainIntensity)
  );
}
