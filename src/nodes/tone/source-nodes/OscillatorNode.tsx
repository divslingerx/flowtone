import { type NodeProps } from "@xyflow/react";
import { type OscillatorNode } from "../../types";
import { useToneNode } from "~/hooks/useToneNode";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";
import { AutoNodeControls } from "~/components/auto-controls";
import { useEffect } from "react";

export function OscillatorNode({ data, id }: NodeProps<OscillatorNode>) {
  const oscillator = useToneNode(data.type, data.config);
  const portConfig = getPortConfigForNode("Oscillator");

  useEffect(() => {
    oscillator?.start();
  }, [oscillator]);

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}
      <div className="nodrag">
        <AutoNodeControls nodeType="Oscillator" nodeId={id} currentData={data.config} />
      </div>
      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
