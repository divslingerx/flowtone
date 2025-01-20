import { Handle, Position, type NodeProps } from "@xyflow/react";

import { type SynthNode } from "../types";

export function SynthNode({ data }: NodeProps<SynthNode>) {
  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="react-flow__node-default">
      {data.label && <div>{data.label}</div>}

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
