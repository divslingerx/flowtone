import type { NodeTypes } from "@xyflow/react";

import { AppNode } from "./types";
import { MidiInputNode } from "./MidiInputNode";
import { MidiPianoNode } from "./MidiPianoNode";
// Source Nodes
import { OmniOscillatorNode } from "./tone/source-nodes/OmniOscillatorNode";
import { OscillatorNode } from "./tone/source-nodes/OscillatorNode";
import { AMOscillatorNode } from "./tone/source-nodes/AMOscillatorNode";
import { FMOscillatorNode } from "./tone/source-nodes/FMOscillatorNode";
import { FatOscillatorNode } from "./tone/source-nodes/FatOscillatorNode";
import { PWMOscillatorNode } from "./tone/source-nodes/PWMOscillatorNode";
import { PulseOscillatorNode } from "./tone/source-nodes/PulseOscillatorNode";
import { LFONode } from "./tone/source-nodes/LFONode";
import { PlayerNode } from "./tone/source-nodes/PlayerNode";
import { GrainPlayerNode } from "./tone/source-nodes/GrainPlayerNode";

// Instrument Nodes
import { SynthNode } from "./tone/instrument-nodes/SynthNode";
import { MonoSynthNode } from "./tone/instrument-nodes/MonoSynthNode";
import { AMSynthNode } from "./tone/instrument-nodes/AMSynthNode";
import { FMSynthNode } from "./tone/instrument-nodes/FMSynthNode";
import { DuoSynthNode } from "./tone/instrument-nodes/DuoSynthNode";
import { PolySynthNode } from "./tone/instrument-nodes/PolySynthNode";

// Effect Nodes
import { FilterNode } from "./tone/component-nodes/FilterNode";
import { ReverbNode } from "./tone/effect-nodes/ReverbNode";
import { ChorusNode } from "./tone/effect-nodes/ChorusNode";
import { AutoFilterNode } from "./tone/effect-nodes/AutoFilterNode";
import { AutoPannerNode } from "./tone/effect-nodes/AutoPannerNode";
import { AutoWahNode } from "./tone/effect-nodes/AutoWahNode";
import { BitCrusherNode } from "./tone/effect-nodes/BitCrusherNode";
import { ChebyshevNode } from "./tone/effect-nodes/ChebyshevNode";
import { DistortionNode } from "./tone/effect-nodes/DistortionNode";
import { FeedbackDelayNode } from "./tone/effect-nodes/FeedbackDelayNode";
import { FreeverbNode } from "./tone/effect-nodes/FreeverbNode";
import { FrequencyShifterNode } from "./tone/effect-nodes/FrequencyShifterNode";
import { JCReverbNode } from "./tone/effect-nodes/JCReverbNode";
import { PhaserNode } from "./tone/effect-nodes/PhaserNode";
import { PingPongDelayNode } from "./tone/effect-nodes/PingPongDelayNode";
import { PitchShiftNode } from "./tone/effect-nodes/PitchShiftNode";
import { StereoWidenerNode } from "./tone/effect-nodes/StereoWidenerNode";
import { TremoloNode } from "./tone/effect-nodes/TremoloNode";
import { VibratoNode } from "./tone/effect-nodes/VibratoNode";

// Component Nodes
import { AmplitudeEnvelopeNode } from "./tone/component-nodes/AmplitudeEnvelope";
import { FrequencyEnvelopeNode } from "./tone/component-nodes/FilterEnvelope";
import { EnvelopeNode } from "./tone/component-nodes/EnvelopeNode";
import { ChannelNode } from "./tone/component-nodes/ChannelNode";
import { PannerNode } from "./tone/component-nodes/PannerNode";
import { VolumeNode } from "./tone/component-nodes/VolumeNode";
import { MergeNode } from "./tone/component-nodes/MergeNode";
import { SplitNode } from "./tone/component-nodes/SplitNode";
import { CompressorNode } from "./tone/component-nodes/CompressorNode";
import { AnalyserNode } from "./tone/component-nodes/AnalyserNode";
import { FFTNode } from "./tone/component-nodes/FFTNode";
import { MeterNode } from "./tone/component-nodes/MeterNode";
import { WaveformNode } from "./tone/component-nodes/WaveformNode";

export const initialNodes: AppNode[] = [];

export const nodeTypes = {
  // Utility Nodes
  Midi: MidiInputNode,
  MidiPiano: MidiPianoNode,

  // Source Nodes
  OmniOscillator: OmniOscillatorNode,
  Oscillator: OscillatorNode,
  AMOscillator: AMOscillatorNode,
  FMOscillator: FMOscillatorNode,
  FatOscillator: FatOscillatorNode,
  PWMOscillator: PWMOscillatorNode,
  PulseOscillator: PulseOscillatorNode,
  LFO: LFONode,
  Player: PlayerNode,
  GrainPlayer: GrainPlayerNode,

  // Instrument Nodes
  Synth: SynthNode,
  MonoSynth: MonoSynthNode,
  AMSynth: AMSynthNode,
  FMSynth: FMSynthNode,
  DuoSynth: DuoSynthNode,
  PolySynth: PolySynthNode,

  // Effect Nodes
  Filter: FilterNode,
  Reverb: ReverbNode,
  Chorus: ChorusNode,
  AutoFilter: AutoFilterNode,
  AutoPanner: AutoPannerNode,
  AutoWah: AutoWahNode,
  BitCrusher: BitCrusherNode,
  Chebyshev: ChebyshevNode,
  Distortion: DistortionNode,
  FeedbackDelay: FeedbackDelayNode,
  Freeverb: FreeverbNode,
  FrequencyShifter: FrequencyShifterNode,
  JCReverb: JCReverbNode,
  Phaser: PhaserNode,
  PingPongDelay: PingPongDelayNode,
  PitchShift: PitchShiftNode,
  StereoWidener: StereoWidenerNode,
  Tremolo: TremoloNode,
  Vibrato: VibratoNode,
  Compressor: CompressorNode,

  // Component Nodes
  AmplitudeEnvelope: AmplitudeEnvelopeNode,
  FrequencyEnvelope: FrequencyEnvelopeNode,
  Envelope: EnvelopeNode,
  Channel: ChannelNode,
  Panner: PannerNode,
  Volume: VolumeNode,
  Merge: MergeNode,
  Split: SplitNode,
  Analyser: AnalyserNode,
  FFT: FFTNode,
  Meter: MeterNode,
  Waveform: WaveformNode,
} satisfies NodeTypes;
