/**
 * Parameter Metadata Registry
 *
 * Defines how common audio parameters should be displayed and controlled.
 * Used by AutoNodeControls to generate UIs automatically.
 */

import type { ToneComponentKey } from "~/nodes/types3";

// ============================================================================
// CONTROL TYPES
// ============================================================================

export type ControlType =
  | "knob-frequency"
  | "knob-detune"
  | "knob-time"
  | "knob-gain"
  | "knob-ratio"
  | "knob-normalized"
  | "knob-q"
  | "slider-db"
  | "dropdown"
  | "toggle";

// ============================================================================
// PARAMETER METADATA
// ============================================================================

export interface ParameterMetadata {
  controlType: ControlType;
  min?: number;
  max?: number;
  defaultValue?: number;
  unit?: string;
  scale?: "linear" | "logarithmic";
  skew?: number; // For NormalisableRange
  step?: number;
  options?: string[]; // For dropdowns
  displayName?: string;
  group?: string; // For grouping parameters
}

// ============================================================================
// PARAMETER NAME-BASED DEFAULTS
// ============================================================================

/**
 * Default metadata for common parameter names
 */
export const PARAMETER_DEFAULTS: Record<string, ParameterMetadata> = {
  // Frequency parameters
  frequency: {
    controlType: "knob-frequency",
    min: 20,
    max: 20000,
    scale: "logarithmic",
    skew: 1000,
    unit: "Hz",
    displayName: "Frequency",
  },

  // Detune
  detune: {
    controlType: "knob-detune",
    min: -100,
    max: 100,
    scale: "linear",
    unit: "cents",
    displayName: "Detune",
  },

  // Envelope times
  attack: {
    controlType: "knob-time",
    min: 0.001,
    max: 5,
    scale: "logarithmic",
    skew: 0.1,
    unit: "s",
    displayName: "Attack",
    group: "Envelope",
  },
  decay: {
    controlType: "knob-time",
    min: 0.001,
    max: 5,
    scale: "logarithmic",
    skew: 0.1,
    unit: "s",
    displayName: "Decay",
    group: "Envelope",
  },
  sustain: {
    controlType: "knob-normalized",
    min: 0,
    max: 1,
    scale: "linear",
    displayName: "Sustain",
    group: "Envelope",
  },
  release: {
    controlType: "knob-time",
    min: 0.001,
    max: 5,
    scale: "logarithmic",
    skew: 0.1,
    unit: "s",
    displayName: "Release",
    group: "Envelope",
  },

  // Normalized parameters (0-1)
  wet: {
    controlType: "knob-normalized",
    min: 0,
    max: 1,
    scale: "linear",
    displayName: "Wet/Dry",
  },
  depth: {
    controlType: "knob-normalized",
    min: 0,
    max: 1,
    scale: "linear",
    displayName: "Depth",
  },
  feedback: {
    controlType: "knob-normalized",
    min: 0,
    max: 1,
    scale: "linear",
    displayName: "Feedback",
  },

  // Volume/Gain
  volume: {
    controlType: "slider-db",
    min: -60,
    max: 6,
    scale: "linear",
    unit: "dB",
    displayName: "Volume",
  },
  gain: {
    controlType: "knob-gain",
    min: 0,
    max: 2,
    scale: "linear",
    displayName: "Gain",
  },

  // Q factor (resonance)
  Q: {
    controlType: "knob-q",
    min: 0.001,
    max: 100,
    scale: "logarithmic",
    skew: 1,
    displayName: "Resonance",
  },

  // Compressor/Dynamics
  threshold: {
    controlType: "slider-db",
    min: -100,
    max: 0,
    scale: "linear",
    unit: "dB",
    displayName: "Threshold",
  },
  ratio: {
    controlType: "knob-ratio",
    min: 1,
    max: 20,
    scale: "linear",
    displayName: "Ratio",
  },
  knee: {
    controlType: "knob-normalized",
    min: 0,
    max: 40,
    scale: "linear",
    unit: "dB",
    displayName: "Knee",
  },

  // Time-based
  delayTime: {
    controlType: "knob-time",
    min: 0,
    max: 1,
    scale: "linear",
    unit: "s",
    displayName: "Delay Time",
  },

  // Waveform types
  type: {
    controlType: "dropdown",
    options: ["sine", "square", "triangle", "sawtooth"],
    displayName: "Waveform",
  },

  // Filter types
  rolloff: {
    controlType: "dropdown",
    options: ["-12", "-24", "-48", "-96"],
    displayName: "Rolloff",
  },

  // Boolean
  mute: {
    controlType: "toggle",
    displayName: "Mute",
  },

  // Panning
  pan: {
    controlType: "knob-normalized",
    min: -1,
    max: 1,
    scale: "linear",
    displayName: "Pan",
  },
};

// ============================================================================
// NODE-SPECIFIC OVERRIDES
// ============================================================================

/**
 * Node-specific metadata overrides and configurations
 */
export const NODE_METADATA: Record<
  string,
  {
    overrides?: Record<string, Partial<ParameterMetadata>>;
    parameterOrder?: string[];
    layout?: "grid" | "vertical" | "horizontal";
    groups?: Record<string, string[]>;
    hideParams?: string[]; // Parameters to not show in UI
  }
> = {
  OmniOscillator: {
    parameterOrder: ["frequency", "detune", "type", "volume"],
    layout: "grid",
    hideParams: ["context", "phase", "partialCount", "partials"],
  },

  Filter: {
    overrides: {
      frequency: {
        displayName: "Cutoff",
      },
      type: {
        options: ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"],
      },
    },
    parameterOrder: ["frequency", "Q", "type", "rolloff"],
    layout: "grid",
  },

  Chorus: {
    overrides: {
      frequency: {
        displayName: "LFO Rate",
        min: 0.1,
        max: 10,
        scale: "logarithmic",
        skew: 1,
      },
    },
    parameterOrder: ["frequency", "depth", "delayTime", "feedback", "wet"],
    layout: "grid",
  },

  Synth: {
    groups: {
      Envelope: ["attack", "decay", "sustain", "release"],
    },
    layout: "vertical",
    parameterOrder: ["frequency", "detune"],
  },

  Reverb: {
    parameterOrder: ["decay", "preDelay", "wet"],
    layout: "grid",
    hideParams: ["_dummyGain"],
  },

  FeedbackDelay: {
    parameterOrder: ["delayTime", "feedback", "wet"],
    layout: "grid",
  },

  Compressor: {
    parameterOrder: ["threshold", "ratio", "attack", "release", "knee"],
    layout: "grid",
  },

  AmplitudeEnvelope: {
    parameterOrder: ["attack", "decay", "sustain", "release"],
    layout: "grid",
  },

  FrequencyEnvelope: {
    parameterOrder: ["attack", "decay", "sustain", "release"],
    layout: "grid",
    overrides: {
      baseFrequency: {
        controlType: "knob-frequency",
        displayName: "Base Freq",
      },
      octaves: {
        controlType: "knob-normalized",
        min: 0,
        max: 8,
        displayName: "Octaves",
      },
    },
  },

  LFO: {
    overrides: {
      frequency: {
        displayName: "Rate",
        min: 0.01,
        max: 20,
      },
      min: {
        controlType: "knob-normalized",
        displayName: "Min",
      },
      max: {
        controlType: "knob-normalized",
        displayName: "Max",
      },
    },
    parameterOrder: ["frequency", "type", "min", "max"],
    layout: "grid",
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get metadata for a parameter, merging defaults with node-specific overrides
 */
export function getParameterMetadata(
  paramName: string,
  nodeType: ToneComponentKey
): ParameterMetadata | null {
  const defaultMeta = PARAMETER_DEFAULTS[paramName];
  const nodeOverride = NODE_METADATA[nodeType]?.overrides?.[paramName];

  if (!defaultMeta && !nodeOverride) {
    return null;
  }

  // Merge metadata, ensuring controlType is present
  const merged = {
    ...defaultMeta,
    ...nodeOverride,
  };

  // If no controlType is defined, we can't create valid metadata
  if (!merged.controlType) {
    return null;
  }

  return merged as ParameterMetadata;
}

/**
 * Get display order for parameters
 */
export function getParameterOrder(
  nodeType: ToneComponentKey,
  availableParams: string[]
): string[] {
  const nodeMeta = NODE_METADATA[nodeType];

  if (nodeMeta?.parameterOrder) {
    // Use specified order, then add any remaining params
    const ordered = nodeMeta.parameterOrder.filter((p) =>
      availableParams.includes(p)
    );
    const remaining = availableParams.filter(
      (p) => !nodeMeta.parameterOrder!.includes(p)
    );
    return [...ordered, ...remaining];
  }

  return availableParams;
}

/**
 * Filter out parameters that shouldn't be shown in UI
 */
export function getVisibleParameters(
  params: string[],
  nodeType: ToneComponentKey
): string[] {
  const hideList = NODE_METADATA[nodeType]?.hideParams || [];
  const commonHidden = ["context", "onstop", "_dummyGain", "onended"];

  return params.filter(
    (p) => !hideList.includes(p) && !commonHidden.includes(p)
  );
}
