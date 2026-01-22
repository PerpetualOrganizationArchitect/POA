/**
 * useSwipeNavigation
 * Custom hook for handling touch swipe navigation in mobile views
 */

import { useState, useRef, useCallback, useEffect } from 'react';

const SWIPE_THRESHOLD = 50;
const SCROLL_TOLERANCE = 30;

/**
 * Hook for swipe navigation with improved touch detection
 * @param {Object} options - Configuration options
 * @param {number} options.itemCount - Total number of items to navigate
 * @param {number} options.initialIndex - Initial active index
 * @param {Function} options.onNavigate - Callback when navigation occurs
 * @returns {Object} Swipe navigation handlers and state
 */
export function useSwipeNavigation({
  itemCount,
  initialIndex = 0,
  onNavigate,
} = {}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isSwiping, setIsSwiping] = useState(false);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const containerRef = useRef(null);

  // Track if user has seen the swipe guide
  const [hasSeenGuide, setHasSeenGuide] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasSeenSwipeGuide') === 'true';
    }
    return false;
  });

  // Initialize guide visibility
  const [showGuide, setShowGuide] = useState(() => {
    if (!hasSeenGuide) return true;
    // 4% chance to show for returning users
    return Math.floor(Math.random() * 25) === 0;
  });

  // Auto-hide guide
  useEffect(() => {
    if (showGuide) {
      const timer = setTimeout(() => {
        setShowGuide(false);
        if (!hasSeenGuide) {
          setHasSeenGuide(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('hasSeenSwipeGuide', 'true');
          }
        }
      }, 8500);

      return () => clearTimeout(timer);
    }
  }, [showGuide, hasSeenGuide]);

  const dismissGuide = useCallback(() => {
    if (showGuide) {
      setShowGuide(false);
      if (!hasSeenGuide) {
        setHasSeenGuide(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('hasSeenSwipeGuide', 'true');
        }
      }
    }
  }, [showGuide, hasSeenGuide]);

  const navigateTo = useCallback((index) => {
    if (index >= 0 && index < itemCount) {
      setActiveIndex(index);
      dismissGuide();
      onNavigate?.(index);
    }
  }, [itemCount, dismissGuide, onNavigate]);

  const navigateNext = useCallback(() => {
    if (activeIndex < itemCount - 1) {
      navigateTo(activeIndex + 1);
    }
  }, [activeIndex, itemCount, navigateTo]);

  const navigatePrev = useCallback(() => {
    if (activeIndex > 0) {
      navigateTo(activeIndex - 1);
    }
  }, [activeIndex, navigateTo]);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(false);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = touchStartX.current - touchX;
    const diffY = Math.abs(touchStartY.current - touchY);

    // Only horizontal swipes with minimal vertical movement
    if (Math.abs(diffX) > 15 && diffY < SCROLL_TOLERANCE) {
      setIsSwiping(true);
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!touchStartX.current || !touchStartY.current || !isSwiping) {
      touchStartX.current = null;
      touchStartY.current = null;
      setIsSwiping(false);
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = Math.abs(touchStartY.current - touchEndY);

    // Skip if too much vertical movement
    if (diffY > SCROLL_TOLERANCE) {
      touchStartX.current = null;
      touchStartY.current = null;
      setIsSwiping(false);
      return;
    }

    // Process swipe
    if (Math.abs(diffX) > SWIPE_THRESHOLD) {
      if (diffX > 0) {
        navigateNext();
      } else {
        navigatePrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    setIsSwiping(false);
  }, [isSwiping, navigateNext, navigatePrev]);

  // Keep activeIndex in bounds when itemCount changes
  useEffect(() => {
    if (itemCount > 0 && activeIndex >= itemCount) {
      setActiveIndex(itemCount - 1);
    }
  }, [itemCount, activeIndex]);

  return {
    activeIndex,
    setActiveIndex: navigateTo,
    containerRef,
    isSwiping,
    showGuide,
    dismissGuide,
    navigateNext,
    navigatePrev,
    canNavigateNext: activeIndex < itemCount - 1,
    canNavigatePrev: activeIndex > 0,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

export default useSwipeNavigation;
