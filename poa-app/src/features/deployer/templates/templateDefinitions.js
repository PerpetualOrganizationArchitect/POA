/**
 * Template Definitions - Pre-configured organization templates
 *
 * Each template provides sensible defaults for roles, permissions, and voting
 * to help users quickly create organizations that match common patterns.
 */

import { v4 as uuidv4 } from 'uuid';
import { VOTING_STRATEGY } from '../context/deployerReducer';

// Template IDs
export const TEMPLATE_IDS = {
  WORKER_COOP: 'worker-coop',
  OPEN_SOURCE: 'open-source',
  CREATIVE_COLLECTIVE: 'creative-collective',
  COMMUNITY_DAO: 'community-dao',
  STUDENT_ORG: 'student-org',
  CUSTOM: 'custom',
};

// Power bundle definitions - map human-friendly bundles to permission keys
export const POWER_BUNDLES = {
  admin: {
    name: 'Admin Powers',
    description: 'Full control over organization operations',
    permissions: [
      'tokenApproverRoles',
      'taskCreatorRoles',
      'educationCreatorRoles',
      'ddCreatorRoles',
    ],
  },
  member: {
    name: 'Member Powers',
    description: 'Participate and contribute to the organization',
    permissions: [
      'quickJoinRoles',
      'tokenMemberRoles',
      'educationMemberRoles',
      'ddVotingRoles',
    ],
  },
  creator: {
    name: 'Creator Powers',
    description: 'Propose ideas and create content',
    permissions: [
      'hybridProposalCreatorRoles',
    ],
  },
};

/**
 * Worker Cooperative Template
 * Pure democracy - every worker has an equal voice
 */
const WORKER_COOP_TEMPLATE = {
  id: TEMPLATE_IDS.WORKER_COOP,
  name: 'Worker Cooperative',
  tagline: 'Shared ownership, democratic workplace',
  description: 'For worker-owned businesses where every member has an equal voice. Decisions are made democratically, and all workers share in the success of the organization.',
  bestFor: [
    'Worker-owned businesses',
    'Democratic workplaces',
    'Cooperatives and collectives',
    'Shared ownership ventures',
  ],

  defaults: {
    roles: [
      {
        id: uuidv4(),
        name: 'Worker',
        image: '',
        canVote: true,
        vouching: {
          enabled: true,
          quorum: 2,
          voucherRoleIndex: 0, // Workers vouch for workers
          combineWithHierarchy: false,
        },
        defaults: { eligible: true, standing: true },
        hierarchy: { adminRoleIndex: 1 }, // Managed by Steward
        distribution: {
          mintToDeployer: false,
          mintToExecutor: false,
          additionalWearers: [],
          additionalWearerUsernames: [],
        },
        hatConfig: { maxSupply: 1000, mutableHat: true },
      },
      {
        id: uuidv4(),
        name: 'Steward',
        image: '',
        canVote: true,
        vouching: {
          enabled: false,
          quorum: 0,
          voucherRoleIndex: 0,
          combineWithHierarchy: false,
        },
        defaults: { eligible: true, standing: true },
        hierarchy: { adminRoleIndex: null }, // Top-level
        distribution: {
          mintToDeployer: true,
          mintToExecutor: false,
          additionalWearers: [],
          additionalWearerUsernames: [],
        },
        hatConfig: { maxSupply: 5, mutableHat: true },
      },
    ],

    permissions: {
      quickJoinRoles: [0],           // Workers can quick join
      tokenMemberRoles: [0, 1],      // Both hold tokens
      tokenApproverRoles: [1],       // Stewards approve
      taskCreatorRoles: [0, 1],      // Both create tasks
      educationCreatorRoles: [1],    // Stewards create education
      educationMemberRoles: [0, 1],  // Both access education
      hybridProposalCreatorRoles: [0, 1], // Both propose
      ddVotingRoles: [0, 1],         // Both vote
      ddCreatorRoles: [0, 1],        // Both create polls
    },

    voting: {
      mode: 'DIRECT',
      hybridQuorum: 50,
      ddQuorum: 50,
      quadraticEnabled: false,
      democracyWeight: 100,
      participationWeight: 0,
      classes: [
        {
          id: uuidv4(),
          strategy: VOTING_STRATEGY.DIRECT,
          slicePct: 100,
          quadratic: false,
          minBalance: 0,
          asset: null,
          hatIds: [],
        },
      ],
    },

    features: {
      educationHubEnabled: false,
      electionHubEnabled: true,
    },

    governancePhilosophy: 'democratic',
  },

  ui: {
    primaryColor: 'green',
    icon: '🏭',
    guidanceText: {
      identity: 'Give your cooperative a name that reflects your shared values and mission.',
      team: 'Workers are the heart of your cooperative. Stewards help coordinate but have no special voting power.',
      governance: 'Pure democracy means every worker has an equal voice in all decisions.',
      review: 'Your cooperative is ready! Every worker will have equal ownership and voting power.',
    },
  },
};

/**
 * Open Source Project Template
 * Contributors earn voice through code contributions
 */
const OPEN_SOURCE_TEMPLATE = {
  id: TEMPLATE_IDS.OPEN_SOURCE,
  name: 'Open Source Project',
  tagline: 'Contributors earn voice through code',
  description: 'For open source projects where contributors earn governance power through their work. Active contributors have more say in project direction.',
  bestFor: [
    'Open source software projects',
    'Developer communities',
    'Technical documentation projects',
    'Protocol development',
  ],

  defaults: {
    roles: [
      {
        id: uuidv4(),
        name: 'Contributor',
        image: '',
        canVote: true,
        vouching: {
          enabled: true,
          quorum: 1,
          voucherRoleIndex: 1, // Maintainers vouch
          combineWithHierarchy: false,
        },
        defaults: { eligible: true, standing: true },
        hierarchy: { adminRoleIndex: 1 }, // Managed by Maintainer
        distribution: {
          mintToDeployer: false,
          mintToExecutor: false,
          additionalWearers: [],
          additionalWearerUsernames: [],
        },
        hatConfig: { maxSupply: 10000, mutableHat: true },
      },
      {
        id: uuidv4(),
        name: 'Maintainer',
        image: '',
        canVote: true,
        vouching: {
          enabled: false,
          quorum: 0,
          voucherRoleIndex: 0,
          combineWithHierarchy: false,
        },
        defaults: { eligible: true, standing: true },
        hierarchy: { adminRoleIndex: null }, // Top-level
        distribution: {
          mintToDeployer: true,
          mintToExecutor: false,
          additionalWearers: [],
          additionalWearerUsernames: [],
        },
        hatConfig: { maxSupply: 20, mutableHat: true },
      },
    ],

    permissions: {
      quickJoinRoles: [0],           // Contributors quick join
      tokenMemberRoles: [0, 1],      // Both hold tokens
      tokenApproverRoles: [1],       // Maintainers approve
      taskCreatorRoles: [1],         // Maintainers create tasks
      educationCreatorRoles: [1],    // Maintainers create docs
      educationMemberRoles: [0, 1],  // Both access docs
      hybridProposalCreatorRoles: [0, 1], // Both propose
      ddVotingRoles: [0, 1],         // Both vote
      ddCreatorRoles: [1],           // Maintainers create polls
    },

    voting: {
      mode: 'HYBRID',
      hybridQuorum: 40,
      ddQuorum: 40,
      quadraticEnabled: false,
      democracyWeight: 30,
      participationWeight: 70,
      classes: [
        {
          id: uuidv4(),
          strategy: VOTING_STRATEGY.DIRECT,
          slicePct: 30,
          quadratic: false,
          minBalance: 0,
          asset: null,
          hatIds: [],
        },
        {
          id: uuidv4(),
          strategy: VOTING_STRATEGY.ERC20_BAL,
          slicePct: 70,
          quadratic: false,
          minBalance: 0,
          asset: null,
          hatIds: [],
        },
      ],
    },

    features: {
      educationHubEnabled: false,
      electionHubEnabled: true,
    },

    governancePhilosophy: 'hybrid',
  },

  ui: {
    primaryColor: 'purple',
    icon: '💻',
    guidanceText: {
      identity: 'Name your project and describe what you\'re building together.',
      team: 'Maintainers guide the project. Contributors earn voting power through completed work.',
      governance: 'Your 70/30 split means contribution matters more than headcount, rewarding active contributors.',
      review: 'Your project is ready! Active contributors will have the most influence.',
    },
  },
};

/**
 * Creative Collective Template
 * Artists collaborating as equals with flat hierarchy
 */
const CREATIVE_COLLECTIVE_TEMPLATE = {
  id: TEMPLATE_IDS.CREATIVE_COLLECTIVE,
  name: 'Creative Collective',
  tagline: 'Artists collaborating as equals',
  description: 'For artists, designers, and creators working together. Flat hierarchy with democratic decision-making and shared ownership of creative work.',
  bestFor: [
    'Artist collectives',
    'Design studios',
    'Music collaborations',
    'Creative agencies',
  ],

  defaults: {
    roles: [
      {
        id: uuidv4(),
        name: 'Artist',
        image: '',
        canVote: true,
        vouching: {
          enabled: true,
          quorum: 2,
          voucherRoleIndex: 0, // Artists vouch for artists
          combineWithHierarchy: false,
        },
        defaults: { eligible: true, standing: true },
        hierarchy: { adminRoleIndex: 1 }, // Managed by Curator
        distribution: {
          mintToDeployer: true,
          mintToExecutor: false,
          additionalWearers: [],
          additionalWearerUsernames: [],
        },
        hatConfig: { maxSupply: 100, mutableHat: true },
      },
      {
        id: uuidv4(),
        name: 'Curator',
        image: '',
        canVote: true,
        vouching: {
          enabled: false,
          quorum: 0,
          voucherRoleIndex: 0,
          combineWithHierarchy: false,
        },
        defaults: { eligible: true, standing: true },
        hierarchy: { adminRoleIndex: null }, // Top-level
        distribution: {
          mintToDeployer: true,
          mintToExecutor: false,
          additionalWearers: [],
          additionalWearerUsernames: [],
        },
        hatConfig: { maxSupply: 10, mutableHat: true },
      },
    ],

    permissions: {
      quickJoinRoles: [],            // No quick join - must be vouched
      tokenMemberRoles: [0, 1],      // Both hold tokens
      tokenApproverRoles: [0, 1],    // Both approve (flat)
      taskCreatorRoles: [0, 1],      // Both create tasks
      educationCreatorRoles: [0, 1], // Both share knowledge
      educationMemberRoles: [0, 1],  // Both learn
      hybridProposalCreatorRoles: [0, 1], // Both propose
      ddVotingRoles: [0, 1],         // Both vote
      ddCreatorRoles: [0, 1],        // Both create polls
    },

    voting: {
      mode: 'DIRECT',
      hybridQuorum: 60,
      ddQuorum: 60,
      quadraticEnabled: false,
      democracyWeight: 100,
      participationWeight: 0,
      classes: [
        {
          id: uuidv4(),
          strategy: VOTING_STRATEGY.DIRECT,
          slicePct: 100,
          quadratic: false,
          minBalance: 0,
          asset: null,
          hatIds: [],
        },
      ],
    },

    features: {
      educationHubEnabled: false,
      electionHubEnabled: false,
    },

    governancePhilosophy: 'democratic',
  },

  ui: {
    primaryColor: 'pink',
    icon: '🎨',
    guidanceText: {
      identity: 'Name your collective and describe your creative vision.',
      team: 'Artists are the creative force. Curators help coordinate without special privileges.',
      governance: 'Pure democracy means every artist has equal say in creative direction.',
      review: 'Your collective is ready! Every artist will have equal voice in decisions.',
    },
  },
};

/**
 * Community DAO Template
 * Neighbors governing together with balanced voting
 */
const COMMUNITY_DAO_TEMPLATE = {
  id: TEMPLATE_IDS.COMMUNITY_DAO,
  name: 'Community DAO',
  tagline: 'Neighbors governing together',
  description: 'For neighborhoods, local communities, and interest groups. Balanced governance with elected representatives and direct community input.',
  bestFor: [
    'Neighborhood associations',
    'Local community groups',
    'Interest-based communities',
    'Social clubs',
  ],

  defaults: {
    roles: [
      {
        id: uuidv4(),
        name: 'Neighbor',
        image: '',
        canVote: true,
        vouching: {
          enabled: true,
          quorum: 1,
          voucherRoleIndex: 1, // Delegates vouch
          combineWithHierarchy: false,
        },
        defaults: { eligible: true, standing: true },
        hierarchy: { adminRoleIndex: 1 }, // Managed by Delegate
        distribution: {
          mintToDeployer: false,
          mintToExecutor: false,
          additionalWearers: [],
          additionalWearerUsernames: [],
        },
        hatConfig: { maxSupply: 5000, mutableHat: true },
      },
      {
        id: uuidv4(),
        name: 'Delegate',
        image: '',
        canVote: true,
        vouching: {
          enabled: false,
          quorum: 0,
          voucherRoleIndex: 0,
          combineWithHierarchy: false,
        },
        defaults: { eligible: true, standing: true },
        hierarchy: { adminRoleIndex: null }, // Top-level
        distribution: {
          mintToDeployer: true,
          mintToExecutor: false,
          additionalWearers: [],
          additionalWearerUsernames: [],
        },
        hatConfig: { maxSupply: 15, mutableHat: true },
      },
    ],

    permissions: {
      quickJoinRoles: [0],           // Neighbors quick join
      tokenMemberRoles: [0, 1],      // Both hold tokens
      tokenApproverRoles: [1],       // Delegates approve
      taskCreatorRoles: [0, 1],      // Both create tasks
      educationCreatorRoles: [1],    // Delegates create
      educationMemberRoles: [0, 1],  // Both access
      hybridProposalCreatorRoles: [0, 1], // Both propose
      ddVotingRoles: [0, 1],         // Both vote
      ddCreatorRoles: [1],           // Delegates create polls
    },

    voting: {
      mode: 'HYBRID',
      hybridQuorum: 50,
      ddQuorum: 50,
      quadraticEnabled: false,
      democracyWeight: 50,
      participationWeight: 50,
      classes: [
        {
          id: uuidv4(),
          strategy: VOTING_STRATEGY.DIRECT,
          slicePct: 50,
          quadratic: false,
          minBalance: 0,
          asset: null,
          hatIds: [],
        },
        {
          id: uuidv4(),
          strategy: VOTING_STRATEGY.ERC20_BAL,
          slicePct: 50,
          quadratic: false,
          minBalance: 0,
          asset: null,
          hatIds: [],
        },
      ],
    },

    features: {
      educationHubEnabled: false,
      electionHubEnabled: true,
    },

    governancePhilosophy: 'hybrid',
  },

  ui: {
    primaryColor: 'teal',
    icon: '🏘️',
    guidanceText: {
      identity: 'Name your community and describe what brings you together.',
      team: 'Neighbors are community members. Delegates are elected to help coordinate.',
      governance: 'Your 50/50 split balances participation with direct democracy.',
      review: 'Your community DAO is ready! Neighbors and delegates will govern together.',
    },
  },
};

/**
 * Student Organization Template
 * Democratic clubs with education hub and executive leadership
 */
const STUDENT_ORG_TEMPLATE = {
  id: TEMPLATE_IDS.STUDENT_ORG,
  name: 'Student Organization',
  tagline: 'Democratic clubs run by students, for students',
  description: 'For student clubs, academic societies, and campus groups. Executives handle day-to-day operations while members vote on important decisions. Features education modules and democratic elections.',
  bestFor: [
    'Campus clubs and student groups',
    'Academic and professional societies',
    'Student government organizations',
    'Volunteer and service groups',
  ],

  defaults: {
    roles: [
      {
        id: uuidv4(),
        name: 'Member',
        image: '',
        canVote: true,
        vouching: {
          enabled: true,
          quorum: 1,
          voucherRoleIndex: 1, // Executives vouch for members
          combineWithHierarchy: false,
        },
        defaults: { eligible: true, standing: true },
        hierarchy: { adminRoleIndex: 1 }, // Managed by Executive
        distribution: {
          mintToDeployer: false,
          mintToExecutor: false,
          additionalWearers: [],
          additionalWearerUsernames: [],
        },
        hatConfig: { maxSupply: 1000, mutableHat: true },
      },
      {
        id: uuidv4(),
        name: 'Executive',
        image: '',
        canVote: true,
        vouching: {
          enabled: false,
          quorum: 0,
          voucherRoleIndex: 0,
          combineWithHierarchy: false,
        },
        defaults: { eligible: true, standing: true },
        hierarchy: { adminRoleIndex: null }, // Top-level
        distribution: {
          mintToDeployer: true, // Deployer becomes first executive
          mintToExecutor: false,
          additionalWearers: [],
          additionalWearerUsernames: [],
        },
        hatConfig: { maxSupply: 10, mutableHat: true },
      },
    ],

    permissions: {
      quickJoinRoles: [0],           // Members can quick join (after exec approval via vouching)
      tokenMemberRoles: [0, 1],      // Both hold participation tokens
      tokenApproverRoles: [1],       // Only executives approve token transfers
      taskCreatorRoles: [1],         // Only executives create tasks
      educationCreatorRoles: [1],    // Only executives create educational content
      educationMemberRoles: [0, 1],  // Both can access educational content
      hybridProposalCreatorRoles: [0, 1], // Both can create hybrid proposals (big decisions)
      ddVotingRoles: [0, 1],         // Both can vote in direct democracy
      ddCreatorRoles: [1],           // Only executives can create DD polls
    },

    voting: {
      mode: 'HYBRID',
      hybridQuorum: 50,
      ddQuorum: 50,
      quadraticEnabled: false,
      democracyWeight: 50,
      participationWeight: 50,
      classes: [
        {
          id: uuidv4(),
          strategy: VOTING_STRATEGY.DIRECT,
          slicePct: 50,
          quadratic: false,
          minBalance: 0,
          asset: null,
          hatIds: [],
        },
        {
          id: uuidv4(),
          strategy: VOTING_STRATEGY.ERC20_BAL,
          slicePct: 50,
          quadratic: false,
          minBalance: 0,
          asset: null,
          hatIds: [],
        },
      ],
    },

    features: {
      educationHubEnabled: true,   // Education hub for training
      electionHubEnabled: true,    // For democratic executive elections
    },

    governancePhilosophy: 'hybrid',
  },

  ui: {
    primaryColor: 'blue',
    icon: '🎓',
    guidanceText: {
      identity: 'Give your organization a name that reflects your mission. This will be visible to all members.',
      team: 'Executives run day-to-day operations. Members participate in governance. Executives can invite new members.',
      governance: 'Your 50/50 hybrid voting means both participation (how much you contribute) and democracy (one person, one vote) matter equally.',
      review: 'Your organization is ready! It supports democratic elections, educational resources, and task management.',
    },
  },
};

/**
 * Custom Template
 * Start from scratch with minimal defaults
 */
const CUSTOM_TEMPLATE = {
  id: TEMPLATE_IDS.CUSTOM,
  name: 'Custom',
  tagline: 'Design from scratch',
  description: 'Build your organization exactly how you want it. Start with minimal defaults and configure everything yourself.',
  bestFor: [
    'Unique organizational structures',
    'Experimental governance models',
    'Advanced users who want full control',
  ],

  defaults: {
    roles: [
      {
        id: uuidv4(),
        name: 'Member',
        image: '',
        canVote: true,
        vouching: {
          enabled: false,
          quorum: 0,
          voucherRoleIndex: 0,
          combineWithHierarchy: false,
        },
        defaults: { eligible: true, standing: true },
        hierarchy: { adminRoleIndex: 1 }, // Managed by Admin
        distribution: {
          mintToDeployer: false,
          mintToExecutor: false,
          additionalWearers: [],
          additionalWearerUsernames: [],
        },
        hatConfig: { maxSupply: 1000, mutableHat: true },
      },
      {
        id: uuidv4(),
        name: 'Admin',
        image: '',
        canVote: true,
        vouching: {
          enabled: false,
          quorum: 0,
          voucherRoleIndex: 0,
          combineWithHierarchy: false,
        },
        defaults: { eligible: true, standing: true },
        hierarchy: { adminRoleIndex: null }, // Top-level
        distribution: {
          mintToDeployer: true,
          mintToExecutor: false,
          additionalWearers: [],
          additionalWearerUsernames: [],
        },
        hatConfig: { maxSupply: 10, mutableHat: true },
      },
    ],

    permissions: {
      quickJoinRoles: [0],           // Members quick join
      tokenMemberRoles: [0, 1],      // Both hold tokens
      tokenApproverRoles: [1],       // Admin approves
      taskCreatorRoles: [0, 1],      // Both create tasks
      educationCreatorRoles: [1],    // Admin creates
      educationMemberRoles: [0, 1],  // Both access
      hybridProposalCreatorRoles: [0, 1], // Both propose
      ddVotingRoles: [0, 1],         // Both vote
      ddCreatorRoles: [0, 1],        // Both create polls
    },

    voting: {
      mode: 'DIRECT',
      hybridQuorum: 50,
      ddQuorum: 50,
      quadraticEnabled: false,
      democracyWeight: 100,
      participationWeight: 0,
      classes: [
        {
          id: uuidv4(),
          strategy: VOTING_STRATEGY.DIRECT,
          slicePct: 100,
          quadratic: false,
          minBalance: 0,
          asset: null,
          hatIds: [],
        },
      ],
    },

    features: {
      educationHubEnabled: false,
      electionHubEnabled: false,
    },

    governancePhilosophy: 'democratic',
  },

  ui: {
    primaryColor: 'gray',
    icon: '⚙️',
    guidanceText: {
      identity: 'Describe what you\'re building and why it matters.',
      team: 'Define the roles that make sense for your organization.',
      governance: 'Configure how decisions are made in your organization.',
      review: 'Review your configuration before deploying.',
    },
  },
};

// All templates
export const TEMPLATES = {
  [TEMPLATE_IDS.WORKER_COOP]: WORKER_COOP_TEMPLATE,
  [TEMPLATE_IDS.OPEN_SOURCE]: OPEN_SOURCE_TEMPLATE,
  [TEMPLATE_IDS.CREATIVE_COLLECTIVE]: CREATIVE_COLLECTIVE_TEMPLATE,
  [TEMPLATE_IDS.COMMUNITY_DAO]: COMMUNITY_DAO_TEMPLATE,
  [TEMPLATE_IDS.STUDENT_ORG]: STUDENT_ORG_TEMPLATE,
  [TEMPLATE_IDS.CUSTOM]: CUSTOM_TEMPLATE,
};

// Template list for display order
export const TEMPLATE_LIST = [
  STUDENT_ORG_TEMPLATE,       // Featured first - most complete
  WORKER_COOP_TEMPLATE,
  OPEN_SOURCE_TEMPLATE,
  CREATIVE_COLLECTIVE_TEMPLATE,
  COMMUNITY_DAO_TEMPLATE,
  CUSTOM_TEMPLATE,            // Last - for advanced users
];

/**
 * Get a template by ID
 */
export function getTemplateById(id) {
  return TEMPLATES[id] || null;
}

/**
 * Get template defaults suitable for applying to deployer state
 * Returns fresh objects with new UUIDs to avoid reference issues
 */
export function getTemplateDefaults(id) {
  const template = getTemplateById(id);
  if (!template) return null;

  // Deep clone and generate fresh UUIDs for roles and voting classes
  const defaults = JSON.parse(JSON.stringify(template.defaults));

  // Generate fresh UUIDs
  defaults.roles = defaults.roles.map(role => ({
    ...role,
    id: uuidv4(),
  }));

  defaults.voting.classes = defaults.voting.classes.map(cls => ({
    ...cls,
    id: uuidv4(),
  }));

  return defaults;
}

export default TEMPLATES;
