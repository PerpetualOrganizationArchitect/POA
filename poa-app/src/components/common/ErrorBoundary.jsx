/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */

import React from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Code,
  Container,
  Divider,
} from '@chakra-ui/react';

/**
 * Error Boundary - Catches JavaScript errors in child components
 * Must be a class component as React doesn't support error boundaries in hooks
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Store error info for display
    this.setState({ errorInfo });

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Here you could also send to an error tracking service
    // e.g., Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          reset: this.handleReset,
          reload: this.handleReload,
        });
      }

      // Default fallback UI
      return (
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgGradient="linear(to-r, orange.200, pink.200)"
          p={4}
        >
          <Container maxW="xl">
            <VStack
              spacing={6}
              bg="white"
              p={8}
              borderRadius="xl"
              boxShadow="xl"
              textAlign="center"
            >
              <Heading size="lg" color="red.500">
                Something went wrong
              </Heading>

              <Text color="gray.600" fontSize="md">
                We're sorry, but something unexpected happened.
                Please try again or reload the page.
              </Text>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <>
                  <Divider />
                  <Box w="100%" textAlign="left">
                    <Text fontWeight="bold" mb={2} color="gray.700">
                      Error Details:
                    </Text>
                    <Code
                      p={4}
                      borderRadius="md"
                      w="100%"
                      display="block"
                      whiteSpace="pre-wrap"
                      wordBreak="break-word"
                      bg="gray.100"
                      color="red.600"
                      fontSize="sm"
                    >
                      {this.state.error.toString()}
                    </Code>

                    {this.state.errorInfo?.componentStack && (
                      <Box mt={4}>
                        <Text fontWeight="bold" mb={2} color="gray.700">
                          Component Stack:
                        </Text>
                        <Code
                          p={4}
                          borderRadius="md"
                          w="100%"
                          display="block"
                          whiteSpace="pre-wrap"
                          wordBreak="break-word"
                          bg="gray.100"
                          color="gray.600"
                          fontSize="xs"
                          maxH="200px"
                          overflowY="auto"
                        >
                          {this.state.errorInfo.componentStack}
                        </Code>
                      </Box>
                    )}
                  </Box>
                </>
              )}

              <VStack spacing={3} pt={4} w="100%">
                <Button
                  colorScheme="purple"
                  onClick={this.handleReset}
                  w="100%"
                  size="lg"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  colorScheme="gray"
                  onClick={this.handleReload}
                  w="100%"
                  size="lg"
                >
                  Reload Page
                </Button>
              </VStack>

              <Text fontSize="sm" color="gray.500">
                If this problem persists, please contact support.
              </Text>
            </VStack>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap a component with error boundary
 * @param {React.Component} Component - Component to wrap
 * @param {Function} [fallback] - Optional custom fallback renderer
 * @returns {React.Component} Wrapped component
 */
export function withErrorBoundary(Component, fallback = null) {
  const WrappedComponent = (props) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}

/**
 * Feature-specific error boundary with simpler UI
 * Use this for sections that can fail independently
 */
export class FeatureErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Error in ${this.props.featureName || 'feature'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          p={6}
          bg="red.50"
          borderRadius="md"
          border="1px solid"
          borderColor="red.200"
          textAlign="center"
        >
          <Text color="red.600" fontWeight="medium">
            {this.props.featureName
              ? `Failed to load ${this.props.featureName}`
              : 'Something went wrong'}
          </Text>
          <Button
            size="sm"
            mt={3}
            colorScheme="red"
            variant="outline"
            onClick={() => this.setState({ hasError: false })}
          >
            Retry
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
