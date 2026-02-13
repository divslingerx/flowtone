import { type NodeProps } from "@xyflow/react";
import { type FrequencyEnvelopeNode } from "~/nodes/types";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";
import { AutoNodeControls } from "~/components/auto-controls";

export function FrequencyEnvelopeNode({ data, id }: NodeProps<FrequencyEnvelopeNode>) {
  const portConfig = getPortConfigForNode("FrequencyEnvelope");

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}

      <div className="nodrag">
        <AutoNodeControls
          nodeType="FrequencyEnvelope"
          nodeId={id}
          currentData={data.config}
        />
      </div>

      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
