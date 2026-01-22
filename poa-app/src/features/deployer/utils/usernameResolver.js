/**
 * Username Resolution Utility
 * Resolves usernames to addresses via subgraph queries
 */

import apolloClient from '@/util/apolloClient';
import { GET_ACCOUNTS_BY_USERNAMES } from '@/util/queries';

/**
 * Resolve multiple usernames to addresses via subgraph
 * @param {string[]} usernames - Array of usernames to resolve
 * @returns {Promise<{resolved: Map<string, string>, notFound: string[]}>}
 */
export async function resolveUsernames(usernames) {
  if (!usernames || usernames.length === 0) {
    return { resolved: new Map(), notFound: [] };
  }

  // Normalize usernames (lowercase, trim, filter empty)
  const normalized = usernames
    .map(u => u.toLowerCase().trim())
    .filter(u => u.length > 0);

  if (normalized.length === 0) {
    return { resolved: new Map(), notFound: [] };
  }

  try {
    const { data } = await apolloClient.query({
      query: GET_ACCOUNTS_BY_USERNAMES,
      variables: { usernames: normalized },
      fetchPolicy: 'network-only', // Always fetch fresh data
    });

    const resolved = new Map();
    if (data?.accounts) {
      data.accounts.forEach(acc => {
        // Store lowercase username -> address mapping
        // Note: 'user' field contains the address, 'username' is lowercase
        resolved.set(acc.username.toLowerCase(), acc.user);
      });
    }

    // Find usernames that weren't resolved
    const notFound = normalized.filter(u => !resolved.has(u));

    return { resolved, notFound };
  } catch (error) {
    console.error('Error resolving usernames:', error);
    throw new Error(`Failed to resolve usernames: ${error.message}`);
  }
}

/**
 * Validate that all usernames in roles exist in the registry
 * @param {Array} roles - Array of role objects with distribution.additionalWearerUsernames
 * @returns {Promise<{isValid: boolean, errors: Object}>}
 */
export async function validateAllUsernames(roles) {
  // Collect all unique usernames from all roles
  const allUsernames = [];

  roles.forEach((role, roleIndex) => {
    const usernames = role.distribution?.additionalWearerUsernames || [];
    usernames.forEach(username => {
      if (username && username.trim()) {
        allUsernames.push({
          username: username.trim(),
          roleIndex,
          roleName: role.name,
        });
      }
    });
  });

  if (allUsernames.length === 0) {
    return { isValid: true, errors: {} };
  }

  // Get unique usernames
  const uniqueUsernames = [...new Set(allUsernames.map(u => u.username.toLowerCase()))];

  try {
    const { notFound } = await resolveUsernames(uniqueUsernames);

    if (notFound.length > 0) {
      // Find which roles have the not-found usernames
      const errorDetails = notFound.map(username => {
        const roleInfo = allUsernames.find(u => u.username.toLowerCase() === username);
        return roleInfo ? `"${username}" (in ${roleInfo.roleName})` : `"${username}"`;
      });

      return {
        isValid: false,
        errors: {
          usernames: `Users not found: ${errorDetails.join(', ')}`,
        },
      };
    }

    return { isValid: true, errors: {} };
  } catch (error) {
    return {
      isValid: false,
      errors: {
        usernames: `Failed to validate usernames: ${error.message}`,
      },
    };
  }
}

/**
 * Resolve all usernames in roles to addresses
 * Call this before deployment to populate additionalWearers
 * @param {Array} roles - Array of role objects
 * @returns {Promise<Array>} - Roles with additionalWearers populated
 */
export async function resolveRoleUsernames(roles) {
  // Collect all unique usernames
  const allUsernames = roles.flatMap(role =>
    (role.distribution?.additionalWearerUsernames || [])
      .filter(u => u && u.trim())
      .map(u => u.toLowerCase().trim())
  );

  if (allUsernames.length === 0) {
    return roles;
  }

  const { resolved } = await resolveUsernames([...new Set(allUsernames)]);

  // Map roles with resolved addresses
  return roles.map(role => {
    const usernames = role.distribution?.additionalWearerUsernames || [];
    if (usernames.length === 0) {
      return role;
    }

    const addresses = usernames
      .map(u => resolved.get(u.toLowerCase().trim()))
      .filter(Boolean); // Filter out any unresolved (should not happen after validation)

    return {
      ...role,
      distribution: {
        ...role.distribution,
        additionalWearers: addresses,
      },
    };
  });
}

export default {
  resolveUsernames,
  validateAllUsernames,
  resolveRoleUsernames,
};
