import { type NodeProps } from "@xyflow/react";
import { type PWMOscillatorNode } from "../../types";
import { useToneNode } from "~/hooks/useToneNode";
import { DynamicHandles } from "~/components/handles";
import { getPortConfigForNode } from "~/ports/registry";
import { AutoNodeControls } from "~/components/auto-controls";
import { useEffect } from "react";

export function PWMOscillatorNode({ data, id }: NodeProps<PWMOscillatorNode>) {
  const oscillator = useToneNode(data.type, data.config);
  const portConfig = getPortConfigForNode("PWMOscillator");

  useEffect(() => {
    oscillator?.start();
  }, [oscillator]);

  return (
    <div className="react-flow__node-default">
      {data.label && <div className="text-lg font-semibold mb-3">{data.label}</div>}
      <div className="nodrag">
        <AutoNodeControls nodeType="PWMOscillator" nodeId={id} currentData={data.config} />
      </div>
      <DynamicHandles nodeId={id} ports={portConfig} />
    </div>
  );
}
