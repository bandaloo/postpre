import {
  a2,
  BasicFloat,
  blur2d,
  brightness,
  center,
  EffectLoop,
  Float,
  float,
  len,
  op,
  mut,
  wrapInValue,
  PrimitiveFloat,
} from "@bandaloo/merge-pass";

export class Vignette extends EffectLoop {
  blurScalarFloat: BasicFloat;
  brightnessScalarFloat: BasicFloat;
  brightnessExponentFloat: BasicFloat;

  blurScalar: Float;
  brightnessScalar: Float;
  brightnessExponent: Float;

  constructor(
    blurScalar: Float = mut(3),
    brightnessScalar: Float = mut(1.8),
    brightnessExponent: Float = mut(1.8)
  ) {
    const blurScalarFloat = float(blurScalar);
    const brightnessScalarFloat = float(brightnessScalar);
    const brightnessExponentFloat = float(brightnessExponent);
    const blurLen = op(len(center()), "*", blurScalarFloat);
    const blurExpr = blur2d(blurLen, blurLen);
    const brightLen = a2("pow", len(center()), brightnessExponentFloat);
    const brightExpr = brightness(
      op(brightLen, "*", op(brightnessScalarFloat, "*", -1))
    );

    super([blurExpr, brightExpr], { num: 1 });

    this.blurScalarFloat = blurScalarFloat;
    this.brightnessScalarFloat = brightnessScalarFloat;
    this.brightnessExponentFloat = brightnessExponentFloat;

    this.blurScalar = blurScalar;
    this.brightnessScalar = brightnessScalar;
    this.brightnessExponent = brightnessExponent;
  }

  setBlurScalar(blurScalar: PrimitiveFloat | number) {
    this.blurScalarFloat.setVal(wrapInValue(blurScalar));
    this.blurScalar = wrapInValue(blurScalar);
  }

  setBrightnessScalar(brightnessScalar: PrimitiveFloat | number) {
    this.brightnessScalarFloat.setVal(wrapInValue(brightnessScalar));
    this.brightnessScalar = wrapInValue(brightnessScalar);
  }

  setBrightnessExponent(brightnessExponent: PrimitiveFloat | number) {
    this.brightnessExponentFloat.setVal(wrapInValue(brightnessExponent));
    this.brightnessExponent = wrapInValue(brightnessExponent);
  }
}

export function vignette(
  blurScalar?: Float | number,
  brightnessScalar?: Float | number,
  brightnessExponent?: Float | number
) {
  return new Vignette(
    wrapInValue(blurScalar),
    wrapInValue(brightnessScalar),
    wrapInValue(brightnessExponent)
  );
}
