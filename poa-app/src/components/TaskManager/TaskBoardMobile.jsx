/**
 * TaskBoardMobile
 * Mobile view for TaskBoard with swipe navigation
 */

import { useRef, forwardRef, useImperativeHandle } from 'react';
import { Box, VStack, HStack, Text, IconButton, Badge, Progress, Flex } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, AddIcon, InfoIcon } from '@chakra-ui/icons';
import TaskColumn from './TaskColumn';
import EmptyColumnState from './EmptyColumnState';
import { useSwipeNavigation } from '../../hooks/useSwipeNavigation';
import { mobileGlassStyle, mobileNavGlassStyle, infoPopupStyle } from './styles/taskBoardStyles';

const TaskBoardMobile = forwardRef(({
  taskColumns,
  projectName,
}, ref) => {
  const taskColumnsRef = useRef([]);

  const {
    activeIndex,
    showGuide,
    dismissGuide,
    navigateNext,
    navigatePrev,
    canNavigateNext,
    canNavigatePrev,
    touchHandlers,
    containerRef,
  } = useSwipeNavigation({
    itemCount: taskColumns?.length || 0,
    initialIndex: 0,
  });

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getActiveIndex: () => activeIndex,
    getColumnRef: (index) => taskColumnsRef.current[index],
  }), [activeIndex]);

  const currentColumn = taskColumns && taskColumns[activeIndex];
  const columnTitle = currentColumn?.title || '';
  const columnId = currentColumn?.id || '';
  const hasNoTasks = currentColumn?.tasks?.length === 0;

  const getTaskCount = (colId) => {
    const column = taskColumns?.find(col => col.id === colId);
    return column?.tasks?.length || 0;
  };

  const handleAddTask = () => {
    const columnRef = taskColumnsRef.current[activeIndex];
    if (columnRef && columnRef.handleOpenAddTaskModal) {
      columnRef.handleOpenAddTaskModal();
    }
  };

  return (
    <Box
      w="100%"
      h="100%"
      position="relative"
      ref={containerRef}
      {...touchHandlers}
      style={{ touchAction: 'pan-y' }}
    >
      <VStack
        spacing={0}
        align="stretch"
        w="100%"
        h="100%"
      >
        {/* Navigation header */}
        <Box
          sx={mobileNavGlassStyle}
          mx={2}
          mb={2}
          mt={1}
          overflow="hidden"
        >
          <HStack spacing={3} py={2} px={3} w="100%" align="center" justify="space-between" overflow="visible">
            <IconButton
              icon={<ChevronLeftIcon />}
              onClick={navigatePrev}
              isDisabled={!canNavigatePrev}
              aria-label="Previous column"
              size="sm"
              colorScheme="purple"
              variant="ghost"
            />

            <Text
              fontSize="md"
              fontWeight="bold"
              textAlign="center"
              color="white"
              flex={1}
              noOfLines={1}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {columnTitle}
              <Badge ml={2} colorScheme="purple" fontSize="0.7em">
                {getTaskCount(columnId)}
              </Badge>
              {columnTitle === 'Open' && (
                <IconButton
                  ml={3}
                  icon={<AddIcon color="white" boxSize="1em" />}
                  aria-label="Add task mobile"
                  onClick={handleAddTask}
                  size="sm"
                  minW="24px"
                  minH="20px"
                  p={0}
                  bg="purple.500"
                  _hover={{ bg: "purple.600" }}
                  _active={{ bg: "purple.700" }}
                  boxShadow="0px 3px 6px rgba(0, 0, 0, 0.2)"
                  borderRadius="md"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  verticalAlign="middle"
                  transform="translateY(0px)"
                />
              )}
            </Text>

            <IconButton
              icon={<ChevronRightIcon />}
              onClick={navigateNext}
              isDisabled={!canNavigateNext}
              aria-label="Next column"
              size="sm"
              colorScheme="purple"
              variant="ghost"
            />
          </HStack>
        </Box>

        {/* Progress indicator */}
        <Progress
          value={(activeIndex / (taskColumns.length - 1)) * 100}
          size="xs"
          colorScheme="purple"
          bg="whiteAlpha.100"
          mt={0}
          mb={1}
          mx={2}
          borderRadius="full"
        />

        {/* Column content */}
        <Box
          px={2}
          position="relative"
          flex="1"
          display="flex"
          flexDirection="column"
          h="100%"
          minH="calc(100vh - 200px)"
        >
          <Box
            position="relative"
            zIndex={1}
            borderRadius="md"
            display="flex"
            flexDirection="column"
            flex="1"
            h="100%"
            sx={mobileGlassStyle}
            p={2}
          >
            {hasNoTasks ? (
              <Flex direction="column" h="100%" align="center" justify="flex-start" pt={4}>
                <EmptyColumnState columnType={columnTitle} />
                <Box flex="1" w="100%" minH="300px" />
              </Flex>
            ) : (
              <TaskColumn
                ref={el => taskColumnsRef.current[activeIndex] = el}
                title={columnTitle}
                tasks={currentColumn?.tasks || []}
                columnId={columnId}
                projectName={projectName}
                zIndex={1}
                isMobile={true}
                hideTitleInMobile={true}
              />
            )}
          </Box>
        </Box>
      </VStack>

      {/* Swipe guide overlay */}
      {showGuide && (
        <Box
          position="absolute"
          top="60%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={10}
          style={infoPopupStyle}
          onClick={dismissGuide}
        >
          <InfoIcon color="purple.300" mb={2} boxSize="16px" />
          <Text color="gray.800" fontSize="sm" fontWeight="medium">
            Swipe left or right to navigate between columns
          </Text>
          <Text color="gray.600" fontSize="2xs" mt={1}>
            This message will disappear shortly
          </Text>
        </Box>
      )}
    </Box>
  );
});

TaskBoardMobile.displayName = 'TaskBoardMobile';

export default TaskBoardMobile;
