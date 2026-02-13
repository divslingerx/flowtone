import { type NodeProps } from "@xyflow/react";
import { type PannerNode } from "../../types";
import { useToneNode } from "~/hooks/useToneNode";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";
import { AutoNodeControls } from "~/components/auto-controls";

export function PannerNode({ data, id }: NodeProps<PannerNode>) {
  const _panner = useToneNode("Panner" as any, { pan: data.value });
  const portConfig = getPortConfigForNode("Panner");

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}
      <div className="nodrag">
        <AutoNodeControls nodeType="Panner" nodeId={id} currentData={{ pan: data.value }} />
      </div>
      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
