# Type System

**Source file:** `src/nodes/types3.ts`

## Overview

Flowtone's type system is built on discriminated unions with a `kind` field that classifies every node in the application into one of three categories:

- `"atomic"` -- A single Tone.js audio node wrapper
- `"composite"` -- A user-created preset containing a sub-graph of nodes
- `"utility"` -- A non-Tone.js node (MIDI input, piano keyboard, etc.)

### Why types3.ts

The project contains three type files. Only `types3.ts` is the current system; the other two are legacy:

- **`types.ts`** (legacy) -- The original type system. Used `ExtractToneComponentDefaults` with `getDefaults()` to infer config types. Node data included a `package: "Tone"` field and a `type` field for the Tone.js class name. It had no discriminated union, no concept of composite nodes, and no port type definitions. It still re-exports `ToneComponentKey` from `types3.ts` because some legacy imports reference it.

- **`types2.ts`** (legacy) -- Introduced `ConstructorParameters` for config type extraction (more runtime-correct than `getDefaults()`). Defined `ToneComponent<T>` as a generic wrapper using `ConstructorParameters<(typeof Tone)[T]>[0]`. Still lacked discriminated unions and composite node support.

- **`types3.ts`** (current) -- Combines the `ConstructorParameters` approach from types2.ts with a discriminated union architecture. Adds the `kind` field, composite node types with parameter/port mapping, the full port system, and type guard functions.

All new code should import from `types3.ts`. The legacy files remain in the codebase but should not be used for new development.

---

## Tone.js Class Extraction

The type system automatically extracts class names from the Tone.js library using a mapped conditional type. This avoids manually listing every Tone.js class and keeps the types synchronized with the installed Tone.js version.

### ExtractClassesReturningType

```typescript
type ExtractClassesReturningType<T, ReturnType, BaseClass> = {
  [K in keyof T]: T[K] extends { new (...args: any[]): infer R }
    ? R extends ReturnType
      ? R extends BaseClass
        ? K
        : never
      : never
    : never;
}[keyof T];
```

This type takes three parameters:

| Parameter    | Purpose                                                    |
| ------------ | ---------------------------------------------------------- |
| `T`          | The object to scan (always `typeof Tone`)                  |
| `ReturnType` | Required options type (`Tone.ToneAudioNodeOptions`)        |
| `BaseClass`  | The inheritance filter (e.g., `Source`, `Effect`, etc.)     |

**How it works:**

1. Iterates over every key `K` in the Tone namespace.
2. Checks if the value at that key is a constructor (`{ new (...args: any[]): infer R }`).
3. Infers the constructed instance type `R`.
4. Checks that `R` extends both `ReturnType` and `BaseClass`.
5. If all conditions pass, yields the key `K`; otherwise yields `never`.
6. The final `[keyof T]` collapses the mapped type into a union of all passing keys.

### Derived Category Types

The generic is applied with different base classes to produce category-specific unions:

```typescript
// All Tone.js audio nodes (broadest -- 80+ classes)
export type ToneComponentKey = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Tone.ToneAudioNode
>;

// Source nodes only (oscillators, players, LFO, etc.)
export type ToneSourceKey = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Source<any>
>;

// Effect nodes only (reverb, delay, distortion, etc.)
export type ToneEffectKey = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Effect<any>
>;

// Instrument nodes only (synths, samplers, etc.)
export type ToneInstrumentKey = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Instrument<any>
>;

// Signal nodes (Signal, Add, Multiply, etc.)
export type ToneSignalKey = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Signal<any>
>;

// Envelope nodes (Envelope, AmplitudeEnvelope, etc.)
export type ToneEnvelopeKey = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Envelope
>;
```

Each of these resolves to a string literal union at compile time. For example, `ToneSourceKey` resolves to something like `"Oscillator" | "AMOscillator" | "FMOscillator" | "LFO" | "Player" | ...`. The `ToneComponentKey` type is the broadest, covering all Tone.js audio nodes regardless of category, and is used as the constraint for the `AtomicToneNode` generic.

---

## Atomic Nodes

An atomic node wraps exactly one Tone.js audio node. The `AtomicToneNode<T>` generic produces a fully typed React Flow `Node` with config types derived directly from the Tone.js constructor signature.

### AtomicToneNode Generic

```typescript
export type AtomicToneNode<
  T extends ToneComponentKey,
  P = ConstructorParameters<(typeof Tone)[T]>[0]
> = Node<
  {
    kind: "atomic";
    label: string;
    toneType: T;
    config: P;
    ports?: PortConfig;
  },
  T
>;
```

| Field      | Type         | Purpose                                                        |
| ---------- | ------------ | -------------------------------------------------------------- |
| `kind`     | `"atomic"`   | Discriminator for the union                                    |
| `label`    | `string`     | Display name shown in the node UI                              |
| `toneType` | `T`          | The Tone.js class name (e.g., `"Oscillator"`, `"Reverb"`)     |
| `config`   | `P`          | Constructor options, inferred from `ConstructorParameters`     |
| `ports`    | `PortConfig` | Optional override; defaults come from the port registry        |

The second type parameter to `Node<Data, T>` sets the React Flow node `type` field to the Tone.js class name string, which is used to look up the correct React component in the `nodeTypes` registry.

### Config Type Extraction

The config type `P` defaults to `ConstructorParameters<(typeof Tone)[T]>[0]`. This extracts the first argument of the Tone.js class constructor, which is always the options object. For example:

- `AtomicToneNode<"Oscillator">` gets config type `Partial<OscillatorOptions>`
- `AtomicToneNode<"Reverb">` gets config type `Partial<ReverbOptions>`

### Concrete Node Types

Each supported Tone.js class has a named type alias:

```typescript
// Source nodes
export type OscillatorNode = AtomicToneNode<"Oscillator">;
export type LFONode = AtomicToneNode<"LFO">;
export type PlayerNode = AtomicToneNode<"Player">;

// Instrument nodes
export type SynthNode = AtomicToneNode<"Synth">;
export type FMSynthNode = AtomicToneNode<"FMSynth">;

// Effect nodes
export type ReverbNode = AtomicToneNode<"Reverb">;
export type ChorusNode = AtomicToneNode<"Chorus">;

// Component nodes
export type FilterNode = AtomicToneNode<"Filter">;
export type ChannelNode = AtomicToneNode<"Channel">;
// ... 60+ more
```

### Special Case: PannerNode

The Tone.js `Panner` constructor takes a single `number` instead of an options object, which breaks the `ConstructorParameters` extraction. It is defined manually:

```typescript
export type PannerNode = Node<
  {
    kind: "atomic";
    label: string;
    value: number;
  },
  "Panner"
>;
```

---

## Composite Nodes

Composite nodes represent user-created presets that package multiple nodes into a single reusable unit. They contain an internal sub-graph of nodes and edges, with mappings that expose selected internal parameters and ports on the composite boundary.

### CompositeNode Type

```typescript
export type CompositeNode = Node<
  {
    kind: "composite";
    label: string;
    definitionId: string;
    definitionVersion: number;
    parameterValues: Record<string, number | string | boolean>;
    subGraph: {
      nodes: AppNode[];
      edges: AppEdge[];
    };
    parameterMappings: ParameterMapping[];
    portMappings: {
      inputs: PortMapping[];
      outputs: PortMapping[];
    };
    ports: PortConfig;
    isExpanded?: boolean;
    isLocked?: boolean;
    instanceId: string;
  },
  "Composite"
>;
```

Key fields:

- **`definitionId`** / **`definitionVersion`** -- Reference to a `CompositeDefinition`, separating the template ("class") from instances. Multiple composite nodes can share the same definition.
- **`subGraph`** -- The internal node/edge graph. Note that `AppNode[]` is recursive: composite nodes can nest other composites.
- **`parameterValues`** -- Current values for all exposed parameters on this specific instance.
- **`isExpanded`** -- Whether the user has expanded the node to see its internal graph.
- **`isLocked`** -- Prevents editing of the internal structure.

### CompositeDefinition

The definition is stored separately and acts as a template:

```typescript
export interface CompositeDefinition {
  id: string;
  name: string;
  description?: string;
  category?: string;
  color?: string;
  icon?: string;
  internalNodes: AppNode[];
  internalEdges: AppEdge[];
  parameters: Array<{
    id: string;
    label: string;
    type: "number" | "select" | "toggle";
    defaultValue: number | string | boolean;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    options?: string[];
    mappings: ParameterMapping[];
  }>;
  ports: { inputs: Port[]; outputs: Port[] };
  collapsedWidth?: number;
  collapsedHeight?: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}
```

### ParameterMapping

The parameter mapping system connects external controls on the composite boundary to internal Tone.js parameters, with optional value transforms.

```typescript
export interface ParameterMapping {
  externalName: string;
  internalTargets: ParameterPath | ParameterPath[];
  transform?: TransformFunction;
  inverseTransform?: InverseTransformFunction;
  units?: ParameterUnits;
  range?: { min: number; max: number };
  automatable?: boolean;
}
```

| Field              | Purpose                                                                     |
| ------------------ | --------------------------------------------------------------------------- |
| `externalName`     | The parameter name shown on the composite node UI                           |
| `internalTargets`  | Dot-notation path(s) to internal parameters (e.g., `"oscillator.frequency"`) |
| `transform`        | `(value: number) => number` -- maps external value to internal value        |
| `inverseTransform` | `(value: number) => number` -- maps internal value back to external         |
| `units`            | Tone.js unit type for automation (`"frequency"`, `"time"`, `"decibels"`, etc.) |
| `range`            | Min/max bounds for the external control (before transform is applied)       |
| `automatable`      | Whether the parameter supports automation (defaults to `true`)              |

**One-to-many mapping:** `internalTargets` accepts an array of paths, allowing a single external knob to control multiple internal parameters simultaneously. For example, a "Brightness" control might map to both filter frequency and envelope decay.

**Transform/inverse:** The transform pair enables non-linear mappings. For instance, a "Brightness" knob at 0-100 could transform to a filter cutoff at 200-8000 Hz logarithmically. The inverse transform is required for bidirectional sync -- reading an internal parameter value back to display on the external control.

### PortMapping

Port mappings connect the composite node's external ports to specific ports on internal nodes:

```typescript
export interface PortMapping {
  externalPortId: string;
  internalNodeId: string;
  internalPortId: string;
}
```

For example, a composite "Bass Synth" might map its external audio output to the internal channel strip's output port.

---

## Utility Nodes

Utility nodes handle functionality outside the Tone.js audio graph. They share `kind: "utility"` but have different React Flow type strings.

```typescript
export type MidiInputNode = Node<
  {
    kind: "utility";
    label: string;
    config: Record<string, unknown>;
    connections?: AppEdge[];
  },
  "Midi"
>;

export type MidiPianoNode = Node<
  {
    kind: "utility";
    label: string;
    config: Record<string, unknown>;
    connections?: AppEdge[];
  },
  "MidiPiano"
>;

export type StoreNode = Node<
  {
    kind: "utility";
    config: Record<string, unknown>;
  },
  "StoreNode"
>;
```

Utility nodes use `Record<string, unknown>` for their config since they do not correspond to Tone.js constructors. The `connections` field on MIDI nodes tracks outgoing edges for MIDI routing, which operates outside the standard audio graph.

---

## Port Types

The port system defines how nodes expose connection points and what signal types they carry.

### SignalType

```typescript
export type SignalType = "audio" | "control" | "midi" | "trigger";
```

| Signal Type | Description                                | Visual Color |
| ----------- | ------------------------------------------ | ------------ |
| `audio`     | Audio-rate signal (Tone.js audio graph)    | Green        |
| `control`   | Control-rate signal (parameter modulation) | Blue         |
| `midi`      | MIDI messages (note on/off, CC)            | Purple       |
| `trigger`   | One-shot triggers (gate, envelope trigger) | Orange       |

### Port

```typescript
export interface Port {
  id: string;              // Unique within node: "input-0", "frequency", "output-0"
  type: "input" | "output";
  label?: string;          // Display label
  signalType: SignalType;
  position: Position;      // React Flow handle position (Top, Bottom, Left, Right)
  positionOffset?: { x: number; y: number };
  channelIndex?: number;   // For multi-channel Tone.js connect(dest, outputNum, inputNum)
  toneProperty?: string;   // Named Tone.Param path: "frequency", "detune", "Q"
  channelCount?: ChannelCount; // 1 (mono) or 2 (stereo)
}
```

The `toneProperty` field is significant: when a port has this set, connecting to it routes signal directly into a `Tone.Param` object (e.g., connecting an LFO output to a filter's frequency input for modulation).

### PortConfig

```typescript
export interface PortConfig {
  inputs: Port[];
  outputs: Port[];
}
```

Port configs are defined in the port registry (`src/ports/registry.ts`) and looked up by node type. Atomic nodes can optionally override ports via their `ports` field.

---

## AppNode Union

The `AppNode` type is the master discriminated union that encompasses every possible node in the application:

```typescript
export type AppNode =
  // Atomic Tone.js nodes (80+ variants)
  | AMOscillatorNode
  | FMOscillatorNode
  | OscillatorNode
  | SynthNode
  | ReverbNode
  | FilterNode
  // ... (all concrete atomic types)

  // Composite nodes
  | CompositeNode

  // Utility nodes
  | MidiInputNode
  | MidiPianoNode
  | StoreNode;
```

This type is used throughout the application:

- The Zustand store holds `nodes: AppNode[]`
- React Flow receives `AppNode` as its generic parameter
- Store actions like `updateNodeData` accept `AppNode`

### Working with AppNode

Because `AppNode` is a discriminated union on `node.data.kind`, you can narrow it using standard TypeScript patterns:

```typescript
function processNode(node: AppNode) {
  if (node.data.kind === "atomic") {
    // TypeScript knows: node.data.toneType, node.data.config exist
    console.log(node.data.toneType);
  } else if (node.data.kind === "composite") {
    // TypeScript knows: node.data.subGraph, node.data.parameterMappings exist
    console.log(node.data.definitionId);
  } else if (node.data.kind === "utility") {
    // TypeScript knows: node.data.config is Record<string, unknown>
  }
}
```

The React Flow `type` field (second generic parameter to `Node`) is set to the Tone.js class name for atomic nodes (e.g., `"Oscillator"`), `"Composite"` for composite nodes, and specific strings for utilities (`"Midi"`, `"MidiPiano"`, `"StoreNode"`).

---

## Type Guards

Four runtime type guard functions are exported for safe narrowing without manual property checks.

### isAtomicNode

```typescript
export function isAtomicNode(
  node: AppNode
): node is Extract<AppNode, { data: { kind: "atomic" } }> {
  return "data" in node && "kind" in node.data && node.data.kind === "atomic";
}
```

Narrows to the union of all atomic node types. After this guard, `node.data.toneType` and `node.data.config` are accessible.

### isCompositeNode

```typescript
export function isCompositeNode(node: AppNode): node is CompositeNode {
  return "data" in node && "kind" in node.data && node.data.kind === "composite";
}
```

Narrows to `CompositeNode` specifically. Provides access to `subGraph`, `parameterMappings`, `portMappings`, etc.

### isUtilityNode

```typescript
export function isUtilityNode(
  node: AppNode
): node is MidiInputNode | MidiPianoNode | StoreNode {
  return "data" in node && "kind" in node.data && node.data.kind === "utility";
}
```

Narrows to the utility node union. Note this returns a union of the three specific utility types, not a single type.

### isToneNodeType

```typescript
export function isToneNodeType<T extends ToneComponentKey>(
  node: AppNode,
  nodeType: T
): boolean {
  return isAtomicNode(node) && "toneType" in node.data && node.data.toneType === nodeType;
}
```

Checks for a specific Tone.js class. Unlike the other guards, this returns `boolean` rather than a type predicate, so it does not narrow the type. Use it for conditional logic where you already know the node is atomic:

```typescript
if (isToneNodeType(node, "Oscillator")) {
  // node type is NOT narrowed here -- still AppNode
  // Use isAtomicNode() first if you need narrowed access
}
```

### Usage Pattern

A typical pattern combining guards:

```typescript
function handleNode(node: AppNode) {
  if (isAtomicNode(node)) {
    // Access toneType, config
    audioEngine.updateNodeParams(node.id, node.data.config);
  } else if (isCompositeNode(node)) {
    // Recurse into sub-graph
    node.data.subGraph.nodes.forEach(handleNode);
  } else if (isUtilityNode(node)) {
    // Handle MIDI routing, etc.
  }
}
```
