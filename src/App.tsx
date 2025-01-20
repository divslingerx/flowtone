import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import { shallow } from "zustand/shallow";
import { useRFStore, RFStore } from "./store/store";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "./nodes";
import { edgeTypes } from "./edges";
import * as Tone from "tone";

const selector = (store: RFStore) => ({
  nodes: store.nodes,
  edges: store.edges,
  onNodesChange: store.onNodesChange,
  onEdgesChange: store.onEdgesChange,
  addEdge: store.addEdge,
});

export default function App() {
  const { addEdge, nodes, edges, onEdgesChange, onNodesChange } = useRFStore(
    selector,
    shallow
  );

  const toggleAudio = () => {
    if (Tone.getContext().state === "suspended") {
      Tone.getContext().resume();
    } else {
      Tone.getContext().rawContext.suspend(0);
    }
  };

  return (
    <ReactFlow
      onClick={toggleAudio}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={addEdge}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      maxZoom={1.5}
    >
      <Background />
      <MiniMap />
      <Controls />
    </ReactFlow>
  );
}
