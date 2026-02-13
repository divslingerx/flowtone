/**
 * AutoNodeControls - Automatically generates parameter controls for Tone.js nodes
 *
 * Uses parameter metadata to determine which control type to render
 * for each parameter on a node.
 */

import * as Tone from "tone";
import { useReactFlow } from "@xyflow/react";
import { useRFStore } from "~/store/store";
import type { ToneComponentKey } from "~/nodes/types3";
import {
  getParameterMetadata,
  getParameterOrder,
  getVisibleParameters,
  NODE_METADATA,
} from "~/lib/parameters/metadata";
import { AutoControl } from "./AutoControl";

// ============================================================================
// AUTO NODE CONTROLS COMPONENT
// ============================================================================

export interface AutoNodeControlsProps {
  nodeType: ToneComponentKey;
  nodeId: string;
  currentData: any;
  className?: string;
}

/**
 * Automatically generates parameter controls for a Tone.js node
 */
export function AutoNodeControls({
  nodeType,
  nodeId,
  currentData,
  className = "",
}: AutoNodeControlsProps) {
  const { updateNodeData } = useReactFlow();
  const audioEngine = useRFStore((state) => state.audioEngine);

  // Get Tone.js defaults to discover parameters
  const ToneClass = Tone[nodeType] as any;
  const defaults = ToneClass?.getDefaults?.() || {};

  // Get node-specific metadata
  const nodeMeta = NODE_METADATA[nodeType] || {};

  // Extract parameter names
  const allParams = Object.keys(defaults);
  const visibleParams = getVisibleParameters(allParams, nodeType);
  const orderedParams = getParameterOrder(nodeType, visibleParams);

  // Handle parameter change
  const handleParamChange = (paramName: string, value: any) => {
    console.log(`[AutoNodeControls] ${nodeType}.${paramName} = ${value}`);

    // Update React Flow state
    updateNodeData(nodeId, { [paramName]: value });

    // Update audio engine
    audioEngine?.updateNodeParams(nodeId, { [paramName]: value });
  };

  // Debug: Log what we're working with
  if (orderedParams.length > 0) {
    console.log(`[AutoNodeControls] ${nodeType} params:`, {
      orderedParams,
      currentData,
      defaults,
    });
  }

  // Check if we have grouped parameters
  const hasGroups = nodeMeta.groups !== undefined;

  if (hasGroups) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Object.entries(nodeMeta.groups!).map(([groupName, params]) => (
          <div key={groupName} className="border-t border-gray-200/30 dark:border-gray-700/30 pt-3 first:border-t-0 first:pt-0">
            <h4 className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">
              {groupName}
            </h4>
            <div className={`grid ${nodeMeta.layout === "vertical" ? "grid-cols-2" : "grid-cols-2"} gap-3`}>
              {params.map((paramName) => {
                const meta = getParameterMetadata(paramName, nodeType);
                if (!meta) return null;

                return (
                  <AutoControl
                    key={paramName}
                    paramName={paramName}
                    metadata={meta}
                    value={currentData[paramName] ?? defaults[paramName]}
                    onChange={(v) => handleParamChange(paramName, v)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // No groups - simple layout
  const gridCols = nodeMeta.layout === "vertical" ? "grid-cols-1" : "grid-cols-2";

  return (
    <div className={`grid ${gridCols} gap-3 ${className}`}>
      {orderedParams.map((paramName) => {
        const meta = getParameterMetadata(paramName, nodeType);
        if (!meta) {
          // No metadata - skip this parameter
          return null;
        }

        return (
          <AutoControl
            key={paramName}
            paramName={paramName}
            metadata={meta}
            value={currentData[paramName] ?? defaults[paramName]}
            onChange={(v) => handleParamChange(paramName, v)}
          />
        );
      })}
    </div>
  );
}
