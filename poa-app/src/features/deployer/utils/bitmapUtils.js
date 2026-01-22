/**
 * Bitmap Utilities for Role Permission Management
 *
 * The smart contracts use uint256 bitmaps to represent role permissions.
 * Bit N = 1 means role at index N has the permission.
 *
 * Example:
 *   roles: [Member, Executive, Manager]
 *   indices: [0, 1, 2]
 *   bitmap 0b101 = 5 means roles 0 (Member) and 2 (Manager) have permission
 */

/**
 * Convert an array of role indices to a uint256 bitmap
 * @param {number[]} indices - Array of role indices (0-based)
 * @returns {number} Bitmap as a number (safe for < 32 roles)
 */
export function indicesToBitmap(indices) {
  if (!indices || !Array.isArray(indices) || indices.length === 0) {
    return 0;
  }

  return indices.reduce((bitmap, idx) => {
    if (typeof idx === 'number' && idx >= 0 && idx < 32) {
      return bitmap | (1 << idx);
    }
    return bitmap;
  }, 0);
}

/**
 * Convert a bitmap to an array of role indices
 * @param {number} bitmap - The bitmap value
 * @param {number} maxRoles - Maximum number of roles to check (default: 32)
 * @returns {number[]} Array of role indices that are set in the bitmap
 */
export function bitmapToIndices(bitmap, maxRoles = 32) {
  const indices = [];

  for (let i = 0; i < maxRoles; i++) {
    if ((bitmap & (1 << i)) !== 0) {
      indices.push(i);
    }
  }

  return indices;
}

/**
 * Check if a specific role index is set in the bitmap
 * @param {number} bitmap - The bitmap value
 * @param {number} roleIndex - The role index to check
 * @returns {boolean} True if the role is set in the bitmap
 */
export function isRoleInBitmap(bitmap, roleIndex) {
  return (bitmap & (1 << roleIndex)) !== 0;
}

/**
 * Add a role to the bitmap
 * @param {number} bitmap - The current bitmap
 * @param {number} roleIndex - The role index to add
 * @returns {number} New bitmap with the role added
 */
export function addRoleToBitmap(bitmap, roleIndex) {
  return bitmap | (1 << roleIndex);
}

/**
 * Remove a role from the bitmap
 * @param {number} bitmap - The current bitmap
 * @param {number} roleIndex - The role index to remove
 * @returns {number} New bitmap with the role removed
 */
export function removeRoleFromBitmap(bitmap, roleIndex) {
  return bitmap & ~(1 << roleIndex);
}

/**
 * Toggle a role in the bitmap
 * @param {number} bitmap - The current bitmap
 * @param {number} roleIndex - The role index to toggle
 * @returns {number} New bitmap with the role toggled
 */
export function toggleRoleInBitmap(bitmap, roleIndex) {
  return bitmap ^ (1 << roleIndex);
}

/**
 * Create a bitmap with all roles up to count set
 * @param {number} roleCount - Number of roles
 * @returns {number} Bitmap with all bits set up to roleCount
 */
export function createAllRolesBitmap(roleCount) {
  if (roleCount <= 0) return 0;
  return (1 << roleCount) - 1;
}

/**
 * Count the number of roles set in a bitmap
 * @param {number} bitmap - The bitmap value
 * @returns {number} Number of bits set (popcount)
 */
export function countRolesInBitmap(bitmap) {
  let count = 0;
  let n = bitmap;

  while (n) {
    count += n & 1;
    n >>>= 1;
  }

  return count;
}

/**
 * Convert permissions object (with role index arrays) to bitmaps object
 * @param {Object} permissions - Object with permission keys and role index arrays
 * @returns {Object} Object with permission keys and bitmap values
 */
export function permissionsToBitmaps(permissions) {
  const bitmaps = {};

  for (const [key, indices] of Object.entries(permissions)) {
    bitmaps[`${key}Bitmap`] = indicesToBitmap(indices);
  }

  return bitmaps;
}

/**
 * Convert bitmaps object to permissions object (with role index arrays)
 * @param {Object} bitmaps - Object with permission keys and bitmap values
 * @param {number} roleCount - Number of roles to consider
 * @returns {Object} Object with permission keys and role index arrays
 */
export function bitmapsToPermissions(bitmaps, roleCount) {
  const permissions = {};

  for (const [key, bitmap] of Object.entries(bitmaps)) {
    // Remove 'Bitmap' suffix if present
    const permKey = key.endsWith('Bitmap') ? key.slice(0, -6) : key;
    permissions[permKey] = bitmapToIndices(bitmap, roleCount);
  }

  return permissions;
}

/**
 * Format bitmap as binary string for debugging
 * @param {number} bitmap - The bitmap value
 * @param {number} minWidth - Minimum width (pad with zeros)
 * @returns {string} Binary string representation
 */
export function formatBitmapBinary(bitmap, minWidth = 8) {
  return bitmap.toString(2).padStart(minWidth, '0');
}

/**
 * Format bitmap as hex string
 * @param {number} bitmap - The bitmap value
 * @returns {string} Hex string representation
 */
export function formatBitmapHex(bitmap) {
  return '0x' + bitmap.toString(16);
}

export default {
  indicesToBitmap,
  bitmapToIndices,
  isRoleInBitmap,
  addRoleToBitmap,
  removeRoleFromBitmap,
  toggleRoleInBitmap,
  createAllRolesBitmap,
  countRolesInBitmap,
  permissionsToBitmaps,
  bitmapsToPermissions,
  formatBitmapBinary,
  formatBitmapHex,
};
