# Creating New Nodes

This guide walks through the process of adding a new Tone.js audio node to Flowtone. By the end, you will have a fully functional node with auto-generated UI controls, color-coded connection handles, and proper audio lifecycle management.

---

## Table of Contents

- [Overview](#overview)
- [Step-by-Step Guide](#step-by-step-guide)
- [The Node Template](#the-node-template)
- [The useToneNode Hook](#the-usetonenodehook)
- [Node Registration](#node-registration)
- [Port Configuration](#port-configuration)
- [Parameter Metadata (Optional)](#parameter-metadata-optional)
- [Reference Implementation: OmniOscillatorNode](#reference-implementation-omnioscillatornode)
- [Continuous Sources](#continuous-sources)
- [Interactive Elements and the nodrag Class](#interactive-elements-and-the-nodrag-class)

---

## Overview

Every Tone.js node in Flowtone follows the same five-step process:

1. **Copy the template** to the appropriate subdirectory.
2. **Replace placeholders** with actual Tone.js class names.
3. **Register the component** in the `nodeTypes` object in `src/nodes/index.ts`.
4. **Add a port configuration** in `src/ports/registry.ts`.
5. **(Optional)** Add parameter metadata overrides in `src/lib/parameters/metadata.ts`.

The sections below explain each step in detail.

---

## Step-by-Step Guide

This section provides a condensed walkthrough. Each step is expanded in its own section further down.

### Step 1: Copy the template

Copy `src/nodes/tone/NODE_TEMPLATE.txt` into the correct subdirectory:

| Node category | Directory |
|---|---|
| Oscillators, LFO, Players | `src/nodes/tone/source-nodes/` |
| Synths | `src/nodes/tone/instrument-nodes/` |
| Reverb, Delay, Chorus, etc. | `src/nodes/tone/effect-nodes/` |
| Envelopes, Filters, Channel strips, Analyzers | `src/nodes/tone/component-nodes/` |

Rename the file to match the pattern `<ToneClassName>Node.tsx`. For example, if you are wrapping `Tone.Phaser`, name the file `PhaserNode.tsx`.

### Step 2: Replace placeholders

There are three placeholders in the template:

| Placeholder | Replace with | Example |
|---|---|---|
| `NODE_NAME` | The Tone.js class name (used for the React component function name) | `Phaser` |
| `NODE_TYPE` | The TypeScript type from `types.ts` (suffixed with `Node`) | `PhaserNode` |
| `TONE_TYPE` | A string literal matching the Tone.js class name | `"Phaser"` |

### Step 3: Register in `src/nodes/index.ts`

Add an import and an entry to the `nodeTypes` object.

### Step 4: Add port config in `src/ports/registry.ts`

Define input/output ports using the helper functions.

### Step 5 (Optional): Add parameter metadata in `src/lib/parameters/metadata.ts`

Override control types, display names, parameter ordering, or hidden parameters for the new node.

---

## The Node Template

The template lives at `src/nodes/tone/NODE_TEMPLATE.txt`. Here is the full contents:

```tsx
import { type NodeProps } from "@xyflow/react";
import { type NODE_TYPE } from "../../types";
import { useToneNode } from "~/hooks/useToneNode";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";
import { AutoNodeControls } from "~/components/auto-controls";

export function NODE_NAMENode({ data, id }: NodeProps<NODE_TYPE>) {
  const node = useToneNode(data.type, data.config);
  const portConfig = getPortConfigForNode(TONE_TYPE);

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}

      <div className="nodrag">
        <AutoNodeControls
          nodeType={TONE_TYPE}
          nodeId={id}
          currentData={data.config}
        />
      </div>

      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
```

### Placeholder breakdown

**`NODE_TYPE`** -- Used in the import statement and as the generic parameter to `NodeProps`. This is the discriminated union type that represents this node's data shape in the type system. It is imported from `../../types` (which resolves to `src/nodes/types.ts`). Example: `PhaserNode`.

**`NODE_NAME`** -- Used as the prefix for the exported React component function. The template appends `Node` to it, so if `NODE_NAME` is `Phaser`, the function becomes `PhaserNode`. This is the name you will reference in `src/nodes/index.ts`.

**`TONE_TYPE`** -- A string literal passed to `getPortConfigForNode()` and `AutoNodeControls`. It must exactly match a key in Tone.js (e.g., `"Phaser"`, `"Reverb"`, `"OmniOscillator"`). This string is used to look up port configurations in the registry and to fetch Tone.js defaults for auto-generated UI controls.

### What the template does

1. **`useToneNode(data.type, data.config)`** -- Creates the Tone.js instance (e.g., `new Tone.Phaser(config)`) and disposes of it on unmount.
2. **`getPortConfigForNode(TONE_TYPE)`** -- Retrieves the port configuration (inputs and outputs) from the registry.
3. **`AutoNodeControls`** -- Reads `ToneClass.getDefaults()` and renders knobs, sliders, and dropdowns automatically based on parameter metadata.
4. **`DynamicHandles`** -- Renders color-coded React Flow handles based on the port config.

---

## The useToneNode Hook

Located at `src/hooks/useToneNode.ts`, this hook manages the full lifecycle of a Tone.js audio node.

### Source

```typescript
export const useToneNode = <T extends ToneNodeKey>(
  nodeType: T,
  config: Partial<ExtractToneComponentDefaults<(typeof Tone)[T]>>
) => {
  const nodeRef = useRef<InstanceType<(typeof Tone)[T]>>();

  useEffect(() => {
    if (!(nodeType in Tone)) {
      console.error(`Tone.js node type not found: ${nodeType}`);
      return;
    }

    const ToneClass = Tone[nodeType] as unknown as ToneNodeConstructor<T>;

    try {
      nodeRef.current = new ToneClass(config);
    } catch (error) {
      console.error(`Error creating ${nodeType}:`, error);
      return;
    }

    return () => {
      if (nodeRef.current) {
        nodeRef.current.dispose();
        nodeRef.current = undefined;
      }
    };
  }, [nodeType, config]);

  return nodeRef.current as InstanceType<(typeof Tone)[T]> | undefined;
};
```

### What it does

1. **Validates** that `nodeType` exists in the `Tone` namespace.
2. **Instantiates** the Tone.js class with the provided config object: `new Tone.Phaser(config)`.
3. **Stores** the instance in a `useRef` so it persists across renders.
4. **Disposes** the instance in the `useEffect` cleanup function when the component unmounts or when `nodeType`/`config` changes.
5. **Returns** the instance (or `undefined` if creation failed), fully typed as `InstanceType<typeof Tone[T]>`.

### Usage

In most node components, you call it on a single line:

```tsx
const node = useToneNode(data.type, data.config);
```

The returned value is the live Tone.js instance. You can call methods on it directly (e.g., `node?.start()` for oscillators). The instance will be `undefined` during the first render before the effect runs, so always use optional chaining.

### Type safety

The hook is generic over `ToneNodeKey`, which means TypeScript knows the exact return type. If `data.type` is `"Reverb"`, the return type is `Tone.Reverb | undefined`. This gives you full autocomplete on the returned instance.

---

## Node Registration

After creating your node component, register it in `src/nodes/index.ts`. This file maps string type keys to React components for the React Flow renderer.

### Adding an import

Add your import in the appropriate section (source, instrument, effect, or component):

```typescript
// Effect Nodes
import { PhaserNode } from "./tone/effect-nodes/PhaserNode";
```

### Adding to nodeTypes

Add an entry to the `nodeTypes` object. The key is the string that will be used as the `type` field on node data objects. The value is the React component:

```typescript
export const nodeTypes = {
  // ... existing entries ...

  // Effect Nodes
  Phaser: PhaserNode,

  // ... remaining entries ...
} satisfies NodeTypes;
```

The key (e.g., `"Phaser"`) must match:

- The `type` field in your node's data when it is created.
- The string you pass to `getPortConfigForNode()` and `AutoNodeControls`.

### Placement convention

Entries are organized by category with comments. Place your entry in the correct section:

```typescript
export const nodeTypes = {
  // Utility Nodes
  Midi: MidiInputNode,
  MidiPiano: MidiPianoNode,
  StoreNode: AddComponentNode,

  // Source Nodes
  OmniOscillator: OmniOscillatorNode,
  // ...

  // Instrument Nodes
  Synth: SynthNode,
  // ...

  // Effect Nodes
  Reverb: ReverbNode,
  Phaser: PhaserNode,       // <-- new entry
  // ...

  // Component Nodes
  AmplitudeEnvelope: AmplitudeEnvelopeNode,
  // ...
} satisfies NodeTypes;
```

---

## Port Configuration

Port configurations define the inputs and outputs that appear on each node as connectable handles. They are registered in `src/ports/registry.ts`.

### Signal types

There are four signal types, each rendered with a different color:

| Signal type | Color | Use case |
|---|---|---|
| `"audio"` | Green | Main audio signal path |
| `"control"` | Blue | Control voltage (LFO, envelopes) |
| `"midi"` | Purple | MIDI data |
| `"trigger"` | Orange | Gate/trigger signals |

### Helper functions

The port system provides factory functions in `src/ports/types.ts` for common configurations:

**`createSinglePortConfig(signalType)`** -- One input on top, one output on bottom. Used by most effect nodes.

```typescript
Reverb: createSinglePortConfig("audio"),
Chorus: createSinglePortConfig("audio"),
Distortion: createSinglePortConfig("audio"),
```

**`createSourcePortConfig(signalType)`** -- No inputs, one output on bottom. Used by oscillators and other signal generators.

```typescript
OmniOscillator: createSourcePortConfig("audio"),
Oscillator: createSourcePortConfig("audio"),
```

**`createMergePortConfig(channels)`** -- Multiple mono inputs on top, one stereo output on bottom. Used by the Merge node.

```typescript
Merge: createMergePortConfig(2),
```

**`createSplitPortConfig(channels)`** -- One stereo input on top, multiple mono outputs on bottom. Used by the Split node.

```typescript
Split: createSplitPortConfig(2),
```

**`createDestinationPortConfig(signalType)`** -- One input, no outputs. Used by analyzer nodes (though those are currently defined manually).

### Custom port configurations

For nodes that need control voltage inputs, multiple signal types, or specific labels, define the configuration manually:

```typescript
Filter: {
  inputs: [
    {
      id: "input",
      type: "input",
      label: "Audio In",
      signalType: "audio",
      position: Position.Top,
      channelIndex: 0,
      channelCount: 2,
    },
    {
      id: "frequency",
      type: "input",
      label: "Cutoff CV",
      signalType: "control",
      position: Position.Left,
      toneProperty: "frequency",
    },
    {
      id: "Q",
      type: "input",
      label: "Q CV",
      signalType: "control",
      position: Position.Right,
      toneProperty: "Q",
    },
  ],
  outputs: [
    {
      id: "output",
      type: "output",
      label: "Audio Out",
      signalType: "audio",
      position: Position.Bottom,
      channelIndex: 0,
      channelCount: 2,
    },
  ],
},
```

### Port fields

Each port object has the following fields:

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier for the port within the node |
| `type` | `"input" \| "output"` | Direction of the port |
| `label` | `string` (optional) | Display label next to the handle |
| `signalType` | `SignalType` | Determines handle color and connection validation |
| `position` | `Position` | Which edge of the node: `Top`, `Bottom`, `Left`, `Right` |
| `channelIndex` | `number` (optional) | Audio channel index for multi-channel routing |
| `channelCount` | `number` (optional) | Number of audio channels (1 = mono, 2 = stereo) |
| `toneProperty` | `string` (optional) | Maps to a specific Tone.js property for control voltage |
| `positionOffset` | `{ x: number, y: number }` (optional) | Fine-tune handle position for multi-port layouts |

### Fallback behavior

If you forget to add a port configuration, `getPortConfigForNode()` will log a warning and fall back to `createSinglePortConfig("audio")`. This is helpful during development but should not be relied on -- always add an explicit configuration.

---

## Parameter Metadata (Optional)

The parameter metadata system in `src/lib/parameters/metadata.ts` controls how `AutoNodeControls` renders the UI for each node. In many cases, the defaults work without any overrides. You only need to add metadata when you want to customize the controls.

### How auto-controls work

1. `AutoNodeControls` calls `ToneClass.getDefaults()` to discover available parameters.
2. For each parameter, it looks up `PARAMETER_DEFAULTS` by parameter name (e.g., `"frequency"`, `"attack"`).
3. It checks `NODE_METADATA[nodeType]` for node-specific overrides.
4. It renders the appropriate knob or control based on the merged metadata.

### PARAMETER_DEFAULTS

This is a global map from parameter name to control metadata. Common parameters are already covered:

```typescript
export const PARAMETER_DEFAULTS: Record<string, ParameterMetadata> = {
  frequency: {
    controlType: "knob-frequency",
    min: 20,
    max: 20000,
    scale: "logarithmic",
    skew: 1000,
    unit: "Hz",
    displayName: "Frequency",
  },
  attack: {
    controlType: "knob-time",
    min: 0.001,
    max: 5,
    scale: "logarithmic",
    skew: 0.1,
    unit: "s",
    displayName: "Attack",
    group: "Envelope",
  },
  wet: {
    controlType: "knob-normalized",
    min: 0,
    max: 1,
    scale: "linear",
    displayName: "Wet/Dry",
  },
  type: {
    controlType: "dropdown",
    options: ["sine", "square", "triangle", "sawtooth"],
    displayName: "Waveform",
  },
  // ... many more
};
```

If your node only uses parameters that are already in `PARAMETER_DEFAULTS` (like `frequency`, `wet`, `feedback`, `type`), you may not need any overrides at all.

### Available control types

| Control type | Widget | Typical use |
|---|---|---|
| `"knob-frequency"` | Logarithmic knob, 20Hz--20kHz | Frequency parameters |
| `"knob-time"` | Logarithmic knob, ms to seconds | Envelope times, delay times |
| `"knob-normalized"` | Linear knob, 0--1 | Wet/dry, depth, sustain |
| `"knob-q"` | Logarithmic knob | Filter resonance |
| `"knob-detune"` | Linear knob, -100 to +100 cents | Detuning |
| `"knob-ratio"` | Linear knob | Compressor ratio |
| `"knob-gain"` | Linear knob, 0--2 | Gain stages |
| `"slider-db"` | Slider in decibels | Volume, threshold |
| `"dropdown"` | Select menu | Waveform type, filter type |
| `"toggle"` | Checkbox/switch | Mute, boolean flags |

### NODE_METADATA overrides

To customize a specific node, add an entry to the `NODE_METADATA` object:

```typescript
export const NODE_METADATA: Record<string, {
  overrides?: Record<string, Partial<ParameterMetadata>>;
  parameterOrder?: string[];
  layout?: "grid" | "vertical" | "horizontal";
  groups?: Record<string, string[]>;
  hideParams?: string[];
}> = {
  // Example: customizing the Chorus node
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
};
```

The available options are:

**`overrides`** -- A map from parameter name to partial metadata. Merged on top of `PARAMETER_DEFAULTS`. Use this to change display names, ranges, or control types for specific parameters on a specific node.

**`parameterOrder`** -- An array of parameter names that controls the order knobs appear. Parameters not listed are appended at the end.

**`layout`** -- Layout mode for the control grid: `"grid"`, `"vertical"`, or `"horizontal"`.

**`groups`** -- Groups parameters under labeled sections. Keys are group names, values are arrays of parameter names.

**`hideParams`** -- Parameter names to exclude from the UI entirely. Use this to hide internal Tone.js properties that should not be user-facing (e.g., `"context"`, `"partials"`).

### Example: hiding internal parameters

The OmniOscillator hides several parameters that are not useful for direct user control:

```typescript
OmniOscillator: {
  parameterOrder: ["frequency", "detune", "type", "volume"],
  layout: "grid",
  hideParams: ["context", "phase", "partialCount", "partials"],
},
```

In addition to node-specific `hideParams`, the system always hides a set of common internal parameters: `"context"`, `"onstop"`, `"_dummyGain"`, and `"onended"`.

---

## Reference Implementation: OmniOscillatorNode

The `OmniOscillatorNode` (`src/nodes/tone/source-nodes/OmniOscillatorNode.tsx`) is a good reference because it demonstrates all the key patterns including continuous source startup.

### Full source

```tsx
import { type NodeProps } from "@xyflow/react";
import { type OmniOscillatorNode } from "../../types";
import { useToneNode } from "~/hooks/useToneNode";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";
import { AutoNodeControls } from "~/components/auto-controls";
import { useEffect } from "react";

export function OmniOscillatorNode({ data, id }: NodeProps<OmniOscillatorNode>) {
  const oscillator = useToneNode(data.type, data.config);
  const portConfig = getPortConfigForNode("OmniOscillator");

  useEffect(() => {
    oscillator?.start();
  }, [oscillator]);

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}
      <div className="nodrag">
        <AutoNodeControls nodeType="OmniOscillator" nodeId={id} currentData={data.config} />
      </div>
      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
```

### Line-by-line walkthrough

**Imports** -- The node imports its own type (`OmniOscillatorNode`) from the types file, plus the four core building blocks: `useToneNode`, `DynamicHandles`, `getPortConfigForNode`, and `AutoNodeControls`. It also imports `useEffect` from React because oscillators require manual startup.

**`useToneNode(data.type, data.config)`** -- Creates a `Tone.OmniOscillator` instance with the config from node data. The returned `oscillator` variable is the live Tone.js instance. The hook handles disposal when the component unmounts.

**`getPortConfigForNode("OmniOscillator")`** -- Looks up the port config from the registry. For `OmniOscillator`, this is `createSourcePortConfig("audio")`, which means no inputs and a single audio output on the bottom.

**`useEffect(() => { oscillator?.start(); }, [oscillator])`** -- Starts the oscillator once the Tone.js instance is created. This is required for all continuous source nodes (see [Continuous Sources](#continuous-sources) below). The optional chaining handles the case where `oscillator` is still `undefined` during the first render.

**`<div className="react-flow__node-default">`** -- Wrapper div that applies React Flow's default node styling.

**`data.label && <div ...>{data.label}</div>`** -- Conditionally renders the node title.

**`<div className="nodrag">`** -- Wraps the controls section. This prevents React Flow from treating mouse events on knobs as node drag events. See [Interactive Elements](#interactive-elements-and-the-nodrag-class).

**`<AutoNodeControls nodeType="OmniOscillator" nodeId={id} currentData={data.config} />`** -- Renders knobs and controls automatically. It reads `Tone.OmniOscillator.getDefaults()`, applies any metadata from `NODE_METADATA["OmniOscillator"]`, and renders the appropriate controls.

**`<DynamicHandles nodeId={id} ports={portConfig} />`** -- Renders the connection handles. For this source node, it renders a single green (audio) output handle at the bottom.

### Comparison: an effect node (ReverbNode)

Effect nodes are simpler because they do not need `.start()`:

```tsx
export function ReverbNode({ data, id }: NodeProps<ReverbNode>) {
  const _reverb = useToneNode(data.type, data.config);
  const portConfig = getPortConfigForNode("Reverb");

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}

      <div className="nodrag">
        <AutoNodeControls
          nodeType="Reverb"
          nodeId={id}
          currentData={data.config}
        />
      </div>

      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
```

Notice that the `useToneNode` return value is stored in `_reverb` (prefixed with underscore) because it is not referenced directly -- the AudioEngine manages connections externally. There is no `useEffect` for `.start()` because reverb is a pass-through effect, not a continuous source.

---

## Continuous Sources

Oscillators and LFO nodes produce audio continuously and must be explicitly started after creation. This is a Tone.js requirement, not a Flowtone-specific pattern.

### The pattern

Add a `useEffect` that calls `.start()` on the Tone.js instance:

```tsx
import { useEffect } from "react";

export function OscillatorNode({ data, id }: NodeProps<OscillatorNode>) {
  const oscillator = useToneNode(data.type, data.config);
  const portConfig = getPortConfigForNode("Oscillator");

  useEffect(() => {
    oscillator?.start();
  }, [oscillator]);

  // ... return JSX
}
```

### When to use this

You need the `.start()` call for:

- All oscillator variants (`Oscillator`, `OmniOscillator`, `AMOscillator`, `FMOscillator`, `FatOscillator`, `PWMOscillator`, `PulseOscillator`)
- `LFO`
- `Player` and `GrainPlayer` (though players are typically started by triggers rather than immediately)

You do **not** need `.start()` for:

- Effect nodes (Reverb, Delay, Chorus, etc.) -- they process audio that passes through them.
- Component nodes (Envelope, Filter, Channel, etc.) -- they respond to triggers or pass-through audio.
- Instrument nodes (Synth, MonoSynth, etc.) -- they are triggered by MIDI note events, not started continuously.

### Why optional chaining

The `oscillator?.start()` pattern uses optional chaining because `useToneNode` returns `undefined` on the initial render (before the `useEffect` inside the hook has run). The `useEffect` in your component will fire after the hook's effect, at which point `oscillator` will have a value.

---

## Interactive Elements and the nodrag Class

React Flow intercepts mouse events on nodes for drag-and-drop behavior. This means that without intervention, users cannot interact with knobs, sliders, or dropdowns inside a node -- the mouse events would be captured by the drag handler instead.

### The solution

Wrap any interactive content in a `div` with the `nodrag` class:

```tsx
<div className="nodrag">
  <AutoNodeControls
    nodeType="Reverb"
    nodeId={id}
    currentData={data.config}
  />
</div>
```

React Flow recognizes the `nodrag` class and excludes those elements from drag event handling. Mouse events inside the `nodrag` div are passed through to the child components normally.

### When to use it

Always wrap `AutoNodeControls` in a `nodrag` div. If you are adding any custom interactive elements (custom knobs, buttons, inputs, sliders), they must also be inside a `nodrag` wrapper.

The `DynamicHandles` component does **not** need to be wrapped in `nodrag` -- handles have their own event handling built into React Flow.

### Structure pattern

Every node component follows this structure:

```tsx
return (
  <div className="react-flow__node-default">
    {/* Title */}
    {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}

    {/* Interactive controls -- wrapped in nodrag */}
    <div className="nodrag">
      <AutoNodeControls ... />
    </div>

    {/* Connection handles -- no nodrag needed */}
    <DynamicHandles nodeId={id} ports={portConfig} />
  </div>
);
```

### Other React Flow class utilities

In addition to `nodrag`, React Flow provides:

- **`nopan`** -- Prevents panning the canvas when interacting with this element.
- **`nowheel`** -- Prevents zoom on scroll wheel events within this element.

These are less commonly needed but can be useful for elements like scroll containers inside nodes.
