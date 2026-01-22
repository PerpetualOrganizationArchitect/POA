/**
 * RoleHierarchyTree - Visual tree representation of role hierarchy
 */

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  ChevronRightIcon,
  WarningIcon,
  CheckCircleIcon,
} from '@chakra-ui/icons';
import { useDeployer } from '../../context/DeployerContext';
import { flattenHierarchy, validateHierarchy } from '../../utils/hierarchyUtils';

// Tree node component
function TreeNode({ roleIndex, role, depth, isLast, parentLines = [] }) {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const lineColor = useColorModeValue('gray.300', 'gray.500');

  const isTopLevel = depth === 0;

  return (
    <HStack align="start" spacing={0}>
      {/* Tree lines */}
      <Box display="flex" alignItems="stretch" minH="40px">
        {parentLines.map((showLine, idx) => (
          <Box
            key={idx}
            w="24px"
            borderLeftWidth={showLine ? '2px' : '0'}
            borderColor={lineColor}
            ml={idx === 0 ? 0 : 0}
          />
        ))}
        {!isTopLevel && (
          <Box position="relative" w="24px">
            {/* Vertical line */}
            <Box
              position="absolute"
              left="0"
              top="0"
              bottom={isLast ? '50%' : '0'}
              borderLeftWidth="2px"
              borderColor={lineColor}
            />
            {/* Horizontal connector */}
            <Box
              position="absolute"
              left="0"
              top="50%"
              w="20px"
              borderTopWidth="2px"
              borderColor={lineColor}
            />
          </Box>
        )}
      </Box>

      {/* Node content */}
      <Box
        flex={1}
        p={2}
        ml={isTopLevel ? 0 : 1}
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="md"
        _hover={{ borderColor: 'blue.300', boxShadow: 'sm' }}
        transition="all 0.2s"
      >
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Text fontWeight="medium" fontSize="sm">
              {role.name}
            </Text>
            {isTopLevel && (
              <Badge colorScheme="purple" fontSize="xs">
                Top Level
              </Badge>
            )}
            {role.canVote && (
              <Badge colorScheme="green" fontSize="xs">
                Votes
              </Badge>
            )}
            {role.vouching?.enabled && (
              <Badge colorScheme="orange" fontSize="xs">
                Vouching
              </Badge>
            )}
          </HStack>
          <Text fontSize="xs" color="gray.500">
            #{roleIndex}
          </Text>
        </HStack>
      </Box>
    </HStack>
  );
}

export function RoleHierarchyTree({ onSelectRole }) {
  const { state } = useDeployer();
  const { roles } = state;

  // Get validation status
  const validationResult = validateHierarchy(roles);

  // Get flattened hierarchy for display
  const flatRoles = flattenHierarchy(roles);

  // Build parent line tracking for tree rendering
  const renderTree = () => {
    if (roles.length === 0) {
      return (
        <Box
          p={6}
          textAlign="center"
          borderWidth="2px"
          borderStyle="dashed"
          borderColor="gray.200"
          borderRadius="lg"
        >
          <Text color="gray.500">
            No roles to display. Add roles to see the hierarchy.
          </Text>
        </Box>
      );
    }

    // Group by parent to determine which nodes are "last" in their group
    const childrenByParent = new Map();
    roles.forEach((role, idx) => {
      const parentIdx = role.hierarchy?.adminRoleIndex;
      const key = parentIdx === null ? 'root' : parentIdx;
      if (!childrenByParent.has(key)) {
        childrenByParent.set(key, []);
      }
      childrenByParent.get(key).push(idx);
    });

    // Recursive render function
    const renderNode = (roleIndex, depth, parentLines) => {
      const role = roles[roleIndex];
      const children = childrenByParent.get(roleIndex) || [];
      const parentIdx = role.hierarchy?.adminRoleIndex;
      const siblings = childrenByParent.get(parentIdx === null ? 'root' : parentIdx) || [];
      const isLast = siblings[siblings.length - 1] === roleIndex;

      return (
        <Box key={roleIndex}>
          <TreeNode
            roleIndex={roleIndex}
            role={role}
            depth={depth}
            isLast={isLast}
            parentLines={parentLines}
          />
          {children.length > 0 && (
            <Box>
              {children.map((childIdx, i) =>
                renderNode(
                  childIdx,
                  depth + 1,
                  [...parentLines, !isLast]
                )
              )}
            </Box>
          )}
        </Box>
      );
    };

    // Get root nodes and render
    const rootNodes = childrenByParent.get('root') || [];

    return (
      <VStack align="stretch" spacing={1}>
        {rootNodes.map((roleIndex) => renderNode(roleIndex, 0, []))}
      </VStack>
    );
  };

  return (
    <Box>
      {/* Validation status */}
      {!validationResult.isValid && (
        <Box
          mb={4}
          p={3}
          bg="red.50"
          borderRadius="md"
          borderWidth="1px"
          borderColor="red.200"
        >
          <HStack spacing={2} mb={2}>
            <Icon as={WarningIcon} color="red.500" />
            <Text fontWeight="medium" color="red.700">
              Hierarchy Issues
            </Text>
          </HStack>
          <VStack align="start" spacing={1}>
            {validationResult.errors.map((error, idx) => (
              <Text key={idx} fontSize="sm" color="red.600">
                • {error}
              </Text>
            ))}
          </VStack>
        </Box>
      )}

      {validationResult.isValid && roles.length > 0 && (
        <HStack
          mb={4}
          p={2}
          bg="green.50"
          borderRadius="md"
          borderWidth="1px"
          borderColor="green.200"
        >
          <Icon as={CheckCircleIcon} color="green.500" />
          <Text fontSize="sm" color="green.700">
            Hierarchy is valid
          </Text>
        </HStack>
      )}

      {/* Tree visualization */}
      {renderTree()}

      {/* Legend */}
      {roles.length > 0 && (
        <Box mt={4} pt={4} borderTopWidth="1px" borderColor="gray.200">
          <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={2}>
            Legend
          </Text>
          <HStack spacing={4} flexWrap="wrap">
            <HStack spacing={1}>
              <Badge colorScheme="purple" fontSize="xs">Top Level</Badge>
              <Text fontSize="xs" color="gray.500">Root admin role</Text>
            </HStack>
            <HStack spacing={1}>
              <Badge colorScheme="green" fontSize="xs">Votes</Badge>
              <Text fontSize="xs" color="gray.500">Can vote in governance</Text>
            </HStack>
            <HStack spacing={1}>
              <Badge colorScheme="orange" fontSize="xs">Vouching</Badge>
              <Text fontSize="xs" color="gray.500">Requires vouches to join</Text>
            </HStack>
          </HStack>
        </Box>
      )}
    </Box>
  );
}

export default RoleHierarchyTree;
