import { useRef, useEffect } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

import * as Tone from "tone";

import { type PannerNode } from "../../types";

export function PannerNode({ data, id }: NodeProps<PannerNode>) {
  const Filter = useRef<Tone.Panner | null>(null);

  useEffect(() => {
    Filter.current = new Tone.Panner();
  }, []);

  return (
    <div className="react-flow__node-default">
      {data.label && <div>{data.label} Node</div>}
      <p>My ID is: {`${id}`}</p>

      <Handle
        type="target"
        position={Position.Right}
        id="frequency" // Specific target handle ID
        color="#ff69b4"
      />

      <Handle
        type="target"
        position={Position.Top}
        id="input" // Another specific target handle ID
      />
      <Handle type="source" position={Position.Bottom} id="output" />
    </div>
  );
}
