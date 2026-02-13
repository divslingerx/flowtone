"use client";
import { NormalisableRange } from "~/lib/NormalisableRange";
import { KnobBase } from "./knob-base";

type KnobBaseProps = React.ComponentProps<typeof KnobBase>;
type KnobFrequencyProps = Pick<
  KnobBaseProps,
  "theme" | "label" | "orientation"
> & {
  value?: number;
  onChange?: (value: number) => void;
};

export function KnobFrequency(props: KnobFrequencyProps) {
  const { value, onChange, ...restProps } = props;

  return (
    <KnobBase
      valueDefault={value ?? valueDefault}
      valueMin={valueMin}
      valueMax={valueMax}
      stepFn={stepFn}
      stepLargerFn={stepLargerFn}
      valueRawRoundFn={valueRawRoundFn}
      valueRawDisplayFn={valueRawDisplayFn}
      mapTo01={mapTo01}
      mapFrom01={mapFrom01}
      {...restProps}
    />
  );
}

const valueMin = 20;
const valueMax = 20000;
const valueDefault = 440;
const stepFn = (valueRaw: number): number => {
  if (valueRaw < 100) {
    return 1;
  }

  if (valueRaw < 1000) {
    return 10;
  }

  return 100;
};

const stepLargerFn = (valueRaw: number): number => stepFn(valueRaw) * 10;
const valueRawRoundFn = (x: number): number => x;
const valueRawDisplayFn = (hz: number): string => {
  if (hz < 100) {
    return `${hz.toFixed(1)} Hz`;
  }

  if (hz < 1000) {
    return `${hz.toFixed(0)} Hz`;
  }

  const kHz = hz / 1000;

  if (hz < 10000) {
    return `${kHz.toFixed(2)} kHz`;
  }

  return `${kHz.toFixed(1)} kHz`;
};

const normalisableRange = new NormalisableRange(valueMin, valueMax, 1000);
const mapTo01 = (x: number) => normalisableRange.mapTo01(x);
const mapFrom01 = (x: number) => normalisableRange.mapFrom01(x);
