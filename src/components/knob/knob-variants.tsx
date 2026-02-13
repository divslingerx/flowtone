/**
 * Knob Variants for Common Audio Parameters
 *
 * Pre-configured knob components for different parameter types
 */

import { KnobBase } from "./knob-base";
import { NormalisableRange } from "~/lib/NormalisableRange";
import { mapFrom01Linear, mapTo01Linear } from "@dsp-ts/math";

// ============================================================================
// KNOB TIME (Attack, Decay, Release)
// ============================================================================

export interface KnobTimeProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  theme?: "blue" | "green" | "purple" | "red" | "orange" | "stone";
}

export function KnobTime({
  label,
  value,
  onChange,
  min = 0.001,
  max = 5,
  theme = "blue",
}: KnobTimeProps) {
  const range = new NormalisableRange(min, max, 0.1);

  return (
    <KnobBase
      label={label}
      onChange={onChange}
      valueDefault={value || 0.1}
      valueMin={min}
      valueMax={max}
      theme={theme}
      valueRawRoundFn={(v) => v}
      mapTo01={(v, _min, _max) => range.mapTo01(v)}
      mapFrom01={(v, _min, _max) => range.mapFrom01(v)}
      valueRawDisplayFn={(v) => {
        if (v < 0.01) return `${(v * 1000).toFixed(1)} ms`;
        return `${v.toFixed(3)} s`;
      }}
      stepFn={(v) => {
        if (v < 0.01) return 0.001;
        if (v < 0.1) return 0.01;
        if (v < 1) return 0.05;
        return 0.1;
      }}
      stepLargerFn={(v) => {
        if (v < 0.1) return 0.01;
        if (v < 1) return 0.1;
        return 0.5;
      }}
    />
  );
}

// ============================================================================
// KNOB NORMALIZED (0-1 range)
// ============================================================================

export interface KnobNormalizedProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  theme?: "blue" | "green" | "purple" | "red" | "orange" | "stone";
}

export function KnobNormalized({
  label,
  value,
  onChange,
  theme = "blue",
}: KnobNormalizedProps) {
  return (
    <KnobBase
      label={label}
      onChange={onChange}
      valueDefault={value ?? 0.5}
      valueMin={0}
      valueMax={1}
      theme={theme}
      valueRawRoundFn={(v) => v}
      mapTo01={mapTo01Linear}
      mapFrom01={mapFrom01Linear}
      valueRawDisplayFn={(v) => `${(v * 100).toFixed(0)}%`}
      stepFn={() => 0.01}
      stepLargerFn={() => 0.1}
    />
  );
}

// ============================================================================
// KNOB Q (Resonance)
// ============================================================================

export interface KnobQProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  theme?: "blue" | "green" | "purple" | "red" | "orange" | "stone";
}

export function KnobQ({
  label,
  value,
  onChange,
  theme = "orange",
}: KnobQProps) {
  const range = new NormalisableRange(0.001, 100, 1);

  return (
    <KnobBase
      label={label}
      onChange={onChange}
      valueDefault={value || 1}
      valueMin={0.001}
      valueMax={100}
      theme={theme}
      valueRawRoundFn={(v) => v}
      mapTo01={(v, _min, _max) => range.mapTo01(v)}
      mapFrom01={(v, _min, _max) => range.mapFrom01(v)}
      valueRawDisplayFn={(v) => v.toFixed(2)}
      stepFn={(v) => {
        if (v < 1) return 0.01;
        if (v < 10) return 0.1;
        return 1;
      }}
      stepLargerFn={(v) => {
        if (v < 10) return 1;
        return 5;
      }}
    />
  );
}

// ============================================================================
// KNOB DETUNE
// ============================================================================

export interface KnobDetuneProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  theme?: "blue" | "green" | "purple" | "red" | "orange" | "stone";
}

export function KnobDetune({
  label,
  value,
  onChange,
  theme = "stone",
}: KnobDetuneProps) {
  return (
    <KnobBase
      label={label}
      onChange={onChange}
      valueDefault={value ?? 0}
      valueMin={-100}
      valueMax={100}
      theme={theme}
      valueRawRoundFn={(v) => v}
      mapTo01={mapTo01Linear}
      mapFrom01={mapFrom01Linear}
      valueRawDisplayFn={(v) => `${v.toFixed(1)} ¢`}
      stepFn={() => 1}
      stepLargerFn={() => 10}
    />
  );
}

// ============================================================================
// KNOB RATIO (Compressor)
// ============================================================================

export interface KnobRatioProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  theme?: "blue" | "green" | "purple" | "red" | "orange" | "stone";
}

export function KnobRatio({
  label,
  value,
  onChange,
  theme = "red",
}: KnobRatioProps) {
  return (
    <KnobBase
      label={label}
      onChange={onChange}
      valueDefault={value || 4}
      valueMin={1}
      valueMax={20}
      theme={theme}
      valueRawRoundFn={(v) => v}
      mapTo01={mapTo01Linear}
      mapFrom01={mapFrom01Linear}
      valueRawDisplayFn={(v) => `${v.toFixed(1)}:1`}
      stepFn={(v) => (v < 5 ? 0.1 : 0.5)}
      stepLargerFn={() => 1}
    />
  );
}

// ============================================================================
// KNOB GAIN
// ============================================================================

export interface KnobGainProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  theme?: "blue" | "green" | "purple" | "red" | "orange" | "stone";
}

export function KnobGain({
  label,
  value,
  onChange,
  theme = "green",
}: KnobGainProps) {
  return (
    <KnobBase
      label={label}
      onChange={onChange}
      valueDefault={value ?? 1}
      valueMin={0}
      valueMax={2}
      theme={theme}
      valueRawRoundFn={(v) => v}
      mapTo01={mapTo01Linear}
      mapFrom01={mapFrom01Linear}
      valueRawDisplayFn={(v) => v.toFixed(2)}
      stepFn={() => 0.01}
      stepLargerFn={() => 0.1}
    />
  );
}
