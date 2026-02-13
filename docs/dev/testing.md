# Testing

## Current Status

Vitest v3.0.3 is installed and configured, but test coverage is minimal. The project currently has two test files:

- `src/lib/NormalisableRange.test.ts` -- unit tests for the parameter scaling utility
- `src/ports/types.test.ts` -- unit tests for port factory functions, handle ID parsing, and connection validation

A global setup file at `src/test/setup.ts` provides comprehensive mocks for Tone.js and the Web MIDI API, so the foundation for broader test coverage is in place.

## Vitest Configuration

The configuration lives in `vitest.config.ts`:

```ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
      ],
    },
  },
});
```

Key points:

- **globals: true** -- `describe`, `it`, `expect` are available without imports (though the existing tests import them explicitly, which also works).
- **environment: jsdom** -- DOM APIs are available for component tests.
- **Path alias** -- The `~/` alias resolves to `./src/`, matching the Vite config.
- **Test file pattern** -- Files matching `src/**/*.{test,spec}.{ts,tsx}` are picked up automatically.
- **Coverage** -- V8 provider with text, JSON, and HTML reporters. Run with `pnpm test:coverage`.

## Test Setup and Mocks

The setup file at `src/test/setup.ts` runs before every test file. It provides three categories of mocks.

### Tone.js Mock

The entire `tone` module is mocked to prevent actual audio processing. The mock creates:

**`mockParam`** -- A stand-in for `Tone.Param` objects (frequency, detune, volume, etc.) with stubbed methods:

```ts
const mockParam = {
  value: 0,
  setValueAtTime: vi.fn(),
  linearRampToValueAtTime: vi.fn(),
  exponentialRampToValueAtTime: vi.fn(),
};
```

**`createMockNode(type)`** -- A factory that returns a mock audio node with common methods (`connect`, `disconnect`, `dispose`, `start`, `stop`, `toDestination`) and standard Tone.Param properties (`frequency`, `detune`, `volume`, `pan`, `Q`, `gain`):

```ts
const createMockNode = (type: string) => ({
  connect: vi.fn().mockReturnThis(),
  disconnect: vi.fn().mockReturnThis(),
  dispose: vi.fn(),
  toDestination: vi.fn().mockReturnThis(),
  start: vi.fn(),
  stop: vi.fn(),
  frequency: { ...mockParam },
  // ... other params
  _type: type,
});
```

**Mock classes** -- All 40+ Tone.js classes used by the project (oscillators, synths, effects, components) are generated in a loop. Each class has a static `getDefaults()` method and a constructor that returns a mock node:

```ts
for (const className of toneClasses) {
  mockTone[className] = class {
    static getDefaults = vi.fn(() => ({}));
    constructor() {
      return createMockNode(className);
    }
  };
}
```

Additionally, `Tone.Transport`, `Tone.Destination`, `Tone.Frequency`, and `Tone.Param` are individually mocked.

### Web MIDI API Mock

The `@react-midi/hooks` module is mocked so tests never attempt real MIDI access:

```ts
vi.mock("@react-midi/hooks", () => ({
  useMIDINote: vi.fn(() => null),
  useMIDIOutput: vi.fn(() => null),
  useMIDIInputs: vi.fn(() => []),
  useMIDIOutputs: vi.fn(() => []),
}));
```

### Browser API Mocks

`requestAnimationFrame`, `cancelAnimationFrame`, and `ResizeObserver` are stubbed on the global object for visualization and layout tests.

## Existing Tests

### NormalisableRange (`src/lib/NormalisableRange.test.ts`)

Tests the `NormalisableRange` class, which maps parameter values to/from a normalized 0-1 range with optional skew. This is a pure utility with no dependencies on Tone.js or React.

Two test cases cover:

1. **Linear behavior** -- When the center value is the exact midpoint, `mapTo01` and `mapFrom01` produce linear mappings.
2. **Skewed behavior** -- When the center is offset (e.g., 110 in a 100-200 range), the mapping is nonlinear. Uses `toBeCloseTo` for floating-point comparisons.

```ts
it("interpolates with skew when the center is off", () => {
  const nr = new NormalisableRange(100, 200, 110);
  expect(nr.mapTo01(110)).toBe(0.5);
  expect(nr.mapFrom01(0.75)).toBeCloseTo(138.46);
});
```

### Port Types (`src/ports/types.test.ts`)

Tests the port system that controls how nodes connect to each other. Covers four areas:

1. **Port factory functions** -- `createSinglePortConfig`, `createSourcePortConfig`, `createDestinationPortConfig`, `createMergePortConfig`, `createSplitPortConfig`. Verifies correct input/output counts, signal types, and channel indices.

2. **Handle ID creation and parsing** -- `createHandleId("node-123", "out", 0)` produces `"node-123:out:0"`. `parseHandleId` reverses this and throws on malformed IDs.

3. **Port lookup** -- `getPortByIndex` retrieves ports from a config and returns `undefined` for out-of-range indices.

4. **Connection validation** -- `isValidPortConnection` enforces rules:
   - Output-to-input only (rejects input-to-input and output-to-output)
   - Signal type compatibility (audio-to-control is allowed for modulation, but midi-to-audio is rejected)
   - Channel count compatibility (mono-to-stereo upmix is allowed, stereo-to-mono downmix is rejected)

## Running Tests

```bash
# Watch mode (re-runs on file changes)
pnpm test

# Single run (CI-friendly)
pnpm test:run

# Single run with coverage report
pnpm test:coverage
```

All commands invoke Vitest, which picks up `vitest.config.ts` automatically.

## Writing New Tests

### File Placement

Place test files next to the module they test, using the `.test.ts` or `.test.tsx` extension:

```
src/lib/NormalisableRange.ts
src/lib/NormalisableRange.test.ts
```

### Testing Pure Utilities

For modules with no Tone.js or React dependencies, write straightforward unit tests:

```ts
import { describe, it, expect } from "vitest";
import { myFunction } from "./myFunction";

describe("myFunction", () => {
  it("does the thing", () => {
    expect(myFunction(input)).toBe(expectedOutput);
  });
});
```

### Testing Code That Uses Tone.js

The global mock in `setup.ts` handles most cases automatically. When you import from `tone` in a test file, you get the mocked versions. You can assert on mock calls:

```ts
import { Oscillator } from "tone";

it("creates and starts an oscillator", () => {
  const osc = new Oscillator();
  osc.start();
  expect(osc.start).toHaveBeenCalled();
});
```

If a test needs a Tone.js class to return specific defaults, override the static mock:

```ts
import { vi } from "vitest";
import { Filter } from "tone";

vi.mocked(Filter.getDefaults).mockReturnValue({
  frequency: 1000,
  type: "lowpass",
  Q: 1,
});
```

### Testing the Zustand Store

Import and call store actions directly. The store does not require a React component context:

```ts
import { useStore } from "~/store/store";

it("adds a node", () => {
  const { createNode } = useStore.getState();
  createNode("Oscillator", { x: 0, y: 0 });

  const { nodes } = useStore.getState();
  expect(nodes).toHaveLength(1);
  expect(nodes[0]?.type).toBe("Oscillator");
});
```

Reset the store between tests if actions mutate shared state:

```ts
beforeEach(() => {
  useStore.setState({ nodes: [], edges: [] });
});
```

### Testing React Components

Use `@testing-library/react` (already installed) with jsdom. Node components typically need a React Flow context and the audio engine context:

```ts
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("renders the node", () => {
  render(<MyComponent />);
  expect(screen.getByText("Filter")).toBeInTheDocument();
});
```

For node components that depend on React Flow or the AudioEngine context, you will need to wrap them in the appropriate providers. Consider creating a test utility that provides these wrappers.

### Testing Connection Validation

The existing `types.test.ts` is a good model. Create port objects with the helper and test `isValidPortConnection`:

```ts
const source = createPort("output", "audio");
const target = createPort("input", "midi");
const result = isValidPortConnection(source, target);
expect(result.valid).toBe(false);
expect(result.reason).toContain("Signal type mismatch");
```

### General Guidelines

- Use `toBeCloseTo` for floating-point assertions (see `NormalisableRange.test.ts`).
- Prefer `toHaveBeenCalled` / `toHaveBeenCalledWith` for verifying mock interactions.
- The `.nodrag` class and other React Flow-specific behaviors are difficult to test in jsdom; focus unit tests on logic and data transformations rather than drag interactions.
- Keep audio node tests focused on parameter updates and lifecycle (`dispose`, `start`, `stop`) rather than actual audio output, since Tone.js is fully mocked.
