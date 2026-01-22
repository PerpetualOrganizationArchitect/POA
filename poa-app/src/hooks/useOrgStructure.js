/**
 * useOrgStructure - Hook for fetching organization structure data
 * Used by the /org-structure page to display roles, permissions, and members
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { FETCH_ORG_STRUCTURE_DATA } from '../util/queries';
import { useIPFScontext } from '../context/ipfsContext';
import { usePOContext } from '../context/POContext';
import { formatTokenAmount } from '../util/formatToken';

/**
 * Permission type mapping for display
 */
const PERMISSION_LABELS = {
  Voter: 'Voting',
  Creator: 'Create Proposals',
  Member: 'Member Access',
  Approver: 'Approver',
};

const CONTRACT_TYPE_LABELS = {
  HybridVoting: 'Hybrid Voting',
  DirectDemocracyVoting: 'Direct Democracy',
  ParticipationToken: 'Token',
  QuickJoin: 'Quick Join',
  EducationHub: 'Education',
  Executor: 'Executor',
  ToggleModule: 'Toggle',
};

/**
 * Generate fallback role name based on index
 * @param {number} index - Role index
 * @returns {string} Fallback name
 */
function getFallbackRoleName(index) {
  return `Role ${index + 1}`;
}

/**
 * Normalize a hat ID to a string for consistent comparison.
 * Handles BigInt, numbers, hex strings, etc.
 */
function normalizeHatId(id) {
  if (id === null || id === undefined) return '';
  // Convert to string and trim any whitespace
  const str = String(id).trim();
  // If it's a hex string, normalize to lowercase
  if (str.startsWith('0x') || str.startsWith('0X')) {
    return str.toLowerCase();
  }
  return str;
}

/**
 * Transform raw role data into display format
 * @param {Array} roles - Raw roles from subgraph (already filtered by isUserRole: true)
 * @param {Array} roleHatIds - Role hat IDs in order
 * @param {Object} roleNamesFromIPFS - Role names from IPFS metadata
 * @param {Array} users - Users from subgraph to calculate member counts
 * @returns {Array} Transformed roles with names and member info
 */
function transformRolesData(roles, roleHatIds, roleNamesFromIPFS = {}, users = []) {
  if (!roles || !Array.isArray(roles)) return [];

  // Convert roleHatIds to normalized strings for comparison
  const normalizedRoleHatIds = (roleHatIds || []).map(id => normalizeHatId(id));

  // Note: Roles are already filtered by isUserRole: true in the GraphQL query
  // No need for frontend filtering

  // Debug: Log data to understand the structure
  console.log('[OrgStructure] transformRolesData called with:', {
    rolesCount: roles.length,
    roleHatIds,
    roleNamesFromIPFS,
    usersCount: users?.length || 0,
    // Log all roles with names to debug
    rolesWithNames: roles.map(r => ({
      hatId: r.hatId,
      roleName: r.name,
      roleCanVote: r.canVote,
      isUserRole: r.isUserRole,
      hatName: r.hat?.name,
    }))
  });

  return roles.map((role, index) => {
    const hatId = role.hatId;
    const hatIdNorm = normalizeHatId(hatId);

    // Find index in roleHatIds to determine the fallback name
    const foundIndex = normalizedRoleHatIds.findIndex(id => id === hatIdNorm);
    // Use found index if valid, otherwise use the array index
    const roleIndex = foundIndex >= 0 ? foundIndex : index;

    // Get name from Role entity (RolesCreated event), hat entity (IPFS), or use fallback
    // Priority: role.name (from smart contract) > role.hat.name (from IPFS) > IPFS metadata > fallback
    const name = role.name || role.hat?.name || roleNamesFromIPFS[hatIdNorm] || roleNamesFromIPFS[hatId] || getFallbackRoleName(roleIndex);

    // Method 1: Count from role.wearers (RoleWearer entities)
    const roleWearers = role.wearers || [];
    const activeRoleWearers = roleWearers.filter(w => w.isActive !== false);

    // Method 2: Count from users.currentHatIds
    const usersWithHat = (users || []).filter(user => {
      const userHatIds = (user.currentHatIds || []).map(id => normalizeHatId(id));
      return userHatIds.includes(hatIdNorm);
    });

    // Use the larger count (in case one source is incomplete)
    const memberCount = Math.max(activeRoleWearers.length, usersWithHat.length);

    // Debug: Log member count calculation for first role
    if (index === 0) {
      console.log('[OrgStructure] Member count for first role:', {
        hatId,
        hatIdNorm,
        roleWearersLength: roleWearers.length,
        activeRoleWearersLength: activeRoleWearers.length,
        usersWithHatLength: usersWithHat.length,
        finalMemberCount: memberCount,
        roleWearers: roleWearers.map(w => ({ wearer: w.wearer, isActive: w.isActive })),
        usersWithHat: usersWithHat.map(u => ({ username: u.username, currentHatIds: u.currentHatIds }))
      });
    }

    // Get hat details
    const hat = role.hat || {};
    const level = hat.level ?? 0;
    const parentHatId = hat.parentHatId;
    const vouchConfig = hat.vouchConfig;
    const defaultEligible = hat.defaultEligible ?? false;

    return {
      id: role.id,
      hatId,
      name,
      image: role.image || '',
      canVote: role.canVote ?? true, // Default to true for voting roles
      level,
      parentHatId,
      memberCount,
      defaultEligible,
      wearers: roleWearers.map(w => ({
        address: w.wearer,
        username: w.wearerUsername,
      })),
      vouchingEnabled: vouchConfig?.enabled || false,
      vouchingQuorum: vouchConfig?.quorum,
      vouchingMembershipHatId: vouchConfig?.membershipHatId,
      permissions: role.permissions || [],
    };
  }).sort((a, b) => a.level - b.level); // Sort by hierarchy level
}

/**
 * Transform hat permissions into a permissions matrix
 * @param {Array} hatPermissions - Hat permissions from subgraph
 * @param {Array} roles - Transformed roles
 * @returns {Object} Permissions matrix { roleId: { permissionKey: boolean } }
 */
function buildPermissionsMatrix(hatPermissions, roles) {
  if (!hatPermissions || !Array.isArray(hatPermissions)) return {};

  const matrix = {};

  // Create a map from normalized hatId to original hatId for lookups
  const normalizedToOriginal = {};
  roles.forEach(role => {
    const normalized = normalizeHatId(role.hatId);
    normalizedToOriginal[normalized] = role.hatId;
    matrix[role.hatId] = {};
  });

  // Fill in permissions (using normalized comparison)
  hatPermissions.forEach(perm => {
    const normalizedPermHatId = normalizeHatId(perm.hatId);
    const originalHatId = normalizedToOriginal[normalizedPermHatId];

    if (perm.allowed && originalHatId && matrix[originalHatId]) {
      const key = `${perm.contractType}_${perm.permissionRole}`;
      matrix[originalHatId][key] = true;
    }
  });

  return matrix;
}

/**
 * Get unique permission types for matrix columns
 * @param {Array} hatPermissions - Hat permissions from subgraph
 * @returns {Array} Array of { key, label, contractType, permissionRole }
 */
function getPermissionColumns(hatPermissions) {
  if (!hatPermissions || !Array.isArray(hatPermissions)) return [];

  const seen = new Set();
  const columns = [];

  hatPermissions.forEach(perm => {
    const key = `${perm.contractType}_${perm.permissionRole}`;
    if (!seen.has(key)) {
      seen.add(key);
      columns.push({
        key,
        contractType: perm.contractType,
        permissionRole: perm.permissionRole,
        label: `${CONTRACT_TYPE_LABELS[perm.contractType] || perm.contractType} - ${PERMISSION_LABELS[perm.permissionRole] || perm.permissionRole}`,
      });
    }
  });

  return columns;
}

/**
 * Transform users into members grouped by role
 * @param {Array} users - Users from subgraph
 * @param {Array} roles - Transformed roles
 * @returns {Object} Members grouped by role { hatId: [members] }
 */
function groupMembersByRole(users, roles) {
  if (!users || !Array.isArray(users)) return {};

  const groups = {};

  // Create a map from normalized hatId to original hatId for lookups
  const normalizedToOriginal = {};
  roles.forEach(role => {
    const normalized = normalizeHatId(role.hatId);
    normalizedToOriginal[normalized] = role.hatId;
    groups[role.hatId] = [];
  });

  // Group users by their hat IDs (using normalized comparison)
  users.forEach(user => {
    const hatIds = user.currentHatIds || [];
    hatIds.forEach(userHatId => {
      const normalizedUserHatId = normalizeHatId(userHatId);
      const originalHatId = normalizedToOriginal[normalizedUserHatId];

      if (originalHatId && groups[originalHatId]) {
        groups[originalHatId].push({
          id: user.id,
          address: user.address,
          username: user.username,
          participationTokenBalance: formatTokenAmount(user.participationTokenBalance || '0'),
          membershipStatus: user.membershipStatus,
          totalTasksCompleted: parseInt(user.totalTasksCompleted, 10) || 0,
          totalVotes: parseInt(user.totalVotes, 10) || 0,
          firstSeenAt: user.firstSeenAt,
          lastActiveAt: user.lastActiveAt,
        });
      }
    });
  });

  console.log('[OrgStructure] groupMembersByRole result:', {
    groupKeys: Object.keys(groups),
    memberCounts: Object.fromEntries(
      Object.entries(groups).map(([k, v]) => [k, v.length])
    )
  });

  return groups;
}

/**
 * Hook for fetching and managing org structure data
 * @returns {Object} Org structure data and utilities
 */
export function useOrgStructure() {
  const { orgId, roleHatIds, topHatId } = usePOContext();
  const { safeFetchFromIpfs, safeFetchImageFromIpfs } = useIPFScontext();

  // State for IPFS metadata
  const [orgMetadata, setOrgMetadata] = useState({
    description: '',
    links: [],
    template: '',
    logo: null,
  });
  const [roleNames, setRoleNames] = useState({});
  const [metadataLoading, setMetadataLoading] = useState(true);

  // Fetch org structure data from subgraph
  const { data, loading: queryLoading, error } = useQuery(FETCH_ORG_STRUCTURE_DATA, {
    variables: { orgId },
    skip: !orgId,
    fetchPolicy: 'cache-and-network',
  });

  const org = data?.organization;

  // Fetch IPFS metadata when org data is available
  useEffect(() => {
    async function fetchMetadata() {
      if (!org?.metadataHash) {
        setMetadataLoading(false);
        return;
      }

      setMetadataLoading(true);

      try {
        // First check if metadata is already in subgraph (indexed from IPFS)
        if (org.metadata) {
          setOrgMetadata({
            description: org.metadata.description || '',
            links: org.metadata.links || [],
            template: org.metadata.template || '',
            logo: null, // Will fetch separately
          });
        } else {
          // Fallback: fetch from IPFS directly
          const metadata = await safeFetchFromIpfs(org.metadataHash);
          if (metadata) {
            setOrgMetadata({
              description: metadata.description || '',
              links: metadata.links || [],
              template: metadata.template || '',
              logo: null,
            });

            // Extract role names if present
            if (metadata.roles && Array.isArray(metadata.roles)) {
              const names = {};
              metadata.roles.forEach((role, index) => {
                if (role.name && roleHatIds?.[index]) {
                  names[roleHatIds[index]] = role.name;
                }
              });
              setRoleNames(names);
            }
          }
        }

        // Fetch logo image
        if (org.metadataHash) {
          const logoMetadata = await safeFetchFromIpfs(org.metadataHash);
          if (logoMetadata?.logo) {
            const logoUrl = await safeFetchImageFromIpfs(logoMetadata.logo);
            if (logoUrl) {
              setOrgMetadata(prev => ({ ...prev, logo: logoUrl }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch org metadata from IPFS:', err);
      } finally {
        setMetadataLoading(false);
      }
    }

    fetchMetadata();
  }, [org?.metadataHash, org?.metadata, safeFetchFromIpfs, safeFetchImageFromIpfs, roleHatIds]);

  // Transform roles data
  const roles = useMemo(() => {
    return transformRolesData(org?.roles, roleHatIds, roleNames, org?.users);
  }, [org?.roles, roleHatIds, roleNames, org?.users]);

  // Build permissions matrix
  const permissionsMatrix = useMemo(() => {
    return buildPermissionsMatrix(org?.hatPermissions, roles);
  }, [org?.hatPermissions, roles]);

  // Get permission columns
  const permissionColumns = useMemo(() => {
    return getPermissionColumns(org?.hatPermissions);
  }, [org?.hatPermissions]);

  // Group members by role
  const membersByRole = useMemo(() => {
    return groupMembersByRole(org?.users, roles);
  }, [org?.users, roles]);

  // Governance config
  const governance = useMemo(() => {
    return {
      hybridVoting: org?.hybridVoting ? {
        id: org.hybridVoting.id,
        quorum: org.hybridVoting.quorum,
      } : null,
      directDemocracyVoting: org?.directDemocracyVoting ? {
        id: org.directDemocracyVoting.id,
        quorumPercentage: org.directDemocracyVoting.quorumPercentage,
      } : null,
    };
  }, [org?.hybridVoting, org?.directDemocracyVoting]);

  // Contract addresses for developer section
  const contracts = useMemo(() => {
    if (!org) return {};
    return {
      executor: org.executorContract?.id,
      hybridVoting: org.hybridVoting?.id,
      directDemocracyVoting: org.directDemocracyVoting?.id,
      taskManager: org.taskManager?.id,
      educationHub: org.educationHub?.id,
      quickJoin: org.quickJoin?.id,
      participationToken: org.participationToken?.id,
    };
  }, [org]);

  // Token info
  const tokenInfo = useMemo(() => {
    if (!org?.participationToken) return null;
    return {
      name: org.participationToken.name,
      symbol: org.participationToken.symbol,
      totalSupply: formatTokenAmount(org.participationToken.totalSupply || '0'),
    };
  }, [org?.participationToken]);

  // Loading state
  const loading = queryLoading || metadataLoading;

  // Total member count
  const totalMembers = org?.users?.length || 0;

  // Deployment date
  const deployedAt = org?.deployedAt ? new Date(parseInt(org.deployedAt, 10) * 1000) : null;

  // Eligibility module address for claiming roles
  const eligibilityModuleAddress = org?.eligibilityModule?.id || null;

  return {
    // Organization info
    orgId,
    orgName: org?.name || '',
    orgMetadata,
    deployedAt,
    totalMembers,
    topHatId,

    // Roles and hierarchy
    roles,
    roleHatIds,

    // Eligibility module for claiming
    eligibilityModuleAddress,

    // Permissions
    permissionsMatrix,
    permissionColumns,

    // Members
    membersByRole,

    // Governance
    governance,

    // Contracts (for developer section)
    contracts,

    // Token info
    tokenInfo,

    // State
    loading,
    error,
  };
}

export default useOrgStructure;
