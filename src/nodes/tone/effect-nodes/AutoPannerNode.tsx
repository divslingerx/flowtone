import { type NodeProps } from "@xyflow/react";
import { type AutoPannerNode } from "../../types";
import { useToneNode } from "~/hooks/useToneNode";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";
import { AutoNodeControls } from "~/components/auto-controls";

export function AutoPannerNode({ data, id }: NodeProps<AutoPannerNode>) {
  const _autoPanner = useToneNode(data.type, data.config);
  const portConfig = getPortConfigForNode("AutoPanner");

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}
      <div className="nodrag">
        <AutoNodeControls nodeType="AutoPanner" nodeId={id} currentData={data.config} />
      </div>
      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
