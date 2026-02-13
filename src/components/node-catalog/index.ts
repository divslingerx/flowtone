/**
 * Node Catalog exports
 */

export { NodeCatalog } from "./NodeCatalog";
export { CategorySection } from "./CategorySection";
export { NodeItem } from "./NodeItem";
export {
  NODE_CATEGORIES,
  getAllNodeDefinitions,
  getFeaturedNodes,
  searchNodes,
  getNodeDefinition,
  getCategoryById,
} from "./nodeCategories";
export type {
  NodeCategory,
  NodeDefinition,
  NodeCategoryDefinition,
} from "./nodeCategories";
export {
  findOptimalPlacement,
  getSmartPlacementPosition,
  getViewportCenter,
  snapToGrid,
  getPlacementWithSnapping,
} from "./autoPlacement";
