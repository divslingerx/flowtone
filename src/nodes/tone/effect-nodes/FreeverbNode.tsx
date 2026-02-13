import { type NodeProps } from "@xyflow/react";
import { type FreeverbNode } from "../../types";
import { useToneNode } from "~/hooks/useToneNode";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";
import { AutoNodeControls } from "~/components/auto-controls";

export function FreeverbNode({ data, id }: NodeProps<FreeverbNode>) {
  const _freeverb = useToneNode(data.type, data.config);
  const portConfig = getPortConfigForNode("Freeverb");

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}
      <div className="nodrag">
        <AutoNodeControls nodeType="Freeverb" nodeId={id} currentData={data.config} />
      </div>
      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
