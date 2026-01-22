import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Flex, Box, Heading, useMediaQuery, Select, Text, Button, VStack, HStack, IconButton, useDisclosure, Input, FormControl, FormLabel, Tooltip, Badge } from '@chakra-ui/react';
import { AddIcon, InfoIcon, ChevronDownIcon, ChevronRightIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import ProjectSidebar from './ProjectSidebar';
import TaskBoard from './TaskBoard';
import CreateProjectModal from './CreateProjectModal';
import { TaskBoardProvider } from '../../context/TaskBoardContext';
import { useDataBaseContext} from '../../context/dataBaseContext';
import { useIPFScontext } from '../../context/ipfsContext';
import { useAccount } from 'wagmi';
import { useWeb3 } from '../../hooks';
import { usePOContext } from '@/context/POContext';
import { useRouter } from 'next/router';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Enhanced styles for mobile project selector
const mobileHeaderStyle = {
  background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(20,20,20,0.75) 100%)',
  backdropFilter: 'blur(10px)',
  borderRadius: '8px',
  padding: '8px 12px',
  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  marginBottom: '3px',
  marginTop: '64px',
};

const MainLayout = () => {
  const {
    projects,
    selectedProject,
    setSelectedProject,
    handleUpdateColumns,
  } = useDataBaseContext();

  const { address: account } = useAccount();
  const { task: taskService, executeWithNotification } = useWeb3();
  const { taskManagerContractAddress, roleHatIds } = usePOContext();
  const { addToIpfs } = useIPFScontext();
  const router = useRouter();

  // Use useMediaQuery for more stable breakpoint detection
  // Returns [isMatch] where isMatch is false by default on SSR to prevent flash
  // Chakra's md breakpoint is 48em (768px)
  const [isMobileQuery] = useMediaQuery('(max-width: 47.99em)', { ssr: false, fallback: false });

  // Use stable state to prevent flash during re-renders
  // Only update when genuinely changing (prevents flicker from brief query glitches)
  const [isMobile, setIsMobile] = useState(false);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // On first load, set the value
    if (!isInitializedRef.current) {
      setIsMobile(isMobileQuery);
      isInitializedRef.current = true;
    } else if (isMobile !== isMobileQuery) {
      // Only update if genuinely different (debounce rapid changes)
      const timeoutId = setTimeout(() => {
        setIsMobile(isMobileQuery);
      }, 50); // Small delay to filter out render glitches
      return () => clearTimeout(timeoutId);
    }
  }, [isMobileQuery, isMobile]);

  const [showMobileProjectCreator, setShowMobileProjectCreator] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isProjectModalOpen, onOpen: onProjectModalOpen, onClose: onProjectModalClose } = useDisclosure();
  const [showHelp, setShowHelp] = useState(true);

  // State to track sidebar visibility
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleSelectProject = (projectId) => {
     // Decode first to handle any prior encoding, then encode properly
     const safeProjectId = encodeURIComponent(decodeURIComponent(projectId));

    router.push(`/tasks?projectId=${safeProjectId}&userDAO=${router.query.userDAO}`);
    console.log("selecting project",projectId);
    const selected = projects.find((project) => project.id === projectId);
    setSelectedProject(selected);
    console.log('selected', selected);
  };

  // Create project using the new service
  const handleCreateProject = useCallback(async (projectData) => {
    if (!taskService) return;

    console.log('=== handleCreateProject DEBUG ===');
    console.log('Raw projectData:', projectData);
    console.log('projectData type:', typeof projectData);

    // Handle both simple string (for backwards compat) and full object
    const isSimpleCreate = typeof projectData === 'string';
    const projectName = isSimpleCreate ? projectData : projectData.name;

    console.log('isSimpleCreate:', isSimpleCreate);
    console.log('projectName:', projectName);

    // Upload description to IPFS if provided
    let metadataHash = '';
    if (!isSimpleCreate && projectData.description && addToIpfs) {
      try {
        const result = await addToIpfs(JSON.stringify({ description: projectData.description }));
        metadataHash = result.path;
        console.log('IPFS metadataHash:', metadataHash);
      } catch (error) {
        console.warn('Failed to upload project metadata to IPFS:', error);
      }
    }

    // Get hat IDs for default permissions from org's roleHatIds
    // roleHatIds[0] = Member, roleHatIds[1] = Executive, etc.
    // Members can claim tasks, non-members (executives+) can create/review/assign
    const nonMemberHatIds = roleHatIds?.slice(1) || [];

    // For simple creates, assign default permissions based on org roles
    // All roles (member + non-member) can claim tasks
    // Non-member roles (executive+) can create, review, and assign
    const defaultClaimHats = roleHatIds || [];
    const defaultCreateHats = nonMemberHatIds;
    const defaultReviewHats = nonMemberHatIds;
    const defaultAssignHats = nonMemberHatIds;

    const createProjectData = {
      name: projectName,
      metadataHash,
      cap: isSimpleCreate ? 0 : (projectData.cap || 0),
      managers: isSimpleCreate ? [] : (projectData.managers || []),
      createHats: isSimpleCreate ? defaultCreateHats : (projectData.createHats || []),
      claimHats: isSimpleCreate ? defaultClaimHats : (projectData.claimHats || []),
      reviewHats: isSimpleCreate ? defaultReviewHats : (projectData.reviewHats || []),
      assignHats: isSimpleCreate ? defaultAssignHats : (projectData.assignHats || []),
    };

    console.log('Final createProjectData:', createProjectData);
    console.log('taskManagerContractAddress:', taskManagerContractAddress);
    console.log('=== END handleCreateProject DEBUG ===');

    await executeWithNotification(
      () => taskService.createProject(taskManagerContractAddress, createProjectData),
      {
        pendingMessage: 'Creating project...',
        successMessage: 'Project created successfully!',
        refreshEvent: 'project:created',
      }
    );
  }, [taskService, executeWithNotification, taskManagerContractAddress, addToIpfs, roleHatIds]);

  const handleCreateNewProject = () => {
    if (newProjectName.trim()) {
      handleCreateProject(newProjectName.trim());
      setNewProjectName('');
      setShowMobileProjectCreator(false);
      setShowHelp(false);
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Mobile project selection via dropdown with enhanced UX
  const renderMobileProjectSelector = () => {
    const hasProjects = projects && projects.length > 0;
    
    return (
      <Box w="100%" mb={1} py={0}>
        <VStack spacing={1} align="stretch">
          {/* Project Selection Header */}
          <Box style={mobileHeaderStyle}>
            <Flex justify="space-between" align="center" mb={1}>
              <Heading 
                size="sm" 
                color="white" 
                fontWeight="600"
                letterSpacing="wide"
              >
                {hasProjects ? 'Select Project' : 'Create Your First Project'}
              </Heading>

              {hasProjects && (
                <IconButton
                  size="sm"
                  icon={<AddIcon boxSize="14px" />}
                  colorScheme="purple"
                  variant="ghost"
                  onClick={() => setShowMobileProjectCreator(prev => !prev)}
                  aria-label="Create new project"
                  p={1}
                />
              )}
            </Flex>

            {hasProjects && !showMobileProjectCreator && (
              <Flex 
                bg="whiteAlpha.100" 
                p={1.5} 
                borderRadius="md" 
                align="center"
                border="1px solid rgba(255,255,255,0.1)"
                onClick={onOpen}
                cursor="pointer"
                _hover={{ bg: "whiteAlpha.200" }}
                mt={1}
                height="32px"
              >
                <Text color="white" fontWeight="medium" fontSize="sm" flex={1} noOfLines={1}>
                  {selectedProject?.name || "Select a project"}
                </Text>
                <ChevronDownIcon color="white" ml={1} boxSize="16px" />
              </Flex>
            )}

            {/* Show mobile project creator */}
            {showMobileProjectCreator && (
              <Flex mt={1} direction="column">
                <Input
                  placeholder="Project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  bg="whiteAlpha.100"
                  color="white"
                  size="sm"
                  height="32px"
                  _placeholder={{ color: "whiteAlpha.500" }}
                  mb={1}
                />
                <Button
                  colorScheme="purple"
                  onClick={handleCreateNewProject}
                  isDisabled={!newProjectName.trim()}
                  size="sm"
                  height="28px"
                >
                  Create Project
                </Button>
              </Flex>
            )}
          </Box>

          {/* First time help - only show when necessary and in very compact form */}
          {projects.length === 0 && showHelp && (
            <Box
              p={2}
              borderRadius="md"
              bg="rgba(0, 0, 0, 0.4)"
              borderWidth="1px"
              borderColor="purple.500"
              mt={1}
            >
              <Flex align="center" mb={0.5}>
                <InfoIcon color="purple.300" mr={1} boxSize="10px" />
                <Text color="white" fontWeight="medium" fontSize="xs">Getting Started</Text>
              </Flex>
              <Text color="whiteAlpha.800" fontSize="2xs">
                Create your first project to start organizing tasks for your team.
              </Text>
            </Box>
          )}

          {/* Project selection modal */}
          {isOpen && (
            <Box 
              position="fixed" 
              top="0" 
              left="0" 
              w="100%" 
              h="100%" 
              bg="rgba(0,0,0,0.7)" 
              zIndex={100}
              p={4}
              onClick={onClose}
            >
              <Box
                maxW="90%"
                maxH="80vh"
                mx="auto"
                mt="15vh"
                bg="rgba(30,30,40,0.95)"
                borderRadius="lg"
                p={3}
                boxShadow="0 10px 30px rgba(0,0,0,0.4)"
                border="1px solid rgba(255,255,255,0.1)"
                onClick={(e) => e.stopPropagation()}
                overflowY="auto"
              >
                <Heading size="sm" color="white" mb={2} textAlign="center">
                  Select Project
                </Heading>
                <VStack spacing={1}>
                  {projects.map(project => (
                    <Box
                      key={project.id}
                      w="100%"
                      p={2}
                      bg={selectedProject?.id === project.id 
                        ? "rgba(128, 90, 213, 0.2)" 
                        : "whiteAlpha.100"}
                      borderRadius="md"
                      cursor="pointer"
                      onClick={() => {
                        handleSelectProject(project.id);
                        onClose();
                      }}
                      _hover={{ bg: "whiteAlpha.200" }}
                      borderLeft={selectedProject?.id === project.id 
                        ? "3px solid" 
                        : "1px solid"}
                      borderColor={selectedProject?.id === project.id 
                        ? "purple.400" 
                        : "transparent"}
                    >
                      <Text color="white" fontSize="xs">{project.name}</Text>
                    </Box>
                  ))}
                  
                  <Button 
                    colorScheme="purple" 
                    variant="outline" 
                    size="xs" 
                    mt={1} 
                    leftIcon={<AddIcon boxSize={3} />}
                    onClick={() => {
                      setShowMobileProjectCreator(true);
                      onClose();
                    }}
                  >
                    Create New Project
                  </Button>
                </VStack>
              </Box>
            </Box>
          )}
        </VStack>
      </Box>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Flex 
        height="calc(100vh - 80px)"
        direction={{ base: "column", md: "row" }} 
        position="relative"
        overflow="hidden"
        mb={0}
      >
        {/* Only show the sidebar on desktop and when visible */}
        {!isMobile && sidebarVisible && (
          <Box position="relative">
            <ProjectSidebar
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={handleSelectProject}
              onOpenCreateModal={onProjectModalOpen}
              onToggleSidebar={toggleSidebar}
            />
          </Box>
        )}
        
        {/* Main content area */}
        <Box 
          flex="1"
          position="relative"
          overflow={isMobile ? "auto" : "hidden"} // Keep this scrollable on mobile
          height={isMobile ? "100%" : "auto"}
          width="100%"
          zIndex={2}
          transition="all 0.3s ease"
          display="flex"
          flexDirection="column"
          pb={isMobile ? "1px" : undefined} // Add extra padding at bottom for mobile
        >
          {/* Place mobile project selector inside the scrollable area */}
          {isMobile && (
            <Box width="100%" pt={2} px={2}>
              {renderMobileProjectSelector()}
            </Box>
          )}
          
          {selectedProject ? (
            <Box flex="1" width="100%" overflow={isMobile ? "visible" : "auto"}>
              <TaskBoardProvider 
                key={selectedProject.id}
                projectId={selectedProject.id}
                initialColumns={selectedProject.columns}
                account={account}
              >
                <TaskBoard 
                  columns={selectedProject.columns} 
                  projectName={selectedProject.name}
                  hideTitleBar={isMobile}
                  sidebarVisible={sidebarVisible}
                  toggleSidebar={toggleSidebar}
                  isDesktop={!isMobile}
                >
                </TaskBoard>
              </TaskBoardProvider>
            </Box>
          ) : projects.length > 0 ? (
            <Box flex="1" width="100%">
              <Flex 
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                height="100%"
                color="white"
                px={4}
                py={8}
                textAlign="center"
              >
                <Heading size="md" mb={2}>Select a Project</Heading>
                <Text fontSize="md" mb={4}>Choose a project from the dropdown above to view tasks</Text>
              </Flex>
            </Box>
          ) : (
            <Box flex="1" width="100%">
              <Flex
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                height="100%"
                color="white"
                px={4}
                py={8}
                textAlign="center"
              >
                <Heading size="md" mb={2}>Create Your First Project</Heading>
                <Text fontSize="md" mb={4}>Get started by creating a project</Text>
                <Button
                  colorScheme="purple"
                  onClick={onProjectModalOpen}
                  leftIcon={<AddIcon />}
                >
                  Create Project
                </Button>
              </Flex>
            </Box>
          )}
        </Box>
      </Flex>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={onProjectModalClose}
        onCreateProject={handleCreateProject}
      />
    </DndProvider>
  );
};

export default MainLayout;

