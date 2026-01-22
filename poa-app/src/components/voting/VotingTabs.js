import React from "react";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  Box,
  useBreakpointValue,
  Tooltip,
  VStack,
  Text,
} from "@chakra-ui/react";

const glassLayerStyle = {
  position: "absolute",
  height: "100%",
  width: "100%",
  zIndex: -1,
  borderRadius: "inherit",
  backdropFilter: "blur(20px)",
  backgroundColor: "rgba(0, 0, 0, .8)",
  boxShadow: "inset 0 0 15px rgba(148, 115, 220, 0.15)",
  border: "1px solid rgba(148, 115, 220, 0.2)",
};

const VotingTabs = ({ 
  selectedTab, 
  handleTabsChange, 
  PTVoteType, 
  children 
}) => {
  // Use responsive sizing based on breakpoints
  const tabFontSize = useBreakpointValue({ base: "md", sm: "xl", md: "2xl" });
  const tabPadding = useBreakpointValue({ base: 2, sm: 3, md: 4 });
  const listPadding = useBreakpointValue({ base: 3, sm: 4, md: 6 });
  
  return (
    <Tabs
      index={selectedTab}
      isFitted
      variant="soft-rounded"
      onChange={handleTabsChange}
      mb={{ base: 4, md: 6 }}
    >
      <TabList
        alignItems="center"
        justifyContent="center"
        borderRadius="3xl"
        boxShadow="lg"
        p={listPadding}
        w="100%"
        mx="auto"
        maxW="1440px"
        bg="transparent"
        position="relative"
        display="flex"
        zIndex={0}
        color="rgba(333, 333, 333, 1)"
        spacing={4}
      >
        <Box 
          className="glass" 
          style={glassLayerStyle} 
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          borderRadius="inherit"
          zIndex={-1}
        />
        <Tooltip
          label="One person, one vote — equal voice for all members"
          placement="bottom"
          hasArrow
          bg="gray.700"
          openDelay={500}
        >
          <Tab
            fontSize={tabFontSize}
            fontWeight="extrabold"
            color="rgba(333, 333, 333, 1)"
            _selected={{
              backgroundColor: "rgba(148, 115, 220, 0.6)",
              color: "white",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(148, 115, 220, 0.4)"
            }}
            _hover={{
              backgroundColor: "rgba(148, 115, 220, 0.3)"
            }}
            borderRadius="xl"
            py={tabPadding}
            px={{ base: 2, md: 4 }}
            transition="all 0.3s ease"
            flex="1"
            minW={0}
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            overflow="hidden"
          >
            <VStack spacing={0}>
              <Text>Democracy</Text>
              <Text fontSize="xs" fontWeight="normal" opacity={0.7} display={{ base: "none", md: "block" }}>
                Equal votes
              </Text>
            </VStack>
          </Tab>
        </Tooltip>
        <Tooltip
          label={PTVoteType === "Hybrid"
            ? "Combines membership equality with contribution recognition"
            : "Voting power based on your contributions"
          }
          placement="bottom"
          hasArrow
          bg="gray.700"
          openDelay={500}
        >
          <Tab
            fontSize={tabFontSize}
            fontWeight="extrabold"
            color="rgba(333, 333, 333, 1)"
            _selected={{
              backgroundColor: "rgba(148, 115, 220, 0.6)",
              color: "white",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(148, 115, 220, 0.4)"
            }}
            _hover={{
              backgroundColor: "rgba(148, 115, 220, 0.3)"
            }}
            borderRadius="xl"
            py={tabPadding}
            px={{ base: 2, md: 4 }}
            transition="all 0.3s ease"
            flex="1"
            minW={0}
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            overflow="hidden"
          >
            <VStack spacing={0}>
              <Text>{PTVoteType}</Text>
              <Text fontSize="xs" fontWeight="normal" opacity={0.7} display={{ base: "none", md: "block" }}>
                {PTVoteType === "Hybrid" ? "Membership + Work" : "Contribution-based"}
              </Text>
            </VStack>
          </Tab>
        </Tooltip>
      </TabList>

      <TabPanels>
        {children}
      </TabPanels>
    </Tabs>
  );
};

export default VotingTabs; 