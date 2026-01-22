/**
 * useRoleNames - Hook for mapping role hat IDs to human-readable names
 *
 * Fetches role names from IPFS metadata and provides a mapping function
 * with fallback to "Role X" format if names aren't available.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePOContext } from '../context/POContext';
import { useIPFScontext } from '../context/ipfsContext';

/**
 * Normalize a hat ID to a string for consistent comparison
 */
function normalizeHatId(id) {
  if (id === null || id === undefined) return '';
  const str = String(id).trim();
  if (str.startsWith('0x') || str.startsWith('0X')) {
    return str.toLowerCase();
  }
  return str;
}

/**
 * Generate fallback role name based on index
 */
function getFallbackRoleName(index) {
  return `Role ${index + 1}`;
}

/**
 * Hook to get role names mapped from hat IDs
 * @returns {Object} { roleNames, getRoleName, isLoading }
 */
export function useRoleNames() {
  const { roleHatIds, logoHash, orgId } = usePOContext();
  const { safeFetchFromIpfs } = useIPFScontext();

  const [roleNames, setRoleNames] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch role names from IPFS metadata
  useEffect(() => {
    async function fetchRoleNames() {
      if (!logoHash || !roleHatIds?.length) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const metadata = await safeFetchFromIpfs(logoHash);

        if (metadata?.roles && Array.isArray(metadata.roles)) {
          const names = {};
          metadata.roles.forEach((role, index) => {
            if (role.name && roleHatIds[index]) {
              const normalizedId = normalizeHatId(roleHatIds[index]);
              names[normalizedId] = role.name;
              // Also store with original ID for flexible lookup
              names[String(roleHatIds[index])] = role.name;
            }
          });
          setRoleNames(names);
        }
      } catch (err) {
        console.error('Failed to fetch role names from IPFS:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoleNames();
  }, [logoHash, roleHatIds, safeFetchFromIpfs]);

  /**
   * Get the display name for a role by its hat ID
   * @param {string|number} hatId - The hat ID to look up
   * @returns {string} The role name or fallback
   */
  const getRoleName = useCallback((hatId) => {
    if (!hatId) return 'Unknown Role';

    const normalizedId = normalizeHatId(hatId);

    // First try the normalized lookup
    if (roleNames[normalizedId]) {
      return roleNames[normalizedId];
    }

    // Try original string
    if (roleNames[String(hatId)]) {
      return roleNames[String(hatId)];
    }

    // Fallback to index-based name
    const normalizedRoleHatIds = (roleHatIds || []).map(id => normalizeHatId(id));
    const index = normalizedRoleHatIds.indexOf(normalizedId);

    if (index >= 0) {
      return getFallbackRoleName(index);
    }

    return 'Unknown Role';
  }, [roleNames, roleHatIds]);

  /**
   * Get display names for multiple hat IDs
   * @param {Array} hatIds - Array of hat IDs
   * @returns {Array} Array of role names
   */
  const getRoleNames = useCallback((hatIds) => {
    if (!hatIds || !Array.isArray(hatIds)) return [];
    return hatIds.map(id => getRoleName(id));
  }, [getRoleName]);

  /**
   * Get a comma-separated string of role names for display
   * @param {Array} hatIds - Array of hat IDs
   * @returns {string} Comma-separated role names
   */
  const getRoleNamesString = useCallback((hatIds) => {
    const names = getRoleNames(hatIds);
    if (names.length === 0) return 'All Members';
    return names.join(', ');
  }, [getRoleNames]);

  // Create a stable reference for all roles with their names
  const allRoles = useMemo(() => {
    if (!roleHatIds?.length) return [];

    return roleHatIds.map((hatId, index) => ({
      hatId: String(hatId),
      name: getRoleName(hatId),
      index,
    }));
  }, [roleHatIds, getRoleName]);

  return {
    roleNames,
    getRoleName,
    getRoleNames,
    getRoleNamesString,
    allRoles,
    isLoading,
  };
}

export default useRoleNames;
