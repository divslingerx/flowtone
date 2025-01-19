import { useRef, useEffect } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import * as Tone from "tone";

import { type OmniOscillatorNode } from "../../types";

type AnyOscillator =
  | Tone.Oscillator
  | Tone.PWMOscillator
  | Tone.PulseOscillator
  | Tone.FatOscillator
  | Tone.AMOscillator
  | Tone.FMOscillator;

export function OmniOscillatorNode({ data }: NodeProps<OmniOscillatorNode>) {
  const omniOsc = useRef<Tone.OmniOscillator<AnyOscillator> | null>(null);

  useEffect(() => {
    omniOsc.current = new Tone.OmniOscillator();
  }, []);

  const handleAttackRelease = () =>
    omniOsc.current?.start().stop("+1.25").toDestination();

  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="react-flow__node-default">
      {data.label && <div>{data.label}</div>}
      <button onClick={handleAttackRelease}>Test</button>
      <input type="range" min={0} max={1} step={0.1} />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
