import {
  WrappedExpr,
  Vec4,
  hsv2rgb,
  changecomp,
  rgb2hsv,
  fcolor,
  cfloat,
  tag,
  pfloat,
} from "@bandaloo/merge-pass";

export class CelShade extends WrappedExpr<Vec4> {
  constructor() {
    const mult = pfloat(0.8);
    const bump = pfloat(0.3);
    const center = pfloat(0.3);
    const edge = pfloat(0.03);
    const smooth = cfloat(
      tag`(smoothstep(-${edge} + ${center}, ${edge} + ${center}, ${rgb2hsv(
        fcolor()
      )}.z) * ${mult} + ${bump})`
    );
    const expr = hsv2rgb(changecomp(rgb2hsv(fcolor()), smooth, "z"));
    super(expr);
  }
}
