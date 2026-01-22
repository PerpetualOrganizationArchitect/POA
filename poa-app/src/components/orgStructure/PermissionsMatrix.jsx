/**
 * PermissionsMatrix - Polished table showing role permissions
 */

import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Icon,
  Tooltip,
  Skeleton,
  HStack,
} from '@chakra-ui/react';
import {
  FiCheck,
  FiMinus,
  FiUserPlus,
  FiDollarSign,
  FiCheckCircle,
  FiClipboard,
  FiBook,
  FiBookOpen,
  FiFileText,
  FiThumbsUp,
  FiPlusSquare,
} from 'react-icons/fi';

const glassLayerStyle = {
  position: 'absolute',
  height: '100%',
  width: '100%',
  zIndex: -1,
  borderRadius: 'inherit',
  backdropFilter: 'blur(20px)',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  boxShadow: 'inset 0 0 15px rgba(148, 115, 220, 0.15)',
  border: '1px solid rgba(148, 115, 220, 0.2)',
};

/**
 * Icon mapping for permission types
 */
const PERMISSION_ICONS = {
  QuickJoin_Member: FiUserPlus,
  ParticipationToken_Member: FiDollarSign,
  ParticipationToken_Approver: FiCheckCircle,
  EducationHub_Creator: FiBook,
  EducationHub_Member: FiBookOpen,
  HybridVoting_Creator: FiFileText,
  HybridVoting_Voter: FiThumbsUp,
  DirectDemocracyVoting_Creator: FiPlusSquare,
  DirectDemocracyVoting_Voter: FiThumbsUp,
  Executor_Voter: FiThumbsUp,
};

/**
 * Short labels for column headers
 */
const SHORT_LABELS = {
  QuickJoin_Member: 'Join',
  ParticipationToken_Member: 'Token',
  ParticipationToken_Approver: 'Approve',
  EducationHub_Creator: 'Edu Create',
  EducationHub_Member: 'Edu Access',
  HybridVoting_Creator: 'Proposal',
  HybridVoting_Voter: 'Vote',
  DirectDemocracyVoting_Creator: 'Poll Create',
  DirectDemocracyVoting_Voter: 'Poll Vote',
  Executor_Voter: 'Execute',
};

/**
 * Full descriptions for tooltips
 */
const FULL_DESCRIPTIONS = {
  QuickJoin_Member: 'Can quick join the organization',
  ParticipationToken_Member: 'Can hold participation tokens',
  ParticipationToken_Approver: 'Can approve token requests',
  EducationHub_Creator: 'Can create education modules',
  EducationHub_Member: 'Can access education content',
  HybridVoting_Creator: 'Can create hybrid voting proposals',
  HybridVoting_Voter: 'Can vote on hybrid proposals',
  DirectDemocracyVoting_Creator: 'Can create direct democracy polls',
  DirectDemocracyVoting_Voter: 'Can vote on direct democracy polls',
  Executor_Voter: 'Can execute approved proposals',
};

function PermissionCell({ allowed }) {
  return (
    <Td textAlign="center" py={3}>
      {allowed ? (
        <Icon
          as={FiCheck}
          color="green.400"
          boxSize={5}
          bg="rgba(72, 187, 120, 0.1)"
          p={1}
          borderRadius="md"
        />
      ) : (
        <Icon
          as={FiMinus}
          color="gray.600"
          boxSize={5}
        />
      )}
    </Td>
  );
}

export function PermissionsMatrix({
  roles = [],
  permissionsMatrix = {},
  permissionColumns = [],
  loading = false,
}) {
  if (loading) {
    return (
      <Box
        position="relative"
        borderRadius="2xl"
        p={{ base: 4, md: 6 }}
        overflow="hidden"
      >
        <Box style={glassLayerStyle} />
        <Skeleton height="200px" borderRadius="xl" />
      </Box>
    );
  }

  if (roles.length === 0 || permissionColumns.length === 0) {
    return (
      <Box
        position="relative"
        borderRadius="2xl"
        p={{ base: 4, md: 6 }}
        overflow="hidden"
        textAlign="center"
      >
        <Box style={glassLayerStyle} />
        <Text color="gray.400">No permissions configured</Text>
      </Box>
    );
  }

  return (
    <Box
      position="relative"
      borderRadius="2xl"
      overflow="hidden"
    >
      <Box style={glassLayerStyle} />

      <Box overflowX="auto">
        <Table
          variant="unstyled"
          size="sm"
          sx={{
            'th, td': {
              borderBottom: '1px solid rgba(148, 115, 220, 0.1)',
            },
            'tbody tr': {
              transition: 'background-color 0.2s',
              _hover: {
                backgroundColor: 'rgba(148, 115, 220, 0.05)',
              },
            },
          }}
        >
          <Thead>
            <Tr>
              <Th
                color="gray.400"
                textTransform="none"
                fontSize="sm"
                fontWeight="semibold"
                py={4}
                px={4}
                position="sticky"
                left={0}
                bg="rgba(20, 20, 30, 0.95)"
                zIndex={1}
                minW="150px"
              >
                Role
              </Th>
              {permissionColumns.map((col) => {
                const IconComponent = PERMISSION_ICONS[col.key] || FiCheck;
                const shortLabel = SHORT_LABELS[col.key] || col.permissionRole;
                const description = FULL_DESCRIPTIONS[col.key] || col.label;

                return (
                  <Th
                    key={col.key}
                    textAlign="center"
                    color="gray.400"
                    textTransform="none"
                    fontSize="xs"
                    fontWeight="semibold"
                    py={4}
                    px={3}
                    minW="80px"
                  >
                    <Tooltip label={description} placement="top">
                      <HStack justify="center" spacing={1}>
                        <Icon as={IconComponent} boxSize={4} color="purple.300" />
                        <Text display={{ base: 'none', md: 'block' }}>
                          {shortLabel}
                        </Text>
                      </HStack>
                    </Tooltip>
                  </Th>
                );
              })}
            </Tr>
          </Thead>

          <Tbody>
            {roles.map((role) => {
              const rolePermissions = permissionsMatrix[role.hatId] || {};

              return (
                <Tr key={role.id || role.hatId}>
                  <Td
                    fontWeight="medium"
                    color="white"
                    py={3}
                    px={4}
                    position="sticky"
                    left={0}
                    bg="rgba(20, 20, 30, 0.95)"
                    zIndex={1}
                  >
                    <HStack spacing={2}>
                      <Text>{role.name}</Text>
                      <Text color="gray.500" fontSize="xs">
                        ({role.memberCount})
                      </Text>
                    </HStack>
                  </Td>
                  {permissionColumns.map((col) => (
                    <PermissionCell
                      key={col.key}
                      allowed={rolePermissions[col.key]}
                    />
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}

export default PermissionsMatrix;
