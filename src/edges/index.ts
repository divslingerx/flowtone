import type { Edge, EdgeTypes } from "@xyflow/react";

/*
a -  midi
b -  OmniOscillator
c -  AmplitudeEnvelope
d -  Filter
e -  FrequencyEnvelope
f -  Channel
*/

export const initialEdges: Edge[] = [
  // Connect MIDI Input into OmniOscillator
  { id: "a-b", source: "a", target: "b" },
  // Connect OmniOscillator Input to AmplitudeEnvelope
  { id: "b-c", source: "b", target: "c" },
  // Connect AmplitudeEnvelope Synth to Filter
  { id: "c-d", source: "c", target: "d", targetHandle: "input" },
  // Connect FrequencyEnvelope Synth to filter
  {
    id: "e-d-frequency",
    source: "e",
    target: "d",
    targetHandle: "frequency",
    label: "frequency",
  },
  // Connect Filter Synth to Channel
  { id: "d-f", source: "d", sourceHandle: "output", target: "f" },
];

export const edgeTypes = {
  // Add your custom edge types here!
} satisfies EdgeTypes;
