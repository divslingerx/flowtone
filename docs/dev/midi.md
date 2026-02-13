# MIDI Integration

Flowtone provides two paths for MIDI note input: hardware MIDI controllers via the Web MIDI API and a virtual on-screen piano keyboard. Both feed into the same `AudioEngine.handleMIDINote()` pipeline to trigger connected instrument and oscillator nodes.

## Web MIDI API

Flowtone uses the [`@react-midi/hooks`](https://github.com/react-midi/react-midi) library to access the browser's Web MIDI API through React hooks. The library provides:

- **`useMIDINote()`** -- Returns the most recent MIDI note event from any connected hardware device. The return value updates reactively on each incoming note.
- **`useMIDIInputs()`** -- Returns a list of connected MIDI input devices (`{ inputs: MIDIInput[] }`), used for displaying available hardware in the UI.
- **`useMIDIOutput()`** -- Provides `noteOn` and `noteOff` functions for sending MIDI messages back to connected output devices.

The MIDI provider wraps the application at the top level, so these hooks are available anywhere in the component tree.

## MIDI Input Node

**File:** `src/nodes/MidiInputNode.tsx`

The MIDI Input Node receives note events from physical MIDI hardware and forwards them to connected audio nodes.

### Data flow

1. `useMIDINote()` fires whenever a hardware MIDI controller sends a note message.
2. A `useEffect` watches the `midiNote` value. On each change, it reads the node's `data.connections` array to find downstream targets.
3. For each connected target node ID, it calls `audioEngine.handleMIDINote()` with the note number and velocity.

```tsx
const midiNote = useMIDINote();
const devices = useMIDIInputs();
const audioEngine = useContext(AudioEngineContext);

useEffect(() => {
  if (midiNote && audioEngine) {
    const connectedNodes =
      data.connections?.map((edge: AppEdge) => edge.target) || [];

    connectedNodes.forEach((nodeId: string) => {
      try {
        audioEngine.handleMIDINote(nodeId, {
          note: midiNote.note,
          velocity: midiNote.velocity,
        });
      } catch (error) {
        console.error("Error handling MIDI note:", error);
      }
    });
  }
}, [midiNote, audioEngine, data.connections]);
```

The node also displays the list of detected MIDI input devices and the most recent note/velocity/channel for debugging.

### Port configuration

The MIDI Input Node exposes a single **source** handle at the bottom. It has no input handles because it acts as an entry point for external MIDI data.

```tsx
<Handle type="source" position={Position.Bottom} />
```

## MIDI Piano Node

**File:** `src/nodes/MidiPianoNode.tsx`

The MIDI Piano Node provides a virtual keyboard rendered directly inside the React Flow canvas. It allows triggering notes without any physical hardware.

### How it sends note events

Mouse interactions on piano keys call `handleNoteOn` and `handleNoteOff`:

```tsx
const handleNoteOn = (midiNumber: number) => {
  setActiveNotes((prev) => new Set(prev).add(midiNumber));
  if (audioEngine) {
    const connectedNodes = data.connections?.map((edge) => edge.target) || [];
    connectedNodes.forEach((nodeId) => {
      audioEngine.handleMIDINote(nodeId, {
        note: midiNumber,
        velocity: 127, // Max velocity
      });
    });
  }
  noteOn?.(midiNumber, { velocity: 127, channel: 1 });
};
```

Key details:

- **Note-to-MIDI conversion:** `getMidiNumber(note, octave)` converts a note name (e.g. `"C#"`) and octave number into a standard MIDI note number using the formula `12 + octave * 12 + noteIndex`.
- **Velocity:** Fixed at 127 (maximum) for all virtual key presses.
- **MIDI output forwarding:** In addition to driving the internal audio engine, the node also calls `noteOn()` / `noteOff()` from `useMIDIOutput()` to forward events to any connected external MIDI output device.
- **Octave range:** Displays 3 octaves centered around a user-adjustable base octave (default: 3). The octave can be shifted with arrow buttons in the UI.

Like the MIDI Input Node, it uses a single source handle at the bottom.

## MIDINoteEvent Type

**File:** `src/store/audioEngine.ts`

```typescript
export interface MIDINoteEvent {
  note: number;     // MIDI note number (0-127)
  velocity: number; // Note velocity (0-127)
}
```

This is the minimal event structure passed through the system. Both the MIDI Input Node and MIDI Piano Node construct this object and hand it to `AudioEngine.handleMIDINote()`.

Note: the `useMIDINote()` hook from `@react-midi/hooks` returns a richer object that also includes `channel` and `type` fields, but only `note` and `velocity` are extracted and forwarded to the audio engine.

## AudioEngine.handleMIDINote()

**File:** `src/store/audioEngine.ts`

This method routes a MIDI note event to the appropriate Tone.js node by ID. It converts the MIDI note number to a frequency and dispatches behavior based on the node type.

```typescript
handleMIDINote(
  id: string,
  midiNote: { note: number; velocity: number }
): void {
  const node = this.nodes.get(id);
  if (!node) return;

  // Convert MIDI note to frequency
  const freq = Tone.Frequency(midiNote.note, "midi").toFrequency();

  if (
    node instanceof Tone.Oscillator ||
    node instanceof Tone.OmniOscillator
  ) {
    // Update frequency and trigger note
    node.frequency.value = freq;
    this.triggerNote(id, midiNote);
  } else if (node instanceof Tone.Filter) {
    // Update filter frequency
    node.frequency.value = freq;
  }
}
```

### The triggerAttack/triggerRelease pattern

The current implementation uses `triggerNote()` for oscillator-type nodes, which performs a start/stop cycle:

```typescript
triggerNote(id: string, midiNote?: { note: number; velocity: number }): void {
  const node = this.nodes.get(id);
  if (!node) return;

  if (
    node instanceof Tone.Oscillator ||
    node instanceof Tone.OmniOscillator
  ) {
    node.stop();

    if (midiNote) {
      const freq = Tone.Frequency(midiNote.note, "midi").toFrequency();
      node.frequency.value = freq;
    }

    node.start();

    // Schedule stop after 1 second
    Tone.Transport.scheduleOnce(() => {
      node.stop();
    }, "+1");
  }
}
```

The flow is:

1. Stop any currently playing sound on the oscillator.
2. Set the oscillator's frequency from the MIDI note number using `Tone.Frequency(note, "midi").toFrequency()`.
3. Start the oscillator.
4. Schedule an automatic stop 1 second later via `Tone.Transport.scheduleOnce`.

For `Tone.Filter` nodes, `handleMIDINote` updates the cutoff frequency to match the MIDI note, enabling keyboard tracking of filter cutoff.

### Current limitations

- **No note-off handling:** The MIDI Piano Node calls `handleNoteOff` locally (for UI state and external MIDI output), but the `AudioEngine` does not currently process note-off events. Oscillator notes are stopped on a fixed 1-second timer instead.
- **No Synth instrument routing:** `handleMIDINote` does not yet handle `Tone.Synth` or its variants (which support `triggerAttack` / `triggerRelease` natively). Only raw oscillators and filters respond to MIDI.
- **No velocity sensitivity:** Velocity is received but not applied to node parameters.

## MIDI Signal Type in the Port System

**File:** `src/ports/types.ts`, `src/nodes/types3.ts`

The port system defines four signal types used for connection validation and visual differentiation:

```typescript
export type SignalType = "audio" | "control" | "midi" | "trigger";
```

### Visual handle styling

Each signal type renders with a distinct color and size in the `DynamicHandles` component:

```typescript
const styles = {
  audio:   { backgroundColor: "#4CAF50", width: 14, height: 14 }, // green
  control: { backgroundColor: "#2196F3", width: 10, height: 10 }, // blue
  midi:    { backgroundColor: "#9C27B0", width: 12, height: 12 }, // purple
  trigger: { backgroundColor: "#FF9800", width: 8,  height: 8  }, // orange
};
```

### Connection validation

The `isValidPortConnection()` function in `src/ports/types.ts` enforces signal type matching. MIDI ports can only connect to other MIDI ports -- there is no implicit conversion between MIDI and audio signals:

```typescript
if (sourcePort.signalType !== targetPort.signalType) {
  // Allow audio -> control (modulation), but no other cross-type connections
  if (sourcePort.signalType === "audio" && targetPort.signalType === "control") {
    return { valid: true };
  }
  return {
    valid: false,
    reason: `Signal type mismatch: ${sourcePort.signalType} -> ${targetPort.signalType}`,
  };
}
```

### Current state of MIDI port usage

The MIDI Input and MIDI Piano nodes currently use raw React Flow `<Handle>` elements rather than the `DynamicHandles` system with port registry entries. They do not have entries in `TONE_PORT_REGISTRY` (which is for Tone.js node types only). Their connections are tracked in the node's `data.connections` array and routed manually through `handleMIDINote()`, bypassing the standard `AudioEngine.connectNodes()` audio graph routing.

This means MIDI connections operate as a message-passing layer on top of the visual graph, separate from the Tone.js audio signal chain.
