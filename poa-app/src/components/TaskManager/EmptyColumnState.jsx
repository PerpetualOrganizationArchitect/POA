/**
 * EmptyColumnState
 * Displays a friendly empty state message for task columns
 */

import { Box, Text } from '@chakra-ui/react';
import { emptyStateMessages, emptyStateIcons } from './styles/taskBoardStyles';

const EmptyColumnState = ({ columnType }) => (
  <Box
    width="100%"
    height="auto"
    minHeight="200px"
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    p={4}
    textAlign="center"
    bg="whiteAlpha.100"
    borderRadius="md"
    border="1px dashed rgba(255,255,255,0.2)"
    m="0 auto"
    mx="auto"
    mb={4}
  >
    <Text fontSize="3xl" mb={2}>
      {emptyStateIcons[columnType] || '✨'}
    </Text>
    <Text color="white" fontWeight="medium" fontSize="sm" mb={2}>
      {columnType}
    </Text>
    <Text color="whiteAlpha.700" fontSize="xs">
      {emptyStateMessages[columnType] || 'Drag tasks here to populate this column.'}
    </Text>
  </Box>
);

export default EmptyColumnState;
