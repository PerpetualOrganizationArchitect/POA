/**
 * Setter Function Definitions for Governance Votes
 *
 * This file defines all available setter functions that can be called
 * through governance votes. Includes user-friendly templates and raw
 * function definitions for advanced mode.
 */

import { utils } from 'ethers';

// ============================================================================
// CATEGORIES - For UI grouping
// ============================================================================

export const SETTER_CATEGORIES = {
  voting: {
    name: 'Voting Rules',
    icon: 'FiCheckSquare',
    color: 'purple',
    description: 'Quorum, voting power, who can create proposals'
  },
  permissions: {
    name: 'Role Permissions',
    icon: 'FiUsers',
    color: 'blue',
    description: 'Who can create proposals and manage tasks'
  },
  emergency: {
    name: 'Emergency Controls',
    icon: 'FiAlertTriangle',
    color: 'red',
    description: 'Pause or resume organization features'
  },
  tasks: {
    name: 'Task Management',
    icon: 'FiClipboard',
    color: 'green',
    description: 'Project permissions and bounty settings'
  }
};

// ============================================================================
// CONTRACT ADDRESS MAPPING
// ============================================================================

export const CONTRACT_MAP = {
  hybridVoting: {
    contextKey: 'votingContractAddress',
    displayName: 'Hybrid Voting',
    description: 'Main voting contract for proposals'
  },
  directDemocracyVoting: {
    contextKey: 'directDemocracyVotingContractAddress',
    displayName: 'Direct Democracy',
    description: 'One person, one vote system'
  },
  taskManager: {
    contextKey: 'taskManagerContractAddress',
    displayName: 'Task Manager',
    description: 'Project and task management'
  }
};

// ============================================================================
// USER-FRIENDLY TEMPLATES
// ============================================================================

export const SETTER_TEMPLATES = [
  // ===== VOTING RULES =====
  {
    id: 'change-quorum-hybrid',
    category: 'voting',
    name: 'Change Hybrid Voting Quorum',
    description: 'Set the minimum participation percentage required for hybrid votes to be valid',
    contract: 'hybridVoting',
    functionName: 'setConfig',
    inputs: [
      {
        name: 'quorum',
        label: 'Quorum Percentage',
        type: 'number',
        min: 1,
        max: 100,
        placeholder: 'e.g. 51',
        helpText: 'Percentage of voting power that must participate (1-100)'
      }
    ],
    encode: (values) => {
      const configKey = 0; // ConfigKey.QUORUM
      const encodedValue = utils.hexZeroPad(utils.hexlify(Number(values.quorum)), 32);
      return [configKey, encodedValue];
    },
    preview: (values) => `Change hybrid voting quorum to ${values.quorum}%`
  },
  {
    id: 'change-quorum-dd',
    category: 'voting',
    name: 'Change Direct Democracy Quorum',
    description: 'Set the minimum participation percentage required for direct democracy votes to be valid',
    contract: 'directDemocracyVoting',
    functionName: 'setConfig',
    inputs: [
      {
        name: 'quorum',
        label: 'Quorum Percentage',
        type: 'number',
        min: 1,
        max: 100,
        placeholder: 'e.g. 51',
        helpText: 'Percentage of members that must vote (1-100)'
      }
    ],
    encode: (values) => {
      const configKey = 0; // ConfigKey.QUORUM
      const encodedValue = utils.hexZeroPad(utils.hexlify(Number(values.quorum)), 32);
      return [configKey, encodedValue];
    },
    preview: (values) => `Change direct democracy quorum to ${values.quorum}%`
  },

  // ===== PERMISSIONS =====
  {
    id: 'allow-proposal-creator-hybrid',
    category: 'permissions',
    name: 'Allow Role to Create Hybrid Proposals',
    description: 'Grant or revoke a role\'s permission to create new hybrid voting proposals',
    contract: 'hybridVoting',
    functionName: 'setCreatorHatAllowed',
    inputs: [
      {
        name: 'role',
        label: 'Role',
        type: 'roleSelect',
        helpText: 'Select which role to modify'
      },
      {
        name: 'allowed',
        label: 'Permission',
        type: 'toggle',
        options: ['Grant', 'Revoke'],
        default: 'Grant',
        helpText: 'Grant or revoke proposal creation permission'
      }
    ],
    encode: (values) => {
      return [values.role, values.allowed === 'Grant'];
    },
    preview: (values, roleNames) => {
      const roleName = roleNames?.[values.role] || `Role ${values.role}`;
      const action = values.allowed === 'Grant' ? 'Allow' : 'Revoke';
      return `${action} "${roleName}" to create hybrid voting proposals`;
    }
  },
  {
    id: 'allow-voter-dd',
    category: 'permissions',
    name: 'Allow Role to Vote (Direct Democracy)',
    description: 'Grant or revoke a role\'s permission to vote in direct democracy',
    contract: 'directDemocracyVoting',
    functionName: 'setConfig',
    inputs: [
      {
        name: 'role',
        label: 'Role',
        type: 'roleSelect',
        helpText: 'Select which role to modify'
      },
      {
        name: 'hatType',
        label: 'Hat Type',
        type: 'select',
        options: [
          { value: '0', label: 'Voting Hat (can vote)' },
          { value: '1', label: 'Creator Hat (can create proposals)' }
        ],
        helpText: 'Type of permission to grant'
      },
      {
        name: 'allowed',
        label: 'Permission',
        type: 'toggle',
        options: ['Grant', 'Revoke'],
        default: 'Grant'
      }
    ],
    encode: (values) => {
      const configKey = 3; // ConfigKey.HAT_ALLOWED
      // Encode as (HatType enum, hatId, allowed)
      const encodedValue = utils.defaultAbiCoder.encode(
        ['uint8', 'uint256', 'bool'],
        [Number(values.hatType), values.role, values.allowed === 'Grant']
      );
      return [configKey, encodedValue];
    },
    preview: (values, roleNames) => {
      const roleName = roleNames?.[values.role] || `Role ${values.role}`;
      const action = values.allowed === 'Grant' ? 'Allow' : 'Revoke';
      const hatType = values.hatType === '0' ? 'vote' : 'create proposals';
      return `${action} "${roleName}" to ${hatType} in direct democracy`;
    }
  },

  // ===== EMERGENCY CONTROLS =====
  {
    id: 'pause-hybrid-voting',
    category: 'emergency',
    name: 'Pause Hybrid Voting',
    description: 'Temporarily disable all hybrid voting activity (emergency use only)',
    contract: 'hybridVoting',
    functionName: 'pause',
    inputs: [],
    dangerLevel: 'critical',
    warning: 'This will prevent ALL hybrid voting proposals and votes until unpaused',
    encode: () => [],
    preview: () => 'Pause hybrid voting - no proposals or votes will be allowed'
  },
  {
    id: 'unpause-hybrid-voting',
    category: 'emergency',
    name: 'Resume Hybrid Voting',
    description: 'Re-enable hybrid voting after an emergency pause',
    contract: 'hybridVoting',
    functionName: 'unpause',
    inputs: [],
    encode: () => [],
    preview: () => 'Resume hybrid voting - proposals and votes will be allowed again'
  },
  {
    id: 'pause-dd-voting',
    category: 'emergency',
    name: 'Pause Direct Democracy Voting',
    description: 'Temporarily disable all direct democracy voting activity',
    contract: 'directDemocracyVoting',
    functionName: 'pause',
    inputs: [],
    dangerLevel: 'critical',
    warning: 'This will prevent ALL direct democracy proposals and votes until unpaused',
    encode: () => [],
    preview: () => 'Pause direct democracy voting'
  },
  {
    id: 'unpause-dd-voting',
    category: 'emergency',
    name: 'Resume Direct Democracy Voting',
    description: 'Re-enable direct democracy voting after an emergency pause',
    contract: 'directDemocracyVoting',
    functionName: 'unpause',
    inputs: [],
    encode: () => [],
    preview: () => 'Resume direct democracy voting'
  },

  // ===== TASK MANAGEMENT =====
  {
    id: 'set-project-permissions',
    category: 'tasks',
    name: 'Set Project Role Permissions',
    description: 'Configure what a role can do within a specific project',
    contract: 'taskManager',
    functionName: 'setProjectRolePerm',
    inputs: [
      {
        name: 'project',
        label: 'Project',
        type: 'projectSelect',
        helpText: 'Select the project to modify'
      },
      {
        name: 'role',
        label: 'Role',
        type: 'roleSelect',
        helpText: 'Select which role to modify'
      },
      {
        name: 'permissions',
        label: 'Permissions',
        type: 'permissionMask',
        options: [
          { value: 1, label: 'CREATE - Create new tasks' },
          { value: 2, label: 'CLAIM - Claim tasks' },
          { value: 4, label: 'REVIEW - Review completed tasks' },
          { value: 8, label: 'ASSIGN - Assign tasks to others' }
        ],
        helpText: 'Select which permissions to grant'
      }
    ],
    encode: (values) => {
      // Calculate bitmask from selected permissions
      const mask = Array.isArray(values.permissions)
        ? values.permissions.reduce((acc, val) => acc | Number(val), 0)
        : Number(values.permissions) || 0;
      return [values.project, values.role, mask];
    },
    preview: (values, roleNames, projectNames) => {
      const roleName = roleNames?.[values.role] || `Role ${values.role}`;
      const projectName = projectNames?.[values.project] || 'selected project';
      const permLabels = [];
      if (values.permissions?.includes(1) || values.permissions?.includes('1')) permLabels.push('CREATE');
      if (values.permissions?.includes(2) || values.permissions?.includes('2')) permLabels.push('CLAIM');
      if (values.permissions?.includes(4) || values.permissions?.includes('4')) permLabels.push('REVIEW');
      if (values.permissions?.includes(8) || values.permissions?.includes('8')) permLabels.push('ASSIGN');
      return `Set "${roleName}" permissions for ${projectName}: ${permLabels.join(', ') || 'none'}`;
    }
  },
  {
    id: 'allow-task-creator',
    category: 'tasks',
    name: 'Allow Role to Create Tasks',
    description: 'Grant or revoke a role\'s permission to create tasks globally',
    contract: 'taskManager',
    functionName: 'setConfig',
    inputs: [
      {
        name: 'role',
        label: 'Role',
        type: 'roleSelect',
        helpText: 'Select which role to modify'
      },
      {
        name: 'allowed',
        label: 'Permission',
        type: 'toggle',
        options: ['Grant', 'Revoke'],
        default: 'Grant'
      }
    ],
    encode: (values) => {
      const configKey = 1; // ConfigKey.CREATOR_HAT_ALLOWED
      const encodedValue = utils.defaultAbiCoder.encode(
        ['uint256', 'bool'],
        [values.role, values.allowed === 'Grant']
      );
      return [configKey, encodedValue];
    },
    preview: (values, roleNames) => {
      const roleName = roleNames?.[values.role] || `Role ${values.role}`;
      const action = values.allowed === 'Grant' ? 'Allow' : 'Revoke';
      return `${action} "${roleName}" to create tasks globally`;
    }
  }
];

// ============================================================================
// RAW FUNCTION DEFINITIONS (for Advanced Mode)
// ============================================================================

export const RAW_FUNCTIONS = {
  hybridVoting: [
    {
      name: 'setCreatorHatAllowed',
      signature: 'function setCreatorHatAllowed(uint256 h, bool ok)',
      params: [
        { name: 'h', type: 'uint256', label: 'Hat ID' },
        { name: 'ok', type: 'bool', label: 'Allowed' }
      ],
      description: 'Allow/revoke a role from creating proposals'
    },
    {
      name: 'setConfig',
      signature: 'function setConfig(uint8 key, bytes calldata value)',
      params: [
        { name: 'key', type: 'uint8', label: 'Config Key (0=QUORUM, 1=TARGET_ALLOWED, 2=EXECUTOR)' },
        { name: 'value', type: 'bytes', label: 'Encoded Value' }
      ],
      description: 'Set a configuration value'
    },
    {
      name: 'pause',
      signature: 'function pause()',
      params: [],
      description: 'Pause the voting contract'
    },
    {
      name: 'unpause',
      signature: 'function unpause()',
      params: [],
      description: 'Unpause the voting contract'
    }
  ],
  directDemocracyVoting: [
    {
      name: 'setConfig',
      signature: 'function setConfig(uint8 key, bytes calldata value)',
      params: [
        { name: 'key', type: 'uint8', label: 'Config Key (0=QUORUM, 1=EXECUTOR, 2=TARGET_ALLOWED, 3=HAT_ALLOWED)' },
        { name: 'value', type: 'bytes', label: 'Encoded Value' }
      ],
      description: 'Set a configuration value'
    },
    {
      name: 'pause',
      signature: 'function pause()',
      params: [],
      description: 'Pause the voting contract'
    },
    {
      name: 'unpause',
      signature: 'function unpause()',
      params: [],
      description: 'Unpause the voting contract'
    }
  ],
  taskManager: [
    {
      name: 'setConfig',
      signature: 'function setConfig(uint8 key, bytes calldata value)',
      params: [
        { name: 'key', type: 'uint8', label: 'Config Key' },
        { name: 'value', type: 'bytes', label: 'Encoded Value' }
      ],
      description: 'Set a configuration value'
    },
    {
      name: 'setProjectRolePerm',
      signature: 'function setProjectRolePerm(bytes32 pid, uint256 hatId, uint8 mask)',
      params: [
        { name: 'pid', type: 'bytes32', label: 'Project ID' },
        { name: 'hatId', type: 'uint256', label: 'Hat ID' },
        { name: 'mask', type: 'uint8', label: 'Permission Mask (1=CREATE, 2=CLAIM, 4=REVIEW, 8=ASSIGN)' }
      ],
      description: 'Set role permissions for a project'
    }
  ]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get templates filtered by category
 */
export function getTemplatesByCategory(category) {
  return SETTER_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get a template by ID
 */
export function getTemplateById(id) {
  return SETTER_TEMPLATES.find(t => t.id === id);
}

/**
 * Get raw functions for a contract
 */
export function getRawFunctions(contractKey) {
  return RAW_FUNCTIONS[contractKey] || [];
}

/**
 * Check if a contract is available (has an address in POContext)
 */
export function isContractAvailable(contractKey, contractAddresses) {
  const contextKey = CONTRACT_MAP[contractKey]?.contextKey;
  return contextKey && contractAddresses?.[contextKey];
}
