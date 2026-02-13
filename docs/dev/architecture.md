# Architecture Overview

## Project Overview

Flowtone is a web-based visual audio programming interface -- a modular synthesizer in the browser. Users build audio processing pipelines by dragging nodes onto a canvas, connecting them with edges, and tweaking parameters in real time.

### Core Tech Stack

| Technology | Version | Role |
|---|---|---|
| React | 18.x | UI framework |
| @xyflow/react (React Flow) | 12.x | Node graph canvas, drag-and-drop, edges |
| Tone.js | 15.x | Web Audio abstraction (oscillators, effects, instruments) |
| Zustand | 5.x | Lightweight state management for the visual graph |
| Web MIDI API (`@react-midi/hooks`) | 2.x | MIDI input device integration |
| Tailwind CSS | 3.x | Utility-first styling |
| Vite | 6.x | Dev server and production bundler |
| TypeScript | 5.x | Strict type checking across the codebase |
| Vitest | 3.x | Test runner (installed, not yet broadly configured) |

---

## High-Level Architecture

Flowtone maintains **two parallel state systems** that must stay synchronized:

```
                    +--------------------------+
                    |       User Action        |
                    | (drag, connect, knob)    |
                    +------------+-------------+
                                 |
                  +--------------+--------------+
                  |                             |
         +-------v--------+          +---------v--------+
         |  Visual State   |          |   Audio State    |
         |  (Zustand)      |          |   (AudioEngine)  |
         |                 |          |                  |
         | - nodes[]       |          | - Map<id, node>  |
         | - edges[]       |          | - connections    |
         | - positions     |          | - Tone.js graph  |
         +--------+--------+          +---------+--------+
                  |                             |
         React Flow renders            Tone.js produces
         the visual canvas             audible output
```

### Visual State (Zustand Store)

Defined in `src/store/store.ts`. The `useRFStore` Zustand store holds:

- `nodes: AppNode[]` -- React Flow node objects with position, type, and data.
- `edges: Edge[]` -- connections between node handles on the canvas.
- Actions like `onNodesChange`, `onEdgesChange`, `onConnect`, `createNode`, `updateNodeData`.

This state drives what the user sees: node positions, labels, parameter values in the UI, and the visual wiring between nodes.

### Audio State (AudioEngine)

Defined in `src/store/audioEngine.ts`. The `AudioEngine` class manages:

- `Map<string, ToneAudioNode>` -- live Tone.js instances keyed by node ID.
- `Map<string, string[]>` -- audio connections (source ID to target IDs).
- Methods: `createNode()`, `connectNodes()`, `disconnectNodes()`, `updateNodeParams()`, `handleMIDINote()`.

This state drives what the user hears: actual Web Audio API nodes, their parameter values, and the audio routing graph.

### Why Both Exist

React Flow needs serializable, plain-object node data for rendering and layout. Tone.js needs live class instances with audio buffer chains. The two cannot share a single representation, so every user action that changes the audio graph must update both:

```typescript
// Example: updating a parameter touches both states
const handleChange = (value: number) => {
  updateNodeData(id, { frequency: value });                // Visual state
  audioEngine.updateNodeParams(id, { frequency: value });  // Audio state
};
```

Store actions like `onConnect` and `onEdgesChange` handle this synchronization internally. When an edge is added, the store calls `audioEngine.connectNodes()`. When an edge is removed, it calls `audioEngine.disconnectNodes()`.

### Initialization Flow

The `AudioEngine` singleton is created once in `src/main.tsx` and distributed two ways:

1. **React Context** -- `AudioEngineContext.Provider` wraps the app so components can call `useAudioEngine()`.
2. **Zustand injection** -- `useRFStore.getState().setAudioEngine(engine)` gives the store a reference so store actions can update audio state directly.

```typescript
// src/main.tsx
const audioEngine = new AudioEngine();
useRFStore.getState().setAudioEngine(audioEngine);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MIDIProvider>
      <AudioEngineContext.Provider value={audioEngine}>
        <ReactFlowProvider>
          <App />
        </ReactFlowProvider>
      </AudioEngineContext.Provider>
    </MIDIProvider>
  </React.StrictMode>
);
```

---

## Directory Structure

```
src/
├── store/                        # State management layer
│   ├── store.ts                  # Zustand store (nodes, edges, actions)
│   ├── audioEngine.ts            # AudioEngine class (Tone.js facade)
│   └── audioContext.ts           # React context + useAudioEngine hook
│
├── nodes/                        # Node definitions and registry
│   ├── index.ts                  # nodeTypes registry (50+ entries), initialNodes
│   ├── types3.ts                 # Current type system (discriminated unions)
│   ├── types.ts                  # Legacy types (superseded)
│   ├── types2.ts                 # Legacy types (superseded)
│   ├── MidiInputNode.tsx         # MIDI input utility node
│   ├── MidiPianoNode.tsx         # Virtual piano utility node
│   ├── AddComponentNode.tsx      # Node catalog utility node
│   └── tone/
│       ├── NODE_TEMPLATE.tsx     # Template for creating new nodes
│       ├── source-nodes/         # Oscillators, LFO, Player, GrainPlayer (10 nodes)
│       ├── instrument-nodes/     # Synth, MonoSynth, FMSynth, etc. (6 nodes)
│       ├── effect-nodes/         # Reverb, Delay, Chorus, Distortion, etc. (18 nodes)
│       └── component-nodes/      # Channel, Envelopes, Filter, Analyser, etc. (13 nodes)
│
├── ports/                        # Port and connection system
│   ├── types.ts                  # Port type definitions
│   └── registry.ts               # Port configs per node type
│
├── components/
│   ├── auto-controls/            # AutoNodeControls - auto-generated parameter UIs
│   ├── handles/                  # DynamicHandles - color-coded by signal type
│   ├── knob/                     # Knob variants (frequency, time, normalized, Q, etc.)
│   ├── node-catalog/             # Sidebar node browser for drag-and-drop creation
│   └── ui/                       # Shared UI primitives (shadcn)
│
├── hooks/
│   └── useToneNode.ts            # Lifecycle hook for Tone.js instances
│
├── lib/
│   ├── parameters/
│   │   └── metadata.ts           # Parameter display metadata and overrides
│   ├── NormalisableRange.ts      # Logarithmic/linear range mapping
│   └── utils.ts                  # General utilities
│
├── validation/
│   └── connectionValidation.ts   # Port signal type compatibility checks
│
├── test/                         # Test setup and utilities
│
├── edges/                        # Custom edge types for React Flow
│
├── main.tsx                      # Entry point, AudioEngine + provider tree
├── App.tsx                       # Root component, React Flow canvas setup
└── index.css                     # Global styles / Tailwind directives
```

### Key Directories Explained

**`store/`** -- The core of the dual state system. `store.ts` exports `useRFStore`, a Zustand store created with `createWithEqualityFn` and `devtools` middleware. `audioEngine.ts` exports the `AudioEngine` class. `audioContext.ts` provides React context so individual node components can access the engine.

**`nodes/`** -- Every node type has a React component registered in `nodeTypes` (in `index.ts`). Tone.js nodes live under `nodes/tone/`, organized by category. The type system in `types3.ts` uses discriminated unions with a `kind` field (`"atomic"`, `"composite"`, `"utility"`) and advanced generics to extract 80+ Tone.js class types automatically.

**`ports/`** -- Defines which ports each node type exposes (inputs/outputs) and their signal types (`"audio"`, `"control"`, `"midi"`, `"trigger"`). The `DynamicHandles` component reads this registry to render color-coded connection points.

**`components/auto-controls/`** -- The `AutoNodeControls` system inspects Tone.js defaults via `ToneClass.getDefaults()`, looks up metadata for control types, and renders the appropriate knob variant automatically. This eliminates hand-authored UI for most nodes.

**`lib/parameters/`** -- Contains `PARAMETER_DEFAULTS` (maps parameter names to control types) and `NODE_METADATA` (per-node overrides for ordering, grouping, and display).

---

## Build and Dev Commands

The package manager is **pnpm**. All scripts are defined in `package.json`:

```bash
pnpm dev          # Start Vite dev server (hot module replacement)
pnpm build        # Run tsc type checking, then Vite production build
pnpm lint         # ESLint across .ts and .tsx files
pnpm preview      # Serve the production build locally
pnpm test         # Run Vitest in watch mode
pnpm test:run     # Run Vitest once (CI-friendly)
pnpm test:coverage  # Run Vitest with coverage report
```

The `build` script runs `tsc && vite build`, so TypeScript errors will fail the build before bundling begins.

---

## TypeScript Configuration

The project uses strict TypeScript with several notable settings (from `tsconfig.json`):

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "strict": true,
    "noUncheckedIndexedAccess": true,  // Array/object index access may be undefined
    "checkJs": true,                    // Type-check .js files too
    "moduleResolution": "bundler",
    "jsx": "react-jsx",

    // Path alias
    "baseUrl": ".",
    "paths": {
      "~/*": ["./src/*"]
    }
  }
}
```

### Path Alias

All imports from `src/` use the `~/` prefix:

```typescript
import { useAudioEngine } from "~/store/audioContext";
import { KnobFrequency } from "~/components/knob/knob-variants";
```

This is configured in both `tsconfig.json` and the Vite config.

### `noUncheckedIndexedAccess`

With this enabled, indexing into arrays or objects produces `T | undefined` instead of `T`. Code must handle the `undefined` case explicitly:

```typescript
const node = nodes[0];  // Type: AppNode | undefined
if (node) {
  // safe to use node here
}
```

---

## Known Issues

### AudioEngine Created Twice

The `AudioEngine` is instantiated in `src/main.tsx` as a module-level singleton. In earlier iterations, a second instance was also created in `src/App.tsx`. The current code uses the singleton from `main.tsx` and passes it via context, but the pattern may benefit from a more explicit singleton guard to prevent accidental double-instantiation during refactoring.

### Legacy Type Files

Three type files exist in `src/nodes/`:

- `types.ts` -- original type system (superseded)
- `types2.ts` -- second iteration (superseded)
- `types3.ts` -- current system using discriminated unions with `kind` field

Only `types3.ts` should be used. The `AppNode` union type and `ToneComponentKey` extraction type are both defined there. The older files remain in the codebase but are not actively imported.
