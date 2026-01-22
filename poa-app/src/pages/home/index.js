import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styled, { keyframes, css } from 'styled-components';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  Container,
  Image,
  Link,
  useBreakpointValue,
  HStack,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useColorModeValue,
  Divider,
  Badge,
  chakra,
} from "@chakra-ui/react";
import { HamburgerIcon } from '@chakra-ui/icons';
import Link2 from "next/link";
import { usePOContext } from "@/context/POContext";
import { useIPFScontext } from "@/context/ipfsContext";
import Navbar from "@/templateComponents/studentOrgDAO/NavBar";

// CSS for the wave animation (slowed down and more subtle)
const waveAnimation = keyframes`
  0% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(-50px) translateY(15px);
  }
  100% {
    transform: translateX(0) translateY(0);
  }
`;

// CSS for the floating effect
const floatingAnimation = keyframes`
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
`;

// Subtle pulse animation for buttons and interactive elements
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
`;

// Fade-in animation for content
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Improved wave background with peach/pink gradient but transparent base
const WaveBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: transparent;
  overflow: hidden;
  pointer-events: none;
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 150%;
    height: 150%;
    top: -25%;
    left: -25%;
    background: transparent; 
    animation: ${waveAnimation} 15s ease-in-out infinite;
    pointer-events: none;
  }
  
  &::after {
    top: 30%;
    left: 20%;
    background: radial-gradient(ellipse at center, rgba(232, 161, 232, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
    animation-delay: -5s;
    animation-duration: 20s;
  }
  
  @media (max-width: 768px) {
    height: 100%;
    &::before, &::after {
      opacity: 0.8;
    }
  }
`;

// Styled components with animations
const AnimatedBox = styled(Box)`
  animation: ${fadeIn} 0.8s ease-out forwards;
  animation-delay: ${props => props.delay || '0s'};
  opacity: 0;
`;

const PulseButton = styled(Button)`
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    animation: ${pulseAnimation} 2s infinite;
    box-shadow: 0 0 15px rgba(91, 212, 199, 0.5);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

// Enhanced hovering badge with subtle animation
const EnhancedBadge = styled(Box)`
  background: rgba(15, 15, 15, 0.7);
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.35em 0.8em;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    background: rgba(30, 30, 30, 0.8);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

// Artistic Card with refined glass effect
const GlassCard = styled(Box)`
  background: rgba(35, 30, 25, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: perspective(1000px) translateZ(0);
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
  }
  
  &:hover {
    transform: perspective(1000px) translateZ(10px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15) inset;
    border: 1px solid rgba(255, 255, 255, 0.25);
  }
  
  @media (max-width: 768px) {
    width: 92%;
    margin: 0 auto;
    background: rgba(35, 30, 25, 0.9);
  }
`;

// Dark artistic card
const DarkGlassCard = styled(Box)`
  background: rgba(10, 10, 10, 0.9);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: perspective(1000px) translateZ(0);
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
  }
  
  &:hover {
    transform: perspective(1000px) translateZ(10px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
  
  @media (max-width: 768px) {
    width: 92%;
    margin: 0 auto;
    background: rgba(10, 10, 10, 0.95);
  }
`;

// Refined button with animation and style
const ArtisticButton = styled(Button)`
  background: linear-gradient(135deg, #65B891 0%, #4C9A7A 100%);
  color: white;
  border-radius: 30px;
  border: none;
  padding: 0.7em 1.8em;
  font-weight: 600;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: 0.5s;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #59A583 0%, #3E8C6C 100%);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
`;

const Home = () => {
  const{logoHash, poDescription, poLinks} = usePOContext();

  const router = useRouter();
  const { userDAO } = router.query;

  const { fetchImageFromIpfs } = useIPFScontext();

  const [image, setImage] = useState(null);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isLoaded, setIsLoaded] = useState(false);

  // This ensures navbar gets rendered only after userDAO is available
  const [isNavbarReady, setIsNavbarReady] = useState(false);

  // Check and log poLinks to debug
  useEffect(() => {
    console.log('poLinks type:', typeof poLinks, poLinks);
  }, [poLinks]);

  useEffect(() => {
    // Set navbar ready when userDAO is available
    if (userDAO) {
      setIsNavbarReady(true);
    }
  }, [userDAO]);

  useEffect(() => {
    const fetchImage = async () => {
      console.log('logoHash', logoHash);
      if (logoHash) {
        const imageUrl = await fetchImageFromIpfs(logoHash);
        setImage(imageUrl);
      }
    };

    fetchImage();
    
    // Set loaded state after a short delay for animations
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [logoHash]);

  return (
    <>
      {/* Only render Navbar after userDAO is available to prevent undefined props */}
      {isNavbarReady && <Navbar userDAO={userDAO} />}
      
      <WaveBackground />
      
      <Box 
        pt={{ base: "80px", md: "100px" }} /* Increased to ensure content is below navbar */
        position="relative" 
        minH="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        zIndex={1} /* Ensure content is above background but below navbar */
      >
        <VStack 
          spacing={{ base: 8, md: 12 }} 
          w="100%" 
          px={4} 
          py={{ base: 6, md: 10 }}
          maxW="1200px"
          mx="auto"
        >
          <AnimatedBox 
            delay="0.1s" 
            width={{ base: "92%", md: "65%" }}
            display={isLoaded ? "block" : "none"}
            transform="translateZ(0)"
          >
            <GlassCard p={{ base: 6, md: 8 }}>
              <VStack spacing={5} align="center">
                <Heading 
                  as="h1" 
                  fontSize={{ base: "2xl", md: "4xl" }} 
                  color="white" 
                  textAlign="center"
                  letterSpacing="tight"
                  fontWeight="extrabold"
                  textShadow="0 2px 4px rgba(0,0,0,0.3)"
                  bgGradient="linear(to-r, white, #f0f0f0)"
                  bgClip="text"
                >
              Welcome to {userDAO} 
            </Heading>
                
                <Text 
                  fontSize={{ base: "md", md: "lg" }} 
                  color="white" 
                  textAlign="center"
                  px={{ base: 1, md: 6 }}
                  lineHeight="tall"
                  fontWeight="medium"
                  letterSpacing="0.3px"
                  maxW="760px"
                  mx="auto"
                >
                  A Perpetual Organization built with Poa. Fully owned and controlled 
                  by the {userDAO} community itself. Learn more about how to build your 
                  own censorship-resistant, fully community-owned organization at
                </Text>
                
                <Link2 href="https://poa.community">
                  <Text 
                    color="#79dcba" 
                    textAlign="center" 
                    fontSize={{ base: "md", md: "md" }}
                    fontWeight="bold"
                    textDecoration="underline"
                    _hover={{ color: "#8FEFD9", textDecoration: "none" }}
                    transition="all 0.3s ease"
                    letterSpacing="0.5px"
                  >
                    poa.community
            </Text>
                </Link2>
                
            <Link2 href={`/user/?userDAO=${userDAO}`}>
                  <ArtisticButton
                    size={{ base: "md", md: "lg" }}
                    mt={4}
                    mb={2}
              >
                Join or Login
                  </ArtisticButton>
            </Link2>
                
                <HStack mt={3} spacing={3} wrap="wrap" justify="center">
                  <EnhancedBadge>
                    <Box as="span" mr={1} fontSize="0.9em">🔗</Box> Decentralized
                  </EnhancedBadge>
                  <EnhancedBadge>
                    <Box as="span" mr={1} fontSize="0.9em">👥</Box> Community-Owned
                  </EnhancedBadge>
                  <EnhancedBadge>
                    <Box as="span" mr={1} fontSize="0.9em">🔍</Box> Transparent
                  </EnhancedBadge>
                </HStack>
              </VStack>
            </GlassCard>
          </AnimatedBox>

          <AnimatedBox 
            delay="0.3s" 
            width={{ base: "92%", md: "65%" }}
            display={isLoaded ? "block" : "none"}
            transform="translateZ(0)"
          >
            <DarkGlassCard p={{ base: 6, md: 8 }}>
              <VStack spacing={5} align="center">
                <Heading 
                  as="h2" 
                  fontSize={{ base: "xl", md: "2xl" }} 
                  color="white"
                  textAlign="center"
                  fontWeight="bold"
                  letterSpacing="wide"
                  bgGradient="linear(to-r, white, #f0f0f0)"
                  bgClip="text"
                >
              About {userDAO}
            </Heading>
                
            <Text
                  fontSize={{ base: "md", md: "md" }}
                  color="white"
              textAlign="left"
                  lineHeight="tall"
                  fontWeight="medium"
                  letterSpacing="0.3px"
                  maxW="760px"
                  mx="auto"
            >
              {poDescription}
            </Text>
                
                {image && (
                  <Box 
                    bg="rgba(255, 255, 255, 0.05)" 
                    p={4} 
                    borderRadius="xl" 
                    width={{ base: "70%", md: "50%" }}
                    mx="auto"
                    mt={4}
                    border="1px solid rgba(255, 255, 255, 0.1)"
                    transition="all 0.3s ease"
                    boxShadow="0 4px 12px rgba(0, 0, 0, 0.2)"
                    _hover={{
                      transform: "scale(1.02) translateY(-5px)",
                      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.2)"
                    }}
                  >
            <Image
              src={image}
              alt="Organization Logo"
                      width="100%"
              height="auto"
                      borderRadius="md"
                    />
                  </Box>
                )}
                
                {/* Social links or quick access buttons */}
                <HStack spacing={4} mt={2} wrap="wrap" justify="center">
                  <Button
                    size="sm"
                    variant="outline"
                    color="white"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    bg="rgba(255, 255, 255, 0.05)"
                    _hover={{ bg: "rgba(255, 255, 255, 0.1)", borderColor: "rgba(255, 255, 255, 0.3)" }}
                    leftIcon={<span>🌐</span>}
                    fontWeight="medium"
                    borderRadius="full"
                    boxShadow="0 2px 5px rgba(0,0,0,0.2)"
                    onClick={() => window.open(`https://poa.community`, '_blank')}
                  >
                    Website
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    color="white"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    bg="rgba(255, 255, 255, 0.05)"
                    _hover={{ bg: "rgba(255, 255, 255, 0.1)", borderColor: "rgba(255, 255, 255, 0.3)" }}
                    leftIcon={<span>📖</span>}
                    fontWeight="medium"
                    borderRadius="full"
                    boxShadow="0 2px 5px rgba(0,0,0,0.2)"
                    onClick={() => window.open(`https://docs.poa.community`, '_blank')}
                  >
                    Docs
                  </Button>
                </HStack>
              </VStack>
            </DarkGlassCard>
          </AnimatedBox>
          
          <Text 
            fontSize="xs" 
            color="rgba(0, 0, 0, 0.7)" 
            fontWeight="medium"
            textAlign="center"
            mt={8}
            display={isLoaded ? "block" : "none"}
            letterSpacing="0.5px"
            transition="all 0.3s ease"
            _hover={{ color: "rgba(0, 0, 0, 0.9)" }}
          >
            Powered by Poa • Built on Blockchain • Designed for Community
          </Text>
        </VStack>
        </Box>
    </>
  );
};

export default Home;
