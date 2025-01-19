import { useRef, useEffect } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import * as Tone from "tone";

import { type ChannelNode } from "../../types";

export function ChannelNode({ data }: NodeProps<ChannelNode>) {
  const channel = useRef<Tone.Channel | null>(null);

  useEffect(() => {
    channel.current = new Tone.Channel();
  }, []);

  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="react-flow__node-default">
      {data.label && <div>{data.label}</div>}

      <Handle type="target" position={Position.Top} />
    </div>
  );
}
