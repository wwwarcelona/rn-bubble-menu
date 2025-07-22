import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef
} from 'react';
import {
  Animated,
  ImageStyle,
  Pressable,
  TextStyle,
  ViewStyle
} from 'react-native';
import { K } from './constants';
import DefaultBubble from './DefaultBubble';

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
  isPressed?: boolean;    // Optional prop to indicate pressed state
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
  // Extract bubble configuration with sensible defaults
  const { id, originalX = 0, originalY = 0, radius = 50, onPress } = item;

  /**
   * Animation and State Management
   * Using refs to maintain state without triggering re-renders during animations
   */
  
  // Animated value for smooth GPU-accelerated transforms
  const translation = useRef(new Animated.ValueXY({ x: originalX, y: originalY })).current;

  // Sets if the animations use Nativ Drivers or not.
  const nativeDriverUsage = true;
  
  // Current logical position - tracks where the bubble actually is
  const currentPosition = useRef<Position>({ x: originalX, y: originalY });
  
  // Drag state tracking - prevents external position updates during user interaction
  const isDragging = useRef(false);
  
  // Collision avoidance flag - can be set by parent for dynamic behavior
  const avoidCollision = useRef(false);
  
  // Throttling mechanism to prevent excessive parent updates during drag
  const lastLogicUpdateRef = useRef(0);
  const lastUIUpdateRef = useRef(0);

  // Calculate throttling interval based on logic frame rate
  const LOGIC_FRAME_INTERVAL = 1000 / K.FPS_LOGIC;
  const UI_FRAME_INTERVAL = 1000 / K.FPS_UI;

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
          toValue: { x: pos.x, y: pos.y},
          useNativeDriver: nativeDriverUsage,
          duration: 1000 / 20, // Sync with UI update rate
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
    if (onPress) {
      onPress();
    }
  }, [onPress])


  return (
        <Pressable
          key={item.key}
          onPress={handlePress} // Execute bubble's onPress callback
        >
          {({ pressed }) => (
            <BubbleComponent
                {...item}
                radius={radius}
                isPressed={pressed}
            />
          )}
        </Pressable>
  );
});

export default BubbleWrapper;