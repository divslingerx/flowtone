import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock Tone.js - we don't want actual audio in tests
vi.mock("tone", () => {
  const mockParam = {
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };

  const createMockNode = (type: string) => ({
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
    toDestination: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { ...mockParam },
    detune: { ...mockParam },
    volume: { ...mockParam },
    pan: { ...mockParam },
    Q: { ...mockParam },
    gain: { ...mockParam },
    _type: type,
  });

  // Create mock classes for all Tone.js types we use
  const toneClasses = [
    "Oscillator",
    "OmniOscillator",
    "AMOscillator",
    "FMOscillator",
    "FatOscillator",
    "PWMOscillator",
    "PulseOscillator",
    "LFO",
    "Player",
    "GrainPlayer",
    "Synth",
    "MonoSynth",
    "AMSynth",
    "FMSynth",
    "DuoSynth",
    "PolySynth",
    "Filter",
    "BiquadFilter",
    "Reverb",
    "Freeverb",
    "JCReverb",
    "Chorus",
    "Phaser",
    "Tremolo",
    "Vibrato",
    "Distortion",
    "BitCrusher",
    "Chebyshev",
    "AutoFilter",
    "AutoPanner",
    "AutoWah",
    "FeedbackDelay",
    "PingPongDelay",
    "FrequencyShifter",
    "PitchShift",
    "StereoWidener",
    "Compressor",
    "Limiter",
    "Gate",
    "Channel",
    "Volume",
    "Panner",
    "Merge",
    "Split",
    "Envelope",
    "AmplitudeEnvelope",
    "FrequencyEnvelope",
    "Analyser",
    "FFT",
    "Meter",
    "Waveform",
  ];

  const mockTone: Record<string, unknown> = {
    Param: class MockParam {
      value = 0;
      setValueAtTime = vi.fn();
    },
    Frequency: vi.fn((val: number | string) => ({
      toFrequency: () => (typeof val === "number" ? val : 440),
    })),
    Transport: {
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      bpm: { value: 120 },
      scheduleOnce: vi.fn(),
    },
    Destination: createMockNode("Destination"),
    ToneAudioNode: class {},
    getDefaults: vi.fn(() => ({})),
  };

  // Add all mock classes
  for (const className of toneClasses) {
    mockTone[className] = class {
      static getDefaults = vi.fn(() => ({}));
      constructor() {
        return createMockNode(className);
      }
    };
  }

  return mockTone;
});

// Mock Web MIDI API
vi.mock("@react-midi/hooks", () => ({
  useMIDINote: vi.fn(() => null),
  useMIDIOutput: vi.fn(() => null),
  useMIDIInputs: vi.fn(() => []),
  useMIDIOutputs: vi.fn(() => []),
}));

// Mock requestAnimationFrame for visualization tests
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 0;
});
global.cancelAnimationFrame = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
