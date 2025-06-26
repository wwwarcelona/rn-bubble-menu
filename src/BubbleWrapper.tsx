import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  Animated,
  ImageStyle,
  PanResponder,
  Pressable,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import DefaultBubble from './DefaultBubble';
import { styles } from './styles';
import { K } from './constants';

/**
 * Style configuration for individual bubble components
 * Provides granular control over bubble appearance and layout
 */
export interface BubbleStyleProps {
  container?: ViewStyle; // Outer container styles (positioning, dimensions)
  circle?: ViewStyle;    // Bubble circle styles (background, border, shadow)
  text?: TextStyle;      // Text content styles (font, color, alignment)
  icon?: ImageStyle;     // Icon styles (size, tint, positioning)
}

/**
 * Core bubble data structure and configuration
 * Represents a single interactive bubble in the menu system
 */
export interface BubbleProps {
  id: string;              // Unique identifier for position tracking and collision detection
  radius?: number;         // Bubble radius in pixels (affects collision boundaries)
  originalX?: number;      // Initial X position (layout anchor point)
  originalY?: number;      // Initial Y position (layout anchor point)
  text?: string;          // Display text content
  icon?: any;             // Icon component or image source
  style?: BubbleStyleProps; // Style overrides for customization
  key?: string;           // React key for list rendering optimization
  onPress?: () => void;   // Touch handler for bubble interactions
}

/**
 * Props interface for the BubbleWrapper component
 * Handles the integration between individual bubbles and the menu system
 */
export interface BubbleWrapperProps {
  item: BubbleProps;                                                    // Bubble configuration and data
  bubbleComponent?: React.ComponentType<BubbleProps>;                   // Custom bubble renderer (defaults to DefaultBubble)
  updateBubblePositions: (id: string, newPosition: Position) => void;  // Callback to notify parent of position changes
  height: number;                                                       // Container height for boundary calculations
  width: number;                                                        // Container width for boundary calculations
}

/**
 * 2D position coordinates interface
 * Used throughout the system for consistent position tracking
 */
export interface Position {
  x: number; // Horizontal position in pixels
  y: number; // Vertical position in pixels
}

/**
 * BubbleWrapper Component
 * 
 * A high-performance wrapper that provides drag-and-drop functionality for individual bubbles.
 * This component serves as the bridge between the visual bubble representation and the 
 * menu system's collision detection and animation logic.
 * 
 * Key Features:
 * - Native-driven animations for 60fps performance
 * - Sophisticated drag gesture handling with boundary constraints
 * - Throttled position updates to prevent excessive parent re-renders
 * - Automatic spring-back animation to original position
 * - Imperative API for external position control
 * 
 */
const BubbleWrapper = forwardRef<any, BubbleWrapperProps>(({
  item,
  bubbleComponent: BubbleComponent = DefaultBubble,
  updateBubblePositions,
  height,
  width,
}, ref) => {
  console.log("BubbleWrapper Rendered: ", item.id);

  // Extract bubble configuration with sensible defaults
  const { id, originalX = 0, originalY = 0, radius = 50, onPress } = item;

  /**
   * Animation and State Management
   * Using refs to maintain state without triggering re-renders during animations
   */
  
  // Native-driven animated value for smooth GPU-accelerated transforms
  const translation = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  
  // Current logical position - tracks where the bubble actually is
  const currentPosition = useRef<Position>({ x: originalX, y: originalY });
  
  // Drag state tracking - prevents external position updates during user interaction
  const isDragging = useRef(false);
  
  // Collision avoidance flag - can be set by parent for dynamic behavior
  const avoidCollision = useRef(false);
  
  // Throttling mechanism to prevent excessive parent updates during drag
  const lastLogicUpdateRef = useRef(0);

  // Calculate throttling interval based on logic frame rate
  const LOGIC_FRAME_INTERVAL = 1000 / K.FPS_LOGIC;

  /**
   * Imperative API for Parent Component Communication
   * Provides external control over bubble position and state without prop drilling
   * This pattern is essential for performance in animation-heavy scenarios
   */
  useImperativeHandle(ref, () => ({
    /**
     * Returns the current logical position of the bubble
     * Used by collision detection and menu layout systems
     */
    getPosition: () => currentPosition.current,
    
    /**
     * Externally sets bubble position with smooth animation
     * Only applies if bubble is not currently being dragged by user
     * Used for collision resolution and return-to-position animations
     */
    setPosition: (pos: Position) => {
      if (!isDragging.current) {
        // Animate to new position using native driver for performance
        Animated.timing(translation, {
          toValue: { x: pos.x - originalX, y: pos.y - originalY },
          useNativeDriver: true,
          duration: 1000 / (K.FPS_UI * K.FPS_SYNC), // Sync with UI update rate
        }).start();
        currentPosition.current = { x: pos.x, y: pos.y };
      }
    },
    
    /**
     * Returns current drag state - critical for collision system
     * Prevents collision resolution from interfering with user interactions
     */
    getIsDragging: () => isDragging.current,
    
    /**
     * Collision avoidance state management
     * Allows parent to modify behavior dynamically based on menu state
     */
    getAvoidCollision: () => avoidCollision.current,
    setAvoidCollision: (value: boolean) => {
      avoidCollision.current = value;
    },
  }), [originalX, originalY, translation]);

  const handlePress = useCallback(() => {
    const originalPosition: Position = { x: originalX!, y: originalY!};

    if (currentPosition.current === originalPosition) {
      onPress();
    }
  }, [onPress])

  /**
   * Boundary Constraint System
   * Ensures bubbles remain within visible container bounds
   * Accounts for bubble radius to prevent visual clipping
   */
  const clampPosition = useCallback((x: number, y: number) => {
    const minX = 0;
    const minY = 0;
    const maxX = width - radius * 2;  // Account for full bubble width
    const maxY = height - radius * 2; // Account for full bubble height
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  }, [width, height, radius]);

  /**
   * Advanced Gesture Handling System
   * Implements sophisticated drag-and-drop with spring-back animation
   * Optimized for performance with throttled updates and native animations
   */
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Always capture touch events for this bubble
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        
        /**
         * Drag Start Handler
         * Sets drag state to prevent external position interference
         */
        onPanResponderGrant: () => {
          isDragging.current = true;
        },
        
        /**
         * Drag Move Handler - Core Animation Logic
         * Handles real-time position updates with boundary constraints
         * Uses cumulative gesture delta for accurate positioning
         */
        onPanResponderMove: (_, gesture) => {
          // Calculate target position: original position + total gesture movement
          // This approach prevents drift that can occur with incremental updates
          const targetX = originalX + gesture.dx;
          const targetY = originalY + gesture.dy;

          // Apply boundary constraints to prevent bubbles from leaving viewport
          const clampedPosition = clampPosition(targetX, targetY);
          
          // Update logical position for collision detection system
          currentPosition.current = clampedPosition;
          
          // Update visual position - calculate delta from original position
          // This maintains consistency between logical and visual positioning
          const deltaX = clampedPosition.x - originalX;
          const deltaY = clampedPosition.y - originalY;
          translation.setValue({ x: deltaX, y: deltaY });

          // Throttled parent notification to prevent performance degradation
          // Only update parent at logic frame rate to avoid overwhelming the system
          const now = Date.now();
          if (now - lastLogicUpdateRef.current >= LOGIC_FRAME_INTERVAL) {
            updateBubblePositions(id, currentPosition.current);
            lastLogicUpdateRef.current = now;
          }
        },
        
        /**
         * Drag End Handler - Spring-Back Animation
         * Implements smooth return to original position with spring physics
         */
        onPanResponderRelease: () => {
          isDragging.current = false;

          // Animate back to original position using spring physics
          // Native driver ensures 60fps performance on the animation thread
          Animated.spring(translation, {
            toValue: { x: 0, y: 0 }, // Return to zero delta (original position)
            useNativeDriver: true,
            // Spring configuration can be customized here for feel
          }).start();
          
          // Reset logical position and notify parent immediately
          // This ensures collision system knows the bubble is returning home
          currentPosition.current = { x: originalX, y: originalY };
          updateBubblePositions(id, { x: originalX, y: originalY });

          // Reset throttling state for next drag operation
          lastLogicUpdateRef.current = 0;
        },
      }),
    [id, originalX, originalY, clampPosition, updateBubblePositions, translation]
  );
  
  /**
   * Animation Style Configuration
   * Applies the translate transform from the animated value
   * Uses native driver for optimal performance
   */
  const animatedStyle = {
    transform: translation.getTranslateTransform(),
  };

  return (
    <Animated.View
      style={[
        styles.bubbleContainer,
        item.style?.container,
        {
          // Position at original coordinates - animations are applied as transforms
          left: originalX,
          top: originalY,
          // Explicit transform declaration for clarity (also included in animatedStyle)
          transform: [
            { translateX: translation.x },
            { translateY: translation.y }
          ]
        },
        animatedStyle, // Apply animated transforms
      ]}
      {...panResponder.panHandlers} // Attach gesture handling
    >
      {/* 
        Pressable wrapper for touch feedback and press handling
        Provides visual feedback during touch interactions
      */}
      <Pressable
        key={item.key}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1, // Simple opacity feedback for touch
        })}
        onPressOut={onPress} // Execute bubble's onPress callback
      >
        {/* 
          Render the actual bubble component
          Can be customized via bubbleComponent prop or defaults to DefaultBubble
        */}
        <BubbleComponent
            {...item}
            radius={radius}
        />
      </Pressable>
    </Animated.View>
  );
});

export default React.memo(BubbleWrapper);