import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import {
  ExtractToneComponentDefaults,
  ToneAudioNodeType,
  ToneNode,
  type OmniOscillatorNode,
} from "../../types";
import { useRFStore } from "../../../store/store";
import { KnobFrequency } from "~/components/knob/knob-frequency";
import { useCallback, useEffect, useRef } from "react";
import { AtomAnimation } from "../surgeon";

import { useToneNode } from "~/hooks/useToneNode";

export function OmniOscillatorNode({
  data,
  id,
}: NodeProps<OmniOscillatorNode>) {
  const oscillator = useToneNode(data.type, data.config);

  const { updateNodeData, getNode } = useReactFlow();
  const nodeData = (getNode(id) as OmniOscillatorNode)["data"];
  const audioEngine = useRFStore((state) => state.audioEngine);

  useEffect(() => {
    oscillator?.start();
  }, []);

  const handleAttackRelease = () => {
    audioEngine?.triggerNote(id);
  };

  const updateDetune = useCallback(
    (v: number) => {
      updateNodeData(id, { detune: Number(v) });
      audioEngine?.updateNodeParams(id, { detune: Number(v) });
    },
    [data.frequency]
  );

  const updateFreq = useCallback(
    (v: number) => {
      updateNodeData(id, { detune: Number(v) });
      audioEngine?.updateNodeParams(id, { frequency: Number(v) });
    },
    [data.frequency]
  );

  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="react-flow__node-default w-full">
      <div className="  relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 800 600"
        >
          {/* Create a gradient for the background */}
          <defs>
            <radialGradient
              id="spaceGradient"
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" style={{ stopColor: "#000", stopOpacity: 1 }} />
              <stop
                offset="100%"
                style={{ stopColor: "#1a1a2e", stopOpacity: 1 }}
              />
            </radialGradient>
          </defs>

          {/* Draw the background */}
          <rect width="800" height="600" fill="url(#spaceGradient)" />

          {/* Generate random stars */}
          <g fill="#fff" opacity="0.8">
            {/* Larger stars */}
            <circle cx="100" cy="150" r="2" />
            <circle cx="250" cy="300" r="1.5" />
            <circle cx="400" cy="50" r="2" />
            <circle cx="600" cy="200" r="1.5" />
            <circle cx="700" cy="500" r="2" />
            <circle cx="50" cy="550" r="1.5" />
            <circle cx="300" cy="450" r="2" />
            <circle cx="500" cy="350" r="1.5" />

            {/* Smaller stars (randomly placed) */}
            <circle cx="120" cy="80" r="0.8" />
            <circle cx="320" cy="180" r="0.8" />
            <circle cx="450" cy="250" r="0.8" />
            <circle cx="550" cy="100" r="0.8" />
            <circle cx="200" cy="400" r="0.8" />
            <circle cx="650" cy="300" r="0.8" />
            <circle cx="750" cy="450" r="0.8" />
            <circle cx="50" cy="250" r="0.8" />
            <circle cx="150" cy="500" r="0.8" />
            <circle cx="350" cy="550" r="0.8" />
          </g>

          {/* Optional: Add a glowing effect for some stars */}
          <g fill="#fff" opacity="0.9">
            <circle cx="100" cy="150" r="3" style={{ filter: "blur(1px)" }} />
            <circle cx="400" cy="50" r="3" style={{ filter: "blur(1px)" }} />
            <circle cx="700" cy="500" r="3" style={{ filter: "blur(1px)" }} />
          </g>
        </svg>
        <AtomAnimation />
      </div>
      {data.label && (
        <div className="text-lg font-semibold mb-2">{data.label}</div>
      )}
      <button onClick={handleAttackRelease}>Test</button>
      <div className="grid grid-cols-2 justify-between gap-6 nodrag">
        <KnobFrequency label="Freq" theme="green" />

        <KnobFrequency label="Detune" theme="stone" />
      </div>
      <div className="flex mx-auto m-4 justify-center">
        <label>
          <span className="mr-2">Waveform</span>
          <select
            className="nodrag bg-white/50 border border-gray-300 rounded-md shadow-sm px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-white/70 transition-colors"
            value={nodeData.type}
            onChange={(e) => {
              updateNodeData(id, { type: e.target.value });
              audioEngine?.updateNodeParams(id, { type: e.target.value });
            }}
          >
            <option value="sine">sine</option>
            <option value="triangle">triangle</option>
            <option value="sawtooth">sawtooth</option>
            <option value="square">square</option>
          </select>
        </label>
      </div>
      {/* Play button */}
      <button
        onClick={handleAttackRelease}
        className="px-2 py-1 bg-red-800 text-white rounded-md active:bg-green-400 mt-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
