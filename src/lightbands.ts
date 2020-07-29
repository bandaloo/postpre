import {
  a1,
  BasicFloat,
  brightness,
  channel,
  Float,
  float,
  getcomp,
  mut,
  op,
  PrimitiveFloat,
  ternary,
  time,
  truedepth,
  Vec4,
  wrapInValue,
  WrappedExpr,
} from "@bandaloo/merge-pass";

export class LightBands extends WrappedExpr<Vec4> {
  speedFloat: BasicFloat;
  intensityFloat: BasicFloat;
  thresholdFloat: BasicFloat;

  speed: Float;
  intensity: Float;
  threshold: Float;

  constructor(
    speed: Float,
    intensity: Float,
    threshold: Float,
    samplerNum: number
  ) {
    const speedFloat = float(speed);
    const intensityFloat = float(intensity);
    const thresholdFloat = float(threshold);
    const expr = brightness(
      ternary(
        op(getcomp(channel(0), "r"), "-", thresholdFloat),
        op(
          a1(
            "sin",
            op(
              op(time(), "*", speedFloat),
              "+",
              truedepth(getcomp(channel(samplerNum), "r"))
            )
          ),
          "*",
          intensityFloat
        ),
        0
      )
    );

    super(expr);

    this.speedFloat = speedFloat;
    this.intensityFloat = intensityFloat;
    this.thresholdFloat = thresholdFloat;

    this.speed = speed;
    this.intensity = intensity;
    this.threshold = threshold;
  }

  setSpeed(speed: PrimitiveFloat | number) {
    this.speedFloat.setVal(wrapInValue(speed));
    this.speed = wrapInValue(speed);
  }

  setIntensity(intensity: PrimitiveFloat | number) {
    this.intensityFloat.setVal(wrapInValue(intensity));
    this.intensity = wrapInValue(intensity);
  }

  setThreshold(threshold: PrimitiveFloat | number) {
    this.thresholdFloat.setVal(wrapInValue(threshold));
    this.threshold = wrapInValue(threshold);
  }
}

export function lightbands(
  speed: Float | number = mut(4),
  intensity: Float | number = mut(0.3),
  threshold: Float | number = mut(0.01),
  samplerNum = 0
) {
  return new LightBands(
    wrapInValue(speed),
    wrapInValue(intensity),
    wrapInValue(threshold),
    samplerNum
  );
}
