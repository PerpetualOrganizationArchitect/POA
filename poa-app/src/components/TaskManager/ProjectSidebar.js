import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  Input,
  FormControl,
  Spacer,
  Flex,
  Text,
  Icon,
  Divider,
  InputGroup,
  InputRightElement,
  useColorModeValue,
  Tooltip,
  IconButton,
  Collapse,
  useToast,
} from '@chakra-ui/react';
import { useWeb3 } from '../../hooks';
import { useDataBaseContext } from '@/context/dataBaseContext';
import DraggableProject from './DraggableProject';
import TrashBin from './TrashBin';
import { usePOContext } from '@/context/POContext';
import { useUserContext } from '@/context/UserContext';
import { useProjectContext } from '@/context/ProjectContext';
import { AddIcon, SearchIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import { PERMISSION_MESSAGES, ROLE_INDICES } from '../../util/permissions';

const glassLayerStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  zIndex: -1,
  borderRadius: 'inherit',
  backdropFilter: 'blur(15px)',
  backgroundColor: 'rgba(0, 0, 0, .85)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
};

const ProjectSidebar = ({ projects, selectedProject, onSelectProject, onOpenCreateModal, onToggleSidebar }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showProjects, setShowProjects] = useState(true);
  const { userData } = useUserContext();
  const { projectsData } = useProjectContext();
  const { task: taskService, executeWithNotification } = useWeb3();
  const toast = useToast();

  const { taskManagerContractAddress, roleHatIds, creatorHatIds } = usePOContext();

  // Get user's current hat IDs for permission checking
  const userHatIds = userData?.hatIds || [];

  // Normalize hat IDs for comparison
  const normalizeHatId = (id) => String(id).trim();

  // Check if user can create projects
  // Project creation requires one of the creatorHatIds from the TaskManager
  const canManageProjects = useMemo(() => {
    if (!userHatIds.length) {
      console.debug('[ProjectSidebar] No user hat IDs, cannot manage projects');
      return false;
    }

    // Normalize user's hat IDs for comparison
    const normalizedUserHats = userHatIds.map(normalizeHatId);

    // Check if user has one of the creatorHatIds from TaskManager
    if (creatorHatIds && creatorHatIds.length > 0) {
      const hasCreatorHat = creatorHatIds.some(creatorHatId =>
        normalizedUserHats.includes(normalizeHatId(creatorHatId))
      );
      if (hasCreatorHat) {
        console.debug('[ProjectSidebar] User has a creator hat, can manage projects');
        return true;
      }
    }

    // Fallback: Check if user has a non-member role (executive or higher)
    // This is for backwards compatibility when creatorHatIds aren't indexed yet
    if (roleHatIds && roleHatIds.length > 1 && (!creatorHatIds || creatorHatIds.length === 0)) {
      const nonMemberRoles = roleHatIds.slice(ROLE_INDICES.EXECUTIVE);
      const hasNonMemberRole = nonMemberRoles.some(roleId =>
        normalizedUserHats.includes(normalizeHatId(roleId))
      );
      if (hasNonMemberRole) {
        console.debug('[ProjectSidebar] User has executive+ role (fallback), can manage projects');
        return true;
      }
    }

    // If no creatorHatIds configured and no projects exist, allow members to create first project
    if ((!creatorHatIds || creatorHatIds.length === 0) && !projectsData?.length && userHatIds.length > 0) {
      console.debug('[ProjectSidebar] No creatorHatIds configured and no projects, allowing first project creation');
      return true;
    }

    console.debug('[ProjectSidebar] User cannot manage projects - no creator hat found');
    return false;
  }, [userHatIds, projectsData, roleHatIds, creatorHatIds]);

  const handleCreateProject = () => {
    if (canManageProjects) {
      onOpenCreateModal();
    } else {
      toast({
        title: 'Permission Required',
        description: PERMISSION_MESSAGES.PROJECT_MANAGE_EXEC,
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  // Delete project using the new service
  const onDeleteProject = useCallback(async (projectId) => {
    if (!canManageProjects) {
      toast({
        title: 'Permission Required',
        description: PERMISSION_MESSAGES.REQUIRE_CREATE,
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    if (!taskService) return;

    await executeWithNotification(
      () => taskService.deleteProject(taskManagerContractAddress, projectId),
      {
        pendingMessage: 'Deleting project...',
        successMessage: 'Project deleted successfully!',
        refreshEvent: 'project:deleted',
      }
    );
  }, [canManageProjects, taskService, executeWithNotification, taskManagerContractAddress, toast]);

  // Filter projects based on search term
  const filteredProjects = searchTerm 
    ? projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : projects;

  return (
    <Box
      w="220px"
      marginRight={0}
      display="flex"
      flexDirection="column"
      bg="transparent"
      position="relative"
      zIndex={1}
      h="calc(100vh - 80px)"
      overflowY="auto"
      overflowX="hidden"
      borderRight="1px solid rgba(255, 255, 255, 0.08)"
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '24px',
        },
      }}
      transition="width 0.3s ease, transform 0.3s ease"
    >
      <div className="glass" style={glassLayerStyle} />
      
      {/* Header with gradient effect */}
      <Flex 
        direction="column" 
        align="center" 
        pt={5} 
        pb={3} 
        background="linear-gradient(180deg, rgba(41, 65, 171, 0.4) 0%, rgba(0, 0, 0, 0) 100%)"
      >
        <Flex 
          width="95%" 
          align="center" 
          justify="space-between"
          mb={2}
        >
          <Heading 
            textAlign="left" 
            fontSize="22px"
            color="white" 
            letterSpacing="wider"
            fontWeight="bold"
            textTransform="uppercase"
            textShadow="0 0 10px rgba(100, 149, 237, 0.5)"
            ml="10"
          >
            Projects
          </Heading>

          {/* Collapse sidebar button */}
          <IconButton
            aria-label="Collapse sidebar"
            icon={<ChevronLeftIcon />}
            size="sm"
            variant="ghost"
            colorScheme="blue"
            onClick={onToggleSidebar}
            title="Collapse sidebar"
          />
        </Flex>
        
        {/* Search input */}
        <InputGroup size="sm" width="95%" mt={1}>
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="whiteAlpha.100"
            border="1px solid rgba(255, 255, 255, 0.15)"
            borderRadius="md"
            color="white"
            _placeholder={{ color: "whiteAlpha.500" }}
            _hover={{ borderColor: "blue.300" }}
            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)" }}
          />
          <InputRightElement pointerEvents="none">
            <SearchIcon color="whiteAlpha.500" />
          </InputRightElement>
        </InputGroup>
      </Flex>
      
      <Divider borderColor="whiteAlpha.200" />
      
      {/* Projects list with improved spacing */}
      <Box flexGrow={1} overflowY="auto" p={3}>
        <VStack spacing={3} width="100%" align="center">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => {
              const isSelected = selectedProject && project.id === selectedProject.id;
              return (
                <DraggableProject
                  key={project.id}
                  project={project}
                  isSelected={isSelected}
                  onSelectProject={onSelectProject}
                  onDeleteProject={onDeleteProject}
                />
              );
            })
          ) : searchTerm ? (
            <Text color="whiteAlpha.600" fontSize="sm" pt={4}>
              No projects match your search
            </Text>
          ) : (
            <Text color="whiteAlpha.600" fontSize="sm" pt={4}>
              No projects available
            </Text>
          )}
        </VStack>
      </Box>
      
      <Divider borderColor="whiteAlpha.200" mt={2} />
      
      {/* Trash bin section */}
      <Box mt={2} mb={2}>
        <TrashBin onDeleteProject={onDeleteProject} />
      </Box>
      
      {/* Create project section */}
      <Flex direction="column" p={3} bg="whiteAlpha.050">
        <Button
          onClick={handleCreateProject}
          width="100%"
          size="md"
          colorScheme="blue"
          variant="solid"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(45, 134, 255, 0.4)"
          }}
          leftIcon={<AddIcon />}
          transition="all 0.2s ease"
        >
          Create Project
        </Button>
      </Flex>
    </Box>
  );
};

export default ProjectSidebar;
