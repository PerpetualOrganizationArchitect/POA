import React, { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { AddIcon } from '@chakra-ui/icons';
import { Box, Heading, IconButton, Toast, Flex, Text } from '@chakra-ui/react';
import { useDrop } from 'react-dnd';
import TaskCard from './TaskCard';
import { useTaskBoard } from '../../context/TaskBoardContext';
import AddTaskModal from './AddTaskModal';
import { useAccount } from 'wagmi';
import {usePOContext} from '@/context/POContext';
import { useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useProjectContext } from '@/context/ProjectContext';
import { useUserContext } from '@/context/UserContext';
import { calculatePayout } from '../../util/taskUtils';
import { userCanCreateTask, userCanReviewTask, PERMISSION_MESSAGES, ROLE_INDICES } from '../../util/permissions';


const glassLayerStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  zIndex: -1,
  borderRadius: 'inherit',
  backdropFilter: 'blur(60px)',
  backgroundColor: 'rgba(0, 0, 0, .3)',
};




const TaskColumn = forwardRef(({ title, tasks, columnId, projectName, isMobile = false, isEmpty = false, hideTitleInMobile = false }, ref) => {
  const router = useRouter();
  const {userDAO} = router.query;
  const { moveTask, addTask, editTask } = useTaskBoard();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const { address: account } = useAccount();
  const { taskManagerContractAddress, roleHatIds } = usePOContext();
  const { taskCount, projectsData } = useProjectContext();
  const toast = useToast();
  const { graphUsername, hasMemberRole: userHasMemberRole, userData } = useUserContext();

  // Get user's current hat IDs for permission checking
  const userHatIds = userData?.hatIds || [];

  // Normalize hat IDs for comparison
  const normalizeHatId = (id) => String(id).trim();

  // Find the current project's role permissions
  const currentProject = useMemo(() => {
    return projectsData?.find(p => p.name === projectName || p.title === projectName);
  }, [projectsData, projectName]);

  const projectRolePermissions = currentProject?.rolePermissions || [];

  // Check if user has a non-member role (executive+)
  const hasNonMemberRole = useMemo(() => {
    if (!userHatIds.length || !roleHatIds?.length) return false;
    const normalizedUserHats = userHatIds.map(normalizeHatId);
    // roleHatIds[0] = member, roleHatIds[1] = executive, etc.
    if (roleHatIds.length > 1) {
      const nonMemberRoles = roleHatIds.slice(ROLE_INDICES.EXECUTIVE);
      return nonMemberRoles.some(roleId =>
        normalizedUserHats.includes(normalizeHatId(roleId))
      );
    }
    return false;
  }, [userHatIds, roleHatIds]);

  // Check if user can create tasks in this project
  // Falls back to checking if user has executive+ role when permissions are not configured
  const canCreateTask = useMemo(() => {
    const hasPermission = userCanCreateTask(userHatIds, projectRolePermissions);
    if (hasPermission) {
      console.debug('[TaskColumn] User has create permission via project role permissions');
      return true;
    }
    // Fallback: If no project permissions configured, check if user has executive+ role
    if (!projectRolePermissions?.length && hasNonMemberRole) {
      console.debug('[TaskColumn] No project permissions configured, falling back to executive role check');
      return true;
    }
    console.debug('[TaskColumn] User cannot create tasks');
    return false;
  }, [userHatIds, projectRolePermissions, hasNonMemberRole]);

  // Check if user can review tasks in this project
  // Falls back to checking if user has executive+ role when permissions are not configured
  const canReviewTask = useMemo(() => {
    const hasPermission = userCanReviewTask(userHatIds, projectRolePermissions);
    if (hasPermission) {
      console.debug('[TaskColumn] User has review permission via project role permissions');
      return true;
    }
    // Fallback: If no project permissions configured, check if user has executive+ role
    if (!projectRolePermissions?.length && hasNonMemberRole) {
      console.debug('[TaskColumn] No project permissions configured, falling back to executive role check');
      return true;
    }
    console.debug('[TaskColumn] User cannot review tasks');
    return false;
  }, [userHatIds, projectRolePermissions, hasNonMemberRole]);

  // Empty state icons and messages, moved from TaskBoard for consistency
  const emptyStateIcons = {
    'Open': '🚀',
    'In Progress': '⚙️',
    'Review': '🔍',
    'Completed': '🏆'
  };

  const emptyStateMessages = {
    'Open': 'Looks like a blank canvas! Create a task and start building something amazing.',
    'In Progress': 'No tasks in the works yet. Claim one from "Open" to show your skills!',
    'Review': 'Nothing to review at the moment. Good work happens before great feedback!',
    'Completed': 'The finish line is waiting for your first completed task. Keep pushing!'
  };

  let hasMemberRole = userHasMemberRole;
  const hasMemberRoleRef = useRef(hasMemberRole);
  const canReviewTaskRef = useRef(canReviewTask);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    handleOpenAddTaskModal: () => {
      if (title === 'Open') {
        if (canCreateTask) {
          setIsAddTaskModalOpen(true);
        } else {
          toast({
            title: 'Permission Required',
            description: PERMISSION_MESSAGES.REQUIRE_CREATE,
            status: 'warning',
            duration: 4000,
            isClosable: true,
            position: 'top',
          });
        }
      }
    }
  }), [title, canCreateTask, toast]);

  useEffect(() => {
    hasMemberRoleRef.current = hasMemberRole;
  }, [hasMemberRole]);

  useEffect(() => {
    canReviewTaskRef.current = canReviewTask;
  }, [canReviewTask]);

  
  const handleCloseAddTaskModal = () => {
    setIsAddTaskModalOpen(false);
  };
  
  const handleAddTask = (updatedTask) => {
    if (title === 'Open') {
      // Close modal immediately for optimistic UX
      handleCloseAddTaskModal();

      // addTask from TaskBoardContext handles:
      // - Payout calculation
      // - Optimistic UI update
      // - Blockchain transaction via TaskService
      // - Notifications and error handling
      // Fire and forget - don't await, let it run in background
      addTask(updatedTask, 'open').catch(error => {
        console.error("Error adding task:", error);
      });
    }
  };
  
  

  const handleEditTask = async (updatedTask, taskIndex) => {
    updatedTask = {
      ...updatedTask,
      difficulty: updatedTask.difficulty, 
      estHours: updatedTask.estHours, 
    };
    
    await editTask(updatedTask, columnId, taskIndex, projectName);

    toast ({
      title: "Task edited.",
      description: "Your task was successfully edited.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

  };

  // Enhanced drop behavior with debugging for tracing issues
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'task',
    canDrop: () => true, // Always allow dropping
    drop: async(item) => {
      console.log(`Attempting to drop in ${title} column:`, item);

      if (!hasMemberRoleRef.current && title != 'Completed') {
        toast({
          title: 'Membership Required',
          description: 'You must be a member to move tasks. Go to user page to join.',
          status: 'warning',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
      else if (!canReviewTaskRef.current && title === 'Completed') {
        toast({
          title: 'Permission Required',
          description: PERMISSION_MESSAGES.REQUIRE_REVIEW,
          status: 'warning',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
      // Note: Token minting is now handled automatically by the contract on task completion

      if (item.columnId === 'completed') {
        toast({
          title: 'Action Not Allowed',
          description: 'You cannot move tasks from the Completed column.',
          status: 'info',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        return;
      }

      if (item.columnId !== columnId) {
        const newIndex = tasks?.length || 0;
        
        const claimedByValue = title === 'In Progress' ? account : item.claimedBy;
        const claimerUserValue = title === 'In Progress' ? graphUsername : item.claimerUsername;
        
        console.log("Using username:", claimerUserValue);
        
        const draggedTask = {
          ...item,
          id: item.id,
          name: item.name,
          description: item.description,
          difficulty: item.difficulty,
          estHours: item.estHours,
          claimedBy: claimedByValue,
          claimerUsername: claimerUserValue,
        };
        
        console.log(`Moving task from ${item.columnId} to ${columnId}, index: ${newIndex}`);

        // Use the task's actual projectId (from subgraph), not constructed from projectName
        const safeProjectId = item.projectId ? encodeURIComponent(decodeURIComponent(item.projectId)) : '';

        // Use the router.query.userDAO to maintain consistency
        router.push({
          pathname: `/tasks/`,
          query: {
            userDAO: router.query.userDAO,
            projectId: safeProjectId,
            task: draggedTask.id
          }
        }, undefined, { shallow: true });
        
        try {
          await moveTask(draggedTask, item.columnId, columnId, newIndex, item.submission, claimedByValue);
          toast({
            title: "Task moved.",
            description: "Your task was successfully moved.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } catch (error) {
          console.error("Error moving task:", error);
          toast({
            title: "Error moving task.",
            description: "There was an issue moving the task. Please try again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  // Apply visual feedback for drop zones
  const columnStyle = isOver ? { 
    backgroundColor: 'rgba(123, 104, 238, 0.15)',
    transition: 'background-color 0.3s ease',
    boxShadow: 'inset 0 0 10px rgba(123, 104, 238, 0.3)'
  } : {};

  // Mobile-specific column header style
  const mobileHeaderStyle = {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  // Enhanced empty state style with drop zone highlighting
  const emptyStateStyle = {
    width: '100%',
    height: '100%',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    textAlign: 'center',
    backgroundColor: isOver ? 'rgba(123, 104, 238, 0.15)' : 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    border: isOver ? '1px dashed rgba(123, 104, 238, 0.5)' : '1px dashed rgba(255, 255, 255, 0.2)',
    margin: '0 auto 16px auto',
    transition: 'all 0.3s ease',
  };

  const handleOpenAddTaskModal = () => {
    if (title === 'Open') {
      if (canCreateTask) {
        setIsAddTaskModalOpen(true);
      } else {
        toast({
          title: 'Permission Required',
          description: PERMISSION_MESSAGES.REQUIRE_CREATE,
          status: 'warning',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
      }
    }
  };

  // Render the empty state content
  const renderEmptyState = () => (
    <Box style={emptyStateStyle}>
      <Text fontSize="3xl" mb={2}>
        {emptyStateIcons[title] || '✨'}
      </Text>
      <Text color="white" fontWeight="medium" fontSize="sm" mb={2}>
        {title}
      </Text>
      <Text color="whiteAlpha.700" fontSize="xs">
        {emptyStateMessages[title] || 'Drag tasks here to populate this column.'}
      </Text>
    </Box>
  );

  return (
    <Box
      ref={drop}
      w="100%"
      h="100%"
      minH={isMobile ? "500px" : "auto"}
      bg="transparent" 
      borderRadius="xl"
      boxShadow={isMobile ? "none" : "lg"}
      style={{ ...columnStyle, position: 'relative' }}
      zIndex={1}
      display="flex"
      flexDirection="column"
      data-column-id={columnId}
      data-column-title={title}
    >
      <div className="glass" style={glassLayerStyle} />
      
      {(!isMobile || (isMobile && !hideTitleInMobile)) && (
        <Heading size="md" mb={3} mt={0} ml={3} alignItems="center" color='white'>
          {title}
          {title === 'Open' && (
            <IconButton
              ml={8}
              icon={<AddIcon color="white" />}
              aria-label="Add task"
              onClick={handleOpenAddTaskModal}
              h="1.75rem"
              w="1.75rem"
              minW={0}
              bg="purple.500"
              _hover={{ bg: "purple.600" }}
              _active={{ bg: "purple.700" }}
              boxShadow="md"
              borderRadius="md"
            />
          )}
        </Heading>
      )}
      
      <Box
        h={isMobile ? "calc(100% - 3rem)" : "calc(100% - 3rem)"}
        borderRadius="md"
        bg="transparent"
        p={isMobile ? 1 : 2}
        style={columnStyle}
        overflowY={tasks && tasks.length > 0 ? "auto" : "hidden"}
        flex="1"
        width="100%"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
            background: 'rgba(0,0,0,0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '24px',
          },
        }}
      >
        {tasks && tasks.length > 0 ? (
          tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              id={task.id}
              name={task.name}
              description={task.description}
              difficulty={task.difficulty}
              estHours={task.estHours}
              submission={task.submission}
              claimedBy={task.claimedBy}
              Payout={task.Payout}
              claimerUsername={task.claimerUsername}
              columnId={columnId}
              projectId={task.projectId}
              onEditTask={(updatedTask) => handleEditTask(updatedTask, index)}
              isMobile={isMobile}
            />
          ))
        ) : (
          <Flex 
            justify="center" 
            align="center" 
            height="100%" 
            width="100%"
          >
            {renderEmptyState()}
          </Flex>
        )}
      </Box>

      {title === 'Open' && (
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={handleCloseAddTaskModal}
          onAddTask={handleAddTask}
        />
      )}
    </Box>
  );
});

export default TaskColumn;
  
 
