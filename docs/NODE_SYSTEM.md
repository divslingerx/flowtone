# Flowtone Node System Documentation

## Overview

Flowtone uses a **hybrid auto-generation system** that allows you to implement new Tone.js nodes in ~2 minutes with just 15 lines of code. The system automatically generates parameter controls, handles, and audio routing based on metadata registries.

## Architecture Components

### 1. Type System (`types3.ts`)

The unified type system uses discriminated unions to support:
- **Atomic nodes**: Single Tone.js wrappers (`kind: "atomic"`)
- **Composite nodes**: User-created presets (`kind: "composite"`)
- **Utility nodes**: MIDI and other non-Tone nodes (`kind: "utility"`)

**Key types:**
```typescript
type AtomicToneNode<T extends ToneComponentKey> = Node<{
  kind: "atomic";
  label: string;
  toneType: T;
  config: ConstructorParameters<typeof Tone[T]>[0];
  ports?: PortConfig;
}>

type AppNode = AtomicToneNode<ToneComponentKey> | CompositeNode | UtilityNode;
```

### 2. Port System (`src/ports/`)

**Purpose:** Defines input/output configuration for each node type.

**Files:**
- `types.ts` - Port type definitions and utilities
- `registry.ts` - Port configurations for 35+ Tone.js nodes

**Port structure:**
```typescript
interface Port {
  id: string;                  // "input", "output-0", "frequency"
  type: "input" | "output";
  signalType: "audio" | "control" | "midi" | "trigger";
  position: Position;          // React Flow position
  channelIndex?: number;       // For Tone.js multi-channel nodes
  toneProperty?: string;       // For named params like "frequency"
}
```

**Example:**
```typescript
// Filter has audio input + control inputs for frequency and Q
Filter: {
  inputs: [
    { id: "input", signalType: "audio", position: Position.Top },
    { id: "frequency", signalType: "control", position: Position.Left, toneProperty: "frequency" },
    { id: "Q", signalType: "control", position: Position.Right, toneProperty: "Q" },
  ],
  outputs: [
    { id: "output", signalType: "audio", position: Position.Bottom },
  ]
}
```

### 3. Parameter System (`src/lib/parameters/`)

**Purpose:** Automatically generate UI controls for Tone.js parameters.

**Files:**
- `metadata.ts` - Parameter metadata registry

**How it works:**
1. Tone.js provides parameter names via `getDefaults()`
2. Parameter metadata maps names → control types
3. Node-specific overrides customize behavior
4. AutoNodeControls generates UI automatically

**Parameter metadata:**
```typescript
frequency: {
  controlType: "knob-frequency",
  min: 20,
  max: 20000,
  scale: "logarithmic",
  unit: "Hz",
}
```

**Node-specific overrides:**
```typescript
NODE_METADATA: {
  Filter: {
    overrides: {
      frequency: { displayName: "Cutoff" }
    },
    parameterOrder: ["frequency", "Q", "type"]
  }
}
```

### 4. Auto-Generation Components (`src/components/`)

**DynamicHandles** (`components/handles/`):
- Auto-generates React Flow handles from port configuration
- Color-codes by signal type (green=audio, blue=control, purple=MIDI)
- Supports multi-port nodes with position offsets

**AutoNodeControls** (`components/auto-controls/`):
- Auto-generates parameter controls from metadata
- Supports grouping, ordering, and hiding parameters
- Renders specialized knobs, sliders, dropdowns, toggles

**Knob Variants** (`components/knob/`):
- `KnobFrequency` - Logarithmic 20-20kHz
- `KnobTime` - Logarithmic time (ms to seconds)
- `KnobNormalized` - Linear 0-1
- `KnobQ` - Logarithmic resonance
- `KnobDetune` - Linear cents
- `KnobRatio` - Compressor ratio
- `KnobGain` - Linear gain

## Adding a New Node (2-Minute Guide)

### Step 1: Create Node Component (1 minute)

Copy the template from `src/nodes/tone/NODE_TEMPLATE.tsx`:

```tsx
// src/nodes/tone/effect-nodes/PhaserNode.tsx
import { type NodeProps } from "@xyflow/react";
import { type PhaserNode } from "../../types";
import { useToneNode } from "~/hooks/useToneNode";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";
import { AutoNodeControls } from "~/components/auto-controls";

export function PhaserNode({ data, id }: NodeProps<PhaserNode>) {
  const phaser = useToneNode(data.type, data.config);
  const portConfig = getPortConfigForNode("Phaser");

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}
      <div className="nodrag">
        <AutoNodeControls nodeType="Phaser" nodeId={id} currentData={data.config} />
      </div>
      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
```

### Step 2: Add to nodeTypes Registry (30 seconds)

In `src/nodes/index.ts`:

```typescript
import { PhaserNode } from "./tone/effect-nodes/PhaserNode";

export const nodeTypes = {
  // ... existing ...
  Phaser: PhaserNode,
} satisfies NodeTypes;
```

### Step 3: Add to Port Registry (30 seconds)

In `src/ports/registry.ts`:

```typescript
Phaser: createSinglePortConfig("audio"),
```

**Done!** The node is now:
- Available in the sidebar
- Has auto-generated parameter controls
- Has proper handles
- Integrates with the audio engine

## Port Registry Reference

### Simple Patterns

**Single audio input/output** (most effects):
```typescript
Phaser: createSinglePortConfig("audio"),
```

**Source node** (no inputs):
```typescript
Oscillator: createSourcePortConfig("audio"),
```

**Multi-channel merge**:
```typescript
Merge: createMergePortConfig(2),  // 2 mono inputs → 1 stereo output
```

**Multi-channel split**:
```typescript
Split: createSplitPortConfig(2),  // 1 stereo input → 2 mono outputs
```

### Custom Port Configurations

**Node with control inputs** (filter):
```typescript
Filter: {
  inputs: [
    { id: "input", signalType: "audio", position: Position.Top },
    { id: "frequency", signalType: "control", position: Position.Left, toneProperty: "frequency" },
    { id: "Q", signalType: "control", position: Position.Right, toneProperty: "Q" },
  ],
  outputs: [
    { id: "output", signalType: "audio", position: Position.Bottom },
  ]
}
```

**Multi-output node** (MultibandSplit):
```typescript
MultibandSplit: {
  inputs: [
    { id: "input", signalType: "audio", position: Position.Top },
  ],
  outputs: [
    { id: "low", signalType: "audio", position: Position.Bottom,
      positionOffset: { x: -30, y: 0 }, toneProperty: "low" },
    { id: "mid", signalType: "audio", position: Position.Bottom,
      toneProperty: "mid" },
    { id: "high", signalType: "audio", position: Position.Bottom,
      positionOffset: { x: 30, y: 0 }, toneProperty: "high" },
  ]
}
```

## Parameter Metadata Reference

### Adding New Parameter Metadata

In `src/lib/parameters/metadata.ts`:

```typescript
PARAMETER_DEFAULTS: {
  yourParam: {
    controlType: "knob-normalized",  // or knob-frequency, slider-db, dropdown, etc.
    min: 0,
    max: 1,
    scale: "linear",  // or "logarithmic"
    unit: "units",
    displayName: "Your Parameter",
    group: "Optional Group Name",
  }
}
```

### Node-Specific Overrides

```typescript
NODE_METADATA: {
  YourNode: {
    overrides: {
      frequency: { displayName: "Custom Name", min: 100, max: 5000 }
    },
    parameterOrder: ["param1", "param2", "param3"],
    layout: "grid",  // or "vertical" or "horizontal"
    groups: {
      "Group Name": ["param1", "param2"]
    },
    hideParams: ["context", "internal"]
  }
}
```

## Customization Guide

### Level 1: Use Default Auto-Generation

**When:** Node has standard parameters, no special UI needed

**Code:** Use template as-is (15 lines)

**Example:** Most effects, basic filters, simple envelopes

### Level 2: Add Parameter Overrides

**When:** Need to customize parameter display or order

**Code:** Add entry to `NODE_METADATA` in `metadata.ts`

**Example:**
```typescript
Chorus: {
  overrides: {
    frequency: { displayName: "LFO Rate", min: 0.1, max: 10 }
  },
  parameterOrder: ["frequency", "depth", "wet"]
}
```

### Level 3: Custom UI + Auto Controls

**When:** Want custom visualization but keep parameter controls

**Code:** Add custom elements before/after AutoNodeControls

**Example:**
```tsx
export function SpectrumNode({ data, id }) {
  const node = useToneNode(data.type, data.config);

  return (
    <div className="react-flow__node-default">
      {/* Custom spectrum visualization */}
      <canvas ref={canvasRef} className="w-full h-32" />

      {/* Auto-generated controls */}
      <AutoNodeControls nodeType="Analyser" nodeId={id} currentData={data.config} />

      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
```

### Level 4: Fully Custom Node

**When:** Need complete control over layout and behavior

**Code:** Don't use AutoNodeControls, implement manually

**Example:** OmniOscillatorNode with space background and custom knobs

## Node Lifecycle

### 1. Node Creation

**From sidebar:**
- User drags or double-clicks
- React Flow creates visual node
- AudioEngine creates Tone.js instance
- Port config registered

### 2. Parameter Updates

**User changes knob:**
```typescript
const handleParamChange = (param, value) => {
  updateNodeData(id, { [param]: value });      // Visual state
  audioEngine.updateNodeParams(id, { [param]: value });  // Audio state
};
```

**Flow:**
1. Knob onChange fires
2. React Flow state updates
3. AudioEngine updates Tone.Param
4. Audio output changes

### 3. Connections

**User drags edge:**
1. React Flow validates connection via port metadata
2. Visual edge added
3. AudioEngine connects Tone.js nodes
4. Audio flows through

### 4. Node Deletion

1. React Flow removes visual node
2. AudioEngine disposes Tone.js instance
3. All connections cleaned up

## File Organization

```
src/
├── nodes/
│   ├── types3.ts                      # Unified type system
│   ├── index.ts                       # nodeTypes registry
│   ├── NODE_TEMPLATE.tsx              # Copy this for new nodes!
│   └── tone/
│       ├── source-nodes/              # Oscillators, LFO, Players
│       ├── instrument-nodes/          # Synths
│       ├── effect-nodes/              # Reverbs, Delays, Filters
│       └── component-nodes/           # Envelopes, Channel, Merge/Split
│
├── ports/
│   ├── types.ts                       # Port type definitions
│   └── registry.ts                    # Port configurations
│
├── lib/
│   └── parameters/
│       └── metadata.ts                # Parameter metadata
│
├── components/
│   ├── handles/
│   │   └── DynamicHandles.tsx         # Auto-generate handles
│   ├── auto-controls/
│   │   ├── AutoNodeControls.tsx       # Auto-generate controls
│   │   └── AutoControl.tsx            # Individual control renderer
│   ├── knob/
│   │   ├── knob-base.tsx              # Base knob component
│   │   ├── knob-frequency.tsx         # Frequency knob
│   │   └── knob-variants.tsx          # Time, Q, Detune, etc.
│   └── node-catalog/
│       ├── NodeCatalog.tsx            # Sidebar
│       ├── nodeCategories.ts          # Node organization
│       └── autoPlacement.ts           # Smart placement
│
└── validation/
    └── connectionValidation.ts        # Port-based validation
```

## Common Patterns

### Pattern: Effect Node with Wet Control

Most effects have a `wet` parameter (dry/wet mix):

```typescript
// Already defined in PARAMETER_DEFAULTS
wet: {
  controlType: "knob-normalized",
  displayName: "Wet/Dry"
}

// Usage - just use the template, auto-generation handles it!
export function ReverbNode({ data, id }) {
  return <AutoGenerated />;  // Wet knob appears automatically
}
```

### Pattern: Envelope Nodes (ADSR)

Envelopes have `attack`, `decay`, `sustain`, `release`:

```typescript
// Pre-configured in NODE_METADATA
AmplitudeEnvelope: {
  parameterOrder: ["attack", "decay", "sustain", "release"],
  layout: "grid"
}

// All ADSR knobs appear in correct order automatically
```

### Pattern: LFO as Modulation Source

LFO nodes auto-start and have control signal output:

```tsx
export function LFONode({ data, id }) {
  const lfo = useToneNode(data.type, data.config);

  useEffect(() => {
    lfo?.start();  // Start LFO immediately
  }, [lfo]);

  // ... rest of template
}
```

**Port config:**
```typescript
LFO: {
  inputs: [],
  outputs: [
    { id: "output", signalType: "control" }  // Note: control, not audio!
  ]
}
```

### Pattern: Multi-Port Nodes

Merge/Split use array-based port generation:

```tsx
export function MergeNode({ data, id }) {
  return (
    <div className="react-flow__node-default">
      {data.label}
      {/* No parameter controls needed */}
      <DynamicHandles nodeId={id} ports={portConfig} showLabels />
    </div>
  );
}
```

**Port config:**
```typescript
Merge: createMergePortConfig(2),  // Auto-generates 2 inputs, 1 output
```

## Extending the System

### Adding a New Control Type

**1. Add to ControlType enum:**
```typescript
// src/lib/parameters/metadata.ts
export type ControlType =
  | "knob-frequency"
  | "your-new-type";  // Add here
```

**2. Create knob variant (if needed):**
```tsx
// src/components/knob/knob-variants.tsx
export function KnobYourType({ label, value, onChange }) {
  return <KnobBase {...config} />;
}
```

**3. Handle in AutoControl:**
```tsx
// src/components/auto-controls/AutoControl.tsx
case "your-new-type":
  return <KnobYourType {...props} />;
```

### Adding a New Signal Type

**1. Add to SignalType:**
```typescript
// src/nodes/types3.ts
export type SignalType = "audio" | "control" | "midi" | "your-type";
```

**2. Add handle styling:**
```typescript
// src/ports/types.ts
export function getHandleStyle(signalType: SignalType) {
  const styles = {
    audio: { backgroundColor: "#4CAF50" },
    "your-type": { backgroundColor: "#YOUR_COLOR" },
  };
}
```

**3. Update validation:**
```typescript
// src/validation/connectionValidation.ts
// Add compatibility rules if needed
```

## Troubleshooting

### Node Not Appearing in Sidebar

**Check:**
1. Is it in `nodeCategories.ts`?
2. Is the type name correct?
3. Is the category collapsed?

### Parameters Not Showing

**Check:**
1. Does Tone.js class have `getDefaults()` method?
2. Is parameter in `hideParams` list?
3. Does parameter name match `PARAMETER_DEFAULTS` or have override?

### Handles Not Connecting

**Check:**
1. Is port config defined in `registry.ts`?
2. Are signal types compatible?
3. Is `isValidConnection` blocking it?

### Audio Not Working

**Check:**
1. Is `useToneNode` hook being called?
2. For sources: Is `.start()` called?
3. For destinations: Is `.toDestination()` needed?
4. Is AudioEngine creating the node?

## Best Practices

### DO:
✅ Use auto-generation for simple nodes
✅ Add parameter metadata for new parameter names
✅ Use port registry for all nodes
✅ Test with MIDI input for synths/instruments
✅ Add `.start()` for continuous sources (oscillators, LFO)

### DON'T:
❌ Create handles manually (use DynamicHandles)
❌ Hard-code parameter names (use metadata)
❌ Create Tone.js nodes directly (use useToneNode)
❌ Forget to dispose nodes (useToneNode handles it)
❌ Skip port configuration (fallback works but no validation)

## Examples

### Example 1: Simple Effect Node

```tsx
// 15 lines, 2 minutes
export function DistortionNode({ data, id }) {
  const distortion = useToneNode(data.type, data.config);
  const portConfig = getPortConfigForNode("Distortion");

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}
      <div className="nodrag">
        <AutoNodeControls nodeType="Distortion" nodeId={id} currentData={data.config} />
      </div>
      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
```

### Example 2: Source with Start

```tsx
export function LFONode({ data, id }) {
  const lfo = useToneNode(data.type, data.config);
  const portConfig = getPortConfigForNode("LFO");

  useEffect(() => {
    lfo?.start();  // Start immediately
  }, [lfo]);

  return (/* ... same as above ... */);
}
```

### Example 3: Custom UI + Auto Controls

```tsx
export function OmniOscillatorNode({ data, id }) {
  return (
    <div className="react-flow__node-default">
      {/* Custom space background */}
      <SpaceVisualization />

      {/* Auto-generated controls */}
      <div className="nodrag">
        <AutoNodeControls nodeType="OmniOscillator" nodeId={id} currentData={data.config} />
      </div>

      {/* Custom play button */}
      <button onClick={playNote}>Play</button>

      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
```

## Performance Notes

### useToneNode Hook

Creates Tone.js instance once, disposes on unmount:

```typescript
// GOOD: Create once
const node = useToneNode("Filter", { frequency: 440 });

// BAD: Don't recreate on config change
// useToneNode will handle parameter updates via updateNodeParams
```

### Parameter Updates

Updates are batched and sent to audio thread:

```typescript
// React state update (synchronous)
updateNodeData(id, { frequency: 880 });

// Audio update (async, handled by Tone.js)
audioEngine.updateNodeParams(id, { frequency: 880 });
```

## Node Statistics

**Currently Implemented: 50+ nodes**

- **Source Nodes:** 10 (OmniOscillator, Oscillator, LFO, etc.)
- **Instrument Nodes:** 6 (Synth, MonoSynth, PolySynth, etc.)
- **Effect Nodes:** 20 (Reverb, Delay, Filter, Chorus, etc.)
- **Component Nodes:** 14 (Envelopes, Channel, Merge/Split, Meters)
- **MIDI Nodes:** 2 (MidiInput, MidiPiano)

**In Port Registry:** 35+ configurations
**In Parameter Registry:** 20+ parameter types
**Auto-generated UI:** 90%+ of nodes

## Quick Reference Card

### Add Node Checklist

- [ ] Copy `NODE_TEMPLATE.tsx` to appropriate folder
- [ ] Replace `NODE_NAME`, `NODE_TYPE`, `TONE_TYPE`
- [ ] Add import to `src/nodes/index.ts`
- [ ] Add to `nodeTypes` object
- [ ] Add port config to `src/ports/registry.ts` (if not using default)
- [ ] Add parameter metadata overrides (if needed)
- [ ] Add to `nodeCategories.ts` (for sidebar)
- [ ] Test!

### Estimated Time

- **Basic node:** 2 minutes
- **With custom parameters:** 5 minutes
- **With custom UI:** 15-30 minutes
- **With visualization:** 1-2 hours

## Future Enhancements

Planned improvements to the system:

1. **Composite Nodes:** User-created presets (architecture complete, UI pending)
2. **Preset System:** Save/load parameter presets
3. **Modulation Matrix:** Visual modulation routing
4. **Custom Visualizations:** Waveform displays, spectrum analyzers
5. **Performance Optimization:** Shared audio graphs for composites
6. **Validation UI:** Visual feedback for invalid connections

## Support

For questions or issues:
- Check this documentation
- Review `NODE_TEMPLATE.tsx`
- Look at existing nodes for examples
- Check `CLAUDE.md` for architecture details

---

**Last Updated:** December 28, 2025
**System Version:** 2.0 (Unified Architecture)
