/**
 * TeamStep - Zen-styled team configuration with two-column layout
 *
 * Features:
 * - Inline role editing with all fields visible
 * - "Assign to me" toggle prominently displayed
 * - Visual hierarchy tree preview
 * - Thoughtful, calm design matching Identity step
 */

import React from 'react';
import {
  Box,
  VStack,
  Grid,
  GridItem,
  Text,
  Badge,
  HStack,
  useToast,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useDeployer } from '../context/DeployerContext';
import { StepHeader, NavigationButtons } from '../components/common';
import { RoleCardSimple } from '../components/role/RoleCardSimple';
import { RoleCardAdvanced } from '../components/role/RoleCardAdvanced';
import { TeamPreview } from '../components/role/TeamPreview';
import { QuickAddRole } from '../components/role/QuickAddRole';
import { toggleBundleForRole } from '../utils/powerBundles';

export function TeamStep() {
  const { state, actions, selectors } = useDeployer();
  const toast = useToast();

  const selectedTemplate = selectors.getSelectedTemplate();
  const showSidebar = useBreakpointValue({ base: false, lg: true });

  const { roles, permissions } = state;

  // Use global advanced mode from context
  const isAdvanced = selectors.isAdvancedMode();

  // Choose which card component to render
  const RoleCard = isAdvanced ? RoleCardAdvanced : RoleCardSimple;

  // Handle role updates
  const handleUpdateRole = (index, updatedRole) => {
    actions.updateRole(index, updatedRole);

    // Update quick join permission based on vouching
    if (updatedRole.vouching?.enabled) {
      // Remove from quick join if vouching is enabled
      actions.setPermissionRoles(
        'quickJoinRoles',
        permissions.quickJoinRoles.filter((i) => i !== index)
      );
    } else {
      // Add to quick join if vouching is disabled (open)
      if (!permissions.quickJoinRoles.includes(index)) {
        actions.setPermissionRoles('quickJoinRoles', [
          ...permissions.quickJoinRoles,
          index,
        ]);
      }
    }
  };

  // Handle role deletion
  const handleDeleteRole = (index) => {
    if (roles.length <= 2) {
      toast({
        title: 'Cannot delete',
        description: 'You need at least 2 roles for your organization.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    actions.removeRole(index);
    toast({
      title: 'Role removed',
      status: 'info',
      duration: 2000,
    });
  };

  // Handle power bundle toggle
  const handleTogglePower = (roleIndex, bundleKey) => {
    const newPermissions = toggleBundleForRole(permissions, roleIndex, bundleKey);
    // Update each permission that changed
    Object.keys(newPermissions).forEach((key) => {
      if (JSON.stringify(newPermissions[key]) !== JSON.stringify(permissions[key])) {
        actions.setPermissionRoles(key, newPermissions[key]);
      }
    });
  };

  // Handle individual permission toggle (for granular permissions modal)
  const handleTogglePermission = (permissionKey, roleIndex) => {
    actions.togglePermission(permissionKey, roleIndex);
  };

  // Handle adding new role
  const handleAddRole = (name) => {
    actions.addRole(name);
    toast({
      title: 'Role added',
      description: `${name} has been added to your team.`,
      status: 'success',
      duration: 2000,
    });
  };

  // Validation before proceeding (informational only - doesn't block)
  const handleNext = () => {
    if (roles.length === 0) {
      toast({
        title: 'Step incomplete',
        description: 'Add at least one role. You can come back to finish later.',
        status: 'info',
        duration: 3000,
      });
    } else {
      // Check for at least one top-level role
      const hasTopLevel = roles.some((r) => r.hierarchy?.adminRoleIndex === null);
      if (!hasTopLevel) {
        toast({
          title: 'Step incomplete',
          description: 'At least one role should be top-level. You can fix this later.',
          status: 'info',
          duration: 3000,
        });
      }
    }

    // Always proceed to next step
    actions.nextStep();
  };

  // Count assigned roles for mobile summary
  const assignedCount = roles.filter((r) => r.distribution?.mintToDeployer).length;

  const guidanceText = selectedTemplate?.ui?.guidanceText?.team;

  return (
    <>
      <StepHeader
        title="Who's in your organization?"
        description={
          guidanceText ||
          "Create roles for the people who'll make this work. Give each role a clear purpose and decide how new members join."
        }
      />

      <Grid
        templateColumns={{ base: '1fr', lg: '1fr 340px' }}
        gap={{ base: 6, lg: 8 }}
        alignItems="start"
      >
        {/* Main Form Column */}
        <GridItem>
          <VStack spacing={5} align="stretch">
            {/* Role Cards */}
            {roles.map((role, index) => (
              <RoleCard
                key={role.id || index}
                role={role}
                roleIndex={index}
                roles={roles}
                permissions={permissions}
                onUpdate={handleUpdateRole}
                onDelete={handleDeleteRole}
                onTogglePower={handleTogglePower}
                onTogglePermission={isAdvanced ? handleTogglePermission : undefined}
                canDelete={roles.length > 2}
              />
            ))}

            {/* Quick Add Role */}
            <QuickAddRole onAdd={handleAddRole} />

            {/* Mobile Summary (when sidebar is hidden) */}
            {!showSidebar && roles.length > 0 && (
              <Box
                bg="warmGray.50"
                p={4}
                borderRadius="xl"
                border="1px solid"
                borderColor="warmGray.100"
              >
                <HStack spacing={3} flexWrap="wrap">
                  <Badge
                    bg="coral.50"
                    color="coral.600"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                  >
                    {roles.length} {roles.length === 1 ? 'role' : 'roles'}
                  </Badge>
                  {assignedCount > 0 && (
                    <Badge
                      bg="green.50"
                      color="green.600"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="sm"
                    >
                      {assignedCount} assigned to you
                    </Badge>
                  )}
                  <Badge
                    bg="purple.50"
                    color="purple.600"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                  >
                    {roles.filter((r) => r.hierarchy?.adminRoleIndex === null).length} leader{roles.filter((r) => r.hierarchy?.adminRoleIndex === null).length !== 1 ? 's' : ''}
                  </Badge>
                </HStack>
              </Box>
            )}

            {/* Navigation */}
            <NavigationButtons
              onNext={handleNext}
              nextLabel="Continue"
            />
          </VStack>
        </GridItem>

        {/* Preview Sidebar */}
        {showSidebar && (
          <GridItem>
            <TeamPreview roles={roles} />
          </GridItem>
        )}
      </Grid>
    </>
  );
}

export default TeamStep;
