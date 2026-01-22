/**
 * WelcomeClaimPage - Onboarding welcome experience for new org members
 * This is the first thing users see after deploying their org
 */

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Button,
  Icon,
  Spinner,
  Flex,
  Circle,
  Badge,
} from '@chakra-ui/react';
import { FiUsers, FiArrowRight, FiCheck, FiStar, FiLock } from 'react-icons/fi';
import Navbar from '@/templateComponents/studentOrgDAO/NavBar';
import { useClaimRole } from '@/hooks';

/**
 * GlassLayer - Reusable glassmorphism background component
 * Uses Chakra Box for better browser compatibility and consistency
 */
function GlassLayer() {
  return (
    <Box
      position="absolute"
      inset={0}
      zIndex={-1}
      borderRadius="inherit"
      backdropFilter="blur(20px)"
      bg="rgba(0, 0, 0, 0.73)"
    />
  );
}

/**
 * WelcomeClaimPage - Onboarding flow after org deployment
 */
export function WelcomeClaimPage({
  orgName,
  orgMetadata,
  claimableRoles,
  eligibilityModuleAddress,
}) {
  const {
    claimRole,
    isClaimingHat,
    isReady,
  } = useClaimRole(eligibilityModuleAddress);

  // Note: Page refresh after role claim is handled by UserContext
  // which subscribes to 'role:claimed' event and refetches user data

  const handleClaimRole = async (hatId) => {
    await claimRole(hatId);
  };

  // Find the most powerful role the user is eligible for
  // Be permissive: treat undefined defaultEligible as claimable (subgraph may not have indexed yet)
  const selfClaimableRoles = claimableRoles.filter(r => r.defaultEligible !== false);

  // Helper to normalize hat IDs for comparison (handles BigInt, hex strings, etc.)
  const normalizeId = (id) => {
    if (!id) return '';
    return String(id).toLowerCase();
  };

  // Build a set of all role hatIds for hierarchy checking
  const allRoleHatIds = new Set(claimableRoles.map(r => normalizeId(r.hatId)));

  // Recommend the most powerful role by checking hierarchy relationships
  const recommendedRole = [...selfClaimableRoles].sort((a, b) => {
    const aHatId = normalizeId(a.hatId);
    const bHatId = normalizeId(b.hatId);
    const aParent = normalizeId(a.parentHatId);
    const bParent = normalizeId(b.parentHatId);

    // If A's parent is B's hatId, B is A's admin -> B is more powerful
    if (aParent === bHatId) return 1;
    // If B's parent is A's hatId, A is B's admin -> A is more powerful
    if (bParent === aHatId) return -1;

    // Check if parent is another role in the org (means it's a sub-role)
    const aHasRoleParent = allRoleHatIds.has(aParent);
    const bHasRoleParent = allRoleHatIds.has(bParent);
    // Roles whose parent is NOT another role are top-level (more powerful)
    if (!aHasRoleParent && bHasRoleParent) return -1;
    if (aHasRoleParent && !bHasRoleParent) return 1;

    // Fall back to level if available (lower = more powerful)
    const aLevel = a.level ?? 999;
    const bLevel = b.level ?? 999;
    return aLevel - bLevel;
  })[0];

  return (
    <>
      <Navbar />
      <Box
        minH="calc(100vh - 80px)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
        pt={{ base: 20, md: 4 }}
      >
        <Box
          maxW="600px"
          w="100%"
          borderRadius="2xl"
          bg="transparent"
          boxShadow="2xl"
          position="relative"
          zIndex={2}
          overflow="hidden"
        >
          <GlassLayer />

          {/* Header with step indicator */}
          <HStack
            px={6}
            py={3}
            borderBottom="1px solid"
            borderColor="whiteAlpha.100"
            position="relative"
          >
            <GlassLayer />
            <Circle size="24px" bg="purple.500" color="white" fontSize="xs" fontWeight="bold">
              1
            </Circle>
            <Text color="gray.300" fontSize="sm" fontWeight="medium">
              Getting Started
            </Text>
          </HStack>

          {/* Main Content */}
          <VStack spacing={6} p={{ base: 6, md: 8 }} align="center">

            {/* Org Logo */}
            <Box
              borderRadius="2xl"
              overflow="hidden"
              bg="whiteAlpha.100"
              p={4}
            >
              {orgMetadata?.logo ? (
                <Image
                  src={orgMetadata.logo}
                  alt={`${orgName} logo`}
                  maxH="100px"
                  maxW="100px"
                  objectFit="contain"
                />
              ) : (
                <Image
                  src="/images/high_res_poa.png"
                  alt="Organization"
                  maxH="100px"
                  maxW="100px"
                  objectFit="contain"
                />
              )}
            </Box>

            {/* Welcome Text */}
            <VStack spacing={2} textAlign="center">
              <Text
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                color="white"
              >
                Welcome to {orgName}!
              </Text>
              {orgMetadata?.description && (
                <Text
                  fontSize="md"
                  color="gray.400"
                  maxW="400px"
                  noOfLines={2}
                >
                  {orgMetadata.description}
                </Text>
              )}
            </VStack>

            {/* Divider */}
            <Box w="60px" h="2px" bg="purple.500" borderRadius="full" />

            {/* Instruction */}
            <Text
              fontSize="lg"
              color="white"
              fontWeight="medium"
              textAlign="center"
            >
              {selfClaimableRoles.length > 0
                ? "Choose a role to get started"
                : "Available roles in this organization"}
            </Text>

            {/* Roles List - minH prevents layout shift when loading */}
            <VStack w="100%" spacing={3} minH="180px">
              {claimableRoles.length === 0 ? (
                <VStack py={6}>
                  <Spinner size="lg" color="purple.400" />
                  <Text color="gray.400" fontSize="sm">Loading roles...</Text>
                </VStack>
              ) : (
                // Sort roles: recommended first, then by eligibility
                [...claimableRoles].sort((a, b) => {
                  const aIsRecommended = a.hatId === recommendedRole?.hatId;
                  const bIsRecommended = b.hatId === recommendedRole?.hatId;
                  if (aIsRecommended && !bIsRecommended) return -1;
                  if (!aIsRecommended && bIsRecommended) return 1;
                  return 0;
                }).map((role) => {
                  const isRecommended = role.hatId === recommendedRole?.hatId;
                  const isClaiming = isClaimingHat(role.hatId);
                  // In the welcome flow, be permissive - let users try to claim any role
                  // The contract will reject if they're not actually eligible
                  // defaultEligible may be undefined during subgraph indexing, so default to allowing
                  const canSelfClaim = role.defaultEligible !== false;
                  const requiresVouching = role.vouchingEnabled;

                  return (
                    <Box
                      key={role.hatId}
                      w="100%"
                      p={4}
                      borderRadius="xl"
                      bg={isRecommended ? "purple.900" : "whiteAlpha.50"}
                      border="1px solid"
                      borderColor={isRecommended ? "purple.500" : "whiteAlpha.100"}
                      position="relative"
                      _hover={{
                        borderColor: "purple.400",
                        bg: isRecommended ? "purple.800" : "whiteAlpha.100",
                      }}
                      transition="all 0.2s"
                    >
                      {isRecommended && canSelfClaim && (
                        <Badge
                          position="absolute"
                          top={-2}
                          right={4}
                          colorScheme="purple"
                          fontSize="xs"
                          px={2}
                          py={0.5}
                          borderRadius="full"
                        >
                          <HStack spacing={1}>
                            <Icon as={FiStar} boxSize={3} />
                            <Text>Recommended</Text>
                          </HStack>
                        </Badge>
                      )}

                      <Flex
                        justify="space-between"
                        align="center"
                        direction={{ base: "column", sm: "row" }}
                        gap={3}
                      >
                        <VStack align={{ base: "center", sm: "start" }} spacing={1}>
                          <HStack spacing={2}>
                            <Text
                              fontSize="lg"
                              fontWeight="semibold"
                              color="white"
                            >
                              {role.name}
                            </Text>
                            {canSelfClaim && (
                              <Badge
                                colorScheme="green"
                                fontSize="xs"
                                px={2}
                                py={0.5}
                                borderRadius="full"
                              >
                                Eligible
                              </Badge>
                            )}
                          </HStack>
                          <HStack spacing={1} color="gray.400" fontSize="sm">
                            <Icon as={FiUsers} />
                            <Text>
                              {role.memberCount} {role.memberCount === 1 ? 'member' : 'members'}
                            </Text>
                            {requiresVouching && (
                              <>
                                <Text>•</Text>
                                <Text>Requires vouching</Text>
                              </>
                            )}
                          </HStack>
                        </VStack>

                        {canSelfClaim ? (
                          <Button
                            colorScheme="purple"
                            size="md"
                            px={6}
                            rightIcon={isClaiming ? undefined : <Icon as={FiArrowRight} />}
                            isLoading={isClaiming}
                            loadingText="Claiming..."
                            isDisabled={!isReady}
                            onClick={() => handleClaimRole(role.hatId)}
                            _hover={{
                              transform: isReady ? "translateX(2px)" : undefined,
                            }}
                            transition="all 0.2s"
                          >
                            {!isReady ? "Connecting..." : isClaiming ? "Claiming..." : "Join"}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="md"
                            px={6}
                            leftIcon={<Icon as={FiLock} />}
                            isDisabled
                            color="gray.400"
                            borderColor="whiteAlpha.300"
                            _hover={{}}
                          >
                            Invite Only
                          </Button>
                        )}
                      </Flex>
                    </Box>
                  );
                })
              )}
            </VStack>

            {/* Footer hint */}
            <HStack spacing={2} color="gray.500" fontSize="sm" pt={2}>
              <Icon as={FiCheck} />
              <Text>
                {selfClaimableRoles.length > 0
                  ? "You can change roles later in org settings"
                  : "Contact an organization admin to get invited"}
              </Text>
            </HStack>

          </VStack>
        </Box>
      </Box>
    </>
  );
}

export default WelcomeClaimPage;
