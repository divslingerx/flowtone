import { type NodeProps } from "@xyflow/react";
import { type FilterNode } from "../../types";
import { useToneNode } from "~/hooks/useToneNode";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";
import { AutoNodeControls } from "~/components/auto-controls";

export function FilterNode({ data, id }: NodeProps<FilterNode>) {
  const _filter = useToneNode(data.type, data.config);
  const portConfig = getPortConfigForNode("Filter");

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}

      {/* Auto-generated parameter controls */}
      <div className="nodrag">
        <AutoNodeControls
          nodeType="Filter"
          nodeId={id}
          currentData={data.config}
        />
      </div>

      {/* Dynamic handles */}
      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
