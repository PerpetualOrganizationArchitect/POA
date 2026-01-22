import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Grid,
  GridItem,
  Text,
  HStack,
  Icon,
  Badge,
  Link,
  Image,
  Button,
  Spinner,
  Center,
  useBreakpointValue,
  Flex,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useVotingContext } from '@/context/VotingContext';
import { usePOContext } from '@/context/POContext';
import { useProjectContext } from '@/context/ProjectContext';
import { useUserContext } from '@/context/UserContext';
import Link2 from 'next/link';
import OngoingPolls from '@/components/userPage/OngoingPolls';
import { useRouter } from 'next/router';
import Navbar from "@/templateComponents/studentOrgDAO/NavBar";
import { FaLink } from 'react-icons/fa';
import { useIPFScontext } from "@/context/ipfsContext";

function generateOrgStructurePreview(poData, roleCount) {
  const {
    HybridVoting = null,
    DirectDemocracyVoting = null,
  } = poData;

  let descriptions = [];

  // Roles summary
  descriptions.push(
    <Text fontWeight="bold" fontSize="lg" key="roles-header" ml="2" mt="2">
      Roles
    </Text>
  );
  descriptions.push(
    <Text key="role-count" ml="2" mt="1">
      {roleCount > 0 ? `${roleCount} roles defined` : 'Roles loading...'}
    </Text>
  );

  // Voting summary
  descriptions.push(
    <Text fontWeight="bold" fontSize="lg" key="governance-header" ml="2" mt="3">
      Governance
    </Text>
  );

  if (HybridVoting) {
    descriptions.push(
      <Text key="hybrid" ml="2" mt="1">
        Hybrid Voting: {HybridVoting.quorum}% quorum
      </Text>
    );
  }
  if (DirectDemocracyVoting) {
    descriptions.push(
      <Text key="dd" ml="2" mt="1">
        Direct Democracy: {DirectDemocracyVoting.quorum}% quorum
      </Text>
    );
  }

  return descriptions;
}

const PerpetualOrgDashboard = () => {
  const { ongoingPolls } = useVotingContext();
  console.log("ongoingPolls", ongoingPolls);
  const { poContextLoading, poDescription, poLinks, logoHash, activeTaskAmount, completedTaskAmount, ptTokenBalance, poMembers, rules, educationModules, roleHatIds, educationHubEnabled } = usePOContext();

  const router = useRouter();
  const { userDAO } = router.query;
  const [imageURL, setImageURL] = useState({});
  const [imageFetched, setImageFetched] = useState(false);
  const [orgStructurePreview, setOrgStructurePreview] = useState([]);
  const { fetchImageFromIpfs } = useIPFScontext();

  // Responsive design breakpoints
  const isMobile = useBreakpointValue({ base: true, sm: true, md: false });
  const logoWidth = useBreakpointValue({ base: "160px", sm: "180px", md: "220px" });
  const headingSize = useBreakpointValue({ base: "2xl", sm: "3xl", md: "4xl" });
  const sectionHeadingSize = useBreakpointValue({ base: "xl", md: "2xl" });
  const textSize = useBreakpointValue({ base: "sm", md: "md" });
  const statsTextSize = useBreakpointValue({ base: "md", md: "lg" });

  useEffect(() => {
    const fetchImage = async () => {
      if (logoHash && !imageFetched) {
        const imageUrlFetch = await fetchImageFromIpfs(logoHash);
        setImageURL(imageUrlFetch);
        setImageFetched(true);
      }
    };
    fetchImage();
  }, [logoHash]);

  useEffect(() => {
    if (rules) {
      setOrgStructurePreview(generateOrgStructurePreview(rules, roleHatIds?.length || 0));
    }
  }, [rules, roleHatIds]);

  const { leaderboardDisplayData } = usePOContext();
  const { recommendedTasks } = useProjectContext();

  const getMedalColor = (rank) => {
    switch (rank) {
      case 0:
        return 'gold';
      case 1:
        return 'silver';
      case 2:
        return '#cd7f32';
      default:
        return null;
    }
  };

  const glassLayerStyle = {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: -1,
    borderRadius: 'inherit',
    backdropFilter: 'blur(70px)',
    backgroundColor: 'rgba(0, 0, 0, .79)',
  };

  const difficultyColorScheme = {
    easy: 'green',
    medium: 'yellow',
    hard: 'orange',
    veryhard: 'red'
  };

  return (
    <>
      <Navbar />
      {poContextLoading ? (
        <Center height="100vh">
          <Spinner size="xl" />
        </Center>
      ) : (
        <Box p={{ base: 2, md: 4 }} mt={{ base: 16, md: 0 }}>
            <Grid
              color="whitesmoke"
              templateAreas={{
                base: educationHubEnabled ? `
                  'orgInfo'
                  'orgStats'
                  'tasks'
                  'polls'
                  'leaderboard'
                  'orgStructure'
                  'learnAndEarn'
                ` : `
                  'orgInfo'
                  'orgStats'
                  'tasks'
                  'polls'
                  'leaderboard'
                  'orgStructure'
                `,
                md: educationHubEnabled ? `
                  'orgInfo orgStats'
                  'tasks polls'
                  'leaderboard orgStructure'
                  'learnAndEarn learnAndEarn'
                ` : `
                  'orgInfo orgStats'
                  'tasks polls'
                  'leaderboard orgStructure'
                `,
              }}
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
              gap={{ base: 3, md: 4 }}
            >
            <GridItem area={'orgInfo'}>
              <Box
                w={{ base: "100%", md: "125%" }}
                borderRadius="2xl"
                bg="transparent"
                boxShadow="lg"
                position="relative"
                zIndex={2}
              >
                <div style={glassLayerStyle} />
                <VStack pb={1} position="relative" borderTopRadius="2xl" align="flex-start">
                  <div style={glassLayerStyle} />
                  <HStack spacing={4}>
                    <Text pl={{ base: 3, md: 6 }} letterSpacing="-1%" fontSize={headingSize} fontWeight="bold">
                      {userDAO}'s Dashboard
                    </Text>
                  </HStack>
                </VStack>
                <Flex 
                  direction={{ base: "column", sm: "row" }} 
                  spacing={4} 
                  justify="space-between" 
                  w="100%" 
                  p={{ base: 3, md: 4 }}
                >
                  <Box pl={{ base: "0", md: "12px" }} mb={{ base: 3, sm: 0 }} alignSelf={{ base: "center", sm: "flex-start" }}>
                    <Image mb="0" src={imageURL} alt="Organization Logo" width={logoWidth} />
                  </Box>
                  <VStack ml={{ base: 0, sm: 2 }} align="flex-start" pr={{ base: 2, md: "10px" }} spacing={2} w="100%">
                    <Box>
                      <Text fontWeight={"bold"} fontSize={{ base: "lg", md: "xl" }} mt={0}>
                        Description:
                      </Text>
                      <Text mt="-1" fontSize={textSize} ml="2">
                        {poDescription}
                      </Text>
                    </Box>
                    <Box>
                      <HStack spacing={2} align="center">
                        <Icon as={FaLink} boxSize={4} />
                        <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                          Links
                        </Text>
                      </HStack>
                      <Wrap ml="4" mt="1" spacing={2} align="center">
                        {poLinks && poLinks.length > 0 ? (
                          poLinks.map((link, index) => (
                            <WrapItem key={index}>
                              <Text mt="-2" fontSize={textSize}>
                                <Link fontSize={{ base: "md", md: "xl" }} fontWeight={"bold"} href={link.url} isExternal color="blue.400">
                                  {link.name}
                                </Link>
                              </Text>
                            </WrapItem>
                          ))
                        ) : (
                          <Text fontSize={{ base: "md", md: "lg" }} mt={2}>No links available</Text>
                        )}
                      </Wrap>
                    </Box>
                  </VStack>
                </Flex>
              </Box>
            </GridItem>

            <GridItem area={'orgStats'}>
              <Box
                h="100%"
                ml={{ base: 0, md: "25%" }}
                w={{ base: "100%", md: "75%" }}
                borderRadius="2xl"
                bg="transparent"
                boxShadow="lg"
                position="relative"
                zIndex={2}
              >
                <div style={glassLayerStyle} />
                <VStack pb={1} align="flex-start" position="relative" borderTopRadius="2xl">
                  <div style={glassLayerStyle} />
                  <Text pl={{ base: 3, md: 6 }} fontWeight="bold" fontSize={sectionHeadingSize}>
                    Organization Stats
                  </Text>
                </VStack>
                <VStack mt="2" spacing={1.5} align="flex-start" ml={{ base: 4, md: 8 }}>
                  <HStack spacing={2}>
                    <Text mt="-1" fontSize={statsTextSize} fontWeight="bold">
                      Members:
                    </Text>
                    <Text mt="-1" fontSize={statsTextSize}>
                      {poMembers}
                    </Text>
                  </HStack>

                  <HStack spacing={2}>
                    <Text mt="-1" fontSize={statsTextSize} fontWeight="bold">
                      Total Participation Tokens:
                    </Text>
                    <Text mt="-1" fontSize={statsTextSize}>
                      {ptTokenBalance}
                    </Text>
                  </HStack>

                  <HStack spacing={2}>
                    <Text mt="-1" fontSize={statsTextSize} fontWeight="bold">
                      Active Tasks:
                    </Text>
                    <Text mt="-1" fontSize={statsTextSize}>
                      {activeTaskAmount}
                    </Text>
                  </HStack>

                  <HStack spacing={2}>
                    <Text mt="-1" fontSize={statsTextSize} fontWeight="bold">
                      Completed Tasks:
                    </Text>
                    <Text mt="-1" fontSize={statsTextSize}>
                     {completedTaskAmount}
                    </Text>
                  </HStack>

                  <HStack spacing={2}>
                    {/* <Text mt="-1" fontSize="lg" fontWeight="bold">
                      Treasury Balance:
                    </Text>
                    <Text mt="-1" fontSize="lg">
                      $12345
                    </Text> */}
                  </HStack>
                </VStack>

              </Box>
            </GridItem>

            <GridItem area={'tasks'}>
              <Box
                h="100%"
                w="100%"
                borderRadius="2xl"
                bg="transparent"
                boxShadow="lg"
                position="relative"
                zIndex={2}
              >
                <div style={glassLayerStyle} />
                <VStack pb={1} align="flex-start" position="relative" borderTopRadius="2xl">
                  <div style={glassLayerStyle} />
                  <Text pl={{ base: 3, md: 6 }} fontWeight="bold" fontSize={sectionHeadingSize}>
                    Recommended Tasks
                  </Text>
                </VStack>
                <Flex 
                  direction={{ base: "column", md: "row" }}
                  wrap={{ base: "nowrap", md: "wrap" }}
                  justify="space-between" 
                  gap={3}
                  pb={2} 
                  px={{ base: 3, md: 4 }} 
                  pt={2}
                >
                  {recommendedTasks?.slice(0, 3).map((task) => (
                    <Box 
                      key={task.id} 
                      w={{ base: "100%", md: "31%" }} 
                      mb={{ base: 2, md: 0 }}
                      _hover={{ boxShadow: "md", transform: "scale(1.02)" }} 
                      p={4} 
                      borderRadius="2xl" 
                      overflow="hidden" 
                      bg="black"
                    >
                      <Link2 href={`/tasks/?task=${task.id}&projectId=${encodeURIComponent(decodeURIComponent(task.projectId))}&userDAO=${userDAO}`}>
                        <VStack textColor="white" align="stretch" spacing={3}>
                          <Text mt="-2" fontSize={textSize} lineHeight="99%" fontWeight="extrabold">
                            {task.isIndexing ? 'Indexing...' : task.title}
                          </Text>
                          <HStack justify="space-between">
                            <Badge colorScheme="purple">{task.status}</Badge>
                            <Text fontWeight="bold">{task.payout} Tokens</Text>
                          </HStack>
                        </VStack>
                      </Link2>
                    </Box>
                  ))}
                </Flex>
              </Box>
            </GridItem>

            <GridItem area={'polls'}>
              <Box
               h="100%"
                w="100%"
                borderRadius="2xl"
                bg="transparent"
                boxShadow="lg"
                position="relative"
                zIndex={2}
              >
                <div style={glassLayerStyle} />
                <VStack pb={1} align="flex-start" position="relative" borderTopRadius="2xl">
                  <div style={glassLayerStyle} />
                  <Text pl={{ base: 3, md: 6 }} fontWeight="bold" fontSize={sectionHeadingSize}>
                    Ongoing Polls
                  </Text>
                </VStack>
                
                <Box w="100%" p={{ base: 2, md: 4 }}>
                  <OngoingPolls OngoingPolls={ongoingPolls} />
                </Box>
              </Box>
            </GridItem>

            <GridItem area={'leaderboard'}>
              <Link2 href={`/leaderboard?userDAO=${userDAO}`}>
                <Box
                  h="100%"
                  w="100%"
                  borderRadius="2xl"
                  bg="transparent"
                  boxShadow="lg"
                  position="relative"
                  zIndex={2}
                  _hover={{ boxShadow: "md", transform: "scale(1.02)" }}
                >
                  <div style={glassLayerStyle} />
                  <VStack pb={1} align="flex-start" position="relative" borderTopRadius="2xl">
                    <div style={glassLayerStyle} />
                    <Text pl={{ base: 3, md: 6 }} fontWeight="bold" fontSize={sectionHeadingSize}>
                      Leaderboard
                    </Text>
                  </VStack>
                  <Box p={{ base: 2, md: 4 }}>
                    {Array.isArray(leaderboardDisplayData) && leaderboardDisplayData.length > 0 ? (
                      leaderboardDisplayData.slice(0, 5).map((entry, index) => {
                        const medalColor = getMedalColor(index);
                        return (
                          <HStack 
                            ml={{ base: 2, md: 6 }} 
                            key={entry.id} 
                            spacing={{ base: 2, md: 4 }} 
                            alignItems="center"
                          >
                            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight={medalColor ? 'extrabold' : null} color={medalColor}>
                              {index + 1}
                            </Text>
                            <Text fontWeight={medalColor ? 'extrabold' : null} fontSize={{ base: "lg", md: "2xl" }}>{entry.name}</Text>
                            <Badge ml="2" fontSize={{ base: "sm", md: "md" }} colorScheme="blue">{entry.token} Tokens</Badge>
                          </HStack>
                        );
                      })
                    ) : (
                      <Text pl={{ base: 3, md: 6 }} fontSize={textSize} mt={2}>No leaderboard data available</Text>
                    )}
                  </Box>
                </Box>
              </Link2>
            </GridItem>

            <GridItem area={'orgStructure'}>
              <Box
                w="100%"
                borderRadius="2xl"
                bg="transparent"
                boxShadow="lg"
                position="relative"
                zIndex={2}
              >
                <div style={glassLayerStyle} />
                <VStack pb={1} align="flex-start" position="relative" borderTopRadius="2xl">
                  <div style={glassLayerStyle} />
                  <Text pl={{ base: 3, md: 6 }} fontWeight="bold" fontSize={sectionHeadingSize}>
                    Org Structure
                  </Text>
                </VStack>
                <Box pl={{ base: 3, md: 6 }} pr={{ base: 3, md: 6 }} pb={4}>
                  {orgStructurePreview}
                  <HStack mt="2" spacing={4} align="center">
                    <Link2 href={`/org-structure?userDAO=${userDAO}`}>
                      <Button
                        mt={2}
                        colorScheme="purple"
                        size={{ base: "xs", md: "sm" }}
                        ml="2"
                      >
                        View Full Structure
                      </Button>
                    </Link2>
                  </HStack>
                </Box>
              </Box>
            </GridItem>
            {educationHubEnabled && (
              <GridItem area={'learnAndEarn'}>
                <Box
                  h="100%"
                  w="100%"
                  borderRadius="2xl"
                  bg="transparent"
                  boxShadow="lg"
                  position="relative"
                  zIndex={2}
                >
                  <div style={glassLayerStyle} />
                  <VStack pb={1} align="flex-start" position="relative" borderTopRadius="2xl">
                    <div style={glassLayerStyle} />
                    <Text pl={{ base: 3, md: 6 }} fontWeight="bold" fontSize={sectionHeadingSize}>
                      Learn and Earn
                    </Text>
                  </VStack>
                  <Box p={{ base: 2, md: 4 }}>
                    {educationModules && educationModules.length > 0 ? (
                      <Flex
                        direction={{ base: "column", md: "row" }}
                        spacing={4}
                        gap={3}
                        align="flex-start"
                      >
                        {educationModules.slice(0,3).map((module) => (
                          <Box
                            key={module.id}
                            w={{ base: "100%", md: "33%" }}
                            h="auto"
                            p={4}
                            borderRadius="xl"
                            onClick={() => router.push(`/edu-Hub`)}
                            bg="black"
                            _hover={{ boxShadow: "md", transform: "scale(1.02)" }}
                            mb={{ base: 2, md: 0 }}
                          >

                              <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                                {module.isIndexing ? 'Indexing...' : module.name}
                              </Text>
                              <HStack mt={6} justifyContent="space-between">
                            {/* <Text mt={2}>{module.description}</Text> */}
                            <Link2 href={`/edu-Hub`}>

                              <Button colorScheme="teal" size={{ base: "xs", md: "sm" }}>
                                {module.isIndexing ? 'Coming Soon' : 'Start Module'}
                              </Button>

                            </Link2>
                            <Badge fontSize={{ base: "md", md: "lg" }} colorScheme="teal">{module.payout} Tokens</Badge>
                            </HStack>
                          </Box>
                        ))}
                      </Flex>
                    ) : (
                      <Text pl={{ base: 3, md: 6 }} fontSize={textSize} mt={2}>
                        No modules available at this time.
                      </Text>
                    )}
                  </Box>
                </Box>
              </GridItem>
            )}
          </Grid>
        </Box>
      )}
    </>
  );
};

export default PerpetualOrgDashboard;
