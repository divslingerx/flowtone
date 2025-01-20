import { createWithEqualityFn } from "zustand/traditional";
import { AudioEngine } from "./audioEngine";
import { initialNodes } from "../nodes";
import { initialEdges } from "../edges";

import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "@xyflow/react";

import { AppNode, ToneComponentKey } from "../nodes/types";
import { devtools } from "zustand/middleware";
import { nanoid } from "nanoid";
import * as Tone from "tone";

export interface RFStore {
  nodes: AppNode[];
  edges: Edge[];
  audioEngine: AudioEngine;
  getNode: (id: string) => AppNode;
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: AppNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: <T extends AppNode>(
    id: string,
    data: Partial<T["data"]>
  ) => void;
  addEdge: (data: Omit<Edge, "id">) => void;
  createNode: (type: ToneComponentKey) => void;
}

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const audioEngine = new AudioEngine();

export const useRFStore = createWithEqualityFn(
  devtools<RFStore>((set, get) => ({
    nodes: initialNodes,
    edges: initialEdges,
    audioEngine,

    getNode: (id: string) => {
      const node = get().nodes.find((n) => n.id === id);
      if (!node) throw new Error(`Node with id ${id} not found`);
      return node;
    },

    onNodesChange: (changes) => {
      console.log("Node Changes", changes);
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },

    onEdgesChange: (changes) => {
      console.log("Edge Changes", changes);
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },

    setNodes: (nodes) => {
      console.log("SetNodes", nodes);
      set({ nodes });
    },
    setEdges: (edges) => {
      console.log("setEdges", edges);
      set({ edges });
    },

    addEdge: (data) => {
      const id = nanoid(6);
      const edge = { id, ...data };
      set({ edges: [edge, ...get().edges] });
    },

    createNode<T extends ToneComponentKey>(type: T) {
      const id = nanoid(); // Unique ID for the node

      // Create audio node through AudioEngine
      const node = audioEngine.createNode(id, type);

      // Get default parameters from the created node
      const data = Object.fromEntries(
        Object.entries(node).filter(
          ([, value]) =>
            value instanceof Tone.Param ||
            typeof value === "number" ||
            typeof value === "string"
        )
      );

      const position = { x: 400, y: 0 }; // Default position

      // Update the store with the new node
      set({
        nodes: [
          ...get().nodes,
          {
            id,
            type,
            data: { ...data, label: type },
            position,
          },
        ] as AppNode[],
      });

      console.log(`Created node: ${type}`, { id, data, position });
    },

    updateNodeData: <NodeType extends AppNode>(
      id: string,
      data: Partial<NodeType["data"]>
    ) => {
      try {
        // Update audio parameters through AudioEngine
        audioEngine.updateNodeParams(id, data);

        // Update store state
        set({
          nodes: get().nodes.map((node) =>
            node.id === id
              ? ({ ...node, data: { ...node.data, ...data } } as NodeType)
              : node
          ),
        });
      } catch (error) {
        console.error(`Failed to update node ${id}:`, error);
        throw error;
      }
    },

    onConnect: (connection) => {
      try {
        // Create audio connection
        audioEngine.connectNodes(connection.source, connection.target);

        // Update store state
        set({
          edges: addEdge(connection, get().edges),
        });
      } catch (error) {
        console.error("Failed to connect nodes:", error);
        throw error;
      }
    },
  }))
);
