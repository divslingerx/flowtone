/**
 * CategorySection - Collapsible category in the node catalog
 *
 * Displays a group of related nodes with expand/collapse functionality
 */

import { ChevronDown, ChevronRight } from "lucide-react";
import { NodeItem } from "./NodeItem";
import type { NodeCategoryDefinition } from "./nodeCategories";

// ============================================================================
// CATEGORY SECTION COMPONENT
// ============================================================================

export interface CategorySectionProps {
  category: NodeCategoryDefinition;
  isCollapsed: boolean;
  onToggle: () => void;
  onNodeDoubleClick: (nodeType: string) => void;
}

export function CategorySection({
  category,
  isCollapsed,
  onToggle,
  onNodeDoubleClick,
}: CategorySectionProps) {
  return (
    <div className="rounded-lg overflow-hidden">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="
          w-full px-3 py-2
          flex items-center gap-2
          bg-gray-100/50 dark:bg-gray-800/50
          hover:bg-gray-200/50 dark:hover:bg-gray-700/50
          border border-gray-200/30 dark:border-gray-700/30
          transition-colors
          group
        "
      >
        {/* Expand/Collapse Icon */}
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
        )}

        {/* Category Icon */}
        <span className="text-lg flex-shrink-0">{category.icon}</span>

        {/* Category Label */}
        <span className="text-sm font-semibold text-gray-900 dark:text-white flex-1 text-left">
          {category.label}
        </span>

        {/* Node Count Badge */}
        <span
          className="
            px-2 py-0.5 rounded-full text-xs
            bg-gray-200/50 dark:bg-gray-700/50
            text-gray-600 dark:text-gray-400
            group-hover:bg-gray-300/50 dark:group-hover:bg-gray-600/50
            transition-colors
          "
        >
          {category.nodes.length}
        </span>
      </button>

      {/* Category Nodes List */}
      {!isCollapsed && (
        <div className="p-1 space-y-0.5 bg-gray-50/30 dark:bg-gray-900/30">
          {category.nodes.map((node) => (
            <NodeItem
              key={node.type}
              node={node}
              onDoubleClick={() => onNodeDoubleClick(node.type)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
