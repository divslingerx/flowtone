# Flowtone Developer Documentation

Developer documentation for the Flowtone visual audio programming interface.

## Table of Contents

### Getting Started

1. **[Architecture Overview](./architecture.md)**
   Project structure, tech stack, dual state system concept, build commands, and TypeScript configuration.

2. **[State Management & AudioEngine](./state-management.md)**
   Zustand store, AudioEngine facade, React context, state synchronization patterns, and parameter update flow.

### Core Systems

3. **[Type System](./type-system.md)**
   Discriminated unions, Tone.js class extraction generics, atomic/composite/utility node types, AppNode union, and type guards.

4. **[Port System & Connection Validation](./port-system.md)**
   Signal types, port configuration, factory functions, port registry, handle IDs, connection validation modes, and DynamicHandles.

5. **[React Flow Integration](./react-flow.md)**
   Canvas setup, node/edge change handling, connection handling, initial graph, node types registry, and ReactFlowProvider.

### Node Development

6. **[Creating New Nodes](./creating-nodes.md)**
   Step-by-step guide, node template, useToneNode hook, registration, port config, parameter metadata, and reference implementations.

7. **[Auto-Controls & Knob System](./controls-and-knobs.md)**
   AutoNodeControls, AutoControl dispatch, parameter metadata, control types, KnobBase, knob variants, NormalisableRange, and manual parameter updates.

8. **[Node Catalog & Sidebar](./node-catalog.md)**
   Catalog component, node categories, search, drag-and-drop, auto-placement algorithm, and adding nodes to the catalog.

### Integrations

9. **[MIDI Integration](./midi.md)**
   Web MIDI API, MIDI Input Node, MIDI Piano Node, MIDINoteEvent, AudioEngine MIDI routing, and MIDI port system.

### Testing

10. **[Testing](./testing.md)**
    Vitest configuration, test setup and mocks, existing test patterns, running tests, and writing new tests.
