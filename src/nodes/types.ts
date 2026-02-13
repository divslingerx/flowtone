import type { Node } from "@xyflow/react";
export type { Node };
import * as Tone from "tone";

// Re-export ToneComponentKey from types3.ts (the current type system)
export type { ToneComponentKey } from "./types3";
import type { Source } from "tone/build/esm/source/Source";
import type { Effect } from "tone/build/esm/effect/Effect";
import type { Envelope, Signal } from "tone";
import type { Instrument } from "tone/build/esm/instrument/Instrument";

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
ExtractClassKeysReturningType is a generic utility type that extracts class names from an object (T) based on certain conditions:

- It iterates over the keys (K) of the object T.
- For each key, it checks if the value is a class constructor (new (...args: any[])).
- It infers the return type (R) of the constructor.
- It checks if R extends ReturnType and BaseClass.
- If all conditions are met, it returns the key (K); otherwise, it returns never.

The final result is a union of all keys that satisfy the conditions.
*/
type ExtractClassKeysReturningType<T, ReturnType, BaseClass> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends { new (...args: any[]): infer R }
    ? R extends ReturnType
      ? R extends BaseClass
        ? K
        : never
      : never
    : never;
}[keyof T];

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

export type ToneNodeConstructor<T extends ToneNodeKey> = {
  new (
    config?: Partial<ExtractToneComponentDefaults<(typeof Tone)[T]>>
  ): InstanceType<(typeof Tone)[T]>;
};

export type ToneAudioNodeKey = ExtractClassKeysReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Tone.ToneAudioNode
>;
export type ToneAudioNodeType = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Tone.ToneAudioNode
>;

export type ToneSourceKey = ExtractClassKeysReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Source<any>
>;

export type ToneSourceType = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Source<any>
>;

export type ToneEffectKey = ExtractClassKeysReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Effect<any>
>;

export type ToneEffectType = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Effect<any>
>;

export type ToneInstrumentKey = ExtractClassKeysReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Instrument<any>
>;
export type ToneInstrumentType = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Instrument<any>
>;

export type ToneSignalKey = ExtractClassKeysReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Signal<any>
>;

export type ToneSignalType = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Signal<any>
>;

export type ToneEnvelopeKey = ExtractClassKeysReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Envelope
>;

export type ToneEnvelopeType = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Envelope
>;

export type ToneNodeKey =
  | ToneAudioNodeKey
  | ToneSourceKey
  | ToneEffectKey
  | ToneInstrumentKey
  | ToneSignalKey
  | ToneEnvelopeKey;

export type ToneNodeType =
  | ToneAudioNodeType
  | ToneSourceType
  | ToneEffectType
  | ToneInstrumentType
  | ToneSignalType
  | ToneEnvelopeType;

export type ExtractToneComponentDefaults<T> = T extends {
  getDefaults: () => infer C;
}
  ? C
  : never;

export type ToneNode<T = ToneNodeKey> = Node<
  {
    label: string;
    type: T;
    package: "Tone";
    config: Partial<
      ExtractToneComponentDefaults<(typeof Tone)[T & keyof typeof Tone]>
    >;
  },
  T extends string ? T : never
>;

// TONE SOURCE NODES
export type AMOscillatorNode = ToneNode<"AMOscillator">;
export type FMOscillatorNode = ToneNode<"FMOscillator">;
export type FatOscillatorNode = ToneNode<"FatOscillator">;
export type GrainPlayerNode = ToneNode<"GrainPlayer">;
export type LFONode = ToneNode<"LFO">;
export type OmniOscillatorNode = ToneNode<"OmniOscillator">;
export type OscillatorNode = ToneNode<"Oscillator">;
export type PWMOscillatorNode = ToneNode<"PWMOscillator">;
export type PlayerNode = ToneNode<"Player">;
export type PlayersNode = ToneNode<"Players">;
export type PulseOscillatorNode = ToneNode<"PulseOscillator">;
export type ToneBufferSourceNode = ToneNode<"ToneBufferSource">;
export type ToneOscillatorNode = ToneNode<"ToneOscillatorNode">;
export type UserMediaNode = ToneNode<"UserMedia">;

// TONE INSTRUMENT NODES
export type AMSynthNode = ToneNode<"AMSynth">;
export type DuoSynthNode = ToneNode<"DuoSynth">;
export type FMSynthNode = ToneNode<"FMSynth">;
export type MembraneSynthNode = ToneNode<"MembraneSynth">;
export type MetalSynthNode = ToneNode<"MetalSynth">;
export type MonoSynthNode = ToneNode<"MonoSynth">;
export type NoiseSynthNode = ToneNode<"NoiseSynth">;
export type PluckSynthNode = ToneNode<"PluckSynth">;
export type PolySynthNode = ToneNode<"PolySynth">;
export type SamplerNode = ToneNode<"Sampler">;
export type SynthNode = ToneNode<"Synth">;

// TONE EFFECT NODES
export type AutoFilterNode = ToneNode<"AutoFilter">;
export type AutoPannerNode = ToneNode<"AutoPanner">;
export type AutoWahNode = ToneNode<"AutoWah">;
export type BitCrusherNode = ToneNode<"BitCrusher">;
export type ChebyshevNode = ToneNode<"Chebyshev">;
export type ChorusNode = ToneNode<"Chorus">;
export type DistortionNode = ToneNode<"Distortion">;
export type FeedbackDelayNode = ToneNode<"FeedbackDelay">;
export type FreeverbNode = ToneNode<"Freeverb">;
export type FrequencyShifterNode = ToneNode<"FrequencyShifter">;
export type JCReverbNode = ToneNode<"JCReverb">;
export type PhaserNode = ToneNode<"Phaser">;
export type PingPongDelayNode = ToneNode<"PingPongDelay">;
export type PitchShiftNode = ToneNode<"PitchShift">;
export type ReverbNode = ToneNode<"Reverb">;
export type StereoWidenerNode = ToneNode<"StereoWidener">;
export type TremoloNode = ToneNode<"Tremolo">;
export type VibratoNode = ToneNode<"Vibrato">;

// TONE COMPONENT NODES
export type AmplitudeEnvelopeNode = ToneNode<"AmplitudeEnvelope">;
export type AnalyserNode = ToneNode<"Analyser">;
export type BiquadFilterNode = ToneNode<"BiquadFilter">;
export type ChannelNode = ToneNode<"Channel">;
export type CompressorNode = ToneNode<"Compressor">;
export type ConvolverNode = ToneNode<"Convolver">;
export type CrossFadeNode = ToneNode<"CrossFade">;
export type DCMeterNode = ToneNode<"DCMeter">;
export type EQ3Node = ToneNode<"EQ3">;
export type EnvelopeNode = ToneNode<"Envelope">;
export type FFTNode = ToneNode<"FFT">;
export type FeedbackCombFilterNode = ToneNode<"FeedbackCombFilter">;
export type FilterNode = ToneNode<"Filter">;
export type FollowerNode = ToneNode<"Follower">;
export type FrequencyEnvelopeNode = ToneNode<"FrequencyEnvelope">;
export type GateNode = ToneNode<"Gate">;
export type LimiterNode = ToneNode<"Limiter">;
export type LowpassCombFilterNode = ToneNode<"LowpassCombFilter">;
export type MergeNode = ToneNode<"Merge">;
export type MeterNode = ToneNode<"Meter">;
export type MidSideCompressorNode = ToneNode<"MidSideCompressor">;
export type MidSideMergeNode = ToneNode<"MidSideMerge">;
export type MidSideSplitNode = ToneNode<"MidSideSplit">;
export type MonoNode = ToneNode<"Mono">;
export type MultibandCompressorNode = ToneNode<"MultibandCompressor">;
export type MultibandSplitNode = ToneNode<"MultibandSplit">;
export type OnePoleFilterNode = ToneNode<"OnePoleFilter">;
export type PanVolNode = ToneNode<"PanVol">;

// Because the Panner node in Tone only takes a number as its single paremeter - We need to make a one off type for this becuase it breaks when used in the Generic.
export type PannerNode = Node<
  {
    label: string;
    value: number;
  },
  "Panner"
>;

export type Panner3DNode = ToneNode<"Panner3D">;
export type RecorderNode = ToneNode<"Recorder">;
export type SoloNode = ToneNode<"Solo">;
export type SplitNode = ToneNode<"Split">;
export type VolumeNode = ToneNode<"Volume">;
export type WaveformNode = ToneNode<"Waveform">;

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
