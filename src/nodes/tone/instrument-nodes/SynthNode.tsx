import { type NodeProps } from "@xyflow/react";
import { type SynthNode } from "../../types";
import { useToneNode } from "~/hooks/useToneNode";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";
import { AutoNodeControls } from "~/components/auto-controls";

export function SynthNode({ data, id }: NodeProps<SynthNode>) {
  const _synth = useToneNode(data.type, data.config);
  const portConfig = getPortConfigForNode("Synth");

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}

      <div className="nodrag">
        <AutoNodeControls
          nodeType="Synth"
          nodeId={id}
          currentData={data.config}
        />
      </div>

      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
