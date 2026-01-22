/**
 * Hierarchy Utilities for Role Management
 *
 * Roles in Hats Protocol form a tree hierarchy where each role has a parent (admin).
 * These utilities help validate and visualize the hierarchy.
 */

/**
 * Build a tree structure from flat role array
 * @param {Array} roles - Array of role objects with hierarchy.adminRoleIndex
 * @returns {Object} Tree structure with root nodes and children
 */
export function buildHierarchyTree(roles) {
  // Find top-level roles (adminRoleIndex is null)
  const topLevelRoles = [];
  const childrenMap = new Map(); // parentIndex -> children indices

  // Initialize children map
  roles.forEach((_, idx) => {
    childrenMap.set(idx, []);
  });

  // Build parent-child relationships
  roles.forEach((role, idx) => {
    const parentIdx = role.hierarchy?.adminRoleIndex;

    if (parentIdx === null || parentIdx === undefined) {
      topLevelRoles.push(idx);
    } else if (parentIdx >= 0 && parentIdx < roles.length) {
      const children = childrenMap.get(parentIdx) || [];
      children.push(idx);
      childrenMap.set(parentIdx, children);
    } else {
      // Invalid parent index - treat as top-level
      topLevelRoles.push(idx);
    }
  });

  return {
    topLevelRoles,
    childrenMap,
    roles,
  };
}

/**
 * Get all descendants of a role (recursive)
 * @param {number} roleIndex - The role index
 * @param {Array} roles - Array of role objects
 * @returns {number[]} Array of descendant role indices
 */
export function getDescendants(roleIndex, roles) {
  const descendants = [];
  const tree = buildHierarchyTree(roles);

  function collectDescendants(idx) {
    const children = tree.childrenMap.get(idx) || [];
    for (const childIdx of children) {
      descendants.push(childIdx);
      collectDescendants(childIdx);
    }
  }

  collectDescendants(roleIndex);
  return descendants;
}

/**
 * Get all ancestors of a role (up to root)
 * @param {number} roleIndex - The role index
 * @param {Array} roles - Array of role objects
 * @returns {number[]} Array of ancestor role indices (closest first)
 */
export function getAncestors(roleIndex, roles) {
  const ancestors = [];
  let currentIdx = roleIndex;
  const visited = new Set();

  while (true) {
    const role = roles[currentIdx];
    const parentIdx = role?.hierarchy?.adminRoleIndex;

    if (parentIdx === null || parentIdx === undefined) {
      break; // Reached top-level
    }

    if (visited.has(parentIdx)) {
      break; // Cycle detected - stop
    }

    if (parentIdx >= 0 && parentIdx < roles.length) {
      ancestors.push(parentIdx);
      visited.add(parentIdx);
      currentIdx = parentIdx;
    } else {
      break; // Invalid parent
    }
  }

  return ancestors;
}

/**
 * Get the depth of a role in the hierarchy (0 = top-level)
 * @param {number} roleIndex - The role index
 * @param {Array} roles - Array of role objects
 * @returns {number} Depth level
 */
export function getRoleDepth(roleIndex, roles) {
  return getAncestors(roleIndex, roles).length;
}

/**
 * Detect if there are any cycles in the hierarchy
 * @param {Array} roles - Array of role objects
 * @returns {Object} { hasCycle: boolean, cycleRoles: number[] }
 */
export function detectCycles(roles) {
  const visited = new Set();
  const recursionStack = new Set();
  const cycleRoles = [];

  function hasCycleFrom(index, path = []) {
    if (recursionStack.has(index)) {
      // Found a cycle - find all roles in the cycle
      const cycleStart = path.indexOf(index);
      if (cycleStart !== -1) {
        cycleRoles.push(...path.slice(cycleStart));
      }
      return true;
    }

    if (visited.has(index)) {
      return false;
    }

    visited.add(index);
    recursionStack.add(index);
    path.push(index);

    const role = roles[index];
    const parentIdx = role?.hierarchy?.adminRoleIndex;

    if (parentIdx !== null && parentIdx !== undefined && parentIdx >= 0 && parentIdx < roles.length) {
      if (hasCycleFrom(parentIdx, path)) {
        return true;
      }
    }

    recursionStack.delete(index);
    path.pop();
    return false;
  }

  for (let i = 0; i < roles.length; i++) {
    visited.clear();
    recursionStack.clear();
    if (hasCycleFrom(i, [])) {
      return { hasCycle: true, cycleRoles: [...new Set(cycleRoles)] };
    }
  }

  return { hasCycle: false, cycleRoles: [] };
}

/**
 * Check if setting a parent would create a cycle
 * @param {number} roleIndex - The role that would get a new parent
 * @param {number} newParentIndex - The proposed new parent
 * @param {Array} roles - Current array of role objects
 * @returns {boolean} True if this would create a cycle
 */
export function wouldCreateCycle(roleIndex, newParentIndex, roles) {
  if (newParentIndex === null || newParentIndex === undefined) {
    return false; // Making it top-level is always safe
  }

  if (roleIndex === newParentIndex) {
    return true; // Can't be your own parent
  }

  // Check if newParent is a descendant of role
  const descendants = getDescendants(roleIndex, roles);
  return descendants.includes(newParentIndex);
}

/**
 * Get valid parent options for a role (excludes itself and descendants)
 * @param {number} roleIndex - The role index
 * @param {Array} roles - Array of role objects
 * @returns {number[]} Array of valid parent role indices
 */
export function getValidParentOptions(roleIndex, roles) {
  const descendants = getDescendants(roleIndex, roles);
  const invalid = new Set([roleIndex, ...descendants]);

  return roles
    .map((_, idx) => idx)
    .filter(idx => !invalid.has(idx));
}

/**
 * Flatten the hierarchy tree to an array ordered by depth-first traversal
 * @param {Array} roles - Array of role objects
 * @returns {Array} Array of { roleIndex, depth } objects in tree order
 */
export function flattenHierarchy(roles) {
  const tree = buildHierarchyTree(roles);
  const result = [];

  function traverse(roleIndex, depth) {
    result.push({ roleIndex, depth, role: roles[roleIndex] });

    const children = tree.childrenMap.get(roleIndex) || [];
    // Sort children by name for consistent ordering
    const sortedChildren = [...children].sort((a, b) =>
      (roles[a]?.name || '').localeCompare(roles[b]?.name || '')
    );

    for (const childIdx of sortedChildren) {
      traverse(childIdx, depth + 1);
    }
  }

  // Sort top-level roles by name
  const sortedTopLevel = [...tree.topLevelRoles].sort((a, b) =>
    (roles[a]?.name || '').localeCompare(roles[b]?.name || '')
  );

  for (const rootIdx of sortedTopLevel) {
    traverse(rootIdx, 0);
  }

  return result;
}

/**
 * Validate hierarchy constraints
 * @param {Array} roles - Array of role objects
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateHierarchy(roles) {
  const errors = [];

  // Check for cycles
  const cycleResult = detectCycles(roles);
  if (cycleResult.hasCycle) {
    errors.push(`Circular dependency detected involving roles: ${cycleResult.cycleRoles.map(i => roles[i]?.name || i).join(', ')}`);
  }

  // Check that at least one top-level role exists
  const tree = buildHierarchyTree(roles);
  if (tree.topLevelRoles.length === 0 && roles.length > 0) {
    errors.push('At least one role must be a top-level admin (no parent)');
  }

  // Check for invalid parent references
  roles.forEach((role, idx) => {
    const parentIdx = role.hierarchy?.adminRoleIndex;
    if (parentIdx !== null && parentIdx !== undefined) {
      if (parentIdx < 0 || parentIdx >= roles.length) {
        errors.push(`Role "${role.name}" has invalid parent reference (index ${parentIdx})`);
      }
      if (parentIdx === idx) {
        errors.push(`Role "${role.name}" cannot be its own parent`);
      }
    }
  });

  // Check vouching references
  roles.forEach((role, idx) => {
    if (role.vouching?.enabled) {
      const voucherIdx = role.vouching.voucherRoleIndex;
      if (voucherIdx < 0 || voucherIdx >= roles.length) {
        errors.push(`Role "${role.name}" has invalid voucher role reference (index ${voucherIdx})`);
      }
      if (role.vouching.quorum <= 0) {
        errors.push(`Role "${role.name}" has vouching enabled but quorum is not positive`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Reorder roles after a hierarchy change to ensure parents come before children
 * This is required by the contract's multi-pass role creation
 * @param {Array} roles - Array of role objects
 * @returns {Array} Reordered roles array
 */
export function reorderByDependency(roles) {
  const flattened = flattenHierarchy(roles);

  // Create a map of old index to new index
  const indexMap = new Map();
  flattened.forEach((item, newIdx) => {
    indexMap.set(item.roleIndex, newIdx);
  });

  // Reorder and update parent references
  return flattened.map((item, newIdx) => {
    const role = { ...roles[item.roleIndex] };
    const oldParentIdx = role.hierarchy.adminRoleIndex;

    if (oldParentIdx !== null && oldParentIdx !== undefined) {
      role.hierarchy = {
        ...role.hierarchy,
        adminRoleIndex: indexMap.get(oldParentIdx),
      };
    }

    return role;
  });
}

export default {
  buildHierarchyTree,
  getDescendants,
  getAncestors,
  getRoleDepth,
  detectCycles,
  wouldCreateCycle,
  getValidParentOptions,
  flattenHierarchy,
  validateHierarchy,
  reorderByDependency,
};
