/**
 * Auto-placement algorithm for nodes
 *
 * Intelligently places new nodes near the last selected node,
 * avoiding overlaps with existing nodes.
 */

import type { Node, XYPosition } from "@xyflow/react";

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 200;
const MIN_SPACING = 50; // Minimum space between nodes
const PLACEMENT_OFFSET = 250; // Distance from reference node

// ============================================================================
// AUTO-PLACEMENT FUNCTIONS
// ============================================================================

/**
 * Find an optimal position for a new node near a reference point
 *
 * Strategy: Try positions in a circular pattern around the reference point,
 * starting from the right and moving clockwise, checking for collisions.
 *
 * @param nodes - Existing nodes to avoid
 * @param referencePosition - Position to place near (e.g., last selected node)
 * @param viewportCenter - Center of the current viewport as fallback
 * @returns Optimal position for the new node
 */
export function findOptimalPlacement(
  nodes: Node[],
  referencePosition: XYPosition | null,
  viewportCenter: XYPosition = { x: 400, y: 300 }
): XYPosition {
  // If no reference position, use viewport center
  const reference = referencePosition || viewportCenter;

  // Try positions in order of preference
  const candidates = generateCandidatePositions(reference);

  // Find first position that doesn't overlap
  for (const candidate of candidates) {
    if (!hasOverlap(candidate, nodes)) {
      return candidate;
    }
  }

  // If all positions have overlaps, use the best one (least overlaps)
  const leastOverlapping = findLeastOverlappingPosition(candidates, nodes);
  if (leastOverlapping) {
    return leastOverlapping;
  }
  // Fallback to first candidate or reference position
  return candidates[0] ?? reference;
}

/**
 * Generate candidate positions around a reference point
 * Pattern: Right, Bottom-Right, Bottom, Bottom-Left, Left, Top-Left, Top, Top-Right
 * Then expanding circles at increasing distances
 */
function generateCandidatePositions(reference: XYPosition): XYPosition[] {
  const positions: XYPosition[] = [];

  // Directions in radians (0 = right, going clockwise)
  const angles = [
    0, // Right
    Math.PI / 4, // Bottom-Right
    Math.PI / 2, // Bottom
    (3 * Math.PI) / 4, // Bottom-Left
    Math.PI, // Left
    (5 * Math.PI) / 4, // Top-Left
    (3 * Math.PI) / 2, // Top
    (7 * Math.PI) / 4, // Top-Right
  ];

  // Try multiple distances
  const distances = [
    PLACEMENT_OFFSET,
    PLACEMENT_OFFSET * 1.5,
    PLACEMENT_OFFSET * 2,
    PLACEMENT_OFFSET * 2.5,
  ];

  for (const distance of distances) {
    for (const angle of angles) {
      const x = reference.x + Math.cos(angle) * distance;
      const y = reference.y + Math.sin(angle) * distance;
      positions.push({ x, y });
    }
  }

  return positions;
}

/**
 * Check if a position overlaps with any existing nodes
 */
function hasOverlap(
  position: XYPosition,
  nodes: Node[],
  nodeWidth: number = DEFAULT_NODE_WIDTH,
  nodeHeight: number = DEFAULT_NODE_HEIGHT
): boolean {
  for (const node of nodes) {
    if (isColliding(position, nodeWidth, nodeHeight, node)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if two rectangles collide (with spacing buffer)
 */
function isColliding(
  pos: XYPosition,
  width: number,
  height: number,
  node: Node
): boolean {
  const nodeWidth = (node.width as number) || DEFAULT_NODE_WIDTH;
  const nodeHeight = (node.height as number) || DEFAULT_NODE_HEIGHT;

  // Add spacing buffer
  const buffer = MIN_SPACING;

  return !(
    pos.x + width + buffer < node.position.x ||
    pos.x > node.position.x + nodeWidth + buffer ||
    pos.y + height + buffer < node.position.y ||
    pos.y > node.position.y + nodeHeight + buffer
  );
}

/**
 * Find position with least overlaps
 */
function findLeastOverlappingPosition(
  candidates: XYPosition[],
  nodes: Node[]
): XYPosition | null {
  const firstCandidate = candidates[0];
  if (!firstCandidate) return null;

  let bestPosition = firstCandidate;
  let minOverlaps = countOverlaps(bestPosition, nodes);

  for (const candidate of candidates) {
    const overlaps = countOverlaps(candidate, nodes);
    if (overlaps < minOverlaps) {
      minOverlaps = overlaps;
      bestPosition = candidate;
    }
  }

  return bestPosition;
}

/**
 * Count number of overlaps for a position
 */
function countOverlaps(
  position: XYPosition,
  nodes: Node[],
  nodeWidth: number = DEFAULT_NODE_WIDTH,
  nodeHeight: number = DEFAULT_NODE_HEIGHT
): number {
  let count = 0;
  for (const node of nodes) {
    if (isColliding(position, nodeWidth, nodeHeight, node)) {
      count++;
    }
  }
  return count;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the last selected node position
 */
export function getLastSelectedNodePosition(nodes: Node[]): XYPosition | null {
  // Find the most recently selected node
  // Assuming nodes have a `selected` property
  const selectedNodes = nodes.filter((n) => n.selected);

  if (selectedNodes.length > 0) {
    // Return the last selected node's position
    const lastSelected = selectedNodes[selectedNodes.length - 1];
    if (lastSelected) {
      return lastSelected.position;
    }
  }

  // Fallback: Find the most recently added node (highest index)
  if (nodes.length > 0) {
    const lastNode = nodes[nodes.length - 1];
    if (lastNode) {
      return lastNode.position;
    }
  }

  return null;
}

/**
 * Calculate viewport center from React Flow viewport
 */
export function getViewportCenter(
  viewport: { x: number; y: number; zoom: number },
  canvasSize: { width: number; height: number } = { width: 800, height: 600 }
): XYPosition {
  // Transform screen center to flow coordinates
  const centerX = (canvasSize.width / 2 - viewport.x) / viewport.zoom;
  const centerY = (canvasSize.height / 2 - viewport.y) / viewport.zoom;

  return { x: centerX, y: centerY };
}

/**
 * Get a smart default position for a new node
 *
 * This is the main function to use when adding a new node
 */
export function getSmartPlacementPosition(
  nodes: Node[],
  viewport: { x: number; y: number; zoom: number },
  canvasSize?: { width: number; height: number }
): XYPosition {
  const lastPosition = getLastSelectedNodePosition(nodes);
  const viewportCenter = getViewportCenter(viewport, canvasSize);

  return findOptimalPlacement(nodes, lastPosition, viewportCenter);
}

/**
 * Snap position to grid (optional, for cleaner layout)
 */
export function snapToGrid(
  position: XYPosition,
  gridSize: number = 50
): XYPosition {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
}

/**
 * Get position with optional grid snapping
 */
export function getPlacementWithSnapping(
  nodes: Node[],
  viewport: { x: number; y: number; zoom: number },
  enableSnapping: boolean = false,
  gridSize: number = 50
): XYPosition {
  const position = getSmartPlacementPosition(nodes, viewport);

  return enableSnapping ? snapToGrid(position, gridSize) : position;
}
