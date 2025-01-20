import { useRef, useEffect } from "react";
import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import * as Tone from "tone";

import { type AmplitudeEnvelopeNode } from "../../types";

export function AmplitudeEnvelopeNode({
  id,
  parentId,
  data,
  selected,
  dragging,
}: NodeProps<AmplitudeEnvelopeNode>) {
  const { updateNodeData } = useReactFlow();
  const omniOsc = useRef<Tone.AmplitudeEnvelope | null>(null);

  useEffect(() => {
    console.log(
      "AmplitudeEnvelopeNode mounted",
      `id: ${id}, parentId: ${parentId}`
    );
    omniOsc.current = new Tone.AmplitudeEnvelope();
  }, [id, parentId]);

  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="react-flow__node-default">
      <p> {"Inputs: " + omniOsc.current?.numberOfInputs}</p>
      <p>{"Outputs: " + omniOsc.current?.numberOfOutputs}</p>
      {data.label && <div>{data.label}</div>}
      {selected && !dragging && (
        <form action="#" className="grid grid-cols-2 gap-4 nodrag">
          <label htmlFor="attack">
            Attack:
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              id="attack"
              className="form-input text-sm px-2 py-2"
              onChange={(e) =>
                updateNodeData(id, { attack: Number(e.target.value) })
              }
            />
          </label>
          <label htmlFor="decay">
            Decay:
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              id="decay"
              className="form-input text-sm px-2 py-2"
            />
          </label>
          <label htmlFor="sustain">
            Sustain:
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              id="sustain"
              className="form-input text-sm px-2 py-2"
            />
          </label>
          <label htmlFor="release">
            Release:
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              id="release"
              className="form-input text-sm px-2 py-2"
            />
          </label>
        </form>
      )}
      <p>My ID is: {`${id}`}</p>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
