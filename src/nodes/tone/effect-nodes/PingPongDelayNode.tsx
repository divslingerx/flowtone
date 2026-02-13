import { type NodeProps } from "@xyflow/react";
import { type PingPongDelayNode } from "../../types";
import { useToneNode } from "~/hooks/useToneNode";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";
import { AutoNodeControls } from "~/components/auto-controls";

export function PingPongDelayNode({ data, id }: NodeProps<PingPongDelayNode>) {
  const _pingPongDelay = useToneNode(data.type, data.config);
  const portConfig = getPortConfigForNode("PingPongDelay");

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}
      <div className="nodrag">
        <AutoNodeControls nodeType="PingPongDelay" nodeId={id} currentData={data.config} />
      </div>
      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
