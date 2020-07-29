import {
  BasicFloat,
  blur2d,
  channel,
  edge,
  EffectLoop,
  Float,
  float,
  loop,
  mut,
  PrimitiveFloat,
  wrapInValue,
} from "@bandaloo/merge-pass";

export class BlurAndTrace extends EffectLoop {
  brightnessFloat: BasicFloat;
  blurSizeFloat: BasicFloat;
  brightness: Float;
  blurSize: Float;

  constructor(
    brightness: Float,
    blurSize: Float,
    reps: number,
    taps: 5 | 9 | 13,
    samplerNum: number,
    useDepth: boolean
  ) {
    const brightnessFloat = float(brightness);
    const blurSizeFloat = float(blurSize);
    super(
      [
        ...(!useDepth ? [loop([channel(samplerNum)]).target(samplerNum)] : []),
        blur2d(blurSizeFloat, blurSizeFloat, reps, taps),
        edge(brightnessFloat, samplerNum),
      ],
      { num: 1 }
    );

    this.brightnessFloat = brightnessFloat;
    this.blurSizeFloat = blurSizeFloat;
    this.brightness = brightness;
    this.blurSize = blurSize;
  }

  setBrightness(brightness: PrimitiveFloat | number) {
    this.brightnessFloat.setVal(wrapInValue(brightness));
    this.brightness = wrapInValue(brightness);
  }

  setBlurSize(blurSize: PrimitiveFloat | number) {
    this.blurSizeFloat.setVal(wrapInValue(blurSize));
    this.blurSize = wrapInValue(blurSize);
  }
}

export function blurandtrace(
  brightness: Float | number = mut(1),
  blurSize: Float | number = mut(1),
  reps = 4,
  taps: 5 | 9 | 13 = 9,
  samplerNum = 0,
  useDepth = false
) {
  return new BlurAndTrace(
    wrapInValue(brightness),
    wrapInValue(blurSize),
    reps,
    taps,
    samplerNum,
    useDepth
  );
}
