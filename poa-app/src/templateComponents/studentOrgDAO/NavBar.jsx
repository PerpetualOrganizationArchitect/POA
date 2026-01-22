import React from "react";
import { Box, Flex, Image, Link, IconButton, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, VStack, Text, Button, useBreakpointValue } from "@chakra-ui/react";
import { HamburgerIcon } from '@chakra-ui/icons';
import { FaHome } from 'react-icons/fa';
import NextLink from "next/link";
import { useRouter } from "next/router";
import LoginButton from "@/components/LoginButton";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { usePOContext } from "@/context/POContext";

const Navbar = () => {
  const router = useRouter();
  const { userDAO } = router.query;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { educationHubEnabled } = usePOContext();

  // Navigation items - conditionally include Learn & Earn based on educationHubEnabled
  const navItems = [
    { name: 'Dashboard', path: `/dashboard/?userDAO=${userDAO}` },
    { name: 'Tasks', path: `/tasks/?userDAO=${userDAO}` },
    { name: 'Voting', path: `/voting/?userDAO=${userDAO}` },
    ...(educationHubEnabled ? [{ name: 'Learn & Earn', path: `/edu-Hub/?userDAO=${userDAO}` }] : []),
  ];

  // Function to check active route
  const isActive = (path) => {
    const basePath = '/' + (router.pathname.split('/')[1] || '');
    return basePath === '/' + (path.split('/')[1] || '');
  };

  return (
    <Box 
      bg="black" 
      p={2.5} 
      alignItems={"center"}
      position={{ base: "fixed", md: "relative" }}
      top="0"
      left="0"
      zIndex={100}
      width="100%"
      boxShadow={{ base: "0px 1px 5px rgba(0,0,0,0.3)", md: "none" }}
      backdropFilter={{ base: "blur(10px)", md: "none" }}
      borderBottom={{ base: "1px solid rgba(255,255,255,0.1)", md: "none" }}
    >
      <Flex
        alignItems="center"
        h={{ base: "40px", md: "60px" }}
        maxW="100%"
        justifyContent="space-between"
      >
        {/* Left side - Logo (desktop) or Home icon (mobile) */}
        <Box h="100%" w={{ base: "40%", md: "12%" }} mr={{ base: "2", md: "4" }}>
          <Link as={NextLink} href={`/home/?userDAO=${userDAO}`} passHref>
            {/* Desktop Logo */}
            <Image
              src="/images/high_res_poa.png"
              alt="PoA Logo"
              height="111%"
              width="auto"
              objectFit="contain"
              display={{ base: 'none', md: 'block' }}
            />
            {/* Mobile Home Icon */}
            <IconButton
              icon={<FaHome size="34px" />}
              aria-label="Home"
              variant="ghost"
              color="white"
              display={{ base: 'flex', md: 'none' }}
              _hover={{ bg: "whiteAlpha.200" }}
              size="sm"
              p={0}
              mt={1}
            />
          </Link>
        </Box>
        
        {/* Center Logo for Mobile only */}
        <Flex 
          justify="center" 
          align="center" 
          position="absolute" 
          left="0" 
          right="0" 
          mx="auto"
          display={{ base: 'flex', md: 'none' }}
          pointerEvents="auto"
          h="100%"
          zIndex={1}
          width="40%"
        >
          <Link 
            href="https://poa.community" 
            isExternal 
            display="flex"
            justifyContent="center"
            alignItems="center"
            h="100%"
            w="100%"
          >
            <Image
              src="/images/high_res_poa.png"
              alt="PoA Logo"
              maxH="87%"
              width="auto"
              objectFit="contain"
            />
          </Link>
        </Flex>
        
        {/* Desktop Navigation */}
        <Flex
          justifyContent="space-between"
          flexGrow={1}
          ml={4}
          mr={4}
          alignItems="center"
          display={{ base: 'none', md: 'flex' }}
        >
          <Link as={NextLink} href={`/dashboard/?userDAO=${userDAO}`} color="white" fontWeight="extrabold" fontSize="xl" mx={"2%"}>
            Dashboard
          </Link>
          <Link
            as={NextLink}
            href={`/tasks/?userDAO=${userDAO}`}
            color="white"
            fontWeight="extrabold"
            fontSize="xl"
            mx={"2%"}
          >
            Tasks
          </Link>
          <Link
            as={NextLink}
            href={`/voting/?userDAO=${userDAO}`}
            color="white"
            fontWeight="extrabold"
            fontSize="xl"
            mx={"2%"}
          >
            Voting
          </Link>
          {educationHubEnabled && (
            <Link
              as={NextLink}
              href={`/edu-Hub/?userDAO=${userDAO}`}
              color="white"
              fontWeight="extrabold"
              fontSize="xl"
              mx={"2%"}
            >
              Learn & Earn
            </Link>
          )}
          <LoginButton />
        </Flex>

        {/* Mobile Hamburger Button */}
        <IconButton
          aria-label="Open menu"
          icon={<HamburgerIcon boxSize={6} />}
          size="lg"
          color="white"
          variant="ghost"
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          zIndex={20}
          position="relative"
          p={3}
          mx={1}
          _hover={{ bg: "whiteAlpha.300" }}
          _active={{ bg: "whiteAlpha.400" }}
          border="none"
          cursor="pointer"
        />
      </Flex>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay backdropFilter="blur(10px)" bg="rgba(0,0,0,0.7)" />
        <DrawerContent bg="rgba(20, 20, 25, 0.95)" backdropFilter="blur(10px)">
          <DrawerCloseButton color="white" />
          <DrawerHeader borderBottomWidth="1px" borderColor="rgba(255, 255, 255, 0.1)" color="white">
            <Flex align="center">
              <Image
                src="/images/high_res_poa.png"
                alt="PoA Logo"
                height="30px"
                width="auto"
                mr={2.5}
              />
              {userDAO}
            </Flex>
          </DrawerHeader>
          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch" w="100%">
              {navItems.map((item) => (
                <Link as={NextLink} key={item.name} href={item.path} passHref>
                  <Flex 
                    p={4}
                    align="center"
                    bg={isActive(item.path) ? "rgba(101, 184, 145, 0.1)" : "transparent"}
                    borderLeft={isActive(item.path) ? "4px solid #65B891" : "4px solid transparent"}
                    transition="all 0.2s ease"
                    _hover={{ bg: "whiteAlpha.100" }}
                    onClick={onClose}
                  >
                    <Text color="white" fontWeight={isActive(item.path) ? "bold" : "normal"}>
                      {item.name}
                    </Text>
                  </Flex>
                </Link>
              ))}
            </VStack>
            
            <Box p={6} mt={4}>
              <LoginButton />
              <Text fontSize="xs" color="whiteAlpha.600" mt={6} textAlign="center">
                Powered by PoA • {new Date().getFullYear()}
              </Text>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;
