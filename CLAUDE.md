# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flowtone is a web-based visual audio programming interface - a modular synthesizer in the browser. Users create audio processing pipelines by dragging and connecting nodes in a visual workflow.

## Build Commands

```bash
pnpm dev        # Start Vite dev server
pnpm build      # TypeScript check + production build
pnpm lint       # Run ESLint
pnpm preview    # Preview production build
```

Package manager is `pnpm`. Vitest is installed as a dev dependency but not yet configured with project tests.

## Core Architecture

### Dual State System

The application maintains two parallel state systems that must stay synchronized:

1. **Visual State (Zustand)**: React Flow nodes/edges, positions, UI data
   - Location: `src/store/store.ts`
   - Manages `nodes` array and `edges` array

2. **Audio State (AudioEngine)**: Actual Tone.js audio graph
   - Location: `src/store/audioEngine.ts`
   - Manages `Map<id, ToneAudioNode>` and audio connections

**Critical**: When modifying node operations, update BOTH states. Actions like `createNode`, `updateNodeData`, `onConnect` in the store handle this synchronization.

### AudioEngine Class

The `AudioEngine` is a facade over Tone.js located in `src/store/audioEngine.ts`:

- `createNode(id, type)` - Instantiates Tone.js audio nodes
- `connectNodes(source, target)` - Manages audio graph routing (separate from visual edges)
- `updateNodeParams(id, params)` - Updates audio parameters (handles `Tone.Param` vs regular properties)
- `handleMIDINote(id, note)` - Routes MIDI to audio nodes

### Type System

**Current system (types3.ts)**: Uses discriminated unions with `kind` field:
- `"atomic"` - Single Tone.js wrapper node
- `"composite"` - User-created presets (not yet implemented)
- `"utility"` - MIDI and other non-Tone nodes

Uses advanced TypeScript generics to extract 80+ Tone.js class types automatically:
```typescript
type ExtractClassesReturningType<T, ReturnType, BaseClass>
```

The `AppNode` union type includes all possible node types.

### Node Registration

Nodes are registered in:
- `src/nodes/index.ts` - `nodeTypes` object for React Flow (50+ nodes implemented)
- `src/ports/registry.ts` - Port configurations for connection handling

## Creating New Audio Nodes

Use the template at `src/nodes/tone/NODE_TEMPLATE.tsx` as a starting point:

1. **Copy template** to appropriate folder (`source-nodes/`, `effect-nodes/`, `instrument-nodes/`, or `component-nodes/`)
2. **Replace placeholders** (`NODE_NAME`, `NODE_TYPE`, `TONE_TYPE`) with actual values
3. **Register in** `src/nodes/index.ts` - add import and entry to `nodeTypes` object
4. **Add port config** in `src/ports/registry.ts` using helpers like `createSinglePortConfig("audio")`
5. **Optional**: Add parameter metadata overrides in `src/lib/parameters/metadata.ts`

## Auto-Generation Systems

### Parameter Controls (AutoNodeControls)

Located in `src/components/auto-controls/`. Automatically generates UI controls:

1. Fetches Tone.js defaults via `ToneClass.getDefaults()`
2. Looks up control type in `src/lib/parameters/metadata.ts`:
   - `PARAMETER_DEFAULTS` - Maps parameter names to control types
   - `NODE_METADATA` - Node-specific overrides, ordering, grouping
3. Renders appropriate knob variant (frequency, time, normalized, Q, etc.)

### Dynamic Handles (DynamicHandles)

Located in `src/components/handles/`. Auto-generates React Flow handles based on port config:
- Color-coded by signal type: green=audio, blue=control, purple=MIDI, orange=trigger
- Positions determined by port registry

### Knob Variants

Available in `src/components/knob/knob-variants.tsx`:
- `KnobFrequency` - Logarithmic 20Hz-20kHz
- `KnobTime` - Logarithmic milliseconds to seconds
- `KnobNormalized` - Linear 0-1
- `KnobQ` - Logarithmic resonance
- `KnobDetune` - Linear cents
- `KnobRatio` - Compressor ratio
- `KnobGain` - Linear gain

## Port System

Located in `src/ports/`:

**Signal Types**: `"audio" | "control" | "midi" | "trigger"`

**Port Config Helpers**:
- `createSinglePortConfig("audio")` - Standard in/out
- `createSourcePortConfig("audio")` - Source nodes (no input)
- `createMergePortConfig(2)` - Multi-input nodes
- `createSplitPortConfig(2)` - Multi-output nodes

**Connection Validation**: `src/validation/connectionValidation.ts` - Validates connections based on port signal types

## Key Implementation Patterns

### useToneNode Hook
Located in `src/hooks/useToneNode.ts`:
- Creates Tone.js instances with proper cleanup
- Automatically calls `.dispose()` on unmount
- Provides type-safe config passing

### Interactive Elements in Nodes
Add `.nodrag` class to prevent React Flow from intercepting drag events:
```tsx
<div className="nodrag">
  <Knob onChange={handleChange} />
</div>
```

### Audio Parameter Scaling
Use `NormalisableRange` from `src/lib/NormalisableRange.ts` for logarithmic parameters:
```tsx
const range = new NormalisableRange(20, 20000, 1000, 0.3, false);
const normalised = range.convertTo0to1(440); // Hz to 0-1
const hz = range.convertFrom0to1(normalised); // 0-1 to Hz
```

### Manual Parameter Updates (when not using AutoNodeControls)
```tsx
const handleChange = (value: number) => {
  updateNodeData(id, { frequency: value });           // Visual state
  audioEngine.updateNodeParams(id, { frequency: value }); // Audio state
};
```

## Important Technical Notes

### Vite Configuration
- Path alias: `~/` → `./src/`
- Import using: `import { foo } from '~/components/foo'`

### TypeScript Strictness
- Strict mode enabled
- `noUncheckedIndexedAccess: true` - array access may be `undefined`

### Tone.js Parameter Handling
The AudioEngine differentiates between:
- `Tone.Param` objects (frequency, detune, etc.) - require `.value` setter
- Regular properties (type, count, etc.) - direct assignment

### Continuous Sources
Oscillators and LFO must call `.start()` - typically done in `useEffect` after creation.

### MIDI Integration
Uses `@react-midi/hooks` for Web MIDI API access. `useMIDINote()` hook provides MIDI note data in `MidiInputNode.tsx`.

## Project Structure

```
/src
├── store/
│   ├── store.ts           # Zustand store with nodes/edges/actions
│   ├── audioEngine.ts     # AudioEngine facade over Tone.js
│   └── audioContext.ts    # React context for AudioEngine
├── nodes/
│   ├── types3.ts          # Current type system (discriminated unions)
│   ├── index.ts           # Node registry for React Flow
│   └── tone/
│       ├── source-nodes/      # Oscillators, LFO, Players
│       ├── instrument-nodes/  # Synths
│       ├── effect-nodes/      # Reverb, Delay, Chorus, etc.
│       └── component-nodes/   # Channel, Envelopes, Filters
├── ports/
│   ├── types.ts           # Port type definitions
│   └── registry.ts        # Port configs for all node types
├── components/
│   ├── auto-controls/     # Auto-generated parameter controls
│   ├── handles/           # DynamicHandles component
│   ├── knob/              # Knob variants for different param types
│   └── node-catalog/      # Sidebar node browser
├── hooks/
│   └── useToneNode.ts     # Tone.js lifecycle hook
├── lib/
│   ├── parameters/        # Parameter metadata registry
│   └── NormalisableRange.ts
└── validation/
    └── connectionValidation.ts
```

## Current Implementation Status

50 nodes registered in `src/nodes/index.ts`:
- 3 utility (MIDI input, MIDI piano, node catalog)
- 10 source (oscillators, LFO, players)
- 6 instrument (synths)
- 18 effect (reverbs, delays, modulation, distortion)
- 13 component (envelopes, channel strips, analysis)

Most nodes use `AutoNodeControls` for automatic UI generation.

## Known Issues

- **AudioEngine created twice**: Once in `main.tsx`, once in `App.tsx` - may need singleton refactoring
- **Legacy type files**: `types.ts` and `types2.ts` exist but `types3.ts` is current
