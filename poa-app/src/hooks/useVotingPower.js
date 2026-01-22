/**
 * useVotingPower - Hook for calculating and displaying user's voting power
 * VERSION: 2.0 (simplified - uses VotingContext data)
 *
 * Provides a breakdown of how the user's vote is calculated in hybrid voting:
 * - Membership power (from direct democracy class)
 * - Contribution power (from participation token balance)
 * - Combined total and percentage of org voting power
 */

import { useMemo } from 'react';
import { usePOContext } from '../context/POContext';
import { useUserContext } from '../context/UserContext';
import { useVotingContext } from '../context/VotingContext';

// Voting strategy constants (matching subgraph enum)
const VOTING_STRATEGY = {
  DIRECT: 'DIRECT',
  ERC20_BAL: 'ERC20_BAL',
};

/**
 * Calculate square root for quadratic voting (matching contract logic)
 */
function sqrt(value) {
  if (value < 0n) return 0n;
  if (value === 0n) return 0n;

  let z = value;
  let x = value / 2n + 1n;

  while (x < z) {
    z = x;
    x = (value / x + x) / 2n;
  }

  return z;
}

/**
 * Parse a token balance string to BigInt (handles decimals)
 */
function parseTokenBalance(balanceString) {
  if (!balanceString) return 0n;

  // If it's already a number or BigInt-like
  if (typeof balanceString === 'number') {
    return BigInt(Math.floor(balanceString));
  }

  // Handle string with decimals (e.g., "123.45")
  const str = String(balanceString);
  const parts = str.split('.');

  if (parts.length === 1) {
    // No decimals
    return BigInt(parts[0] || '0');
  }

  // Has decimals - treat as whole units (the balance is already formatted)
  // For voting power calculation, use the raw integer value
  return BigInt(parts[0] || '0');
}

/**
 * Hook to calculate user's voting power breakdown
 */
export function useVotingPower() {
  const { poMembers, leaderboardData } = usePOContext();
  const { userData, hasMemberRole } = useUserContext();
  const { votingType, votingClasses: subgraphClasses, loading: votingLoading } = useVotingContext();

  // Default class configuration for fallback (matches subgraph enum format)
  const defaultClasses = [
    {
      strategy: 'DIRECT',
      slicePct: 50,
      quadratic: false,
      minBalance: '0',
      asset: null,
      hatIds: [],
    },
    {
      strategy: 'ERC20_BAL',
      slicePct: 50,
      quadratic: true,
      minBalance: '0',
      asset: null,
      hatIds: [],
    },
  ];

  // Use subgraph classes if available, otherwise use defaults
  const classConfig = useMemo(() => {
    if (votingType !== 'Hybrid') {
      console.log('[useVotingPower] Not hybrid voting, skipping class config');
      return null;
    }

    // If we have classes from subgraph, use them (strategy is a string enum: 'DIRECT' or 'ERC20_BAL')
    if (subgraphClasses && subgraphClasses.length > 0) {
      console.log('[useVotingPower] Using classes from subgraph:', JSON.stringify(subgraphClasses, null, 2));
      // Normalize slicePct to number, strategy stays as string
      return subgraphClasses.map(cls => ({
        ...cls,
        slicePct: Number(cls.slicePct),
      }));
    }

    // Fall back to defaults if subgraph doesn't have classes yet
    console.log('[useVotingPower] Using default class config (subgraph has no classes)');
    return defaultClasses;
  }, [votingType, subgraphClasses]);

  // Derive loading state
  const isLoading = votingLoading;

  // Calculate voting power
  const votingPower = useMemo(() => {
    console.log('[useVotingPower] Calculating power:', {
      hasMemberRole,
      votingType,
      classConfigLength: classConfig?.length,
      userPTBalance: userData?.participationTokenBalance,
    });

    // Default response for non-members or when data isn't loaded
    const defaultPower = {
      membershipPower: 0,
      contributionPower: 0,
      totalPower: 0,
      percentOfTotal: 0,
      classWeights: { democracy: 50, contribution: 50 },
      isHybrid: votingType === 'Hybrid',
      hasVotingPower: false,
      status: 'unknown',
    };

    // Not a member
    if (!hasMemberRole) {
      console.log('[useVotingPower] User is not a member');
      return { ...defaultPower, message: 'Join to participate in voting', status: 'not_member' };
    }

    // Direct Democracy mode
    if (votingType !== 'Hybrid') {
      const memberCount = poMembers || 1;
      console.log('[useVotingPower] Direct Democracy mode');
      return {
        membershipPower: 100,
        contributionPower: 0,
        totalPower: 100,
        percentOfTotal: memberCount > 0 ? (100 / memberCount) : 0,
        classWeights: { democracy: 100, contribution: 0 },
        isHybrid: false,
        hasVotingPower: true,
        message: 'Equal voice with all members',
        status: 'ready',
      };
    }

    // Hybrid mode - wait for class config to be set
    if (!classConfig || classConfig.length === 0) {
      console.log('[useVotingPower] Waiting for class config');
      return { ...defaultPower, message: 'Loading...', status: 'loading' };
    }

    // Calculate power from class config - read weights directly from subgraph
    let membershipPower = 0;
    let contributionPower = 0;
    let democracyWeight = 0;
    let contributionWeight = 0;

    console.log('[useVotingPower] Processing classes:', classConfig.length, 'classes');
    classConfig.forEach((cls, index) => {
      console.log(`[useVotingPower] Class ${index}:`, {
        strategy: cls.strategy,
        strategyType: typeof cls.strategy,
        slicePct: cls.slicePct,
        isDirectMatch: cls.strategy === VOTING_STRATEGY.DIRECT,
        isERC20Match: cls.strategy === VOTING_STRATEGY.ERC20_BAL,
      });

      if (cls.strategy === VOTING_STRATEGY.DIRECT) {
        // Direct democracy class - fixed 100 points
        membershipPower = 100;
        democracyWeight = Number(cls.slicePct);
        console.log('[useVotingPower] Found DIRECT class, membershipPower=100, weight=', cls.slicePct);
      } else if (cls.strategy === VOTING_STRATEGY.ERC20_BAL) {
        // Token-weighted class - read weight directly from subgraph
        contributionWeight = Number(cls.slicePct);
        console.log('[useVotingPower] Found ERC20_BAL class, weight=', cls.slicePct);

        // Get user's token balance
        const rawBalance = userData?.participationTokenBalance || '0';
        const balance = parseTokenBalance(rawBalance);

        // Check minimum balance
        const minBalance = BigInt(cls.minBalance || '0');
        if (balance < minBalance) {
          contributionPower = 0;
        } else {
          // Apply quadratic if enabled
          if (cls.quadratic) {
            contributionPower = Number(sqrt(balance) * 100n);
          } else {
            contributionPower = Number(balance * 100n);
          }
        }
      }
    });

    const totalPower = membershipPower + contributionPower;

    // Calculate comparative statistics for the org
    let orgStats = {
      averagePower: 0,
      maxPower: 0,
      totalOrgPower: 0,
      userRank: 0,
      percentOfTotal: 0,
      aboveAverage: false,
    };

    if (leaderboardData?.length > 0) {
      const userPowers = leaderboardData.map(user => {
        const userBalance = parseTokenBalance(user.participationTokenBalance || '0');
        let userContrib = 0;

        const contribClass = classConfig.find(c => c.strategy === VOTING_STRATEGY.ERC20_BAL);
        if (contribClass) {
          if (contribClass.quadratic) {
            userContrib = Number(sqrt(userBalance) * 100n);
          } else {
            userContrib = Number(userBalance * 100n);
          }
        }

        return 100 + userContrib;
      });

      orgStats.totalOrgPower = userPowers.reduce((a, b) => a + b, 0);
      orgStats.averagePower = orgStats.totalOrgPower / userPowers.length;
      orgStats.maxPower = Math.max(...userPowers);
      orgStats.percentOfTotal = orgStats.totalOrgPower > 0
        ? (totalPower / orgStats.totalOrgPower) * 100
        : 0;
      orgStats.aboveAverage = totalPower > orgStats.averagePower;

      const sortedPowers = [...userPowers].sort((a, b) => b - a);
      orgStats.userRank = sortedPowers.findIndex(p => p <= totalPower) + 1;
    }

    const result = {
      membershipPower,
      contributionPower,
      totalPower,
      percentOfTotal: Math.min(orgStats.percentOfTotal, 100),
      classWeights: {
        democracy: democracyWeight,
        contribution: contributionWeight,
      },
      orgStats,
      isHybrid: true,
      hasVotingPower: totalPower > 0,
      message: totalPower > 0
        ? `Your voice: ${democracyWeight}% membership + ${contributionWeight}% contribution`
        : 'You need membership or contributions to vote',
      status: 'ready',
    };

    console.log('[useVotingPower] Final result:', result);
    return result;
  }, [classConfig, userData, hasMemberRole, votingType, poMembers, leaderboardData]);

  return {
    ...votingPower,
    classConfig,
    isLoading,
  };
}

export default useVotingPower;
