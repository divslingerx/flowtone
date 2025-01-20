import { useRef, useEffect } from "react";
import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import * as Tone from "tone";
import { type OmniOscillatorNode } from "../../types";

type AnyOscillator =
  | Tone.Oscillator
  | Tone.PWMOscillator
  | Tone.PulseOscillator
  | Tone.FatOscillator
  | Tone.AMOscillator
  | Tone.FMOscillator;

export function OmniOscillatorNode({
  data,
  id,
}: NodeProps<OmniOscillatorNode>) {
  const omniOsc = useRef<Tone.OmniOscillator<AnyOscillator> | null>(null);

  const { updateNodeData, getNode } = useReactFlow();
  const nodeData = (getNode(id) as OmniOscillatorNode)["data"];

  useEffect(() => {
    omniOsc.current = new Tone.OmniOscillator();
  }, []);

  const handleAttackRelease = () =>
    omniOsc.current?.start(0).stop("+1.25").toDestination();

  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="react-flow__node-default">
      {data.label && (
        <div className="text-lg font-semibold mb-2">{data.label}</div>
      )}
      <button onClick={handleAttackRelease}>Test</button>
      <label>
        <span>Frequency</span>
        <input
          className="nodrag  max-w-[100px]"
          type="range"
          min="10"
          max="1000"
          value={data.frequency}
          onChange={(e) => updateNodeData(id, { frequency: e.target.value })}
        />
        <span>{nodeData.frequency}Hz</span>
      </label>

      <label>
        <span>Detune</span>
        <input
          className="nodrag  max-w-[100px]"
          type="range"
          min="10"
          max="1000"
          value={nodeData.detune}
          onChange={(e) =>
            updateNodeData(id, { detune: Number(e.target.value) })
          }
        />
        <span>{nodeData.detune}Centz</span>
      </label>
      <div className="flex">
        <label>
          <span>Waveform</span>
          <select
            className="nodrag"
            value={nodeData.type}
            onChange={(e) =>
              updateNodeData(id, {
                oscillator: {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  type: e.target.value as any,
                },
              })
            }
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
