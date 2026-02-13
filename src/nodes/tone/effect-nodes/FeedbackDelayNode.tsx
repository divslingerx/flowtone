import { type NodeProps } from "@xyflow/react";
import { type FeedbackDelayNode } from "../../types";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";
import { AutoNodeControls } from "~/components/auto-controls";

export function FeedbackDelayNode({ data, id }: NodeProps<FeedbackDelayNode>) {
  const portConfig = getPortConfigForNode("FeedbackDelay");

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}
      <div className="nodrag">
        <AutoNodeControls nodeType="FeedbackDelay" nodeId={id} currentData={data.config} />
      </div>
      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
