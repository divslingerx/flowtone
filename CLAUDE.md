# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flowtone is a web-based visual audio programming interface - essentially a modular synthesizer in the browser. Users create audio processing pipelines by dragging and connecting nodes in a visual workflow.

## Build Commands

```bash
pnpm dev        # Start Vite dev server
pnpm build      # TypeScript check + production build
pnpm lint       # Run ESLint
pnpm preview    # Preview production build
```

No test runner is currently configured. Package manager is `pnpm`.

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
- `triggerNote(id, note)` - Triggers oscillators for playback

The AudioEngine is created in both `main.tsx` and `App.tsx` - this may need refactoring to ensure singleton behavior.

### Type System Architecture

Two type systems currently exist (migration in progress):

**types.ts (v1)**: Uses advanced TypeScript generics to extract ALL Tone.js classes:
```typescript
type ExtractClassKeysReturningType<T, ReturnType, BaseClass>
```
This generates compile-time safety for 80+ Tone.js node types without manual typing. Each node has a distinct type like `OmniOscillatorNodeType`.

**types2.ts (v2)**: Simplified system using `ToneComponent<T>` generic with `ConstructorParameters`. Migration to v2 appears to be in progress.

**Node type definitions**: Use the union type `AppNode` which includes all possible node types.

### Node Registration

Nodes are registered in two places:
- `src/nodes/index.ts` - `nodeTypes` object for React Flow
- `src/nodes/tone/toneRegistry.ts` - Registry for Tone.js nodes (newer system)

When creating new nodes, add to both registries.

## Data Flow Patterns

### Creating a Node
1. User interaction (e.g., AddComponentNode button)
2. `store.createNode(type)` called
3. AudioEngine creates Tone.js instance
4. Visual node added to Zustand store
5. React Flow renders node component
6. Component calls `useToneNode` hook (auto-disposes on unmount)

### Connecting Nodes
1. User drags edge in React Flow
2. `onConnect` callback triggered
3. `audioEngine.connectNodes(source, target)` creates audio connection
4. Visual edge added to store
5. React Flow renders edge

### Updating Parameters
1. User changes knob/slider
2. `updateNodeData(id, { param: value })` updates visual state
3. `audioEngine.updateNodeParams(id, params)` updates `Tone.Param`
4. React re-renders with new value

### MIDI Flow
MIDI Device → `@react-midi/hooks` → `MidiInputNode` → AudioEngine → Tone.js nodes

## Creating New Audio Nodes

To implement a new Tone.js node (e.g., Reverb):

1. **Type already exists** in `src/nodes/types.ts` (all 80+ Tone.js types pre-defined)

2. **Create React component** in appropriate folder:
   ```tsx
   // src/nodes/tone/effect-nodes/ReverbNode.tsx
   import { useToneNode } from '~/hooks/useToneNode';
   import { Handle, Position } from '@xyflow/react';

   export function ReverbNode({ data, id }: NodeProps<ReverbNodeType>) {
     const reverb = useToneNode(data.type, data.config);
     const { updateNodeData } = useRFStore();

     return (
       <div>
         <Handle type="target" position={Position.Top} />
         {/* UI controls - use .nodrag class on interactive elements */}
         <Handle type="source" position={Position.Bottom} />
       </div>
     );
   }
   ```

3. **Register in** `src/nodes/index.ts`:
   ```ts
   import { ReverbNode } from './tone/effect-nodes/ReverbNode';

   export const nodeTypes = {
     Reverb: ReverbNode,
     // ...
   };
   ```

4. **Add to toneRegistry** (if using new system) in `src/nodes/tone/toneRegistry.ts`

## Key Implementation Patterns

### Use useToneNode Hook
Located in `src/hooks/useToneNode.ts`. This hook:
- Creates Tone.js instances with proper cleanup
- Automatically calls `.dispose()` on unmount
- Provides type-safe config passing

### Interactive Elements in Nodes
Add `.nodrag` class to prevent React Flow from intercepting drag events:
```tsx
<Knob className="nodrag" onChange={handleChange} />
```

### Audio Parameter Scaling
Use `NormalisableRange` from `src/lib/NormalisableRange.ts` for logarithmic parameters (frequency, etc.):
```tsx
const range = new NormalisableRange(20, 20000, 1000, 0.3, false);
const normalised = range.convertTo0to1(440); // Hz to 0-1
const hz = range.convertFrom0to1(normalised); // 0-1 to Hz
```

### Parameter Updates Must Sync Both States
```tsx
const handleChange = (value: number) => {
  // Update visual state
  updateNodeData(id, { frequency: value });

  // Update audio state
  audioEngine.updateNodeParams(id, { frequency: value });
};
```

## Project Structure Reference

```
/src
├── store/
│   ├── store.ts           # Zustand store with nodes/edges/actions
│   ├── audioEngine.ts     # AudioEngine facade over Tone.js
│   └── audioContext.ts    # React context for AudioEngine
├── nodes/
│   ├── types.ts           # Type system v1 (current)
│   ├── types2.ts          # Type system v2 (migration target)
│   ├── index.ts           # Node registry for React Flow
│   ├── MidiInputNode.tsx
│   ├── MidiPianoNode.tsx
│   ├── AddComponentNode.tsx
│   └── tone/
│       ├── source-nodes/      # Oscillators, LFO
│       ├── component-nodes/   # Filters, Envelopes, Channel
│       ├── instrument-nodes/  # Synths
│       ├── effect-nodes/      # Reverb, Delay, etc.
│       └── toneRegistry.ts
├── hooks/
│   └── useToneNode.ts     # Tone.js lifecycle hook
├── components/
│   └── knob/              # Rotary knob UI controls
└── lib/
    ├── utils.ts           # Tailwind class utilities
    └── NormalisableRange.ts  # Audio parameter scaling
```

## Important Technical Notes

### Vite Configuration
- Path alias: `~/` → `./src/`
- Import using: `import { foo } from '~/components/foo'`

### TypeScript Strictness
- Strict mode enabled
- `noUncheckedIndexedAccess: true` - array access may be `undefined`

### Initial Demo Graph
`src/nodes/index.ts` contains hardcoded `initialNodes` and `initialEdges` for demo purposes. These create an example audio graph on load.

### Tone.js Parameter Handling
The AudioEngine differentiates between:
- `Tone.Param` objects (frequency, detune, etc.) - require `.value` setter
- Regular properties (type, count, etc.) - direct assignment

### MIDI Integration
Uses `@react-midi/hooks` for Web MIDI API access. `useMIDINote()` hook provides MIDI note data in `MidiInputNode.tsx`.

## Current Implementation Status

**Fully implemented** (6 nodes):
- MidiInputNode, MidiPianoNode
- OmniOscillator
- AmplitudeEnvelope, FrequencyEnvelope
- Filter, Channel, Panner

**Type definitions only** (80+ nodes):
All Tone.js sources, instruments, effects, and components have TypeScript types defined but need UI implementation.

## Known Issues / Areas to Be Aware Of

- **AudioEngine created twice**: Once in `main.tsx`, once in `App.tsx` - verify singleton behavior
- **Two type systems**: Migration from `types.ts` to `types2.ts` in progress
- **Two node registries**: `nodeTypes` and `toneRegistry` - consolidation needed
- Some nodes have duplicate entries in README (e.g., "AmplitudeEnvelope" appears twice)
