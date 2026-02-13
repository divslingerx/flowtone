/**
 * Validation module exports
 */

export {
  validateConnection,
  wouldCreateCycle,
  createStrictValidator,
  createPermissiveValidator,
  createNoCycleValidator,
  getConnectionErrorMessage,
  validateAllConnections,
  getNodePortConfig,
  getPortFromHandle,
} from "./connectionValidation";

export type { ValidationResult } from "./connectionValidation";
