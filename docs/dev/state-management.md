# State Management & AudioEngine

Flowtone maintains two parallel state systems -- a visual state managed by Zustand (driving the React Flow canvas) and an audio state managed by the `AudioEngine` class (driving the Tone.js audio graph). Every mutation that affects an audio node must update both systems in lockstep.

---

## 1. Zustand Store

**File:** `src/store/store.ts`

### Store Shape

```typescript
export interface RFStore {
  nodes: AppNode[];
  edges: Edge[];
  audioEngine: AudioEngine | null;

  getNode: (id: string) => AppNode;
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: AppNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: <T extends AppNode>(id: string, data: Partial<T["data"]>) => void;
  addEdge: (data: Omit<Edge, "id">) => void;
  createNode: (type: ToneComponentKey) => void;
  setAudioEngine: (engine: AudioEngine) => void;
}
```

The store is created with `createWithEqualityFn` from `zustand/traditional` and wrapped in the `devtools` middleware for Redux DevTools integration:

```typescript
export const useRFStore = createWithEqualityFn(
  devtools<RFStore>((set, get) => ({
    nodes: initialNodes,
    edges: initialEdges,
    audioEngine: null,
    // ...actions
  }))
);
```

### Actions

| Action | Purpose |
|---|---|
| `setAudioEngine(engine)` | Injects the AudioEngine singleton into the store. Called once at startup. |
| `getNode(id)` | Retrieves a node by ID from the `nodes` array. Throws if not found. |
| `onNodesChange(changes)` | Delegates to React Flow's `applyNodeChanges` to handle drag, select, remove, etc. |
| `onEdgesChange(changes)` | Applies edge changes and disconnects audio for any removed edges. |
| `onConnect(connection)` | Creates both a visual edge and an audio connection. |
| `setNodes(nodes)` / `setEdges(edges)` | Direct state replacements. |
| `addEdge(data)` | Adds a visual edge with an auto-generated `nanoid`. |
| `createNode(type)` | Creates both a Tone.js audio node and a React Flow visual node. |
| `updateNodeData(id, data)` | Updates both the audio parameters and the visual node data. |

### React Flow Event Handling

The `onNodesChange`, `onEdgesChange`, and `onConnect` callbacks are passed directly to the `<ReactFlow>` component in `App.tsx`:

```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={addEdge}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
/>
```

React Flow emits change objects (e.g., `{ type: "position", id, position }` for drag, `{ type: "remove", id }` for deletion) and the store applies them with the built-in `applyNodeChanges` / `applyEdgeChanges` helpers.

---

## 2. AudioEngine Class

**File:** `src/store/audioEngine.ts`

The `AudioEngine` is a facade over Tone.js. It owns two maps:

```typescript
export class AudioEngine {
  private nodes: Map<string, InstanceType<typeof Tone.ToneAudioNode>> = new Map();
  private connections: Map<string, string[]> = new Map();
  // ...
}
```

- `nodes` maps node IDs to live Tone.js instances (Oscillator, Filter, Reverb, etc.).
- `connections` tracks the audio graph topology as an adjacency list (source ID to array of target IDs).

### Methods

**`createNode(id, type)`** -- Instantiates a Tone.js class by looking it up on the `Tone` namespace and stores it in the map:

```typescript
createNode<T extends ToneComponentKey>(id: string, type: T): InstanceType<(typeof Tone)[T]> {
  const ToneClass = Tone[type];
  if (!ToneClass || typeof ToneClass !== "function") {
    throw new Error(`Unknown or invalid Tone component type: ${type}`);
  }
  const node = new (ToneClass as unknown as new (...) => ...)();
  this.nodes.set(id, node);
  return node;
}
```

**`connectNodes(sourceId, targetId)`** -- Wires two Tone.js nodes together with `.connect()` and records the connection:

```typescript
connectNodes(sourceId: string, targetId: string): void {
  const source = this.nodes.get(sourceId);
  const target = this.nodes.get(targetId);
  if (!source || !target) {
    throw new Error("Invalid node IDs for connection");
  }
  source.connect(target);
  const existing = this.connections.get(sourceId) || [];
  this.connections.set(sourceId, [...existing, targetId]);
}
```

**`disconnectNodes(sourceId, targetId)`** -- Calls `.disconnect()` on the source node and removes the entry from the connections map. Fails silently if either node is missing.

**`updateNodeParams(id, params)`** -- Iterates over a params object and applies each value to the corresponding property on the Tone.js instance. Differentiates between `Tone.Param` objects and regular properties (see Section 5 below).

**`getNode(id)`** -- Returns the raw Tone.js instance for a given ID, or `undefined`.

**`getConnections()`** -- Returns a shallow copy of the connections map.

**`triggerNote(id, midiNote?)`** -- For oscillator-type nodes: stops, optionally sets frequency from a MIDI note number, starts, and schedules a stop after 1 second via `Tone.Transport.scheduleOnce`.

**`handleMIDINote(id, midiNote)`** -- Routes a MIDI note event to the appropriate node. Converts MIDI note number to frequency with `Tone.Frequency(note, "midi").toFrequency()`, then either triggers an oscillator or updates a filter's frequency.

---

## 3. AudioEngine Context

**File:** `src/store/audioContext.ts`

The AudioEngine is made available to React components through a standard React Context:

```typescript
export const AudioEngineContext = createContext<AudioEngine | null>(null);

export function useAudioEngine(): AudioEngine {
  const engine = useContext(AudioEngineContext);
  if (!engine) {
    throw new Error("useAudioEngine must be used within AudioEngineContext.Provider");
  }
  return engine;
}

export function useAudioEngineOptional(): AudioEngine | null {
  return useContext(AudioEngineContext);
}
```

Two hooks are provided:

- `useAudioEngine()` -- Throws if the context is missing. Use this in components that cannot function without audio.
- `useAudioEngineOptional()` -- Returns `null` if the engine is not yet available. Use this in components that may render before initialization completes.

### Initialization in main.tsx

The AudioEngine singleton is created at the module level in `main.tsx`, injected into both the Zustand store and the React context:

```typescript
// src/main.tsx

// Create the singleton AudioEngine instance
const audioEngine = new AudioEngine();

// Inject into Zustand store (so store actions can call engine methods)
useRFStore.getState().setAudioEngine(audioEngine);

// Provide via React Context (so components can access it directly)
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

This dual injection means the AudioEngine is accessible from:
1. **Store actions** via `get().audioEngine` -- used by `createNode`, `updateNodeData`, `onConnect`, `onEdgesChange`.
2. **React components** via `useAudioEngine()` -- used by `AutoNodeControls`, `App.tsx`, and individual node components.

---

## 4. State Synchronization

The critical invariant: **every operation that affects an audio node must update both the visual state (Zustand) and the audio state (AudioEngine).** If only one is updated, the UI and audio graph will drift apart.

### createNode

When a new node is created, the store action first instantiates the Tone.js node via AudioEngine, then extracts its default parameters and adds a visual node to the React Flow array:

```typescript
createNode<T extends ToneComponentKey>(type: T) {
  const { audioEngine } = get();
  if (!audioEngine) return;

  const id = nanoid();

  // 1. Audio state: create Tone.js instance
  const node = audioEngine.createNode(id, type);

  // 2. Extract defaults from the live instance
  const data = Object.fromEntries(
    Object.entries(node).filter(
      ([, value]) =>
        value instanceof Tone.Param ||
        typeof value === "number" ||
        typeof value === "string"
    )
  );

  // 3. Visual state: add React Flow node
  set({
    nodes: [
      ...get().nodes,
      { id, type, data: { ...data, label: type }, position: { x: 400, y: 0 } },
    ] as AppNode[],
  });
}
```

### onConnect

When the user draws an edge between two nodes, both the audio connection and the visual edge are created:

```typescript
onConnect: (connection) => {
  const { audioEngine } = get();

  // 1. Audio state: wire Tone.js nodes together
  if (audioEngine && connection.source && connection.target) {
    audioEngine.connectNodes(connection.source, connection.target);
  }

  // 2. Visual state: add edge to React Flow
  set({ edges: addEdge(connection, get().edges) });
}
```

### onEdgesChange (Deletion)

When edges are removed (user presses delete, or programmatic removal), the store intercepts `"remove"` changes to disconnect the audio before updating the visual state:

```typescript
onEdgesChange: (changes) => {
  const { audioEngine, edges } = get();

  if (audioEngine) {
    for (const change of changes) {
      if (change.type === "remove") {
        const edge = edges.find((e) => e.id === change.id);
        if (edge) {
          audioEngine.disconnectNodes(edge.source, edge.target);
        }
      }
    }
  }

  set({ edges: applyEdgeChanges(changes, edges) });
}
```

Note: The edge lookup happens against the current edges array *before* `applyEdgeChanges` removes them. This ordering is important -- after the changes are applied, the removed edge would no longer be in the array.

### updateNodeData

Parameter changes update both systems:

```typescript
updateNodeData: <NodeType extends AppNode>(id: string, data: Partial<NodeType["data"]>) => {
  const { audioEngine } = get();

  // 1. Audio state: push new values to Tone.js
  if (audioEngine) {
    audioEngine.updateNodeParams(id, data);
  }

  // 2. Visual state: merge into node's data object
  set({
    nodes: get().nodes.map((node) =>
      node.id === id
        ? ({ ...node, data: { ...node.data, ...data } } as NodeType)
        : node
    ),
  });
}
```

---

## 5. Parameter Update Flow

The full path of a parameter change from UI interaction to audible result:

```
User turns knob
  -> AutoNodeControls.handleParamChange(paramName, value)
    -> updateNodeData(nodeId, { [paramName]: value })    // React Flow state
    -> audioEngine.updateNodeParams(nodeId, { [paramName]: value })  // Tone.js
      -> Tone.Param.value = x   OR   node[key] = x
```

### AutoNodeControls as the Entry Point

The `AutoNodeControls` component (in `src/components/auto-controls/AutoNodeControls.tsx`) generates knobs and controls automatically from Tone.js defaults. When a control value changes, it updates both systems:

```typescript
const handleParamChange = (paramName: string, value: any) => {
  // Update React Flow state
  updateNodeData(nodeId, { [paramName]: value });

  // Update audio engine
  audioEngine?.updateNodeParams(nodeId, { [paramName]: value });
};
```

### Tone.Param vs Regular Properties

Inside `AudioEngine.updateNodeParams`, the engine must handle two categories of properties differently:

```typescript
updateNodeParams<T extends Record<string, unknown>>(id: string, params: T): void {
  const node = this.nodes.get(id);
  if (!node) return;

  Object.entries(params).forEach(([key, value]) => {
    const nodeAny = node as unknown as Record<string, unknown>;

    if (key in nodeAny) {
      const param = nodeAny[key];

      // Tone.Param objects (frequency, detune, gain, Q, etc.)
      // These are signal-rate parameters -- use the .value setter
      if (param instanceof Tone.Param) {
        param.value = value as number;
      }
      // Regular properties (type, count, oversample, etc.)
      // These are plain JS properties -- assign directly if writable
      else {
        const descriptor = Object.getOwnPropertyDescriptor(nodeAny, key);
        if (descriptor && descriptor.writable) {
          nodeAny[key] = value;
        }
      }
    }
  });
}
```

Why the distinction matters:

- **`Tone.Param`** objects (e.g., `oscillator.frequency`, `filter.Q`) are backed by Web Audio `AudioParam` instances. Assigning to `frequency` directly would replace the Param object itself. You must use `frequency.value = 440` to change the underlying audio parameter.
- **Regular properties** (e.g., `oscillator.type`, `bitCrusher.bits`) are plain JavaScript properties. These are set with direct assignment. The `Object.getOwnPropertyDescriptor` check ensures read-only or getter-only properties are not overwritten.

### Manual Parameter Updates

When a node component does not use `AutoNodeControls` and manages its own UI, the same dual-update pattern must be followed manually:

```typescript
const handleChange = (value: number) => {
  updateNodeData(id, { frequency: value });               // Visual state
  audioEngine.updateNodeParams(id, { frequency: value }); // Audio state
};
```

---

## 6. Audio Context Management

### Suspend and Resume

Browsers require a user gesture before audio can play. The `App.tsx` component handles this with a click handler on the React Flow canvas:

```typescript
const toggleAudio = () => {
  if (Tone.getContext().state === "suspended") {
    Tone.getContext().resume();
  } else {
    Tone.getContext().rawContext.suspend(0);
  }
};

// Applied to the ReactFlow canvas
<ReactFlow onClick={toggleAudio} ... />
```

Clicking the canvas resumes the Tone.js audio context if it is suspended, or suspends it if it is running. The `Tone.getContext()` call returns Tone.js's wrapper around the native `AudioContext`. The `.rawContext` accessor is used for suspend because Tone.js's context wrapper does not expose a direct `suspend()` method.

### Transport for Scheduling

The `AudioEngine.triggerNote` method uses `Tone.Transport` for time-based scheduling:

```typescript
triggerNote(id: string, midiNote?: { note: number; velocity: number }): void {
  const node = this.nodes.get(id);
  if (!node) return;

  if (node instanceof Tone.Oscillator || node instanceof Tone.OmniOscillator) {
    node.stop();

    if (midiNote) {
      const freq = Tone.Frequency(midiNote.note, "midi").toFrequency();
      node.frequency.value = freq;
    }

    node.start();

    // Schedule stop 1 second from now using Transport
    Tone.Transport.scheduleOnce(() => {
      node.stop();
    }, "+1");
  }
}
```

`Tone.Transport.scheduleOnce(callback, "+1")` schedules the callback to fire one second from the current transport time. This is preferred over `setTimeout` because it is synchronized to the audio clock and remains accurate even if the main thread is busy.

### Continuous Sources

Oscillator and LFO nodes must call `.start()` after creation. This is typically handled in the node component's `useEffect`:

```typescript
// src/nodes/tone/source-nodes/OscillatorNode.tsx
export function OscillatorNode({ data, id }: NodeProps<OscillatorNode>) {
  const oscillator = useToneNode(data.type, data.config);

  useEffect(() => {
    oscillator?.start();
  }, [oscillator]);

  // ...
}
```

The `useToneNode` hook (in `src/hooks/useToneNode.ts`) handles cleanup by calling `.dispose()` on unmount, which stops the source and releases Web Audio resources:

```typescript
return () => {
  if (nodeRef.current) {
    nodeRef.current.dispose();
    nodeRef.current = undefined;
  }
};
```
