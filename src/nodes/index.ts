import type { NodeTypes } from "@xyflow/react";

import { PositionLoggerNode } from "./PositionLoggerNode";
import { AppNode } from "./types";
import { MidiInputNode } from "./MidiInputNode";
import { OmniOscillatorNode } from "./tone/source-nodes/OmniOscillatorNode";
import { AmplitudeEnvelopeNode } from "./tone/component-nodes/AmplitudeEnvelope";
import { ChannelNode } from "./tone/component-nodes/ChannelNode";

export const initialNodes: AppNode[] = [
  {
    id: "a",
    type: "midi-input",
    position: { x: -190, y: 0 },
    data: { label: "Midi Input" },
  },
  {
    id: "b",
    type: "OmniOscillator",
    position: { x: -100, y: 100 },
    data: {
      label: "omniOscillator",
      config: {
        frequency: 440,
        type: "sine",
      },
    },
  },
  {
    id: "c",
    type: "AmplitudeEnvelope",
    position: { x: -300, y: 100 },
    data: {
      label: "Amp Env",
      config: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.8,
        release: 0.5,
      },
    },
  },
  {
    id: "d",
    type: "Channel",
    position: { x: -100, y: 200 },
    data: { label: "Output", config: {} },
  },
];

export const nodeTypes = {
  "position-logger": PositionLoggerNode,
  "midi-input": MidiInputNode,
  omniOscillator: OmniOscillatorNode,
  AmplitudeEnvelope: AmplitudeEnvelopeNode,
  Channel: ChannelNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;
