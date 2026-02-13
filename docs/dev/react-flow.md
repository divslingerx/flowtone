# React Flow Integration

This document describes how Flowtone integrates with the `@xyflow/react` library to provide the visual node graph canvas.

---

## React Flow Setup

The `<ReactFlow>` component is configured in `src/App.tsx`. It receives nodes, edges, change handlers, and the registered type maps:

```tsx
// src/App.tsx
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={addEdge}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  onClick={toggleAudio}
  fitView
  maxZoom={1.5}
>
  <Background />
  <MiniMap />
  <Controls />
</ReactFlow>
```

Key configuration:

- **`nodeTypes`** -- Imported from `src/nodes/index.ts`. Maps type strings to React components (see [Node Types Registry](#node-types-registry) below).
- **`edgeTypes`** -- Imported from `src/edges/index.ts`. Currently empty; all edges use the React Flow default edge renderer.
- **`fitView`** -- Automatically zooms/pans to fit all nodes on initial render.
- **`maxZoom`** -- Capped at `1.5` to prevent excessive zoom.
- **`onClick`** -- Toggles the Tone.js audio context between `suspended` and `running`. This is a workaround for browser autoplay policies that require user interaction before audio can start.
- **`<Background />`** -- Renders the dot grid background.
- **`<MiniMap />`** -- Renders the overview minimap in the corner.
- **`<Controls />`** -- Renders zoom/fit-view control buttons.

State is pulled from the Zustand store via a shallow-compared selector to minimize re-renders:

```tsx
// src/App.tsx
const selector = (store: RFStore) => ({
  nodes: store.nodes,
  edges: store.edges,
  onNodesChange: store.onNodesChange,
  onEdgesChange: store.onEdgesChange,
  addEdge: store.addEdge,
});

const { addEdge, nodes, edges, onEdgesChange, onNodesChange } = useRFStore(
  selector,
  shallow
);
```

---

## ReactFlowProvider

React Flow requires a `ReactFlowProvider` ancestor for hooks like `useReactFlow()` to function. This is set up in `src/main.tsx`:

```tsx
// src/main.tsx
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MIDIProvider>
      <AudioEngineContext.Provider value={audioEngine}>
        <div style={{ width: "100vw", height: "100vh" }}>
          <ReactFlowProvider>
            <App />
          </ReactFlowProvider>
        </div>
      </AudioEngineContext.Provider>
    </MIDIProvider>
  </React.StrictMode>
);
```

The provider hierarchy from outermost to innermost is:

1. `React.StrictMode` -- development checks
2. `MIDIProvider` -- Web MIDI API access (`@react-midi/hooks`)
3. `AudioEngineContext.Provider` -- singleton `AudioEngine` instance
4. `ReactFlowProvider` -- React Flow context for internal hooks

The `AudioEngine` singleton is created at module scope in `main.tsx` and injected into both the Zustand store (via `setAudioEngine`) and React context (via `AudioEngineContext.Provider`) before the app renders.

---

## Node Changes

The `onNodesChange` handler in the Zustand store processes all React Flow node change events (dragging, selecting, removing, resizing, etc.) by delegating to `applyNodeChanges`:

```tsx
// src/store/store.ts
onNodesChange: (changes) => {
  set({
    nodes: applyNodeChanges(changes, get().nodes),
  });
},
```

`applyNodeChanges` is a utility from `@xyflow/react` that immutably applies an array of change objects to the nodes array. Change types include `position`, `select`, `remove`, `dimensions`, `add`, and `reset`.

**Current limitation:** The `onNodesChange` handler does not intercept `remove` changes to dispose of audio nodes. When a node is deleted from the canvas, its visual representation is removed but the corresponding Tone.js audio node is not explicitly disposed. Audio node cleanup currently relies on the `useToneNode` hook's `useEffect` cleanup, which calls `.dispose()` on the Tone.js instance when the React component unmounts.

---

## Edge Changes

The `onEdgesChange` handler synchronizes edge removals with the audio graph. When React Flow reports edge removal events, the handler looks up the affected edge and disconnects the corresponding audio nodes before updating visual state:

```tsx
// src/store/store.ts
onEdgesChange: (changes) => {
  const { audioEngine, edges } = get();

  // Handle edge deletions - disconnect audio
  if (audioEngine) {
    for (const change of changes) {
      if (change.type === "remove") {
        const edge = edges.find((e) => e.id === change.id);
        if (edge) {
          try {
            audioEngine.disconnectNodes(edge.source, edge.target);
          } catch (error) {
            console.warn(
              `Failed to disconnect audio for edge ${change.id}:`,
              error
            );
          }
        }
      }
    }
  }

  set({
    edges: applyEdgeChanges(changes, edges),
  });
},
```

The pattern is:

1. Iterate over all changes, filtering for `type === "remove"`.
2. Find the corresponding edge in current state to get `source` and `target` IDs.
3. Call `audioEngine.disconnectNodes(source, target)` to sever the Tone.js audio connection.
4. Apply all changes (including non-removal changes like selection) to the visual edge array.

Errors during audio disconnection are caught and logged as warnings rather than blocking the visual update.

---

## Connection Handling

When the user drags a cable from one handle to another, React Flow calls the `onConnect` callback. App.tsx passes `store.addEdge` for this:

```tsx
// src/App.tsx
<ReactFlow onConnect={addEdge} ... />
```

The store's `addEdge` creates a visual edge with a generated ID:

```tsx
// src/store/store.ts
addEdge: (data) => {
  const id = nanoid(6);
  const edge = { id, ...data };
  set({ edges: [edge, ...get().edges] });
},
```

The store also defines an `onConnect` method that handles both audio and visual connection in one step:

```tsx
// src/store/store.ts
onConnect: (connection) => {
  const { audioEngine } = get();

  try {
    // Create audio connection
    if (audioEngine && connection.source && connection.target) {
      audioEngine.connectNodes(connection.source, connection.target);
    }

    // Update store state
    set({
      edges: addEdge(connection, get().edges),
    });
  } catch (error) {
    console.error("Failed to connect nodes:", error);
    throw error;
  }
},
```

Note that `store.onConnect` calls `audioEngine.connectNodes()` and then uses `@xyflow/react`'s `addEdge` utility (imported at the top of store.ts) to create the visual edge. This is the handler that performs full dual-state synchronization. The simpler `store.addEdge` currently used in `App.tsx` only creates the visual edge.

### Connection Validation

A validation system exists in `src/validation/connectionValidation.ts` that can validate connections based on port signal types (audio, control, MIDI, trigger), prevent self-connections, detect duplicate edges, and check for feedback cycles using DFS. The module exports factory functions for different strictness levels:

- `createStrictValidator` -- enforces port type compatibility and cycle prevention
- `createPermissiveValidator` -- only prevents self-connections and duplicates
- `createNoCycleValidator` -- allows any type pairing but prevents feedback loops

These validators are not currently wired into the `onConnect` flow in `App.tsx` but are available for integration.

---

## Initial Nodes and Edges

The default graph is defined across two files and loaded into the Zustand store as initial state.

### Initial Nodes

Defined in `src/nodes/index.ts` as `initialNodes`. The default graph pre-loads seven nodes:

| ID  | Type                  | Purpose                        |
|-----|-----------------------|--------------------------------|
| `p` | `MidiPiano`           | On-screen piano for MIDI input |
| `a` | `Midi`                | Hardware MIDI input device      |
| `b` | `OmniOscillator`      | Audio source oscillator         |
| `c` | `AmplitudeEnvelope`   | Volume envelope shaping         |
| `d` | `Filter`              | Frequency filter                |
| `e` | `FrequencyEnvelope`   | Filter cutoff envelope          |
| `f` | `Channel`             | Output channel strip            |
| `g` | `StoreNode`           | Node catalog (add components)   |

Each node definition includes an `id`, `type` (matching a key in `nodeTypes`), `position` (canvas coordinates), and `data` with configuration:

```tsx
// src/nodes/index.ts
{
  id: "b",
  type: "OmniOscillator",
  position: { x: 600, y: 0 },
  data: {
    label: "OmniOscillator",
    type: "OmniOscillator",
    package: "Tone" as const,
    config: {
      detune: 0,
      mute: false,
      frequency: 440,
      type: "sine",
    },
  },
},
```

### Initial Edges

Defined in `src/edges/index.ts` as `initialEdges`. These wire up a basic subtractive synthesis signal chain:

```tsx
// src/edges/index.ts
export const initialEdges: Edge[] = [
  // MIDI Input -> OmniOscillator
  { id: "a-b", source: "a", target: "b" },
  // OmniOscillator -> AmplitudeEnvelope
  { id: "b-c", source: "b", target: "c" },
  // AmplitudeEnvelope -> Filter (targeting input handle)
  { id: "c-d", source: "c", target: "d", targetHandle: "input" },
  // FrequencyEnvelope -> Filter frequency param
  {
    id: "e-d-frequency",
    source: "e",
    target: "d",
    targetHandle: "frequency",
    label: "frequency",
  },
  // Filter -> Channel (from output handle)
  { id: "d-f", source: "d", sourceHandle: "output", target: "f" },
];
```

Notable details:

- Some edges target specific handles (`targetHandle: "input"`, `targetHandle: "frequency"`) rather than using default connections. This allows routing to specific parameters on multi-input nodes.
- The `sourceHandle: "output"` on the Filter-to-Channel edge explicitly selects the output port.
- The FrequencyEnvelope-to-Filter edge includes a `label` property so the connection displays "frequency" on the canvas.

The resulting signal flow is: MIDI -> Oscillator -> Amplitude Envelope -> Filter -> Channel (output), with a FrequencyEnvelope modulating the Filter's cutoff frequency.

Both arrays are consumed by the Zustand store as initial state:

```tsx
// src/store/store.ts
nodes: initialNodes,
edges: initialEdges,
```

---

## Edge System

### Edge Types

The `edgeTypes` object is defined in `src/edges/index.ts`:

```tsx
// src/edges/index.ts
export const edgeTypes = {
  // Add your custom edge types here!
} satisfies EdgeTypes;
```

Currently empty -- all edges render with React Flow's built-in default edge. Custom edge types (e.g., animated audio cables, color-coded signal-type edges) can be added here by mapping type strings to custom React components, following the same pattern as `nodeTypes`.

### Handle Targeting

Edges can optionally specify `sourceHandle` and `targetHandle` to connect to specific ports on a node. When omitted, React Flow connects to the default (first) handle. Handle IDs are generated by the `DynamicHandles` component based on the port registry and follow the format used by `parseHandleId()` in `src/ports/types.ts`.

---

## Node Types Registry

The `nodeTypes` object in `src/nodes/index.ts` maps type identifier strings to React components. React Flow uses this map to render the correct component for each node based on the node's `type` field:

```tsx
// src/nodes/index.ts
export const nodeTypes = {
  // Utility Nodes
  Midi: MidiInputNode,
  MidiPiano: MidiPianoNode,
  StoreNode: AddComponentNode,

  // Source Nodes
  OmniOscillator: OmniOscillatorNode,
  Oscillator: OscillatorNode,
  AMOscillator: AMOscillatorNode,
  FMOscillator: FMOscillatorNode,
  FatOscillator: FatOscillatorNode,
  PWMOscillator: PWMOscillatorNode,
  PulseOscillator: PulseOscillatorNode,
  LFO: LFONode,
  Player: PlayerNode,
  GrainPlayer: GrainPlayerNode,

  // Instrument Nodes
  Synth: SynthNode,
  MonoSynth: MonoSynthNode,
  AMSynth: AMSynthNode,
  FMSynth: FMSynthNode,
  DuoSynth: DuoSynthNode,
  PolySynth: PolySynthNode,

  // Effect Nodes
  Filter: FilterNode,
  Reverb: ReverbNode,
  // ... 17 more effect nodes
  Compressor: CompressorNode,

  // Component Nodes
  AmplitudeEnvelope: AmplitudeEnvelopeNode,
  FrequencyEnvelope: FrequencyEnvelopeNode,
  // ... 10 more component nodes
  Waveform: WaveformNode,
} satisfies NodeTypes;
```

The object uses `satisfies NodeTypes` to ensure type compatibility with React Flow while preserving the specific key literal types for TypeScript inference.

When creating a new node (either programmatically or via drag-and-drop), the `type` field in the node data must match one of these keys exactly. React Flow looks up the component from this map and renders it at the node's position. If no matching key is found, React Flow falls back to a default node renderer.

The registry is organized into four categories:

| Category      | Count | Examples                                |
|---------------|-------|-----------------------------------------|
| Utility       | 3     | `Midi`, `MidiPiano`, `StoreNode`        |
| Source        | 10    | `OmniOscillator`, `LFO`, `GrainPlayer`  |
| Instrument    | 6     | `Synth`, `FMSynth`, `PolySynth`         |
| Effect        | 20    | `Reverb`, `Chorus`, `PitchShift`         |
| Component     | 12    | `Channel`, `AmplitudeEnvelope`, `FFT`    |

To add a new node type, import the component and add a key-value pair to this object. The key becomes the `type` string used in node data and the node catalog.
