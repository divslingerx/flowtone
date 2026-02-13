/**
 * Port registry for Tone.js nodes
 *
 * Central registry defining port configurations for all Tone.js node types.
 * This metadata cannot be extracted automatically from Tone.js, so it's
 * manually defined here.
 */

import { Position } from "@xyflow/react";
import type { ToneComponentKey, PortConfig } from "~/nodes/types3";
import {
  createSinglePortConfig,
  createSourcePortConfig,
  createMergePortConfig,
  createSplitPortConfig,
} from "./types";

// ============================================================================
// PORT REGISTRY
// ============================================================================

/**
 * Complete port configurations for Tone.js nodes
 */
export const TONE_PORT_REGISTRY: Partial<Record<ToneComponentKey, PortConfig>> = {
  // ============================================================================
  // SOURCE NODES (no inputs, audio output only)
  // ============================================================================

  OmniOscillator: createSourcePortConfig("audio"),

  Oscillator: createSourcePortConfig("audio"),

  AMOscillator: createSourcePortConfig("audio"),

  FMOscillator: createSourcePortConfig("audio"),

  FatOscillator: createSourcePortConfig("audio"),

  PWMOscillator: createSourcePortConfig("audio"),

  PulseOscillator: createSourcePortConfig("audio"),

  LFO: {
    inputs: [],
    outputs: [
      {
        id: "output",
        type: "output",
        label: "LFO Out",
        signalType: "control",
        position: Position.Bottom,
        channelIndex: 0,
      },
    ],
  },

  Player: createSourcePortConfig("audio"),

  GrainPlayer: createSourcePortConfig("audio"),

  // ============================================================================
  // INSTRUMENT NODES (no audio inputs, audio output + frequency control)
  // ============================================================================

  Synth: {
    inputs: [
      {
        id: "frequency",
        type: "input",
        label: "Freq CV",
        signalType: "control",
        position: Position.Left,
        toneProperty: "frequency",
      },
    ],
    outputs: [
      {
        id: "output",
        type: "output",
        label: "Audio Out",
        signalType: "audio",
        position: Position.Bottom,
        channelIndex: 0,
      },
    ],
  },

  MonoSynth: {
    inputs: [
      {
        id: "frequency",
        type: "input",
        label: "Freq CV",
        signalType: "control",
        position: Position.Left,
        toneProperty: "frequency",
      },
    ],
    outputs: [
      {
        id: "output",
        type: "output",
        label: "Audio Out",
        signalType: "audio",
        position: Position.Bottom,
        channelIndex: 0,
      },
    ],
  },

  // ============================================================================
  // EFFECT NODES (audio input → audio output)
  // ============================================================================

  Filter: {
    inputs: [
      {
        id: "input",
        type: "input",
        label: "Audio In",
        signalType: "audio",
        position: Position.Top,
        channelIndex: 0,
        channelCount: 2,
      },
      {
        id: "frequency",
        type: "input",
        label: "Cutoff CV",
        signalType: "control",
        position: Position.Left,
        toneProperty: "frequency",
      },
      {
        id: "Q",
        type: "input",
        label: "Q CV",
        signalType: "control",
        position: Position.Right,
        toneProperty: "Q",
      },
    ],
    outputs: [
      {
        id: "output",
        type: "output",
        label: "Audio Out",
        signalType: "audio",
        position: Position.Bottom,
        channelIndex: 0,
        channelCount: 2,
      },
    ],
  },

  Reverb: createSinglePortConfig("audio"),

  Delay: createSinglePortConfig("audio"),

  FeedbackDelay: createSinglePortConfig("audio"),

  Chorus: createSinglePortConfig("audio"),

  Phaser: createSinglePortConfig("audio"),

  Distortion: createSinglePortConfig("audio"),

  Compressor: createSinglePortConfig("audio"),

  AutoFilter: createSinglePortConfig("audio"),

  AutoPanner: createSinglePortConfig("audio"),

  AutoWah: createSinglePortConfig("audio"),

  BitCrusher: createSinglePortConfig("audio"),

  Chebyshev: createSinglePortConfig("audio"),

  Freeverb: createSinglePortConfig("audio"),

  JCReverb: createSinglePortConfig("audio"),

  PingPongDelay: createSinglePortConfig("audio"),

  PitchShift: createSinglePortConfig("audio"),

  FrequencyShifter: createSinglePortConfig("audio"),

  StereoWidener: createSinglePortConfig("audio"),

  Tremolo: createSinglePortConfig("audio"),

  Vibrato: createSinglePortConfig("audio"),

  // ============================================================================
  // COMPONENT NODES (various configurations)
  // ============================================================================

  AmplitudeEnvelope: {
    inputs: [
      {
        id: "input",
        type: "input",
        label: "Audio In",
        signalType: "audio",
        position: Position.Top,
        channelIndex: 0,
      },
    ],
    outputs: [
      {
        id: "output",
        type: "output",
        label: "Audio Out",
        signalType: "audio",
        position: Position.Bottom,
        channelIndex: 0,
      },
    ],
  },

  FrequencyEnvelope: {
    inputs: [],
    outputs: [
      {
        id: "output",
        type: "output",
        label: "Envelope Out",
        signalType: "control",
        position: Position.Bottom,
        channelIndex: 0,
      },
    ],
  },

  Envelope: {
    inputs: [],
    outputs: [
      {
        id: "output",
        type: "output",
        label: "Envelope Out",
        signalType: "control",
        position: Position.Bottom,
        channelIndex: 0,
      },
    ],
  },

  Channel: {
    inputs: [
      {
        id: "input",
        type: "input",
        label: "Audio In",
        signalType: "audio",
        position: Position.Top,
        channelIndex: 0,
        channelCount: 2,
      },
      {
        id: "volume",
        type: "input",
        label: "Volume CV",
        signalType: "control",
        position: Position.Left,
        toneProperty: "volume",
      },
      {
        id: "pan",
        type: "input",
        label: "Pan CV",
        signalType: "control",
        position: Position.Right,
        toneProperty: "pan",
      },
    ],
    outputs: [
      {
        id: "output",
        type: "output",
        label: "Audio Out",
        signalType: "audio",
        position: Position.Bottom,
        channelIndex: 0,
        channelCount: 2,
      },
    ],
  },

  Panner: {
    inputs: [
      {
        id: "input",
        type: "input",
        label: "Audio In",
        signalType: "audio",
        position: Position.Top,
        channelIndex: 0,
      },
      {
        id: "pan",
        type: "input",
        label: "Pan CV",
        signalType: "control",
        position: Position.Right,
        toneProperty: "pan",
      },
    ],
    outputs: [
      {
        id: "output",
        type: "output",
        label: "Stereo Out",
        signalType: "audio",
        position: Position.Bottom,
        channelIndex: 0,
        channelCount: 2,
      },
    ],
  },

  // ============================================================================
  // MULTI-CHANNEL NODES
  // ============================================================================

  Merge: createMergePortConfig(2),

  Split: createSplitPortConfig(2),

  MultibandSplit: {
    inputs: [
      {
        id: "input",
        type: "input",
        label: "Audio In",
        signalType: "audio",
        position: Position.Top,
        channelIndex: 0,
      },
    ],
    outputs: [
      {
        id: "low",
        type: "output",
        label: "Low",
        signalType: "audio",
        position: Position.Bottom,
        positionOffset: { x: -30, y: 0 },
        toneProperty: "low",
      },
      {
        id: "mid",
        type: "output",
        label: "Mid",
        signalType: "audio",
        position: Position.Bottom,
        positionOffset: { x: 0, y: 0 },
        toneProperty: "mid",
      },
      {
        id: "high",
        type: "output",
        label: "High",
        signalType: "audio",
        position: Position.Bottom,
        positionOffset: { x: 30, y: 0 },
        toneProperty: "high",
      },
    ],
  },

  // Additional instruments
  AMSynth: {
    inputs: [
      {
        id: "frequency",
        type: "input",
        label: "Freq CV",
        signalType: "control",
        position: Position.Left,
        toneProperty: "frequency",
      },
    ],
    outputs: [
      {
        id: "output",
        type: "output",
        label: "Audio Out",
        signalType: "audio",
        position: Position.Bottom,
        channelIndex: 0,
      },
    ],
  },

  FMSynth: {
    inputs: [
      {
        id: "frequency",
        type: "input",
        label: "Freq CV",
        signalType: "control",
        position: Position.Left,
        toneProperty: "frequency",
      },
    ],
    outputs: [
      {
        id: "output",
        type: "output",
        label: "Audio Out",
        signalType: "audio",
        position: Position.Bottom,
        channelIndex: 0,
      },
    ],
  },

  DuoSynth: {
    inputs: [
      {
        id: "frequency",
        type: "input",
        label: "Freq CV",
        signalType: "control",
        position: Position.Left,
        toneProperty: "frequency",
      },
    ],
    outputs: [
      {
        id: "output",
        type: "output",
        label: "Audio Out",
        signalType: "audio",
        position: Position.Bottom,
        channelIndex: 0,
      },
    ],
  },

  PolySynth: {
    inputs: [
      {
        id: "frequency",
        type: "input",
        label: "Freq CV",
        signalType: "control",
        position: Position.Left,
        toneProperty: "frequency",
      },
    ],
    outputs: [
      {
        id: "output",
        type: "output",
        label: "Audio Out",
        signalType: "audio",
        position: Position.Bottom,
        channelIndex: 0,
      },
    ],
  },

  // Additional components
  Volume: {
    inputs: [
      {
        id: "input",
        type: "input",
        label: "Audio In",
        signalType: "audio",
        position: Position.Top,
        channelIndex: 0,
      },
      {
        id: "volume",
        type: "input",
        label: "Volume CV",
        signalType: "control",
        position: Position.Right,
        toneProperty: "volume",
      },
    ],
    outputs: [
      {
        id: "output",
        type: "output",
        label: "Audio Out",
        signalType: "audio",
        position: Position.Bottom,
        channelIndex: 0,
      },
    ],
  },

  BiquadFilter: createSinglePortConfig("audio"),

  EQ3: createSinglePortConfig("audio"),

  Gate: createSinglePortConfig("audio"),

  Limiter: createSinglePortConfig("audio"),

  // Analyzers (input only, no output)
  Analyser: {
    inputs: [
      {
        id: "input",
        type: "input",
        label: "Audio In",
        signalType: "audio",
        position: Position.Top,
        channelIndex: 0,
      },
    ],
    outputs: [],
  },

  FFT: {
    inputs: [
      {
        id: "input",
        type: "input",
        label: "Audio In",
        signalType: "audio",
        position: Position.Top,
        channelIndex: 0,
      },
    ],
    outputs: [],
  },

  Meter: {
    inputs: [
      {
        id: "input",
        type: "input",
        label: "Audio In",
        signalType: "audio",
        position: Position.Top,
        channelIndex: 0,
      },
    ],
    outputs: [],
  },

  Waveform: {
    inputs: [
      {
        id: "input",
        type: "input",
        label: "Audio In",
        signalType: "audio",
        position: Position.Top,
        channelIndex: 0,
      },
    ],
    outputs: [],
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get port configuration for a Tone.js node type
 * Falls back to single port config if not defined in registry
 */
export function getPortConfigForNode(nodeType: ToneComponentKey): PortConfig {
  const config = TONE_PORT_REGISTRY[nodeType];

  if (config) {
    return config;
  }

  // Fallback: assume single audio input/output
  console.warn(
    `No port configuration found for ${nodeType}, using default single port config`
  );
  return createSinglePortConfig("audio");
}

/**
 * Check if a node type has a port configuration defined
 */
export function hasPortConfig(nodeType: ToneComponentKey): boolean {
  return nodeType in TONE_PORT_REGISTRY;
}

/**
 * Get list of all node types with defined port configs
 */
export function getDefinedNodeTypes(): ToneComponentKey[] {
  return Object.keys(TONE_PORT_REGISTRY) as ToneComponentKey[];
}

/**
 * Get statistics about port registry coverage
 */
export function getRegistryCoverage(): {
  defined: number;
  missing: string[];
} {
  const definedTypes = new Set(getDefinedNodeTypes());

  // This would need to compare against all possible ToneComponentKey values
  // For now, just return count
  return {
    defined: definedTypes.size,
    missing: [], // Would need full type enumeration
  };
}
