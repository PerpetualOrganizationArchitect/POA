/**
 * Deployer Feature - Main Export
 *
 * This module provides all the components, context, utilities, and validation
 * needed for the DAO deployment wizard.
 */

// Context and State Management
export {
  DeployerProvider,
  useDeployer,
  useDeployerState,
  useDeployerActions,
  useDeployerSelectors,
  STEPS,
  STEP_NAMES,
  PERMISSION_KEYS,
  PERMISSION_DESCRIPTIONS,
  VOTING_STRATEGY,
  createDefaultRole,
  createDefaultVotingClass,
} from './context/DeployerContext';

export {
  deployerReducer,
  initialState,
  ACTION_TYPES,
} from './context/deployerReducer';

// Utilities
export {
  indicesToBitmap,
  bitmapToIndices,
  isRoleInBitmap,
  addRoleToBitmap,
  removeRoleFromBitmap,
  toggleRoleInBitmap,
  createAllRolesBitmap,
  countRolesInBitmap,
  permissionsToBitmaps,
  bitmapsToPermissions,
} from './utils/bitmapUtils';

export {
  buildHierarchyTree,
  getDescendants,
  getAncestors,
  getRoleDepth,
  detectCycles,
  wouldCreateCycle,
  getValidParentOptions,
  flattenHierarchy,
  validateHierarchy,
  reorderByDependency,
} from './utils/hierarchyUtils';

export {
  generateOrgId,
  mapRole,
  mapVotingClasses,
  buildRoleAssignments,
  mapStateToDeploymentParams,
  createDeploymentConfig,
  validateDeploymentConfig,
  logDeploymentParams,
} from './utils/deploymentMapper';

// Validation
export {
  organizationSchema,
  roleSchema,
  rolesArraySchema,
  permissionsSchema,
  votingSchema,
  votingClassSchema,
  deployerStateSchema,
  validateOrganizationStep,
  validateRolesStep,
  validatePermissionsStep,
  validateVotingStep,
  validateDeployerState,
  formatZodErrors,
  getFirstError,
  hasError,
} from './validation/schemas';

// Components
export { DeployerWizard } from './components/DeployerWizard';
export { StepHeader } from './components/common/StepHeader';
export { NavigationButtons } from './components/common/NavigationButtons';
export { ValidationSummary } from './components/common/ValidationSummary';
export { RoleCard } from './components/role/RoleCard';
export { RoleForm } from './components/role/RoleForm';
export { RoleList } from './components/role/RoleList';
export { RoleHierarchyTree } from './components/role/RoleHierarchyTree';
export { PermissionMatrix } from './components/permissions/PermissionMatrix';
export { VotingClassCard } from './components/voting/VotingClassCard';
export { VotingClassForm } from './components/voting/VotingClassForm';
export { DeployerUsernameSection } from './components/review/DeployerUsernameSection';

// Hooks
export { useDeployerUsername } from './hooks/useDeployerUsername';

// Steps
export { OrganizationStep } from './steps/OrganizationStep';
export { RolesStep } from './steps/RolesStep';
export { PermissionsStep } from './steps/PermissionsStep';
export { VotingStep } from './steps/VotingStep';
export { ReviewStep } from './steps/ReviewStep';

// Re-export for convenience
export * as bitmapUtils from './utils/bitmapUtils';
export * as hierarchyUtils from './utils/hierarchyUtils';
export * as deploymentMapper from './utils/deploymentMapper';
export * as validationSchemas from './validation/schemas';
