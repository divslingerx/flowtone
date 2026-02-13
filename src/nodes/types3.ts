/**
 * types3.ts - Unified Type System for Flowtone
 *
 * This type system combines the best of types.ts and types2.ts:
 * - Uses ConstructorParameters (from types2.ts) for runtime-correct config types
 * - Adds discriminated union ("kind") for atomic vs composite nodes
 * - Supports user-created composite presets with parameter mapping
 * - Provides type-safe port configurations
 */

import type { Node, Edge, Position } from "@xyflow/react";
export type { Node, Edge };
import * as Tone from "tone";
import type { Source } from "tone/build/esm/source/Source";
import type { Effect } from "tone/build/esm/effect/Effect";
import type { Envelope, Signal } from "tone";
import type { Instrument } from "tone/build/esm/instrument/Instrument";

// ============================================================================
// EDGE TYPE
// ============================================================================

export interface AppEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// ============================================================================
// TONE.JS CLASS EXTRACTION (from types.ts/types2.ts)
// ============================================================================

/**
 * Generic utility type that extracts class names from Tone.js based on inheritance
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

export type ToneSourceKey = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Source<any>
>;

export type ToneEffectKey = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Effect<any>
>;

export type ToneInstrumentKey = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Instrument<any>
>;

export type ToneSignalKey = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Signal<any>
>;

export type ToneEnvelopeKey = ExtractClassesReturningType<
  typeof Tone,
  Tone.ToneAudioNodeOptions,
  Envelope
>;

// ============================================================================
// PORT SYSTEM TYPES
// ============================================================================

/**
 * Type of signal carried by a port
 */
export type SignalType = "audio" | "control" | "midi" | "trigger";

/**
 * Channel configuration for audio ports
 */
export type ChannelCount = 1 | 2;

/**
 * Port definition for a node
 */
export interface Port {
  /**
   * Unique ID within the node (e.g., "input-0", "frequency", "output-0")
   */
  id: string;

  /**
   * Port direction
   */
  type: "input" | "output";

  /**
   * Display label for UI
   */
  label?: string;

  /**
   * Signal type for connection validation
   */
  signalType: SignalType;

  /**
   * React Flow handle position
   */
  position: Position;

  /**
   * Optional position offset for multiple ports at same edge
   */
  positionOffset?: { x: number; y: number };

  /**
   * Tone.js connection index for multi-channel nodes
   * Used in connect(dest, outputNum, inputNum)
   */
  channelIndex?: number;

  /**
   * Named property path for Tone.js parameters
   * Examples: "frequency", "detune", "Q"
   * Used for connecting to Tone.Param objects
   */
  toneProperty?: string;

  /**
   * Channel count for audio ports
   */
  channelCount?: ChannelCount;
}

/**
 * Port configuration for a node type
 */
export interface PortConfig {
  inputs: Port[];
  outputs: Port[];
}

// ============================================================================
// PARAMETER MAPPING TYPES (for composite nodes)
// ============================================================================

/**
 * Transform function for parameter value mapping
 */
export type TransformFunction = (value: number) => number;

/**
 * Inverse transform for bidirectional sync
 */
export type InverseTransformFunction = (value: number) => number;

/**
 * Reference to an internal Tone.js parameter using dot-notation
 * Example: "oscillator.frequency", "filter.Q"
 */
export type ParameterPath = string;

/**
 * Parameter units (matches Tone.js unit system)
 */
export type ParameterUnits =
  | "frequency"
  | "cents"
  | "time"
  | "normalRange"
  | "number"
  | "decibels"
  | "degrees";

/**
 * Mapping configuration for exposing internal parameters
 */
export interface ParameterMapping {
  /**
   * External parameter name (shown in composite node UI)
   */
  externalName: string;

  /**
   * Internal parameter path(s) to control
   * Can be single path (1:1) or array (1:N mapping)
   */
  internalTargets: ParameterPath | ParameterPath[];

  /**
   * Transform function from external value to internal value
   * @default (v) => v (identity function)
   */
  transform?: TransformFunction;

  /**
   * Inverse transform for reading internal value back
   * Required for bidirectional sync
   */
  inverseTransform?: InverseTransformFunction;

  /**
   * Units for the parameter (used for automation)
   */
  units?: ParameterUnits;

  /**
   * Min/max range for external control (before transform)
   */
  range?: {
    min: number;
    max: number;
  };

  /**
   * Whether this parameter can be automated
   * @default true
   */
  automatable?: boolean;
}

/**
 * Maps external port to internal node port
 */
export interface PortMapping {
  /**
   * External port ID on composite boundary
   */
  externalPortId: string;

  /**
   * Internal node ID within the composite
   */
  internalNodeId: string;

  /**
   * Internal port ID on that node
   */
  internalPortId: string;
}

// ============================================================================
// ATOMIC NODE TYPES (Single Tone.js wrapper)
// ============================================================================

/**
 * Atomic node wrapping a single Tone.js audio node
 * Uses ConstructorParameters for runtime-correct config types
 */
export type AtomicToneNode<
  T extends ToneComponentKey,
  P = ConstructorParameters<(typeof Tone)[T]>[0]
> = Node<
  {
    /**
     * Discriminator for type narrowing
     */
    kind: "atomic";

    /**
     * Display label
     */
    label: string;

    /**
     * Tone.js node type
     */
    toneType: T;

    /**
     * Node configuration (matches constructor signature)
     */
    config: P;

    /**
     * Optional port configuration override
     * If not provided, uses default from port registry
     */
    ports?: PortConfig;
  },
  T
>;

// ============================================================================
// COMPOSITE NODE TYPES (User-created presets)
// ============================================================================

/**
 * Composite node containing multiple nodes packaged as a preset
 */
export type CompositeNode = Node<
  {
    /**
     * Discriminator for type narrowing
     */
    kind: "composite";

    /**
     * Display label
     */
    label: string;

    /**
     * Unique ID referencing the composite definition
     */
    definitionId: string;

    /**
     * Version of the definition being used
     */
    definitionVersion: number;

    /**
     * Current parameter values for this instance
     * Keyed by parameter name
     */
    parameterValues: Record<string, number | string | boolean>;

    /**
     * Internal node graph
     */
    subGraph: {
      nodes: AppNode[]; // Can include other composites (nested)
      edges: AppEdge[];
    };

    /**
     * Parameter mappings from external to internal
     */
    parameterMappings: ParameterMapping[];

    /**
     * Port mappings from external to internal
     */
    portMappings: {
      inputs: PortMapping[];
      outputs: PortMapping[];
    };

    /**
     * Port configuration for the composite itself
     */
    ports: PortConfig;

    /**
     * Whether the internal graph is currently visible (expanded state)
     */
    isExpanded?: boolean;

    /**
     * Whether the definition is locked (prevents editing)
     */
    isLocked?: boolean;

    /**
     * Instance metadata
     */
    instanceId: string;
  },
  "Composite"
>;

/**
 * Composite definition (the "class" for composite nodes)
 * Stored separately and referenced by instances
 */
export interface CompositeDefinition {
  /**
   * Unique ID for this composite type
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Optional description
   */
  description?: string;

  /**
   * Category for organization
   */
  category?: string;

  /**
   * Visual metadata
   */
  color?: string;
  icon?: string;

  /**
   * Internal node graph template
   */
  internalNodes: AppNode[];
  internalEdges: AppEdge[];

  /**
   * External interface definition
   */
  parameters: Array<{
    id: string;
    label: string;
    type: "number" | "select" | "toggle";
    defaultValue: number | string | boolean;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    options?: string[];
    mappings: ParameterMapping[];
  }>;

  ports: {
    inputs: Port[];
    outputs: Port[];
  };

  /**
   * Visual appearance when collapsed
   */
  collapsedWidth?: number;
  collapsedHeight?: number;

  /**
   * Version tracking
   */
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// UTILITY NODE TYPES (Non-Tone.js)
// ============================================================================

export type MidiInputNode = Node<
  {
    kind: "utility";
    label: string;
    config: Record<string, unknown>;
    connections?: AppEdge[];
  },
  "Midi"
>;

export type MidiPianoNode = Node<
  {
    kind: "utility";
    label: string;
    config: Record<string, unknown>;
    connections?: AppEdge[];
  },
  "MidiPiano"
>;

export type StoreNode = Node<
  {
    kind: "utility";
    config: Record<string, unknown>;
  },
  "StoreNode"
>;

// ============================================================================
// CONCRETE ATOMIC NODE TYPES (with proper type extraction)
// ============================================================================

// TONE SOURCE NODES
export type AMOscillatorNode = AtomicToneNode<"AMOscillator">;
export type FMOscillatorNode = AtomicToneNode<"FMOscillator">;
export type FatOscillatorNode = AtomicToneNode<"FatOscillator">;
export type GrainPlayerNode = AtomicToneNode<"GrainPlayer">;
export type LFONode = AtomicToneNode<"LFO">;
export type OmniOscillatorNode = AtomicToneNode<"OmniOscillator">;
export type OscillatorNode = AtomicToneNode<"Oscillator">;
export type PWMOscillatorNode = AtomicToneNode<"PWMOscillator">;
export type PlayerNode = AtomicToneNode<"Player">;
export type PlayersNode = AtomicToneNode<"Players">;
export type PulseOscillatorNode = AtomicToneNode<"PulseOscillator">;
export type ToneBufferSourceNode = AtomicToneNode<"ToneBufferSource">;
export type ToneOscillatorNode = AtomicToneNode<"ToneOscillatorNode">;
export type UserMediaNode = AtomicToneNode<"UserMedia">;

// TONE INSTRUMENT NODES
export type AMSynthNode = AtomicToneNode<"AMSynth">;
export type DuoSynthNode = AtomicToneNode<"DuoSynth">;
export type FMSynthNode = AtomicToneNode<"FMSynth">;
export type MembraneSynthNode = AtomicToneNode<"MembraneSynth">;
export type MetalSynthNode = AtomicToneNode<"MetalSynth">;
export type MonoSynthNode = AtomicToneNode<"MonoSynth">;
export type NoiseSynthNode = AtomicToneNode<"NoiseSynth">;
export type PluckSynthNode = AtomicToneNode<"PluckSynth">;
export type PolySynthNode = AtomicToneNode<"PolySynth">;
export type SamplerNode = AtomicToneNode<"Sampler">;
export type SynthNode = AtomicToneNode<"Synth">;

// TONE EFFECT NODES
export type AutoFilterNode = AtomicToneNode<"AutoFilter">;
export type AutoPannerNode = AtomicToneNode<"AutoPanner">;
export type AutoWahNode = AtomicToneNode<"AutoWah">;
export type BitCrusherNode = AtomicToneNode<"BitCrusher">;
export type ChebyshevNode = AtomicToneNode<"Chebyshev">;
export type ChorusNode = AtomicToneNode<"Chorus">;
export type DistortionNode = AtomicToneNode<"Distortion">;
export type FeedbackDelayNode = AtomicToneNode<"FeedbackDelay">;
export type FreeverbNode = AtomicToneNode<"Freeverb">;
export type FrequencyShifterNode = AtomicToneNode<"FrequencyShifter">;
export type JCReverbNode = AtomicToneNode<"JCReverb">;
export type PhaserNode = AtomicToneNode<"Phaser">;
export type PingPongDelayNode = AtomicToneNode<"PingPongDelay">;
export type PitchShiftNode = AtomicToneNode<"PitchShift">;
export type ReverbNode = AtomicToneNode<"Reverb">;
export type StereoWidenerNode = AtomicToneNode<"StereoWidener">;
export type TremoloNode = AtomicToneNode<"Tremolo">;
export type VibratoNode = AtomicToneNode<"Vibrato">;

// TONE COMPONENT NODES
export type AmplitudeEnvelopeNode = AtomicToneNode<"AmplitudeEnvelope">;
export type AnalyserNode = AtomicToneNode<"Analyser">;
export type BiquadFilterNode = AtomicToneNode<"BiquadFilter">;
export type ChannelNode = AtomicToneNode<"Channel">;
export type CompressorNode = AtomicToneNode<"Compressor">;
export type ConvolverNode = AtomicToneNode<"Convolver">;
export type CrossFadeNode = AtomicToneNode<"CrossFade">;
export type DCMeterNode = AtomicToneNode<"DCMeter">;
export type EQ3Node = AtomicToneNode<"EQ3">;
export type EnvelopeNode = AtomicToneNode<"Envelope">;
export type FFTNode = AtomicToneNode<"FFT">;
export type FeedbackCombFilterNode = AtomicToneNode<"FeedbackCombFilter">;
export type FilterNode = AtomicToneNode<"Filter">;
export type FollowerNode = AtomicToneNode<"Follower">;
export type FrequencyEnvelopeNode = AtomicToneNode<"FrequencyEnvelope">;
export type GateNode = AtomicToneNode<"Gate">;
export type LimiterNode = AtomicToneNode<"Limiter">;
export type LowpassCombFilterNode = AtomicToneNode<"LowpassCombFilter">;
export type MergeNode = AtomicToneNode<"Merge">;
export type MeterNode = AtomicToneNode<"Meter">;
export type MidSideCompressorNode = AtomicToneNode<"MidSideCompressor">;
export type MidSideMergeNode = AtomicToneNode<"MidSideMerge">;
export type MidSideSplitNode = AtomicToneNode<"MidSideSplit">;
export type MonoNode = AtomicToneNode<"Mono">;
export type MultibandCompressorNode = AtomicToneNode<"MultibandCompressor">;
export type MultibandSplitNode = AtomicToneNode<"MultibandSplit">;
export type OnePoleFilterNode = AtomicToneNode<"OnePoleFilter">;
export type PanVolNode = AtomicToneNode<"PanVol">;

// Special case: Panner (takes single number parameter)
export type PannerNode = Node<
  {
    kind: "atomic";
    label: string;
    value: number;
  },
  "Panner"
>;

export type Panner3DNode = AtomicToneNode<"Panner3D">;
export type RecorderNode = AtomicToneNode<"Recorder">;
export type SoloNode = AtomicToneNode<"Solo">;
export type SplitNode = AtomicToneNode<"Split">;
export type VolumeNode = AtomicToneNode<"Volume">;
export type WaveformNode = AtomicToneNode<"Waveform">;

// ============================================================================
// UNIFIED APP NODE TYPE (Discriminated Union)
// ============================================================================

/**
 * Unified app node type - can be atomic Tone.js node, composite preset, or utility node
 * Discriminated by the "kind" field for type-safe narrowing
 */
export type AppNode =
  // Atomic Tone.js nodes
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
  // Composite nodes
  | CompositeNode
  // Utility nodes
  | MidiInputNode
  | MidiPianoNode
  | StoreNode;

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for atomic Tone.js nodes
 */
export function isAtomicNode(node: AppNode): node is Extract<AppNode, { data: { kind: "atomic" } }> {
  return "data" in node && "kind" in node.data && node.data.kind === "atomic";
}

/**
 * Type guard for composite nodes
 */
export function isCompositeNode(node: AppNode): node is CompositeNode {
  return "data" in node && "kind" in node.data && node.data.kind === "composite";
}

/**
 * Type guard for utility nodes
 */
export function isUtilityNode(
  node: AppNode
): node is MidiInputNode | MidiPianoNode | StoreNode {
  return "data" in node && "kind" in node.data && node.data.kind === "utility";
}

/**
 * Type guard for specific Tone.js node type
 */
export function isToneNodeType<T extends ToneComponentKey>(
  node: AppNode,
  nodeType: T
): boolean {
  return isAtomicNode(node) && "toneType" in node.data && node.data.toneType === nodeType;
}
