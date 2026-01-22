/**
 * Deployer Reducer - Manages the complete state for the DAO deployment wizard
 *
 * This reducer handles all state transitions for the deployment process.
 * Supports both Simple mode (4 steps + template) and Advanced mode (5 steps).
 *
 * Simple Mode Flow:
 * Template → Identity → Team → Governance → Launch
 *
 * Advanced Mode Flow:
 * Organization → Roles → Permissions → Voting → Review
 */

import { v4 as uuidv4 } from 'uuid';

// Step constants - New flow
export const STEPS = {
  TEMPLATE: 0,        // Template selection (Simple mode)
  IDENTITY: 1,        // Organization details (replaces ORGANIZATION)
  TEAM: 2,            // Roles (simplified in Simple mode)
  GOVERNANCE: 3,      // Philosophy + Powers (replaces Permissions + Voting)
  LAUNCH: 4,          // Review & Deploy

  // Legacy step aliases for Advanced mode compatibility
  ORGANIZATION: 1,
  ROLES: 2,
  PERMISSIONS: 3,
  VOTING: 3,
  REVIEW: 4,
};

export const STEP_NAMES = [
  'Choose Template',
  'Identity',
  'Team',
  'Governance',
  'Launch',
];

// Advanced mode step names (for backwards compatibility)
export const ADVANCED_STEP_NAMES = [
  'Template',
  'Organization Details',
  'Roles & Hierarchy',
  'Permissions & Voting',
  'Review & Deploy',
];

// UI Modes
export const UI_MODES = {
  SIMPLE: 'simple',
  ADVANCED: 'advanced',
};

// Voting strategies
export const VOTING_STRATEGY = {
  DIRECT: 0,       // 1-person-1-vote based on hat
  ERC20_BAL: 1,    // Token balance based
};

// Permission keys (9 total)
export const PERMISSION_KEYS = [
  'quickJoinRoles',
  'tokenMemberRoles',
  'tokenApproverRoles',
  'taskCreatorRoles',
  'educationCreatorRoles',
  'educationMemberRoles',
  'hybridProposalCreatorRoles',
  'ddVotingRoles',
  'ddCreatorRoles',
];

// Permission descriptions with labels for UI
export const PERMISSION_DESCRIPTIONS = {
  quickJoinRoles: {
    label: 'Quick Join',
    description: 'Roles automatically assigned when a user joins via QuickJoin',
  },
  tokenMemberRoles: {
    label: 'Token Member',
    description: 'Roles that can hold and receive participation tokens',
  },
  tokenApproverRoles: {
    label: 'Token Approver',
    description: 'Roles that can approve token transfer requests',
  },
  taskCreatorRoles: {
    label: 'Task Creator',
    description: 'Roles that can create new tasks',
  },
  educationCreatorRoles: {
    label: 'Education Creator',
    description: 'Roles that can create education modules',
  },
  educationMemberRoles: {
    label: 'Education Member',
    description: 'Roles that can access and complete education modules',
  },
  hybridProposalCreatorRoles: {
    label: 'Hybrid Proposal Creator',
    description: 'Roles that can create hybrid voting proposals',
  },
  ddVotingRoles: {
    label: 'DD Voting',
    description: 'Roles that can vote in direct democracy polls',
  },
  ddCreatorRoles: {
    label: 'DD Creator',
    description: 'Roles that can create direct democracy polls',
  },
};

// Create a default role object
export const createDefaultRole = (index = 0, name = 'New Role') => ({
  id: uuidv4(),
  name,
  description: '', // Role description for IPFS metadata
  image: '',
  canVote: true,
  vouching: {
    enabled: false,
    quorum: 0,
    voucherRoleIndex: 0,
    combineWithHierarchy: false,
  },
  defaults: {
    eligible: true,
    standing: true,
  },
  hierarchy: {
    adminRoleIndex: null, // null = top-level (will be converted to MaxUint256)
  },
  distribution: {
    mintToDeployer: index === 0, // First role minted to deployer
    mintToExecutor: false,
    additionalWearers: [],        // Resolved addresses (populated before deployment)
    additionalWearerUsernames: [], // Usernames entered by user
  },
  hatConfig: {
    maxSupply: 1000,
    mutableHat: true,
  },
});

// Create a default voting class
export const createDefaultVotingClass = (slicePct = 100) => ({
  id: uuidv4(),
  strategy: VOTING_STRATEGY.DIRECT,
  slicePct,
  quadratic: false,
  minBalance: 0,
  asset: null, // null = AddressZero
  hatIds: [],
  locked: false, // Prevents weight redistribution when locked
});

// Initial state for the deployer
export const initialState = {
  // Current step in the wizard (starts at template selection)
  currentStep: STEPS.TEMPLATE,

  // UI State - Controls simple vs advanced mode
  ui: {
    mode: UI_MODES.SIMPLE,        // 'simple' | 'advanced'
    selectedTemplate: null,       // Template ID or null
    templateApplied: false,       // Has template been applied to state?
    showGuidance: true,           // Show guidance panel
    expandedSections: [],         // Which review sections are expanded
  },

  // Template Journey State - Discovery questions and variations
  templateJourney: {
    discoveryAnswers: {},         // { questionId: answerValue }
    selfAssessmentAnswers: {},    // { questionId: answerValue } (for custom template)
    matchedVariation: null,       // Key of the matched variation
    variationConfirmed: false,    // Has user confirmed the variation?
    currentQuestionIndex: 0,      // For step-by-step discovery
    showPhilosophy: false,        // Show philosophy explanation
    showGrowthPath: false,        // Show growth path visualization
    showPitfalls: false,          // Show relevant pitfalls
  },

  // Philosophy State (Simple Mode) - High-level governance choices
  philosophy: {
    slider: 50,                   // 0 = delegated, 50 = hybrid, 100 = democratic
    powerBundles: {
      admin: [1],                 // Role indices with admin bundle
      member: [0, 1],             // Role indices with member bundle
      creator: [0, 1],            // Role indices with creator bundle
    },
  },

  // Organization details
  organization: {
    name: '',
    description: '',
    logoURL: '',
    links: [],
    infoIPFSHash: '',
    autoUpgrade: true,
    username: '',
    template: 'default',
  },

  // Roles configuration
  roles: [
    {
      ...createDefaultRole(0, 'Member'),
      hierarchy: { adminRoleIndex: 1 }, // Points to Executive
    },
    {
      ...createDefaultRole(1, 'Executive'),
      id: uuidv4(),
      name: 'Executive',
      distribution: { mintToDeployer: true, mintToExecutor: false, additionalWearers: [], additionalWearerUsernames: [] },
      hierarchy: { adminRoleIndex: null }, // Top-level
    },
  ],

  // Permissions configuration
  // Arrays of role indices that have each permission
  permissions: {
    quickJoinRoles: [0],           // Member can quick join
    tokenMemberRoles: [0, 1],      // Both can hold tokens
    tokenApproverRoles: [1],       // Executive approves
    taskCreatorRoles: [0, 1],      // Both can create tasks
    educationCreatorRoles: [1],    // Executive creates education
    educationMemberRoles: [0, 1],  // Both can access education
    hybridProposalCreatorRoles: [0, 1], // Both can create proposals
    ddVotingRoles: [0, 1],         // Both can vote
    ddCreatorRoles: [0, 1],        // Both can create polls
  },

  // Voting configuration
  voting: {
    mode: 'DIRECT', // 'DIRECT' or 'HYBRID'
    hybridQuorum: 50,
    ddQuorum: 50,
    quadraticEnabled: false,
    democracyWeight: 50,
    participationWeight: 50,
    // Voting classes - more advanced configuration
    classes: [
      createDefaultVotingClass(100),
    ],
  },

  // Feature toggles
  features: {
    educationHubEnabled: false,
    electionHubEnabled: false,
  },

  // Deployment state
  deployment: {
    status: 'idle', // 'idle' | 'preparing' | 'deploying' | 'success' | 'error'
    error: null,
    result: null,
  },

  // Validation errors by step
  errors: {},
};

// Action types
export const ACTION_TYPES = {
  // Navigation
  SET_STEP: 'SET_STEP',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',

  // UI Mode & Templates
  SET_UI_MODE: 'SET_UI_MODE',
  SELECT_TEMPLATE: 'SELECT_TEMPLATE',
  APPLY_TEMPLATE: 'APPLY_TEMPLATE',
  CLEAR_TEMPLATE: 'CLEAR_TEMPLATE',
  TOGGLE_GUIDANCE: 'TOGGLE_GUIDANCE',
  EXPAND_SECTION: 'EXPAND_SECTION',

  // Philosophy (Simple Mode)
  SET_PHILOSOPHY_SLIDER: 'SET_PHILOSOPHY_SLIDER',
  SET_POWER_BUNDLE: 'SET_POWER_BUNDLE',
  TOGGLE_POWER_BUNDLE: 'TOGGLE_POWER_BUNDLE',
  APPLY_PHILOSOPHY: 'APPLY_PHILOSOPHY',

  // Template Journey (Discovery Flow)
  SET_DISCOVERY_ANSWER: 'SET_DISCOVERY_ANSWER',
  SET_SELF_ASSESSMENT_ANSWER: 'SET_SELF_ASSESSMENT_ANSWER',
  SET_MATCHED_VARIATION: 'SET_MATCHED_VARIATION',
  CONFIRM_VARIATION: 'CONFIRM_VARIATION',
  SET_CURRENT_QUESTION_INDEX: 'SET_CURRENT_QUESTION_INDEX',
  NEXT_DISCOVERY_QUESTION: 'NEXT_DISCOVERY_QUESTION',
  PREV_DISCOVERY_QUESTION: 'PREV_DISCOVERY_QUESTION',
  TOGGLE_PHILOSOPHY_VIEW: 'TOGGLE_PHILOSOPHY_VIEW',
  TOGGLE_GROWTH_PATH_VIEW: 'TOGGLE_GROWTH_PATH_VIEW',
  TOGGLE_PITFALLS_VIEW: 'TOGGLE_PITFALLS_VIEW',
  RESET_TEMPLATE_JOURNEY: 'RESET_TEMPLATE_JOURNEY',
  APPLY_VARIATION: 'APPLY_VARIATION',

  // Organization
  UPDATE_ORGANIZATION: 'UPDATE_ORGANIZATION',
  SET_LOGO_URL: 'SET_LOGO_URL',
  SET_IPFS_HASH: 'SET_IPFS_HASH',
  ADD_LINK: 'ADD_LINK',
  REMOVE_LINK: 'REMOVE_LINK',
  UPDATE_LINK: 'UPDATE_LINK',

  // Roles
  ADD_ROLE: 'ADD_ROLE',
  UPDATE_ROLE: 'UPDATE_ROLE',
  REMOVE_ROLE: 'REMOVE_ROLE',
  REORDER_ROLES: 'REORDER_ROLES',
  UPDATE_ROLE_HIERARCHY: 'UPDATE_ROLE_HIERARCHY',
  UPDATE_ROLE_VOUCHING: 'UPDATE_ROLE_VOUCHING',
  UPDATE_ROLE_DISTRIBUTION: 'UPDATE_ROLE_DISTRIBUTION',
  UPDATE_ROLE_HAT_CONFIG: 'UPDATE_ROLE_HAT_CONFIG',

  // Permissions
  TOGGLE_PERMISSION: 'TOGGLE_PERMISSION',
  SET_PERMISSION: 'SET_PERMISSION',
  SET_PERMISSION_ROLES: 'SET_PERMISSION_ROLES',
  SET_ALL_PERMISSIONS_FOR_ROLE: 'SET_ALL_PERMISSIONS_FOR_ROLE',
  CLEAR_ALL_PERMISSIONS_FOR_ROLE: 'CLEAR_ALL_PERMISSIONS_FOR_ROLE',

  // Voting
  SET_VOTING_MODE: 'SET_VOTING_MODE',
  SET_VOTING_QUORUM: 'SET_VOTING_QUORUM',
  UPDATE_VOTING: 'UPDATE_VOTING',
  ADD_VOTING_CLASS: 'ADD_VOTING_CLASS',
  UPDATE_VOTING_CLASS: 'UPDATE_VOTING_CLASS',
  REMOVE_VOTING_CLASS: 'REMOVE_VOTING_CLASS',
  TOGGLE_CLASS_LOCK: 'TOGGLE_CLASS_LOCK',
  APPLY_WEIGHT_PRESET: 'APPLY_WEIGHT_PRESET',

  // Features
  TOGGLE_FEATURE: 'TOGGLE_FEATURE',

  // Validation
  SET_ERRORS: 'SET_ERRORS',
  CLEAR_ERRORS: 'CLEAR_ERRORS',

  // Deployment
  SET_DEPLOYMENT_STATUS: 'SET_DEPLOYMENT_STATUS',

  // Reset
  RESET_STATE: 'RESET_STATE',
};

/**
 * Helper: Update permissions when a role is removed
 * Adjusts indices to account for the removed role
 */
function adjustPermissionsAfterRoleRemoval(permissions, removedIndex) {
  const adjusted = {};

  for (const key of PERMISSION_KEYS) {
    adjusted[key] = permissions[key]
      .filter(idx => idx !== removedIndex) // Remove the deleted role
      .map(idx => idx > removedIndex ? idx - 1 : idx); // Adjust indices
  }

  return adjusted;
}

/**
 * Helper: Update role hierarchy references when a role is removed
 */
function adjustRolesAfterRoleRemoval(roles, removedIndex) {
  return roles.map(role => {
    const adminIdx = role.hierarchy.adminRoleIndex;

    // If this role pointed to the removed role, point to null (top-level)
    if (adminIdx === removedIndex) {
      return {
        ...role,
        hierarchy: { ...role.hierarchy, adminRoleIndex: null },
      };
    }

    // Adjust index if it was after the removed role
    if (adminIdx !== null && adminIdx > removedIndex) {
      return {
        ...role,
        hierarchy: { ...role.hierarchy, adminRoleIndex: adminIdx - 1 },
      };
    }

    // Also adjust voucherRoleIndex if needed
    const voucherIdx = role.vouching.voucherRoleIndex;
    if (voucherIdx === removedIndex) {
      return {
        ...role,
        vouching: { ...role.vouching, voucherRoleIndex: 0 },
      };
    }
    if (voucherIdx > removedIndex) {
      return {
        ...role,
        vouching: { ...role.vouching, voucherRoleIndex: voucherIdx - 1 },
      };
    }

    return role;
  });
}

/**
 * Main reducer function
 */
export function deployerReducer(state, action) {
  switch (action.type) {
    // Navigation
    case ACTION_TYPES.SET_STEP:
      return { ...state, currentStep: action.payload };

    case ACTION_TYPES.NEXT_STEP:
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, STEPS.LAUNCH),
      };

    case ACTION_TYPES.PREV_STEP:
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, STEPS.TEMPLATE),
      };

    // UI Mode & Templates
    case ACTION_TYPES.SET_UI_MODE:
      return {
        ...state,
        ui: { ...state.ui, mode: action.payload },
      };

    case ACTION_TYPES.SELECT_TEMPLATE:
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedTemplate: action.payload,
          templateApplied: false,
        },
      };

    case ACTION_TYPES.APPLY_TEMPLATE: {
      // Payload contains the template defaults from getTemplateDefaults()
      const { roles, permissions, voting, features, governancePhilosophy } = action.payload;

      // Map governancePhilosophy to slider value
      const sliderValue = governancePhilosophy === 'democratic' ? 85
        : governancePhilosophy === 'delegated' ? 15
        : 50;

      return {
        ...state,
        roles,
        permissions,
        voting,
        features,
        philosophy: {
          ...state.philosophy,
          slider: sliderValue,
        },
        ui: {
          ...state.ui,
          templateApplied: true,
        },
      };
    }

    case ACTION_TYPES.CLEAR_TEMPLATE:
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedTemplate: null,
          templateApplied: false,
        },
      };

    case ACTION_TYPES.TOGGLE_GUIDANCE:
      return {
        ...state,
        ui: {
          ...state.ui,
          showGuidance: action.payload !== undefined ? action.payload : !state.ui.showGuidance,
        },
      };

    case ACTION_TYPES.EXPAND_SECTION: {
      const section = action.payload;
      const expanded = state.ui.expandedSections;
      const isExpanded = expanded.includes(section);

      return {
        ...state,
        ui: {
          ...state.ui,
          expandedSections: isExpanded
            ? expanded.filter(s => s !== section)
            : [...expanded, section],
        },
      };
    }

    // Philosophy (Simple Mode)
    case ACTION_TYPES.SET_PHILOSOPHY_SLIDER:
      return {
        ...state,
        philosophy: { ...state.philosophy, slider: action.payload },
      };

    case ACTION_TYPES.SET_POWER_BUNDLE: {
      const { bundleKey, roleIndices } = action.payload;
      return {
        ...state,
        philosophy: {
          ...state.philosophy,
          powerBundles: {
            ...state.philosophy.powerBundles,
            [bundleKey]: roleIndices,
          },
        },
      };
    }

    case ACTION_TYPES.TOGGLE_POWER_BUNDLE: {
      const { bundleKey, roleIndex } = action.payload;
      const currentRoles = state.philosophy.powerBundles[bundleKey] || [];
      const hasBundle = currentRoles.includes(roleIndex);

      return {
        ...state,
        philosophy: {
          ...state.philosophy,
          powerBundles: {
            ...state.philosophy.powerBundles,
            [bundleKey]: hasBundle
              ? currentRoles.filter(idx => idx !== roleIndex)
              : [...currentRoles, roleIndex],
          },
        },
      };
    }

    case ACTION_TYPES.APPLY_PHILOSOPHY: {
      // Apply philosophy slider and power bundles to actual permissions and voting
      // This is called when user advances from Governance step in Simple mode
      const { voting, permissions } = action.payload;
      return {
        ...state,
        voting: voting || state.voting,
        permissions: permissions || state.permissions,
      };
    }

    // Template Journey (Discovery Flow)
    case ACTION_TYPES.SET_DISCOVERY_ANSWER: {
      const { questionId, answer } = action.payload;
      return {
        ...state,
        templateJourney: {
          ...state.templateJourney,
          discoveryAnswers: {
            ...state.templateJourney.discoveryAnswers,
            [questionId]: answer,
          },
        },
      };
    }

    case ACTION_TYPES.SET_SELF_ASSESSMENT_ANSWER: {
      const { questionId, answer } = action.payload;
      return {
        ...state,
        templateJourney: {
          ...state.templateJourney,
          selfAssessmentAnswers: {
            ...state.templateJourney.selfAssessmentAnswers,
            [questionId]: answer,
          },
        },
      };
    }

    case ACTION_TYPES.SET_MATCHED_VARIATION:
      return {
        ...state,
        templateJourney: {
          ...state.templateJourney,
          matchedVariation: action.payload,
        },
      };

    case ACTION_TYPES.CONFIRM_VARIATION:
      return {
        ...state,
        templateJourney: {
          ...state.templateJourney,
          variationConfirmed: true,
        },
      };

    case ACTION_TYPES.SET_CURRENT_QUESTION_INDEX:
      return {
        ...state,
        templateJourney: {
          ...state.templateJourney,
          currentQuestionIndex: action.payload,
        },
      };

    case ACTION_TYPES.NEXT_DISCOVERY_QUESTION:
      return {
        ...state,
        templateJourney: {
          ...state.templateJourney,
          currentQuestionIndex: state.templateJourney.currentQuestionIndex + 1,
        },
      };

    case ACTION_TYPES.PREV_DISCOVERY_QUESTION:
      return {
        ...state,
        templateJourney: {
          ...state.templateJourney,
          currentQuestionIndex: Math.max(0, state.templateJourney.currentQuestionIndex - 1),
        },
      };

    case ACTION_TYPES.TOGGLE_PHILOSOPHY_VIEW:
      return {
        ...state,
        templateJourney: {
          ...state.templateJourney,
          showPhilosophy: action.payload !== undefined
            ? action.payload
            : !state.templateJourney.showPhilosophy,
        },
      };

    case ACTION_TYPES.TOGGLE_GROWTH_PATH_VIEW:
      return {
        ...state,
        templateJourney: {
          ...state.templateJourney,
          showGrowthPath: action.payload !== undefined
            ? action.payload
            : !state.templateJourney.showGrowthPath,
        },
      };

    case ACTION_TYPES.TOGGLE_PITFALLS_VIEW:
      return {
        ...state,
        templateJourney: {
          ...state.templateJourney,
          showPitfalls: action.payload !== undefined
            ? action.payload
            : !state.templateJourney.showPitfalls,
        },
      };

    case ACTION_TYPES.RESET_TEMPLATE_JOURNEY:
      return {
        ...state,
        templateJourney: {
          discoveryAnswers: {},
          selfAssessmentAnswers: {},
          matchedVariation: null,
          variationConfirmed: false,
          currentQuestionIndex: 0,
          showPhilosophy: false,
          showGrowthPath: false,
          showPitfalls: false,
        },
      };

    case ACTION_TYPES.APPLY_VARIATION: {
      // Apply a matched variation's settings to the state
      // Supports voting settings, features, and permissions overrides
      const { variation, template } = action.payload;
      if (!variation?.settings) {
        return state;
      }

      const {
        democracyWeight,
        participationWeight,
        quorum,
        features: featureOverrides,
        permissions: permissionOverrides,
      } = variation.settings;

      // Update philosophy slider based on democracy weight
      const sliderValue = democracyWeight !== undefined ? democracyWeight : state.philosophy.slider;

      // Apply feature overrides if present
      const newFeatures = featureOverrides
        ? { ...state.features, ...featureOverrides }
        : state.features;

      // Apply permission overrides if present
      const newPermissions = permissionOverrides
        ? { ...state.permissions, ...permissionOverrides }
        : state.permissions;

      return {
        ...state,
        philosophy: {
          ...state.philosophy,
          slider: sliderValue,
        },
        voting: {
          ...state.voting,
          democracyWeight: democracyWeight ?? state.voting.democracyWeight,
          participationWeight: participationWeight ?? state.voting.participationWeight,
          hybridQuorum: quorum ?? state.voting.hybridQuorum,
          ddQuorum: quorum ?? state.voting.ddQuorum,
        },
        features: newFeatures,
        permissions: newPermissions,
        templateJourney: {
          ...state.templateJourney,
          variationConfirmed: true,
        },
      };
    }

    // Organization
    case ACTION_TYPES.UPDATE_ORGANIZATION:
      return {
        ...state,
        organization: { ...state.organization, ...action.payload },
      };

    case ACTION_TYPES.SET_LOGO_URL:
      return {
        ...state,
        organization: { ...state.organization, logoURL: action.payload },
      };

    case ACTION_TYPES.SET_IPFS_HASH:
      return {
        ...state,
        organization: { ...state.organization, infoIPFSHash: action.payload },
      };

    case ACTION_TYPES.ADD_LINK:
      return {
        ...state,
        organization: {
          ...state.organization,
          links: [...state.organization.links, action.payload],
        },
      };

    case ACTION_TYPES.REMOVE_LINK:
      return {
        ...state,
        organization: {
          ...state.organization,
          links: state.organization.links.filter((_, idx) => idx !== action.payload),
        },
      };

    case ACTION_TYPES.UPDATE_LINK:
      return {
        ...state,
        organization: {
          ...state.organization,
          links: state.organization.links.map((link, idx) =>
            idx === action.payload.index ? action.payload.link : link
          ),
        },
      };

    // Roles
    case ACTION_TYPES.ADD_ROLE: {
      const newRole = createDefaultRole(state.roles.length, action.payload?.name || 'New Role');
      return {
        ...state,
        roles: [...state.roles, newRole],
      };
    }

    case ACTION_TYPES.UPDATE_ROLE: {
      const { index, updates } = action.payload;
      return {
        ...state,
        roles: state.roles.map((role, idx) =>
          idx === index ? { ...role, ...updates } : role
        ),
      };
    }

    case ACTION_TYPES.REMOVE_ROLE: {
      const removeIndex = action.payload;
      if (state.roles.length <= 1) {
        // Must have at least one role
        return state;
      }

      const newRoles = state.roles.filter((_, idx) => idx !== removeIndex);
      const adjustedRoles = adjustRolesAfterRoleRemoval(newRoles, removeIndex);
      const adjustedPermissions = adjustPermissionsAfterRoleRemoval(state.permissions, removeIndex);

      return {
        ...state,
        roles: adjustedRoles,
        permissions: adjustedPermissions,
      };
    }

    case ACTION_TYPES.REORDER_ROLES:
      return {
        ...state,
        roles: action.payload,
      };

    case ACTION_TYPES.UPDATE_ROLE_HIERARCHY: {
      const { roleIndex, adminRoleIndex } = action.payload;
      return {
        ...state,
        roles: state.roles.map((role, idx) =>
          idx === roleIndex
            ? { ...role, hierarchy: { ...role.hierarchy, adminRoleIndex } }
            : role
        ),
      };
    }

    case ACTION_TYPES.UPDATE_ROLE_VOUCHING: {
      const { roleIndex, vouching } = action.payload;
      return {
        ...state,
        roles: state.roles.map((role, idx) =>
          idx === roleIndex
            ? { ...role, vouching: { ...role.vouching, ...vouching } }
            : role
        ),
      };
    }

    case ACTION_TYPES.UPDATE_ROLE_DISTRIBUTION: {
      const { roleIndex, distribution } = action.payload;
      return {
        ...state,
        roles: state.roles.map((role, idx) =>
          idx === roleIndex
            ? { ...role, distribution: { ...role.distribution, ...distribution } }
            : role
        ),
      };
    }

    case ACTION_TYPES.UPDATE_ROLE_HAT_CONFIG: {
      const { roleIndex, hatConfig } = action.payload;
      return {
        ...state,
        roles: state.roles.map((role, idx) =>
          idx === roleIndex
            ? { ...role, hatConfig: { ...role.hatConfig, ...hatConfig } }
            : role
        ),
      };
    }

    // Permissions
    case ACTION_TYPES.TOGGLE_PERMISSION: {
      const { permissionKey, roleIndex } = action.payload;
      const currentRoles = state.permissions[permissionKey] || [];
      const hasPermission = currentRoles.includes(roleIndex);

      return {
        ...state,
        permissions: {
          ...state.permissions,
          [permissionKey]: hasPermission
            ? currentRoles.filter(idx => idx !== roleIndex)
            : [...currentRoles, roleIndex],
        },
      };
    }

    case ACTION_TYPES.SET_PERMISSION: {
      const { permissionKey, roleIndex, value } = action.payload;
      const currentRoles = state.permissions[permissionKey] || [];

      return {
        ...state,
        permissions: {
          ...state.permissions,
          [permissionKey]: value
            ? [...new Set([...currentRoles, roleIndex])]
            : currentRoles.filter(idx => idx !== roleIndex),
        },
      };
    }

    case ACTION_TYPES.SET_PERMISSION_ROLES: {
      const { permissionKey, roleIndices } = action.payload;

      return {
        ...state,
        permissions: {
          ...state.permissions,
          [permissionKey]: [...roleIndices],
        },
      };
    }

    case ACTION_TYPES.SET_ALL_PERMISSIONS_FOR_ROLE: {
      const roleIndex = action.payload;
      const newPermissions = { ...state.permissions };

      for (const key of PERMISSION_KEYS) {
        if (!newPermissions[key].includes(roleIndex)) {
          newPermissions[key] = [...newPermissions[key], roleIndex];
        }
      }

      return { ...state, permissions: newPermissions };
    }

    case ACTION_TYPES.CLEAR_ALL_PERMISSIONS_FOR_ROLE: {
      const roleIndex = action.payload;
      const newPermissions = { ...state.permissions };

      for (const key of PERMISSION_KEYS) {
        newPermissions[key] = newPermissions[key].filter(idx => idx !== roleIndex);
      }

      return { ...state, permissions: newPermissions };
    }

    // Voting
    case ACTION_TYPES.SET_VOTING_MODE: {
      const mode = action.payload;

      // When switching modes, adjust voting classes
      if (mode === 'DIRECT') {
        return {
          ...state,
          voting: {
            ...state.voting,
            mode,
            classes: [createDefaultVotingClass(100)],
          },
        };
      } else {
        // HYBRID mode - create two classes
        return {
          ...state,
          voting: {
            ...state.voting,
            mode,
            classes: [
              { ...createDefaultVotingClass(state.voting.democracyWeight), strategy: VOTING_STRATEGY.DIRECT },
              { ...createDefaultVotingClass(state.voting.participationWeight), strategy: VOTING_STRATEGY.ERC20_BAL },
            ],
          },
        };
      }
    }

    case ACTION_TYPES.SET_VOTING_QUORUM: {
      const { hybridQuorum, ddQuorum } = action.payload;
      return {
        ...state,
        voting: {
          ...state.voting,
          hybridQuorum: hybridQuorum ?? state.voting.hybridQuorum,
          ddQuorum: ddQuorum ?? state.voting.ddQuorum,
        },
      };
    }

    case ACTION_TYPES.UPDATE_VOTING:
      return {
        ...state,
        voting: { ...state.voting, ...action.payload },
      };

    case ACTION_TYPES.ADD_VOTING_CLASS: {
      if (state.voting.classes.length >= 8) {
        return state; // Max 8 classes
      }
      // Use provided classData or create a default voting class
      const newClass = action.payload || createDefaultVotingClass(0);
      return {
        ...state,
        voting: {
          ...state.voting,
          classes: [...state.voting.classes, newClass],
        },
      };
    }

    case ACTION_TYPES.UPDATE_VOTING_CLASS: {
      const { index, updates } = action.payload;

      // Auto-disable quadratic when switching to DIRECT strategy
      // (quadratic only applies to ERC20_BAL token-based voting)
      let finalUpdates = { ...updates };
      if (updates.strategy === VOTING_STRATEGY.DIRECT) {
        finalUpdates.quadratic = false;
      }

      return {
        ...state,
        voting: {
          ...state.voting,
          classes: state.voting.classes.map((cls, idx) =>
            idx === index ? { ...cls, ...finalUpdates } : cls
          ),
        },
      };
    }

    case ACTION_TYPES.REMOVE_VOTING_CLASS: {
      if (state.voting.classes.length <= 1) {
        return state; // Must have at least one class
      }
      return {
        ...state,
        voting: {
          ...state.voting,
          classes: state.voting.classes.filter((_, idx) => idx !== action.payload),
        },
      };
    }

    case ACTION_TYPES.TOGGLE_CLASS_LOCK: {
      const index = action.payload;
      return {
        ...state,
        voting: {
          ...state.voting,
          classes: state.voting.classes.map((cls, idx) =>
            idx === index ? { ...cls, locked: !cls.locked } : cls
          ),
        },
      };
    }

    case ACTION_TYPES.APPLY_WEIGHT_PRESET: {
      const preset = action.payload; // 'equal' or 'dominant'
      const count = state.voting.classes.length;

      let weights;
      if (preset === 'equal') {
        // Divide 100% evenly, distribute remainder to first classes
        const base = Math.floor(100 / count);
        const remainder = 100 - (base * count);
        weights = Array(count).fill(base).map((w, i) => i < remainder ? w + 1 : w);
      } else if (preset === 'dominant') {
        // First class gets 60%, rest split the 40% equally
        if (count === 1) {
          weights = [100];
        } else {
          const first = 60;
          const rest = Math.floor(40 / (count - 1));
          weights = [first, ...Array(count - 1).fill(rest)];
          // Adjust for rounding
          const sum = weights.reduce((a, b) => a + b, 0);
          if (sum < 100) weights[weights.length - 1] += (100 - sum);
        }
      } else {
        return state; // Unknown preset
      }

      return {
        ...state,
        voting: {
          ...state.voting,
          classes: state.voting.classes.map((cls, idx) => ({
            ...cls,
            slicePct: weights[idx],
            locked: false, // Unlock all classes when applying preset
          })),
        },
      };
    }

    // Features
    case ACTION_TYPES.TOGGLE_FEATURE: {
      const { feature, value } = action.payload;
      return {
        ...state,
        features: {
          ...state.features,
          [feature]: value !== undefined ? value : !state.features[feature],
        },
      };
    }

    // Validation
    case ACTION_TYPES.SET_ERRORS:
      return { ...state, errors: action.payload };

    case ACTION_TYPES.CLEAR_ERRORS:
      return { ...state, errors: {} };

    // Deployment
    case ACTION_TYPES.SET_DEPLOYMENT_STATUS:
      return {
        ...state,
        deployment: { ...state.deployment, ...action.payload },
      };

    // Reset
    case ACTION_TYPES.RESET_STATE:
      return { ...initialState };

    default:
      console.warn(`Unknown action type: ${action.type}`);
      return state;
  }
}

export default deployerReducer;
