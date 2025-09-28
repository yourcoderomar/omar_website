/*
	Installed from https://reactbits.dev/default/
*/

import { useLayoutEffect, useRef, useCallback } from "react";
import Lenis from "lenis";
import "./ScrollStack.css";

export const ScrollStackItem = ({ children, itemClassName = "" }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

const ScrollStack = ({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}) => {
  const scrollerRef = useRef(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const lenisRef = useRef(null);
  const cardsRef = useRef([]);
  const lastTransformsRef = useRef(new Map());
  const isUpdatingRef = useRef(false);

  const calculateProgress = useCallback((scrollTop, start, end) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value, containerHeight) => {
    if (typeof value === "string" && value.includes("%")) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value);
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
        scrollContainer: document.documentElement,
      };
    } else {
      const scroller = scrollerRef.current;
      return {
        scrollTop: scroller.scrollTop,
        containerHeight: scroller.clientHeight,
        scrollContainer: scroller,
      };
    }
  }, [useWindowScroll]);

  const getElementOffset = useCallback(
    (element) => {
      if (useWindowScroll) {
        const rect = element.getBoundingClientRect();
        return rect.top + window.scrollY;
      } else {
        return element.offsetTop;
      }
    },
    [useWindowScroll],
  );

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    const { scrollTop, containerHeight, scrollContainer } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(
      scaleEndPosition,
      containerHeight,
    );

    // Force recalculation if container height changed significantly
    const currentHeight = useWindowScroll ? window.innerHeight : scrollerRef.current?.clientHeight;
    if (Math.abs(currentHeight - containerHeight) > 10) {
      // Container size changed, force update
      lastTransformsRef.current.clear();
    }
    
    // Also check if we need to recalculate based on scroll position
    // If we're in a position where stacking should be active but transforms are stale
    const shouldBeStacking = cardsRef.current.some((card, i) => {
      if (!card) return false;
      const cardTop = getElementOffset(card);
      const stackPositionPx = parsePercentage(stackPosition, containerHeight);
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      return scrollTop >= triggerStart;
    });
    
    if (shouldBeStacking && lastTransformsRef.current.size === 0) {
      // We should be stacking but have no transforms, force recalculation
      lastTransformsRef.current.clear();
    }

    const endElement = useWindowScroll
      ? document.querySelector(".scroll-stack-end")
      : scrollerRef.current?.querySelector(".scroll-stack-end");

    // Calculate proper end position based on container height and content
    const endElementTop = endElement ? getElementOffset(endElement) : 0;
    
    // Calculate the total height needed for all cards to stack properly
    const lastCard = cardsRef.current[cardsRef.current.length - 1];
    const lastCardTop = lastCard ? getElementOffset(lastCard) : 0;
    const totalStackHeight = lastCardTop + (cardsRef.current.length * itemStackDistance) + containerHeight;
    
    // Use the smaller of the two to prevent excessive scrolling
    const properEndPosition = Math.min(endElementTop, totalStackHeight);

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop = getElementOffset(card);
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
      const pinEnd = properEndPosition - containerHeight / 2;

      const scaleProgress = calculateProgress(
        scrollTop,
        triggerStart,
        triggerEnd,
      );
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jCardTop = getElementOffset(cardsRef.current[j]);
          const jTriggerStart =
            jCardTop - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) {
            topCardIndex = j;
          }
        }

        if (i < topCardIndex) {
          const depthInStack = topCardIndex - i;
          blur = Math.max(0, depthInStack * blurAmount);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY =
          scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      const newTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        const filter =
          newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : "";

        card.style.transform = transform;
        card.style.filter = filter;

        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getScrollData,
    getElementOffset,
  ]);

  const handleScroll = useCallback(() => {
    updateCardTransforms();
  }, [updateCardTransforms]);

  const setupLenis = useCallback(() => {
    if (useWindowScroll) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
        infinite: false,
        wheelMultiplier: 1,
        lerp: 0.1,
        syncTouch: true,
        syncTouchLerp: 0.1,
        touchInertia: 0.4,
        gestureOrientationHandler: true,
        normalizeWheel: true,
      });

      lenis.on("scroll", handleScroll);

      const raf = (time) => {
        lenis.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };
      animationFrameRef.current = requestAnimationFrame(raf);

      lenisRef.current = lenis;
      return lenis;
    } else {
      const scroller = scrollerRef.current;
      if (!scroller) return;

      const lenis = new Lenis({
        wrapper: scroller,
        content: scroller.querySelector(".scroll-stack-inner"),
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
        infinite: false,
        gestureOrientationHandler: true,
        normalizeWheel: true,
        wheelMultiplier: 1,
        touchInertiaMultiplier: 25,
        lerp: 0.1,
        syncTouch: true,
        syncTouchLerp: 0.1,
        touchInertia: 0.4,
      });

      lenis.on("scroll", handleScroll);

      const raf = (time) => {
        lenis.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };
      animationFrameRef.current = requestAnimationFrame(raf);

      lenisRef.current = lenis;
      return lenis;
    }
  }, [handleScroll, useWindowScroll]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll(".scroll-stack-card")
        : scroller.querySelectorAll(".scroll-stack-card"),
    );

    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = "transform, filter";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
      card.style.transform = "translateZ(0)";
      card.style.webkitTransform = "translateZ(0)";
      card.style.perspective = "1000px";
      card.style.webkitPerspective = "1000px";
    });

    setupLenis();

    // Set proper spacer height based on content
    const setSpacerHeight = () => {
      const endElement = useWindowScroll
        ? document.querySelector(".scroll-stack-end")
        : scrollerRef.current?.querySelector(".scroll-stack-end");
      
      if (endElement && cardsRef.current.length > 0) {
        const lastCard = cardsRef.current[cardsRef.current.length - 1];
        const lastCardTop = lastCard ? getElementOffset(lastCard) : 0;
        const containerHeight = useWindowScroll ? window.innerHeight : scrollerRef.current?.clientHeight || 0;
        const requiredHeight = lastCardTop + (cardsRef.current.length * itemStackDistance) + containerHeight;
        
        // Set spacer height to exactly what's needed
        endElement.style.height = `${Math.max(100, requiredHeight)}px`;
      }
    };

    setSpacerHeight();
    updateCardTransforms();

    // Handle resize events to recalculate positions
    let resizeTimeout;
    const handleResize = () => {
      // Debounce resize events
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Force complete recalculation by clearing all caches
        transformsCache.clear();
        isUpdatingRef.current = false;
        
        // Re-find cards in case DOM changed
        const newCards = Array.from(
          useWindowScroll
            ? document.querySelectorAll(".scroll-stack-card")
            : scrollerRef.current?.querySelectorAll(".scroll-stack-card") || []
        );
        
        if (newCards.length > 0) {
          cardsRef.current = newCards;
        }
        
        // Recalculate spacer height
        setSpacerHeight();
        
        // Force immediate recalculation
        updateCardTransforms();
        
        // Also trigger a scroll event to ensure proper state
        if (lenisRef.current) {
          lenisRef.current.emit('scroll');
        }
      }, 150);
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Listen for visual viewport changes (mobile browser UI changes)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    
    // Also listen for orientation change on mobile
    window.addEventListener('orientationchange', () => {
      // Small delay to allow orientation change to complete
      setTimeout(() => {
        // Force complete recalculation
        transformsCache.clear();
        isUpdatingRef.current = false;
        
        // Re-find cards
        const newCards = Array.from(
          useWindowScroll
            ? document.querySelectorAll(".scroll-stack-card")
            : scrollerRef.current?.querySelectorAll(".scroll-stack-card") || []
        );
        
        if (newCards.length > 0) {
          cardsRef.current = newCards;
        }
        
        // Recalculate spacer height
        setSpacerHeight();
        
        // Force recalculation
        updateCardTransforms();
        
        // Trigger scroll event
        if (lenisRef.current) {
          lenisRef.current.emit('scroll');
        }
      }, 300);
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      window.removeEventListener('orientationchange', handleResize);
      stackCompletedRef.current = false;
      cardsRef.current = [];
      transformsCache.clear();
      isUpdatingRef.current = false;
    };
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    scaleDuration,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    setupLenis,
    updateCardTransforms,
  ]);

  return (
    <div
      className={`scroll-stack-scroller ${className}`.trim()}
      ref={scrollerRef}
    >
      <div className="scroll-stack-inner">
        {children}
        {/* Spacer so the last pin can release cleanly */}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;
