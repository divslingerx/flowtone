import type { Edge, EdgeTypes } from "@xyflow/react";

export const initialEdges: Edge[] = [
  // Connect MIDI Input to Sine Synth
  { id: "a-b", source: "a", target: "b" },
  // Connect MIDI Input to Square Synth
  { id: "a-c", source: "a", target: "c" },
  // Connect Sine Synth to Mixer
  { id: "b-d", source: "b", target: "d" },
  // Connect Square Synth to Mixer
  { id: "c-d", source: "c", target: "d" },
];

export const edgeTypes = {
  // Add your custom edge types here!
} satisfies EdgeTypes;
