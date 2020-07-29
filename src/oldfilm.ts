import {
  WrappedExpr,
  Vec4,
  brightness,
  getcomp,
  pos,
  a1,
  a2,
  op,
  random,
  vec2,
  time,
  monochrome,
  simplex,
  resolution,
  pixel,
} from "@bandaloo/merge-pass";

export class OldFilm extends WrappedExpr<Vec4> {
  constructor() {
    const period = 1 / 3;
    const ftime = a1("floor", op(time(), "*", 24));
    const grainy = op(
      random(op(pixel(), "+", a2("mod", op(ftime, "*", 99), 3000))),
      "/",
      9
    );
    const rpos = a2(
      "mod",
      op(pos(), "+", random(vec2(ftime, 0))),
      vec2(10000, 10000)
    );
    const lines = op(
      a2("pow", a1("sin", getcomp(op(rpos, "/", period), "x")), 3000),
      "*",
      op(op(random(vec2(ftime, 0)), "*", -0.25), "+", 0.05)
    );
    const spos = op(
      op(pos(), "*", op(resolution(), "/", getcomp(resolution(), "y"))),
      "+",
      op(ftime, "*", 4)
    );
    const fsimplex = op(op(simplex(op(spos, "*", 7)), "*", 0.44), "+", 0.5);
    const spots = op(a2("step", fsimplex, 0.08), "*", 0.4);
    super(monochrome(brightness(spots, brightness(lines, brightness(grainy)))));
  }
}
