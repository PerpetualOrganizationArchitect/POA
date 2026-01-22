/**
 * ValidationSummary - Displays validation errors for the current step
 */

import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  UnorderedList,
  ListItem,
  VStack,
} from '@chakra-ui/react';

export function ValidationSummary({ errors, title = 'Please fix the following issues:' }) {
  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }

  // Convert errors object to flat list of messages
  const errorMessages = [];
  for (const [path, messages] of Object.entries(errors)) {
    if (Array.isArray(messages)) {
      messages.forEach(msg => errorMessages.push(msg));
    } else if (typeof messages === 'string') {
      errorMessages.push(messages);
    }
  }

  if (errorMessages.length === 0) {
    return null;
  }

  return (
    <Alert status="error" mb={4} borderRadius="md">
      <AlertIcon />
      <Box>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          <UnorderedList mt={2}>
            {errorMessages.map((msg, idx) => (
              <ListItem key={idx}>{msg}</ListItem>
            ))}
          </UnorderedList>
        </AlertDescription>
      </Box>
    </Alert>
  );
}

/**
 * ValidationSuccess - Displays a success message when validation passes
 */
export function ValidationSuccess({ message = 'All configurations are valid' }) {
  return (
    <Alert status="success" mb={4} borderRadius="md">
      <AlertIcon />
      {message}
    </Alert>
  );
}

/**
 * ValidationWarning - Displays warnings that don't block progression
 */
export function ValidationWarning({ warnings, title = 'Warnings:' }) {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <Alert status="warning" mb={4} borderRadius="md">
      <AlertIcon />
      <Box>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          <UnorderedList mt={2}>
            {warnings.map((msg, idx) => (
              <ListItem key={idx}>{msg}</ListItem>
            ))}
          </UnorderedList>
        </AlertDescription>
      </Box>
    </Alert>
  );
}

export default ValidationSummary;
