/**
 * TaskBoard
 * Main component for displaying and managing project tasks
 * Renders mobile or desktop view based on screen size
 */

import { useEffect, useRef } from 'react';
import { VStack, Box } from '@chakra-ui/react';
import { useTaskBoard } from '../../context/TaskBoardContext';
import TaskBoardMobile from './TaskBoardMobile';
import TaskBoardDesktop from './TaskBoardDesktop';
import ProjectHeader from './ProjectHeader';

const TaskBoard = ({
  columns,
  projectName,
  hideTitleBar,
  sidebarVisible,
  toggleSidebar,
  isDesktop = true, // Default to desktop to prevent flash
}) => {
  const { taskColumns, setTaskColumns } = useTaskBoard();
  // Use the stable isDesktop prop from MainLayout instead of our own breakpoint detection
  // This prevents flash when component remounts during project switches
  const isMobile = !isDesktop;
  const mobileRef = useRef(null);
  const desktopRef = useRef(null);

  // Sync columns from props
  useEffect(() => {
    setTaskColumns(columns);
  }, [columns, setTaskColumns]);

  return (
    <VStack w="100%" align="stretch" h="100%" spacing={0}>
      {/* Project header - only show in desktop view */}
      {isDesktop && (
        <ProjectHeader
          projectName={projectName}
          sidebarVisible={sidebarVisible}
          toggleSidebar={toggleSidebar}
        />
      )}

      {/* Task board content */}
      <Box
        flex="1"
        width="100%"
        height={{ base: "auto", md: "calc(100vh - 120px)" }}
        overflow={{ base: "visible", md: "hidden" }}
        mb={0}
      >
        {isMobile ? (
          <TaskBoardMobile
            ref={mobileRef}
            taskColumns={taskColumns}
            projectName={projectName}
          />
        ) : (
          <TaskBoardDesktop
            ref={desktopRef}
            taskColumns={taskColumns}
            projectName={projectName}
          />
        )}
      </Box>
    </VStack>
  );
};

export default TaskBoard;
