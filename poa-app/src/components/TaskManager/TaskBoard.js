import { useEffect } from 'react';
import { Flex, Box , VStack, Text} from '@chakra-ui/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTaskBoard } from '../../context/TaskBoardContext';
import TaskColumn from './TaskColumn';

const glassLayerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '3xl',
  backdropFilter: 'blur(20px)',
  backgroundColor: 'rgba(0, 0, 0, .3)',
};

const TaskBoard = ({ columns, projectName }) => {
  const { taskColumns, setTaskColumns } = useTaskBoard();
  useEffect(() => {
    setTaskColumns(columns);
  }, [columns, setTaskColumns]);

  return (
    <DndProvider backend={HTML5Backend}>
      <VStack w="100%" align="stretch">
        <Box bg="purple.300" w="100%" p={2}  >
          <Text ml={5}  fontSize="2xl" fontWeight="bold" color="black">{projectName}</Text>
        </Box>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justifyContent="space-between"
        w="100%"
        overflowX="hidden"
        overflowY="hidden"
        minHeight={`calc(100vh - 148px)`}
        wrap={{ base: 'nowrap', md: 'nowrap' }}
        mt={0}
      >
        {taskColumns &&
          taskColumns.map((column) => (
            <Box
              key={column.id}
              flex="1 1 100%"
              mx={{ base: 0, md: .5 }}
              p={2}
              borderRadius="xl"
              position="relative"
              sx={glassLayerStyle}
            >
              <TaskColumn
                title={column.title}
                tasks={column.tasks}
                columnId={column.id}
                projectName={projectName}
                zIndex={1}
              />
            </Box>
          ))}
      </Flex>
      </VStack>
    </DndProvider>
  );
};

export default TaskBoard;
