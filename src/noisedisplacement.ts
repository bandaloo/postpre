import {
  WrappedExpr,
  Vec4,
  simplex,
  op,
  pos,
  time,
  resolution,
  mut,
  Float,
  float,
  getcomp,
  channel,
  vec2,
  changecomp,
  BasicFloat,
  PrimitiveFloat,
  wrapInValue,
  get2comp,
} from "@bandaloo/merge-pass";

// offsets so noise will never overlap directly
const X_OFF = 1234;
const Y_OFF = 5678;

export class NoiseDisplacement extends WrappedExpr<Vec4> {
  periodFloat: BasicFloat;
  speedFloat: BasicFloat;
  intensityFloat: BasicFloat;

  period: Float;
  speed: Float;
  intensity: Float;

  constructor(
    period: Float = mut(0.1),
    speed: Float = mut(1),
    intensity: Float = mut(0.005)
  ) {
    const periodFloat = float(period);
    const speedFloat = float(speed);
    const intensityFloat = float(intensity);
    const noise = (comp: string) =>
      simplex(
        op(
          op(
            changecomp(
              op(pos(), "/", periodFloat),
              op(time(), "*", speedFloat),
              comp,
              "+"
            ),
            "*",
            op(resolution(), "/", getcomp(resolution(), "y"))
          ),
          "+",
          comp === "x" ? X_OFF : Y_OFF
        )
      );

    super(
      channel(
        -1,
        op(
          op(
            op(vec2(noise("x"), noise("y")), "*", intensityFloat),
            "*",
            op(get2comp(resolution(), "yx"), "/", getcomp(resolution(), "y"))
          ),
          "+",
          pos()
        )
      )
    );

    this.periodFloat = periodFloat;
    this.speedFloat = speedFloat;
    this.intensityFloat = intensityFloat;

    this.period = period;
    this.speed = speed;
    this.intensity = intensity;
  }

  setPeriod(period: PrimitiveFloat | number) {
    this.periodFloat.setVal(wrapInValue(period));
    this.period = wrapInValue(period);
  }

  setSpeed(speed: PrimitiveFloat | number) {
    this.speedFloat.setVal(wrapInValue(speed));
    this.speed = wrapInValue(speed);
  }

  setIntensity(intensity: PrimitiveFloat | number) {
    this.intensityFloat.setVal(wrapInValue(intensity));
    this.speed = wrapInValue(intensity);
  }
}
