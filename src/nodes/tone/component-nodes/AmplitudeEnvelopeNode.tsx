import { type NodeProps } from "@xyflow/react";
import { type AmplitudeEnvelopeNode } from "../../types";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";
import { AutoNodeControls } from "~/components/auto-controls";

export function AmplitudeEnvelopeNode({ data, id }: NodeProps<AmplitudeEnvelopeNode>) {
  const portConfig = getPortConfigForNode("AmplitudeEnvelope");

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}

      <div className="nodrag">
        <AutoNodeControls
          nodeType="AmplitudeEnvelope"
          nodeId={id}
          currentData={data.config}
        />
      </div>

      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
