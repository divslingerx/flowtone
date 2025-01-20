import { useRef, useEffect } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import * as Tone from "tone";

import { type FrequencyEnvelopeNode } from "~/nodes/types";

export function FrequencyEnvelopeNode({
  data,
  id,
}: NodeProps<FrequencyEnvelopeNode>) {
  const Filter = useRef<Tone.Filter | null>(null);

  useEffect(() => {
    Filter.current = new Tone.Filter();
  }, []);

  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="react-flow__node-default">
      {data.label && <div>{data.label}</div>}
      <p>My ID is: {`${id}`}</p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
