import React from "react";
import { SourceNodeWrapper, useSourceNode } from "./SourceNode";

type MySourceNodeData = {
  type: "oscillator";
  frequency: number;
};

const OscillatorNodeUI = () => {
  const { node, updateNode } = useSourceNode<MySourceNodeData>();

  const handleFrequencyChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateNode({ frequency: parseFloat(event.target.value) });
  };

  return (
    <div>
      <label>Frequency:</label>
      <input
        type="number"
        value={node.data.frequency}
        onChange={handleFrequencyChange}
      />
    </div>
  );
};

const OscillatorNode = ({
  node,
  onUpdateNode,
}: {
  node: Node<MySourceNodeData>;
  onUpdateNode: (node: Node<MySourceNodeData>) => void;
}) => {
  return (
    <SourceNodeWrapper node={node} onUpdateNode={onUpdateNode}>
      <OscillatorNodeUI />
    </SourceNodeWrapper>
  );
};

export default OscillatorNode;
