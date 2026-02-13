/**
 * DynamicHandles - Auto-generates React Flow handles from port configuration
 *
 * This component dynamically creates Handle components based on a node's
 * PortConfig, eliminating the need to manually define handles for each node type.
 */

import { Handle, Position } from "@xyflow/react";
import type { PortConfig, Port } from "~/nodes/types3";
import { createHandleId, getHandleStyle } from "~/ports/types";

// ============================================================================
// DYNAMIC HANDLES COMPONENT
// ============================================================================

export interface DynamicHandlesProps {
  /**
   * Node ID (used to generate unique handle IDs)
   */
  nodeId: string;

  /**
   * Port configuration defining inputs and outputs
   */
  ports: PortConfig;

  /**
   * Optional className for styling
   */
  className?: string;

  /**
   * Show port labels
   * @default false
   */
  showLabels?: boolean;
}

/**
 * Dynamically generates React Flow handles from port configuration
 */
export function DynamicHandles({
  nodeId,
  ports,
  className = "",
  showLabels = false,
}: DynamicHandlesProps) {
  return (
    <>
      {/* Input handles */}
      {ports.inputs.map((port, index) => (
        <DynamicHandle
          key={`${nodeId}:in:${index}`}
          nodeId={nodeId}
          port={port}
          portIndex={index}
          direction="in"
          showLabel={showLabels}
          className={className}
        />
      ))}

      {/* Output handles */}
      {ports.outputs.map((port, index) => (
        <DynamicHandle
          key={`${nodeId}:out:${index}`}
          nodeId={nodeId}
          port={port}
          portIndex={index}
          direction="out"
          showLabel={showLabels}
          className={className}
        />
      ))}
    </>
  );
}

// ============================================================================
// DYNAMIC HANDLE (Single Handle)
// ============================================================================

interface DynamicHandleProps {
  nodeId: string;
  port: Port;
  portIndex: number;
  direction: "in" | "out";
  showLabel?: boolean;
  className?: string;
}

function DynamicHandle({
  nodeId,
  port,
  portIndex,
  direction,
  showLabel = false,
  className = "",
}: DynamicHandleProps) {
  const handleId = createHandleId(nodeId, direction, portIndex);
  const handleType = direction === "in" ? "target" : "source";
  const baseStyle = getHandleStyle(port.signalType);

  // Calculate final position with offset
  const finalStyle: React.CSSProperties = {
    ...baseStyle,
  };

  // Apply position offset if specified
  if (port.positionOffset) {
    // Calculate position based on handle position and offset
    const { x, y } = port.positionOffset;

    // For top/bottom positions, adjust left
    if (port.position === Position.Top || port.position === Position.Bottom) {
      finalStyle.left = `calc(50% + ${x}px)`;
      if (y !== 0) {
        finalStyle.top =
          port.position === Position.Top ? `${y}px` : `calc(100% + ${y}px)`;
      }
    }

    // For left/right positions, adjust top
    if (port.position === Position.Left || port.position === Position.Right) {
      finalStyle.top = `calc(50% + ${y}px)`;
      if (x !== 0) {
        finalStyle.left =
          port.position === Position.Left ? `${x}px` : `calc(100% + ${x}px)`;
      }
    }
  }

  return (
    <Handle
      id={handleId}
      type={handleType}
      position={port.position}
      style={finalStyle}
      className={className}
      title={port.label || port.id}
    >
      {showLabel && port.label && (
        <span
          className="handle-label"
          style={{
            position: "absolute",
            fontSize: "10px",
            fontWeight: "500",
            color: "#666",
            whiteSpace: "nowrap",
            // Position label based on handle position
            ...(port.position === Position.Top && {
              top: "-18px",
              left: "50%",
              transform: "translateX(-50%)",
            }),
            ...(port.position === Position.Bottom && {
              bottom: "-18px",
              left: "50%",
              transform: "translateX(-50%)",
            }),
            ...(port.position === Position.Left && {
              left: "-8px",
              top: "50%",
              transform: "translate(-100%, -50%)",
            }),
            ...(port.position === Position.Right && {
              right: "-8px",
              top: "50%",
              transform: "translate(100%, -50%)",
            }),
          }}
        >
          {port.label}
        </span>
      )}
    </Handle>
  );
}

// ============================================================================
// EXPORT HELPER COMPONENTS
// ============================================================================

/**
 * Simple wrapper for nodes with default single port config
 */
export interface SimpleHandlesProps {
  nodeId: string;
  hasInput?: boolean;
  hasOutput?: boolean;
  signalType?: "audio" | "control" | "midi";
}

export function SimpleHandles({
  nodeId,
  hasInput = true,
  hasOutput = true,
  signalType = "audio",
}: SimpleHandlesProps) {
  const ports: PortConfig = {
    inputs: hasInput
      ? [
          {
            id: "input",
            type: "input",
            signalType,
            position: Position.Top,
            channelIndex: 0,
          },
        ]
      : [],
    outputs: hasOutput
      ? [
          {
            id: "output",
            type: "output",
            signalType,
            position: Position.Bottom,
            channelIndex: 0,
          },
        ]
      : [],
  };

  return <DynamicHandles nodeId={nodeId} ports={ports} />;
}
