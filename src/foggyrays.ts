import {
  Float,
  godrays,
  mut,
  op,
  pos,
  resolution,
  simplex,
  time,
  Vec4,
  wrapInValue,
  WrappedExpr,
  float,
  BasicFloat,
  PrimitiveFloat,
  GodRaysExpr,
  PrimitiveVec4,
} from "@bandaloo/merge-pass";

export class FoggyRaysExpr extends WrappedExpr<Vec4> {
  periodFloat: BasicFloat;
  speedFloat: BasicFloat;
  throwDistanceFloat: BasicFloat;
  godraysExpr: GodRaysExpr;

  period: Float;
  speed: Float;
  throwDistance: Float;

  convertsDepth: boolean;

  constructor(
    period: Float = mut(100),
    speed: Float = mut(1),
    throwDistance: Float = mut(0.3),
    numSamples = 100,
    samplerNum?: number,
    convertDepthColor?: Vec4
  ) {
    const periodFloat = float(period);
    const speedFloat = float(speed);
    const throwDistanceFloat = float(throwDistance);
    const fog = op(
      op(
        simplex(
          op(
            op(pos(), "+", op(op(time(), "*", speedFloat), "/", periodFloat)),
            "*",
            op(resolution(), "/", op(periodFloat, "*", 2))
          )
        ),
        "*",
        simplex(
          op(
            op(
              pos(),
              "+",
              op(op(time(), "*", speedFloat), "/", op(periodFloat, "*", -2))
            ),
            "*",
            op(resolution(), "/", op(periodFloat, "*", 4))
          )
        )
      ),
      "*",
      0.5
    );

    // TODO get rid of the mut
    const expr = godrays({
      weight: 0.009,
      density: op(throwDistanceFloat, "+", op(fog, "*", 0.5)),
      convertDepth:
        convertDepthColor !== undefined
          ? { threshold: 0.01, newColor: convertDepthColor }
          : undefined,
      samplerNum: samplerNum,
      numSamples: numSamples,
    });

    super(expr);

    this.periodFloat = periodFloat;
    this.speedFloat = speedFloat;
    this.throwDistanceFloat = throwDistanceFloat;
    this.godraysExpr = expr;
    this.convertsDepth = convertDepthColor !== undefined;

    this.period = period;
    this.speed = speed;
    this.throwDistance = throwDistance;
  }

  setPeriod(period: PrimitiveFloat | number) {
    this.periodFloat.setVal(wrapInValue(period));
    this.period = wrapInValue(period);
  }

  setSpeed(speed: PrimitiveFloat | number) {
    this.speedFloat.setVal(wrapInValue(speed));
    this.speed = wrapInValue(speed);
  }

  setThrowDistance(throwDistance: PrimitiveFloat | number) {
    this.throwDistanceFloat.setVal(wrapInValue(throwDistance));
    this.throwDistance = wrapInValue(throwDistance);
  }

  // TODO test this
  setNewColor(newColor: PrimitiveVec4) {
    if (this.convertsDepth === undefined) {
      throw new Error(
        "can only set new color if you are converting from a depth buffer"
      );
    }
    this.godraysExpr.setNewColor(newColor);
  }
}

export function foggyrays(
  period?: Float | number,
  speed?: Float | number,
  throwDistance?: Float | number,
  numSamples?: number,
  samplerNum?: number,
  convertDepthColor?: Vec4
) {
  return new FoggyRaysExpr(
    wrapInValue(period),
    wrapInValue(speed),
    wrapInValue(throwDistance),
    numSamples,
    samplerNum,
    convertDepthColor
  );
}
