import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { Animated, ImageStyle, PanResponder, Pressable, TextStyle, ViewStyle } from 'react-native';
import DefaultBubble from './DefaultBubble';
import { styles } from './styles';

// Style interfaces for the bubble component
export interface BubbleStyleProps {
  container?: ViewStyle;
  circle?: ViewStyle;
  text?: TextStyle;
  icon?: ImageStyle;
}

// Props for the bubble component
export interface BubbleProps {
  id: string;
  radius?: number;
  originalX?: number;
  originalY?: number;
  text?: string;
  icon?: any; // Can be a require() image or a URL
  style?: BubbleStyleProps;
  key?: string;
  onPress?: () => void;
}

// Props for the bubble wrapper component
export interface BubbleWrapperProps {
  item: BubbleProps;
  bubbleComponent?: React.ComponentType<BubbleProps>;
  setIsAnyBubbleDragging: (isDragging: boolean) => void;
  menuHeight: number;
  menuWidth: number;
}

// Position interface for bubble coordinates
export interface Position {
  x: number;
  y: number;
}

// BubbleWrapper Component: Creates a draggable bubble with custom styling and behavior
const BubbleWrapper = forwardRef(({ 
  item, 
  bubbleComponent,
  setIsAnyBubbleDragging,
  menuHeight,
  menuWidth
}: BubbleWrapperProps, ref) => {
  // Animation and state management
  const pan = useRef(new Animated.ValueXY()).current;
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: item.originalX!, y: item.originalY! });
  const [isDragging, setIsDragging] = useState(false);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getPosition: () => currentPosition,
    setPosition: (pos: Position) => {
      if (!isDragging) {
        setCurrentPosition(pos);
      }
    },
    getIsDragging: () => isDragging
  }));

  // Update parent component when dragging state changes
  useEffect(() => {
    setIsAnyBubbleDragging(isDragging);
  }, [isDragging]);

  // Helper to constrain position within bounds
  const clampPosition = (x: number, y: number) => {
    const radius = item.radius || 50;
    const minX = 0;
    const minY = 0;
    const maxX = menuWidth - radius * 2;
    const maxY = menuHeight - radius * 2;
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  };

  // Pan responder for drag and drop functionality
  const panResponder = useRef(
    PanResponder.create({
      // Start dragging on touch
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      // Handle movement
      onPanResponderMove: (_, gesture) => {
        const unclampedX = item.originalX! + gesture.dx;
        const unclampedY = item.originalY! + gesture.dy;
        const { x, y } = clampPosition(unclampedX, unclampedY);
        pan.setValue({
          x: x - item.originalX!,
          y: y - item.originalY!
        });
        setCurrentPosition({ x, y });
        setIsDragging(true);
      },

      // Handle release
      onPanResponderRelease: () => {
        // Animate back to original position
        Animated.spring(pan, {
          toValue: {x: 0, y: 0},
          useNativeDriver: true,
        }).start();
        setCurrentPosition({
          x: item.originalX!,
          y: item.originalY!
        });
        setIsDragging(false);
      },
    }),
  ).current;

  // Render the bubble with animation and touch handling
  return (
    <Animated.View 
      style={[
        styles.bubbleContainer,
        item.style?.container,
        { 
          transform: [
            { translateX: pan.x },
            { translateY: pan.y }
          ]
        }
      ]}
      {...panResponder.panHandlers}
    >
      <Pressable
        key={item.key}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
        })}
        onPress={item.onPress}
      >
        {(() => {
          const Component = bubbleComponent || DefaultBubble;
          return (
            <Component
              id={item.id}
              label={item.id}
              radius={item.radius}
              originalX={item.originalX}
              originalY={item.originalY}
              text={item.text}
              icon={item.icon}
              style={item.style}
            />
          );
        })()}
      </Pressable>
    </Animated.View>
  );
});

export default BubbleWrapper; 