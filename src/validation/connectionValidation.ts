/**
 * Connection validation using port metadata
 *
 * Validates React Flow connections based on port signal types,
 * channel counts, and other constraints.
 */

import type { Connection, Edge } from "@xyflow/react";
import type { AppNode, PortConfig } from "~/nodes/types3";
import type { Port } from "~/ports/types";
import { parseHandleId, getPortByIndex, isValidPortConnection } from "~/ports/types";
import { getPortConfigForNode } from "~/ports/registry";

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

// ============================================================================
// PORT LOOKUP
// ============================================================================

/**
 * Get port configuration for a node
 */
export function getNodePortConfig(
  node: AppNode,
  portRegistry: Map<string, PortConfig>
): PortConfig | null {
  // Check if node has custom port config
  if ("data" in node && "ports" in node.data && node.data.ports) {
    return node.data.ports;
  }

  // Check registry
  const registryConfig = portRegistry.get(node.id);
  if (registryConfig) {
    return registryConfig;
  }

  // For atomic Tone.js nodes, use default from port registry
  if ("data" in node && "kind" in node.data && node.data.kind === "atomic" && "toneType" in node.data) {
    return getPortConfigForNode(node.data.toneType);
  }

  // For composite nodes, use ports from definition
  if ("data" in node && "kind" in node.data && node.data.kind === "composite") {
    return node.data.ports;
  }

  return null;
}

/**
 * Get port from node and handle ID
 */
export function getPortFromHandle(
  node: AppNode,
  handleId: string | undefined | null,
  portRegistry: Map<string, PortConfig>
): Port | null {
  if (!handleId) return null;

  const config = getNodePortConfig(node, portRegistry);
  if (!config) return null;

  try {
    const { direction, portIndex } = parseHandleId(handleId);
    return getPortByIndex(config, direction, portIndex) || null;
  } catch {
    return null;
  }
}

// ============================================================================
// CONNECTION VALIDATION
// ============================================================================

/**
 * Validate a React Flow connection using port metadata
 *
 * @param connection - The connection to validate
 * @param nodes - All nodes in the graph
 * @param edges - All existing edges
 * @param portRegistry - Port configuration registry
 * @returns Validation result with reason if invalid
 */
export function validateConnection(
  connection: Connection,
  nodes: AppNode[],
  edges: Edge[],
  portRegistry: Map<string, PortConfig> = new Map()
): ValidationResult {
  const { source, target, sourceHandle, targetHandle } = connection;

  if (!source || !target) {
    return { valid: false, reason: "Missing source or target" };
  }

  // Find source and target nodes
  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);

  if (!sourceNode || !targetNode) {
    return { valid: false, reason: "Source or target node not found" };
  }

  // Prevent self-connections
  if (source === target) {
    return { valid: false, reason: "Cannot connect node to itself" };
  }

  // Get port configurations
  const sourcePort = getPortFromHandle(sourceNode, sourceHandle, portRegistry);
  const targetPort = getPortFromHandle(targetNode, targetHandle, portRegistry);

  if (!sourcePort || !targetPort) {
    // If no port metadata available, allow connection (backward compatibility)
    return { valid: true };
  }

  // Validate port compatibility
  const portValidation = isValidPortConnection(sourcePort, targetPort);
  if (!portValidation.valid) {
    return portValidation;
  }

  // Check for duplicate connections
  const isDuplicate = edges.some(
    (edge) =>
      edge.source === source &&
      edge.target === target &&
      edge.sourceHandle === sourceHandle &&
      edge.targetHandle === targetHandle
  );

  if (isDuplicate) {
    return { valid: false, reason: "Connection already exists" };
  }

  // Check for cycles (optional - can be disabled for audio graphs)
  if (wouldCreateCycle(source, target, edges)) {
    return { valid: false, reason: "Would create feedback loop" };
  }

  return { valid: true };
}

/**
 * Check if adding an edge would create a cycle
 *
 * @param newSource - Source node ID for new edge
 * @param newTarget - Target node ID for new edge
 * @param edges - Existing edges
 * @returns true if adding edge would create cycle
 */
export function wouldCreateCycle(
  newSource: string,
  newTarget: string,
  edges: Edge[]
): boolean {
  // Build adjacency list
  const graph = new Map<string, Set<string>>();

  edges.forEach((edge) => {
    if (!graph.has(edge.source)) {
      graph.set(edge.source, new Set());
    }
    graph.get(edge.source)!.add(edge.target);
  });

  // Add proposed edge
  if (!graph.has(newSource)) {
    graph.set(newSource, new Set());
  }
  graph.get(newSource)!.add(newTarget);

  // DFS to detect cycle
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function hasCycleDFS(node: string): boolean {
    visited.add(node);
    recStack.add(node);

    const neighbors = graph.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycleDFS(neighbor)) {
          return true;
        }
      } else if (recStack.has(neighbor)) {
        // Back edge found - cycle detected
        return true;
      }
    }

    recStack.delete(node);
    return false;
  }

  // Check from new source
  return hasCycleDFS(newSource);
}

// ============================================================================
// VALIDATION PRESETS
// ============================================================================

/**
 * Strict validation mode (prevents all invalid connections)
 */
export function createStrictValidator(
  nodes: AppNode[],
  edges: Edge[],
  portRegistry: Map<string, PortConfig>
) {
  return (connection: Connection): boolean => {
    const result = validateConnection(connection, nodes, edges, portRegistry);
    return result.valid;
  };
}

/**
 * Permissive validation mode (only prevents obvious errors)
 */
export function createPermissiveValidator(
  _nodes: AppNode[],
  edges: Edge[],
  _portRegistry: Map<string, PortConfig>
) {
  return (connection: Connection): boolean => {
    const { source, target } = connection;

    // Only prevent self-connections and duplicates
    if (source === target) return false;

    const isDuplicate = edges.some(
      (edge) =>
        edge.source === source &&
        edge.target === target &&
        edge.sourceHandle === connection.sourceHandle &&
        edge.targetHandle === connection.targetHandle
    );

    return !isDuplicate;
  };
}

/**
 * No cycle validation mode (allows all connections except cycles)
 */
export function createNoCycleValidator(
  _nodes: AppNode[],
  edges: Edge[]
) {
  return (connection: Connection): boolean => {
    const { source, target } = connection;
    if (source === target) return false;
    return !wouldCreateCycle(source, target, edges);
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user-friendly error message for connection validation
 */
export function getConnectionErrorMessage(
  result: ValidationResult
): string {
  if (result.valid) {
    return "";
  }

  return result.reason || "Invalid connection";
}

/**
 * Validate all existing connections in the graph
 * Useful for checking graph integrity after changes
 */
export function validateAllConnections(
  nodes: AppNode[],
  edges: Edge[],
  portRegistry: Map<string, PortConfig>
): { valid: boolean; invalidEdges: Array<{ edge: Edge; reason: string }> } {
  const invalidEdges: Array<{ edge: Edge; reason: string }> = [];

  edges.forEach((edge) => {
    const connection: Connection = {
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? null,
      targetHandle: edge.targetHandle ?? null,
    };

    const result = validateConnection(connection, nodes, edges, portRegistry);
    if (!result.valid) {
      invalidEdges.push({
        edge,
        reason: result.reason || "Unknown error",
      });
    }
  });

  return {
    valid: invalidEdges.length === 0,
    invalidEdges,
  };
}
