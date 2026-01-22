/**
 * Power Bundles Utility
 *
 * Translates between human-friendly power bundles and the 9-permission system.
 * This is the bridge between Simple mode (bundles) and Advanced mode (individual permissions).
 */

import { PERMISSION_KEYS } from '../context/deployerReducer';

// Power bundle definitions
export const POWER_BUNDLES = {
  admin: {
    id: 'admin',
    name: 'Admin Powers',
    icon: 'shield',
    description: 'Approve tokens, create tasks, manage education, create polls',
    color: 'purple',
    permissions: [
      'tokenApproverRoles',
      'taskCreatorRoles',
      'educationCreatorRoles',
      'ddCreatorRoles',
    ],
  },
  member: {
    id: 'member',
    name: 'Member Powers',
    icon: 'users',
    description: 'Join quickly, hold tokens, access education, vote in polls',
    color: 'blue',
    permissions: [
      'quickJoinRoles',
      'tokenMemberRoles',
      'educationMemberRoles',
      'ddVotingRoles',
    ],
  },
  creator: {
    id: 'creator',
    name: 'Creator Powers',
    icon: 'pen',
    description: 'Create and propose new ideas',
    color: 'green',
    permissions: [
      'hybridProposalCreatorRoles',
    ],
  },
};

// List of bundles for display
export const POWER_BUNDLE_LIST = [
  POWER_BUNDLES.admin,
  POWER_BUNDLES.member,
  POWER_BUNDLES.creator,
];

/**
 * Convert permissions object to power bundles
 * Returns which bundles each role has
 */
export function permissionsToPowerBundles(permissions, roleCount) {
  const bundles = {
    admin: [],
    member: [],
    creator: [],
  };

  // For each role, check if it has all permissions in each bundle
  for (let roleIndex = 0; roleIndex < roleCount; roleIndex++) {
    for (const [bundleKey, bundle] of Object.entries(POWER_BUNDLES)) {
      const hasAllPermissions = bundle.permissions.every(
        permKey => (permissions[permKey] || []).includes(roleIndex)
      );

      if (hasAllPermissions) {
        bundles[bundleKey].push(roleIndex);
      }
    }
  }

  return bundles;
}

/**
 * Convert power bundles to permissions object
 * Used when applying bundle changes to the full permission system
 */
export function powerBundlesToPermissions(bundles, existingPermissions = {}) {
  // Start with existing permissions
  const permissions = { ...existingPermissions };

  // Initialize all permission arrays if not present
  for (const key of PERMISSION_KEYS) {
    if (!permissions[key]) {
      permissions[key] = [];
    }
  }

  // Apply bundles
  for (const [bundleKey, bundle] of Object.entries(POWER_BUNDLES)) {
    const roleIndices = bundles[bundleKey] || [];

    for (const permKey of bundle.permissions) {
      // Add all role indices from this bundle to this permission
      permissions[permKey] = [
        ...new Set([...permissions[permKey], ...roleIndices])
      ].sort((a, b) => a - b);
    }
  }

  return permissions;
}

/**
 * Check if a role has a specific power bundle
 */
export function roleHasBundle(permissions, roleIndex, bundleKey) {
  const bundle = POWER_BUNDLES[bundleKey];
  if (!bundle) return false;

  return bundle.permissions.every(
    permKey => (permissions[permKey] || []).includes(roleIndex)
  );
}

/**
 * Toggle a power bundle for a role
 * Returns updated permissions object
 */
export function toggleBundleForRole(permissions, roleIndex, bundleKey) {
  const bundle = POWER_BUNDLES[bundleKey];
  if (!bundle) return permissions;

  const hasBundle = roleHasBundle(permissions, roleIndex, bundleKey);
  const newPermissions = { ...permissions };

  for (const permKey of bundle.permissions) {
    const currentRoles = newPermissions[permKey] || [];

    if (hasBundle) {
      // Remove role from this permission
      newPermissions[permKey] = currentRoles.filter(idx => idx !== roleIndex);
    } else {
      // Add role to this permission
      newPermissions[permKey] = [...new Set([...currentRoles, roleIndex])].sort((a, b) => a - b);
    }
  }

  return newPermissions;
}

/**
 * Set a power bundle for a role (add or remove)
 * Returns updated permissions object
 */
export function setBundleForRole(permissions, roleIndex, bundleKey, enabled) {
  const bundle = POWER_BUNDLES[bundleKey];
  if (!bundle) return permissions;

  const newPermissions = { ...permissions };

  for (const permKey of bundle.permissions) {
    const currentRoles = newPermissions[permKey] || [];

    if (enabled) {
      // Add role to this permission
      newPermissions[permKey] = [...new Set([...currentRoles, roleIndex])].sort((a, b) => a - b);
    } else {
      // Remove role from this permission
      newPermissions[permKey] = currentRoles.filter(idx => idx !== roleIndex);
    }
  }

  return newPermissions;
}

/**
 * Get a summary of which bundles each role has
 * Returns an array of { roleIndex, bundles: string[] }
 */
export function getRoleBundleSummary(permissions, roleCount) {
  const summary = [];

  for (let roleIndex = 0; roleIndex < roleCount; roleIndex++) {
    const roleBundles = [];

    for (const bundleKey of Object.keys(POWER_BUNDLES)) {
      if (roleHasBundle(permissions, roleIndex, bundleKey)) {
        roleBundles.push(bundleKey);
      }
    }

    summary.push({
      roleIndex,
      bundles: roleBundles,
    });
  }

  return summary;
}

/**
 * Get human-readable description of a role's powers
 */
export function describePowers(permissions, roleIndex) {
  const bundles = [];

  if (roleHasBundle(permissions, roleIndex, 'admin')) {
    bundles.push('Admin');
  }
  if (roleHasBundle(permissions, roleIndex, 'member')) {
    bundles.push('Member');
  }
  if (roleHasBundle(permissions, roleIndex, 'creator')) {
    bundles.push('Creator');
  }

  if (bundles.length === 0) {
    return 'No special powers';
  }

  return bundles.join(', ');
}

export default POWER_BUNDLES;
