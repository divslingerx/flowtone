import { type NodeProps } from "@xyflow/react";
import { type ChannelNode } from "../../types";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";

export function ChannelNode({ data, id }: NodeProps<ChannelNode>) {
  const portConfig = getPortConfigForNode("Channel");

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}

      <div className="text-xs text-gray-600 dark:text-gray-400 text-center py-2">
        Channel strip with volume and pan
      </div>

      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
