/**
 * Philosophy Mapper
 *
 * Maps the "How democratic?" slider value (0-100) to concrete voting configuration.
 * This is the bridge between Simple mode (slider) and Advanced mode (voting classes).
 */

import { v4 as uuidv4 } from 'uuid';
import { VOTING_STRATEGY } from '../context/deployerReducer';

// Philosophy presets based on slider ranges
export const PHILOSOPHY_RANGES = {
  DELEGATED: { min: 0, max: 30 },
  HYBRID: { min: 31, max: 70 },
  DEMOCRATIC: { min: 71, max: 100 },
};

/**
 * Get the philosophy type from a slider value
 */
export function getPhilosophyType(sliderValue) {
  if (sliderValue <= PHILOSOPHY_RANGES.DELEGATED.max) {
    return 'delegated';
  }
  if (sliderValue <= PHILOSOPHY_RANGES.HYBRID.max) {
    return 'hybrid';
  }
  return 'democratic';
}

/**
 * Get philosophy display info
 */
export function getPhilosophyInfo(sliderValue) {
  const type = getPhilosophyType(sliderValue);

  switch (type) {
    case 'delegated':
      return {
        type: 'delegated',
        name: 'Contribution-Weighted',
        shortDescription: 'Active contributors have more say',
        description: 'Members who contribute more have more say. Ideal for recognizing active participation and rewarding engagement.',
        icon: '⚡',
        color: 'coral',
      };
    case 'hybrid':
      return {
        type: 'hybrid',
        name: 'Balanced Approach',
        shortDescription: 'Mix of participation and equal voice',
        description: 'A mix of equal voting and rewarding participation. Works well for most organizations that value both fairness and engagement.',
        icon: '⚖️',
        color: 'blue',
      };
    case 'democratic':
      return {
        type: 'democratic',
        name: 'Equal Voice',
        shortDescription: 'Every voice counts equally',
        description: 'Every member has equal voting power regardless of participation level. Perfect for communities that prioritize equal representation.',
        icon: '🤝',
        color: 'green',
      };
    default:
      return {
        type: 'hybrid',
        name: 'Balanced Approach',
        shortDescription: 'Mix of participation and equal voice',
        description: 'A balanced approach that values both active participation and equal representation.',
        icon: '⚖️',
        color: 'blue',
      };
  }
}

/**
 * Map slider value to voting configuration
 * Returns a voting object compatible with the deployer state
 *
 * Slider value directly maps to democracy/equal voice weight:
 * - Slider 0 = 0% democracy, 100% participation (contribution-weighted)
 * - Slider 100 = 100% democracy, 0% participation (pure equal voice)
 *
 * For slider 100, we use DIRECT mode (single voting class).
 * For slider 0, we use a single ERC20_BAL class.
 * For slider 1-99, we use HYBRID mode with two voting classes.
 */
export function sliderToVotingConfig(sliderValue) {
  const clampedValue = Math.max(0, Math.min(100, sliderValue));

  // Democracy weight equals slider value directly
  const democracyWeight = clampedValue;
  const participationWeight = 100 - clampedValue;

  // Pure democracy (slider = 100) uses DIRECT mode
  if (clampedValue === 100) {
    return {
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
    };
  }

  // Pure contribution (slider = 0) - single ERC20_BAL class
  if (clampedValue === 0) {
    return {
      mode: 'HYBRID',
      hybridQuorum: 30,
      ddQuorum: 30,
      quadraticEnabled: false,
      democracyWeight: 0,
      participationWeight: 100,
      classes: [
        {
          id: uuidv4(),
          strategy: VOTING_STRATEGY.ERC20_BAL,
          slicePct: 100,
          quadratic: false,
          minBalance: 0,
          asset: null,
          hatIds: [],
        },
      ],
    };
  }

  // Hybrid mode (slider 1-99): two voting classes
  // Quorum varies by zone for reasonable defaults
  const quorum = clampedValue <= 30 ? 30 : clampedValue >= 71 ? 60 : 50;

  return {
    mode: 'HYBRID',
    hybridQuorum: quorum,
    ddQuorum: quorum,
    quadraticEnabled: false,
    democracyWeight,
    participationWeight,
    classes: [
      {
        id: uuidv4(),
        strategy: VOTING_STRATEGY.DIRECT,
        slicePct: democracyWeight,
        quadratic: false,
        minBalance: 0,
        asset: null,
        hatIds: [],
      },
      {
        id: uuidv4(),
        strategy: VOTING_STRATEGY.ERC20_BAL,
        slicePct: participationWeight,
        quadratic: false,
        minBalance: 0,
        asset: null,
        hatIds: [],
      },
    ],
  };
}

/**
 * Map voting configuration to slider value
 * Reverse mapping for displaying current state
 *
 * Since slider value = democracyWeight directly, we just return that value.
 */
export function votingConfigToSlider(voting) {
  if (!voting) return 50;

  // Pure direct democracy mode
  if (voting.mode === 'DIRECT') {
    return 100;
  }

  // Use democracy weight directly as slider value
  if (voting.democracyWeight !== undefined) {
    return Math.round(voting.democracyWeight);
  }

  // Fallback
  return 50;
}

/**
 * Get permission adjustments based on philosophy
 * Returns which roles should have DD voting/creation permissions
 */
export function getPhilosophyPermissionHints(sliderValue, roles) {
  const type = getPhilosophyType(sliderValue);
  const roleCount = roles.length;

  // Find the "leader" role (first top-level role)
  const leaderRoleIndex = roles.findIndex(r => r.hierarchy.adminRoleIndex === null);

  switch (type) {
    case 'delegated':
      // Only leaders create polls, all can vote
      return {
        ddCreatorRoles: leaderRoleIndex >= 0 ? [leaderRoleIndex] : [roleCount - 1],
        ddVotingRoles: roles.map((_, i) => i),
      };

    case 'hybrid':
    case 'democratic':
    default:
      // Everyone can create and vote
      return {
        ddCreatorRoles: roles.map((_, i) => i),
        ddVotingRoles: roles.map((_, i) => i),
      };
  }
}

/**
 * Get a human-readable summary of the voting setup
 */
export function describeVotingSetup(voting) {
  if (!voting) return 'No voting configured';

  if (voting.mode === 'DIRECT') {
    return "Every member's vote counts equally. Perfect for communities that value equal representation.";
  }

  const ddWeight = voting.democracyWeight || 50;
  const partWeight = voting.participationWeight || 50;

  if (ddWeight >= 70) {
    return `Voting power is primarily based on equal membership, with some weight given to participation.`;
  }

  if (partWeight >= 70) {
    return `Voting power reflects contribution levels. Active members have more say in decisions.`;
  }

  return `Voting combines equal membership with contribution weight. A balanced approach to decision-making.`;
}

export default {
  PHILOSOPHY_RANGES,
  getPhilosophyType,
  getPhilosophyInfo,
  sliderToVotingConfig,
  votingConfigToSlider,
  getPhilosophyPermissionHints,
  describeVotingSetup,
};
