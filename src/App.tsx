import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import { shallow } from "zustand/shallow";
import { useRFStore, RFStore } from "./store/store";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./nodes";
import { edgeTypes } from "./edges";
import * as Tone from "tone";
import { useAudioEngine } from "./store/audioContext";
import { NodeCatalog } from "./components/node-catalog";
import { StartupModal } from "./components/startup-modal";
import { useCallback, useRef, useState } from "react";
import { nanoid } from "nanoid";
import type { ToneComponentKey } from "./nodes/types";

const selector = (store: RFStore) => ({
  nodes: store.nodes,
  edges: store.edges,
  onNodesChange: store.onNodesChange,
  onEdgesChange: store.onEdgesChange,
  onConnect: store.onConnect,
});

export default function App() {
  const [isStarted, setIsStarted] = useState(false);

  // Use the singleton AudioEngine from context (created in main.tsx)
  const audioEngine = useAudioEngine();
  const { onConnect, nodes, edges, onEdgesChange, onNodesChange } = useRFStore(
    selector,
    shallow
  );
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Handle drop event from sidebar
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      if (!reactFlowWrapper.current) return;

      const nodeType = e.dataTransfer.getData("application/flowtone-nodetype");
      if (!nodeType) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

      // Calculate position in flow coordinates
      // This is a simplified version - React Flow's screenToFlowPosition is better
      // but requires being inside ReactFlowProvider
      const position = {
        x: e.clientX - reactFlowBounds.left - 100,
        y: e.clientY - reactFlowBounds.top - 50,
      };

      // Create new node
      const newNode = {
        id: nanoid(),
        type: nodeType,
        position,
        data: {
          label: nodeType,
          kind: "atomic" as const,
          toneType: nodeType,
          config: {},
        },
      };

      // Add to store
      useRFStore.getState().nodes.push(newNode as any);

      // Trigger re-render
      onNodesChange([
        {
          type: "add",
          item: newNode as any,
        },
      ]);

      // Create audio node
      audioEngine?.createNode(newNode.id, nodeType as ToneComponentKey);
    },
    [onNodesChange, audioEngine]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleStart = async () => {
    await Tone.start();
    setIsStarted(true);
  };

  if (!isStarted) {
    return <StartupModal onStart={handleStart} />;
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Node Catalog Sidebar */}
      <NodeCatalog />

      {/* Main ReactFlow Canvas */}
      <div
        ref={reactFlowWrapper}
        style={{ width: "100%", height: "100%" }}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          maxZoom={1.5}
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
