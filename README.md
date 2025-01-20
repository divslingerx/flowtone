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

| Node Type               | Status         |
| ----------------------- | -------------- |
| MidiInput               | ✅ Implemented |
| MidiPiano               | ✅ Implemented |
| OmniOscillator          | ✅ Implemented |
| AmplitudeEnvelope       | ✅ Implemented |
| Filter                  | ✅ Implemented |
| FrequencyEnvelope       | ✅ Implemented |
| Channel                 | ✅ Implemented |
| Panner                  | ✅ Implemented |
| AMOscillatorNode        | ⚙️ Planned     |
| AmplitudeEnvelopeNode   | ⚙️ Planned     |
| AMSynthNode             | ⚙️ Planned     |
| AnalyserNode            | ⚙️ Planned     |
| AutoFilterNode          | ⚙️ Planned     |
| AutoPannerNode          | ⚙️ Planned     |
| AutoWahNode             | ⚙️ Planned     |
| BiquadFilterNode        | ⚙️ Planned     |
| BitCrusherNode          | ⚙️ Planned     |
| ChannelNode             | ⚙️ Planned     |
| ChebyshevNode           | ⚙️ Planned     |
| ChorusNode              | ⚙️ Planned     |
| CompressorNode          | ⚙️ Planned     |
| ConvolverNode           | ⚙️ Planned     |
| CrossFadeNode           | ⚙️ Planned     |
| DCMeterNode             | ⚙️ Planned     |
| Delay                   | ⚙️ Planned     |
| Distortion              | ⚙️ Planned     |
| DistortionNode          | ⚙️ Planned     |
| DuoSynthNode            | ⚙️ Planned     |
| EnvelopeNode            | ⚙️ Planned     |
| EQ3Node                 | ⚙️ Planned     |
| FatOscillatorNode       | ⚙️ Planned     |
| FeedbackCombFilterNode  | ⚙️ Planned     |
| FeedbackDelayNode       | ⚙️ Planned     |
| FFTNode                 | ⚙️ Planned     |
| FilterNode              | ⚙️ Planned     |
| FMOscillatorNode        | ⚙️ Planned     |
| FMSynthNode             | ⚙️ Planned     |
| FollowerNode            | ⚙️ Planned     |
| FreeverbNode            | ⚙️ Planned     |
| FrequencyEnvelopeNode   | ⚙️ Planned     |
| FrequencyShifterNode    | ⚙️ Planned     |
| GateNode                | ⚙️ Planned     |
| GrainPlayerNode         | ⚙️ Planned     |
| JCReverbNode            | ⚙️ Planned     |
| LFONode                 | ⚙️ Planned     |
| LimiterNode             | ⚙️ Planned     |
| LowpassCombFilterNode   | ⚙️ Planned     |
| MembraneSynthNode       | ⚙️ Planned     |
| MergeNode               | ⚙️ Planned     |
| MetalSynthNode          | ⚙️ Planned     |
| MeterNode               | ⚙️ Planned     |
| MidSideCompressorNode   | ⚙️ Planned     |
| MidSideMergeNode        | ⚙️ Planned     |
| MidSideSplitNode        | ⚙️ Planned     |
| MonoNode                | ⚙️ Planned     |
| MonoSynthNode           | ⚙️ Planned     |
| MultibandCompressorNode | ⚙️ Planned     |
| MultibandSplitNode      | ⚙️ Planned     |
| NoiseSynthNode          | ⚙️ Planned     |
| OmniOscillatorNode      | ⚙️ Planned     |
| OnePoleFilterNode       | ⚙️ Planned     |
| OscillatorNode          | ⚙️ Planned     |
| Panner3DNode            | ⚙️ Planned     |
| PannerNode              | ⚙️ Planned     |
| PanVolNode              | ⚙️ Planned     |
| PhaserNode              | ⚙️ Planned     |
| PingPongDelayNode       | ⚙️ Planned     |
| PitchShiftNode          | ⚙️ Planned     |
| PlayerNode              | ⚙️ Planned     |
| PlayersNode             | ⚙️ Planned     |
| PluckSynthNode          | ⚙️ Planned     |
| PolySynthNode           | ⚙️ Planned     |
| PulseOscillatorNode     | ⚙️ Planned     |
| PWMOscillatorNode       | ⚙️ Planned     |
| RecorderNode            | ⚙️ Planned     |
| Reverb                  | ⚙️ Planned     |
| ReverbNode              | ⚙️ Planned     |
| Sampler                 | ⚙️ Planned     |
| SamplerNode             | ⚙️ Planned     |
| SoloNode                | ⚙️ Planned     |
| SplitNode               | ⚙️ Planned     |
| StereoWidenerNode       | ⚙️ Planned     |
| Synth                   | ⚙️ Planned     |
| SynthNode               | ⚙️ Planned     |
| ToneBufferSourceNode    | ⚙️ Planned     |
| ToneOscillatorNode      | ⚙️ Planned     |
| TremoloNode             | ⚙️ Planned     |
| UserMediaNode           | ⚙️ Planned     |
| VibratoNode             | ⚙️ Planned     |
| VolumeNode              | ⚙️ Planned     |
| WaveformNode            | ⚙️ Planned     |

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
