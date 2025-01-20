# Flowtone - Audio Workflow Tool

Flowtone is a web-based audio workflow application built with modern web technologies, designed for creating and managing audio processing pipelines.

## Tech Stack

- **Frontend**:
  - React 18 (TypeScript)
  - Vite 6
  - Tailwind CSS
- **Audio**:
  - Web Audio API
  - Tone.js
- **Development**:
  - TypeScript
  - ESLint 9
  - Prettier

## Features

### MIDI and Audio Engine Integration

The MIDI system and Audio Engine work together to process musical input and generate sound. MIDI input from devices or the virtual piano is routed through connected audio nodes for processing and output.

#### Current MIDI Nodes:

- **MidiInputNode**: Receives MIDI input from connected devices
- **MidiPianoNode**: Virtual piano keyboard for MIDI input

#### Current Audio Nodes:

- **OmniOscillator**: Sound source with multiple waveform types
- **AmplitudeEnvelope**: Controls volume over time
- **Filter**: Modifies frequency content
- **FrequencyEnvelope**: Controls filter frequency over time
- **Channel**: Main audio output with volume/pan controls

### Node Implementation Status

| Node Type           | Status         |
| ------------------- | -------------- |
| AMOscillator        | ⚙️ Planned     |
| AmplitudeEnvelope   | ⚙️ Planned     |
| AmplitudeEnvelope   | ✅ Implemented |
| AMSynth             | ⚙️ Planned     |
| Analyser            | ⚙️ Planned     |
| AutoFilter          | ⚙️ Planned     |
| AutoPanner          | ⚙️ Planned     |
| AutoWah             | ⚙️ Planned     |
| BiquadFilter        | ⚙️ Planned     |
| BitCrusher          | ⚙️ Planned     |
| Channel             | ⚙️ Planned     |
| Channel             | ✅ Implemented |
| Chebyshev           | ⚙️ Planned     |
| Chorus              | ⚙️ Planned     |
| Compressor          | ⚙️ Planned     |
| Convolver           | ⚙️ Planned     |
| CrossFade           | ⚙️ Planned     |
| DCMeter             | ⚙️ Planned     |
| Delay               | ⚙️ Planned     |
| Distortion          | ⚙️ Planned     |
| Distortion          | ⚙️ Planned     |
| DuoSynth            | ⚙️ Planned     |
| Envelope            | ⚙️ Planned     |
| EQ3                 | ⚙️ Planned     |
| FatOscillator       | ⚙️ Planned     |
| FeedbackCombFilter  | ⚙️ Planned     |
| FeedbackDelay       | ⚙️ Planned     |
| FFT                 | ⚙️ Planned     |
| Filter              | ⚙️ Planned     |
| Filter              | ✅ Implemented |
| FMOscillator        | ⚙️ Planned     |
| FMSynth             | ⚙️ Planned     |
| Follower            | ⚙️ Planned     |
| Freeverb            | ⚙️ Planned     |
| FrequencyEnvelope   | ⚙️ Planned     |
| FrequencyEnvelope   | ✅ Implemented |
| FrequencyShifter    | ⚙️ Planned     |
| Gate                | ⚙️ Planned     |
| GrainPlayer         | ⚙️ Planned     |
| JCReverb            | ⚙️ Planned     |
| LFO                 | ⚙️ Planned     |
| Limiter             | ⚙️ Planned     |
| LowpassCombFilter   | ⚙️ Planned     |
| MembraneSynth       | ⚙️ Planned     |
| Merge               | ⚙️ Planned     |
| MetalSynth          | ⚙️ Planned     |
| Meter               | ⚙️ Planned     |
| MidiInput           | ✅ Implemented |
| MidiPiano           | ✅ Implemented |
| MidSideCompressor   | ⚙️ Planned     |
| MidSideMerge        | ⚙️ Planned     |
| MidSideSplit        | ⚙️ Planned     |
| Mono                | ⚙️ Planned     |
| MonoSynth           | ⚙️ Planned     |
| MultibandCompressor | ⚙️ Planned     |
| MultibandSplit      | ⚙️ Planned     |
| NoiseSynth          | ⚙️ Planned     |
| OmniOscillator      | ⚙️ Planned     |
| OmniOscillator      | ✅ Implemented |
| OnePoleFilter       | ⚙️ Planned     |
| Oscillator          | ⚙️ Planned     |
| Panner              | ⚙️ Planned     |
| Panner              | ✅ Implemented |
| Panner3D            | ⚙️ Planned     |
| PanVol              | ⚙️ Planned     |
| Phaser              | ⚙️ Planned     |
| PingPongDelay       | ⚙️ Planned     |
| PitchShift          | ⚙️ Planned     |
| Player              | ⚙️ Planned     |
| Players             | ⚙️ Planned     |
| PluckSynth          | ⚙️ Planned     |
| PolySynth           | ⚙️ Planned     |
| PulseOscillator     | ⚙️ Planned     |
| PWMOscillator       | ⚙️ Planned     |
| Recorder            | ⚙️ Planned     |
| Reverb              | ⚙️ Planned     |
| Reverb              | ⚙️ Planned     |
| Sampler             | ⚙️ Planned     |
| Sampler             | ⚙️ Planned     |
| Solo                | ⚙️ Planned     |
| Split               | ⚙️ Planned     |
| StereoWidener       | ⚙️ Planned     |
| Synth               | ⚙️ Planned     |
| Synth               | ⚙️ Planned     |
| ToneBufferSource    | ⚙️ Planned     |
| ToneOscillator      | ⚙️ Planned     |
| Tremolo             | ⚙️ Planned     |
| UserMedia           | ⚙️ Planned     |
| Vibrato             | ⚙️ Planned     |
| Volume              | ⚙️ Planned     |
| Waveform            | ⚙️ Planned     |

> Note: This is a work in progress. While I've pre-created many node types for future expansion, only the currently implemented nodes are (somewhat) functional.

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start development server:
   ```bash
   pnpm dev
   ```

## Development

- Linting:
  ```bash
  pnpm lint
  ```
- Formatting:
  ```bash
  pnpm format
  ```
- Type checking:
  ```bash
  pnpm typecheck
  ```

## License

MIT License - See [LICENSE](LICENSE) for details
