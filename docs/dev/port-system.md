# Port System & Connection Validation

This document covers Flowtone's port system: how nodes declare their inputs and outputs, how React Flow handles are generated from port metadata, and how connections between nodes are validated.

**Key source files:**

- `src/nodes/types3.ts` -- Core type definitions (`Port`, `PortConfig`, `SignalType`)
- `src/ports/types.ts` -- Port factory functions, handle ID utilities, styling
- `src/ports/registry.ts` -- `TONE_PORT_REGISTRY` mapping node types to port configs
- `src/validation/connectionValidation.ts` -- Connection validation logic
- `src/components/handles/DynamicHandles.tsx` -- Handle component generation

---

## 1. Signal Types

Every port carries one of four signal types. These determine connection compatibility and visual appearance.

| Signal Type | Color   | Hex       | Handle Size | Description |
|-------------|---------|-----------|-------------|-------------|
| `audio`     | Green   | `#4CAF50` | 14x14       | Audio-rate signals. The primary signal path between oscillators, effects, filters, and output. |
| `control`   | Blue    | `#2196F3` | 10x10       | Control-rate signals. Used for modulation: LFO output, envelope output, CV inputs on frequency/pan/volume. |
| `midi`      | Purple  | `#9C27B0` | 12x12       | MIDI note and controller data from Web MIDI devices. |
| `trigger`   | Orange  | `#FF9800` | 8x8         | Discrete trigger events (e.g., envelope gate signals). |

The type is defined as a string union in `types3.ts`:

```typescript
export type SignalType = "audio" | "control" | "midi" | "trigger";
```

Connection rules allow `audio -> control` (modulation routing) but block other cross-type connections. See [Connection Validation](#6-connection-validation) for details.

---

## 2. Port & PortConfig Types

### Port

A `Port` describes a single input or output on a node. Defined in `src/nodes/types3.ts`:

```typescript
export interface Port {
  /** Unique ID within the node (e.g., "input-0", "frequency", "output-0") */
  id: string;

  /** Port direction */
  type: "input" | "output";

  /** Display label for UI */
  label?: string;

  /** Signal type for connection validation */
  signalType: SignalType;

  /** React Flow handle position (Top, Bottom, Left, Right) */
  position: Position;

  /** Offset for multiple ports on the same edge */
  positionOffset?: { x: number; y: number };

  /** Tone.js connection index for multi-channel nodes */
  channelIndex?: number;

  /** Named Tone.js parameter path (e.g., "frequency", "Q", "pan") */
  toneProperty?: string;

  /** Channel count for audio ports (1 = mono, 2 = stereo) */
  channelCount?: ChannelCount;
}
```

Key fields:

- **`toneProperty`** -- When set, the AudioEngine connects to a named `Tone.Param` object rather than the node's main input. For example, `toneProperty: "frequency"` routes a control signal into the `frequency` param of a Filter node.
- **`channelIndex`** -- Used with `Tone.connect(dest, outputNum, inputNum)` for multi-channel routing (Merge/Split nodes).
- **`positionOffset`** -- Shifts the handle relative to its edge center, allowing multiple handles on the same side of a node.

### PortConfig

Groups all ports for a node type:

```typescript
export interface PortConfig {
  inputs: Port[];
  outputs: Port[];
}
```

---

## 3. Port Factory Functions

Located in `src/ports/types.ts`. These create common `PortConfig` shapes so registry entries stay concise.

### `createSinglePortConfig(signalType)`

Creates a node with one input (Top) and one output (Bottom) of the given signal type. Used for most pass-through effect nodes.

```typescript
createSinglePortConfig("audio")
// Result:
// { inputs: [{ id: "input", type: "input", signalType: "audio", position: Top }],
//   outputs: [{ id: "output", type: "output", signalType: "audio", position: Bottom }] }
```

**When to use:** Standard audio effects (Reverb, Delay, Chorus, Distortion, Compressor, etc.).

### `createSourcePortConfig(signalType)`

Creates a node with no inputs and one output. Used for signal generators.

```typescript
createSourcePortConfig("audio")
// Result:
// { inputs: [],
//   outputs: [{ id: "output", type: "output", signalType: "audio", position: Bottom }] }
```

**When to use:** Oscillators, Players, and other source nodes that generate signal but do not accept audio input.

### `createDestinationPortConfig(signalType)`

Creates a node with one input and no outputs. Used for signal consumers.

```typescript
createDestinationPortConfig("audio")
// Result:
// { inputs: [{ id: "input", type: "input", signalType: "audio", position: Top }],
//   outputs: [] }
```

**When to use:** Analyzer nodes (Meter, FFT, Waveform, Analyser) that consume signal for visualization without passing it through.

### `createMergePortConfig(channels)`

Creates N mono inputs spaced along the top edge and one stereo output at the bottom. Inputs are labeled `Ch 1`, `Ch 2`, etc.

```typescript
createMergePortConfig(2)
// Result:
// { inputs: [
//     { id: "input-0", label: "Ch 1", channelCount: 1, positionOffset: { x: -20, y: 0 } },
//     { id: "input-1", label: "Ch 2", channelCount: 1, positionOffset: { x: 20, y: 0 } }
//   ],
//   outputs: [{ id: "output", label: "Stereo", channelCount: 2 }] }
```

**When to use:** Merge nodes that combine multiple mono channels into a stereo signal.

### `createSplitPortConfig(channels)`

The inverse of merge: one stereo input at the top, N mono outputs spaced along the bottom.

```typescript
createSplitPortConfig(2)
// Result:
// { inputs: [{ id: "input", label: "Stereo", channelCount: 2 }],
//   outputs: [
//     { id: "output-0", label: "Ch 1", channelCount: 1, positionOffset: { x: -20, y: 0 } },
//     { id: "output-1", label: "Ch 2", channelCount: 1, positionOffset: { x: 20, y: 0 } }
//   ] }
```

**When to use:** Split nodes that break a stereo signal into individual mono channels.

---

## 4. Port Registry

The `TONE_PORT_REGISTRY` in `src/ports/registry.ts` is the central mapping from Tone.js node types to their port configurations. This metadata cannot be inferred from Tone.js at runtime, so it is manually maintained.

```typescript
export const TONE_PORT_REGISTRY: Partial<Record<ToneComponentKey, PortConfig>> = {
  // Source nodes -- no inputs
  Oscillator:     createSourcePortConfig("audio"),
  OmniOscillator: createSourcePortConfig("audio"),
  LFO:            { inputs: [], outputs: [{ id: "output", signalType: "control", ... }] },

  // Effect nodes -- audio in/out
  Reverb:         createSinglePortConfig("audio"),
  Delay:          createSinglePortConfig("audio"),
  Chorus:         createSinglePortConfig("audio"),

  // Instruments -- control input + audio output
  Synth:          { inputs: [{ id: "frequency", signalType: "control", toneProperty: "frequency" }],
                    outputs: [{ id: "output", signalType: "audio" }] },

  // Multi-port nodes
  Filter:         { inputs: [
                      { id: "input", signalType: "audio" },
                      { id: "frequency", signalType: "control", toneProperty: "frequency" },
                      { id: "Q", signalType: "control", toneProperty: "Q" }
                    ],
                    outputs: [{ id: "output", signalType: "audio" }] },

  // Multi-channel nodes
  Merge:          createMergePortConfig(2),
  Split:          createSplitPortConfig(2),

  // Analyzers -- input only
  Meter:          { inputs: [{ id: "input", signalType: "audio" }], outputs: [] },
  FFT:            { inputs: [{ id: "input", signalType: "audio" }], outputs: [] },
};
```

### Lookup with fallback

```typescript
export function getPortConfigForNode(nodeType: ToneComponentKey): PortConfig {
  const config = TONE_PORT_REGISTRY[nodeType];
  if (config) return config;

  // Fallback: assume single audio input/output
  console.warn(`No port configuration found for ${nodeType}, using default`);
  return createSinglePortConfig("audio");
}
```

If a new Tone.js node is added without a registry entry, it falls back to a single audio-in/audio-out configuration and logs a warning.

---

## 5. Handle ID System

React Flow identifies connection endpoints by handle IDs. Flowtone uses a structured format:

```
nodeId:direction:portIndex
```

Examples:
- `osc-123:out:0` -- first output of node `osc-123`
- `filter-456:in:1` -- second input of node `filter-456`

### Creating handle IDs

```typescript
import { createHandleId } from "~/ports/types";

const id = createHandleId("osc-123", "out", 0);
// "osc-123:out:0"
```

### Parsing handle IDs

```typescript
import { parseHandleId } from "~/ports/types";

const parsed = parseHandleId("filter-456:in:1");
// { nodeId: "filter-456", direction: "in", portIndex: 1 }
```

The parser validates the format and throws if the handle ID has fewer or more than three colon-delimited parts, or if the direction is not `"in"` or `"out"`.

### Port lookup from handle ID

```typescript
import { getPortByIndex } from "~/ports/types";

const port = getPortByIndex(portConfig, "in", 1);
// Returns the Port at index 1 in portConfig.inputs, or undefined
```

---

## 6. Connection Validation

Located in `src/validation/connectionValidation.ts`. The main entry point is `validateConnection()`, which checks a proposed connection against multiple rules.

### Validation checks (in order)

1. **Missing endpoints** -- Source and target node IDs must be present.
2. **Node existence** -- Both nodes must exist in the current node array.
3. **Self-connections** -- A node cannot connect to itself.
4. **Port compatibility** -- If port metadata is available for both endpoints:
   - **Direction check**: Source must be an output, target must be an input.
   - **Signal type matching**: Signal types must match, with one exception: `audio -> control` is allowed (for modulation routing).
   - **Channel count compatibility**: For audio ports, the source channel count must not exceed the target channel count (e.g., stereo cannot connect to a mono-only input).
5. **Duplicate prevention** -- An identical connection (same source, target, source handle, and target handle) must not already exist.
6. **Cycle detection** -- The new connection must not create a feedback loop in the directed graph.

```typescript
const result = validateConnection(connection, nodes, edges, portRegistry);
// { valid: true } or { valid: false, reason: "Signal type mismatch: midi -> audio" }
```

### Port-level validation

The `isValidPortConnection()` function in `src/ports/types.ts` handles the port-specific checks:

```typescript
export function isValidPortConnection(
  sourcePort: Port,
  targetPort: Port
): { valid: boolean; reason?: string } {
  // Direction: source must be output, target must be input
  if (sourcePort.type !== "output" || targetPort.type !== "input") {
    return { valid: false, reason: "Source must be output, target must be input" };
  }

  // Signal type: must match, except audio -> control is allowed
  if (sourcePort.signalType !== targetPort.signalType) {
    if (sourcePort.signalType === "audio" && targetPort.signalType === "control") {
      return { valid: true };
    }
    return { valid: false, reason: `Signal type mismatch: ${sourcePort.signalType} -> ${targetPort.signalType}` };
  }

  // Channel count: source channels must not exceed target channels
  if (sourcePort.signalType === "audio" && targetPort.signalType === "audio") {
    const sourceChannels = sourcePort.channelCount || 1;
    const targetChannels = targetPort.channelCount || 1;
    if (sourceChannels > targetChannels) {
      return { valid: false, reason: `Channel mismatch: ${sourceChannels} -> ${targetChannels}` };
    }
  }

  return { valid: true };
}
```

### Cycle detection

`wouldCreateCycle()` builds a directed adjacency list from all existing edges, adds the proposed edge, then runs a DFS from the source node looking for back edges:

```typescript
export function wouldCreateCycle(
  newSource: string,
  newTarget: string,
  edges: Edge[]
): boolean {
  // Build adjacency list, add proposed edge, DFS for back edges
  // Returns true if a cycle would be created
}
```

### Validation modes

Three factory functions create validator callbacks with different strictness levels:

| Mode | Factory | Checks |
|------|---------|--------|
| **Strict** | `createStrictValidator()` | All checks: signal types, channel counts, cycles, duplicates, self-connections |
| **Permissive** | `createPermissiveValidator()` | Self-connections and duplicates only |
| **No-cycle** | `createNoCycleValidator()` | Self-connections and cycle detection only |

Each returns a `(connection: Connection) => boolean` function suitable for React Flow's `isValidConnection` prop:

```typescript
const validator = createStrictValidator(nodes, edges, portRegistry);
// Use in React Flow:
<ReactFlow isValidConnection={validator} ... />
```

### Graph integrity checking

`validateAllConnections()` checks every existing edge in the graph and returns a list of any that are invalid:

```typescript
const { valid, invalidEdges } = validateAllConnections(nodes, edges, portRegistry);
// invalidEdges: Array<{ edge: Edge; reason: string }>
```

---

## 7. DynamicHandles Component

Located in `src/components/handles/DynamicHandles.tsx`. This component reads a node's `PortConfig` and generates the corresponding React Flow `<Handle>` elements automatically.

### Usage

```tsx
import { DynamicHandles } from "~/components/handles/DynamicHandles";

function MyNode({ id }: { id: string }) {
  const ports: PortConfig = {
    inputs: [{ id: "input", type: "input", signalType: "audio", position: Position.Top, channelIndex: 0 }],
    outputs: [{ id: "output", type: "output", signalType: "audio", position: Position.Bottom, channelIndex: 0 }],
  };

  return (
    <div>
      <DynamicHandles nodeId={id} ports={ports} showLabels />
      {/* Node content */}
    </div>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodeId` | `string` | required | Node ID, used to generate unique handle IDs |
| `ports` | `PortConfig` | required | The port configuration to render |
| `className` | `string` | `""` | Optional CSS class applied to each handle |
| `showLabels` | `boolean` | `false` | Whether to render text labels next to handles |

### How it works

1. Iterates `ports.inputs` and `ports.outputs`.
2. For each port, renders a `DynamicHandle` subcomponent that:
   - Generates the handle ID via `createHandleId(nodeId, direction, portIndex)`.
   - Maps `direction` to React Flow's handle type: `"in"` becomes `"target"`, `"out"` becomes `"source"`.
   - Applies signal-type styling from `getHandleStyle()`.
   - Calculates position offsets for multi-handle edges using `positionOffset`.
   - Optionally renders a label positioned relative to the handle's edge (above for Top, below for Bottom, beside for Left/Right).

### Position offset calculation

When a port defines `positionOffset`, the handle shifts from center:

- **Top/Bottom positions**: `left: calc(50% + Xpx)` shifts horizontally. Non-zero `y` overrides the vertical position.
- **Left/Right positions**: `top: calc(50% + Ypx)` shifts vertically. Non-zero `x` overrides the horizontal position.

This is how the MultibandSplit node spaces its three output handles (`Low`, `Mid`, `High`) along the bottom edge at offsets of -30, 0, and +30 pixels.

---

## 8. SimpleHandles

A convenience wrapper for nodes that need a basic single-input/single-output configuration without constructing a `PortConfig` manually.

```tsx
import { SimpleHandles } from "~/components/handles/DynamicHandles";

function BasicEffectNode({ id }: { id: string }) {
  return (
    <div>
      <SimpleHandles nodeId={id} />
      {/* Node content */}
    </div>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodeId` | `string` | required | Node ID |
| `hasInput` | `boolean` | `true` | Whether to render an input handle |
| `hasOutput` | `boolean` | `true` | Whether to render an output handle |
| `signalType` | `"audio" \| "control" \| "midi"` | `"audio"` | Signal type for both handles |

Examples:

```tsx
// Source node (output only)
<SimpleHandles nodeId={id} hasInput={false} />

// Destination node (input only)
<SimpleHandles nodeId={id} hasOutput={false} />

// Control signal node
<SimpleHandles nodeId={id} signalType="control" />
```

Internally, `SimpleHandles` constructs a `PortConfig` and delegates to `DynamicHandles`.

---

## 9. Handle Styling

The `getHandleStyle()` function in `src/ports/types.ts` returns inline styles based on signal type:

```typescript
export function getHandleStyle(signalType: SignalType): {
  backgroundColor: string;
  width: number;
  height: number;
} {
  const styles = {
    audio:   { backgroundColor: "#4CAF50", width: 14, height: 14 },
    control: { backgroundColor: "#2196F3", width: 10, height: 10 },
    midi:    { backgroundColor: "#9C27B0", width: 12, height: 12 },
    trigger: { backgroundColor: "#FF9800", width: 8,  height: 8  },
  };

  return styles[signalType] || styles.audio;
}
```

Handle sizes are intentionally varied to provide a secondary visual cue beyond color:

- **Audio** handles are the largest (14px) since they represent the primary signal path.
- **Control** handles are smaller (10px) -- secondary modulation connections.
- **MIDI** handles are mid-sized (12px).
- **Trigger** handles are the smallest (8px) -- simple gate/trigger signals.

The `DynamicHandle` component applies these styles directly to the React Flow `<Handle>` element via the `style` prop, then overlays any position offset calculations on top.
