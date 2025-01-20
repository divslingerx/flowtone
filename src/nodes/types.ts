import type { Node } from "@xyflow/react";
export type { Node };
import * as Tone from "tone";

export interface AppEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export type MidiInputNode = Node<
  {
    label: string;
    config: Record<string, unknown>;
    connections?: AppEdge[];
  },
  "Midi"
>;

export type StoreNode = Node<Record<string, unknown>, "StoreNode">;

export type MidiPianoNode = Node<
  {
    label: string;
    config: Record<string, unknown>;
    connections?: AppEdge[];
  },
  "MidiPiano"
>;

/* 
ExtractClassesReturningType is a generic utility type that extracts class names from an object (T) based on certain conditions:

- It iterates over the keys (K) of the object T.
- For each key, it checks if the value is a class constructor (new (...args: any[])).
- It infers the return type (R) of the constructor.
- It checks if R extends ReturnType and BaseClass.
- If all conditions are met, it returns the key (K); otherwise, it returns never.

The final result is a union of all keys that satisfy the conditions.
*/
type ExtractClassesReturningType<T, ReturnType, BaseClass> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends { new (...args: any[]): infer R }
    ? R extends ReturnType
      ? R extends BaseClass
        ? K
        : never
      : never
    : never;
}[keyof T];

export type ToneComponentKey = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Tone.ToneAudioNode
>;

type ToneComponent<
  T extends ToneComponentKey,
  P = ConstructorParameters<(typeof Tone)[T]>[0],
> = Node<
  P & {
    label: string;
  },
  T
>;

// TONE SOURCE NODES
export type AMOscillatorNode = ToneComponent<"AMOscillator">;
export type FMOscillatorNode = ToneComponent<"FMOscillator">;
export type FatOscillatorNode = ToneComponent<"FatOscillator">;
export type GrainPlayerNode = ToneComponent<"GrainPlayer">;
export type LFONode = ToneComponent<"LFO">;
export type OmniOscillatorNode = ToneComponent<"OmniOscillator">;
export type OscillatorNode = ToneComponent<"Oscillator">;
export type PWMOscillatorNode = ToneComponent<"PWMOscillator">;
export type PlayerNode = ToneComponent<"Player">;
export type PlayersNode = ToneComponent<"Players">;
export type PulseOscillatorNode = ToneComponent<"PulseOscillator">;
export type ToneBufferSourceNode = ToneComponent<"ToneBufferSource">;
export type ToneOscillatorNode = ToneComponent<"ToneOscillatorNode">;
export type UserMediaNode = ToneComponent<"UserMedia">;

// TONE INSTRUMENT NODES
export type AMSynthNode = ToneComponent<"AMSynth">;
export type DuoSynthNode = ToneComponent<"DuoSynth">;
export type FMSynthNode = ToneComponent<"FMSynth">;
export type MembraneSynthNode = ToneComponent<"MembraneSynth">;
export type MetalSynthNode = ToneComponent<"MetalSynth">;
export type MonoSynthNode = ToneComponent<"MonoSynth">;
export type NoiseSynthNode = ToneComponent<"NoiseSynth">;
export type PluckSynthNode = ToneComponent<"PluckSynth">;
export type PolySynthNode = ToneComponent<"PolySynth">;
export type SamplerNode = ToneComponent<"Sampler">;
export type SynthNode = ToneComponent<"Synth">;

// TONE EFFECT NODES
export type AutoFilterNode = ToneComponent<"AutoFilter">;
export type AutoPannerNode = ToneComponent<"AutoPanner">;
export type AutoWahNode = ToneComponent<"AutoWah">;
export type BitCrusherNode = ToneComponent<"BitCrusher">;
export type ChebyshevNode = ToneComponent<"Chebyshev">;
export type ChorusNode = ToneComponent<"Chorus">;
export type DistortionNode = ToneComponent<"Distortion">;
export type FeedbackDelayNode = ToneComponent<"FeedbackDelay">;
export type FreeverbNode = ToneComponent<"Freeverb">;
export type FrequencyShifterNode = ToneComponent<"FrequencyShifter">;
export type JCReverbNode = ToneComponent<"JCReverb">;
export type PhaserNode = ToneComponent<"Phaser">;
export type PingPongDelayNode = ToneComponent<"PingPongDelay">;
export type PitchShiftNode = ToneComponent<"PitchShift">;
export type ReverbNode = ToneComponent<"Reverb">;
export type StereoWidenerNode = ToneComponent<"StereoWidener">;
export type TremoloNode = ToneComponent<"Tremolo">;
export type VibratoNode = ToneComponent<"Vibrato">;

// TONE COMPONENT NODES
export type AmplitudeEnvelopeNode = ToneComponent<"AmplitudeEnvelope">;
export type AnalyserNode = ToneComponent<"Analyser">;
export type BiquadFilterNode = ToneComponent<"BiquadFilter">;
export type ChannelNode = ToneComponent<"Channel">;
export type CompressorNode = ToneComponent<"Compressor">;
export type ConvolverNode = ToneComponent<"Convolver">;
export type CrossFadeNode = ToneComponent<"CrossFade">;
export type DCMeterNode = ToneComponent<"DCMeter">;
export type EQ3Node = ToneComponent<"EQ3">;
export type EnvelopeNode = ToneComponent<"Envelope">;
export type FFTNode = ToneComponent<"FFT">;
export type FeedbackCombFilterNode = ToneComponent<"FeedbackCombFilter">;
export type FilterNode = ToneComponent<"Filter">;
export type FollowerNode = ToneComponent<"Follower">;
export type FrequencyEnvelopeNode = ToneComponent<"FrequencyEnvelope">;
export type GateNode = ToneComponent<"Gate">;
export type LimiterNode = ToneComponent<"Limiter">;
export type LowpassCombFilterNode = ToneComponent<"LowpassCombFilter">;
export type MergeNode = ToneComponent<"Merge">;
export type MeterNode = ToneComponent<"Meter">;
export type MidSideCompressorNode = ToneComponent<"MidSideCompressor">;
export type MidSideMergeNode = ToneComponent<"MidSideMerge">;
export type MidSideSplitNode = ToneComponent<"MidSideSplit">;
export type MonoNode = ToneComponent<"Mono">;
export type MultibandCompressorNode = ToneComponent<"MultibandCompressor">;
export type MultibandSplitNode = ToneComponent<"MultibandSplit">;
export type OnePoleFilterNode = ToneComponent<"OnePoleFilter">;
export type PanVolNode = ToneComponent<"PanVol">;

// Because the Panner node in Tone only takes a number as its single paremeter - We need to make a one off type for this becuase it breaks when used in the Generic.
export type PannerNode = Node<
  {
    label: string;
    value: number;
  },
  "Panner"
>;

export type Panner3DNode = ToneComponent<"Panner3D">;
export type RecorderNode = ToneComponent<"Recorder">;
export type SoloNode = ToneComponent<"Solo">;
export type SplitNode = ToneComponent<"Split">;
export type VolumeNode = ToneComponent<"Volume">;
export type WaveformNode = ToneComponent<"Waveform">;

export type AppNode =
  | AMOscillatorNode
  | FMOscillatorNode
  | FatOscillatorNode
  | GrainPlayerNode
  | LFONode
  | OmniOscillatorNode
  | OscillatorNode
  | PWMOscillatorNode
  | PlayerNode
  | PlayersNode
  | PulseOscillatorNode
  | ToneBufferSourceNode
  | ToneOscillatorNode
  | UserMediaNode
  | AMSynthNode
  | DuoSynthNode
  | FMSynthNode
  | MembraneSynthNode
  | MetalSynthNode
  | MonoSynthNode
  | NoiseSynthNode
  | PluckSynthNode
  | PolySynthNode
  | SamplerNode
  | SynthNode
  | AutoFilterNode
  | AutoPannerNode
  | AutoWahNode
  | BitCrusherNode
  | ChebyshevNode
  | ChorusNode
  | DistortionNode
  | FeedbackDelayNode
  | FreeverbNode
  | FrequencyShifterNode
  | JCReverbNode
  | PhaserNode
  | PingPongDelayNode
  | PitchShiftNode
  | ReverbNode
  | StereoWidenerNode
  | TremoloNode
  | VibratoNode
  | AmplitudeEnvelopeNode
  | AnalyserNode
  | BiquadFilterNode
  | ChannelNode
  | CompressorNode
  | ConvolverNode
  | CrossFadeNode
  | DCMeterNode
  | EQ3Node
  | EnvelopeNode
  | FFTNode
  | FeedbackCombFilterNode
  | FilterNode
  | FollowerNode
  | FrequencyEnvelopeNode
  | GateNode
  | LimiterNode
  | LowpassCombFilterNode
  | MergeNode
  | MeterNode
  | MidSideCompressorNode
  | MidSideMergeNode
  | MidSideSplitNode
  | MonoNode
  | MultibandCompressorNode
  | MultibandSplitNode
  | OnePoleFilterNode
  | PanVolNode
  | PannerNode
  | Panner3DNode
  | RecorderNode
  | SoloNode
  | SplitNode
  | VolumeNode
  | WaveformNode
  | MidiInputNode
  | StoreNode
  | MidiPianoNode;
