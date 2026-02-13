# Auto-Controls & Knob System

This document covers the automatic parameter control generation system and the knob components that power the node UI in Flowtone. The system inspects Tone.js class defaults at runtime, consults a metadata registry to determine the correct control type, and renders the appropriate knob variant, slider, dropdown, or toggle for each parameter.

---

## Table of Contents

1. [AutoNodeControls](#autonodecontrols)
2. [AutoControl](#autocontrol)
3. [Parameter Metadata System](#parameter-metadata-system)
4. [Control Types](#control-types)
5. [KnobBase](#knobbase)
6. [Knob Variants](#knob-variants)
7. [NormalisableRange](#normalisablerange)
8. [Manual Parameter Updates](#manual-parameter-updates)

---

## AutoNodeControls

**File:** `src/components/auto-controls/AutoNodeControls.tsx`

`AutoNodeControls` is the top-level component that automatically generates a complete set of UI controls for any Tone.js node. It eliminates the need to hand-write parameter UIs for each node type.

### How It Works

The generation pipeline has four stages:

1. **Fetch Tone.js defaults** -- The component dynamically accesses `Tone[nodeType].getDefaults()` to discover every parameter the node exposes.
2. **Filter visible parameters** -- Internal and UI-irrelevant parameters (e.g., `context`, `onstop`, `_dummyGain`, `onended`) are stripped out. Per-node `hideParams` lists allow further suppression.
3. **Order parameters** -- If `NODE_METADATA` defines a `parameterOrder` for the node type, that order is applied. Any remaining parameters are appended at the end.
4. **Render controls** -- Each parameter is looked up in the metadata registry. If metadata exists (providing a `controlType`), an `AutoControl` component is rendered. Parameters with no metadata are skipped entirely.

### Props

```typescript
export interface AutoNodeControlsProps {
  nodeType: ToneComponentKey;  // e.g., "Filter", "Chorus", "OmniOscillator"
  nodeId: string;              // React Flow node ID
  currentData: any;            // Current node config data from the store
  className?: string;
}
```

### Grouped vs. Flat Layout

If `NODE_METADATA[nodeType]` defines `groups`, the controls are rendered in labeled sections. Each group gets a heading and its own grid. If no groups are defined, parameters render in a flat grid.

The `layout` option controls the grid columns:
- `"vertical"` -- single column (`grid-cols-1`)
- `"grid"` or `"horizontal"` -- two columns (`grid-cols-2`)

### Dual-State Updates

The `handleParamChange` callback inside `AutoNodeControls` updates both state systems in one call:

```typescript
const handleParamChange = (paramName: string, value: any) => {
  // Update React Flow visual state
  updateNodeData(nodeId, { [paramName]: value });

  // Update Tone.js audio engine
  audioEngine?.updateNodeParams(nodeId, { [paramName]: value });
};
```

This keeps the visual state (Zustand store) and the audio state (AudioEngine) synchronized.

### Usage in a Node Component

Most node components use `AutoNodeControls` directly. Here is the `ChorusNode` as a representative example:

```tsx
// src/nodes/tone/effect-nodes/ChorusNode.tsx
import { AutoNodeControls } from "~/components/auto-controls";

export function ChorusNode({ data, id }: NodeProps<ChorusNode>) {
  const _chorus = useToneNode(data.type, data.config);
  const portConfig = getPortConfigForNode("Chorus");

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}

      <div className="nodrag">
        <AutoNodeControls
          nodeType="Chorus"
          nodeId={id}
          currentData={data.config}
        />
      </div>

      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
```

The `nodrag` wrapper class is critical -- it prevents React Flow from intercepting drag events on interactive controls.

---

## AutoControl

**File:** `src/components/auto-controls/AutoControl.tsx`

`AutoControl` is the dispatch layer that receives a single parameter's metadata and renders the correct control widget.

### Props

```typescript
export interface AutoControlProps {
  paramName: string;
  metadata: ParameterMetadata;
  value: any;
  onChange: (value: any) => void;
  className?: string;
}
```

### Control Selection Logic

The component uses a `switch` statement on `metadata.controlType` to select the rendered element:

| `controlType`      | Rendered Component | Default Theme |
|---------------------|--------------------|---------------|
| `knob-frequency`   | `KnobFrequency`   | green         |
| `knob-time`        | `KnobTime`        | blue          |
| `knob-normalized`  | `KnobNormalized`  | purple        |
| `knob-q`           | `KnobQ`           | orange        |
| `knob-detune`      | `KnobDetune`      | stone         |
| `knob-ratio`       | `KnobRatio`       | red           |
| `knob-gain`        | `KnobGain`        | green         |
| `slider-db`        | HTML `<input type="range">` | n/a  |
| `dropdown`         | HTML `<select>`    | n/a           |
| `toggle`           | HTML `<input type="checkbox">` | n/a |
| (fallback)         | HTML `<input type="number">` | n/a  |

For knob controls, `AutoControl` coerces the value to a number and passes appropriate defaults (e.g., 440 for frequency, 0.1 for time). For non-knob controls (`slider-db`, `dropdown`, `toggle`), it renders styled HTML form elements with `min`/`max`/`step`/`options` pulled from the metadata.

---

## Parameter Metadata System

**File:** `src/lib/parameters/metadata.ts`

The metadata system is the configuration backbone that tells `AutoNodeControls` how to present each parameter. It consists of two registries and three helper functions.

### ParameterMetadata Interface

```typescript
export interface ParameterMetadata {
  controlType: ControlType;
  min?: number;
  max?: number;
  defaultValue?: number;
  unit?: string;
  scale?: "linear" | "logarithmic";
  skew?: number;           // For NormalisableRange center point
  step?: number;
  options?: string[];      // For dropdown controls
  displayName?: string;    // Human-readable label
  group?: string;          // For visual grouping
}
```

### PARAMETER_DEFAULTS

A `Record<string, ParameterMetadata>` that maps common parameter **names** to their default control configurations. This is the first lookup layer. If a Tone.js node exposes a parameter named `frequency`, it automatically gets the `knob-frequency` control type.

Key entries:

| Parameter Name | Control Type       | Range / Options                    | Unit   |
|----------------|--------------------|------------------------------------|--------|
| `frequency`    | `knob-frequency`   | 20 -- 20,000 (log, skew 1000)     | Hz     |
| `detune`       | `knob-detune`      | -100 -- 100 (linear)              | cents  |
| `attack`       | `knob-time`        | 0.001 -- 5 (log, skew 0.1)       | s      |
| `decay`        | `knob-time`        | 0.001 -- 5 (log, skew 0.1)       | s      |
| `sustain`      | `knob-normalized`  | 0 -- 1 (linear)                   |        |
| `release`      | `knob-time`        | 0.001 -- 5 (log, skew 0.1)       | s      |
| `wet`          | `knob-normalized`  | 0 -- 1 (linear)                   |        |
| `depth`        | `knob-normalized`  | 0 -- 1 (linear)                   |        |
| `feedback`     | `knob-normalized`  | 0 -- 1 (linear)                   |        |
| `volume`       | `slider-db`        | -60 -- 6 (linear)                 | dB     |
| `gain`         | `knob-gain`        | 0 -- 2 (linear)                   |        |
| `Q`            | `knob-q`           | 0.001 -- 100 (log, skew 1)       |        |
| `threshold`    | `slider-db`        | -100 -- 0 (linear)                | dB     |
| `ratio`        | `knob-ratio`       | 1 -- 20 (linear)                  |        |
| `delayTime`    | `knob-time`        | 0 -- 1 (linear)                   | s      |
| `type`         | `dropdown`         | sine, square, triangle, sawtooth  |        |
| `rolloff`      | `dropdown`         | -12, -24, -48, -96                |        |
| `mute`         | `toggle`           |                                    |        |
| `pan`          | `knob-normalized`  | -1 -- 1 (linear)                  |        |

### NODE_METADATA

A `Record<string, {...}>` that provides **per-node overrides and configuration**. Each entry can contain:

```typescript
{
  overrides?: Record<string, Partial<ParameterMetadata>>;  // Override specific params
  parameterOrder?: string[];      // Controls display order
  layout?: "grid" | "vertical" | "horizontal";
  groups?: Record<string, string[]>;  // Named groups of params
  hideParams?: string[];          // Parameters to suppress
}
```

Example -- the `Filter` node renames `frequency` to "Cutoff" and provides a broader set of filter type options:

```typescript
Filter: {
  overrides: {
    frequency: {
      displayName: "Cutoff",
    },
    type: {
      options: ["lowpass", "highpass", "bandpass", "lowshelf",
               "highshelf", "notch", "allpass", "peaking"],
    },
  },
  parameterOrder: ["frequency", "Q", "type", "rolloff"],
  layout: "grid",
},
```

Example -- the `Chorus` node overrides the `frequency` parameter to behave as an LFO rate (0.1--10 Hz) rather than the standard audio frequency range:

```typescript
Chorus: {
  overrides: {
    frequency: {
      displayName: "LFO Rate",
      min: 0.1,
      max: 10,
      scale: "logarithmic",
      skew: 1,
    },
  },
  parameterOrder: ["frequency", "depth", "delayTime", "feedback", "wet"],
  layout: "grid",
},
```

Example -- the `Synth` node uses groups to visually separate envelope controls:

```typescript
Synth: {
  groups: {
    Envelope: ["attack", "decay", "sustain", "release"],
  },
  layout: "vertical",
  parameterOrder: ["frequency", "detune"],
},
```

### Helper Functions

#### `getParameterMetadata(paramName, nodeType)`

Merges `PARAMETER_DEFAULTS[paramName]` with `NODE_METADATA[nodeType].overrides[paramName]`. The node-specific override wins on any conflicting fields. Returns `null` if no metadata can be resolved (the parameter will be skipped in the UI).

```typescript
function getParameterMetadata(
  paramName: string,
  nodeType: ToneComponentKey
): ParameterMetadata | null;
```

#### `getParameterOrder(nodeType, availableParams)`

Returns the ordered list of parameter names for rendering. If `NODE_METADATA[nodeType].parameterOrder` is defined, those parameters come first (in the specified order), followed by any remaining parameters not in the list.

```typescript
function getParameterOrder(
  nodeType: ToneComponentKey,
  availableParams: string[]
): string[];
```

#### `getVisibleParameters(params, nodeType)`

Filters out parameters that should not appear in the UI. This includes:
- Parameters listed in `NODE_METADATA[nodeType].hideParams`
- Globally hidden parameters: `context`, `onstop`, `_dummyGain`, `onended`

```typescript
function getVisibleParameters(
  params: string[],
  nodeType: ToneComponentKey
): string[];
```

---

## Control Types

The `ControlType` union defines all available control types:

```typescript
export type ControlType =
  | "knob-frequency"     // Logarithmic frequency knob (20 Hz -- 20 kHz)
  | "knob-detune"        // Linear cents knob (-100 -- +100)
  | "knob-time"          // Logarithmic time knob (ms to seconds)
  | "knob-gain"          // Linear gain knob (0 -- 2)
  | "knob-ratio"         // Linear ratio knob (1:1 -- 20:1)
  | "knob-normalized"    // Linear normalized knob (0 -- 1)
  | "knob-q"             // Logarithmic Q/resonance knob (0.001 -- 100)
  | "slider-db"          // Horizontal range slider for decibel values
  | "dropdown"           // Select menu for enumerated options
  | "toggle";            // Checkbox for boolean parameters
```

### Choosing a Control Type

- **Frequency parameters** (Hz) -- Use `knob-frequency`. Logarithmic scaling puts the audible sweet spot in the center of the knob range.
- **Time parameters** (attack, decay, release, delay) -- Use `knob-time`. Logarithmic scaling gives fine control over short times and coarse control over long ones.
- **0--1 range parameters** (wet, depth, feedback, sustain) -- Use `knob-normalized`. Linear scaling, displayed as percentage.
- **Q / resonance** -- Use `knob-q`. Logarithmic scaling across a wide range (0.001 to 100).
- **Detune** -- Use `knob-detune`. Linear scaling in cents, centered at 0.
- **Compressor ratio** -- Use `knob-ratio`. Linear scaling, displayed as `N:1`.
- **Gain** -- Use `knob-gain`. Linear 0--2, displayed as a decimal.
- **Volume (dB)** -- Use `slider-db`. A horizontal range input, typically -60 to +6 dB.
- **Enumerated values** (waveform type, filter type, rolloff) -- Use `dropdown`.
- **Boolean flags** (mute) -- Use `toggle`.

---

## KnobBase

**File:** `src/components/knob/knob-base.tsx`

`KnobBase` is the foundation component for all knob variants. It wraps the `react-knob-headless` library and provides a consistent visual structure: a label above the knob, the rotary thumb, and a formatted value readout below.

### Props

```typescript
type KnobBaseProps = {
  label: string;
  valueDefault: number;
  valueMin: number;
  valueMax: number;
  valueRawRoundFn: (value: number) => number;
  valueRawDisplayFn: (value: number) => string;
  orientation?: "vertical" | "horizontal";
  mapTo01?: (value: number, min: number, max: number) => number;
  mapFrom01?: (normalised: number, min: number, max: number) => number;
  theme: "stone" | "pink" | "green" | "sky" | "blue" | "purple" | "red" | "orange";
  stepFn: (valueRaw: number) => number;
  stepLargerFn: (valueRaw: number) => number;
  onChange?: (value: number) => void;
};
```

### Key Concepts

**Value Mapping (`mapTo01` / `mapFrom01`):** These functions convert between the parameter's actual range and a 0--1 normalized value. By default they use linear mapping from `@dsp-ts/math`. For logarithmic parameters (frequency, time, Q), knob variants substitute `NormalisableRange`-based mapping functions.

**Display Function (`valueRawDisplayFn`):** Converts the raw value into a human-readable string. For example, `KnobFrequency` formats values below 1 kHz as `"440 Hz"` and above as `"2.50 kHz"`.

**Step Functions (`stepFn` / `stepLargerFn`):** Control the increment size for keyboard navigation and fine adjustment. Many knob variants use value-dependent steps -- for instance, `KnobFrequency` uses a step of 1 below 100 Hz, 10 below 1000 Hz, and 100 above 1000 Hz.

**Drag Sensitivity:** Set to `0.006`, providing a balance between precision and responsiveness.

**Thumb Rendering:** The `KnobBaseThumb` component renders a colored circle with a position indicator line. The rotation angle ranges from -145 to +145 degrees, mapped linearly from the 0--1 normalized value.

### Internal State

`KnobBase` maintains its own `valueRaw` state via `useState`. When the value changes (via drag or keyboard), it calls both `setValueRaw` and the `onChange` callback:

```typescript
const handleValueChange = (newValue: number) => {
  setValueRaw(newValue);
  onChange?.(newValue);
};
```

---

## Knob Variants

**Files:** `src/components/knob/knob-frequency.tsx`, `src/components/knob/knob-variants.tsx`

Each variant is a pre-configured wrapper around `KnobBase` with appropriate range, scaling, display formatting, and step functions. All variants accept `label`, `value`, `onChange`, and `theme` props.

### KnobFrequency

**File:** `src/components/knob/knob-frequency.tsx`

Use for any frequency parameter measured in Hz.

| Property      | Value                                   |
|---------------|-----------------------------------------|
| Range         | 20 -- 20,000                            |
| Default       | 440                                     |
| Scaling       | Logarithmic via `NormalisableRange(20, 20000, 1000)` |
| Display       | `"82.5 Hz"`, `"440 Hz"`, `"2.50 kHz"`, `"12.5 kHz"` |
| Steps         | 1 below 100 Hz, 10 below 1 kHz, 100 above |
| Default Theme | green                                   |

The `NormalisableRange` center point of 1000 means that the midpoint of the knob's rotation corresponds to 1000 Hz, giving proportionally more knob travel to the musically dense lower frequencies.

```tsx
<KnobFrequency label="Cutoff" value={880} onChange={handleChange} theme="green" />
```

### KnobTime

Use for envelope times (attack, decay, release) and delay parameters.

| Property      | Value                                    |
|---------------|------------------------------------------|
| Range         | 0.001 -- 5 (configurable via `min`/`max` props) |
| Default       | 0.1                                      |
| Scaling       | Logarithmic via `NormalisableRange(min, max, 0.1)` |
| Display       | `"5.0 ms"` for values < 0.01s, `"0.100 s"` otherwise |
| Steps         | 0.001 below 10 ms, 0.01 below 100 ms, 0.05 below 1 s, 0.1 above |
| Default Theme | blue                                     |

```tsx
<KnobTime label="Attack" value={0.01} onChange={handleChange} theme="blue" />
```

### KnobNormalized

Use for any 0--1 parameter: wet/dry mix, depth, feedback, sustain.

| Property      | Value              |
|---------------|--------------------|
| Range         | 0 -- 1             |
| Default       | 0.5                |
| Scaling       | Linear             |
| Display       | Percentage (`"75%"`) |
| Steps         | 0.01 (fine), 0.1 (coarse) |
| Default Theme | blue               |

```tsx
<KnobNormalized label="Wet/Dry" value={0.5} onChange={handleChange} theme="purple" />
```

### KnobQ

Use for filter Q (resonance) parameters.

| Property      | Value                                    |
|---------------|------------------------------------------|
| Range         | 0.001 -- 100                             |
| Default       | 1                                        |
| Scaling       | Logarithmic via `NormalisableRange(0.001, 100, 1)` |
| Display       | Two decimal places (`"1.00"`, `"12.50"`) |
| Steps         | 0.01 below 1, 0.1 below 10, 1 above     |
| Default Theme | orange                                   |

```tsx
<KnobQ label="Resonance" value={1} onChange={handleChange} theme="orange" />
```

### KnobDetune

Use for pitch detune parameters measured in cents.

| Property      | Value                |
|---------------|----------------------|
| Range         | -100 -- +100         |
| Default       | 0                    |
| Scaling       | Linear               |
| Display       | Cents with symbol (`"-12.0 c"`) |
| Steps         | 1 (fine), 10 (coarse) |
| Default Theme | stone                |

```tsx
<KnobDetune label="Detune" value={0} onChange={handleChange} theme="stone" />
```

### KnobRatio

Use for compressor ratio parameters.

| Property      | Value               |
|---------------|---------------------|
| Range         | 1 -- 20             |
| Default       | 4                   |
| Scaling       | Linear              |
| Display       | Ratio format (`"4.0:1"`) |
| Steps         | 0.1 below 5, 0.5 above (fine); 1 always (coarse) |
| Default Theme | red                 |

```tsx
<KnobRatio label="Ratio" value={4} onChange={handleChange} theme="red" />
```

### KnobGain

Use for linear gain multiplier parameters.

| Property      | Value              |
|---------------|--------------------|
| Range         | 0 -- 2             |
| Default       | 1                  |
| Scaling       | Linear             |
| Display       | Two decimal places (`"1.00"`) |
| Steps         | 0.01 (fine), 0.1 (coarse) |
| Default Theme | green              |

```tsx
<KnobGain label="Gain" value={1.0} onChange={handleChange} theme="green" />
```

---

## NormalisableRange

**File:** `src/lib/NormalisableRange.ts`

`NormalisableRange` is a partial port of the JUCE Framework's `NormalisableRange` class. It provides logarithmic (skewed) mapping between an actual parameter range and a normalized 0--1 range, which is essential for parameters where perceptual response is nonlinear.

### Constructor

```typescript
constructor(min: number, max: number, center: number)
```

- `min` -- Lower bound of the parameter range
- `max` -- Upper bound of the parameter range
- `center` -- The value in the real range that maps to 0.5 in normalized space

The constructor computes a **skew factor** based on the center point:

```typescript
this._skew = Math.log(0.5) / Math.log((center - min) / (max - min));
```

This formula ensures that the center value maps exactly to the midpoint (0.5) of the normalized range. When the center is at the geometric midpoint of the range, the skew equals 1 and the mapping becomes linear.

### Methods

#### `mapTo01(x: number): number`

Converts a value in the real range to normalized 0--1 space:

```typescript
public mapTo01(x: number): number {
  const proportion = clamp01((x - this._min) / (this._max - this._min));
  if (this._skew === 1) return proportion;
  return proportion ** this._skew;
}
```

First, the value is linearly normalized to 0--1. Then, if skew is not 1, the proportion is raised to the power of the skew factor. This compresses or expands different regions of the range.

#### `mapFrom01(proportion: number): number`

Converts a normalized 0--1 value back to the real range:

```typescript
public mapFrom01(proportion: number): number {
  proportion = clamp01(proportion);
  if (this._skew !== 1 && proportion > 0) {
    proportion = Math.exp(Math.log(proportion) / this._skew);
  }
  return this._min + (this._max - this._min) * proportion;
}
```

The inverse of `mapTo01` -- it undoes the skew exponent and then scales back to the real range.

### Usage Examples

**Frequency range (20 Hz to 20 kHz, center at 1 kHz):**

```typescript
const freqRange = new NormalisableRange(20, 20000, 1000);
freqRange.mapTo01(1000);   // 0.5   -- center maps to midpoint
freqRange.mapTo01(20);     // 0.0   -- min maps to 0
freqRange.mapTo01(20000);  // 1.0   -- max maps to 1
freqRange.mapFrom01(0.5);  // 1000  -- midpoint maps to center
```

**Envelope time range (1 ms to 5 s, center at 100 ms):**

```typescript
const timeRange = new NormalisableRange(0.001, 5, 0.1);
timeRange.mapTo01(0.1);    // 0.5   -- 100 ms at midpoint
timeRange.mapFrom01(0.25); // ~0.01 -- quarter-turn is about 10 ms
```

**Q range (0.001 to 100, center at 1):**

```typescript
const qRange = new NormalisableRange(0.001, 100, 1);
qRange.mapTo01(1);         // 0.5   -- Q of 1 at midpoint
```

### Why Skew Matters

Without skew, a linear 20--20,000 Hz knob would dedicate 99% of its travel to frequencies above 200 Hz, making low-frequency adjustments nearly impossible. With a center of 1000, the lower half of the knob covers 20--1000 Hz (the most musically important range), and the upper half covers 1000--20,000 Hz. The same principle applies to envelope times, where millisecond-level precision matters more than the difference between 4 and 5 seconds.

---

## Manual Parameter Updates

When `AutoNodeControls` does not fit your needs -- for example, if you need a custom visualization, a non-standard control, or special value processing -- you can build controls manually. The critical rule is that **you must update both the visual state and the audio state**.

### Pattern

```tsx
import { useReactFlow } from "@xyflow/react";
import { useRFStore } from "~/store/store";

function MyCustomNode({ id, data }: NodeProps<MyNodeType>) {
  const { updateNodeData } = useReactFlow();
  const audioEngine = useRFStore((state) => state.audioEngine);

  const handleFrequencyChange = (value: number) => {
    // 1. Update React Flow / Zustand visual state
    updateNodeData(id, { frequency: value });

    // 2. Update Tone.js audio engine
    audioEngine?.updateNodeParams(id, { frequency: value });
  };

  return (
    <div className="react-flow__node-default">
      <div className="nodrag">
        <KnobFrequency
          label="Frequency"
          value={data.config.frequency ?? 440}
          onChange={handleFrequencyChange}
          theme="green"
        />
      </div>
    </div>
  );
}
```

### AudioEngine.updateNodeParams

The `AudioEngine.updateNodeParams` method handles the difference between Tone.js `Param` objects and regular properties:

```typescript
updateNodeParams(id: string, params: Record<string, unknown>): void {
  const node = this.nodes.get(id);
  if (!node) return;

  Object.entries(params).forEach(([key, value]) => {
    const param = node[key];

    if (param instanceof Tone.Param) {
      // Tone.Param objects (frequency, detune, etc.) require .value setter
      param.value = value as number;
    } else {
      // Regular properties (type, count, etc.) use direct assignment
      node[key] = value;
    }
  });
}
```

This distinction matters because Tone.js audio-rate parameters (like `frequency` and `detune`) are `Tone.Param` instances that schedule changes on the audio thread. Setting them via `.value` ensures proper audio timing. Regular properties like `type` (waveform shape) are simple JavaScript properties that can be assigned directly.

### When to Use Manual Controls

- You need a control type that is not in the `ControlType` union (e.g., an XY pad, a waveform drawer).
- You need to transform or validate the value before passing it to the audio engine.
- You want to batch multiple parameter changes together.
- The parameter involves complex nested state (e.g., setting oscillator `type` on a Synth's inner oscillator).
- You need custom display formatting or interaction behavior beyond what the knob variants provide.

For all other cases, prefer `AutoNodeControls` -- it keeps the codebase consistent and automatically benefits from metadata improvements.
