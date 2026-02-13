# Node Catalog & Sidebar

The Node Catalog is a retractable sidebar that lets users browse, search, and add audio nodes to the canvas. It lives in `src/components/node-catalog/` and consists of five modules:

| File | Purpose |
|---|---|
| `NodeCatalog.tsx` | Top-level sidebar component |
| `CategorySection.tsx` | Collapsible category group |
| `NodeItem.tsx` | Individual draggable/double-clickable node entry |
| `nodeCategories.ts` | Category definitions, node metadata, search |
| `autoPlacement.ts` | Collision-aware auto-positioning algorithm |

---

## 1. NodeCatalog Component

`NodeCatalog` renders a fixed-position sidebar on the left side of the viewport with a glassmorphism design (semi-transparent background with `backdrop-blur-lg`). It respects light and dark mode via Tailwind's `dark:` variants.

### Toggle Behavior

A chevron button sits at the edge of the sidebar. Clicking it slides the panel in or out with a CSS `translate-x` transition (300ms ease-in-out). The sidebar is 280px wide.

### localStorage Persistence

Two pieces of UI state survive page reloads:

| Key | Type | Default |
|---|---|---|
| `flowtone-sidebar-open` | `"true" \| "false"` | `"true"` |
| `flowtone-collapsed-categories` | JSON array of `NodeCategory` strings | `[]` |

Both are read in `useState` initializers and written via `useEffect` watchers:

```tsx
const [isOpen, setIsOpen] = useState(() => {
  const stored = localStorage.getItem(STORAGE_KEY_SIDEBAR_OPEN);
  return stored !== null ? stored === "true" : true;
});
```

### Structure

The sidebar has three vertical sections:
1. **Header** -- title and search bar
2. **Categories list** -- scrollable area rendering `CategorySection` components
3. **Footer** -- total node count

---

## 2. Node Categories

Defined in `nodeCategories.ts`, the `NODE_CATEGORIES` array contains six category groups:

| Category ID | Label | Example Nodes |
|---|---|---|
| `sources` | Sources | Oscillator, LFO, Player |
| `instruments` | Instruments | Synth, PolySynth, FMSynth |
| `effects` | Effects | Reverb, Delay, Chorus, Compressor |
| `components` | Components | AmplitudeEnvelope, Channel, Meter |
| `midi` | MIDI | MIDI Input, MIDI Piano |
| `utilities` | Utilities | (reserved, currently empty) |

The `NodeCategory` type is a string union of these IDs.

### NodeDefinition Interface

Each node entry carries metadata used for display and search:

```ts
interface NodeDefinition {
  type: ToneComponentKey | "Midi" | "MidiPiano" | "StoreNode";
  label: string;
  description?: string;
  icon?: string;
  tags?: string[];
  featured?: boolean;
}
```

- `type` must match the key used in `nodeTypes` (the React Flow node registry in `src/nodes/index.ts`).
- `featured` nodes get a subtle ring highlight and a star indicator in the UI.
- `tags` are used exclusively for search filtering.

### Utility Functions

```ts
getAllNodeDefinitions()   // Flat array of every NodeDefinition
getFeaturedNodes()        // Only nodes with featured: true
getNodeDefinition(type)   // Lookup by type string
getCategoryById(id)       // Lookup category by NodeCategory id
```

---

## 3. Search

The `searchNodes` function performs a case-insensitive substring match across three fields:

```ts
function searchNodes(query: string): NodeDefinition[] {
  const lowerQuery = query.toLowerCase();
  return getAllNodeDefinitions().filter((node) => {
    return (
      node.label.toLowerCase().includes(lowerQuery) ||
      node.description?.toLowerCase().includes(lowerQuery) ||
      node.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}
```

When a search query is active, the category list is replaced with a single "Search Results" pseudo-category containing the filtered nodes. Clearing the search input restores the normal category view.

---

## 4. Adding Nodes

There are two ways to add a node from the catalog.

### Drag-and-Drop

Each `NodeItem` is a native HTML draggable element. On drag start, it sets two data transfer keys:

```ts
e.dataTransfer.setData("application/reactflow", node.type);
e.dataTransfer.setData("application/flowtone-nodetype", node.type);
```

The user drags the item onto the React Flow canvas, where `App.tsx` handles the drop (see Section 6).

### Double-Click (Auto-Placement)

Double-clicking a `NodeItem` calls `handleAddNode` in `NodeCatalog`, which:

1. Reads current nodes and viewport via `useReactFlow()`.
2. Computes a collision-free position with `getSmartPlacementPosition()`.
3. Creates a React Flow node object with `nanoid()` for the ID.
4. Appends it to the node array via `setNodes`.
5. Creates the corresponding Tone.js audio node via `audioEngine.createNode()`.

```ts
const handleAddNode = useCallback((nodeType: string) => {
  const nodes = getNodes();
  const viewport = getViewport();
  const position = getSmartPlacementPosition(nodes, viewport);

  const newNode = {
    id: nanoid(),
    type: nodeType,
    position,
    data: {
      label: nodeType,
      kind: "atomic" as const,
      toneType: nodeType,
      config: {},
    },
  };

  setNodes((nodes) => [...nodes, newNode]);
  audioEngine?.createNode(newNode.id, nodeType as ToneComponentKey);
}, [getNodes, getViewport, setNodes, audioEngine]);
```

---

## 5. Auto-Placement Algorithm

Located in `autoPlacement.ts`. The entry point is `getSmartPlacementPosition()`:

```ts
function getSmartPlacementPosition(
  nodes: Node[],
  viewport: { x: number; y: number; zoom: number },
  canvasSize?: { width: number; height: number }
): XYPosition
```

### Algorithm Steps

1. **Pick a reference point.** Uses the last selected node's position, or falls back to the most recently added node, or falls back to viewport center.
2. **Generate candidate positions.** Produces positions in a circular pattern around the reference at 8 compass directions (right, bottom-right, bottom, ..., top-right) at 4 increasing distances (250px, 375px, 500px, 625px). This yields 32 candidate positions.
3. **Test for collisions.** Each candidate is checked against every existing node using axis-aligned bounding box (AABB) collision with a 50px spacing buffer. Default assumed node size is 200x200.
4. **Select the winner.** The first collision-free candidate wins. If all candidates overlap, the one with the fewest collisions is chosen.

### Constants

| Constant | Value | Purpose |
|---|---|---|
| `DEFAULT_NODE_WIDTH` | 200 | Assumed width for collision checks |
| `DEFAULT_NODE_HEIGHT` | 200 | Assumed height for collision checks |
| `MIN_SPACING` | 50 | Buffer between node bounding boxes |
| `PLACEMENT_OFFSET` | 250 | Base distance from reference node |

### Optional Grid Snapping

```ts
getPlacementWithSnapping(nodes, viewport, true, 50)
```

When enabled, the final position is rounded to the nearest grid increment.

---

## 6. Drag-and-Drop Integration

`App.tsx` sets up the drop zone by wrapping the `ReactFlow` component in a div with `onDrop` and `onDragOver` handlers.

### onDragOver

Prevents default browser behavior and sets the drop effect to `"copy"`:

```ts
const onDragOver = useCallback((e: React.DragEvent) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
}, []);
```

### onDrop

Reads the node type from `application/flowtone-nodetype`, calculates the flow-space position from the mouse coordinates relative to the wrapper bounds, then creates both the visual node and the audio node:

```ts
const onDrop = useCallback((e: React.DragEvent) => {
  e.preventDefault();
  const nodeType = e.dataTransfer.getData("application/flowtone-nodetype");
  if (!nodeType) return;

  const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
  const position = {
    x: e.clientX - reactFlowBounds.left - 100,
    y: e.clientY - reactFlowBounds.top - 50,
  };

  const newNode = {
    id: nanoid(),
    type: nodeType,
    position,
    data: {
      label: nodeType,
      kind: "atomic" as const,
      toneType: nodeType,
      config: {},
    },
  };

  // Update visual state
  onNodesChange([{ type: "add", item: newNode }]);

  // Create audio node
  audioEngine?.createNode(newNode.id, nodeType as ToneComponentKey);
}, [onNodesChange, audioEngine]);
```

The position offset (`-100`, `-50`) centers the node roughly under the cursor.

---

## 7. Adding a Node to the Catalog

To make a new node appear in the sidebar:

### Step 1: Add the entry to `nodeCategories.ts`

Find the appropriate category in `NODE_CATEGORIES` and add a `NodeDefinition` object to its `nodes` array:

```ts
// In the "effects" category, for example:
{
  type: "Vibrato",
  label: "Vibrato",
  description: "Pitch modulation effect",
  icon: "...",
  tags: ["vibrato", "modulation", "pitch"],
  featured: false,
},
```

The `type` field must match the key used in `src/nodes/index.ts` `nodeTypes` and must be a valid `ToneComponentKey` (or one of the special types `"Midi"`, `"MidiPiano"`, `"StoreNode"`).

### Step 2: Ensure the node is registered in `nodeTypes`

In `src/nodes/index.ts`, the node type must have a corresponding entry so React Flow knows how to render it:

```ts
import { VibratoNode } from "./tone/effect-nodes/VibratoNode";

export const nodeTypes = {
  // ...
  Vibrato: VibratoNode,
};
```

### Step 3 (optional): Add port configuration

If the node requires specific input/output ports, add a config in `src/ports/registry.ts`.

That is all that is needed. The catalog dynamically reads from `NODE_CATEGORIES` at render time, so no other wiring is required.
