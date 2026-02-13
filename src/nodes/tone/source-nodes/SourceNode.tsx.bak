import { createContext, useContext, ReactNode } from "react";
import { Node } from "@xyflow/react";
import { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import * as Tone from "tone";
import type { Source } from "tone/build/esm/source/Source";
import { ToneNode } from "~/nodes/types";

export const ToneNode = <T extends ToneNode<any>>(props: T) => {
  const toneComp = new toneComponent(data);
  if (!context) {
    throw new Error("useSourceNode must be used within a SourceNodeWrapper");
  }
  return context;
};
export const SourceNodeWrapper = <T,>({
  node,
  children,
  onUpdateNode,
}: SourceNodeWrapperProps<T>) => {
  const [localNode, setLocalNode] = useState(node);

  const updateNode = (data: Partial<SourceNodeData<T>>) => {
    const updatedNode = {
      ...localNode,
      data: {
        ...localNode.data,
        ...data,
      },
    };
    setLocalNode(updatedNode);
    onUpdateNode(updatedNode);
  };

  return (
    <SourceNodeContext.Provider value={{ node: localNode, updateNode }}>
      <div>
        {/* Input Handles */}
        {localNode.data.inputs.map((input, index) => (
          <Handle
            key={input}
            type="target"
            position={Position.Left}
            id={input}
            style={{ top: 20 + index * 40 }}
          />
        ))}

        {/* Output Handles */}
        {localNode.data.outputs.map((output, index) => (
          <Handle
            key={output}
            type="source"
            position={Position.Right}
            id={output}
            style={{ top: 20 + index * 40 }}
          />
        ))}

        {/* Children (UI Component) */}
        {children}
      </div>
    </SourceNodeContext.Provider>
  );
};
