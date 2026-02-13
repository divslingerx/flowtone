/**
 * NodeCatalog - Retractable sidebar for browsing and adding nodes
 *
 * Features:
 * - Modern glass design with backdrop blur
 * - Respects light/dark mode
 * - Collapsible categories with localStorage persistence
 * - Drag nodes to canvas or double-click to auto-place
 * - Search functionality
 */

import { useState, useEffect, useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { NODE_CATEGORIES, searchNodes, type NodeCategory } from "./nodeCategories";
import { CategorySection } from "./CategorySection";
import { getSmartPlacementPosition } from "./autoPlacement";
import { useRFStore } from "~/store/store";
import { nanoid } from "nanoid";
import type { ToneComponentKey } from "~/nodes/types";

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

const STORAGE_KEY_SIDEBAR_OPEN = "flowtone-sidebar-open";
const STORAGE_KEY_COLLAPSED_CATEGORIES = "flowtone-collapsed-categories";

// ============================================================================
// NODE CATALOG COMPONENT
// ============================================================================

export function NodeCatalog() {
  const { getNodes, setNodes, getViewport } = useReactFlow();
  const audioEngine = useRFStore((state) => state.audioEngine);

  // Sidebar open/closed state
  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY_SIDEBAR_OPEN);
    return stored !== null ? stored === "true" : true;
  });

  // Collapsed categories state
  const [collapsedCategories, setCollapsedCategories] = useState<Set<NodeCategory>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_COLLAPSED_CATEGORIES);
    if (stored) {
      try {
        return new Set(JSON.parse(stored));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SIDEBAR_OPEN, String(isOpen));
  }, [isOpen]);

  // Persist collapsed categories
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY_COLLAPSED_CATEGORIES,
      JSON.stringify(Array.from(collapsedCategories))
    );
  }, [collapsedCategories]);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Toggle category collapse
  const toggleCategory = useCallback((categoryId: NodeCategory) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  // Handle double-click to add node
  const handleAddNode = useCallback(
    (nodeType: string) => {
      const nodes = getNodes();
      const viewport = getViewport();

      // Get smart placement position
      const position = getSmartPlacementPosition(nodes, viewport);

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

      // Add to React Flow
      setNodes((nodes) => [...nodes, newNode]);

      // Create audio node
      audioEngine?.createNode(newNode.id, nodeType as ToneComponentKey);
    },
    [getNodes, getViewport, setNodes, audioEngine]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Filter categories based on search
  const filteredCategories = searchQuery
    ? [
        {
          id: "search-results" as NodeCategory,
          label: "Search Results",
          description: `Results for "${searchQuery}"`,
          icon: "🔍",
          nodes: searchNodes(searchQuery),
        },
      ]
    : NODE_CATEGORIES;

  return (
    <>
      {/* Sidebar Container */}
      <div
        className={`
          fixed left-0 top-0 h-full z-10
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ width: "280px" }}
      >
        {/* Glass Background */}
        <div
          className="
            h-full
            bg-white/70 dark:bg-gray-900/70
            backdrop-blur-lg
            border-r border-gray-200/50 dark:border-gray-700/50
            shadow-2xl
            flex flex-col
          "
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Node Catalog
            </h2>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-10 pr-8 py-2 rounded-lg
                  bg-white/50 dark:bg-gray-800/50
                  border border-gray-300/50 dark:border-gray-600/50
                  text-sm text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  transition-all
                "
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="
                    absolute right-2 top-1/2 -translate-y-1/2
                    p-1 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50
                    transition-colors
                  "
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredCategories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                isCollapsed={collapsedCategories.has(category.id)}
                onToggle={() => toggleCategory(category.id)}
                onNodeDoubleClick={handleAddNode}
              />
            ))}

            {/* No results message */}
            {searchQuery && filteredCategories.length === 1 && filteredCategories[0]?.nodes.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                No nodes found for "{searchQuery}"
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
              {NODE_CATEGORIES.reduce((sum, cat) => sum + cat.nodes.length, 0)} nodes available
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`
          fixed top-4 z-20
          p-2 rounded-r-lg
          bg-white/70 dark:bg-gray-900/70
          backdrop-blur-lg
          border border-l-0 border-gray-200/50 dark:border-gray-700/50
          shadow-lg
          hover:bg-white/90 dark:hover:bg-gray-800/90
          transition-all duration-300
          ${isOpen ? "left-[280px]" : "left-0"}
        `}
        title={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>
    </>
  );
}
