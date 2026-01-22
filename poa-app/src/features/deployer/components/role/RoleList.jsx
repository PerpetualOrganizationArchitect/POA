/**
 * RoleList - Manages the list of roles with add/edit/remove functionality
 */

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Alert,
  AlertIcon,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Heading,
  Divider,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useDeployer, createDefaultRole } from '../../context/DeployerContext';
import RoleCard from './RoleCard';
import RoleForm from './RoleForm';

export function RoleList({ showHierarchy = false }) {
  const { state, actions } = useDeployer();
  const { roles } = state;

  // Modal for adding/editing roles
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  // Delete confirmation dialog
  const [deleteIndex, setDeleteIndex] = useState(null);
  const deleteDialogRef = React.useRef();
  const isDeleteOpen = deleteIndex !== null;

  // Open modal for new role
  const handleAddRole = () => {
    setEditingIndex(null);
    setEditingRole(createDefaultRole(roles.length));
    onOpen();
  };

  // Open modal for editing existing role
  const handleEditRole = (index) => {
    setEditingIndex(index);
    setEditingRole({ ...roles[index] });
    onOpen();
  };

  // Save role (add or update)
  const handleSaveRole = (roleData) => {
    if (editingIndex === null) {
      // Adding new role
      actions.addRole(roleData);
    } else {
      // Updating existing role
      actions.updateRole(editingIndex, roleData);
    }
    onClose();
    setEditingRole(null);
    setEditingIndex(null);
  };

  // Initiate delete (show confirmation)
  const handleDeleteClick = (index) => {
    setDeleteIndex(index);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (deleteIndex !== null) {
      actions.removeRole(deleteIndex);
      setDeleteIndex(null);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteIndex(null);
  };

  return (
    <Box>
      {/* Header with add button */}
      <HStack justify="space-between" mb={4}>
        <VStack align="start" spacing={0}>
          <Heading size="md">Roles ({roles.length})</Heading>
          <Text fontSize="sm" color="gray.500">
            Define the roles in your organization
          </Text>
        </VStack>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleAddRole}
          isDisabled={roles.length >= 32}
        >
          Add Role
        </Button>
      </HStack>

      {roles.length >= 32 && (
        <Alert status="warning" mb={4} borderRadius="md">
          <AlertIcon />
          Maximum of 32 roles reached
        </Alert>
      )}

      {/* Role list */}
      {roles.length === 0 ? (
        <Box
          p={8}
          textAlign="center"
          borderWidth="2px"
          borderStyle="dashed"
          borderColor="gray.200"
          borderRadius="lg"
        >
          <Text color="gray.500" mb={4}>
            No roles defined yet. Add your first role to get started.
          </Text>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleAddRole}
          >
            Add First Role
          </Button>
        </Box>
      ) : (
        <VStack spacing={3} align="stretch">
          {roles.map((role, index) => (
            <RoleCard
              key={role.id || index}
              role={role}
              index={index}
              onEdit={handleEditRole}
              onDelete={handleDeleteClick}
            />
          ))}
        </VStack>
      )}

      {/* Quick Tips */}
      {roles.length > 0 && roles.length < 3 && (
        <Alert status="info" mt={4} borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="medium">Tips for Role Setup:</Text>
            <Text fontSize="sm" mt={1}>
              • At least one role should be a top-level admin (no parent)
              <br />
              • Enable "Can Vote" for roles that participate in governance
              <br />
              • Use vouching for community-driven membership
            </Text>
          </Box>
        </Alert>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingIndex === null ? 'Add New Role' : `Edit Role: ${editingRole?.name}`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {editingRole && (
              <RoleForm
                role={editingRole}
                roleIndex={editingIndex ?? roles.length}
                onSave={handleSaveRole}
                onCancel={onClose}
                isNew={editingIndex === null}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={deleteDialogRef}
        onClose={handleCancelDelete}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Role
            </AlertDialogHeader>

            <AlertDialogBody>
              {deleteIndex !== null && (
                <>
                  Are you sure you want to delete "{roles[deleteIndex]?.name}"?
                  {roles.some(
                    (r, idx) =>
                      idx !== deleteIndex && r.hierarchy.adminRoleIndex === deleteIndex
                  ) && (
                    <Alert status="warning" mt={4}>
                      <AlertIcon />
                      This role has child roles. They will become top-level roles.
                    </Alert>
                  )}
                  {roles.some(
                    (r, idx) =>
                      idx !== deleteIndex &&
                      r.vouching?.enabled &&
                      r.vouching.voucherRoleIndex === deleteIndex
                  ) && (
                    <Alert status="warning" mt={4}>
                      <AlertIcon />
                      This role is used for vouching by other roles. Vouching will be disabled for those roles.
                    </Alert>
                  )}
                </>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={deleteDialogRef} onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default RoleList;
