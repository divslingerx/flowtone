/**
 * NodeItem - Individual node in the catalog
 *
 * Supports:
 * - Drag to canvas
 * - Double-click to auto-place
 * - Tooltip with description
 */

import { useState } from "react";
import type { NodeDefinition } from "./nodeCategories";

// ============================================================================
// NODE ITEM COMPONENT
// ============================================================================

export interface NodeItemProps {
  node: NodeDefinition;
  onDoubleClick: () => void;
}

export function NodeItem({ node, onDoubleClick }: NodeItemProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);

    // Set drag data
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/reactflow", node.type);
    e.dataTransfer.setData("application/flowtone-nodetype", node.type);

    // Optional: Set custom drag image
    // const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    // e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <button
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDoubleClick={onDoubleClick}
      title={node.description || node.label}
      className={`
        w-full px-3 py-2
        flex items-center gap-2
        rounded-md
        bg-white/30 dark:bg-gray-800/30
        hover:bg-white/60 dark:hover:bg-gray-700/60
        active:bg-white/80 dark:active:bg-gray-600/80
        border border-transparent
        hover:border-blue-300/50 dark:hover:border-blue-500/50
        transition-all
        cursor-grab active:cursor-grabbing
        group
        ${isDragging ? "opacity-50 scale-95" : "opacity-100 scale-100"}
        ${node.featured ? "ring-1 ring-blue-400/30 dark:ring-blue-500/30" : ""}
      `}
    >
      {/* Node Icon */}
      <span className="text-base flex-shrink-0">{node.icon || "⚙️"}</span>

      {/* Node Label */}
      <span className="text-xs font-medium text-gray-900 dark:text-white flex-1 text-left truncate">
        {node.label}
      </span>

      {/* Featured Star */}
      {node.featured && (
        <span className="text-xs text-yellow-500 dark:text-yellow-400 flex-shrink-0">
          ⭐
        </span>
      )}

      {/* Hover hint */}
      <span
        className="
          text-[10px] text-gray-500 dark:text-gray-400
          opacity-0 group-hover:opacity-100
          transition-opacity
          flex-shrink-0
        "
      >
        ⇅
      </span>
    </button>
  );
}
