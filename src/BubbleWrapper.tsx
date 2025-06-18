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
  setIsAnyBubbleDragging 
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

  // Pan responder for drag and drop functionality
  const panResponder = useRef(
    PanResponder.create({
      // Start dragging on touch
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      // Handle movement
      onPanResponderMove: (_, gesture) => {
        pan.setValue({
          x: gesture.dx,
          y: gesture.dy,
        });
        setCurrentPosition({
          x: item.originalX! + gesture.dx,
          y: item.originalY! + gesture.dy
        });
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