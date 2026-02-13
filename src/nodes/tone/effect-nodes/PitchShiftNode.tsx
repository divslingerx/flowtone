import { type NodeProps } from "@xyflow/react";
import { type PitchShiftNode } from "../../types";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";
import { AutoNodeControls } from "~/components/auto-controls";

export function PitchShiftNode({ data, id }: NodeProps<PitchShiftNode>) {
  const portConfig = getPortConfigForNode("PitchShift");

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}
      <div className="nodrag">
        <AutoNodeControls nodeType="PitchShift" nodeId={id} currentData={data.config} />
      </div>
      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
