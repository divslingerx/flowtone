import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { type OmniOscillatorNode } from "../../types";
import { useRFStore } from "../../../store/store";
import { ParamKnob } from "~/components/ParamKnob";
import { Knob } from "~/components/Knob";
import { useCallback } from "react";

export function OmniOscillatorNode({
  data,
  id,
}: NodeProps<OmniOscillatorNode>) {
  const { updateNodeData, getNode } = useReactFlow();
  const nodeData = (getNode(id) as OmniOscillatorNode)["data"];
  const audioEngine = useRFStore((state) => state.audioEngine);

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
      {data.label && (
        <div className="text-lg font-semibold mb-2">{data.label}</div>
      )}
      <button onClick={handleAttackRelease}>Test</button>
      <div className="grid grid-cols-2 justify-between gap-6">
        <Knob
          value={nodeData.frequency as number}
          onChange={updateFreq}
          label="Freq"
        />

        <Knob
          label="Detune"
          value={nodeData.detune as number}
          onChange={updateDetune}
        />
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
