/**
 * Deployer Steps - Export all step components
 */

// New Simple mode steps
export { TemplateStep } from './TemplateStep';
export { IdentityStep } from './IdentityStep';
export { TeamStep } from './TeamStep';
export { GovernanceStep } from './GovernanceStep';

// Legacy Advanced mode steps
export { OrganizationStep } from './OrganizationStep';
export { RolesStep } from './RolesStep';
export { PermissionsStep } from './PermissionsStep';
export { VotingStep } from './VotingStep';
export { ReviewStep } from './ReviewStep';

export default {
  // New steps
  TemplateStep: require('./TemplateStep').default,
  IdentityStep: require('./IdentityStep').default,
  TeamStep: require('./TeamStep').default,
  GovernanceStep: require('./GovernanceStep').default,
  // Legacy steps
  OrganizationStep: require('./OrganizationStep').default,
  RolesStep: require('./RolesStep').default,
  PermissionsStep: require('./PermissionsStep').default,
  VotingStep: require('./VotingStep').default,
  ReviewStep: require('./ReviewStep').default,
};
