import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Grid,
  GridItem,
  Text,
  IconButton,
  HStack,
  keyframes,
  usePrefersReducedMotion,
  chakra,
  Image,
  Progress,
  Spacer,
  Badge,
  Spinner,
  Center,
  Button,
  useDisclosure,
  Collapse,
  Skeleton,
  Circle,
} from '@chakra-ui/react';
import { SettingsIcon, AddIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import AccountSettingsModal from '@/components/userPage/AccountSettingsModal';
import { useVotingContext } from '@/context/VotingContext';
import { useUserContext } from '@/context/UserContext';
import { useProjectContext } from '@/context/ProjectContext';
import { useSpring, animated } from 'react-spring';
import Link2 from 'next/link';
import OngoingPolls from '@/components/userPage/OngoingPolls';
import UserProposals from '@/components/userPage/UserProposals';
import { useRouter } from 'next/router';
import Navbar from "@/templateComponents/studentOrgDAO/NavBar";
import ExecutiveMenuModal from '@/components/profileHub/ExecutiveMenuModal';
import { useOrgStructure } from '@/hooks';
import WelcomeClaimPage from '@/components/profileHub/WelcomeClaimPage';
import { TokenRequestModal, PendingRequestsPanel, UserRequestHistory } from '@/components/tokenRequest';

/**
 * Skeleton loader for WelcomeClaimPage - prevents layout shift during initial load
 * Matches the exact dimensions and structure of the real component
 */
function WelcomePageSkeleton() {
  return (
    <>
      <Navbar />
      <Box
        minH="calc(100vh - 80px)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Box
          maxW="600px"
          w="100%"
          borderRadius="2xl"
          bg="rgba(0, 0, 0, 0.73)"
          backdropFilter="blur(20px)"
          overflow="hidden"
          boxShadow="2xl"
        >
          {/* Step indicator skeleton */}
          <HStack
            px={6}
            py={3}
            borderBottom="1px solid"
            borderColor="whiteAlpha.100"
          >
            <Skeleton height="24px" width="24px" borderRadius="full" startColor="whiteAlpha.100" endColor="whiteAlpha.300" />
            <Skeleton height="16px" width="120px" startColor="whiteAlpha.100" endColor="whiteAlpha.300" />
          </HStack>

          {/* Content skeleton */}
          <VStack spacing={6} p={8} align="center">
            {/* Logo placeholder */}
            <Skeleton height="100px" width="100px" borderRadius="2xl" startColor="whiteAlpha.100" endColor="whiteAlpha.300" />

            {/* Title placeholder */}
            <Skeleton height="36px" width="280px" startColor="whiteAlpha.100" endColor="whiteAlpha.300" />

            {/* Description placeholder */}
            <Skeleton height="20px" width="320px" startColor="whiteAlpha.100" endColor="whiteAlpha.300" />

            {/* Divider placeholder */}
            <Skeleton height="2px" width="60px" startColor="purple.400" endColor="purple.600" />

            {/* Instruction placeholder */}
            <Skeleton height="24px" width="220px" startColor="whiteAlpha.100" endColor="whiteAlpha.300" />

            {/* Role cards placeholders */}
            <VStack w="100%" spacing={3}>
              <Skeleton height="80px" width="100%" borderRadius="xl" startColor="whiteAlpha.50" endColor="whiteAlpha.200" />
              <Skeleton height="80px" width="100%" borderRadius="xl" startColor="whiteAlpha.50" endColor="whiteAlpha.200" />
            </VStack>

            {/* Footer hint placeholder */}
            <Skeleton height="16px" width="260px" startColor="whiteAlpha.100" endColor="whiteAlpha.200" />
          </VStack>
        </Box>
      </Box>
    </>
  );
}

const UserprofileHub = () => {

  const router = useRouter();
  const { userDAO } = router.query;

  const { ongoingPolls,} = useVotingContext();
  const {recommendedTasks} = useProjectContext();

  const {claimedTasks, userProposals, graphUsername, userDataLoading, error, userData, hasExecRole, hasMemberRole, hasApproverRole} = useUserContext();

  // Fetch org structure for claim page
  const { roles, eligibilityModuleAddress, orgName, orgMetadata, loading: orgLoading } = useOrgStructure();
  // Show all roles in the welcome flow - defaultEligible just means self-claimable
  // Users can still see roles that require vouching/admin approval
  const claimableRoles = roles || [];

  const prefersReducedMotion = usePrefersReducedMotion();
  const [countFinished, setCountFinished] = useState(false);
  const [upgradeAvailable, setUpgradeAvailable] = useState(false);
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [notLoaded, setNotLoaded] = useState(true);

  const [isExecutiveMenuOpen, setExecutiveMenuOpen] = useState(false);
  const openExecutiveMenu = () => setExecutiveMenuOpen(true);
  const closeExecutiveMenu = () => setExecutiveMenuOpen(false);

  // Token request modal
  const { isOpen: isTokenRequestModalOpen, onOpen: openTokenRequestModal, onClose: closeTokenRequestModal } = useDisclosure();
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [showRequestHistory, setShowRequestHistory] = useState(false);
  

  const glassLayerStyle = {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: -1,
    borderRadius: 'inherit',
    backdropFilter: 'blur(20px)',
    backgroundColor: 'rgba(0, 0, 0, .73)',
  };

  const glowAnimation = keyframes`
    from { text-shadow: 0 0 0px white; }
    to { text-shadow: 0 0 20px gold;  }
  `;

  const difficultyColorScheme = {
    easy: 'green',
    medium: 'yellow',
    hard: 'orange',
    veryhard: 'red'
  };

  const determineTier = (balance) => {
    if (balance >= 1000) {
      return 'Gold';
    } else if (balance >= 500) {
      return 'Silver';
    } else if (balance >= 150) {
      return 'Bronze';
    } else {
      return 'Basic';
    }
  };

  const calculateProgress = (balance) => {
    if (balance < 150) {
      return { progress: (balance / 150) * 100, nextTier: 'Bronze', nextTierThreshold: 150 };
    } else if (balance < 500) {
      return { progress: ((balance - 150) / 150) * 100, nextTier: 'Silver', nextTierThreshold: 500 };
    } else if (balance < 1000) {
      return { progress: ((balance - 500) / 500) * 100, nextTier: 'Gold', nextTierThreshold: 1000 };
    } else {
      return { progress: 100, nextTier: 'Gold', nextTierThreshold: 1000 };
    }
  };

  const formatDateToAmerican = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const [userInfo, setUserInfo] = useState({});
  const [isExec, setIsExec] = useState(false);

  useEffect(() => {
    if (userData) {
      console.log(userData);
      // participationTokenBalance is already formatted by UserContext
      const ptBalance = Number(userData.participationTokenBalance) || 0;
      let progressData = calculateProgress(ptBalance);
      let userInfo = {
        username: graphUsername,
        ptBalance: ptBalance,
        memberStatus: userData.membershipStatus || 'Member',
        accountAddress: userData.id,
        tasksCompleted: userData.tasksCompleted || 0,
        totalVotes: userData.totalVotes || 0,
        dateJoined: userData.firstSeenAt ? formatDateToAmerican(userData.firstSeenAt) : 'Unknown',
        tier: determineTier(ptBalance),
        progress: progressData.progress,
        nextTier: progressData.nextTier,
        nextTierThreshold: progressData.nextTierThreshold
      };
      setUserInfo(userInfo);

      }
  }, [userData, graphUsername]);

  // In POP, executive status is determined by hasExecRole from UserContext
  useEffect(() => {
    setIsExec(hasExecRole);
  }, [hasExecRole]);

  const animatedPT = useSpring({ 
    pt: userInfo.ptBalance, 
    from: { pt: 0 },
    config: { duration: 1700 },
    onRest: () => setCountFinished(true),
  });

  const animationProps = prefersReducedMotion
    ? {}
    : {
        animation: `${glowAnimation} alternate 2.1s ease-in-out`,
      };

  const openSettingsModal = () => setSettingsModalOpen(true);
  const closeSettingsModal = () => setSettingsModalOpen(false);

  // Check if user has claimed any roles (hatIds)
  const userHatIds = userData?.hatIds || [];
  const hasClaimedRole = userHatIds.length > 0;

  // Composite loading state - wait for ALL data before deciding which view to show
  // This prevents the "flicker" caused by partial data rendering
  const isFullyLoaded = !orgLoading && !userDataLoading && orgName;

  // Show skeleton while ANY data is still loading
  if (!isFullyLoaded) {
    return <WelcomePageSkeleton />;
  }

  // Show welcome/claim page if user hasn't claimed any role yet
  if (!hasClaimedRole && claimableRoles.length > 0) {
    return (
      <WelcomeClaimPage
        orgName={orgName}
        orgMetadata={orgMetadata}
        claimableRoles={claimableRoles}
        eligibilityModuleAddress={eligibilityModuleAddress}
      />
    );
  }

  return (
    <>
      <Navbar />
      <Box mt={-2} p={4}>
        {userDataLoading ? (
          <Center height="100vh">
            <Spinner size="xl" />
          </Center>
        ) : error ? (
          <Center height="100vh">
            <Text>Error: {error.message}</Text>
          </Center>
        ) : (
          <Grid
            color="white"
            templateAreas={{
              base: `'welcome'
                     'userinfo'
                     'tierinfo'
                     'proposals'
                     'completedtasks'`,
              md: `'welcome welcome'
                   'userinfo tierinfo'
                   'userinfo tierinfo'
                   'proposals proposals'
                   'completedtasks completedtasks'`
            }}
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap={4}
          >
            <GridItem area={'userinfo'} colSpan={{ base: 2, md: 1 }}>
              <Box
                w="100%"
                borderRadius="2xl"
                bg="transparent"
                boxShadow="lg"
                position="relative"
                zIndex={2}
                mt={{ base: 12, md: 0 }}

              >
                <div style={glassLayerStyle} />
                <VStack position="relative" borderTopRadius="2xl" align="flex-start">
                  <div style={glassLayerStyle} />
                  <Text pl={8} letterSpacing="-1%" mt={0} fontSize={{ base: "3xl", md: "4xl" }} id="kubix-earned" fontWeight="bold">
                    Tokens Earned{' '}
                    {countFinished ? (
                      <chakra.span {...animationProps}>{userInfo.ptBalance}</chakra.span>
                    ) : (
                      <animated.span>
                        {animatedPT.pt.to(pt => pt.toFixed(0))}
                      </animated.span>
                    )}
                  </Text>
                </VStack>
                <VStack p={0} pt={2} align="center" height={"100%"}>
                  <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">{userInfo.tier} Tier Contributor</Text>
                  <Spacer />
                  <Image
                    width="50%"
                    src={
                      userInfo.tier
                        ? (userInfo.tier === 'Basic'
                          ? "/images/high_res_poa.png"
                          : `/images/${userInfo.tier.toLowerCase()}Medal.png`)
                        : "/images/high_res_poa.png"
                    }
                    alt={`${userInfo.tier || 'Basic'} Tier Medal`}
                  />
                  <Progress mt="2" width="70%" value={userInfo.progress} colorScheme="teal" borderRadius="md" />
                  <Text textAlign={"center"} fontSize="md" p={2} mb="2">
                    {userInfo.progress < 100 ? `Progress to ${userInfo.nextTier} Tier: ${userInfo.ptBalance}/${userInfo.nextTierThreshold}` : `You have reached the highest tier!`}
                  </Text>
                  {hasMemberRole && (
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="purple"
                      size="sm"
                      onClick={openTokenRequestModal}
                      mb={2}
                    >
                      Request Tokens
                    </Button>
                  )}
                </VStack>
              </Box>

              {/* Token Request History Section */}
              {hasMemberRole && (
                <Box
                  w="100%"
                  mt={4}
                  borderRadius="2xl"
                  bg="transparent"
                  boxShadow="lg"
                  position="relative"
                  zIndex={2}
                >
                  <div style={glassLayerStyle} />
                  <HStack
                    p={4}
                    cursor="pointer"
                    onClick={() => setShowRequestHistory(!showRequestHistory)}
                    justify="space-between"
                  >
                    <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>
                      My Token Requests
                    </Text>
                    {showRequestHistory ? <ChevronUpIcon boxSize={6} /> : <ChevronDownIcon boxSize={6} />}
                  </HStack>
                  <Collapse in={showRequestHistory}>
                    <Box p={4} pt={0}>
                      <UserRequestHistory />
                    </Box>
                  </Collapse>
                </Box>
              )}

              {/* Pending Requests Panel for Approvers */}
              {hasApproverRole && (
                <Box
                  w="100%"
                  mt={4}
                  borderRadius="2xl"
                  bg="transparent"
                  boxShadow="lg"
                  position="relative"
                  zIndex={2}
                >
                  <div style={glassLayerStyle} />
                  <HStack
                    p={4}
                    cursor="pointer"
                    onClick={() => setShowPendingRequests(!showPendingRequests)}
                    justify="space-between"
                  >
                    <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>
                      Pending Token Requests (Approver)
                    </Text>
                    {showPendingRequests ? <ChevronUpIcon boxSize={6} /> : <ChevronDownIcon boxSize={6} />}
                  </HStack>
                  <Collapse in={showPendingRequests}>
                    <Box p={4} pt={0}>
                      <PendingRequestsPanel />
                    </Box>
                  </Collapse>
                </Box>
              )}

              {/* Token Request Modal */}
              <TokenRequestModal isOpen={isTokenRequestModalOpen} onClose={closeTokenRequestModal} />
            </GridItem>
            <GridItem area={'tierinfo'} colSpan={2}>
              <Box
                w="100%"
                borderRadius="2xl"
                bg="transparent"
                boxShadow="lg"
                position="relative"
                zIndex={2}
              >
                <div style={glassLayerStyle} />
                <HStack pt={1} pb={1} position="relative" borderTopRadius="2xl">
                  <div style={glassLayerStyle} />
                  <Text pl={6} fontSize={{ base: "2xl", md: "3xl" }} fontWeight="extrabold">{userInfo.username}</Text>
                  <Text pt={0} pl={2} fontSize={{ base: "md", md: "lg" }}>{userInfo.memberStatus}</Text>
                </HStack>
                <IconButton
                  icon={<SettingsIcon />}
                  isRound={true}
                  size="sm"
                  aria-label="Settings"
                  onClick={openSettingsModal}
                  alignSelf="start"
                  justifySelf="end"
                  position="absolute"
                  top="8%"
                  right="4%"
                  color="black"
                />
                <AccountSettingsModal
                  isOpen={isSettingsModalOpen}
                  onClose={closeSettingsModal}
                />
                <HStack pb={4} pt={2} spacing={{ base: "2%", md: "4%" }} flexDir={{ base: "column", md: "row" }}>
                  <VStack mt="1" align={'flex-start'} ml={{ base: "3%", md: "5%" }} spacing={1}>
                    <Text fontWeight="bold" fontSize="md">Tasks Completed: {userInfo.tasksCompleted}</Text>
                    <Text fontWeight="bold" fontSize="md">Total Votes: {userInfo.totalVotes}</Text>
                    <HStack spacing={1}>
                      <Text fontWeight="bold" fontSize="md">Joined:</Text>
                      <Text fontSize="sm">{userInfo.dateJoined}</Text>
                    </HStack>
                  </VStack>
                  <Spacer display={{ base: "none", md: "block" }} />
                  <VStack mt={{ base: 4, md: 1 }} align={{ base: 'center', md: 'flex-start' }} spacing={3} width={{ base: "100%", md: "auto" }}>
                    <Box mt="2" alignSelf="flex-start" mr="3">
                      <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
                    </Box>
                    {isExec && (
                      <>
                        <Button 
                          size="sm"
                          onClick={openExecutiveMenu}
                          alignSelf="start"
                          justifySelf="end"
                          colorScheme="teal"
                        >
                          Executive Menu
                        </Button>
                        <ExecutiveMenuModal isOpen={isExecutiveMenuOpen} onClose={closeExecutiveMenu} />
                      </>
                    )}
                  </VStack>
                </HStack>
                
              </Box>
              
              <Box w="100%" pt={4} borderRadius="2xl" bg="transparent" position="relative" zIndex={2}>
                <div style={glassLayerStyle} />
                <VStack pb={2} align="flex-start" position="relative" borderTopRadius="2xl">
                  <div style={glassLayerStyle} />
                  <Text pl={6} fontWeight="bold" fontSize={{ base: "xl", md: "2xl" }}>
                    {claimedTasks && claimedTasks.length > 0 ? 'Claimed Tasks' : 'Recommended Tasks'}
                  </Text>
                </VStack>
                <HStack spacing="3.5%" pb={2} ml={4} mr={4} pt={4} flexDir={{ base: "column", md: "row" }} align={{ base: "stretch", md: "flex-start" }}>
                  {((claimedTasks && claimedTasks.length > 0) ? claimedTasks : recommendedTasks)?.slice(0, 3).map((task) => (
                    <Box key={task.id} w={{ base: "100%", md: "31%" }} mb={{ base: 4, md: 0 }} _hover={{ boxShadow: "md", transform: "scale(1.07)"}} p={4} borderRadius="2xl" overflow="hidden" bg="black">
                      <Link2 href={`/tasks/?task=${task.id}&projectId=${encodeURIComponent(decodeURIComponent(task.projectId))}&userDAO=${userDAO}`}>
                        <VStack textColor="white" align="stretch" spacing={3}>
                          <Text fontSize="md" lineHeight="99%" fontWeight="extrabold">
                            {task.isIndexing ? 'Indexing...' : task.title}
                          </Text>
                          <HStack justify="space-between">
                            <Badge colorScheme="purple">{task.status}</Badge>
                            <Text fontWeight="bold">Payout {task.payout}</Text>
                          </HStack>
                        </VStack>
                      </Link2>
                    </Box>
                  ))}
                </HStack>
              </Box>
              <Box
                w="100%"
                pt={8}
                mb="2"
                borderRadius="2xl"
                bg="transparent"
                position="relative"
                zIndex={2}
              >
                <div style={glassLayerStyle} />
                <VStack pb={2} align="flex-start" position="relative" borderTopRadius="2xl">
                  <div style={glassLayerStyle} />
                  <Text pl={6} fontWeight="bold" fontSize={{ base: "xl", md: "2xl" }}>
                    {userProposals && userProposals.length > 0 ? 'My Proposals' : 'Ongoing Proposals'}{' '}
                  </Text>
                </VStack>
                <Box mt="4">
                  {userProposals && userProposals.length > 0 ? (
                    <UserProposals userProposals={userProposals} />
                  ) : (
                    <OngoingPolls OngoingPolls={ongoingPolls} />
                  )}
                </Box>
              </Box>
            </GridItem>
            <GridItem area={'completedtasks'} colSpan={2}>
              <Box
                w="100%"
                mt={2}
                borderRadius="2xl"
                bg="transparent"
                boxShadow="lg"
                position="relative"
                zIndex={2}
              >
                <div style={glassLayerStyle} />
                <VStack pb={2} align="flex-start" position="relative" borderTopRadius="2xl">
                  <div style={glassLayerStyle} />
                  <Text pl={6} fontWeight="bold" fontSize={{ base: "xl", md: "2xl" }}>
                    My Completed Tasks
                  </Text>
                </VStack>
                <HStack spacing="3.5%" pb={2} ml={4} mr={4} pt={4} flexDir={{ base: "column", md: "row" }} align={{ base: "stretch", md: "flex-start" }}>
                  {userData && userData.completedTasks && userData.completedTasks.length > 0 ? (
                    userData.completedTasks.map((task) => (
                      <Box key={task.id} w={{ base: "100%", md: "31%" }} mb={{ base: 4, md: 0 }} _hover={{ boxShadow: "md", transform: "scale(1.07)"}} p={4} borderRadius="2xl" overflow="hidden" bg="black">
                        <Link2 href={`/tasks/?task=${task.id}&projectId=${encodeURIComponent(decodeURIComponent(task.projectId))}`}>
                          <VStack textColor="white" align="stretch" spacing={3}>
                            <Text fontSize="md" lineHeight="99%" fontWeight="extrabold">
                              {task.isIndexing ? 'Indexing...' : task.title}
                            </Text>
                            <HStack justify="space-between">
                              <Badge colorScheme="purple">{task.status}</Badge>
                              <Text fontWeight="bold">Payout {task.payout}</Text>
                            </HStack>
                          </VStack>
                        </Link2>
                      </Box>
                    ))
                  ) : (
                    <Text pl={6} fontWeight="bold" fontSize="xl">
                      No completed tasks found.
                    </Text>
                  )}
                </HStack>
              </Box>
            </GridItem>
          </Grid>
        )}
      </Box>
    </>
  );


};

export default UserprofileHub;
