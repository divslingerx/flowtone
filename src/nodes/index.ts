import type { NodeTypes } from "@xyflow/react";

import { PositionLoggerNode } from "./PositionLoggerNode";
import { SynthNode } from "./instruments/SynthNode";
import { AppNode } from "./types";
import { MidiInputNode } from "./MidiInputNode";

export const initialNodes: AppNode[] = [
  {
    id: "a",
    type: "midi-input",
    position: { x: -190, y: 0 },
    data: { label: "Midi Input" },
  },
  {
    id: "b",
    type: "synth",
    position: { x: -100, y: 100 },
    data: { label: "Sine Synth", options: { oscillator: { type: "fatsine" } } },
  },
  {
    id: "c",
    type: "synth",
    position: { x: -300, y: 100 },
    data: {
      label: "Square Synth",
      options: { oscillator: { type: "square32" } },
    },
  },

  {
    id: "d",
    type: "output",
    position: { x: -100, y: 200 },
    data: { label: "Mixer" },
  },
];

export const nodeTypes = {
  "position-logger": PositionLoggerNode,
  "midi-input": MidiInputNode,
  synth: SynthNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;
