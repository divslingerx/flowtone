# Flowtone Quick Start Guide

## For New Contributors

### Adding Your First Node (2 Minutes)

**1. Copy the template:**
```bash
cp src/nodes/tone/NODE_TEMPLATE.tsx src/nodes/tone/effect-nodes/YourNode.tsx
```

**2. Replace placeholders:**
```tsx
// Change:
NODE_NAME → Your
NODE_TYPE → YourNode
TONE_TYPE → "Your"
```

**3. Register it:**
```typescript
// In src/nodes/index.ts
import { YourNode } from "./tone/effect-nodes/YourNode";

export const nodeTypes = {
  Your: YourNode,  // Add this line
  // ... rest
};
```

**4. Add port config:**
```typescript
// In src/ports/registry.ts
Your: createSinglePortConfig("audio"),
```

**Done!** Your node appears in the sidebar and works immediately.

## Key Concepts

### 1. Every Node Has 3 Parts

**Visual Component** (React):
- Renders the UI
- Uses `AutoNodeControls` for parameters
- Uses `DynamicHandles` for connections

**Audio Instance** (Tone.js):
- Created by `useToneNode` hook
- Managed by AudioEngine
- Auto-disposes on unmount

**Metadata** (Registries):
- Port configuration (how to connect)
- Parameter metadata (how to display)

### 2. Auto-Generation Flow

```
Tone.js class
  ↓
getDefaults() → parameter names
  ↓
PARAMETER_DEFAULTS → control types
  ↓
NODE_METADATA → overrides
  ↓
AutoNodeControls → rendered UI
```

### 3. State Synchronization

Two parallel states that must stay in sync:

**React Flow State** (Visual):
- Node positions
- Edge connections
- Parameter values

**AudioEngine State** (Audio):
- Tone.js instances
- Audio connections
- Current parameter values

**Synced via:**
```typescript
updateNodeData(id, { param: value });         // Visual
audioEngine.updateNodeParams(id, { param: value });  // Audio
```

## Common Tasks

### Add Simple Effect Node

```bash
# 1. Copy template
cp src/nodes/tone/NODE_TEMPLATE.tsx src/nodes/tone/effect-nodes/DelayNode.tsx

# 2. Edit file: Replace Delay, DelayNode, "Delay"
# 3. Add to index.ts imports and nodeTypes
# 4. Add to registry.ts: Delay: createSinglePortConfig("audio"),
```

### Add Source Node (Oscillator)

Same as effect, but add `.start()`:

```tsx
useEffect(() => {
  oscillator?.start();
}, [oscillator]);
```

### Customize Parameter Display

```typescript
// In src/lib/parameters/metadata.ts
NODE_METADATA: {
  YourNode: {
    parameterOrder: ["frequency", "depth", "wet"],  // Show in this order
    hideParams: ["context"],                         // Don't show these
    layout: "grid",                                  // 2-column grid
  }
}
```

### Add Custom Visualization

```tsx
export function YourNode({ data, id }) {
  return (
    <div className="react-flow__node-default">
      {/* Your custom viz */}
      <CustomVisualization />

      {/* Still use auto-controls */}
      <AutoNodeControls nodeType="Your" nodeId={id} currentData={data.config} />

      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
```

## File Locations

### Where to create nodes:

- **Sources:** `src/nodes/tone/source-nodes/`
  - Oscillators, LFO, Players

- **Instruments:** `src/nodes/tone/instrument-nodes/`
  - Synths, Samplers

- **Effects:** `src/nodes/tone/effect-nodes/`
  - Reverb, Delay, Filters, Modulation

- **Components:** `src/nodes/tone/component-nodes/`
  - Envelopes, Meters, Channel strips, Utilities

### Where to register:

- **Visual registry:** `src/nodes/index.ts` (nodeTypes object)
- **Port registry:** `src/ports/registry.ts`
- **Parameter metadata:** `src/lib/parameters/metadata.ts` (optional)
- **Sidebar catalog:** `src/components/node-catalog/nodeCategories.ts`

## Debugging

### Node not working?

**Check React console:**
- TypeScript errors?
- Missing imports?
- Incorrect node type?

**Check audio:**
```javascript
// In browser console
Tone.getDestination().volume.value  // Should be 0 (0dB)
Tone.getContext().state  // Should be "running"
```

**Check connections:**
- Are handles visible?
- Can you drag edges?
- Do colors match (green=audio, blue=control)?

## Tips & Tricks

### Fast Development

1. **Use the template** - Don't write from scratch
2. **Copy existing nodes** - Similar nodes are similar code
3. **Start simple** - Add custom UI later
4. **Test incrementally** - One node at a time

### Good Practices

1. **Consistent naming:**
   - File: `YourNodeNode.tsx` (e.g., `PhaserNode.tsx`)
   - Component: `YourNodeNode` (e.g., `function PhaserNode`)
   - Registry: `Your` (e.g., `Your: YourNode`)

2. **Add to sidebar:**
   - Helps users discover your node
   - Organizes by category
   - Includes icon and description

3. **Test connections:**
   - Try connecting to other nodes
   - Verify audio flows through
   - Check parameter updates work

## Keyboard Shortcuts (Future)

Planned shortcuts:
- `Cmd+K` - Open node search
- `Delete` - Delete selected nodes
- `Cmd+D` - Duplicate nodes
- `Cmd+G` - Create composite from selection

## Resources

- **Full documentation:** `/docs/NODE_SYSTEM.md`
- **Architecture:** `/CLAUDE.md`
- **Template:** `/src/nodes/tone/NODE_TEMPLATE.tsx`
- **Example nodes:** `/src/nodes/tone/*/` (filter, reverb, synth)

---

**Get started:** Copy NODE_TEMPLATE.tsx and start building!
