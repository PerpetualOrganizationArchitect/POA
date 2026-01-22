// src/pages/about/index.js
import React from "react";
import {
  Box,
  Flex,
  Button,
  VStack,
  HStack,
  Text,
  Image,
  Container,
  Heading,
  SimpleGrid,
  Icon,
  Divider,
  useColorModeValue,
  Badge,
  chakra,
} from "@chakra-ui/react";
import Layout from "../../components/Layout";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaRocket, FaUsers, FaLightbulb, FaGlobeAmericas, FaBook, FaPlus, FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";

// Motion components
const MotionBox = chakra(motion.div);
const MotionHeading = chakra(motion.h2);
const MotionText = chakra(motion.p);

const FeatureCard = ({ title, icon, children }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconBg = useColorModeValue('blue.50', 'blue.900');
  const iconColor = useColorModeValue('blue.600', 'blue.300');
  
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      bg={bg}
      p={{ base: 5, md: 6 }}
      borderRadius="lg"
      boxShadow="md"
      borderWidth="1px"
      borderColor={borderColor}
      height="100%"
      _hover={{ transform: "translateY(-5px)", boxShadow: "lg", transition: "all 0.3s ease" }}
    >
      <Flex direction="column" height="100%">
        <Flex mb={4} align="center">
          <Box
            p={2}
            borderRadius="md"
            bg={iconBg}
            color={iconColor}
            mr={3}
          >
            <Icon as={icon} boxSize={{ base: 5, md: 6 }} />
          </Box>
          <Heading as="h3" fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
            {title}
          </Heading>
        </Flex>
        <Text flex="1" fontSize={{ base: "sm", md: "md" }} lineHeight="tall">{children}</Text>
      </Flex>
    </MotionBox>
  );
};

const AboutPage = () => {
  const gradientBg = useColorModeValue(
    'linear(to-r, orange.100, pink.100)',
    'linear(to-r, gray.900, blue.900)'
  );
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const highlightColor = useColorModeValue('blue.500', 'blue.300');
  const dividerColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Layout>
      {/* Hero Section */}
      <Box
        mt="3"
        bgGradient={gradientBg}
        pt={{ base: 10, md: 20 }}
        pb={{ base: 8, md: 14 }}
      >
        <Container maxW="container.xl">
          <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between">
            <Box maxW={{ base: "100%", md: "50%" }} mb={{ base: 8, md: 0 }}>
              <MotionHeading
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                as="h1"
                fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                fontWeight="bold"
                lineHeight="shorter"
                mb={{ base: 4, md: 6 }}
                position="relative"
                display="inline-block"
              >
                What is{" "}
                <Text as="span" color={highlightColor}>
                  Poa?
                </Text>
                <Box 
                  position="absolute" 
                  bottom="-2px" 
                  left="0" 
                  width="60px" 
                  height="3px" 
                  bg={highlightColor} 
                  borderRadius="full" 
                  opacity="0.7"
                />
              </MotionHeading>
              
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                fontSize={{ base: "lg", md: "xl" }}
                color={textColor}
                maxW="600px"
                mb={4}
                lineHeight="1.7"
              >
                The Perpetual Organization Architect, or Poa, is a friendly chat bot
                that guides you through a no-code process of building a Perpetual
                Organization.
              </MotionText>
              
              <MotionHeading
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                as="h2"
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="bold"
                lineHeight="shorter"
                mb={2}
                mt={{ base: 4, md: 6 }}
                position="relative"
                display="inline-block"
              >
                What is a{" "}
                <Text as="span" color={highlightColor}>
                  Perpetual Organization?
                </Text>
                <Box 
                  position="absolute" 
                  bottom="-2px" 
                  left="0" 
                  width="60px" 
                  height="3px" 
                  bg={highlightColor} 
                  borderRadius="full" 
                  opacity="0.7"
                />
              </MotionHeading>
              
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                fontSize={{ base: "lg", md: "xl" }}
                color={textColor}
                maxW="600px"
                mb={4}
                lineHeight="1.7"
              >
                A Perpetual Organization is fully owned by the community, not investors, 
                making it truly democratic and unstoppable. This ensures the organization
                remains true to its mission, free from external pressures and resistant to censorship.
              </MotionText>
              
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                p={4}
                mt={2}
                mb={6}
                borderLeft="4px solid"
                borderColor={highlightColor}
                bg={useColorModeValue("blue.50", "blue.900")}
                borderRadius="md"
                boxShadow="sm"
                maxW="600px"
                display={{ base: "block", md: "none" }}
              >
                <Text 
                  fontWeight="bold" 
                  fontSize={{ base: "md", md: "xl" }}
                  fontStyle="italic"
                  pl={2}
                >
                  Building a future owned by People, not capital.
                </Text>
              </MotionBox>
              
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                display="flex"
                gap={4}
                flexWrap={{ base: "wrap", md: "nowrap" }}
              >
                <Link href="/docs" passHref>
                  <Button 
                    as="a" 
                    colorScheme="blue" 
                    size={{ base: "md", md: "lg" }}
                    width={{ base: "full", md: "auto" }}
                    rounded="full"
                    shadow="md"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                    leftIcon={<Icon as={FaBook} boxSize={5} />}
                  >
                    Explore our documentation
                  </Button>
                </Link>
                <Link href="/create" passHref>
                  <Button
                    as="a"
                    variant="outline"
                    colorScheme="blue"
                    size={{ base: "md", md: "lg" }}
                    width={{ base: "full", md: "auto" }}
                    rounded="full"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                    leftIcon={<Icon as={FaPlus} boxSize={5} />}
                  >
                    Create a PO
                  </Button>
                </Link>
              </MotionBox>
            </Box>
            
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              maxW={{ base: "70%", md: "40%" }}
              shadow="2xl"
              borderRadius="2xl"
              overflow="hidden"
              transform={{ md: "rotate(1deg)" }}
              _hover={{ 
                transform: { md: "rotate(0deg)" },
                transition: "transform 0.3s ease"
              }}
              display={{ base: "none", md: "block" }}
            >
              <Box
                p={4}
                borderLeft="4px solid"
                borderColor={highlightColor}
                bg={useColorModeValue("blue.50", "blue.900")}
                borderRadius="md"
                boxShadow="sm"
                mb={4}
              >
                <Text 
                  fontWeight="bold" 
                  fontSize={{ base: "md", md: "xl" }}
                  fontStyle="italic"
                  pl={2}
                >
                  Building a future owned by People, not capital.
                </Text>
              </Box>
              
              <Image 
                src="/images/high_res_poa.png" 
                alt="Poa character"
              />
            </MotionBox>
          </Flex>
        </Container>
      </Box>
      
      {/* Purpose Section */}
      <Box py={{ base: 8, md: 20 }}>
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <VStack spacing={{ base: 6, md: 8 }} align="center" mb={{ base: 10, md: 16 }}>
            <Badge colorScheme="blue" px={3} py={1} rounded="full" fontSize={{ base: "sm", md: "md" }}>Our Mission</Badge>
            <Heading 
              as="h2" 
              fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }} 
              textAlign="center"
              maxW="800px"
              px={{ base: 2, md: 0 }}
            >
              Simplifying Community-Driven Organizations
            </Heading>
            
            <Divider maxW="100px" borderWidth="2px" borderColor={dividerColor} />
            
            <Text 
              fontSize={{ base: "md", md: "lg", lg: "xl" }} 
              textAlign="center" 
              maxW="800px"
              color={textColor}
              px={{ base: 2, md: 0 }}
              lineHeight={{ base: 1.6, md: 1.7 }}
            >
              Poa aims to simplify the{" "}
              <Text as="span" fontWeight="bold" color={highlightColor}>
                Creation
              </Text>{" "}
              of and{" "}
              <Text as="span" fontWeight="bold" color={highlightColor}>
                Participation
              </Text>{" "}
              in fully Community-owned organizations by leveraging{" "}
              <Text as="span" fontWeight="bold" color={highlightColor}>
                AI
              </Text>{" "}
              for onboarding and{" "}
              <Text as="span" fontWeight="bold" color={highlightColor}>
                Decentralized technologies
              </Text>{" "}
              for the infrastructure.
            </Text>
          </VStack>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 6, md: 8 }} mb={{ base: 10, md: 16 }}>
            <FeatureCard title="Community Owned" icon={FaUsers}>
              We believe that votes should not be purchased but rather earned through participation or granted through Direct Democracy.
            </FeatureCard>
            
            <FeatureCard title="Fully Decentralized" icon={FaGlobeAmericas}>
              Full decentralization is our priority. We ensure that created Perpetual Organizations can't be stopped or changed by anyone but the community members.
            </FeatureCard>
            
            <FeatureCard title="AI-Powered" icon={FaLightbulb}>
              Leveraging AI to guide users through the creation process, making decentralized organization building accessible to everyone.
            </FeatureCard>
            
            <FeatureCard title="Ready for Growth" icon={FaRocket}>
              Currently in live Alpha stage deployed on Hoodi testnet, with continuous improvements on the way.
            </FeatureCard>
          </SimpleGrid>
        </Container>
      </Box>
      
      {/* Community Flow Section */}
      <Container maxW="container.md" py={{ base: 1, md: 2}} display={{ base: "none", md: "block" }}>
        <Box 
          bg={useColorModeValue('gray.50', 'gray.900')} 
          py={{ base: 10, md: 16 }}
          px={{ base: 6, md: 10 }}
          borderRadius="xl"
          boxShadow="sm"
          mx="auto"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.100', 'gray.700')}
        >
          <VStack spacing={8}>
            <Heading 
              as="h2" 
              fontSize={{ base: "2xl", md: "3xl" }} 
              textAlign="center"
              position="relative"
              pb={2}
            >
              The Perpetual Cycle
            </Heading>
            
            <Box
              maxW={{ base: "95%", md: "90%", lg: "85%" }}
              mx="auto"
              p={{ base: 8, md: 10 }}
              borderRadius="2xl"
              bg={useColorModeValue('white', 'gray.800')}
              shadow="xl"
              borderWidth="1px"
              borderColor={useColorModeValue('gray.100', 'gray.700')}
            >
              <VStack spacing={{ base: 1, md: 6 }}>
                <Flex 
                  width="100%"
                  justify="center"
                  align="center"
                  direction={{ base: "column", md: "row" }}
                  gap={{ base: 2, md: 4 }}
                >
                  <Text 
                    fontSize={{ base: "xl", md: "2xl", lg: "3xl" }} 
                    fontWeight="bold" 
                    color="navy.800"
                  >
                    Our Community
                  </Text>
                  
                  <Flex 
                    align="center" 
                    direction="column" 
                    px={{ base: 2, md: 4 }}
                    position="relative"
                    minW={{ base: "100px", md: "140px" }}
                  >
                    <Text 
                      color={highlightColor}
                      fontSize={{ base: "lg", md: "xl" }}
                      mb={-1}
                    >
                      ――――――▶
                    </Text>
                    <Text 
                      fontSize={{ base: "xs", md: "sm" }} 
                      color="blue.500"
                      mt={-1}
                    >
                      is building
                    </Text>
                  </Flex>
                  
                  <Text 
                    fontSize={{ base: "xl", md: "2xl", lg: "3xl" }} 
                    fontWeight="bold"
                    color={highlightColor}
                  >
                    Poa
                  </Text>
                </Flex>
                
                <Text fontSize="md" color="gray.500" textAlign="center" mb={-2}>so that</Text>
                
                <Flex 
                  width="100%"
                  justify="center"
                  align="center"
                  direction={{ base: "column", md: "row" }}
                >
                  <Text 
                    fontSize={{ base: "xl", md: "2xl", lg: "3xl" }} 
                    fontWeight="bold"
                    color={highlightColor}
                  >
                    Poa
                  </Text>
                  
                  <Flex 
                    align="center" 
                    direction="column" 
                    px={{ base: 2, md: 4 }}
                    position="relative"
                    minW={{ base: "100px", md: "140px" }}
                  >
                    <Text 
                      color={highlightColor}
                      fontSize={{ base: "lg", md: "xl" }}
                      mb={-1}
                    >
                      ――――――▶
                    </Text>
                    <Text 
                      fontSize={{ base: "xs", md: "sm" }} 
                      color="blue.500"
                      mt={-1}
                    >
                      can build
                    </Text>
                  </Flex>
                  
                  <Text 
                    fontSize={{ base: "xl", md: "2xl", lg: "3xl" }} 
                    fontWeight="bold"
                    color="navy.800"
                  >
                    Communities
                  </Text>
                </Flex>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Container>
      
      {/* CTA Section */}
      <Box py={{ base: 10, md: 16 }} px={{ base: 4, md: 0 }}>
        <Container maxW="container.md" textAlign="center">
          <VStack spacing={{ base: 6, md: 8 }}>
            <Heading 
              as="h2" 
              fontSize={{ base: "xl", md: "3xl" }} 
            >
              Join Our Community
            </Heading>
            
            <Text
              fontSize={{ base: "md", md: "lg" }}
              maxW="600px"
              mb={{ base: 4, md: 6 }}
              color={textColor}
            >
              Become part of a growing ecosystem of community-driven organizations. Connect with us to stay updated on the latest developments and opportunities.
            </Text>
            
            <HStack spacing={6} justify="center">
              <Link href="https://discord.gg/kKDKgetdNx" passHref>
                <Box 
                  as="a" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  transition="transform 0.3s"
                  _hover={{ transform: "scale(1.1)" }}
                >
                  <Image 
                    src="/images/discord.png" 
                    alt="Discord" 
                    boxSize={{ base: "50px", md: "60px" }}
                  />
                </Box>
              </Link>
              
              <Link href="https://twitter.com/PoaPerpetual" passHref>
                <Box 
                  as="a" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  transition="transform 0.3s"
                  _hover={{ transform: "scale(1.1)" }}
                >
                  <Image 
                    src="/images/x.png" 
                    alt="X (Twitter)" 
                    boxSize={{ base: "50px", md: "60px" }}
                  />
                </Box>
              </Link>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Layout>
  );
};

export default AboutPage;

// The Perpetual Organization Architect also known as Poa will be a
//           friendly chat bot that guides you through the process of building a no
//           code perpetual organization. It will explain what a perpetual
//           organization is, give a few examples, and expand on that info if you
//           request. Next, Poa will ask you what your idea for your organization
//           is and based off your response will walk you through and give specific
//           suggestion for picking a UI template, voting system, reward system,
//           and other features. At the end, it will display your selected features
//           and then deploy all necessary smart contracts and subgraph
//           information. There will eventually be a site to browse all the
//           perpetual organizations and open tasks so you can do work for an
//           organization without being a member. The last component is the
//           Perpetual Fund which will be a community run startup fund for
//           Perpetual Organizations.
