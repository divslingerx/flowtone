import { type NodeProps } from "@xyflow/react";
import { type AmplitudeEnvelopeNode } from "../../types";
import { useToneNode } from "~/hooks/useToneNode";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";

export function AmplitudeEnvelopeNode({ data, id }: NodeProps<AmplitudeEnvelopeNode>) {
  const _envelope = useToneNode(data.type, data.config);
  const portConfig = getPortConfigForNode("AmplitudeEnvelope");

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}

      <div className="text-xs text-gray-600 dark:text-gray-400 text-center py-2">
        ADSR amplitude envelope
      </div>

      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
