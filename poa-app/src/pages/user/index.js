import React, { useState, useEffect, useRef, useCallback } from "react";
import { useWeb3 } from "@/hooks";
import { usePOContext } from "@/context/POContext";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from 'next/router';
import {
  VStack,
  Text,
  Button,
  Input,
  Box,
  Flex,
  Heading,
  Container,
  Image,
  useColorModeValue,
  keyframes,
  Icon,
  Stack,
  useBreakpointValue,
  InputGroup,
  InputRightElement,
  Divider,
  Center,
  Badge,
  HStack,
  Grid,
  GridItem,
  Avatar,
  ScaleFade,
  Fade,
  SlideFade,
  Card,
  CardBody,
  useToast,
} from "@chakra-ui/react";
import Navbar from "@/templateComponents/studentOrgDAO/NavBar";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { motion } from "framer-motion";
import { FaWallet, FaUserPlus, FaUser, FaCheck, FaChevronRight, FaLink, FaInfoCircle, FaShieldAlt, FaRegLightbulb, FaUsers } from 'react-icons/fa';
import { BsFillLightningChargeFill } from 'react-icons/bs';

// Animation keyframes
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const MotionBox = motion(Box);

const User = () => {
  const { hasMemberRole, graphUsername } = useUserContext();
  const { address } = useAccount();
  const { quickJoinContractAddress, poDescription, logoHash } = usePOContext();
  const { organization, executeWithNotification } = useWeb3();
  const router = useRouter();
  const { userDAO } = router.query;
  const usernameInputRef = useRef(null);
  const toast = useToast();

  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [dispaly, setDispaly] = useState(true);
  const [isSSR, setIsSSR] = useState(true);
  const [showBenefits, setShowBenefits] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const textSize = useBreakpointValue({ base: "xl", md: "2xl" });
  const headingSize = useBreakpointValue({ base: "3xl", md: "4xl" });
  const benefitIconSize = useBreakpointValue({ base: 5, md: 6 });
  const buttonHeight = useBreakpointValue({ base: "54px", md: "60px" });
  const cardPadding = useBreakpointValue({ base: 4, md: 8 });
  const mainSpacing = useBreakpointValue({ base: 4, md: 6 });
  const formSpacing = useBreakpointValue({ base: 4, md: 6 });

  // Enhanced gradient background
  const bgGradient = useColorModeValue(
    'linear-gradient(135deg, #ffe8c3 0%, #ffd0d0 25%, #e1c4ff 50%, #c4e7ff 75%, #c4ffe1 100%)',
    'linear-gradient(135deg, #2d1f3d 0%, #1a1625 50%, #2a273f 100%)'
  );

  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(0, 0, 0, 0.6)');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = "teal.400";

  useEffect(() => {
    setIsSSR(false);
    setTimeout(() => {
      setAnimateForm(true);
    }, 100);
  }, [userDAO]);

  useEffect(() => {
    if (hasMemberRole) {
      router.push(`/profileHub/?userDAO=${userDAO}`);
    }
  }, [hasMemberRole, address]);

  const handleJoinWithUser = useCallback(async () => {
    if (!organization) return;

    setLoading(true);
    const result = await executeWithNotification(
      () => organization.quickJoinWithUser(quickJoinContractAddress),
      {
        pendingMessage: 'Joining organization...',
        successMessage: 'Successfully joined! Redirecting...',
        refreshEvent: 'member:joined',
      }
    );

    if (result.success) {
      router.push(`/profileHub/?userDAO=${userDAO}`);
    }
    setLoading(false);
  }, [organization, executeWithNotification, quickJoinContractAddress, router, userDAO]);

  const handleJoinNewUser = useCallback(async () => {
    if (!organization) return;

    if (!newUsername.trim()) {
      usernameInputRef.current.focus();
      toast({
        title: "Username required",
        description: "Please enter a username to continue",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setLoading(true);
    const result = await executeWithNotification(
      () => organization.quickJoinNoUser(quickJoinContractAddress, newUsername),
      {
        pendingMessage: 'Creating account and joining...',
        successMessage: 'Account created! Redirecting...',
        refreshEvent: 'user:created',
      }
    );

    if (result.success) {
      router.push(`/profileHub/?userDAO=${userDAO}`);
    }
    setLoading(false);
  }, [organization, executeWithNotification, quickJoinContractAddress, newUsername, router, userDAO, toast]);

  const benefits = [
    { 
      icon: FaUsers, 
      title: "Community Access", 
      description: "Become part of an exclusive community with shared goals and values." 
    },
    { 
      icon: FaShieldAlt, 
      title: "Governance Rights", 
      description: "Vote on important proposals and help shape the future of the organization." 
    },
    { 
      icon: BsFillLightningChargeFill, 
      title: "Earn Rewards", 
      description: "Complete tasks and participate in activities to earn tokens and recognition." 
    },
  ];

  if (isSSR) {
    return null;
  }

  return (
    <>
      <Navbar />
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex="-1"
        bgGradient={bgGradient}
        animation={`${gradientAnimation} 15s ease infinite`}
        backgroundSize="400% 400%"
        overflow="hidden"
      >
        {/* Abstract decorative elements */}
        <Box
          position="absolute"
          top="10%"
          left="5%"
          width="40vh"
          height="40vh"
          borderRadius="full"
          bgGradient="linear(to-r, teal.200, blue.200)"
          filter="blur(80px)"
          opacity="0.4"
        />
        <Box
          position="absolute"
          bottom="10%"
          right="5%"
          width="30vh"
          height="30vh"
          borderRadius="full"
          bgGradient="linear(to-r, purple.200, pink.200)"
          filter="blur(80px)"
          opacity="0.4"
        />
      </Box>

      <Container maxW="container.xl" pt={{ base: 16, md: 8 }}>
        {address ? (
          <Flex justify="flex-end" mb={4}>
            <ConnectButton showBalance={false} chainStatus="icon" />
          </Flex>
        ) : null}

        <Grid 
          templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
          gap={{ base: 4, md: 6 }}
          align="center"
          justify="center"
        >
          {/* Left side: Organization info or benefits */}
          <GridItem order={{ base: 2, lg: 1 }}>
            <ScaleFade in={true} initialScale={0.95} transition={{ enter: { duration: 0.3 } }}>
              <Card 
                bg={cardBg} 
                backdropFilter="blur(10px)" 
                borderRadius="xl" 
                boxShadow="xl"
                height="100%"
                borderWidth="1px"
                borderColor="rgba(255,255,255,0.1)"
              >
                <CardBody p={cardPadding}>
                  <VStack spacing={mainSpacing} align="flex-start">
                    <Heading 
                      as="h1" 
                      fontSize={{ base: "2xl", md: headingSize }} 
                      color={textColor}
                      bgGradient="linear(to-r, teal.400, blue.500)"
                      bgClip="text"
                    >
                      Join {userDAO}
                    </Heading>
                    
                    <HStack spacing={4}>
                      <Icon as={FaRegLightbulb} color="yellow.400" boxSize={benefitIconSize} />
                      <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} color={textColor}>Why Join?</Heading>
                    </HStack>
                    
                    <VStack spacing={{ base: 3, md: 4 }} align="stretch" width="100%">
                      {benefits.map((benefit, index) => (
                        <SlideFade in={true} delay={0.1 * index} key={index}>
                          <Flex 
                            p={{ base: 3, md: 4 }} 
                            borderRadius="md" 
                            bg={useColorModeValue('white', 'gray.800')} 
                            boxShadow="md"
                            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                            transition="all 0.2s"
                          >
                            <Center width={{ base: "40px", md: "50px" }}>
                              <Icon as={benefit.icon} color={accentColor} boxSize={benefitIconSize} />
                            </Center>
                            <Box ml={4} flex="1">
                              <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} color={textColor}>
                                {benefit.title}
                              </Text>
                              <Text color={useColorModeValue('gray.600', 'gray.300')} fontSize={{ base: "sm", md: "md" }}>
                                {benefit.description}
                              </Text>
                            </Box>
                          </Flex>
                        </SlideFade>
                      ))}
                    </VStack>
                    
                    <Divider />
                    
                    <Box>
                      <Text color={textColor} fontSize={{ base: "xs", md: "sm" }} fontStyle="italic">
                        Joining is a one-time process that creates your membership NFT.
                        This gives you access to all DAO features and benefits.
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </ScaleFade>
          </GridItem>

          {/* Right side: Join form */}
          <GridItem order={{ base: 1, lg: 2 }} mb={{ base: 4, lg: 0 }}>
            <ScaleFade in={animateForm} initialScale={0.95} delay={0.05} transition={{ enter: { duration: 0.3 } }}>
              <Card 
                bg={cardBg} 
                backdropFilter="blur(10px)" 
                borderRadius="xl" 
                boxShadow="xl"
                borderWidth="1px"
                borderColor="rgba(255,255,255,0.1)"
              >
                <CardBody p={cardPadding}>
                  {address ? (
                    <>
                      <VStack spacing={formSpacing} align="stretch">
                        <Box 
                          p={{ base: 3, md: 4 }} 
                          borderRadius="lg"
                          bg={useColorModeValue("green.50", "green.900")}
                          borderWidth="1px"
                          borderColor={useColorModeValue("green.200", "green.700")}
                        >
                          <Flex align="center" flexWrap="wrap">
                            <Icon as={FaCheck} color="green.500" mr={3} boxSize={isMobile ? 4 : 5} />
                            <Text color={textColor} fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>
                              Wallet Connected: {address.substring(0, 6)}...{address.substring(address.length - 4)}
                            </Text>
                          </Flex>
                        </Box>

                        <Box textAlign="center">
                          <MotionBox
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            display="inline-block"
                            mb={4}
                          >
                            <Icon as={FaUserPlus} color={accentColor} boxSize={{ base: 10, md: 12 }} />
                          </MotionBox>
                          <Heading size={{ base: "md", md: "lg" }} mb={{ base: 2, md: 4 }} color={textColor}>
                            Complete Your Membership
                          </Heading>
                          <Text color={useColorModeValue('gray.600', 'gray.300')} mb={{ base: 4, md: 6 }} fontSize={{ base: "sm", md: "md" }}>
                            You're one step away from joining {userDAO}. 
                            {dispaly && graphUsername ? " Use your existing account or create a new one." : " Create your new account."}
                          </Text>
                        </Box>

                        {dispaly && graphUsername ? (
                          <VStack spacing={{ base: 4, md: 6 }}>
                            <Button
                              size={isMobile ? "md" : "lg"}
                              colorScheme="teal"
                              width="100%"
                              height={buttonHeight}
                              fontSize={{ base: "md", md: "lg" }}
                              isLoading={loading}
                              loadingText="Joining..."
                              onClick={handleJoinWithUser}
                              leftIcon={<FaUser />}
                              _hover={{
                                transform: "translateY(-2px)",
                                boxShadow: "lg",
                              }}
                            >
                              Join with Existing Account
                            </Button>
                            
                            <Text textAlign="center" fontSize={{ base: "xs", md: "sm" }} color={useColorModeValue('gray.500', 'gray.400')}>
                              Your existing username will be used: <b>{graphUsername}</b>
                            </Text>
                            
                            <Divider />
                            
                            <Text textAlign="center" fontSize={{ base: "xs", md: "sm" }} color={useColorModeValue('gray.500', 'gray.400')}>
                              Or create a new account instead
                            </Text>
                            
                            <InputGroup size={isMobile ? "md" : "lg"}>
                              <Input
                                placeholder="Choose a new username"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                bg={useColorModeValue("white", "gray.800")}
                                borderColor={useColorModeValue("gray.300", "gray.600")}
                                _focus={{
                                  borderColor: "teal.400",
                                  boxShadow: "0 0 0 1px teal.400",
                                }}
                                ref={usernameInputRef}
                              />
                            </InputGroup>
                            
                            <Button
                              colorScheme="blue"
                              size={isMobile ? "md" : "lg"}
                              width="100%"
                              isLoading={loading && newUsername}
                              loadingText="Creating Account..."
                              onClick={handleJoinNewUser}
                              isDisabled={!newUsername}
                              rightIcon={<FaChevronRight />}
                              _hover={{
                                transform: "translateY(-2px)",
                                boxShadow: "lg",
                              }}
                            >
                              Create New Account & Join
                            </Button>
                          </VStack>
                        ) : (
                          <VStack spacing={{ base: 4, md: 6 }}>
                            <Text textAlign="center" fontSize={{ base: "sm", md: "md" }} color={textColor}>
                              Create your account to join {userDAO}
                            </Text>
                            
                            <InputGroup size={isMobile ? "md" : "lg"}>
                              <Input
                                placeholder="Choose a username"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                bg={useColorModeValue("white", "gray.800")}
                                borderColor={useColorModeValue("gray.300", "gray.600")}
                                _focus={{
                                  borderColor: "teal.400",
                                  boxShadow: "0 0 0 1px teal.400",
                                }}
                                ref={usernameInputRef}
                              />
                              <InputRightElement width="4.5rem">
                                <Icon 
                                  as={FaUser} 
                                  color={newUsername ? "green.500" : "gray.300"} 
                                />
                              </InputRightElement>
                            </InputGroup>
                            
                            <Button
                              colorScheme="teal"
                              size={isMobile ? "md" : "lg"}
                              width="100%"
                              height={buttonHeight}
                              fontSize={{ base: "md", md: "lg" }}
                              isLoading={loading}
                              loadingText="Creating Account..."
                              onClick={handleJoinNewUser}
                              isDisabled={!newUsername}
                              _hover={{
                                transform: "translateY(-2px)",
                                boxShadow: "lg",
                              }}
                              animation={newUsername ? `${pulse} 2s infinite` : undefined}
                            >
                              Create Account & Join {userDAO}
                            </Button>
                            
                            <Text fontSize={{ base: "xs", md: "sm" }} color={useColorModeValue('gray.600', 'gray.400')} textAlign="center">
                              This will create your membership NFT and profile
                            </Text>
                          </VStack>
                        )}
                      </VStack>
                    </>
                  ) : (
                    <VStack spacing={{ base: 6, md: 8 }} align="center">
                      <MotionBox
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Icon as={FaWallet} color={accentColor} boxSize={{ base: 12, md: 16 }} />
                      </MotionBox>
                      
                      <VStack spacing={{ base: 2, md: 3 }}>
                        <Heading size={{ base: "md", md: "lg" }} textAlign="center" color={textColor}>
                          Connect Your Wallet
                        </Heading>
                        <Text textAlign="center" color={useColorModeValue('gray.600', 'gray.300')} maxW="md" fontSize={{ base: "sm", md: "md" }}>
                          To join {userDAO} and access the Profile Hub, please connect your wallet first.
                        </Text>
                      </VStack>
                      
                      <Box
                        p={{ base: 1.5, md: 2 }}
                        borderRadius="xl"
                        bg={useColorModeValue("blue.50", "blue.900")}
                        borderWidth="1px"
                        borderColor={useColorModeValue("blue.200", "blue.700")}
                        width="100%"
                      >
                        <HStack spacing={1} justify="center" flexWrap="wrap">
                          <Icon as={FaInfoCircle} color="blue.500" boxSize={{ base: 3, md: 4 }} />
                          <Text fontSize={{ base: "xs", md: "sm" }} color={useColorModeValue('blue.700', 'blue.300')} textAlign="center">
                            Already a member? Connect to access your profile.
                          </Text>
                        </HStack>
                      </Box>
                      
                      <Box
                        p={{ base: 3, md: 4 }}
                        borderRadius="lg"
                        animation={`${pulse} 2s infinite`}
                      >
                        <ConnectButton 
                          showBalance={false} 
                          chainStatus={isMobile ? "none" : "icon"} 
                          accountStatus={isMobile ? "avatar" : "address"}
                          label="Connect Wallet"
                        />
                      </Box>
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </ScaleFade>
          </GridItem>
        </Grid>
      </Container>
    </>
  );
};

export default User;
