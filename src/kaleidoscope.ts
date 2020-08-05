import {
  a1,
  a2,
  BasicFloat,
  channel,
  Float,
  float,
  getcomp,
  op,
  pos,
  PrimitiveFloat,
  rotate,
  translate,
  vec2,
  Vec4,
  wrapInValue,
  WrappedExpr,
  mut,
} from "@bandaloo/merge-pass";

export class Kaleidoscope extends WrappedExpr<Vec4> {
  sidesFloat: BasicFloat;
  scaleFloat: BasicFloat;

  sides: Float;
  scale: Float;

  constructor(sides: Float, scale: Float) {
    const sidesFloat = float(sides);
    const scaleFloat = float(scale);
    const tpos = op(translate(pos(), vec2(-0.5, -0.5)), "/", scaleFloat);
    const angle = a2("atan", getcomp(tpos, "y"), getcomp(tpos, "x"));

    const b = op(2 * Math.PI, "*", op(1, "/", sidesFloat));
    const mangle = op(a1("floor", op(angle, "/", b)), "*", b);

    const a = op(angle, "-", mangle);
    const flip = op(b, "-", op(2, "*", a));

    console.log("test!");
    const sign = a1(
      "floor",
      op(a2("mod", op(mangle, "+", 0.1), op(b, "*", 2)), "/", b)
    );

    const spos = translate(
      rotate(tpos, op(mangle, "-", op(flip, "*", sign))),
      vec2(0.5, 0.5)
    );

    super(channel(-1, spos));

    this.sidesFloat = sidesFloat;
    this.scaleFloat = scaleFloat;

    this.sides = sides;
    this.scale = scale;
  }

  setSides(sides: PrimitiveFloat | number) {
    this.sidesFloat.setVal(wrapInValue(sides));
    this.sides = wrapInValue(sides);
  }

  setScale(scale: PrimitiveFloat | number) {
    this.scaleFloat.setVal(wrapInValue(scale));
    this.scale = wrapInValue(scale);
  }
}

export function kaleidoscope(
  sides: Float | number = mut(8),
  scale: Float | number = mut(1)
) {
  return new Kaleidoscope(wrapInValue(sides), wrapInValue(scale));
}
