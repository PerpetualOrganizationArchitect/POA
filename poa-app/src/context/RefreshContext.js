/**
 * RefreshContext
 * Event-based data refresh system to break circular dependencies between contexts.
 *
 * Instead of Web3Context importing VotingContext to trigger refetches,
 * Web3Context emits refresh events that VotingContext subscribes to.
 */

import React, { createContext, useContext, useCallback, useRef, useMemo } from 'react';

/**
 * Refresh event types
 */
export const RefreshEvent = {
  // Voting events
  PROPOSAL_CREATED: 'proposal:created',
  PROPOSAL_VOTED: 'proposal:voted',
  PROPOSAL_COMPLETED: 'proposal:completed',

  // Task events
  PROJECT_CREATED: 'project:created',
  PROJECT_DELETED: 'project:deleted',
  TASK_CREATED: 'task:created',
  TASK_CLAIMED: 'task:claimed',
  TASK_SUBMITTED: 'task:submitted',
  TASK_COMPLETED: 'task:completed',
  TASK_UPDATED: 'task:updated',
  TASK_CANCELLED: 'task:cancelled',
  TASK_APPLICATION_SUBMITTED: 'task:application_submitted',
  TASK_APPLICATION_APPROVED: 'task:application_approved',
  TASK_ASSIGNED: 'task:assigned',

  // Education events
  MODULE_CREATED: 'module:created',
  MODULE_COMPLETED: 'module:completed',

  // Token request events
  TOKEN_REQUEST_CREATED: 'token:request_created',
  TOKEN_REQUEST_APPROVED: 'token:request_approved',
  TOKEN_REQUEST_CANCELLED: 'token:request_cancelled',

  // Organization events
  MEMBER_JOINED: 'member:joined',

  // User events
  USER_CREATED: 'user:created',
  USERNAME_CHANGED: 'user:username_changed',

  // Generic events
  ALL: '*',
};

const RefreshContext = createContext(null);

/**
 * RefreshProvider - Provides event-based refresh functionality
 */
export function RefreshProvider({ children }) {
  // Use a ref to store listeners so they persist across renders
  const listenersRef = useRef(new Map());

  /**
   * Subscribe to a refresh event
   * @param {string} event - Event type from RefreshEvent
   * @param {Function} callback - Callback function when event fires
   * @returns {Function} Unsubscribe function
   */
  const subscribe = useCallback((event, callback) => {
    if (typeof callback !== 'function') {
      console.warn('RefreshContext: callback must be a function');
      return () => {};
    }

    const listeners = listenersRef.current;

    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }

    listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          listeners.delete(event);
        }
      }
    };
  }, []);

  /**
   * Emit a refresh event
   * @param {string} event - Event type from RefreshEvent
   * @param {Object} [data={}] - Optional data to pass to listeners
   */
  const emit = useCallback((event, data = {}) => {
    const listeners = listenersRef.current;

    // Call specific event listeners
    const eventListeners = listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback({ event, data, timestamp: Date.now() });
        } catch (error) {
          console.error(`RefreshContext: Error in listener for ${event}:`, error);
        }
      });
    }

    // Call wildcard listeners
    const wildcardListeners = listeners.get(RefreshEvent.ALL);
    if (wildcardListeners) {
      wildcardListeners.forEach((callback) => {
        try {
          callback({ event, data, timestamp: Date.now() });
        } catch (error) {
          console.error(`RefreshContext: Error in wildcard listener for ${event}:`, error);
        }
      });
    }
  }, []);

  /**
   * Emit multiple events at once
   * @param {string[]} events - Array of event types
   * @param {Object} [data={}] - Optional data to pass to listeners
   */
  const emitMultiple = useCallback((events, data = {}) => {
    events.forEach((event) => emit(event, data));
  }, [emit]);

  /**
   * Get the count of active listeners (useful for debugging)
   */
  const getListenerCount = useCallback(() => {
    let count = 0;
    listenersRef.current.forEach((listeners) => {
      count += listeners.size;
    });
    return count;
  }, []);

  const value = useMemo(() => ({
    subscribe,
    emit,
    emitMultiple,
    getListenerCount,
    RefreshEvent,
  }), [subscribe, emit, emitMultiple, getListenerCount]);

  return (
    <RefreshContext.Provider value={value}>
      {children}
    </RefreshContext.Provider>
  );
}

/**
 * Hook to access refresh context
 * @returns {Object} Refresh context value
 */
export function useRefresh() {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
}

/**
 * Hook to subscribe to refresh events (with automatic cleanup)
 * @param {string|string[]} events - Event type(s) to subscribe to
 * @param {Function} callback - Callback function
 * @param {Array} [deps=[]] - Dependency array for callback
 */
export function useRefreshSubscription(events, callback, deps = []) {
  const { subscribe } = useRefresh();

  React.useEffect(() => {
    const eventArray = Array.isArray(events) ? events : [events];
    const unsubscribers = eventArray.map((event) => subscribe(event, callback));

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribe, ...deps]);
}

/**
 * Hook to emit refresh events
 * Returns a stable emit function
 */
export function useRefreshEmit() {
  const { emit, emitMultiple } = useRefresh();
  return { emit, emitMultiple };
}

export default RefreshContext;
