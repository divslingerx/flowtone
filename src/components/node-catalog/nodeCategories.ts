/**
 * Node categorization system
 *
 * Organizes all Tone.js nodes and custom nodes into logical categories
 * for the sidebar catalog.
 */

import type { ToneComponentKey } from "~/nodes/types3";

export type NodeCategory =
  | "sources"
  | "instruments"
  | "effects"
  | "components"
  | "midi"
  | "utilities";

export interface NodeDefinition {
  /**
   * Node type identifier (matches Tone.js class name or custom type)
   */
  type: ToneComponentKey | "Midi" | "MidiPiano";

  /**
   * Display name in the catalog
   */
  label: string;

  /**
   * Short description for tooltip
   */
  description?: string;

  /**
   * Icon name (could be emoji or icon library)
   */
  icon?: string;

  /**
   * Tags for search/filtering
   */
  tags?: string[];

  /**
   * Whether this node is commonly used (show first)
   */
  featured?: boolean;
}

export interface NodeCategoryDefinition {
  id: NodeCategory;
  label: string;
  description: string;
  icon: string;
  nodes: NodeDefinition[];
}

// ============================================================================
// NODE DEFINITIONS BY CATEGORY
// ============================================================================

export const NODE_CATEGORIES: NodeCategoryDefinition[] = [
  // ==========================================================================
  // SOURCES
  // ==========================================================================
  {
    id: "sources",
    label: "Sources",
    description: "Sound generators and oscillators",
    icon: "🎵",
    nodes: [
      {
        type: "OmniOscillator",
        label: "Omni Oscillator",
        description: "Versatile oscillator with multiple waveform types",
        icon: "〰️",
        featured: true,
        tags: ["oscillator", "waveform", "tone"],
      },
      {
        type: "Oscillator",
        label: "Oscillator",
        description: "Basic oscillator with sine, square, triangle, sawtooth",
        icon: "〜",
        featured: true,
        tags: ["oscillator", "basic", "waveform"],
      },
      {
        type: "AMOscillator",
        label: "AM Oscillator",
        description: "Amplitude modulation oscillator",
        icon: "📡",
        tags: ["oscillator", "am", "modulation"],
      },
      {
        type: "FMOscillator",
        label: "FM Oscillator",
        description: "Frequency modulation oscillator",
        icon: "📻",
        tags: ["oscillator", "fm", "modulation"],
      },
      {
        type: "FatOscillator",
        label: "Fat Oscillator",
        description: "Multiple detuned oscillators for thick sound",
        icon: "🎹",
        tags: ["oscillator", "detune", "thick"],
      },
      {
        type: "PWMOscillator",
        label: "PWM Oscillator",
        description: "Pulse width modulation oscillator",
        icon: "▭",
        tags: ["oscillator", "pwm", "pulse"],
      },
      {
        type: "PulseOscillator",
        label: "Pulse Oscillator",
        description: "Square wave with variable pulse width",
        icon: "▯",
        tags: ["oscillator", "pulse", "square"],
      },
      {
        type: "LFO",
        label: "LFO",
        description: "Low frequency oscillator for modulation",
        icon: "🌊",
        featured: true,
        tags: ["lfo", "modulation", "control"],
      },
      {
        type: "Player",
        label: "Audio Player",
        description: "Audio file player",
        icon: "▶️",
        tags: ["sample", "audio", "file"],
      },
      {
        type: "GrainPlayer",
        label: "Grain Player",
        description: "Granular synthesis player",
        icon: "🌾",
        tags: ["granular", "sample", "texture"],
      },
    ],
  },

  // ==========================================================================
  // INSTRUMENTS
  // ==========================================================================
  {
    id: "instruments",
    label: "Instruments",
    description: "Synths and playable instruments",
    icon: "🎹",
    nodes: [
      {
        type: "Synth",
        label: "Synth",
        description: "Basic monophonic synthesizer",
        icon: "🎛️",
        featured: true,
        tags: ["synth", "instrument", "mono"],
      },
      {
        type: "MonoSynth",
        label: "Mono Synth",
        description: "Monophonic synth with filter",
        icon: "🎚️",
        featured: true,
        tags: ["synth", "mono", "filter"],
      },
      {
        type: "PolySynth",
        label: "Poly Synth",
        description: "Polyphonic synthesizer",
        icon: "🎼",
        featured: true,
        tags: ["synth", "poly", "polyphonic"],
      },
      {
        type: "AMSynth",
        label: "AM Synth",
        description: "Amplitude modulation synthesizer",
        icon: "📊",
        tags: ["synth", "am"],
      },
      {
        type: "FMSynth",
        label: "FM Synth",
        description: "Frequency modulation synthesizer",
        icon: "📈",
        tags: ["synth", "fm"],
      },
      {
        type: "DuoSynth",
        label: "Duo Synth",
        description: "Two synths combined",
        icon: "👥",
        tags: ["synth", "dual"],
      },
      {
        type: "MembraneSynth",
        label: "Membrane Synth",
        description: "Synthesizer for drum sounds",
        icon: "🥁",
        tags: ["synth", "drum", "percussion"],
      },
      {
        type: "MetalSynth",
        label: "Metal Synth",
        description: "Metallic percussion synthesizer",
        icon: "🔔",
        tags: ["synth", "metal", "percussion"],
      },
      {
        type: "NoiseSynth",
        label: "Noise Synth",
        description: "Noise-based percussion",
        icon: "💥",
        tags: ["synth", "noise", "percussion"],
      },
      {
        type: "PluckSynth",
        label: "Pluck Synth",
        description: "Plucked string synthesizer",
        icon: "🎸",
        tags: ["synth", "pluck", "string"],
      },
      {
        type: "Sampler",
        label: "Sampler",
        description: "Multi-sample instrument",
        icon: "🎼",
        tags: ["sampler", "sample", "instrument"],
      },
    ],
  },

  // ==========================================================================
  // EFFECTS
  // ==========================================================================
  {
    id: "effects",
    label: "Effects",
    description: "Audio processors and effects",
    icon: "✨",
    nodes: [
      {
        type: "Filter",
        label: "Filter",
        description: "Resonant filter (lowpass, highpass, bandpass)",
        icon: "🔊",
        featured: true,
        tags: ["filter", "eq", "frequency"],
      },
      {
        type: "Reverb",
        label: "Reverb",
        description: "Room reverberation effect",
        icon: "🏛️",
        featured: true,
        tags: ["reverb", "space", "room"],
      },
      {
        type: "FeedbackDelay",
        label: "Delay",
        description: "Feedback delay effect",
        icon: "⏱️",
        featured: true,
        tags: ["delay", "echo", "time"],
      },
      {
        type: "Chorus",
        label: "Chorus",
        description: "Chorus modulation effect",
        icon: "🌈",
        featured: true,
        tags: ["chorus", "modulation", "thick"],
      },
      {
        type: "Phaser",
        label: "Phaser",
        description: "Phaser effect",
        icon: "🌀",
        tags: ["phaser", "modulation", "sweep"],
      },
      {
        type: "Distortion",
        label: "Distortion",
        description: "Waveshaping distortion",
        icon: "⚡",
        tags: ["distortion", "drive", "saturation"],
      },
      {
        type: "Compressor",
        label: "Compressor",
        description: "Dynamic range compressor",
        icon: "📉",
        featured: true,
        tags: ["compressor", "dynamics", "level"],
      },
      {
        type: "AutoFilter",
        label: "Auto Filter",
        description: "LFO-modulated filter",
        icon: "🎚️",
        tags: ["filter", "auto", "lfo"],
      },
      {
        type: "AutoPanner",
        label: "Auto Panner",
        description: "LFO-modulated panning",
        icon: "↔️",
        tags: ["pan", "auto", "lfo"],
      },
      {
        type: "AutoWah",
        label: "Auto Wah",
        description: "Envelope-controlled wah effect",
        icon: "👄",
        tags: ["wah", "filter", "envelope"],
      },
      {
        type: "BitCrusher",
        label: "Bit Crusher",
        description: "Bit depth reduction effect",
        icon: "🔲",
        tags: ["bitcrush", "lo-fi", "digital"],
      },
      {
        type: "Chebyshev",
        label: "Chebyshev",
        description: "Chebyshev waveshaping",
        icon: "📐",
        tags: ["distortion", "waveshaper"],
      },
      {
        type: "Freeverb",
        label: "Freeverb",
        description: "Freeverb algorithm",
        icon: "🎭",
        tags: ["reverb", "space"],
      },
      {
        type: "JCReverb",
        label: "JC Reverb",
        description: "JC reverb algorithm",
        icon: "🏰",
        tags: ["reverb", "space"],
      },
      {
        type: "PingPongDelay",
        label: "Ping Pong Delay",
        description: "Stereo ping-pong delay",
        icon: "🏓",
        tags: ["delay", "stereo", "ping-pong"],
      },
      {
        type: "PitchShift",
        label: "Pitch Shift",
        description: "Pitch shifting effect",
        icon: "🎵",
        tags: ["pitch", "transpose"],
      },
      {
        type: "FrequencyShifter",
        label: "Frequency Shifter",
        description: "Frequency shifting effect",
        icon: "↗️",
        tags: ["frequency", "shift"],
      },
      {
        type: "StereoWidener",
        label: "Stereo Widener",
        description: "Stereo width control",
        icon: "⬌",
        tags: ["stereo", "width", "space"],
      },
      {
        type: "Tremolo",
        label: "Tremolo",
        description: "Amplitude modulation effect",
        icon: "📻",
        tags: ["tremolo", "modulation", "amplitude"],
      },
      {
        type: "Vibrato",
        label: "Vibrato",
        description: "Pitch modulation effect",
        icon: "🎶",
        tags: ["vibrato", "modulation", "pitch"],
      },
    ],
  },

  // ==========================================================================
  // COMPONENTS
  // ==========================================================================
  {
    id: "components",
    label: "Components",
    description: "Envelopes, filters, and utility components",
    icon: "🔧",
    nodes: [
      {
        type: "AmplitudeEnvelope",
        label: "Amp Envelope",
        description: "ADSR amplitude envelope",
        icon: "📈",
        featured: true,
        tags: ["envelope", "adsr", "amplitude"],
      },
      {
        type: "FrequencyEnvelope",
        label: "Freq Envelope",
        description: "ADSR frequency envelope",
        icon: "📊",
        featured: true,
        tags: ["envelope", "adsr", "frequency"],
      },
      {
        type: "Envelope",
        label: "Envelope",
        description: "Basic ADSR envelope",
        icon: "📉",
        tags: ["envelope", "adsr"],
      },
      {
        type: "Channel",
        label: "Channel",
        description: "Channel strip with volume and pan",
        icon: "🎚️",
        featured: true,
        tags: ["channel", "mixer", "volume", "pan"],
      },
      {
        type: "Panner",
        label: "Panner",
        description: "Stereo panning control",
        icon: "⬌",
        featured: true,
        tags: ["pan", "stereo"],
      },
      {
        type: "Merge",
        label: "Merge",
        description: "Merge multiple channels into one",
        icon: "⬇️",
        tags: ["merge", "mix", "combine"],
      },
      {
        type: "Split",
        label: "Split",
        description: "Split one channel into multiple",
        icon: "⬆️",
        tags: ["split", "separate"],
      },
      {
        type: "Volume",
        label: "Volume",
        description: "Volume control",
        icon: "🔊",
        tags: ["volume", "gain", "level"],
      },
      {
        type: "Analyser",
        label: "Analyser",
        description: "Audio analysis",
        icon: "📊",
        tags: ["analyser", "meter", "visualization"],
      },
      {
        type: "Meter",
        label: "Meter",
        description: "Level meter",
        icon: "📏",
        tags: ["meter", "level", "monitor"],
      },
      {
        type: "FFT",
        label: "FFT",
        description: "FFT analysis",
        icon: "📈",
        tags: ["fft", "frequency", "analysis"],
      },
      {
        type: "Waveform",
        label: "Waveform",
        description: "Waveform visualization",
        icon: "〰️",
        tags: ["waveform", "oscilloscope"],
      },
    ],
  },

  // ==========================================================================
  // MIDI
  // ==========================================================================
  {
    id: "midi",
    label: "MIDI",
    description: "MIDI input and control",
    icon: "🎹",
    nodes: [
      {
        type: "Midi",
        label: "MIDI Input",
        description: "External MIDI device input",
        icon: "🎛️",
        featured: true,
        tags: ["midi", "input", "controller"],
      },
      {
        type: "MidiPiano",
        label: "MIDI Piano",
        description: "Virtual piano keyboard",
        icon: "🎹",
        featured: true,
        tags: ["midi", "piano", "keyboard"],
      },
    ],
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all node definitions flattened
 */
export function getAllNodeDefinitions(): NodeDefinition[] {
  return NODE_CATEGORIES.flatMap((category) => category.nodes);
}

/**
 * Get featured (commonly used) nodes
 */
export function getFeaturedNodes(): NodeDefinition[] {
  return getAllNodeDefinitions().filter((node) => node.featured);
}

/**
 * Search nodes by query string
 */
export function searchNodes(query: string): NodeDefinition[] {
  const lowerQuery = query.toLowerCase();
  return getAllNodeDefinitions().filter((node) => {
    return (
      node.label.toLowerCase().includes(lowerQuery) ||
      node.description?.toLowerCase().includes(lowerQuery) ||
      node.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Get node definition by type
 */
export function getNodeDefinition(type: string): NodeDefinition | undefined {
  return getAllNodeDefinitions().find((node) => node.type === type);
}

/**
 * Get category by ID
 */
export function getCategoryById(id: NodeCategory): NodeCategoryDefinition | undefined {
  return NODE_CATEGORIES.find((cat) => cat.id === id);
}
