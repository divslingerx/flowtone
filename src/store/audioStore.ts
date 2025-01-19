import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import * as Tone from "tone";

interface AudioState {
  connections: Array<{ source: string; target: string }>;
  nodes: Record<string, { type: string; params?: Record<string, unknown> }>;
  audioContext: Tone.Context | null;
  synth: Tone.Synth | null;
  midiInput:
    | globalThis.WebMidi.MIDIInput
    | {
        onmidimessage: (message: globalThis.WebMidi.MIDIMessageEvent) => void;
      }
    | null;

  // Store methods
  initializeAudio: () => Promise<void>;
  setupMidi: (input: globalThis.WebMidi.MIDIInput) => void;
  cleanupAudio: () => void;
  addConnection: (connection: { source: string; target: string }) => void;
  removeConnection: (connection: { source: string; target: string }) => void;
  addNode: (node: {
    id: string;
    type: string;
    params?: Record<string, unknown>;
  }) => void;
  removeNode: (nodeId: string) => void;
}

const initialState: AudioState = {
  connections: [],
  nodes: {},
  audioContext: null,
  synth: null,
  midiInput: null,

  // Methods
  initializeAudio: async () => {},
  setupMidi: () => {},
  cleanupAudio: () => {},
  addConnection: () => {},
  removeConnection: () => {},
  addNode: () => {},
  removeNode: () => {},
};

const useAudioStore = create(
  devtools(
    immer<AudioState>((set, get) => ({
      ...initialState,

      // Initialize audio context and synth
      initializeAudio: async () => {
        await Tone.start();
        const context = new Tone.Context();
        const synth = new Tone.Synth().toDestination();
        set({ audioContext: context, synth });
      },

      // Setup MIDI input
      setupMidi: (
        input:
          | globalThis.WebMidi.MIDIInput
          | {
              onmidimessage: (
                message: globalThis.WebMidi.MIDIMessageEvent
              ) => void;
            }
      ) => {
        const { synth } = get();
        if (!synth) return;

        // Handle both WebMidi.MIDIInput and @react-midi/hooks Input types
        input.onmidimessage = (message) => {
          const [command, note] = message.data;
          if (command === 144) {
            // Note on
            synth.triggerAttack(Tone.Frequency(note, "midi").toFrequency());
          } else if (command === 128) {
            // Note off
            synth.triggerRelease();
          }
        };

        set({ midiInput: input });
      },

      // Cleanup audio resources
      cleanupAudio: () => {
        const { synth, midiInput } = get();
        synth?.dispose();
        if (midiInput && "close" in midiInput) {
          midiInput.close();
        }
        set({
          audioContext: null,
          synth: null,
          midiInput: null,
        });
      },

      // Existing node/connection management
      addConnection: (connection: { source: string; target: string }) =>
        set((state) => {
          state.connections.push(connection);
        }),
      removeConnection: (connection: { source: string; target: string }) =>
        set((state) => {
          state.connections = state.connections.filter(
            (conn) =>
              conn.source !== connection.source ||
              conn.target !== connection.target
          );
        }),
      addNode: (node: {
        id: string;
        type: string;
        params?: Record<string, unknown>;
      }) =>
        set((state) => {
          state.nodes[node.id] = node;
        }),
      removeNode: (nodeId: string) =>
        set((state) => {
          delete state.nodes[nodeId];
        }),
    }))
  )
);

export { useAudioStore };
