import type { Node, BuiltInNode } from "@xyflow/react";
import * as Tone from "tone";

export type SynthNodeData = {
  label: string;
  options: ConstructorParameters<typeof Tone.Synth>;
};

export type MidiInputNode = Node<{ label: string }, "midi-input">;

export type PositionLoggerNode = Node<{ label: string }, "position-logger">;

export type SynthNode = Node<
  { label: string; options: ConstructorParameters<typeof Tone.Synth>[0] },
  "synth"
>;

export type AppNode =
  | BuiltInNode
  | MidiInputNode
  | PositionLoggerNode
  | SynthNode;
