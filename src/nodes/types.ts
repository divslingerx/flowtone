import type { Node, BuiltInNode } from "@xyflow/react";
import * as Tone from "tone";

export type SynthNodeData = {
  label: string;
  options: ConstructorParameters<typeof Tone.Synth>;
};

export type MidiInputNode = Node<{ label: string }, "midi-input">;

export type PositionLoggerNode = Node<{ label: string }, "position-logger">;

export type ChannelNode = Node<
  { label: string; config: ConstructorParameters<typeof Tone.Channel>[0] },
  "Channel"
>;

export type OmniOscillatorNode = Node<
  {
    label: string;
    config: ConstructorParameters<typeof Tone.OmniOscillator>[0];
  },
  "OmniOscillator"
>;

export type AmplitudeEnvelopeNode = Node<
  {
    label: string;
    config: ConstructorParameters<typeof Tone.AmplitudeEnvelope>[0];
  },
  "AmplitudeEnvelope"
>;

export type ToneSourceNode = OmniOscillatorNode;
export type ToneComponentNode = AmplitudeEnvelopeNode | ChannelNode;

export type AppNode =
  | BuiltInNode
  | MidiInputNode
  | PositionLoggerNode
  | ToneSourceNode
  | ToneComponentNode;
