/**
 * ProjectHeader
 * Header bar showing project name with sidebar toggle
 */

import { Box, Flex, Text, IconButton, Tooltip } from '@chakra-ui/react';
import { FaProjectDiagram } from 'react-icons/fa';

const ProjectHeader = ({ projectName, sidebarVisible, toggleSidebar }) => {
  return (
    <Box
      bg="purple.300"
      w="100%"
      p={2}
      height="auto"
    >
      <Flex align="center" justify="space-between" h="100%">
        <Flex align="center" h="100%">
          {!sidebarVisible && (
            <Tooltip label="Show projects sidebar" placement="right" hasArrow>
              <IconButton
                aria-label="Show projects sidebar"
                icon={<FaProjectDiagram size="16px" />}
                size="sm"
                variant="ghost"
                colorScheme="blackAlpha"
                mr={2}
                onClick={toggleSidebar}
                _hover={{
                  bg: "blackAlpha.200",
                  transform: "scale(1.1)"
                }}
                transition="all 0.2s"
              />
            </Tooltip>
          )}
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color="black"
            lineHeight="normal"
          >
            {projectName}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default ProjectHeader;
