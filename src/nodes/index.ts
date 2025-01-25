import type { NodeTypes } from "@xyflow/react";

import { AppNode } from "./types";
import { MidiInputNode } from "./MidiInputNode";
import { MidiPianoNode } from "./MidiPianoNode";
import { OmniOscillatorNode } from "./tone/source-nodes/OmniOscillatorNode";
import { AmplitudeEnvelopeNode } from "./tone/component-nodes/AmplitudeEnvelope";
import { ChannelNode } from "./tone/component-nodes/ChannelNode";
import { FilterNode } from "./tone/component-nodes/FilterNode";
import { FrequencyEnvelopeNode } from "./tone/component-nodes/FilterEnvelope";

import { AddComponentNode } from "./AddComponentNode";
import { PannerNode } from "./tone/component-nodes/PannerNode";

export const initialNodes: AppNode[] = [
  {
    id: "p",
    type: "MidiPiano",
    position: { x: 400, y: -400 },
    data: { label: "Piano Midi Player", config: {} },
  },
  {
    id: "a",
    type: "Midi",
    position: { x: 600, y: -125 },
    data: { label: "Midi Input", config: {} },
  },
  {
    id: "b",
    type: "OmniOscillator",
    position: { x: 600, y: 0 },
    data: {
      label: "OmniOscillator",
      config: {
        detune: 0,
        mute: false,
        frequency: 440,
        type: "sine",
      },
    },
  },
  {
    id: "c",
    type: "AmplitudeEnvelope",
    position: { x: 600, y: 225 },
    data: {
      label: "AmplitudeEnvelope",
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
    type: "Filter",
    position: { x: 600, y: 350 },
    data: {
      label: "Filter",
      config: {
        frequency: 440,
        type: "lowpass",
      },
    },
  },
  {
    id: "e",
    type: "FrequencyEnvelope",
    position: { x: 800, y: 225 },
    data: {
      label: "FrequencyEnvelope",
      config: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.8,
        release: 0.5,
      },
    },
  },
  {
    id: "f",
    type: "Channel",
    position: { x: 600, y: 425 },
    data: {
      label: "Output",
      config: {
        mute: false,
        solo: false,
        pan: 0,
        volume: 0.5,
      },
    },
  },
  {
    id: "g",
    type: "StoreNode",
    position: { x: 800, y: -100 },
    data: {},
  },
];

export const nodeTypes = {
  // "position-logger": PositionLoggerNode,
  Midi: MidiInputNode,
  MidiPiano: MidiPianoNode,
  OmniOscillator: OmniOscillatorNode,
  AmplitudeEnvelope: AmplitudeEnvelopeNode,
  Filter: FilterNode,
  FrequencyEnvelope: FrequencyEnvelopeNode,
  Panner: PannerNode,
  Channel: ChannelNode,

  StoreNode: AddComponentNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;
