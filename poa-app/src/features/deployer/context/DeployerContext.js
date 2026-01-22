/**
 * DeployerContext - React Context provider for the DAO deployment wizard
 *
 * Provides state management and actions for the 5-step deployment process.
 * Uses useReducer for complex state transitions.
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import {
  deployerReducer,
  initialState,
  ACTION_TYPES,
  STEPS,
  STEP_NAMES,
  ADVANCED_STEP_NAMES,
  UI_MODES,
  PERMISSION_KEYS,
  PERMISSION_DESCRIPTIONS,
  createDefaultRole,
  createDefaultVotingClass,
  VOTING_STRATEGY,
} from './deployerReducer';
import { getTemplateById, getTemplateDefaults, TEMPLATE_LIST } from '../templates';

// Create the context
const DeployerContext = createContext(null);

/**
 * DeployerProvider - Wraps components that need access to deployer state
 */
export function DeployerProvider({ children }) {
  const [state, dispatch] = useReducer(deployerReducer, initialState);

  // Memoized action creators
  const actions = useMemo(() => ({
    // Navigation
    setStep: (step) => dispatch({ type: ACTION_TYPES.SET_STEP, payload: step }),
    nextStep: () => dispatch({ type: ACTION_TYPES.NEXT_STEP }),
    prevStep: () => dispatch({ type: ACTION_TYPES.PREV_STEP }),
    goToStep: (stepIndex) => dispatch({ type: ACTION_TYPES.SET_STEP, payload: stepIndex }),

    // UI Mode & Templates
    setUIMode: (mode) =>
      dispatch({ type: ACTION_TYPES.SET_UI_MODE, payload: mode }),
    selectTemplate: (templateId) =>
      dispatch({ type: ACTION_TYPES.SELECT_TEMPLATE, payload: templateId }),
    applyTemplate: (templateId) => {
      const defaults = getTemplateDefaults(templateId);
      if (defaults) {
        dispatch({ type: ACTION_TYPES.APPLY_TEMPLATE, payload: defaults });
      }
    },
    clearTemplate: () =>
      dispatch({ type: ACTION_TYPES.CLEAR_TEMPLATE }),
    toggleGuidance: (value) =>
      dispatch({ type: ACTION_TYPES.TOGGLE_GUIDANCE, payload: value }),
    expandSection: (section) =>
      dispatch({ type: ACTION_TYPES.EXPAND_SECTION, payload: section }),

    // Philosophy (Simple Mode)
    setPhilosophySlider: (value) =>
      dispatch({ type: ACTION_TYPES.SET_PHILOSOPHY_SLIDER, payload: value }),
    setPowerBundle: (bundleKey, roleIndices) =>
      dispatch({ type: ACTION_TYPES.SET_POWER_BUNDLE, payload: { bundleKey, roleIndices } }),
    togglePowerBundle: (bundleKey, roleIndex) =>
      dispatch({ type: ACTION_TYPES.TOGGLE_POWER_BUNDLE, payload: { bundleKey, roleIndex } }),
    applyPhilosophy: (voting, permissions) =>
      dispatch({ type: ACTION_TYPES.APPLY_PHILOSOPHY, payload: { voting, permissions } }),

    // Template Journey (Discovery Flow)
    setDiscoveryAnswer: (questionId, answer) =>
      dispatch({ type: ACTION_TYPES.SET_DISCOVERY_ANSWER, payload: { questionId, answer } }),
    setSelfAssessmentAnswer: (questionId, answer) =>
      dispatch({ type: ACTION_TYPES.SET_SELF_ASSESSMENT_ANSWER, payload: { questionId, answer } }),
    setMatchedVariation: (variationKey) =>
      dispatch({ type: ACTION_TYPES.SET_MATCHED_VARIATION, payload: variationKey }),
    confirmVariation: () =>
      dispatch({ type: ACTION_TYPES.CONFIRM_VARIATION }),
    setCurrentQuestionIndex: (index) =>
      dispatch({ type: ACTION_TYPES.SET_CURRENT_QUESTION_INDEX, payload: index }),
    nextDiscoveryQuestion: () =>
      dispatch({ type: ACTION_TYPES.NEXT_DISCOVERY_QUESTION }),
    prevDiscoveryQuestion: () =>
      dispatch({ type: ACTION_TYPES.PREV_DISCOVERY_QUESTION }),
    togglePhilosophyView: (value) =>
      dispatch({ type: ACTION_TYPES.TOGGLE_PHILOSOPHY_VIEW, payload: value }),
    toggleGrowthPathView: (value) =>
      dispatch({ type: ACTION_TYPES.TOGGLE_GROWTH_PATH_VIEW, payload: value }),
    togglePitfallsView: (value) =>
      dispatch({ type: ACTION_TYPES.TOGGLE_PITFALLS_VIEW, payload: value }),
    resetTemplateJourney: () =>
      dispatch({ type: ACTION_TYPES.RESET_TEMPLATE_JOURNEY }),
    applyVariation: (variation, template) =>
      dispatch({ type: ACTION_TYPES.APPLY_VARIATION, payload: { variation, template } }),

    // Organization
    updateOrganization: (updates) =>
      dispatch({ type: ACTION_TYPES.UPDATE_ORGANIZATION, payload: updates }),
    setLogoURL: (url) =>
      dispatch({ type: ACTION_TYPES.SET_LOGO_URL, payload: url }),
    setIPFSHash: (hash) =>
      dispatch({ type: ACTION_TYPES.SET_IPFS_HASH, payload: hash }),
    addLink: (link) =>
      dispatch({ type: ACTION_TYPES.ADD_LINK, payload: link }),
    removeLink: (index) =>
      dispatch({ type: ACTION_TYPES.REMOVE_LINK, payload: index }),
    updateLink: (index, link) =>
      dispatch({ type: ACTION_TYPES.UPDATE_LINK, payload: { index, link } }),

    // Roles
    addRole: (name) =>
      dispatch({ type: ACTION_TYPES.ADD_ROLE, payload: { name } }),
    updateRole: (index, updates) =>
      dispatch({ type: ACTION_TYPES.UPDATE_ROLE, payload: { index, updates } }),
    removeRole: (index) =>
      dispatch({ type: ACTION_TYPES.REMOVE_ROLE, payload: index }),
    reorderRoles: (roles) =>
      dispatch({ type: ACTION_TYPES.REORDER_ROLES, payload: roles }),
    updateRoleHierarchy: (roleIndex, adminRoleIndex) =>
      dispatch({ type: ACTION_TYPES.UPDATE_ROLE_HIERARCHY, payload: { roleIndex, adminRoleIndex } }),
    updateRoleVouching: (roleIndex, vouching) =>
      dispatch({ type: ACTION_TYPES.UPDATE_ROLE_VOUCHING, payload: { roleIndex, vouching } }),
    updateRoleDistribution: (roleIndex, distribution) =>
      dispatch({ type: ACTION_TYPES.UPDATE_ROLE_DISTRIBUTION, payload: { roleIndex, distribution } }),
    updateRoleHatConfig: (roleIndex, hatConfig) =>
      dispatch({ type: ACTION_TYPES.UPDATE_ROLE_HAT_CONFIG, payload: { roleIndex, hatConfig } }),

    // Permissions
    togglePermission: (permissionKey, roleIndex) =>
      dispatch({ type: ACTION_TYPES.TOGGLE_PERMISSION, payload: { permissionKey, roleIndex } }),
    setPermission: (permissionKey, roleIndices) =>
      dispatch({ type: ACTION_TYPES.SET_PERMISSION_ROLES, payload: { permissionKey, roleIndices } }),
    setPermissionRoles: (permissionKey, roleIndices) =>
      dispatch({ type: ACTION_TYPES.SET_PERMISSION_ROLES, payload: { permissionKey, roleIndices } }),
    setAllPermissionsForRole: (roleIndex) =>
      dispatch({ type: ACTION_TYPES.SET_ALL_PERMISSIONS_FOR_ROLE, payload: roleIndex }),
    clearAllPermissionsForRole: (roleIndex) =>
      dispatch({ type: ACTION_TYPES.CLEAR_ALL_PERMISSIONS_FOR_ROLE, payload: roleIndex }),

    // Voting
    setVotingMode: (mode) =>
      dispatch({ type: ACTION_TYPES.SET_VOTING_MODE, payload: mode }),
    setVotingQuorum: (hybridQuorum, ddQuorum) =>
      dispatch({ type: ACTION_TYPES.SET_VOTING_QUORUM, payload: { hybridQuorum, ddQuorum } }),
    updateVoting: (updates) =>
      dispatch({ type: ACTION_TYPES.UPDATE_VOTING, payload: updates }),
    addVotingClass: (classData) =>
      dispatch({ type: ACTION_TYPES.ADD_VOTING_CLASS, payload: classData }),
    updateVotingClass: (index, updates) =>
      dispatch({ type: ACTION_TYPES.UPDATE_VOTING_CLASS, payload: { index, updates } }),
    removeVotingClass: (index) =>
      dispatch({ type: ACTION_TYPES.REMOVE_VOTING_CLASS, payload: index }),
    toggleClassLock: (index) =>
      dispatch({ type: ACTION_TYPES.TOGGLE_CLASS_LOCK, payload: index }),
    applyWeightPreset: (preset) =>
      dispatch({ type: ACTION_TYPES.APPLY_WEIGHT_PRESET, payload: preset }),

    // Features
    toggleFeature: (feature, value) =>
      dispatch({ type: ACTION_TYPES.TOGGLE_FEATURE, payload: { feature, value } }),

    // Validation
    setErrors: (errors) =>
      dispatch({ type: ACTION_TYPES.SET_ERRORS, payload: errors }),
    clearErrors: () =>
      dispatch({ type: ACTION_TYPES.CLEAR_ERRORS }),

    // Deployment
    setDeploymentStatus: (status) =>
      dispatch({ type: ACTION_TYPES.SET_DEPLOYMENT_STATUS, payload: status }),

    // Reset
    resetState: () =>
      dispatch({ type: ACTION_TYPES.RESET_STATE }),
  }), [dispatch]);

  // Computed values / selectors
  const selectors = useMemo(() => ({
    // UI Mode
    isSimpleMode: () => state.ui.mode === UI_MODES.SIMPLE,
    isAdvancedMode: () => state.ui.mode === UI_MODES.ADVANCED,

    // Templates
    getSelectedTemplate: () => state.ui.selectedTemplate ? getTemplateById(state.ui.selectedTemplate) : null,
    isTemplateApplied: () => state.ui.templateApplied,
    getTemplateList: () => TEMPLATE_LIST,

    // Template Journey
    getDiscoveryAnswers: () => state.templateJourney.discoveryAnswers,
    getSelfAssessmentAnswers: () => state.templateJourney.selfAssessmentAnswers,
    getMatchedVariation: () => state.templateJourney.matchedVariation,
    isVariationConfirmed: () => state.templateJourney.variationConfirmed,
    getCurrentQuestionIndex: () => state.templateJourney.currentQuestionIndex,
    isShowingPhilosophy: () => state.templateJourney.showPhilosophy,
    isShowingGrowthPath: () => state.templateJourney.showGrowthPath,
    isShowingPitfalls: () => state.templateJourney.showPitfalls,

    // Get current step name (respects mode)
    getCurrentStepName: () => {
      const names = state.ui.mode === UI_MODES.ADVANCED ? ADVANCED_STEP_NAMES : STEP_NAMES;
      return names[state.currentStep];
    },

    // Philosophy
    getPhilosophyType: () => {
      const slider = state.philosophy.slider;
      if (slider <= 30) return 'delegated';
      if (slider <= 70) return 'hybrid';
      return 'democratic';
    },

    // Check if a role has a power bundle
    hasPowerBundle: (bundleKey, roleIndex) =>
      (state.philosophy.powerBundles[bundleKey] || []).includes(roleIndex),

    // Check if a role has a specific permission
    hasPermission: (permissionKey, roleIndex) =>
      (state.permissions[permissionKey] || []).includes(roleIndex),

    // Get all permissions for a role
    getPermissionsForRole: (roleIndex) => {
      const perms = {};
      for (const key of PERMISSION_KEYS) {
        perms[key] = (state.permissions[key] || []).includes(roleIndex);
      }
      return perms;
    },

    // Get role by index
    getRole: (index) => state.roles[index],

    // Get role by id
    getRoleById: (id) => state.roles.find(r => r.id === id),

    // Get parent role for a role
    getParentRole: (roleIndex) => {
      const role = state.roles[roleIndex];
      if (!role || role.hierarchy.adminRoleIndex === null) {
        return null; // Top-level role
      }
      return state.roles[role.hierarchy.adminRoleIndex];
    },

    // Get children roles for a role
    getChildrenRoles: (roleIndex) =>
      state.roles.filter((role, idx) =>
        role.hierarchy.adminRoleIndex === roleIndex && idx !== roleIndex
      ),

    // Check if hierarchy has cycles (invalid)
    hasCycles: () => {
      const visited = new Set();
      const recursionStack = new Set();

      const hasCycleFrom = (index) => {
        if (recursionStack.has(index)) return true;
        if (visited.has(index)) return false;

        visited.add(index);
        recursionStack.add(index);

        const role = state.roles[index];
        const parentIndex = role?.hierarchy?.adminRoleIndex;

        if (parentIndex !== null && parentIndex !== undefined && parentIndex < state.roles.length) {
          if (hasCycleFrom(parentIndex)) return true;
        }

        recursionStack.delete(index);
        return false;
      };

      for (let i = 0; i < state.roles.length; i++) {
        visited.clear();
        recursionStack.clear();
        if (hasCycleFrom(i)) return true;
      }
      return false;
    },

    // Calculate total slice percentage for voting classes
    getTotalSlicePercentage: () =>
      state.voting.classes.reduce((sum, cls) => sum + (cls.slicePct || 0), 0),

    // Check if voting classes are valid (sum to 100)
    isVotingClassesValid: () => {
      const total = state.voting.classes.reduce((sum, cls) => sum + (cls.slicePct || 0), 0);
      return total === 100;
    },

    // Get validation state for current step
    isCurrentStepValid: () => {
      // This will be enhanced with Zod validation
      const step = state.currentStep;

      switch (step) {
        case STEPS.ORGANIZATION:
          return !!(state.organization.name && state.organization.description);

        case STEPS.ROLES:
          return state.roles.length > 0 &&
            state.roles.every(r => r.name) &&
            !selectors.hasCycles();

        case STEPS.PERMISSIONS:
          return true; // Permissions are always valid (can be empty)

        case STEPS.VOTING:
          return selectors.isVotingClassesValid();

        case STEPS.REVIEW:
          return true;

        default:
          return true;
      }
    },

    // Check if can proceed to next step
    canProceed: () => selectors.isCurrentStepValid(),

    // Check if deployer is ready to deploy
    isReadyToDeploy: () => {
      return state.organization.name &&
        state.organization.description &&
        state.roles.length > 0 &&
        !selectors.hasCycles() &&
        selectors.isVotingClassesValid();
    },

    // Get validation status for a specific step (for step indicator)
    getStepValidationStatus: (stepIndex) => {
      switch (stepIndex) {
        case STEPS.TEMPLATE:
          return { isValid: !!state.ui.selectedTemplate };
        case STEPS.IDENTITY:
          return { isValid: !!(state.organization.name && state.organization.description) };
        case STEPS.TEAM:
          return {
            isValid: state.roles.length > 0 &&
                     state.roles.some(r => r.hierarchy?.adminRoleIndex === null)
          };
        case STEPS.GOVERNANCE:
          return {
            isValid: state.voting.classes.reduce((sum, cls) => sum + (cls.slicePct || 0), 0) === 100
          };
        case STEPS.LAUNCH:
        case STEPS.REVIEW:
          return { isValid: true }; // Review step is always "valid" - it just displays status
        default:
          return { isValid: true };
      }
    },
  }), [state]);

  // Create context value
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    actions,
    selectors,

    // Re-export constants for convenience
    STEPS,
    STEP_NAMES,
    PERMISSION_KEYS,
    PERMISSION_DESCRIPTIONS,
    VOTING_STRATEGY,
  }), [state, dispatch, actions, selectors]);

  return (
    <DeployerContext.Provider value={contextValue}>
      {children}
    </DeployerContext.Provider>
  );
}

/**
 * useDeployer - Hook to access deployer context
 */
export function useDeployer() {
  const context = useContext(DeployerContext);

  if (!context) {
    throw new Error('useDeployer must be used within a DeployerProvider');
  }

  return context;
}

/**
 * useDeployerState - Hook to access just the state
 */
export function useDeployerState() {
  const { state } = useDeployer();
  return state;
}

/**
 * useDeployerActions - Hook to access just the actions
 */
export function useDeployerActions() {
  const { actions } = useDeployer();
  return actions;
}

/**
 * useDeployerSelectors - Hook to access just the selectors
 */
export function useDeployerSelectors() {
  const { selectors } = useDeployer();
  return selectors;
}

// Export constants and utilities
export {
  STEPS,
  STEP_NAMES,
  ADVANCED_STEP_NAMES,
  UI_MODES,
  PERMISSION_KEYS,
  PERMISSION_DESCRIPTIONS,
  VOTING_STRATEGY,
  createDefaultRole,
  createDefaultVotingClass,
  TEMPLATE_LIST,
  getTemplateById,
  getTemplateDefaults,
};

export default DeployerContext;
