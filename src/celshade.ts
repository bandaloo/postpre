import {
  WrappedExpr,
  Vec4,
  hsv2rgb,
  changecomp,
  rgb2hsv,
  fcolor,
  cfloat,
  tag,
  Float,
  wrapInValue,
  mut,
  BasicFloat,
  float,
  PrimitiveFloat,
} from "@bandaloo/merge-pass";

export class CelShade extends WrappedExpr<Vec4> {
  multFloat: BasicFloat;
  bumpFloat: BasicFloat;
  centerFloat: BasicFloat;
  edgeFloat: BasicFloat;

  mult: Float;
  bump: Float;
  center: Float;
  edge: Float;

  constructor(mult: Float, bump: Float, center: Float, edge: Float) {
    const multFloat = float(mult);
    const bumpFloat = float(bump);
    const centerFloat = float(center);
    const edgeFloat = float(edge);
    const smooth = cfloat(
      tag`(smoothstep(-${edgeFloat} + ${centerFloat}, ${edgeFloat} + ${centerFloat}, ${rgb2hsv(
        fcolor()
      )}.z) * ${multFloat} + ${bumpFloat})`
    );
    const expr = hsv2rgb(changecomp(rgb2hsv(fcolor()), smooth, "z"));
    super(expr);

    this.multFloat = multFloat;
    this.bumpFloat = bumpFloat;
    this.centerFloat = centerFloat;
    this.edgeFloat = edgeFloat;

    this.mult = mult;
    this.bump = bump;
    this.center = center;
    this.edge = edge;
  }

  setMult(mult: PrimitiveFloat | number) {
    this.multFloat.setVal(wrapInValue(mult));
    this.mult = wrapInValue(mult);
  }

  setBump(bump: PrimitiveFloat | number) {
    this.bumpFloat.setVal(wrapInValue(bump));
    this.bump = wrapInValue(bump);
  }

  setCenter(center: PrimitiveFloat | number) {
    this.centerFloat.setVal(wrapInValue(center));
    this.center = wrapInValue(center);
  }

  setEdge(edge: PrimitiveFloat | number) {
    this.edgeFloat.setVal(wrapInValue(edge));
    this.edge = wrapInValue(edge);
  }
}

export function celshade(
  mult: Float | number = mut(0.8),
  bump: Float | number = mut(0.3),
  center: Float | number = mut(0.3),
  edge: Float | number = mut(0.03)
) {
  return new CelShade(
    wrapInValue(mult),
    wrapInValue(bump),
    wrapInValue(center),
    wrapInValue(edge)
  );
}
