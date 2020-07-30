import {
  WrappedExpr,
  Vec4,
  Float,
  a2,
  getcomp,
  pos,
  translate,
  vec2,
  rotate,
  channel,
  op,
  a1,
} from "@bandaloo/merge-pass";

export class Kaleidoscope extends WrappedExpr<Vec4> {
  constructor() {
    const sides = 8;
    const tpos = translate(pos(), vec2(-0.5, -0.5));
    const angle = a2("atan", getcomp(tpos, "y"), getcomp(tpos, "x"));
    /*
    const mangle = op(
      a1("floor", op(angle, "*", 2 * Math.PI * sides)),
      "/",
      2 * Math.PI * sides
    );
    */
    const mangle = op(
      a1("floor", op(angle, "/", 2 * Math.PI * (1 / sides))),
      "*",
      2 * Math.PI * (1 / sides)
    );

    const a = op(angle, "-", mangle);
    const b = 2 * Math.PI * (1 / sides);
    const flip = op(b, "-", op(2, "*", a));

    //const sign = op(op(op(a2("mod", mangle, b * 2), "/", b), "+", 1), "/", 2);
    const sign = op(a2("mod", mangle, b * 2), "/", b);

    // rotate by angle
    const spos = translate(
      rotate(
        translate(pos(), vec2(-0.5, -0.5)),
        op(mangle, "-", op(flip, "*", sign))
      ),
      vec2(0.5, 0.5)
    );
    super(channel(-1, spos));
  }
}
